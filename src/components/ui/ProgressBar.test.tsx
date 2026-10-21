import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
  it('exposes progressbar semantics with value text', () => {
    render(<ProgressBar label="Cloud Concepts weighting" value={24} valueText="24% of content" />);
    const bar = screen.getByRole('progressbar', { name: 'Cloud Concepts weighting' });
    expect(bar).toHaveAttribute('aria-valuenow', '24');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('aria-valuetext', '24% of content');
  });

  it('clamps out-of-range values', () => {
    render(
      <>
        <ProgressBar label="Too high" value={150} />
        <ProgressBar label="Too low" value={-5} />
      </>,
    );
    expect(screen.getByRole('progressbar', { name: 'Too high' })).toHaveAttribute(
      'aria-valuenow',
      '100',
    );
    expect(screen.getByRole('progressbar', { name: 'Too low' })).toHaveAttribute(
      'aria-valuenow',
      '0',
    );
  });

  it('handles a zero max without dividing by zero', () => {
    render(<ProgressBar label="Empty" value={0} max={0} />);
    const fill = screen.getByRole('progressbar', { name: 'Empty' }).firstElementChild;
    expect(fill).toHaveStyle({ width: '0%' });
  });
});
