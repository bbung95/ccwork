import type { Note } from '../types/note';

// stub: 시그니처만 맞춘 최소 구현. allTags 파생 로직은 Green 단계에서 채운다.
export function useFilter(notes: Note[]) {
  void notes;
  return {
    allTags: [] as string[],
  };
}
