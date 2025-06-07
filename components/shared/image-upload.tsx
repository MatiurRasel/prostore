'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ImageIcon, X } from 'lucide-react';
import Image from 'next/image';
import { resizeImage } from '@/lib/utils/image';

interface ImageUploadProps {
    onImageUpload: (file: File) => void;
    aspectRatio?: number;
    maxWidth?: number;
    maxHeight?: number;
    className?: string;
}

export const ImageUpload = ({
    onImageUpload,
    //aspectRatio = 16/9,
    maxWidth = 800,
    maxHeight = 600,
    className = ''
}: ImageUploadProps) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        try {
            // Create preview
            const previewUrl = URL.createObjectURL(file);
            setPreview(previewUrl);

            // Read file as buffer
            const buffer = await file.arrayBuffer();
            
            // Resize image
            const resizedBuffer = await resizeImage(Buffer.from(buffer), {
                width: maxWidth,
                height: maxHeight,
                format: 'webp'
            });

            // Create new file from resized buffer
            const resizedFile = new File([resizedBuffer], file.name.replace(/\.[^/.]+$/, '.webp'), {
                type: 'image/webp'
            });

            onImageUpload(resizedFile);
        } catch (error) {
            console.error('Error processing image:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemove = () => {
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`relative ${className}`}>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
            
            {preview ? (
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border">
                    <Image
                        src={preview}
                        alt="Preview"
                        fill
                        className="object-contain"
                    />
                    <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleRemove}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <Button
                    type="button"
                    variant="outline"
                    className="w-full aspect-[16/9] flex flex-col items-center justify-center gap-2"
                    onClick={handleClick}
                    disabled={isLoading}
                >
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                        {isLoading ? 'Processing...' : 'Click to upload image'}
                    </span>
                </Button>
            )}
        </div>
    );
}; 