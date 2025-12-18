// ============================================================================
// CharacterSheetHeader - Character sheet header with save info
// ============================================================================

import React from "react";
import { UserButton } from "@clerk/clerk-react";
import { useCharacterContext } from "@/contexts/CharacterContext";

// ============================================================================
// CharacterSheetHeader Component
// ============================================================================

export const CharacterSheetHeader: React.FC = () => {
  const { character } = useCharacterContext();

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="border-b p-4 sm:p-6 space-y-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {character.characterName || "Unnamed Character"}
        </h1>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-12 h-12",
            }
          }}
        />
      </div>
      <div className="flex flex-col gap-1 text-xs sm:text-sm text-muted-foreground">
        <span className="font-medium">Level {character.level} {character.race} {character.class}</span>
        {character.playerName && <span>Player: {character.playerName}</span>}
      </div>
    </div>
  );
};
