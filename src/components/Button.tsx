import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base = 'rounded-xl font-semibold cursor-pointer disabled:opacity-40';

  const variants = {
    primary: 'bg-foreground text-card hover:opacity-75 transition-opacity',
    secondary: 'text-muted-foreground bg-muted hover:bg-border transition-colors',
    ghost: 'text-muted-foreground hover:text-destructive transition-colors',
  };

  const sizes = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-5 py-2 text-sm',
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
}
