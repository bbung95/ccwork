import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NoteList } from './NoteList';
import type { Note } from '../types/note';

vi.mock('../context/NotesContext', () => ({
  useNotes: vi.fn(),
}));

import { useNotes } from '../context/NotesContext';

const mockUseNotes = vi.mocked(useNotes);

const makeNote = (overrides: Partial<Note> = {}): Note => ({
  id: '1',
  title: 'T',
  content: '',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  tags: [],
  ...overrides,
});

const mockContext = (notes: Note[]) => ({
  notes,
  loading: false,
  error: null,
  createNote: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
});

describe('NoteList', () => {
  beforeEach(() => {
    mockUseNotes.mockReturnValue(mockContext([]));
  });

  it('should render TagFilter with tag chips when notes have tags', () => {
    const notes = [
      makeNote({ id: '1', tags: ['react'] }),
      makeNote({ id: '2', tags: ['typescript'] }),
    ];
    mockUseNotes.mockReturnValue(mockContext(notes));

    render(<NoteList selectedNoteId={null} onSelect={vi.fn()} />);

    expect(screen.getByTestId('tag-filter')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('should not render TagFilter when no note has tags', () => {
    const notes = [makeNote({ id: '1', tags: [] }), makeNote({ id: '2', tags: [] })];
    mockUseNotes.mockReturnValue(mockContext(notes));

    render(<NoteList selectedNoteId={null} onSelect={vi.fn()} />);

    expect(screen.queryByTestId('tag-filter')).not.toBeInTheDocument();
  });

  it('should render TagFilter above the note items in DOM order', () => {
    const notes = [makeNote({ id: '1', title: 'First Note', tags: ['react'] })];
    mockUseNotes.mockReturnValue(mockContext(notes));

    render(<NoteList selectedNoteId={null} onSelect={vi.fn()} />);

    const tagFilter = screen.getByTestId('tag-filter');
    const noteItemTitle = screen.getByText('First Note');

    // noteItem이 tagFilter '뒤'에 위치해야 한다 (TagFilter가 상단)
    expect(
      tagFilter.compareDocumentPosition(noteItemTitle) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('should remove a tag chip after the note exclusively owning that tag is deleted', () => {
    const notes = [
      makeNote({ id: '1', title: 'A', tags: ['react'] }),
      makeNote({ id: '2', title: 'B', tags: ['vue'] }),
    ];
    mockUseNotes.mockReturnValue(mockContext(notes));

    const { rerender } = render(<NoteList selectedNoteId={null} onSelect={vi.fn()} />);
    expect(screen.getByText('vue')).toBeInTheDocument();

    // 'vue'를 단독 보유한 노트를 삭제한 상태로 갱신 → 리렌더
    mockUseNotes.mockReturnValue(mockContext([makeNote({ id: '1', title: 'A', tags: ['react'] })]));
    rerender(<NoteList selectedNoteId={null} onSelect={vi.fn()} />);

    expect(screen.queryByText('vue')).not.toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
  });
});
