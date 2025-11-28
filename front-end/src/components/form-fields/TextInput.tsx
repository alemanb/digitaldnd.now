// ============================================================================
// TextInput - Controlled text input with validation
// ============================================================================

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ============================================================================
// Props Interface
// ============================================================================

export interface TextInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  error?: string;
  placeholder?: string;
  required?: boolean;
  id?: string;
  maxLength?: number;
  type?: "text" | "email" | "password" | "url";
}

// ============================================================================
// TextInput Component
// ============================================================================

export const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  className,
  inputClassName,
  error,
  placeholder,
  required = false,
  id,
  maxLength,
  type = "text",
}) => {
  // ============================================================================
  // Handlers
  // ============================================================================

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
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
        type={type}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        className={cn(
          error && "border-destructive focus-visible:ring-destructive",
          inputClassName
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
