// ============================================================================
// AttributesGrid - Grid of all 6 ability scores
// ============================================================================

import React from "react";
import { AttributeBlock } from "./AttributeBlock";
import { useCharacter } from "@/hooks/useCharacter";
import { cn } from "@/lib/utils";
import type { AttributeName } from "@/types/character";

// ============================================================================
// Props Interface
// ============================================================================

export interface AttributesGridProps {
  className?: string;
  disabled?: boolean;
}

// ============================================================================
// Attribute Order
// ============================================================================

const attributeOrder: AttributeName[] = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
];

// ============================================================================
// AttributesGrid Component
// ============================================================================

export const AttributesGrid: React.FC<AttributesGridProps> = ({
  className,
  disabled = false,
}) => {
  const { character, updateAttributeScore } = useCharacter();

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4", className)}>
      {attributeOrder.map((attribute) => {
        const attributeData = character.attributes[attribute];
        return (
          <AttributeBlock
            key={attribute}
            name={attribute}
            score={attributeData.score}
            modifier={attributeData.modifier}
            onScoreChange={(score) => updateAttributeScore(attribute, score)}
            disabled={disabled}
          />
        );
      })}
    </div>
  );
};
