// ============================================================================
// Character Context - Global Character State Management
// ============================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import type { Character } from "@/types/character";
import { createBlankCharacter } from "@/utils/defaults";
import { saveCharacter, loadCharacter, getLastSavedTime } from "@/utils/storage";

// ============================================================================
// Context Types
// ============================================================================

interface CharacterContextType {
  character: Character;
  updateCharacter: (updates: Partial<Character>) => void;
  resetCharacter: () => void;
  loadCharacterFromStorage: () => void;
  saveCharacterToStorage: () => void;
  isLoading: boolean;
  lastSaved: Date | null;
}

// ============================================================================
// Context Creation
// ============================================================================

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

// ============================================================================
// Provider Props
// ============================================================================

interface CharacterProviderProps {
  children: React.ReactNode;
  autoSave?: boolean;
}

// ============================================================================
// Provider Component
// ============================================================================

export const CharacterProvider: React.FC<CharacterProviderProps> = ({
  children,
  autoSave = true,
}) => {
  const [character, setCharacter] = useState<Character>(createBlankCharacter());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // ============================================================================
  // Save to storage
  // ============================================================================

  const saveCharacterToStorage = useCallback(() => {
    const success = saveCharacter(character);
    if (success) {
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    }
  }, [character]);

  // ============================================================================
  // Load character on mount
  // ============================================================================

  useEffect(() => {
    const loadedCharacter = loadCharacter();
    const savedAt = getLastSavedTime();

    if (loadedCharacter) {
      setCharacter(loadedCharacter);
    }
    if (savedAt) {
      setLastSaved(savedAt);
    }

    setIsLoading(false);
  }, []);

  // ============================================================================
  // Auto-save effect
  // ============================================================================

  useEffect(() => {
    if (!autoSave || isLoading || !hasUnsavedChanges) return;
    saveCharacterToStorage();
  }, [autoSave, hasUnsavedChanges, isLoading, saveCharacterToStorage]);

  // ============================================================================
  // Update character
  // ============================================================================

  const updateCharacter = useCallback((updates: Partial<Character>) => {
    setCharacter((prev) => ({
      ...prev,
      ...updates,
    }));
    setHasUnsavedChanges(true);
  }, []);

  // ============================================================================
  // Reset character
  // ============================================================================

  const resetCharacter = useCallback(() => {
    setCharacter(createBlankCharacter());
    setLastSaved(null);
    setHasUnsavedChanges(true);
  }, []);

  // ============================================================================
  // Load from storage
  // ============================================================================

  const loadCharacterFromStorage = useCallback(() => {
    const loadedCharacter = loadCharacter();
    const savedAt = getLastSavedTime();

    if (loadedCharacter) {
      setCharacter(loadedCharacter);
    }
    setLastSaved(savedAt);
    setHasUnsavedChanges(false);
  }, []);

  // ============================================================================
  // Context Value
  // ============================================================================

  const value: CharacterContextType = {
    character,
    updateCharacter,
    resetCharacter,
    loadCharacterFromStorage,
    saveCharacterToStorage,
    isLoading,
    lastSaved,
  };

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
};

// ============================================================================
// Custom Hook
// ============================================================================

export const useCharacterContext = (): CharacterContextType => {
  const context = useContext(CharacterContext);
  if (context === undefined) {
    throw new Error("useCharacterContext must be used within a CharacterProvider");
  }
  return context;
};
