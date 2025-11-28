// ============================================================================
// CheckboxInput - Controlled checkbox input with label
// ============================================================================

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ============================================================================
// Props Interface
// ============================================================================

export interface CheckboxInputProps {
  label?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  error?: string;
  id?: string;
  description?: string;
}

// ============================================================================
// CheckboxInput Component
// ============================================================================

export const CheckboxInput: React.FC<CheckboxInputProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  className,
  error,
  id,
  description,
}) => {
  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center gap-2">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
          className={cn(error && "border-destructive")}
        />
        {label && (
          <Label
            htmlFor={id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </Label>
        )}
      </div>
      {description && (
        <p className="text-sm text-muted-foreground ml-6">{description}</p>
      )}
      {error && (
        <p className="text-sm text-destructive ml-6">{error}</p>
      )}
    </div>
  );
};
