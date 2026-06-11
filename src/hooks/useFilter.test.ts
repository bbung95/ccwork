import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilter } from './useFilter';
import type { Note } from '../types/note';

const makeNote = (overrides: Partial<Note> = {}): Note => ({
  id: '1',
  title: 'T',
  content: '',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  tags: [],
  ...overrides,
});

describe('useFilter', () => {
  it('should return the union of all note tags when multiple notes have tags', () => {
    const notes = [
      makeNote({ id: '1', tags: ['react'] }),
      makeNote({ id: '2', tags: ['typescript'] }),
    ];
    const { result } = renderHook(() => useFilter(notes));
    expect(result.current.allTags).toEqual(expect.arrayContaining(['react', 'typescript']));
    expect(result.current.allTags).toHaveLength(2);
  });

  it('should deduplicate a tag shared by multiple notes', () => {
    const notes = [makeNote({ id: '1', tags: ['react'] }), makeNote({ id: '2', tags: ['react'] })];
    const { result } = renderHook(() => useFilter(notes));
    expect(result.current.allTags).toEqual(['react']);
  });

  it("should recompute allTags when notes change so a removed note's exclusive tag disappears", () => {
    const initial = [makeNote({ id: '1', tags: ['react'] }), makeNote({ id: '2', tags: ['vue'] })];
    const { result, rerender } = renderHook(({ notes }) => useFilter(notes), {
      initialProps: { notes: initial },
    });
    expect(result.current.allTags).toEqual(expect.arrayContaining(['react', 'vue']));

    // 'vue'만 가진 노트를 삭제한 상태로 다시 렌더
    rerender({ notes: [makeNote({ id: '1', tags: ['react'] })] });

    expect(result.current.allTags).toEqual(['react']);
    expect(result.current.allTags).not.toContain('vue');
  });

  it('should return an empty array when notes is empty', () => {
    const { result } = renderHook(() => useFilter([]));
    expect(result.current.allTags).toEqual([]);
  });

  it('should return an empty array when no note has tags (undefined or empty tags)', () => {
    const notes = [makeNote({ id: '1', tags: [] }), makeNote({ id: '2', tags: undefined })];
    const { result } = renderHook(() => useFilter(notes));
    expect(result.current.allTags).toEqual([]);
  });
});

describe('useFilter — 선택/필터링 (#14)', () => {
  it('should add a tag to selectedTags when it is not selected', () => {
    const notes = [makeNote({ id: '1', tags: ['react'] })];
    const { result } = renderHook(() => useFilter(notes));
    act(() => {
      result.current.toggleTag('react');
    });
    expect(result.current.selectedTags).toContain('react');
  });

  it('should remove a tag from selectedTags when it is already selected', () => {
    const notes = [makeNote({ id: '1', tags: ['react'] })];
    const { result } = renderHook(() => useFilter(notes));
    act(() => {
      result.current.toggleTag('react');
    });
    act(() => {
      result.current.toggleTag('react');
    });
    expect(result.current.selectedTags).not.toContain('react');
  });

  it('should be empty initially', () => {
    const notes = [makeNote({ id: '1', tags: ['react'] })];
    const { result } = renderHook(() => useFilter(notes));
    expect(result.current.selectedTags).toEqual([]);
  });

  it('should return all notes when selectedTags is empty', () => {
    const notes = [makeNote({ id: '1', tags: ['react'] }), makeNote({ id: '2', tags: ['vue'] })];
    const { result } = renderHook(() => useFilter(notes));
    expect(result.current.filteredNotes).toHaveLength(2);
  });

  it('should return only notes containing the selected tag when one tag is selected', () => {
    const notes = [makeNote({ id: '1', tags: ['react'] }), makeNote({ id: '2', tags: ['vue'] })];
    const { result } = renderHook(() => useFilter(notes));
    act(() => {
      result.current.toggleTag('react');
    });
    expect(result.current.filteredNotes.map((n) => n.id)).toEqual(['1']);
  });

  it('should return notes matching ANY selected tag (OR) when multiple tags are selected', () => {
    const notes = [
      makeNote({ id: '1', tags: ['react'] }),
      makeNote({ id: '2', tags: ['typescript'] }),
      makeNote({ id: '3', tags: ['vue'] }),
    ];
    const { result } = renderHook(() => useFilter(notes));
    act(() => {
      result.current.toggleTag('react');
    });
    act(() => {
      result.current.toggleTag('typescript');
    });
    expect(result.current.filteredNotes.map((n) => n.id)).toEqual(['1', '2']);
  });

  it('should exclude untagged notes when a tag is selected', () => {
    const notes = [makeNote({ id: '1', tags: ['react'] }), makeNote({ id: '2', tags: undefined })];
    const { result } = renderHook(() => useFilter(notes));
    act(() => {
      result.current.toggleTag('react');
    });
    expect(result.current.filteredNotes.map((n) => n.id)).toEqual(['1']);
  });

  it('should keep selectedTags and recompute filteredNotes when a new non-matching note is added', () => {
    const initial = [makeNote({ id: '1', tags: ['react'] })];
    const { result, rerender } = renderHook(({ notes }) => useFilter(notes), {
      initialProps: { notes: initial },
    });
    act(() => {
      result.current.toggleTag('react');
    });
    expect(result.current.filteredNotes.map((n) => n.id)).toEqual(['1']);

    // 태그 없는 새 노트 추가 → 선택 유지, 미충족 노트는 미포함
    rerender({ notes: [...initial, makeNote({ id: '2', tags: [] })] });

    expect(result.current.selectedTags).toEqual(['react']);
    expect(result.current.filteredNotes.map((n) => n.id)).toEqual(['1']);
  });
});
