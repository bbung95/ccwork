import { useState } from 'react';

export function useTags(initialTags: string[]) {
  const [tags, setTagsState] = useState<string[]>(initialTags);

  const addTag = (input: string) => {
    const normalized = input.trim().toLowerCase();
    if (!normalized) return;
    setTagsState((prev) => (prev.includes(normalized) ? prev : [...prev, normalized]));
  };

  const setTags = (newTags: string[]) => {
    setTagsState(newTags);
  };

  return { tags, addTag, setTags };
}
