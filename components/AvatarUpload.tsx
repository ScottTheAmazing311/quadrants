'use client';

import { useState } from 'react';
import { uploadAvatar } from '@/lib/upload';

interface AvatarUploadProps {
  onUpload: (url: string) => void;
}

export function AvatarUpload({ onUpload }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Supabase
    try {
      setUploading(true);
      setError(null);
      const url = await uploadAvatar(file);
      onUpload(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        {preview && (
          <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-rust-primary warm-glow">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}

        <label
          className="cursor-pointer bg-rust-primary texture-brushed text-black px-6 py-3 rounded-none transition-all hover:scale-105 inline-block font-bold uppercase tracking-wider text-sm"
          style={{
            boxShadow: 'inset 0 1px 2px rgba(255, 147, 65, 0.2), inset 0 -1px 2px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(0, 0, 0, 0.3)',
            textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
          }}
        >
          {uploading ? 'Uploading...' : preview ? 'Change Avatar' : 'Upload Avatar'}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
}
