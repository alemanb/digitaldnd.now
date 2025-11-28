// ============================================================================
// TextAreaInput - Controlled textarea input with validation
// ============================================================================

import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ============================================================================
// Props Interface
// ============================================================================

export interface TextAreaInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  textareaClassName?: string;
  error?: string;
  placeholder?: string;
  required?: boolean;
  id?: string;
  maxLength?: number;
  rows?: number;
  resize?: "none" | "both" | "horizontal" | "vertical";
}

// ============================================================================
// TextAreaInput Component
// ============================================================================

export const TextAreaInput: React.FC<TextAreaInputProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  className,
  textareaClassName,
  error,
  placeholder,
  required = false,
  id,
  maxLength,
  rows = 4,
  resize = "vertical",
}) => {
  // ============================================================================
  // Handlers
  // ============================================================================

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  // ============================================================================
  // Render
  // ============================================================================

  const resizeClass = {
    none: "resize-none",
    both: "resize",
    horizontal: "resize-x",
    vertical: "resize-y",
  }[resize];

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <Label htmlFor={id} className={cn(required && "after:content-['*'] after:ml-0.5 after:text-destructive")}>
          {label}
        </Label>
      )}
      <Textarea
        id={id}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className={cn(
          resizeClass,
          error && "border-destructive focus-visible:ring-destructive",
          textareaClassName
        )}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      {maxLength && (
        <p className="text-xs text-muted-foreground text-right">
          {value.length}/{maxLength}
        </p>
      )}
    </div>
  );
};
