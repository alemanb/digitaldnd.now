// ============================================================================
// validation.ts - Unit Tests
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  isValidAttributeScore,
  isValidLevel,
  sanitizeNumber,
  sanitizeString,
} from '../validation';

describe('validation.ts', () => {
  // ============================================================================
  // Attribute Score Validation
  // ============================================================================

  describe('isValidAttributeScore', () => {
    it('should accept valid scores (1-30)', () => {
      expect(isValidAttributeScore(1)).toBe(true);
      expect(isValidAttributeScore(10)).toBe(true);
      expect(isValidAttributeScore(20)).toBe(true);
      expect(isValidAttributeScore(30)).toBe(true);
    });

    it('should reject scores below 1', () => {
      expect(isValidAttributeScore(0)).toBe(false);
      expect(isValidAttributeScore(-1)).toBe(false);
      expect(isValidAttributeScore(-10)).toBe(false);
    });

    it('should reject scores above 30', () => {
      expect(isValidAttributeScore(31)).toBe(false);
      expect(isValidAttributeScore(40)).toBe(false);
      expect(isValidAttributeScore(100)).toBe(false);
    });
  });

  // ============================================================================
  // Level Validation
  // ============================================================================

  describe('isValidLevel', () => {
    it('should accept valid levels (1-20)', () => {
      expect(isValidLevel(1)).toBe(true);
      expect(isValidLevel(10)).toBe(true);
      expect(isValidLevel(20)).toBe(true);
    });

    it('should reject levels below 1', () => {
      expect(isValidLevel(0)).toBe(false);
      expect(isValidLevel(-1)).toBe(false);
    });

    it('should reject levels above 20', () => {
      expect(isValidLevel(21)).toBe(false);
      expect(isValidLevel(30)).toBe(false);
    });
  });

  // ============================================================================
  // Number Sanitization
  // ============================================================================

  describe('sanitizeNumber', () => {
    it('should keep valid numbers within range', () => {
      expect(sanitizeNumber(5, 1, 10)).toBe(5);
      expect(sanitizeNumber(1, 1, 10)).toBe(1);
      expect(sanitizeNumber(10, 1, 10)).toBe(10);
    });

    it('should clamp numbers below minimum', () => {
      expect(sanitizeNumber(0, 1, 10)).toBe(1);
      expect(sanitizeNumber(-5, 1, 10)).toBe(1);
    });

    it('should clamp numbers above maximum', () => {
      expect(sanitizeNumber(15, 1, 10)).toBe(10);
      expect(sanitizeNumber(100, 1, 10)).toBe(10);
    });

    it('should work without min/max constraints', () => {
      expect(sanitizeNumber(5)).toBe(5);
      expect(sanitizeNumber(-10)).toBe(-10);
      expect(sanitizeNumber(100)).toBe(100);
    });

    it('should handle NaN values', () => {
      expect(sanitizeNumber(NaN, 1, 10)).toBe(1);
    });

    it('should handle non-finite values', () => {
      expect(sanitizeNumber(Infinity, 1, 10)).toBe(10);
      expect(sanitizeNumber(-Infinity, 1, 10)).toBe(1);
    });
  });

  // ============================================================================
  // String Sanitization
  // ============================================================================

  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
      expect(sanitizeString('\n\ttab\n\t')).toBe('tab');
    });

    it('should respect max length', () => {
      expect(sanitizeString('hello world', 5)).toBe('hello');
      expect(sanitizeString('test', 10)).toBe('test');
    });

    it('should handle empty strings', () => {
      expect(sanitizeString('')).toBe('');
      expect(sanitizeString('   ')).toBe('');
    });

    it('should handle special characters', () => {
      expect(sanitizeString('hello@world')).toBe('hello@world');
      expect(sanitizeString('test-123')).toBe('test-123');
    });
  });
});
