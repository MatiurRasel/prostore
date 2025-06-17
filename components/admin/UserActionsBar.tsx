"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserModal } from '@/components/admin/UserModal';
import { Plus } from 'lucide-react';

export function UserActionsBar() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <div className="flex items-center gap-3 flex-wrap justify-between mb-2">
      <Button variant="default" onClick={() => setModalOpen(true)}>
        <Plus className="w-4 h-4" /> Create User
      </Button>
      <UserModal open={modalOpen} onClose={() => setModalOpen(false)} onUserSaved={() => window.location.reload()} />
    </div>
  );
} 