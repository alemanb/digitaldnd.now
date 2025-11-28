// ============================================================================
// AttributeBlock - Single attribute display with modifier
// ============================================================================

import React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { NumberInput } from "@/components/form-fields/NumberInput";
import { formatModifier } from "@/utils/calculations";
import { cn } from "@/lib/utils";
import type { AttributeName } from "@/types/character";

// ============================================================================
// Props Interface
// ============================================================================

export interface AttributeBlockProps {
  name: AttributeName;
  score: number;
  modifier: number;
  onScoreChange: (score: number) => void;
  className?: string;
  disabled?: boolean;
}

// ============================================================================
// Attribute Display Names
// ============================================================================

const attributeLabels: Record<AttributeName, string> = {
  strength: "STR",
  dexterity: "DEX",
  constitution: "CON",
  intelligence: "INT",
  wisdom: "WIS",
  charisma: "CHA",
};

const attributeFullNames: Record<AttributeName, string> = {
  strength: "Strength",
  dexterity: "Dexterity",
  constitution: "Constitution",
  intelligence: "Intelligence",
  wisdom: "Wisdom",
  charisma: "Charisma",
};

// ============================================================================
// AttributeBlock Component
// ============================================================================

export const AttributeBlock: React.FC<AttributeBlockProps> = ({
  name,
  score,
  modifier,
  onScoreChange,
  className,
  disabled = false,
}) => {
  // ============================================================================
  // Render
  // ============================================================================

  return (
    <Card className={cn("p-4 flex flex-col items-center gap-3", className)}>
      {/* Attribute Label */}
      <Label
        className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
        title={attributeFullNames[name]}
      >
        {attributeLabels[name]}
      </Label>

      {/* Score Input */}
      <NumberInput
        value={score}
        onChange={onScoreChange}
        min={1}
        max={30}
        disabled={disabled}
        inputClassName="text-2xl font-bold w-16 h-16"
      />

      {/* Modifier Display */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs text-muted-foreground">Modifier</span>
        <div className="px-3 py-1 rounded-md bg-muted">
          <span className="text-lg font-semibold">
            {formatModifier(modifier)}
          </span>
        </div>
      </div>
    </Card>
  );
};
