import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NoteEditor } from './NoteEditor';
import type { Note } from '../types/note';

vi.mock('../context/NotesContext', () => ({
  useNotes: vi.fn(),
}));

import { useNotes } from '../context/NotesContext';

const mockUseNotes = vi.mocked(useNotes);

// Note: `tags` will be added to the Note type in the Green phase.
type TestNote = Note & { tags?: string[] };

const makeNote = (overrides: Partial<TestNote> = {}): TestNote => ({
  id: '1',
  title: 'Test Note',
  content: '',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  tags: [],
  ...overrides,
});

const mockContext = (notes: TestNote[]) => ({
  notes: notes as Note[],
  loading: false,
  error: null,
  createNote: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
});

describe('NoteEditor', () => {
  beforeEach(() => {
    mockUseNotes.mockReturnValue(mockContext([]));
  });

  it('should render tag area when note has one or more tags', () => {
    const note = makeNote({ id: '1', tags: ['react'] });
    mockUseNotes.mockReturnValue(mockContext([note]));

    render(<NoteEditor selectedNoteId="1" isCreating={false} onDone={vi.fn()} />);

    expect(screen.getByTestId('tag-area')).toBeInTheDocument();
  });

  it('should not render tag area when note has no tags', () => {
    const note = makeNote({ id: '1', tags: [] });
    mockUseNotes.mockReturnValue(mockContext([note]));

    render(<NoteEditor selectedNoteId="1" isCreating={false} onDone={vi.fn()} />);

    expect(screen.queryByTestId('tag-area')).not.toBeInTheDocument();
  });

  it('should not throw when note has no tags field (legacy note)', () => {
    const legacyNote: Note = {
      id: '1',
      title: 'Legacy',
      content: '',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    };
    mockUseNotes.mockReturnValue(mockContext([legacyNote]));

    expect(() => {
      render(<NoteEditor selectedNoteId="1" isCreating={false} onDone={vi.fn()} />);
    }).not.toThrow();
  });

  it("should reset tags to new note's tags when selectedNote changes", () => {
    const note1 = makeNote({ id: '1', tags: ['react'] });
    const note2 = makeNote({ id: '2', tags: ['vue'] });
    mockUseNotes.mockReturnValue(mockContext([note1, note2]));

    const { rerender } = render(
      <NoteEditor selectedNoteId="1" isCreating={false} onDone={vi.fn()} />,
    );

    expect(screen.getByText('react')).toBeInTheDocument();

    rerender(<NoteEditor selectedNoteId="2" isCreating={false} onDone={vi.fn()} />);

    expect(screen.queryByText('react')).not.toBeInTheDocument();
    expect(screen.getByText('vue')).toBeInTheDocument();
  });

  it('should discard unsaved tag changes when switching to another note', async () => {
    const note1 = makeNote({ id: '1', tags: [] });
    const note2 = makeNote({ id: '2', tags: [] });
    mockUseNotes.mockReturnValue(mockContext([note1, note2]));

    const { rerender } = render(
      <NoteEditor selectedNoteId="1" isCreating={false} onDone={vi.fn()} />,
    );

    // 태그 입력 필드에 값을 입력하되 Enter를 누르지 않음 (저장 전 상태)
    const tagInput = screen.getByPlaceholderText('태그 추가');
    await userEvent.type(tagInput, 'typescript');

    // 다른 노트로 전환
    rerender(<NoteEditor selectedNoteId="2" isCreating={false} onDone={vi.fn()} />);

    // 저장되지 않은 태그가 남아 있으면 안 됨
    expect(screen.queryByText('typescript')).not.toBeInTheDocument();
  });

  it('should hide tag area entirely when switching from a tagged note to an untagged note', () => {
    const noteA = makeNote({ id: '1', tags: ['react'] });
    const noteB = makeNote({ id: '2', tags: [] });
    mockUseNotes.mockReturnValue(mockContext([noteA, noteB]));

    const { rerender } = render(
      <NoteEditor selectedNoteId="1" isCreating={false} onDone={vi.fn()} />,
    );
    expect(screen.getByTestId('tag-area')).toBeInTheDocument();

    rerender(<NoteEditor selectedNoteId="2" isCreating={false} onDone={vi.fn()} />);

    expect(screen.queryByTestId('tag-area')).not.toBeInTheDocument();
    expect(screen.queryByText('react')).not.toBeInTheDocument();
  });

  it('should keep the tag input visible even when the note has no tags', () => {
    const note = makeNote({ id: '1', tags: [] });
    mockUseNotes.mockReturnValue(mockContext([note]));

    render(<NoteEditor selectedNoteId="1" isCreating={false} onDone={vi.fn()} />);

    // chip 묶음(tag-area)은 없지만, 첫 태그를 추가할 입력 필드는 항상 노출된다
    expect(screen.queryByTestId('tag-area')).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText('태그 추가')).toBeInTheDocument();
  });

  it('should discard an added-but-unsaved tag when switching notes', async () => {
    const note1 = makeNote({ id: '1', tags: [] });
    const note2 = makeNote({ id: '2', tags: ['vue'] });
    mockUseNotes.mockReturnValue(mockContext([note1, note2]));

    const { rerender } = render(
      <NoteEditor selectedNoteId="1" isCreating={false} onDone={vi.fn()} />,
    );

    // Enter로 태그를 추가하되 Save하지 않음
    await userEvent.type(screen.getByPlaceholderText('태그 추가'), 'typescript{Enter}');
    expect(screen.getByText('typescript')).toBeInTheDocument();

    // 다른 노트로 전환 → 미저장 태그 유실, 새 노트 태그 표시
    rerender(<NoteEditor selectedNoteId="2" isCreating={false} onDone={vi.fn()} />);

    expect(screen.queryByText('typescript')).not.toBeInTheDocument();
    expect(screen.getByText('vue')).toBeInTheDocument();
  });

  it('should remove the chip when its X button is clicked', async () => {
    const note = makeNote({ id: '1', tags: ['react', 'vue'] });
    mockUseNotes.mockReturnValue(mockContext([note]));

    render(<NoteEditor selectedNoteId="1" isCreating={false} onDone={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'react 삭제' }));

    expect(screen.queryByText('react')).not.toBeInTheDocument();
    expect(screen.getByText('vue')).toBeInTheDocument();
  });

  it('should hide the tag area entirely when the last tag is removed', async () => {
    const note = makeNote({ id: '1', tags: ['react'] });
    mockUseNotes.mockReturnValue(mockContext([note]));

    render(<NoteEditor selectedNoteId="1" isCreating={false} onDone={vi.fn()} />);
    expect(screen.getByTestId('tag-area')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'react 삭제' }));

    expect(screen.queryByTestId('tag-area')).not.toBeInTheDocument();
  });

  const tenTags = Array.from({ length: 10 }, (_, i) => `tag${i}`);

  it('should keep the tag input enabled when the note has fewer than 10 tags', () => {
    const note = makeNote({ id: '1', tags: ['react', 'vue', 'svelte'] });
    mockUseNotes.mockReturnValue(mockContext([note]));

    render(<NoteEditor selectedNoteId="1" isCreating={false} onDone={vi.fn()} />);

    expect(screen.getByPlaceholderText('태그 추가')).toBeEnabled();
  });

  it('should disable the tag input when the note has 10 tags', () => {
    const note = makeNote({ id: '1', tags: tenTags });
    mockUseNotes.mockReturnValue(mockContext([note]));

    render(<NoteEditor selectedNoteId="1" isCreating={false} onDone={vi.fn()} />);

    expect(screen.getByPlaceholderText('태그 추가')).toBeDisabled();
  });

  it('should still allow removing a tag via X button when 10 tags are reached', async () => {
    const note = makeNote({ id: '1', tags: tenTags });
    mockUseNotes.mockReturnValue(mockContext([note]));

    render(<NoteEditor selectedNoteId="1" isCreating={false} onDone={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: 'tag5 삭제' }));

    expect(screen.queryByText('tag5')).not.toBeInTheDocument();
  });

  it('should re-enable the tag input after removing a tag from a 10-tag note', async () => {
    const note = makeNote({ id: '1', tags: tenTags });
    mockUseNotes.mockReturnValue(mockContext([note]));

    render(<NoteEditor selectedNoteId="1" isCreating={false} onDone={vi.fn()} />);
    expect(screen.getByPlaceholderText('태그 추가')).toBeDisabled();

    await userEvent.click(screen.getByRole('button', { name: 'tag5 삭제' }));

    expect(screen.getByPlaceholderText('태그 추가')).toBeEnabled();
  });

  it('should call updateNote with the current tags when saving an existing note that has tags', async () => {
    const note = makeNote({ id: '1', title: 'My Note', tags: ['react', 'vue'] });
    const ctx = mockContext([note]);
    mockUseNotes.mockReturnValue(ctx);

    render(<NoteEditor selectedNoteId="1" isCreating={false} onDone={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(ctx.updateNote).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({ tags: ['react', 'vue'] }),
    );
  });

  it('should call updateNote with an empty tags array when the note has no tags', async () => {
    const note = makeNote({ id: '1', title: 'My Note', tags: [] });
    const ctx = mockContext([note]);
    mockUseNotes.mockReturnValue(ctx);

    render(<NoteEditor selectedNoteId="1" isCreating={false} onDone={vi.fn()} />);

    await userEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(ctx.updateNote).toHaveBeenCalledWith('1', expect.objectContaining({ tags: [] }));
  });

  it('should call createNote with the entered tags when saving a new note', async () => {
    const ctx = mockContext([]);
    mockUseNotes.mockReturnValue(ctx);

    render(<NoteEditor selectedNoteId={null} isCreating={true} onDone={vi.fn()} />);

    await userEvent.type(screen.getByPlaceholderText('제목'), 'New Note');
    await userEvent.type(screen.getByPlaceholderText('태그 추가'), 'react{Enter}');
    await userEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(ctx.createNote).toHaveBeenCalledWith('New Note', '', ['react']);
  });

  it('should call onDone after a successful save (existing feedback preserved)', async () => {
    const note = makeNote({ id: '1', title: 'My Note', tags: ['react'] });
    const onDone = vi.fn();
    mockUseNotes.mockReturnValue(mockContext([note]));

    render(<NoteEditor selectedNoteId="1" isCreating={false} onDone={onDone} />);

    await userEvent.click(screen.getByRole('button', { name: '저장' }));

    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
