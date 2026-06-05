import { useState } from 'react';

export function useTags(initialTags: string[]) {
  const [tags, setTagsState] = useState<string[]>(initialTags);

  const addTag = (input: string) => {
    const normalized = input.trim().toLowerCase();
    if (!normalized) return;
    setTagsState((prev) => (prev.includes(normalized) ? prev : [...prev, normalized]));
  };

  const removeTag = (tag: string) => {
    setTagsState((prev) => prev.filter((t) => t !== tag));
  };

  const setTags = (newTags: string[]) => {
    setTagsState(newTags);
  };

  return { tags, addTag, removeTag, setTags };
}
