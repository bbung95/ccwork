import { TagChipBase } from './TagChipBase';

interface FilterTagChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

export function FilterTagChip({ label, selected, onToggle }: FilterTagChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      className="cursor-pointer rounded-full transition-transform duration-[120ms] active:scale-[0.96]"
    >
      <TagChipBase
        className={
          selected
            ? 'bg-blue-soft text-blue transition-colors'
            : 'bg-muted text-muted-foreground transition-colors hover:bg-border'
        }
      >
        {label}
      </TagChipBase>
    </button>
  );
}
