"use client";
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createUserWithPhoto, updateUser, deleteUserImage, clearUserImage } from '@/lib/actions/user.actions';
import { toast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { USER_ROLES } from '@/lib/constants';
import { capitalize } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateUserSchema } from '@/lib/validators';
import { z } from 'zod';
import { Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { UploadButton } from '@/lib/uploadthing';

interface UserModalProps {
  open: boolean;
  onClose: () => void;
  onUserSaved?: () => void;
  user?: {
    id?: string;
    name: string;
    email: string;
    role: string;
    image: string | null | undefined;
    phoneNumber?: string | null;
  };
  hideRole?: boolean;
  disableEmail?: boolean;
}

export const UserModal: React.FC<UserModalProps> = ({ open, onClose, onUserSaved, user, hideRole, disableEmail }) => {
  const isEdit = !!user;
  const [photoUrl, setPhotoUrl] = useState<string | null>(user?.image || null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState(false);

  const form = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      id: user?.id || '',
      name: user?.name || '',
      email: user?.email || '',
      role: user?.role || 'user',
      imageUrl: user?.image || undefined
    }
  });

  // For password (only for create)
  const [password, setPassword] = useState('');

  const removeImage = async () => {
    setRemoving(true);
    try {
      if (photoUrl) {
        const res = await deleteUserImage(photoUrl);
        if (!res.success) {
          toast({ title: res.message || "Failed to delete image", variant: "destructive" });
        }
      }
      setPhotoUrl(null);
      setPreview(null);
      if (isEdit && user?.id) {
        await clearUserImage(user.id);
      }
    } catch {
      toast({ title: "Error removing image", variant: "destructive" });
    } finally {
      setRemoving(false);
    }
  };

  const handleImageUpload = async (res: { url: string }[]) => {
    if (photoUrl) await deleteUserImage(photoUrl); // Remove previous image
    if (res && res.length > 0) {
      setPhotoUrl(res[0].url);
      setPreview(null);
      toast({ title: 'Image uploaded!' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit User' : 'Create User'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update user details below.' : 'Fill in the details to create a new user.'}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(async (data) => {
            setLoading(true);
            try {
              if (isEdit) {
                const result = await updateUser({ ...data, imageUrl: photoUrl ?? undefined });
                if (result.success) {
                  toast({ title: "User updated successfully!" });
                  onUserSaved?.();
                  onClose();
                } else {
                  toast({ title: result.message || "Failed to update user.", variant: "destructive" });
                }
              } else {
                if (!password) {
                  toast({
                    title: 'Password is required for new users.',
                    variant: 'destructive',
                  });
                  return;
                }
                if (!photoUrl) {
                  toast({
                    title: 'Photo is required for new users.',
                    variant: 'destructive',
                  });
                  return;
                }
                const formData = new FormData();
                formData.append('name', data.name);
                formData.append('email', data.email);
                formData.append('password', password);
                formData.append('role', data.role);
                formData.append('imageUrl', photoUrl);
                const result = await createUserWithPhoto(formData);
                if (result.success) {
                  toast({ title: "User created successfully!" });
                  onUserSaved?.();
                  onClose();
                } else {
                  toast({ title: result.message || "Failed to create user.", variant: "destructive" });
                }
              }
            } catch (error) {
              console.error(error);
            } finally {
              setLoading(false);
            }
          })}
          className="space-y-4"
        >
          <Input {...form.register("name")} placeholder="Name" required />
          <Input {...form.register("email")}
            placeholder="Email"
            type="email"
            required
            disabled={isEdit || disableEmail}
          />
          {!isEdit && (
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          )}
          {!hideRole && <>
            <div className="mb-2 font-medium">Role</div>
            <Select value={form.watch('role')} onValueChange={val => form.setValue('role', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {capitalize(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>}
          <Input {...form.register("phoneNumber")}
            placeholder="Phone Number (optional)"
            type="tel"
            autoComplete="tel"
          />
          <div className="flex flex-col gap-2">
            <div className="relative w-20 h-20">
              {(preview || photoUrl) && (
                <>
                  <Image
                    src={preview || photoUrl || ''}
                    alt="Preview"
                    fill
                    className="object-cover rounded-full"
                  />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-white rounded-full p-1 shadow"
                    onClick={removeImage}
                    disabled={removing}
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </>
              )}
            </div>
            {!(preview || photoUrl) && (
              <div className="relative">
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={handleImageUpload}
                  onUploadBegin={() => setUploading(true)}
                  onUploadError={() => setUploading(false)}
                  onUploadProgress={() => setUploading(true)}
                  appearance={{
                    button: 'bg-white text-black border border-gray-300 rounded px-4 py-2',
                  }}
                />
                {uploading && (
                  <div className="absolute left-0 right-0 top-12 flex justify-center items-center">
                    <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-primary animate-pulse rounded-full" style={{ width: '100%' }} />
                    </div>
                    <span className="ml-2 text-xs text-muted-foreground">Uploading...</span>
                  </div>
                )}
              </div>
            )}
            <span className="text-xs text-muted-foreground">{isEdit ? 'Change photo (optional)' : 'Upload a photo (required)'}</span>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEdit ? 'Update' : 'Create'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};