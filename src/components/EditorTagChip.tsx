import { TagChipBase } from './TagChipBase';

interface EditorTagChipProps {
  label: string;
}

export function EditorTagChip({ label }: EditorTagChipProps) {
  return <TagChipBase>{label}</TagChipBase>;
}
