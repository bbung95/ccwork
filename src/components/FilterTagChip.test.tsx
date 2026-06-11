import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterTagChip } from './FilterTagChip';

describe('FilterTagChip', () => {
  it('should render the given label text', () => {
    render(<FilterTagChip label="react" selected={false} onToggle={vi.fn()} />);
    expect(screen.getByText('react')).toBeInTheDocument();
  });

  it('should call onToggle when clicked', async () => {
    const onToggle = vi.fn();
    render(<FilterTagChip label="react" selected={false} onToggle={onToggle} />);
    await userEvent.click(screen.getByRole('button', { name: 'react' }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('should expose aria-pressed true when selected', () => {
    render(<FilterTagChip label="react" selected={true} onToggle={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'react' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('should expose aria-pressed false when not selected', () => {
    render(<FilterTagChip label="react" selected={false} onToggle={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'react' })).toHaveAttribute('aria-pressed', 'false');
  });
});
