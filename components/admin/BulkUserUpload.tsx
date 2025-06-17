"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet } from "lucide-react";
import { read, utils } from 'xlsx';

interface BulkUserUploadProps {
  onSuccess?: () => void;
}

export function BulkUserUpload({ onSuccess }: BulkUserUploadProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const {toast} = useToast();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          selectedFile.type === 'text/csv') {
        setFile(selectedFile);
      } else {
        toast({
            title: 'Error',
            description: 'Please upload an Excel (.xlsx) or CSV file',
            variant: 'destructive',
        });
      }
    }
  };

  const processFile = async () => {
    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select a file first',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = e.target?.result;
          const workbook = read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = utils.sheet_to_json(worksheet) as Record<string, unknown>[];

          // Validate data structure
          const requiredFields = ['name', 'email', 'phoneNumber','password'];
          const isValid = jsonData.every((row) => 
            requiredFields.every(field => row[field] !== undefined && String(row[field]).trim() !== '')
          );
          if (!isValid || !Array.isArray(jsonData) || jsonData.length === 0) {
            toast({
                title: 'Error',
                description: 'File must contain name, email, phoneNumber, and password columns and at least one user',
                variant: 'destructive',
            });
            return;
          }

          // Send to API
          const response = await fetch('/api/admin/users/bulk', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ users: jsonData }),
          });

          if (!response.ok) {
            throw new Error('Failed to create users');
          }

          const result = await response.json();
          toast({
            description: `Successfully created ${result.created} users`,
          });
          setFile(null);
          onSuccess?.();
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Error processing file',
            variant: 'destructive',
          });
          console.error(error);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Error reading file',
        variant: 'destructive',
      });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Input
          type="file"
          accept=".xlsx,.csv"
          onChange={handleFileChange}
          className="max-w-xs"
        />
        <Button 
          onClick={processFile} 
          disabled={!file || isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            "Processing..."
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Upload Users
            </>
          )}
        </Button>
      </div>
      {file && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileSpreadsheet className="h-4 w-4" />
          {file.name}
        </div>
      )}
      <div className="text-sm text-muted-foreground">
        <p>Upload an Excel (.xlsx) or CSV file with the following columns:</p>
        <ul className="list-disc list-inside mt-2">
          <li>name (required)</li>
          <li>email (required)</li>
          <li>phoneNumber (required)</li>
          <li>role (optional, defaults to &quot;user&quot;)</li>
        </ul>
      </div>
    </div>
  );
}