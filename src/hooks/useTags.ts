import { useState } from 'react';

export const MAX_TAGS = 10;

export function useTags(initialTags: string[]) {
  const [tags, setTagsState] = useState<string[]>(initialTags);

  const addTag = (input: string) => {
    const normalized = input.trim().toLowerCase();
    if (!normalized) return;
    setTagsState((prev) => {
      if (prev.length >= MAX_TAGS || prev.includes(normalized)) return prev;
      return [...prev, normalized];
    });
  };

  const removeTag = (tag: string) => {
    setTagsState((prev) => prev.filter((t) => t !== tag));
  };

  const setTags = (newTags: string[]) => {
    setTagsState(newTags);
  };

  return { tags, addTag, removeTag, setTags };
}
