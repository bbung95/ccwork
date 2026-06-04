import { useState } from 'react';

// stub: Green 단계에서 로직을 채운다
export function useTags(initialTags: string[]) {
  const [tags] = useState<string[]>(initialTags);
  return {
    tags,
    addTag(input: string) {
      void input;
    },
    setTags(newTags: string[]) {
      void newTags;
    },
  };
}
