// ============================================================================
// CharacterSheetHeader - Character sheet header with save info
// ============================================================================

import React from "react";
import { useCharacterContext } from "@/contexts/CharacterContext";
import { cn } from "@/lib/utils";

// ============================================================================
// CharacterSheetHeader Component
// ============================================================================

export const CharacterSheetHeader: React.FC = () => {
  const { character, lastSaved } = useCharacterContext();

  // ============================================================================
  // Format last saved time
  // ============================================================================

  const formatLastSaved = () => {
    if (!lastSaved) return "Never saved";

    const now = new Date();
    const diff = now.getTime() - lastSaved.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return lastSaved.toLocaleDateString();
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="border-b p-4 sm:p-6 space-y-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {character.characterName || "Unnamed Character"}
        </h1>
        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5 transition-all duration-200">
            <span className={cn(
              "h-2 w-2 rounded-full transition-all duration-300",
              lastSaved ? "bg-green-500 animate-pulse" : "bg-yellow-500"
            )} />
            <span className="font-medium">{formatLastSaved()}</span>
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-1 text-xs sm:text-sm text-muted-foreground">
        <span className="font-medium">Level {character.level} {character.race} {character.class}</span>
        {character.playerName && <span>Player: {character.playerName}</span>}
      </div>
    </div>
  );
};
