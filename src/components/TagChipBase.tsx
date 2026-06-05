import type { ReactNode } from 'react';

interface TagChipBaseProps {
  children: ReactNode;
}

export function TagChipBase({ children }: TagChipBaseProps) {
  return (
    <span className="inline-flex items-center gap-1 h-7 px-2.5 rounded-full bg-muted text-muted-foreground text-[13px] font-medium">
      {children}
    </span>
  );
}
