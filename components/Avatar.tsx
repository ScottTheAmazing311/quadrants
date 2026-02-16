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
      className={`${sizeClasses[size]} rounded-full border-2 border-gray-300 shadow-md overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center font-bold text-white`}
    >
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
