"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { read, utils } from 'xlsx';
import { useToast } from '@/hooks/use-toast';

interface BulkUserUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const REQUIRED_FIELDS = ["name", "email", "phoneNumber", "password"];
const ALL_FIELDS = ["name", "email", "phoneNumber", "role", "password"];

export function BulkUserUploadModal({ open, onClose, onSuccess }: BulkUserUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, string>[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setParsedData([]);
    }
  };

  const handleCheck = () => {
    if (!file) return;
    setIsChecking(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // Get the original headers from the first row
        const rawRows = utils.sheet_to_json(worksheet, { header: 1, defval: "" }) as unknown[][];
        const rawHeaders = (rawRows[0] ?? []) as string[];
        const rawData = rawRows.slice(1) as string[][];
        // Canonical field names for mapping
        const CANONICAL_FIELDS: Record<string, string> = {
          name: "name",
          email: "email",
          phonenumber: "phoneNumber",
          password: "password",
          role: "role",
        };
        // Map headers to canonical field names (case-insensitive, ignore camelCase)
        const headerMap: Record<string, string> = {};
        const trimmedHeaders = rawHeaders.map((header: string) => header.trim());
        console.log('DEBUG: trimmedHeaders', JSON.stringify(trimmedHeaders));
        trimmedHeaders.forEach((header: string) => {
          const lower = header.toLowerCase().replace(/[^a-z]/g, ""); // remove non-letters for robustness
          if (CANONICAL_FIELDS[lower]) {
            headerMap[header] = CANONICAL_FIELDS[lower];
          }
        });
        console.log('DEBUG: headerMap', JSON.stringify(headerMap));
        // Convert each row to an object with normalized keys using trimmedHeaders
        const jsonData = rawData.map((row: string[]) => {
          const obj: Record<string, string> = {};
          trimmedHeaders.forEach((header: string, idx: number) => {
            const mapped = headerMap[header];
            if (mapped) obj[mapped] = row[idx] !== undefined && row[idx] !== null ? String(row[idx]) : "";
          });
          return obj;
        });
        // Validate required fields
        const isValid = jsonData.every((row: Record<string, string>) =>
          REQUIRED_FIELDS.every(field => row[field] !== undefined && row[field] !== "")
        );
        if (!isValid) {
          toast({
            title: 'Error',
            description: 'File must contain name, email, phoneNumber, and password columns (all required)',
            variant: 'destructive',
          });
          setParsedData([]);
        } else {
          setParsedData(jsonData as Record<string, string>[]);
        }
      } catch {
        toast({
          title: 'Error',
          description: 'Error processing file',
          variant: 'destructive',
        });
        setParsedData([]);
      } finally {
        setIsChecking(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleInputChange = (rowIdx: number, field: string, value: string) => {
    setParsedData((prev) => {
      const updated = [...prev];
      updated[rowIdx] = { ...updated[rowIdx], [field]: value };
      return updated;
    });
  };

  const handleUpload = async () => {
    debugger
    if (!parsedData || !Array.isArray(parsedData) || parsedData.length === 0) {
      toast({ title: 'Error', description: 'No users to upload', variant: 'destructive' });
      return;
    }
    // Ensure every user has a non-empty password
    if (!parsedData.every(user => typeof user.password === 'string' && user.password.trim() !== '')) {
      toast({ title: 'Error', description: 'Each user must have a non-empty password.', variant: 'destructive' });
      return;
    }
    setIsUploading(true);
    try {
      const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ users: parsedData }),
      });
      if (!response.ok) throw new Error('Failed to upload users');
      const result = await response.json();
      toast({ description: `Successfully created ${result.created} users` });
      setFile(null);
      setParsedData([]);
      onSuccess?.();
      onClose();
    } catch {
      toast({
        title: 'Error',
        description: 'Error uploading users',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>Bulk User Upload</DialogTitle>
          <DialogDescription>
            Upload an Excel (.xlsx) or CSV file with the required columns: <b>name</b>, <b>email</b>, <b>phoneNumber</b>, <b>password</b>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label className="font-medium">Choose File</label>
            <Input
              type="file"
              accept=".xlsx,.csv"
              onChange={handleFileChange}
              className="max-w-xs"
            />
            <div className="text-sm text-muted-foreground">
              <p>Upload an Excel (.xlsx) or CSV file with the following columns:</p>
              <ul className="list-disc list-inside mt-2">
                <li>name (required)</li>
                <li>email (required)</li>
                <li>phoneNumber (required)</li>
                <li>password (required)</li>
                <li>role (optional, defaults to &quot;user&quot;)</li>
              </ul>
            </div>
          </div>
          {file && !parsedData.length && (
            <Button onClick={handleCheck} disabled={isChecking} className="mt-2">
              {isChecking ? 'Checking...' : 'Check Before Save'}
            </Button>
          )}
          {parsedData.length > 0 && (
            <div className="space-y-2">
              <div className="overflow-x-auto border rounded">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      {ALL_FIELDS.map((field) => (
                        <th key={field} className="px-2 py-1 border-b text-left font-semibold bg-muted">{field.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {parsedData.map((row, rowIdx) => (
                      <tr key={rowIdx}>
                        {ALL_FIELDS.map((field) => (
                          <td key={field} className="px-2 py-1 border-b">
                            <Input
                              value={row[field] ?? ""}
                              onChange={e => handleInputChange(rowIdx, field, e.target.value)}
                              className="text-xs py-1 px-2"
                              placeholder={field}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button onClick={handleUpload} disabled={isUploading} className="mt-2">
                {isUploading ? 'Uploading...' : 'Upload Users'}
              </Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}