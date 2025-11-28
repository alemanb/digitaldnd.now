// ============================================================================
// useClassRestrictions Hook - Class-Based Rules and Restrictions
// ============================================================================

import { useMemo, useEffect } from "react";
import { useCharacterContext } from "@/contexts/CharacterContext";
import type { AttributeName } from "@/types/character";
import {
  canUseSpellcasting,
  getSpellcastingAbility,
  getHitDice,
  getPrimaryAttribute,
  getSavingThrowProficiencies,
  isSavingThrowProficient,
  getClassRules,
} from "@/utils/classRules";

// ============================================================================
// Hook
// ============================================================================

export const useClassRestrictions = () => {
  const { character, updateCharacter } = useCharacterContext();

  // ============================================================================
  // Can Use Spellcasting
  // ============================================================================

  const canCastSpells = useMemo(() => {
    return canUseSpellcasting(character.class);
  }, [character.class]);

  // ============================================================================
  // Spellcasting Ability
  // ============================================================================

  const spellcastingAbility = useMemo(() => {
    return getSpellcastingAbility(character.class);
  }, [character.class]);

  // ============================================================================
  // Hit Dice Type
  // ============================================================================

  const hitDiceType = useMemo(() => {
    return getHitDice(character.class);
  }, [character.class]);

  // ============================================================================
  // Primary Attribute
  // ============================================================================

  const primaryAttribute = useMemo(() => {
    return getPrimaryAttribute(character.class);
  }, [character.class]);

  // ============================================================================
  // Saving Throw Proficiencies
  // ============================================================================

  const savingThrowProficiencies = useMemo(() => {
    return getSavingThrowProficiencies(character.class);
  }, [character.class]);

  // ============================================================================
  // Check if Attribute is Proficient
  // ============================================================================

  const isAttributeProficient = useMemo(() => {
    return (attribute: AttributeName) => {
      return isSavingThrowProficient(character.class, attribute);
    };
  }, [character.class]);

  // ============================================================================
  // All Class Rules
  // ============================================================================

  const classRules = useMemo(() => {
    return getClassRules(character.class);
  }, [character.class]);

  // ============================================================================
  // Auto-apply Saving Throw Proficiencies
  // ============================================================================

  useEffect(() => {
    const proficiencies = getSavingThrowProficiencies(character.class);
    const updatedSavingThrows = { ...character.savingThrows };
    let hasChanges = false;

    // Set proficiencies based on class
    Object.keys(updatedSavingThrows).forEach((attr) => {
      const attribute = attr as AttributeName;
      const shouldBeProficient = proficiencies.includes(attribute);

      if (updatedSavingThrows[attribute].proficient !== shouldBeProficient) {
        updatedSavingThrows[attribute] = {
          ...updatedSavingThrows[attribute],
          proficient: shouldBeProficient,
        };
        hasChanges = true;
      }
    });

    if (hasChanges) {
      updateCharacter({ savingThrows: updatedSavingThrows });
    }
  }, [character.class, character.savingThrows, updateCharacter]);

  // ============================================================================
  // Auto-initialize Spellcasting
  // ============================================================================

  useEffect(() => {
    const shouldHaveSpellcasting = canUseSpellcasting(character.class);

    if (shouldHaveSpellcasting && !character.spellcasting) {
      // Initialize spellcasting for spellcasting classes
      const ability = getSpellcastingAbility(character.class);
      if (ability) {
        updateCharacter({
          spellcasting: {
            spellcastingClass: character.class,
            spellcastingAbility: ability,
            spellSaveDC: 8,
            spellAttackBonus: 0,
            cantrips: [],
            spellSlots: [
              { level: 1, total: 0, expended: 0, spells: [] },
              { level: 2, total: 0, expended: 0, spells: [] },
              { level: 3, total: 0, expended: 0, spells: [] },
              { level: 4, total: 0, expended: 0, spells: [] },
              { level: 5, total: 0, expended: 0, spells: [] },
              { level: 6, total: 0, expended: 0, spells: [] },
              { level: 7, total: 0, expended: 0, spells: [] },
              { level: 8, total: 0, expended: 0, spells: [] },
              { level: 9, total: 0, expended: 0, spells: [] },
            ],
          },
        });
      }
    } else if (!shouldHaveSpellcasting && character.spellcasting) {
      // Remove spellcasting for non-spellcasting classes
      updateCharacter({
        spellcasting: undefined,
      });
    }
  }, [character.class, character.spellcasting, updateCharacter]);

  // ============================================================================
  // Helper Functions
  // ============================================================================

  const shouldShowSpellcasting = useMemo(() => {
    return canCastSpells && character.spellcasting !== undefined;
  }, [canCastSpells, character.spellcasting]);

  const getSuggestedAttributes = useMemo(() => {
    return () => {
      const suggested: AttributeName[] = [primaryAttribute];

      // Add spellcasting ability if applicable
      if (spellcastingAbility && spellcastingAbility !== primaryAttribute) {
        suggested.push(spellcastingAbility);
      }

      // Add saving throw proficiencies
      savingThrowProficiencies.forEach((attr) => {
        if (!suggested.includes(attr)) {
          suggested.push(attr);
        }
      });

      return suggested;
    };
  }, [primaryAttribute, spellcastingAbility, savingThrowProficiencies]);

  // ============================================================================
  // Return API
  // ============================================================================

  return {
    // Spellcasting
    canCastSpells,
    spellcastingAbility,
    shouldShowSpellcasting,

    // Hit dice
    hitDiceType,

    // Attributes
    primaryAttribute,
    getSuggestedAttributes,

    // Saving throws
    savingThrowProficiencies,
    isAttributeProficient,

    // Class rules
    classRules,
  };
};
