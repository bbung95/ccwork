import { FilterTagChip } from './FilterTagChip';

interface TagFilterProps {
  tags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
}

export function TagFilter({ tags, selectedTags, onToggleTag }: TagFilterProps) {
  if (tags.length === 0) return null;

  return (
    <div data-testid="tag-filter" className="flex flex-wrap gap-2 pb-2">
      {tags.map((tag) => (
        <FilterTagChip
          key={tag}
          label={tag}
          selected={selectedTags.includes(tag)}
          onToggle={() => onToggleTag(tag)}
        />
      ))}
    </div>
  );
}
