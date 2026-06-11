import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagFilter } from './TagFilter';

describe('TagFilter', () => {
  it('should render one chip per tag', () => {
    render(<TagFilter tags={['react', 'typescript']} selectedTags={[]} onToggleTag={vi.fn()} />);
    expect(screen.getByText('react')).toBeInTheDocument();
    expect(screen.getByText('typescript')).toBeInTheDocument();
  });

  it('should render nothing when tags is empty', () => {
    const { container } = render(<TagFilter tags={[]} selectedTags={[]} onToggleTag={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should mark a chip as selected (aria-pressed) when its tag is in selectedTags', () => {
    render(
      <TagFilter tags={['react', 'typescript']} selectedTags={['react']} onToggleTag={vi.fn()} />,
    );
    expect(screen.getByRole('button', { name: 'react' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'typescript' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('should call onToggleTag with the tag when a chip is clicked', async () => {
    const onToggleTag = vi.fn();
    render(
      <TagFilter tags={['react', 'typescript']} selectedTags={[]} onToggleTag={onToggleTag} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'typescript' }));
    expect(onToggleTag).toHaveBeenCalledWith('typescript');
  });
});
