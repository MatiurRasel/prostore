"use client";
import { useState } from 'react';
import { UserModal } from '@/components/admin/UserModal';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  image: string | null;
  phoneNumber?: string | null;
}

export function UserTableActions({ user }: { user: User }) {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setModalOpen(true)}>
          <Edit className="w-4 h-4" />Edit
      </Button>
      <UserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        user={user}
        onUserSaved={() => window.location.reload()}
      />
    </>
  );
} 