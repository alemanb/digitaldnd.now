// ============================================================================
// BasicInfoTab - Character basic information, attributes, and proficiency
// ============================================================================

import React from "react";
import { Card } from "@/components/ui/card";
import { TextInput, SelectInput, NumberInput, CheckboxInput } from "@/components/form-fields";
import { AttributesGrid } from "@/components/character-sheet-sections";
import { useCharacter } from "@/hooks/useCharacter";
import { useCalculations } from "@/hooks/useCalculations";
import { getAllRaces, getAllClasses, getAllAlignments } from "@/utils/defaults";
import type { SelectOption } from "@/components/form-fields";

// ============================================================================
// BasicInfoTab Component
// ============================================================================

export const BasicInfoTab: React.FC = () => {
  const { character, updateBasicInfo, updateRace, updateClass, updateAlignment, updateLevel, toggleInspiration } = useCharacter();
  const { proficiencyBonus } = useCalculations();

  // ============================================================================
  // Prepare select options
  // ============================================================================

  const raceOptions: SelectOption[] = getAllRaces().map((race) => ({
    value: race,
    label: race,
  }));

  const classOptions: SelectOption[] = getAllClasses().map((classType) => ({
    value: classType,
    label: classType,
  }));

  const alignmentOptions: SelectOption[] = getAllAlignments().map((alignment) => ({
    value: alignment,
    label: alignment,
  }));

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Character Header Info */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Character Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TextInput
            label="Character Name"
            value={character.characterName}
            onChange={(value) => updateBasicInfo("characterName", value)}
            placeholder="Enter character name"
            maxLength={50}
            required
          />
          <TextInput
            label="Player Name"
            value={character.playerName}
            onChange={(value) => updateBasicInfo("playerName", value)}
            placeholder="Enter player name"
            maxLength={50}
          />
          <SelectInput
            label="Race"
            value={character.race}
            onChange={(value) => updateRace(value as any)}
            options={raceOptions}
            required
          />
          <SelectInput
            label="Class"
            value={character.class}
            onChange={(value) => updateClass(value as any)}
            options={classOptions}
            required
          />
          <NumberInput
            label="Level"
            value={character.level}
            onChange={(value) => updateLevel(value)}
            min={1}
            max={20}
            required
          />
          <SelectInput
            label="Alignment"
            value={character.alignment}
            onChange={(value) => updateAlignment(value as any)}
            options={alignmentOptions}
          />
          <TextInput
            label="Background"
            value={character.background}
            onChange={(value) => updateBasicInfo("background", value)}
            placeholder="e.g., Acolyte, Criminal"
            maxLength={50}
          />
          <NumberInput
            label="Experience Points"
            value={character.experiencePoints}
            onChange={(value) => updateBasicInfo("experiencePoints", value)}
            min={0}
            placeholder="0"
          />
        </div>
      </Card>

      {/* Attributes Grid */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Ability Scores</h3>
        <AttributesGrid />
      </Card>

      {/* Proficiency & Inspiration */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Proficiency & Inspiration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Proficiency Bonus Display */}
          <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground mb-2">Proficiency Bonus</span>
            <span className="text-4xl font-bold">+{proficiencyBonus}</span>
            <span className="text-xs text-muted-foreground mt-1">
              Auto-calculated from level
            </span>
          </div>

          {/* Inspiration Toggle */}
          <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
            <CheckboxInput
              label="Inspiration"
              checked={character.inspiration}
              onChange={toggleInspiration}
              description="You have inspiration from the DM"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
