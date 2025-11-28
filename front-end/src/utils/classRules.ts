// ============================================================================
// D&D 5e Class Rules and Restrictions
// ============================================================================

import { CharacterClass, type AttributeName } from "@/types/character";

// ============================================================================
// Class Rule Types
// ============================================================================

interface ClassRules {
  spellcasting: boolean;
  spellcastingAbility?: AttributeName;
  hitDice: string;
  primaryAttribute: AttributeName;
  savingThrowProficiencies: AttributeName[];
}

// ============================================================================
// Class Rules Configuration
// ============================================================================

export const classRules: Record<CharacterClass, ClassRules> = {
  [CharacterClass.BARBARIAN]: {
    spellcasting: false,
    hitDice: "d12",
    primaryAttribute: "strength",
    savingThrowProficiencies: ["strength", "constitution"],
  },
  [CharacterClass.BARD]: {
    spellcasting: true,
    spellcastingAbility: "charisma",
    hitDice: "d8",
    primaryAttribute: "charisma",
    savingThrowProficiencies: ["dexterity", "charisma"],
  },
  [CharacterClass.CLERIC]: {
    spellcasting: true,
    spellcastingAbility: "wisdom",
    hitDice: "d8",
    primaryAttribute: "wisdom",
    savingThrowProficiencies: ["wisdom", "charisma"],
  },
  [CharacterClass.DRUID]: {
    spellcasting: true,
    spellcastingAbility: "wisdom",
    hitDice: "d8",
    primaryAttribute: "wisdom",
    savingThrowProficiencies: ["intelligence", "wisdom"],
  },
  [CharacterClass.FIGHTER]: {
    spellcasting: false,
    hitDice: "d10",
    primaryAttribute: "strength",
    savingThrowProficiencies: ["strength", "constitution"],
  },
  [CharacterClass.MONK]: {
    spellcasting: false,
    hitDice: "d8",
    primaryAttribute: "dexterity",
    savingThrowProficiencies: ["strength", "dexterity"],
  },
  [CharacterClass.PALADIN]: {
    spellcasting: true,
    spellcastingAbility: "charisma",
    hitDice: "d10",
    primaryAttribute: "strength",
    savingThrowProficiencies: ["wisdom", "charisma"],
  },
  [CharacterClass.RANGER]: {
    spellcasting: true,
    spellcastingAbility: "wisdom",
    hitDice: "d10",
    primaryAttribute: "dexterity",
    savingThrowProficiencies: ["strength", "dexterity"],
  },
  [CharacterClass.ROGUE]: {
    spellcasting: false,
    hitDice: "d8",
    primaryAttribute: "dexterity",
    savingThrowProficiencies: ["dexterity", "intelligence"],
  },
  [CharacterClass.SORCERER]: {
    spellcasting: true,
    spellcastingAbility: "charisma",
    hitDice: "d6",
    primaryAttribute: "charisma",
    savingThrowProficiencies: ["constitution", "charisma"],
  },
  [CharacterClass.WARLOCK]: {
    spellcasting: true,
    spellcastingAbility: "charisma",
    hitDice: "d8",
    primaryAttribute: "charisma",
    savingThrowProficiencies: ["wisdom", "charisma"],
  },
  [CharacterClass.WIZARD]: {
    spellcasting: true,
    spellcastingAbility: "intelligence",
    hitDice: "d6",
    primaryAttribute: "intelligence",
    savingThrowProficiencies: ["intelligence", "wisdom"],
  },
};

// ============================================================================
// Class Rule Helper Functions
// ============================================================================

/**
 * Check if a class can cast spells
 */
export const canUseSpellcasting = (characterClass: CharacterClass): boolean => {
  return classRules[characterClass]?.spellcasting ?? false;
};

/**
 * Get the spellcasting ability for a class
 */
export const getSpellcastingAbility = (
  characterClass: CharacterClass
): AttributeName | null => {
  const rules = classRules[characterClass];
  return rules?.spellcastingAbility ?? null;
};

/**
 * Get the hit dice type for a class
 */
export const getHitDice = (characterClass: CharacterClass): string => {
  return classRules[characterClass]?.hitDice ?? "d8";
};

/**
 * Get the primary attribute for a class
 */
export const getPrimaryAttribute = (
  characterClass: CharacterClass
): AttributeName => {
  return classRules[characterClass]?.primaryAttribute ?? "strength";
};

/**
 * Get the saving throw proficiencies for a class
 */
export const getSavingThrowProficiencies = (
  characterClass: CharacterClass
): AttributeName[] => {
  return classRules[characterClass]?.savingThrowProficiencies ?? [];
};

/**
 * Check if a class is proficient in a saving throw
 */
export const isSavingThrowProficient = (
  characterClass: CharacterClass,
  attribute: AttributeName
): boolean => {
  const proficiencies = getSavingThrowProficiencies(characterClass);
  return proficiencies.includes(attribute);
};

/**
 * Get all class rules for a character class
 */
export const getClassRules = (characterClass: CharacterClass): ClassRules => {
  return classRules[characterClass];
};

// ============================================================================
// Spellcasting Classes
// ============================================================================

export const SPELLCASTING_CLASSES: CharacterClass[] = [
  CharacterClass.BARD,
  CharacterClass.CLERIC,
  CharacterClass.DRUID,
  CharacterClass.PALADIN,
  CharacterClass.RANGER,
  CharacterClass.SORCERER,
  CharacterClass.WARLOCK,
  CharacterClass.WIZARD,
];

export const isSpellcastingClass = (characterClass: CharacterClass): boolean => {
  return SPELLCASTING_CLASSES.includes(characterClass);
};
