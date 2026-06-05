import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagInput } from './TagInput';

describe('TagInput', () => {
  it('should call onAdd with input value when Enter key is pressed', async () => {
    const onAdd = vi.fn();
    render(<TagInput onAdd={onAdd} />);
    await userEvent.type(screen.getByRole('textbox'), 'react{Enter}');
    expect(onAdd).toHaveBeenCalledWith('react');
  });

  it('should clear input field after Enter key is pressed', async () => {
    render(<TagInput onAdd={vi.fn()} />);
    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'react{Enter}');
    expect(input).toHaveValue('');
  });

  it('should not call onAdd when non-Enter key is pressed', async () => {
    const onAdd = vi.fn();
    render(<TagInput onAdd={onAdd} />);
    await userEvent.type(screen.getByRole('textbox'), 'react');
    expect(onAdd).not.toHaveBeenCalled();
  });

  it('should enable the input when disabled prop is not given', () => {
    render(<TagInput onAdd={vi.fn()} />);
    expect(screen.getByRole('textbox')).toBeEnabled();
  });

  it('should disable the input when disabled prop is true', () => {
    render(<TagInput onAdd={vi.fn()} disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should not call onAdd on Enter when disabled is true', async () => {
    const onAdd = vi.fn();
    render(<TagInput onAdd={onAdd} disabled />);
    await userEvent.type(screen.getByRole('textbox'), 'react{Enter}');
    expect(onAdd).not.toHaveBeenCalled();
  });
});
