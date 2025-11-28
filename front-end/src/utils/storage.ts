// ============================================================================
// LocalStorage Utilities for Character Data Persistence
// ============================================================================

import type { Character } from "@/types/character";

// ============================================================================
// Storage Keys
// ============================================================================

const STORAGE_KEYS = {
  CHARACTER: "dnd-character",
  CHARACTER_LIST: "dnd-character-list",
  LAST_SAVED: "dnd-last-saved",
} as const;

// ============================================================================
// Storage Functions
// ============================================================================

/**
 * Save character to localStorage
 */
export const saveCharacter = (character: Character): boolean => {
  try {
    const serialized = JSON.stringify(character);
    localStorage.setItem(STORAGE_KEYS.CHARACTER, serialized);
    localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());
    return true;
  } catch (error) {
    console.error("Failed to save character:", error);
    return false;
  }
};

/**
 * Load character from localStorage
 */
export const loadCharacter = (): Character | null => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEYS.CHARACTER);
    if (!serialized) {
      return null;
    }
    return JSON.parse(serialized) as Character;
  } catch (error) {
    console.error("Failed to load character:", error);
    return null;
  }
};

/**
 * Clear character from localStorage
 */
export const clearCharacter = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CHARACTER);
    localStorage.removeItem(STORAGE_KEYS.LAST_SAVED);
    return true;
  } catch (error) {
    console.error("Failed to clear character:", error);
    return false;
  }
};

/**
 * Get last saved timestamp
 */
export const getLastSavedTime = (): Date | null => {
  try {
    const timestamp = localStorage.getItem(STORAGE_KEYS.LAST_SAVED);
    return timestamp ? new Date(timestamp) : null;
  } catch (error) {
    console.error("Failed to get last saved time:", error);
    return null;
  }
};

/**
 * Export character as JSON file
 */
export const exportCharacterToJSON = (character: Character): void => {
  const dataStr = JSON.stringify(character, null, 2);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  const exportFileDefaultName = `${character.characterName.replace(
    /\s+/g,
    "_"
  )}_character.json`;

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
};

/**
 * Import character from JSON file
 */
export const importCharacterFromJSON = (
  file: File
): Promise<Character> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const result = event.target?.result;
        if (typeof result === "string") {
          const character = JSON.parse(result) as Character;
          resolve(character);
        } else {
          reject(new Error("Invalid file content"));
        }
      } catch (error) {
        reject(new Error("Failed to parse character data"));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsText(file);
  });
};

/**
 * Check if localStorage is available
 */
export const isStorageAvailable = (): boolean => {
  try {
    const test = "__storage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get storage usage information
 */
export const getStorageInfo = (): {
  used: number;
  available: boolean;
} => {
  const available = isStorageAvailable();
  let used = 0;

  if (available) {
    try {
      const serialized = localStorage.getItem(STORAGE_KEYS.CHARACTER);
      used = serialized ? new Blob([serialized]).size : 0;
    } catch (error) {
      console.error("Failed to calculate storage usage:", error);
    }
  }

  return { used, available };
};
