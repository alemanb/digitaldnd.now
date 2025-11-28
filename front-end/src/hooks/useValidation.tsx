// ============================================================================
// useValidation Hook - Field Validation
// ============================================================================

import { useCallback, useState } from "react";
import {
  validateField,
  validationRules,
  isValidAttributeScore,
  isValidLevel,
  isValidDeathSaves,
  sanitizeNumber,
  sanitizeString,
} from "@/utils/validation";
import type { CharacterValidationError } from "@/types/character";

// ============================================================================
// Types
// ============================================================================

interface ValidationState {
  errors: Record<string, string>;
  isValid: boolean;
}

// ============================================================================
// Hook
// ============================================================================

export const useValidation = () => {
  const [validationState, setValidationState] = useState<ValidationState>({
    errors: {},
    isValid: true,
  });

  // ============================================================================
  // Validate Single Field
  // ============================================================================

  const validateSingleField = useCallback(
    (fieldName: string, value: unknown): string | null => {
      const rules = validationRules[fieldName];
      if (!rules) {
        return null;
      }

      return validateField(fieldName, value, rules);
    },
    []
  );

  // ============================================================================
  // Validate and Set Error
  // ============================================================================

  const validateAndSetError = useCallback(
    (fieldName: string, value: unknown): boolean => {
      const error = validateSingleField(fieldName, value);

      setValidationState((prev) => {
        const newErrors = { ...prev.errors };

        if (error) {
          newErrors[fieldName] = error;
        } else {
          delete newErrors[fieldName];
        }

        return {
          errors: newErrors,
          isValid: Object.keys(newErrors).length === 0,
        };
      });

      return error === null;
    },
    [validateSingleField]
  );

  // ============================================================================
  // Clear Error
  // ============================================================================

  const clearError = useCallback((fieldName: string) => {
    setValidationState((prev) => {
      const newErrors = { ...prev.errors };
      delete newErrors[fieldName];

      return {
        errors: newErrors,
        isValid: Object.keys(newErrors).length === 0,
      };
    });
  }, []);

  // ============================================================================
  // Clear All Errors
  // ============================================================================

  const clearAllErrors = useCallback(() => {
    setValidationState({
      errors: {},
      isValid: true,
    });
  }, []);

  // ============================================================================
  // Get Error for Field
  // ============================================================================

  const getError = useCallback(
    (fieldName: string): string | undefined => {
      return validationState.errors[fieldName];
    },
    [validationState.errors]
  );

  // ============================================================================
  // Has Error
  // ============================================================================

  const hasError = useCallback(
    (fieldName: string): boolean => {
      return fieldName in validationState.errors;
    },
    [validationState.errors]
  );

  // ============================================================================
  // Validate Multiple Fields
  // ============================================================================

  const validateFields = useCallback(
    (fields: Record<string, unknown>): CharacterValidationError[] => {
      const errors: CharacterValidationError[] = [];

      Object.entries(fields).forEach(([fieldName, value]) => {
        const error = validateSingleField(fieldName, value);
        if (error) {
          errors.push({ field: fieldName, message: error });
        }
      });

      return errors;
    },
    [validateSingleField]
  );

  // ============================================================================
  // Specific Validators
  // ============================================================================

  const validateAttributeScore = useCallback((score: number): boolean => {
    return isValidAttributeScore(score);
  }, []);

  const validateLevel = useCallback((level: number): boolean => {
    return isValidLevel(level);
  }, []);

  const validateDeathSaves = useCallback((count: number): boolean => {
    return isValidDeathSaves(count);
  }, []);

  // ============================================================================
  // Sanitizers
  // ============================================================================

  const sanitizeNumberInput = useCallback(
    (value: string | number, min?: number, max?: number): number => {
      return sanitizeNumber(value, min, max);
    },
    []
  );

  const sanitizeStringInput = useCallback(
    (value: string, maxLength?: number): string => {
      return sanitizeString(value, maxLength);
    },
    []
  );

  // ============================================================================
  // Validate with Sanitization
  // ============================================================================

  const validateAndSanitizeNumber = useCallback(
    (
      fieldName: string,
      value: string | number,
      min?: number,
      max?: number
    ): { value: number; error: string | null } => {
      const sanitized = sanitizeNumber(value, min, max);
      const error = validateSingleField(fieldName, sanitized);

      if (error) {
        setValidationState((prev) => ({
          errors: { ...prev.errors, [fieldName]: error },
          isValid: false,
        }));
      } else {
        clearError(fieldName);
      }

      return { value: sanitized, error };
    },
    [validateSingleField, clearError]
  );

  const validateAndSanitizeString = useCallback(
    (
      fieldName: string,
      value: string,
      maxLength?: number
    ): { value: string; error: string | null } => {
      const sanitized = sanitizeString(value, maxLength);
      const error = validateSingleField(fieldName, sanitized);

      if (error) {
        setValidationState((prev) => ({
          errors: { ...prev.errors, [fieldName]: error },
          isValid: false,
        }));
      } else {
        clearError(fieldName);
      }

      return { value: sanitized, error };
    },
    [validateSingleField, clearError]
  );

  // ============================================================================
  // Return API
  // ============================================================================

  return {
    // Validation state
    errors: validationState.errors,
    isValid: validationState.isValid,

    // Single field validation
    validateSingleField,
    validateAndSetError,

    // Error management
    clearError,
    clearAllErrors,
    getError,
    hasError,

    // Multiple fields validation
    validateFields,

    // Specific validators
    validateAttributeScore,
    validateLevel,
    validateDeathSaves,

    // Sanitizers
    sanitizeNumberInput,
    sanitizeStringInput,

    // Validate with sanitization
    validateAndSanitizeNumber,
    validateAndSanitizeString,
  };
};
