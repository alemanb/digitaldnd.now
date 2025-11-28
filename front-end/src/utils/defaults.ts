// ============================================================================
// Default Character Data and Initialization
// ============================================================================

import {
  type Character,
  type SkillSet,
  type SavingThrows,
  type Attributes,
  CharacterClass,
  Race,
  Alignment,
  type AttributeName,
} from "@/types/character";

// ============================================================================
// Default Values
// ============================================================================

const DEFAULT_ATTRIBUTE_SCORE = 10;

/**
 * Create default attribute scores (all 10s with 0 modifiers)
 */
export const createDefaultAttributes = (): Attributes => {
  return {
    strength: { score: DEFAULT_ATTRIBUTE_SCORE, modifier: 0 },
    dexterity: { score: DEFAULT_ATTRIBUTE_SCORE, modifier: 0 },
    constitution: { score: DEFAULT_ATTRIBUTE_SCORE, modifier: 0 },
    intelligence: { score: DEFAULT_ATTRIBUTE_SCORE, modifier: 0 },
    wisdom: { score: DEFAULT_ATTRIBUTE_SCORE, modifier: 0 },
    charisma: { score: DEFAULT_ATTRIBUTE_SCORE, modifier: 0 },
  };
};

/**
 * Create default skill set (no proficiencies)
 */
export const createDefaultSkills = (): SkillSet => {
  return {
    acrobatics: { proficient: false, expertise: false, bonus: 0, attribute: "dexterity" },
    animalHandling: { proficient: false, expertise: false, bonus: 0, attribute: "wisdom" },
    arcana: { proficient: false, expertise: false, bonus: 0, attribute: "intelligence" },
    athletics: { proficient: false, expertise: false, bonus: 0, attribute: "strength" },
    deception: { proficient: false, expertise: false, bonus: 0, attribute: "charisma" },
    history: { proficient: false, expertise: false, bonus: 0, attribute: "intelligence" },
    insight: { proficient: false, expertise: false, bonus: 0, attribute: "wisdom" },
    intimidation: { proficient: false, expertise: false, bonus: 0, attribute: "charisma" },
    investigation: { proficient: false, expertise: false, bonus: 0, attribute: "intelligence" },
    medicine: { proficient: false, expertise: false, bonus: 0, attribute: "wisdom" },
    nature: { proficient: false, expertise: false, bonus: 0, attribute: "intelligence" },
    perception: { proficient: false, expertise: false, bonus: 0, attribute: "wisdom" },
    performance: { proficient: false, expertise: false, bonus: 0, attribute: "charisma" },
    persuasion: { proficient: false, expertise: false, bonus: 0, attribute: "charisma" },
    religion: { proficient: false, expertise: false, bonus: 0, attribute: "intelligence" },
    sleightOfHand: { proficient: false, expertise: false, bonus: 0, attribute: "dexterity" },
    stealth: { proficient: false, expertise: false, bonus: 0, attribute: "dexterity" },
    survival: { proficient: false, expertise: false, bonus: 0, attribute: "wisdom" },
  };
};

/**
 * Create default saving throws (no proficiencies)
 */
export const createDefaultSavingThrows = (): SavingThrows => {
  return {
    strength: { proficient: false, bonus: 0 },
    dexterity: { proficient: false, bonus: 0 },
    constitution: { proficient: false, bonus: 0 },
    intelligence: { proficient: false, bonus: 0 },
    wisdom: { proficient: false, bonus: 0 },
    charisma: { proficient: false, bonus: 0 },
  };
};

/**
 * Generate a unique character ID
 */
export const generateCharacterId = (): string => {
  return `char_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Create a new blank character
 */
export const createBlankCharacter = (): Character => {
  return {
    id: generateCharacterId(),
    characterName: "",
    playerName: "",
    race: Race.HUMAN,
    class: CharacterClass.FIGHTER,
    level: 1,
    background: "",
    alignment: Alignment.TRUE_NEUTRAL,
    experiencePoints: 0,

    attributes: createDefaultAttributes(),

    combat: {
      armorClass: 10,
      initiative: 0,
      speed: 30,
      hitPointMaximum: 10,
      currentHitPoints: 10,
      temporaryHitPoints: 0,
      hitDice: {
        total: "1d10",
        current: 1,
      },
      deathSaves: {
        successes: 0,
        failures: 0,
      },
    },

    skills: createDefaultSkills(),
    savingThrows: createDefaultSavingThrows(),
    proficiencyBonus: 2,
    inspiration: false,

    details: {
      age: 20,
      height: "",
      weight: "",
      eyes: "",
      skin: "",
      hair: "",
      appearance: "",
      backstory: "",
      alliesAndOrganizations: "",
      additionalFeatures: "",
      treasure: "",
    },

    personality: {
      traits: "",
      ideals: "",
      bonds: "",
      flaws: "",
    },

    equipment: [],
    currency: {
      copper: 0,
      silver: 0,
      electrum: 0,
      gold: 0,
      platinum: 0,
    },

    features: [],
    proficiencies: [],
    languages: ["Common"],

    attacks: [],

    passiveWisdomPerception: 10,
  };
};

/**
 * Skill name to attribute mapping
 */
export const skillAttributeMap: Record<string, AttributeName> = {
  acrobatics: "dexterity",
  animalHandling: "wisdom",
  arcana: "intelligence",
  athletics: "strength",
  deception: "charisma",
  history: "intelligence",
  insight: "wisdom",
  intimidation: "charisma",
  investigation: "intelligence",
  medicine: "wisdom",
  nature: "intelligence",
  perception: "wisdom",
  performance: "charisma",
  persuasion: "charisma",
  religion: "intelligence",
  sleightOfHand: "dexterity",
  stealth: "dexterity",
  survival: "wisdom",
};

/**
 * Get all available races
 */
export const getAllRaces = (): string[] => {
  return Object.values(Race);
};

/**
 * Get all available classes
 */
export const getAllClasses = (): string[] => {
  return Object.values(CharacterClass);
};

/**
 * Get all available alignments
 */
export const getAllAlignments = (): string[] => {
  return Object.values(Alignment);
};
