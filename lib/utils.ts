import { supabase } from './supabase';

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export async function generateUniqueGroupCode(): Promise<string> {
  let code: string;
  let exists = true;

  while (exists) {
    code = Array.from({ length: 6 }, () =>
      CHARS[Math.floor(Math.random() * CHARS.length)]
    ).join('');

    const { data } = await supabase
      .from('groups')
      .select('id')
      .eq('code', code)
      .single();

    exists = !!data;
  }

  return code!;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
