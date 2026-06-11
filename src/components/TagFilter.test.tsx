import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TagFilter } from './TagFilter';

describe('TagFilter', () => {
  it('should render one chip per tag', () => {
    render(<TagFilter tags={['react', 'typescript']} />);
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('should render nothing when tags is empty', () => {
    const { container } = render(<TagFilter tags={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
