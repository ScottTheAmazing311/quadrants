import { getInitials } from '@/lib/utils';

interface AvatarProps {
  imageUrl?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ imageUrl, name, size = 'md' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-16 h-16 text-lg',
    lg: 'w-24 h-24 text-2xl'
  };

  const initials = getInitials(name);

  return (
    <div
      className={`${sizeClasses[size]} rounded-full border-3 border-rust-primary overflow-hidden bg-rust-primary flex items-center justify-center font-black text-black uppercase texture-brushed`}
      style={{
        boxShadow: 'inset 0 1px 2px rgba(255, 147, 65, 0.2), inset 0 -1px 2px rgba(0, 0, 0, 0.3), 0 2px 4px rgba(0, 0, 0, 0.3)'
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        <span style={{ textShadow: '0 1px 1px rgba(0, 0, 0, 0.5)' }}>{initials}</span>
      )}
    </div>
  );
}
