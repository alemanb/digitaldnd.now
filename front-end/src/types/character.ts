// ============================================================================
// D&D 5e Character Type Definitions
// ============================================================================

// ============================================================================
// String Literal Types (used instead of enums for erasableSyntaxOnly compatibility)
// ============================================================================

export const Race = {
  HUMAN: "Human",
  ELF: "Elf",
  DWARF: "Dwarf",
  HALFLING: "Halfling",
  DRAGONBORN: "Dragonborn",
  GNOME: "Gnome",
  HALF_ELF: "Half-Elf",
  HALF_ORC: "Half-Orc",
  TIEFLING: "Tiefling",
} as const;

export type Race = typeof Race[keyof typeof Race];

export const CharacterClass = {
  BARBARIAN: "Barbarian",
  BARD: "Bard",
  CLERIC: "Cleric",
  DRUID: "Druid",
  FIGHTER: "Fighter",
  MONK: "Monk",
  PALADIN: "Paladin",
  RANGER: "Ranger",
  ROGUE: "Rogue",
  SORCERER: "Sorcerer",
  WARLOCK: "Warlock",
  WIZARD: "Wizard",
} as const;

export type CharacterClass = typeof CharacterClass[keyof typeof CharacterClass];

export const Alignment = {
  LAWFUL_GOOD: "Lawful Good",
  NEUTRAL_GOOD: "Neutral Good",
  CHAOTIC_GOOD: "Chaotic Good",
  LAWFUL_NEUTRAL: "Lawful Neutral",
  TRUE_NEUTRAL: "True Neutral",
  CHAOTIC_NEUTRAL: "Chaotic Neutral",
  LAWFUL_EVIL: "Lawful Evil",
  NEUTRAL_EVIL: "Neutral Evil",
  CHAOTIC_EVIL: "Chaotic Evil",
} as const;

export type Alignment = typeof Alignment[keyof typeof Alignment];

// ============================================================================
// Core Attribute Types
// ============================================================================

export interface AttributeScore {
  score: number; // 1-30
  modifier: number; // Auto-calculated: Math.floor((score - 10) / 2)
}

export interface Attributes {
  strength: AttributeScore;
  dexterity: AttributeScore;
  constitution: AttributeScore;
  intelligence: AttributeScore;
  wisdom: AttributeScore;
  charisma: AttributeScore;
}

export type AttributeName = keyof Attributes;

// ============================================================================
// Combat Stats
// ============================================================================

export interface HitDice {
  total: string; // e.g., "2d8"
  current: number;
}

export interface DeathSaves {
  successes: number; // 0-3
  failures: number; // 0-3
}

export interface CombatStats {
  armorClass: number;
  initiative: number;
  speed: number;
  hitPointMaximum: number;
  currentHitPoints: number;
  temporaryHitPoints: number;
  hitDice: HitDice;
  deathSaves: DeathSaves;
}

export interface Attack {
  id: string;
  name: string;
  attackBonus: number;
  damageType: string;
  damage: string; // e.g., "1d8+3"
}

// ============================================================================
// Skills & Proficiencies
// ============================================================================

export interface Skill {
  proficient: boolean;
  expertise: boolean; // Double proficiency
  bonus: number; // Auto-calculated
  attribute: AttributeName;
}

export interface SkillSet {
  acrobatics: Skill;
  animalHandling: Skill;
  arcana: Skill;
  athletics: Skill;
  deception: Skill;
  history: Skill;
  insight: Skill;
  intimidation: Skill;
  investigation: Skill;
  medicine: Skill;
  nature: Skill;
  perception: Skill;
  performance: Skill;
  persuasion: Skill;
  religion: Skill;
  sleightOfHand: Skill;
  stealth: Skill;
  survival: Skill;
}

export type SkillName = keyof SkillSet;

export interface SavingThrow {
  proficient: boolean;
  bonus: number; // Auto-calculated
}

export interface SavingThrows {
  strength: SavingThrow;
  dexterity: SavingThrow;
  constitution: SavingThrow;
  intelligence: SavingThrow;
  wisdom: SavingThrow;
  charisma: SavingThrow;
}

// ============================================================================
// Currency & Equipment
// ============================================================================

export interface Currency {
  copper: number;
  silver: number;
  electrum: number;
  gold: number;
  platinum: number;
}

export interface Equipment {
  id: string;
  name: string;
  quantity: number;
  weight?: number;
  description?: string;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  source: string; // e.g., "Class", "Race", "Feat"
}

// ============================================================================
// Character Details
// ============================================================================

export interface CharacterDetails {
  age: number;
  height: string;
  weight: string;
  eyes: string;
  skin: string;
  hair: string;
  appearance: string; // Long text
  backstory: string; // Long text
  alliesAndOrganizations: string;
  additionalFeatures: string;
  treasure: string;
  symbolImageUrl?: string;
}

export interface PersonalityTraits {
  traits: string;
  ideals: string;
  bonds: string;
  flaws: string;
}

// ============================================================================
// Spellcasting
// ============================================================================

export interface Spell {
  id: string;
  name: string;
  prepared: boolean;
  level: number;
}

export interface SpellSlotLevel {
  level: number; // 1-9
  total: number;
  expended: number;
  spells: Spell[];
}

export interface Spellcasting {
  spellcastingClass: string;
  spellcastingAbility: AttributeName;
  spellSaveDC: number; // 8 + proficiency + ability modifier
  spellAttackBonus: number; // proficiency + ability modifier
  cantrips: Spell[];
  spellSlots: SpellSlotLevel[];
}

// ============================================================================
// Main Character Interface
// ============================================================================

export interface Character {
  // Basic Info
  id: string;
  characterName: string;
  playerName: string;
  race: Race;
  class: CharacterClass;
  level: number;
  background: string;
  alignment: Alignment;
  experiencePoints: number;

  // Attributes
  attributes: Attributes;

  // Combat Stats
  combat: CombatStats;

  // Skills & Proficiencies
  skills: SkillSet;
  savingThrows: SavingThrows;
  proficiencyBonus: number;
  inspiration: boolean;

  // Character Details
  details: CharacterDetails;

  // Personality
  personality: PersonalityTraits;

  // Equipment & Resources
  equipment: Equipment[];
  currency: Currency;

  // Features & Traits
  features: Feature[];
  proficiencies: string[];
  languages: string[];

  // Spellcasting (optional)
  spellcasting?: Spellcasting;

  // Attacks
  attacks: Attack[];

  // Passive Wisdom (Perception) - Auto-calculated
  passiveWisdomPerception: number;
}

// ============================================================================
// Utility Types
// ============================================================================

export type PartialCharacter = Partial<Character>;

export interface CharacterValidationError {
  field: string;
  message: string;
}

export interface CharacterValidationResult {
  valid: boolean;
  errors: CharacterValidationError[];
}
