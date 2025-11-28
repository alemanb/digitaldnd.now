// ============================================================================
// TextInput.tsx - Component Tests
// ============================================================================

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TextInput } from '../TextInput';

describe('TextInput', () => {
  it('should render with label', () => {
    render(
      <TextInput
        label="Character Name"
        value=""
        onChange={() => {}}
      />
    );

    expect(screen.getByText('Character Name')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should display current value', () => {
    render(
      <TextInput
        label="Name"
        value="Aragorn"
        onChange={() => {}}
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('Aragorn');
  });

  it('should call onChange when typing', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(
      <TextInput
        label="Name"
        value=""
        onChange={onChange}
      />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, 'Test');

    expect(onChange).toHaveBeenCalled();
  });

  it('should display placeholder', () => {
    render(
      <TextInput
        label="Name"
        value=""
        onChange={() => {}}
        placeholder="Enter character name"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Enter character name');
  });

  it('should display error message', () => {
    render(
      <TextInput
        label="Name"
        value=""
        onChange={() => {}}
        error="Name is required"
      />
    );

    expect(screen.getByText('Name is required')).toBeInTheDocument();
  });

  it('should apply error styling', () => {
    render(
      <TextInput
        label="Name"
        value=""
        onChange={() => {}}
        error="Invalid name"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-destructive');
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <TextInput
        label="Name"
        value="Test"
        onChange={() => {}}
        disabled
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('should handle multiline text input type', () => {
    render(
      <TextInput
        label="Description"
        value="Test description"
        onChange={() => {}}
        type="textarea"
      />
    );

    // TextInput with type="textarea" might render a textarea instead of input
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(
      <TextInput
        label="Name"
        value="Test"
        onChange={() => {}}
        className="custom-input"
      />
    );

    const container = screen.getByRole('textbox').closest('div');
    expect(container).toHaveClass('custom-input');
  });
});
