// ============================================================================
// calculations.ts - Unit Tests
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  calculateModifier,
  createAttributeScore,
  updateAttributeScore,
  calculateProficiencyBonus,
  calculateSkillBonus,
  calculateSpellSaveDC,
  calculateSpellAttackBonus,
  calculateInitiative,
} from '../calculations';

describe('calculations.ts', () => {
  // ============================================================================
  // Attribute Calculations
  // ============================================================================

  describe('calculateModifier', () => {
    it('should calculate correct modifier for score 10', () => {
      expect(calculateModifier(10)).toBe(0);
    });

    it('should calculate correct modifier for score 8', () => {
      expect(calculateModifier(8)).toBe(-1);
    });

    it('should calculate correct modifier for score 20', () => {
      expect(calculateModifier(20)).toBe(5);
    });

    it('should calculate correct modifier for score 1', () => {
      expect(calculateModifier(1)).toBe(-5);
    });

    it('should calculate correct modifier for score 30', () => {
      expect(calculateModifier(30)).toBe(10);
    });

    it('should handle odd numbers correctly', () => {
      expect(calculateModifier(15)).toBe(2);
      expect(calculateModifier(9)).toBe(-1);
    });
  });

  describe('createAttributeScore', () => {
    it('should create AttributeScore with correct modifier', () => {
      const result = createAttributeScore(16);
      expect(result).toEqual({
        score: 16,
        modifier: 3,
      });
    });

    it('should handle minimum score', () => {
      const result = createAttributeScore(1);
      expect(result).toEqual({
        score: 1,
        modifier: -5,
      });
    });

    it('should handle maximum score', () => {
      const result = createAttributeScore(30);
      expect(result).toEqual({
        score: 30,
        modifier: 10,
      });
    });
  });

  describe('updateAttributeScore', () => {
    it('should update score and recalculate modifier', () => {
      const result = updateAttributeScore(18);
      expect(result).toEqual({
        score: 18,
        modifier: 4,
      });
    });
  });

  // ============================================================================
  // Proficiency Calculations
  // ============================================================================

  describe('calculateProficiencyBonus', () => {
    it('should calculate +2 for level 1', () => {
      expect(calculateProficiencyBonus(1)).toBe(2);
    });

    it('should calculate +2 for levels 1-4', () => {
      expect(calculateProficiencyBonus(1)).toBe(2);
      expect(calculateProficiencyBonus(2)).toBe(2);
      expect(calculateProficiencyBonus(3)).toBe(2);
      expect(calculateProficiencyBonus(4)).toBe(2);
    });

    it('should calculate +3 for levels 5-8', () => {
      expect(calculateProficiencyBonus(5)).toBe(3);
      expect(calculateProficiencyBonus(6)).toBe(3);
      expect(calculateProficiencyBonus(7)).toBe(3);
      expect(calculateProficiencyBonus(8)).toBe(3);
    });

    it('should calculate +4 for levels 9-12', () => {
      expect(calculateProficiencyBonus(9)).toBe(4);
      expect(calculateProficiencyBonus(12)).toBe(4);
    });

    it('should calculate +5 for levels 13-16', () => {
      expect(calculateProficiencyBonus(13)).toBe(5);
      expect(calculateProficiencyBonus(16)).toBe(5);
    });

    it('should calculate +6 for levels 17-20', () => {
      expect(calculateProficiencyBonus(17)).toBe(6);
      expect(calculateProficiencyBonus(20)).toBe(6);
    });
  });

  // ============================================================================
  // Skill Calculations
  // ============================================================================

  describe('calculateSkillBonus', () => {
    it('should calculate bonus without proficiency', () => {
      const result = calculateSkillBonus(3, 2, false, false);
      expect(result).toBe(3);
    });

    it('should calculate bonus with proficiency', () => {
      const result = calculateSkillBonus(3, 2, true, false);
      expect(result).toBe(5); // 3 + 2
    });

    it('should calculate bonus with expertise', () => {
      const result = calculateSkillBonus(3, 2, true, true);
      expect(result).toBe(7); // 3 + (2 * 2)
    });

    it('should not apply expertise without proficiency', () => {
      const result = calculateSkillBonus(3, 2, false, true);
      expect(result).toBe(3); // expertise requires proficiency
    });

    it('should handle negative modifiers', () => {
      const result = calculateSkillBonus(-1, 2, true, false);
      expect(result).toBe(1); // -1 + 2
    });

    it('should handle zero modifier', () => {
      const result = calculateSkillBonus(0, 3, true, false);
      expect(result).toBe(3);
    });
  });

  // ============================================================================
  // Combat Calculations
  // ============================================================================

  describe('calculateInitiative', () => {
    it('should equal dexterity modifier', () => {
      expect(calculateInitiative(3)).toBe(3);
      expect(calculateInitiative(-1)).toBe(-1);
      expect(calculateInitiative(0)).toBe(0);
    });
  });

  // ============================================================================
  // Spellcasting Calculations
  // ============================================================================

  describe('calculateSpellSaveDC', () => {
    it('should calculate spell save DC correctly', () => {
      const result = calculateSpellSaveDC(3, 4);
      expect(result).toBe(15); // 8 + 3 + 4
    });

    it('should handle +0 ability modifier', () => {
      const result = calculateSpellSaveDC(2, 0);
      expect(result).toBe(10); // 8 + 2 + 0
    });

    it('should handle negative ability modifier', () => {
      const result = calculateSpellSaveDC(2, -1);
      expect(result).toBe(9); // 8 + 2 + (-1)
    });
  });

  describe('calculateSpellAttackBonus', () => {
    it('should calculate spell attack bonus correctly', () => {
      const result = calculateSpellAttackBonus(3, 4);
      expect(result).toBe(7); // 3 + 4
    });

    it('should handle +0 ability modifier', () => {
      const result = calculateSpellAttackBonus(2, 0);
      expect(result).toBe(2);
    });

    it('should handle negative ability modifier', () => {
      const result = calculateSpellAttackBonus(2, -1);
      expect(result).toBe(1); // 2 + (-1)
    });
  });
});
