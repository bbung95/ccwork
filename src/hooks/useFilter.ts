import { useState } from 'react';
import type { Note } from '../types/note';

export function useFilter(notes: Note[]) {
  const allTags = [...new Set(notes.flatMap((note) => note.tags ?? []))];
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const filteredNotes =
    selectedTags.length === 0
      ? notes
      : notes.filter((note) => note.tags?.some((tag) => selectedTags.includes(tag)));

  return { allTags, selectedTags, toggleTag, filteredNotes };
}
