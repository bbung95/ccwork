import { useState, type KeyboardEvent } from 'react';

interface TagInputProps {
  onAdd: (value: string) => void;
}

export function TagInput({ onAdd }: TagInputProps) {
  const [value, setValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    onAdd(value);
    setValue('');
  };

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="태그 추가"
      className="h-7 px-3 rounded-full bg-muted text-[13px] text-foreground placeholder:text-muted-foreground/60 outline-none"
    />
  );
}
