// ============================================================================
// useCalculations Hook - Auto-Calculations for Character Stats
// ============================================================================

import { useMemo, useEffect } from "react";
import { useCharacterContext } from "@/contexts/CharacterContext";
import type { AttributeName, SkillName } from "@/types/character";
import {
  calculateProficiencyBonus,
  calculateSkillBonus,
  calculateSavingThrowBonus,
  calculateSpellSaveDC,
  calculateSpellAttackBonus,
  calculatePassiveWisdomPerception,
  calculateInitiative,
  formatHitDice,
  getHitDiceType,
} from "@/utils/calculations";
import { getSpellcastingAbility } from "@/utils/classRules";

// ============================================================================
// Hook
// ============================================================================

export const useCalculations = () => {
  const { character, updateCharacter } = useCharacterContext();

  // ============================================================================
  // Proficiency Bonus
  // ============================================================================

  const proficiencyBonus = useMemo(() => {
    return calculateProficiencyBonus(character.level);
  }, [character.level]);

  // Update proficiency bonus in character
  useEffect(() => {
    if (character.proficiencyBonus !== proficiencyBonus) {
      updateCharacter({ proficiencyBonus });
    }
  }, [proficiencyBonus, character.proficiencyBonus, updateCharacter]);

  // ============================================================================
  // Skill Bonuses
  // ============================================================================

  const skillBonuses = useMemo(() => {
    const bonuses: Record<SkillName, number> = {} as Record<SkillName, number>;

    Object.entries(character.skills).forEach(([skillName, skill]) => {
      const attributeModifier =
        character.attributes[skill.attribute as AttributeName].modifier;

      bonuses[skillName as SkillName] = calculateSkillBonus(
        attributeModifier,
        proficiencyBonus,
        skill.proficient,
        skill.expertise
      );
    });

    return bonuses;
  }, [character.skills, character.attributes, proficiencyBonus]);

  // Update skill bonuses in character
  useEffect(() => {
    const updatedSkills = { ...character.skills };
    let hasChanges = false;

    Object.entries(skillBonuses).forEach(([skillName, bonus]) => {
      const skill = skillName as SkillName;
      if (updatedSkills[skill].bonus !== bonus) {
        updatedSkills[skill] = { ...updatedSkills[skill], bonus };
        hasChanges = true;
      }
    });

    if (hasChanges) {
      updateCharacter({ skills: updatedSkills });
    }
  }, [skillBonuses, character.skills, updateCharacter]);

  // ============================================================================
  // Saving Throw Bonuses
  // ============================================================================

  const savingThrowBonuses = useMemo(() => {
    const bonuses: Record<AttributeName, number> = {} as Record<AttributeName, number>;

    Object.entries(character.savingThrows).forEach(([attributeName, savingThrow]) => {
      const attribute = attributeName as AttributeName;
      const modifier = character.attributes[attribute].modifier;

      bonuses[attribute] = calculateSavingThrowBonus(
        modifier,
        proficiencyBonus,
        savingThrow.proficient
      );
    });

    return bonuses;
  }, [character.savingThrows, character.attributes, proficiencyBonus]);

  // Update saving throw bonuses in character
  useEffect(() => {
    const updatedSavingThrows = { ...character.savingThrows };
    let hasChanges = false;

    Object.entries(savingThrowBonuses).forEach(([attributeName, bonus]) => {
      const attribute = attributeName as AttributeName;
      if (updatedSavingThrows[attribute].bonus !== bonus) {
        updatedSavingThrows[attribute] = {
          ...updatedSavingThrows[attribute],
          bonus,
        };
        hasChanges = true;
      }
    });

    if (hasChanges) {
      updateCharacter({ savingThrows: updatedSavingThrows });
    }
  }, [savingThrowBonuses, character.savingThrows, updateCharacter]);

  // ============================================================================
  // Initiative
  // ============================================================================

  const initiative = useMemo(() => {
    return calculateInitiative(character.attributes.dexterity.modifier);
  }, [character.attributes.dexterity.modifier]);

  // Update initiative in character
  useEffect(() => {
    if (character.combat.initiative !== initiative) {
      updateCharacter({
        combat: {
          ...character.combat,
          initiative,
        },
      });
    }
  }, [initiative, character.combat, updateCharacter]);

  // ============================================================================
  // Passive Wisdom (Perception)
  // ============================================================================

  const passiveWisdomPerception = useMemo(() => {
    return calculatePassiveWisdomPerception(
      character.attributes.wisdom.modifier,
      proficiencyBonus,
      character.skills.perception.proficient
    );
  }, [
    character.attributes.wisdom.modifier,
    proficiencyBonus,
    character.skills.perception.proficient,
  ]);

  // Update passive perception in character
  useEffect(() => {
    if (character.passiveWisdomPerception !== passiveWisdomPerception) {
      updateCharacter({ passiveWisdomPerception });
    }
  }, [passiveWisdomPerception, character.passiveWisdomPerception, updateCharacter]);

  // ============================================================================
  // Hit Dice
  // ============================================================================

  const hitDiceDisplay = useMemo(() => {
    const diceType = getHitDiceType(character.class);
    return formatHitDice(character.level, diceType);
  }, [character.class, character.level]);

  // Update hit dice in character
  useEffect(() => {
    if (character.combat.hitDice.total !== hitDiceDisplay) {
      updateCharacter({
        combat: {
          ...character.combat,
          hitDice: {
            ...character.combat.hitDice,
            total: hitDiceDisplay,
          },
        },
      });
    }
  }, [hitDiceDisplay, character.combat, updateCharacter]);

  // ============================================================================
  // Spellcasting Calculations
  // ============================================================================

  const spellcastingStats = useMemo(() => {
    if (!character.spellcasting) {
      return null;
    }

    const spellcastingAbility = getSpellcastingAbility(character.class);
    if (!spellcastingAbility) {
      return null;
    }

    const abilityModifier = character.attributes[spellcastingAbility].modifier;

    return {
      spellSaveDC: calculateSpellSaveDC(proficiencyBonus, abilityModifier),
      spellAttackBonus: calculateSpellAttackBonus(proficiencyBonus, abilityModifier),
      spellcastingAbility,
    };
  }, [character.spellcasting, character.class, character.attributes, proficiencyBonus]);

  // Update spellcasting stats in character
  useEffect(() => {
    if (!character.spellcasting || !spellcastingStats) return;

    const needsUpdate =
      character.spellcasting.spellSaveDC !== spellcastingStats.spellSaveDC ||
      character.spellcasting.spellAttackBonus !== spellcastingStats.spellAttackBonus ||
      character.spellcasting.spellcastingAbility !== spellcastingStats.spellcastingAbility;

    if (needsUpdate) {
      updateCharacter({
        spellcasting: {
          ...character.spellcasting,
          spellSaveDC: spellcastingStats.spellSaveDC,
          spellAttackBonus: spellcastingStats.spellAttackBonus,
          spellcastingAbility: spellcastingStats.spellcastingAbility,
        },
      });
    }
  }, [spellcastingStats, character.spellcasting, updateCharacter]);

  // ============================================================================
  // Return Calculated Values
  // ============================================================================

  return {
    proficiencyBonus,
    skillBonuses,
    savingThrowBonuses,
    initiative,
    passiveWisdomPerception,
    hitDiceDisplay,
    spellcastingStats,
  };
};
