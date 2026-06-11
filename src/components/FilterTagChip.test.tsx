import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FilterTagChip } from './FilterTagChip';

describe('FilterTagChip', () => {
  it('should render the given label text', () => {
    render(<FilterTagChip label="react" />);
    expect(screen.getByText('react')).toBeInTheDocument();
  });
});
