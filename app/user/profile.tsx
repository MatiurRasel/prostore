import { useState } from 'react';
import { UserModal } from '@/components/admin/UserModal';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { User } from '@prisma/client';

export default function UserProfilePage() {
  const { data: session } = useSession();
  const [modalOpen, setModalOpen] = useState(false);

  if (!session?.user) return null;

  return (
    <div className="max-w-lg mx-auto py-10">
      <h1 className="h2-bold mb-4">Your Profile</h1>
      <Button onClick={() => setModalOpen(true)}>Edit Profile</Button>
      <UserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        user={{
            id: session.user.id,
            name: session.user.name ?? "",
            email: session.user.email ?? "",
            role: session.user.role ?? "user",
            image: session.user.image ?? null,
            phoneNumber: (session.user as User).phoneNumber ?? null,
          }}
        hideRole
        disableEmail
        onUserSaved={() => window.location.reload()}
      />
    </div>
  );
} 