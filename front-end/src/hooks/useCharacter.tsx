// ============================================================================
// useCharacter Hook - Character Data Management
// ============================================================================

import { useCallback } from "react";
import { useCharacterContext } from "@/contexts/CharacterContext";
import type {
  Character,
  AttributeName,
  SkillName,
  Attack,
  Equipment,
  Feature,
  Spell,
  Race,
  CharacterClass,
  Alignment,
} from "@/types/character";
import { createAttributeScore } from "@/utils/calculations";

// ============================================================================
// Hook
// ============================================================================

export const useCharacter = () => {
  const {
    character,
    updateCharacter,
    resetCharacter,
    loadCharacterFromStorage,
    saveCharacterToStorage,
    isLoading,
    lastSaved,
  } = useCharacterContext();

  // ============================================================================
  // Basic Info Updates
  // ============================================================================

  const updateBasicInfo = useCallback(
    (field: keyof Pick<Character, "characterName" | "playerName" | "background" | "experiencePoints" | "level">, value: string | number) => {
      updateCharacter({ [field]: value });
    },
    [updateCharacter]
  );

  const updateRace = useCallback(
    (race: Race) => {
      updateCharacter({ race });
    },
    [updateCharacter]
  );

  const updateClass = useCallback(
    (characterClass: CharacterClass) => {
      updateCharacter({ class: characterClass });
    },
    [updateCharacter]
  );

  const updateAlignment = useCallback(
    (alignment: Alignment) => {
      updateCharacter({ alignment });
    },
    [updateCharacter]
  );

  const updateLevel = useCallback(
    (level: number) => {
      updateCharacter({ level });
    },
    [updateCharacter]
  );

  // ============================================================================
  // Attribute Updates
  // ============================================================================

  const updateAttributeScore = useCallback(
    (attribute: AttributeName, score: number) => {
      const newAttributeScore = createAttributeScore(score);
      updateCharacter({
        attributes: {
          ...character.attributes,
          [attribute]: newAttributeScore,
        },
      });
    },
    [character.attributes, updateCharacter]
  );

  // ============================================================================
  // Combat Stats Updates
  // ============================================================================

  const updateCombatStat = useCallback(
    (field: keyof Character["combat"], value: number) => {
      updateCharacter({
        combat: {
          ...character.combat,
          [field]: value,
        },
      });
    },
    [character.combat, updateCharacter]
  );

  const updateHitPoints = useCallback(
    (type: "current" | "maximum" | "temporary", value: number) => {
      const field =
        type === "current"
          ? "currentHitPoints"
          : type === "maximum"
          ? "hitPointMaximum"
          : "temporaryHitPoints";

      updateCharacter({
        combat: {
          ...character.combat,
          [field]: value,
        },
      });
    },
    [character.combat, updateCharacter]
  );

  const updateDeathSaves = useCallback(
    (type: "successes" | "failures", value: number) => {
      updateCharacter({
        combat: {
          ...character.combat,
          deathSaves: {
            ...character.combat.deathSaves,
            [type]: value,
          },
        },
      });
    },
    [character.combat, updateCharacter]
  );

  // ============================================================================
  // Skill Updates
  // ============================================================================

  const toggleSkillProficiency = useCallback(
    (skill: SkillName) => {
      updateCharacter({
        skills: {
          ...character.skills,
          [skill]: {
            ...character.skills[skill],
            proficient: !character.skills[skill].proficient,
          },
        },
      });
    },
    [character.skills, updateCharacter]
  );

  const toggleSkillExpertise = useCallback(
    (skill: SkillName) => {
      updateCharacter({
        skills: {
          ...character.skills,
          [skill]: {
            ...character.skills[skill],
            expertise: !character.skills[skill].expertise,
          },
        },
      });
    },
    [character.skills, updateCharacter]
  );

  // ============================================================================
  // Saving Throw Updates
  // ============================================================================

  const toggleSavingThrowProficiency = useCallback(
    (attribute: AttributeName) => {
      updateCharacter({
        savingThrows: {
          ...character.savingThrows,
          [attribute]: {
            ...character.savingThrows[attribute],
            proficient: !character.savingThrows[attribute].proficient,
          },
        },
      });
    },
    [character.savingThrows, updateCharacter]
  );

  // ============================================================================
  // Proficiencies & Languages
  // ============================================================================

  const addProficiency = useCallback(
    (proficiency: string) => {
      if (!character.proficiencies.includes(proficiency)) {
        updateCharacter({
          proficiencies: [...character.proficiencies, proficiency],
        });
      }
    },
    [character.proficiencies, updateCharacter]
  );

  const removeProficiency = useCallback(
    (proficiency: string) => {
      updateCharacter({
        proficiencies: character.proficiencies.filter((p) => p !== proficiency),
      });
    },
    [character.proficiencies, updateCharacter]
  );

  const addLanguage = useCallback(
    (language: string) => {
      if (!character.languages.includes(language)) {
        updateCharacter({
          languages: [...character.languages, language],
        });
      }
    },
    [character.languages, updateCharacter]
  );

  const removeLanguage = useCallback(
    (language: string) => {
      updateCharacter({
        languages: character.languages.filter((l) => l !== language),
      });
    },
    [character.languages, updateCharacter]
  );

  // ============================================================================
  // Equipment Management
  // ============================================================================

  const addEquipment = useCallback(
    (equipment: Equipment) => {
      updateCharacter({
        equipment: [...character.equipment, equipment],
      });
    },
    [character.equipment, updateCharacter]
  );

  const updateEquipment = useCallback(
    (id: string, updates: Partial<Equipment>) => {
      updateCharacter({
        equipment: character.equipment.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        ),
      });
    },
    [character.equipment, updateCharacter]
  );

  const removeEquipment = useCallback(
    (id: string) => {
      updateCharacter({
        equipment: character.equipment.filter((item) => item.id !== id),
      });
    },
    [character.equipment, updateCharacter]
  );

  // ============================================================================
  // Currency Management
  // ============================================================================

  const updateCurrency = useCallback(
    (type: keyof Character["currency"], value: number) => {
      updateCharacter({
        currency: {
          ...character.currency,
          [type]: value,
        },
      });
    },
    [character.currency, updateCharacter]
  );

  // ============================================================================
  // Attack Management
  // ============================================================================

  const addAttack = useCallback(
    (attack: Attack) => {
      updateCharacter({
        attacks: [...character.attacks, attack],
      });
    },
    [character.attacks, updateCharacter]
  );

  const updateAttack = useCallback(
    (id: string, updates: Partial<Attack>) => {
      updateCharacter({
        attacks: character.attacks.map((attack) =>
          attack.id === id ? { ...attack, ...updates } : attack
        ),
      });
    },
    [character.attacks, updateCharacter]
  );

  const removeAttack = useCallback(
    (id: string) => {
      updateCharacter({
        attacks: character.attacks.filter((attack) => attack.id !== id),
      });
    },
    [character.attacks, updateCharacter]
  );

  // ============================================================================
  // Feature Management
  // ============================================================================

  const addFeature = useCallback(
    (feature: Feature) => {
      updateCharacter({
        features: [...character.features, feature],
      });
    },
    [character.features, updateCharacter]
  );

  const updateFeature = useCallback(
    (id: string, updates: Partial<Feature>) => {
      updateCharacter({
        features: character.features.map((feature) =>
          feature.id === id ? { ...feature, ...updates } : feature
        ),
      });
    },
    [character.features, updateCharacter]
  );

  const removeFeature = useCallback(
    (id: string) => {
      updateCharacter({
        features: character.features.filter((feature) => feature.id !== id),
      });
    },
    [character.features, updateCharacter]
  );

  // ============================================================================
  // Spell Management
  // ============================================================================

  const addSpell = useCallback(
    (spell: Spell, level: number) => {
      if (!character.spellcasting) return;

      if (level === 0) {
        // Cantrip
        updateCharacter({
          spellcasting: {
            ...character.spellcasting,
            cantrips: [...character.spellcasting.cantrips, spell],
          },
        });
      } else {
        // Leveled spell
        const slotIndex = character.spellcasting.spellSlots.findIndex(
          (slot) => slot.level === level
        );

        if (slotIndex === -1) return;

        const updatedSlots = [...character.spellcasting.spellSlots];
        updatedSlots[slotIndex] = {
          ...updatedSlots[slotIndex],
          spells: [...updatedSlots[slotIndex].spells, spell],
        };

        updateCharacter({
          spellcasting: {
            ...character.spellcasting,
            spellSlots: updatedSlots,
          },
        });
      }
    },
    [character.spellcasting, updateCharacter]
  );

  const removeSpell = useCallback(
    (spellId: string, level: number) => {
      if (!character.spellcasting) return;

      if (level === 0) {
        // Cantrip
        updateCharacter({
          spellcasting: {
            ...character.spellcasting,
            cantrips: character.spellcasting.cantrips.filter(
              (spell) => spell.id !== spellId
            ),
          },
        });
      } else {
        // Leveled spell
        const slotIndex = character.spellcasting.spellSlots.findIndex(
          (slot) => slot.level === level
        );

        if (slotIndex === -1) return;

        const updatedSlots = [...character.spellcasting.spellSlots];
        updatedSlots[slotIndex] = {
          ...updatedSlots[slotIndex],
          spells: updatedSlots[slotIndex].spells.filter(
            (spell) => spell.id !== spellId
          ),
        };

        updateCharacter({
          spellcasting: {
            ...character.spellcasting,
            spellSlots: updatedSlots,
          },
        });
      }
    },
    [character.spellcasting, updateCharacter]
  );

  const toggleSpellPrepared = useCallback(
    (spellId: string, level: number) => {
      if (!character.spellcasting) return;

      if (level === 0) {
        // Cantrip
        updateCharacter({
          spellcasting: {
            ...character.spellcasting,
            cantrips: character.spellcasting.cantrips.map((spell) =>
              spell.id === spellId
                ? { ...spell, prepared: !spell.prepared }
                : spell
            ),
          },
        });
      } else {
        // Leveled spell
        const slotIndex = character.spellcasting.spellSlots.findIndex(
          (slot) => slot.level === level
        );

        if (slotIndex === -1) return;

        const updatedSlots = [...character.spellcasting.spellSlots];
        updatedSlots[slotIndex] = {
          ...updatedSlots[slotIndex],
          spells: updatedSlots[slotIndex].spells.map((spell) =>
            spell.id === spellId
              ? { ...spell, prepared: !spell.prepared }
              : spell
          ),
        };

        updateCharacter({
          spellcasting: {
            ...character.spellcasting,
            spellSlots: updatedSlots,
          },
        });
      }
    },
    [character.spellcasting, updateCharacter]
  );

  const updateSpell = useCallback(
    (spellId: string, level: number, updates: Partial<Spell>) => {
      if (!character.spellcasting) return;

      if (level === 0) {
        // Cantrip
        updateCharacter({
          spellcasting: {
            ...character.spellcasting,
            cantrips: character.spellcasting.cantrips.map((spell) =>
              spell.id === spellId ? { ...spell, ...updates } : spell
            ),
          },
        });
      } else {
        // Leveled spell
        const slotIndex = character.spellcasting.spellSlots.findIndex(
          (slot) => slot.level === level
        );

        if (slotIndex === -1) return;

        const updatedSlots = [...character.spellcasting.spellSlots];
        updatedSlots[slotIndex] = {
          ...updatedSlots[slotIndex],
          spells: updatedSlots[slotIndex].spells.map((spell) =>
            spell.id === spellId ? { ...spell, ...updates } : spell
          ),
        };

        updateCharacter({
          spellcasting: {
            ...character.spellcasting,
            spellSlots: updatedSlots,
          },
        });
      }
    },
    [character.spellcasting, updateCharacter]
  );

  const updateSpellSlots = useCallback(
    (level: number, total: number, expended: number) => {
      if (!character.spellcasting) return;

      const slotIndex = character.spellcasting.spellSlots.findIndex(
        (slot) => slot.level === level
      );

      if (slotIndex === -1) return;

      const updatedSlots = [...character.spellcasting.spellSlots];
      updatedSlots[slotIndex] = {
        ...updatedSlots[slotIndex],
        total,
        expended,
      };

      updateCharacter({
        spellcasting: {
          ...character.spellcasting,
          spellSlots: updatedSlots,
        },
      });
    },
    [character.spellcasting, updateCharacter]
  );

  // ============================================================================
  // Character Details Updates
  // ============================================================================

  const updateDetails = useCallback(
    (field: keyof Character["details"], value: string | number) => {
      updateCharacter({
        details: {
          ...character.details,
          [field]: value,
        },
      });
    },
    [character.details, updateCharacter]
  );

  const updatePersonality = useCallback(
    (field: keyof Character["personality"], value: string) => {
      updateCharacter({
        personality: {
          ...character.personality,
          [field]: value,
        },
      });
    },
    [character.personality, updateCharacter]
  );

  // ============================================================================
  // Inspiration
  // ============================================================================

  const toggleInspiration = useCallback(() => {
    updateCharacter({
      inspiration: !character.inspiration,
    });
  }, [character.inspiration, updateCharacter]);

  // ============================================================================
  // Return API
  // ============================================================================

  return {
    // Character data
    character,
    isLoading,
    lastSaved,

    // Basic info
    updateBasicInfo,
    updateRace,
    updateClass,
    updateAlignment,
    updateLevel,

    // Attributes
    updateAttributeScore,

    // Combat
    updateCombatStat,
    updateHitPoints,
    updateDeathSaves,

    // Skills
    toggleSkillProficiency,
    toggleSkillExpertise,

    // Saving throws
    toggleSavingThrowProficiency,

    // Proficiencies & languages
    addProficiency,
    removeProficiency,
    addLanguage,
    removeLanguage,

    // Equipment
    addEquipment,
    updateEquipment,
    removeEquipment,

    // Currency
    updateCurrency,

    // Attacks
    addAttack,
    updateAttack,
    removeAttack,

    // Features
    addFeature,
    updateFeature,
    removeFeature,

    // Spells
    addSpell,
    updateSpell,
    removeSpell,
    toggleSpellPrepared,
    updateSpellSlots,

    // Details
    updateDetails,
    updatePersonality,

    // Inspiration
    toggleInspiration,

    // Storage
    resetCharacter,
    loadCharacterFromStorage,
    saveCharacterToStorage,
  };
};
