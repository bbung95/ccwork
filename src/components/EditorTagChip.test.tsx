import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditorTagChip } from './EditorTagChip';

describe('EditorTagChip', () => {
  it('should render the X (remove) button', () => {
    render(<EditorTagChip label="react" onRemove={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'react 삭제' })).toBeInTheDocument();
  });

  it('should call onRemove when the X button is clicked', async () => {
    const onRemove = vi.fn();
    render(<EditorTagChip label="react" onRemove={onRemove} />);

    await userEvent.click(screen.getByRole('button', { name: 'react 삭제' }));

    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('should call onRemove immediately without a confirm dialog', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    const onRemove = vi.fn();
    render(<EditorTagChip label="react" onRemove={onRemove} />);

    await userEvent.click(screen.getByRole('button', { name: 'react 삭제' }));

    expect(confirmSpy).not.toHaveBeenCalled();
    expect(onRemove).toHaveBeenCalledTimes(1);
    confirmSpy.mockRestore();
  });
});
