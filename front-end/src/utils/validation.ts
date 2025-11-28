// ============================================================================
// D&D 5e Validation Utilities
// ============================================================================

import type { CharacterValidationError } from "@/types/character";

// ============================================================================
// Validation Rule Types
// ============================================================================

interface ValidationRule {
  required?: boolean;
  type?: "string" | "number" | "boolean";
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: unknown) => boolean;
}

// ============================================================================
// Field Validation Rules
// ============================================================================

export const validationRules: Record<string, ValidationRule> = {
  characterName: {
    required: true,
    type: "string",
    minLength: 1,
    maxLength: 50,
  },
  playerName: {
    required: true,
    type: "string",
    minLength: 1,
    maxLength: 50,
  },
  attributeScore: {
    required: true,
    type: "number",
    min: 1,
    max: 30,
  },
  level: {
    required: true,
    type: "number",
    min: 1,
    max: 20,
  },
  hitPoints: {
    required: true,
    type: "number",
    min: 0,
  },
  armorClass: {
    required: true,
    type: "number",
    min: 0,
    max: 30,
  },
  initiative: {
    type: "number",
  },
  speed: {
    required: true,
    type: "number",
    min: 0,
    max: 120,
  },
  deathSaves: {
    type: "number",
    min: 0,
    max: 3,
  },
  spellSlots: {
    type: "number",
    min: 0,
  },
  experiencePoints: {
    type: "number",
    min: 0,
  },
  currency: {
    type: "number",
    min: 0,
  },
};

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate a single field against a rule
 */
export const validateField = (
  fieldName: string,
  value: unknown,
  rules: ValidationRule
): string | null => {
  // Required check
  if (rules.required && (value === null || value === undefined || value === "")) {
    return `${fieldName} is required`;
  }

  // Skip other validations if value is empty and not required
  if (!rules.required && (value === null || value === undefined || value === "")) {
    return null;
  }

  // Type check
  if (rules.type === "number") {
    const num = Number(value);
    if (isNaN(num)) {
      return `${fieldName} must be a number`;
    }

    // Min/Max checks
    if (rules.min !== undefined && num < rules.min) {
      return `${fieldName} must be at least ${rules.min}`;
    }
    if (rules.max !== undefined && num > rules.max) {
      return `${fieldName} must be at most ${rules.max}`;
    }
  }

  if (rules.type === "string" && typeof value === "string") {
    // MinLength/MaxLength checks
    if (rules.minLength !== undefined && value.length < rules.minLength) {
      return `${fieldName} must be at least ${rules.minLength} characters`;
    }
    if (rules.maxLength !== undefined && value.length > rules.maxLength) {
      return `${fieldName} must be at most ${rules.maxLength} characters`;
    }

    // Pattern check
    if (rules.pattern && !rules.pattern.test(value)) {
      return `${fieldName} has invalid format`;
    }
  }

  // Custom validation
  if (rules.custom && !rules.custom(value)) {
    return `${fieldName} is invalid`;
  }

  return null;
};

/**
 * Validate multiple fields
 */
export const validateFields = (
  fields: Record<string, unknown>
): CharacterValidationError[] => {
  const errors: CharacterValidationError[] = [];

  for (const [fieldName, value] of Object.entries(fields)) {
    const rules = validationRules[fieldName];
    if (!rules) continue;

    const error = validateField(fieldName, value, rules);
    if (error) {
      errors.push({ field: fieldName, message: error });
    }
  }

  return errors;
};

/**
 * Check if a value is within a range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max;
};

/**
 * Validate attribute score (1-30)
 */
export const isValidAttributeScore = (score: number): boolean => {
  return isInRange(score, 1, 30);
};

/**
 * Validate character level (1-20)
 */
export const isValidLevel = (level: number): boolean => {
  return isInRange(level, 1, 20);
};

/**
 * Validate death saves (0-3)
 */
export const isValidDeathSaves = (count: number): boolean => {
  return isInRange(count, 0, 3);
};

/**
 * Validate spell slot count (0 or positive)
 */
export const isValidSpellSlots = (slots: number): boolean => {
  return slots >= 0;
};

/**
 * Sanitize numeric input
 */
export const sanitizeNumber = (
  value: string | number,
  min?: number,
  max?: number
): number => {
  let num = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(num)) {
    num = min ?? 0;
  }

  if (min !== undefined && num < min) {
    num = min;
  }

  if (max !== undefined && num > max) {
    num = max;
  }

  return num;
};

/**
 * Sanitize string input
 */
export const sanitizeString = (
  value: string,
  maxLength?: number
): string => {
  let sanitized = value.trim();

  if (maxLength !== undefined && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
};
