import { supabase } from './supabase';

export async function uploadAvatar(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { data, error } = await supabase.storage
    .from('Avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Failed to upload avatar: ${error.message}`);
  }

  const { data: { publicUrl } } = supabase.storage
    .from('Avatars')
    .getPublicUrl(filePath);

  return publicUrl;
}
