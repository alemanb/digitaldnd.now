// ============================================================================
// NumberInput - Controlled number input with validation
// ============================================================================

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ============================================================================
// Props Interface
// ============================================================================

export interface NumberInputProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  error?: string;
  placeholder?: string;
  required?: boolean;
  id?: string;
}

// ============================================================================
// NumberInput Component
// ============================================================================

export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
  className,
  inputClassName,
  error,
  placeholder,
  required = false,
  id,
}) => {
  // ============================================================================
  // Handlers
  // ============================================================================

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const numValue = Number(newValue);

    // Validate number
    if (isNaN(numValue)) {
      return;
    }

    // Apply min/max constraints
    let constrainedValue = numValue;
    if (min !== undefined && numValue < min) {
      constrainedValue = min;
    }
    if (max !== undefined && numValue > max) {
      constrainedValue = max;
    }

    onChange(constrainedValue);
  };

  const handleBlur = () => {
    // Ensure value meets constraints on blur
    let constrainedValue = value;
    if (min !== undefined && value < min) {
      constrainedValue = min;
      onChange(constrainedValue);
    }
    if (max !== undefined && value > max) {
      constrainedValue = max;
      onChange(constrainedValue);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Delay to ensure the browser doesn't override selection after click
    requestAnimationFrame(() => e.target.select());
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLInputElement>) => {
    // If already focused, prevent cursor placement and keep the full selection
    if (document.activeElement === e.currentTarget) {
      e.preventDefault();
      e.currentTarget.select();
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <Label htmlFor={id} className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
          {label}
        </Label>
      )}
      <Input
        id={id}
        type="number"
        data-number-input
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onMouseDown={handleMouseDown}
        onBlur={handleBlur}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(
          "text-center",
          error && "border-destructive focus-visible:ring-destructive",
          inputClassName
        )}
        inputMode="numeric"
        pattern="[0-9]*"
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};
