"use client";
import { useState } from "react";
import { BulkUserUploadModal } from "./BulkUserUploadModal";
import { Button } from "@/components/ui/button";
import { LucideUpload } from "lucide-react";

export function BulkUserUploadModalClient() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setModalOpen(true)}>
        <LucideUpload className="w-4 h-4" /> User Upload via Excel
      </Button>
      <BulkUserUploadModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </>
  );
} 