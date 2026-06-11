import { FilterTagChip } from './FilterTagChip';

interface TagFilterProps {
  tags: string[];
}

export function TagFilter({ tags }: TagFilterProps) {
  if (tags.length === 0) return null;

  return (
    <div data-testid="tag-filter" className="flex flex-wrap gap-2 pb-2">
      {tags.map((tag) => (
        <FilterTagChip key={tag} label={tag} />
      ))}
    </div>
  );
}
