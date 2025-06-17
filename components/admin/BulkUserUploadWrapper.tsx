"use client";

import { BulkUserUpload } from "./BulkUserUpload";

export function BulkUserUploadWrapper() {
  return (
    <BulkUserUpload onSuccess={() => window.location.reload()} />
  );
} 