// ============================================================================
// D&D 5e Calculation Utilities
// ============================================================================

import type { AttributeScore, Skill } from "@/types/character";
import { CharacterClass } from "@/types/character";

// ============================================================================
// Attribute Calculations
// ============================================================================

/**
 * Calculate ability modifier from ability score
 * Formula: Math.floor((score - 10) / 2)
 */
export const calculateModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

/**
 * Create an AttributeScore object with auto-calculated modifier
 */
export const createAttributeScore = (score: number): AttributeScore => {
  return {
    score,
    modifier: calculateModifier(score),
  };
};

/**
 * Update attribute score and recalculate modifier
 */
export const updateAttributeScore = (newScore: number): AttributeScore => {
  return createAttributeScore(newScore);
};

// ============================================================================
// Proficiency Calculations
// ============================================================================

/**
 * Calculate proficiency bonus based on character level
 * Formula: Math.ceil(level / 4) + 1
 */
export const calculateProficiencyBonus = (level: number): number => {
  return Math.ceil(level / 4) + 1;
};

// ============================================================================
// Skill Calculations
// ============================================================================

/**
 * Calculate skill bonus
 * Formula: attributeModifier + (proficiencyBonus if proficient) + (proficiencyBonus if expertise)
 */
export const calculateSkillBonus = (
  attributeModifier: number,
  proficiencyBonus: number,
  isProficient: boolean,
  hasExpertise: boolean = false
): number => {
  let bonus = attributeModifier;

  if (isProficient) {
    bonus += proficiencyBonus;

    // Expertise can only be applied if proficient
    if (hasExpertise) {
      bonus += proficiencyBonus; // Expertise = double proficiency
    }
  }

  return bonus;
};

/**
 * Update skill bonus based on current state
 */
export const updateSkillBonus = (
  skill: Skill,
  attributeModifier: number,
  proficiencyBonus: number
): Skill => {
  return {
    ...skill,
    bonus: calculateSkillBonus(
      attributeModifier,
      proficiencyBonus,
      skill.proficient,
      skill.expertise
    ),
  };
};

// ============================================================================
// Saving Throw Calculations
// ============================================================================

/**
 * Calculate saving throw bonus
 * Formula: attributeModifier + (proficiencyBonus if proficient)
 */
export const calculateSavingThrowBonus = (
  attributeModifier: number,
  proficiencyBonus: number,
  isProficient: boolean
): number => {
  return isProficient ? attributeModifier + proficiencyBonus : attributeModifier;
};

// ============================================================================
// Spellcasting Calculations
// ============================================================================

/**
 * Calculate spell save DC
 * Formula: 8 + proficiencyBonus + abilityModifier
 */
export const calculateSpellSaveDC = (
  proficiencyBonus: number,
  abilityModifier: number
): number => {
  return 8 + proficiencyBonus + abilityModifier;
};

/**
 * Calculate spell attack bonus
 * Formula: proficiencyBonus + abilityModifier
 */
export const calculateSpellAttackBonus = (
  proficiencyBonus: number,
  abilityModifier: number
): number => {
  return proficiencyBonus + abilityModifier;
};

// ============================================================================
// Combat Calculations
// ============================================================================

/**
 * Calculate initiative bonus (same as Dexterity modifier)
 */
export const calculateInitiative = (dexterityModifier: number): number => {
  return dexterityModifier;
};

/**
 * Calculate passive Wisdom (Perception)
 * Formula: 10 + Wisdom modifier + (proficiency bonus if proficient in Perception)
 */
export const calculatePassiveWisdomPerception = (
  wisdomModifier: number,
  proficiencyBonus: number,
  isPerceptionProficient: boolean
): number => {
  return (
    10 +
    wisdomModifier +
    (isPerceptionProficient ? proficiencyBonus : 0)
  );
};

// ============================================================================
// Hit Dice Calculations
// ============================================================================

/**
 * Get hit dice type based on class
 */
export const getHitDiceType = (characterClass: CharacterClass): string => {
  const hitDiceMap: Record<CharacterClass, string> = {
    [CharacterClass.BARBARIAN]: "d12",
    [CharacterClass.FIGHTER]: "d10",
    [CharacterClass.PALADIN]: "d10",
    [CharacterClass.RANGER]: "d10",
    [CharacterClass.BARD]: "d8",
    [CharacterClass.CLERIC]: "d8",
    [CharacterClass.DRUID]: "d8",
    [CharacterClass.MONK]: "d8",
    [CharacterClass.ROGUE]: "d8",
    [CharacterClass.WARLOCK]: "d8",
    [CharacterClass.SORCERER]: "d6",
    [CharacterClass.WIZARD]: "d6",
  };

  return hitDiceMap[characterClass] || "d8";
};

/**
 * Format hit dice display
 * Example: level 3 Fighter = "3d10"
 */
export const formatHitDice = (level: number, hitDiceType: string): string => {
  return `${level}${hitDiceType}`;
};

// ============================================================================
// Formatting Utilities
// ============================================================================

/**
 * Format modifier with + or - sign
 */
export const formatModifier = (modifier: number): string => {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

/**
 * Format bonus with + or - sign
 */
export const formatBonus = (bonus: number): string => {
  return formatModifier(bonus);
};
