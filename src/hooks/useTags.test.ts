import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTags } from './useTags';

describe('useTags', () => {
  it('should return empty tags array when initialized with empty array', () => {
    const { result } = renderHook(() => useTags([]));
    expect(result.current.tags).toEqual([]);
  });

  it('should add normalized tag when valid input is given', () => {
    const { result } = renderHook(() => useTags([]));
    act(() => {
      result.current.addTag('React');
    });
    expect(result.current.tags).toContain('react');
  });

  it('should apply trim and toLowerCase when input has surrounding spaces or uppercase', () => {
    const { result } = renderHook(() => useTags([]));
    act(() => {
      result.current.addTag('  TypeScript  ');
    });
    expect(result.current.tags).toEqual(['typescript']);
  });

  it('should replace all tags when called with new array', () => {
    const { result } = renderHook(() => useTags(['react']));
    act(() => {
      result.current.setTags(['vue', 'angular']);
    });
    expect(result.current.tags).toEqual(['vue', 'angular']);
  });

  it('should be no-op when input is empty string', () => {
    const { result } = renderHook(() => useTags([]));
    act(() => {
      result.current.addTag('');
    });
    expect(result.current.tags).toHaveLength(0);
  });

  it('should be no-op when input is whitespace only', () => {
    const { result } = renderHook(() => useTags([]));
    act(() => {
      result.current.addTag('   ');
    });
    expect(result.current.tags).toHaveLength(0);
  });

  it('should be no-op when duplicate tag exists (case-insensitive)', () => {
    const { result } = renderHook(() => useTags(['react']));
    act(() => {
      result.current.addTag('React');
    });
    expect(result.current.tags).toHaveLength(1);
  });

  it('should remove the tag when an existing tag is given', () => {
    const { result } = renderHook(() => useTags(['react']));
    act(() => {
      result.current.removeTag('react');
    });
    expect(result.current.tags).not.toContain('react');
  });

  it('should remove only the matching tag and keep the others', () => {
    const { result } = renderHook(() => useTags(['react', 'vue', 'svelte']));
    act(() => {
      result.current.removeTag('vue');
    });
    expect(result.current.tags).toEqual(['react', 'svelte']);
  });

  it('should result in empty array when removing the last remaining tag', () => {
    const { result } = renderHook(() => useTags(['react']));
    act(() => {
      result.current.removeTag('react');
    });
    expect(result.current.tags).toEqual([]);
  });

  it('should be no-op when the tag does not exist', () => {
    const { result } = renderHook(() => useTags(['react']));
    act(() => {
      result.current.removeTag('vue');
    });
    expect(result.current.tags).toEqual(['react']);
  });
});
