import type { Note } from '../types/note';

export function useFilter(notes: Note[]) {
  const allTags = [...new Set(notes.flatMap((note) => note.tags ?? []))];
  return { allTags };
}
