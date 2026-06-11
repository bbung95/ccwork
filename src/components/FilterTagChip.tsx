import { TagChipBase } from './TagChipBase';

interface FilterTagChipProps {
  label: string;
}

export function FilterTagChip({ label }: FilterTagChipProps) {
  return <TagChipBase>{label}</TagChipBase>;
}
