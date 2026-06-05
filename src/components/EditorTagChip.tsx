import { TagChipBase } from './TagChipBase';

interface EditorTagChipProps {
  label: string;
  onRemove: () => void;
}

export function EditorTagChip({ label, onRemove }: EditorTagChipProps) {
  return (
    <TagChipBase>
      {label}
      <button
        type="button"
        aria-label={`${label} 삭제`}
        onClick={onRemove}
        className="inline-flex h-4 w-4 items-center justify-center rounded-[11px] text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M1 1l8 8M9 1l-8 8" />
        </svg>
      </button>
    </TagChipBase>
  );
}
