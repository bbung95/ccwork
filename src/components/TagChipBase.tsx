import type { ReactNode } from 'react';

interface TagChipBaseProps {
  children: ReactNode;
  className?: string;
}

export function TagChipBase({
  children,
  className = 'bg-muted text-muted-foreground',
}: TagChipBaseProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 h-7 px-2.5 rounded-full text-[13px] font-medium ${className}`}
    >
      {children}
    </span>
  );
}
