// ============================================================================
// loading.tsx - Component Tests
// ============================================================================

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Loading, LoadingOverlay, Skeleton, SkeletonText } from '../loading';

describe('Loading Components', () => {
  // ============================================================================
  // Loading Component
  // ============================================================================

  describe('Loading', () => {
    it('should render loading spinner', () => {
      render(<Loading />);

      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute('aria-label', 'Loading');
    });

    it('should render with text', () => {
      render(<Loading text="Loading character..." />);

      expect(screen.getByText('Loading character...')).toBeInTheDocument();
    });

    it('should render small size', () => {
      render(<Loading size="sm" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('h-4', 'w-4');
    });

    it('should render medium size by default', () => {
      render(<Loading />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('h-8', 'w-8');
    });

    it('should render large size', () => {
      render(<Loading size="lg" />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('h-12', 'w-12');
    });

    it('should apply custom className', () => {
      render(<Loading className="custom-loading" />);

      const container = screen.getByRole('status').parentElement;
      expect(container).toHaveClass('custom-loading');
    });

    it('should have spin animation', () => {
      render(<Loading />);

      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('animate-spin');
    });
  });

  // ============================================================================
  // LoadingOverlay Component
  // ============================================================================

  describe('LoadingOverlay', () => {
    it('should render when isLoading is true', () => {
      render(<LoadingOverlay isLoading={true} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should not render when isLoading is false', () => {
      render(<LoadingOverlay isLoading={false} />);

      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    });

    it('should display custom loading text', () => {
      render(<LoadingOverlay isLoading={true} text="Saving..." />);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });

    it('should have backdrop blur effect', () => {
      const { container } = render(<LoadingOverlay isLoading={true} />);

      const overlay = container.firstChild;
      expect(overlay).toHaveClass('backdrop-blur-sm');
    });

    it('should have fade-in animation', () => {
      const { container } = render(<LoadingOverlay isLoading={true} />);

      const overlay = container.firstChild;
      expect(overlay).toHaveClass('animate-in', 'fade-in');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <LoadingOverlay isLoading={true} className="custom-overlay" />
      );

      const overlay = container.firstChild;
      expect(overlay).toHaveClass('custom-overlay');
    });
  });

  // ============================================================================
  // Skeleton Component
  // ============================================================================

  describe('Skeleton', () => {
    it('should render skeleton placeholder', () => {
      const { container } = render(<Skeleton />);

      const skeleton = container.firstChild;
      expect(skeleton).toBeInTheDocument();
      expect(skeleton).toHaveClass('animate-pulse', 'bg-muted');
    });

    it('should apply custom className for sizing', () => {
      const { container } = render(<Skeleton className="h-12 w-full" />);

      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('h-12', 'w-full');
    });

    it('should have pulse animation', () => {
      const { container } = render(<Skeleton />);

      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('animate-pulse');
    });

    it('should have rounded corners', () => {
      const { container } = render(<Skeleton />);

      const skeleton = container.firstChild;
      expect(skeleton).toHaveClass('rounded-md');
    });
  });

  // ============================================================================
  // SkeletonText Component
  // ============================================================================

  describe('SkeletonText', () => {
    it('should render default 3 skeleton lines', () => {
      const { container } = render(<SkeletonText />);

      const lines = container.querySelectorAll('.animate-pulse');
      expect(lines).toHaveLength(3);
    });

    it('should render custom number of lines', () => {
      const { container } = render(<SkeletonText lines={5} />);

      const lines = container.querySelectorAll('.animate-pulse');
      expect(lines).toHaveLength(5);
    });

    it('should render single line', () => {
      const { container } = render(<SkeletonText lines={1} />);

      const lines = container.querySelectorAll('.animate-pulse');
      expect(lines).toHaveLength(1);
    });

    it('should apply custom className', () => {
      const { container } = render(<SkeletonText className="mt-8" />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('mt-8');
    });

    it('should have spacing between lines', () => {
      const { container } = render(<SkeletonText lines={3} />);

      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('space-y-2');
    });
  });
});
