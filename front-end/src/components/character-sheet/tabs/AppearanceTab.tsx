// ============================================================================
// AppearanceTab - Physical appearance, backstory, and character details
// ============================================================================

import React from "react";
import { Card } from "@/components/ui/card";
import { TextInput, TextAreaInput } from "@/components/form-fields";
import { useCharacter } from "@/hooks/useCharacter";

// ============================================================================
// AppearanceTab Component
// ============================================================================

export const AppearanceTab: React.FC = () => {
  const { character, updateDetails } = useCharacter();

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Physical Attributes */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Physical Attributes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <TextInput
            label="Age"
            value={character.details.age?.toString() || ""}
            onChange={(value) => updateDetails("age", parseInt(value) || 0)}
            placeholder="e.g., 25"
          />
          <TextInput
            label="Height"
            value={character.details.height}
            onChange={(value) => updateDetails("height", value)}
            placeholder="e.g., 5'10&quot;"
            maxLength={20}
          />
          <TextInput
            label="Weight"
            value={character.details.weight}
            onChange={(value) => updateDetails("weight", value)}
            placeholder="e.g., 180 lbs"
            maxLength={20}
          />
          <TextInput
            label="Eyes"
            value={character.details.eyes}
            onChange={(value) => updateDetails("eyes", value)}
            placeholder="e.g., Blue"
            maxLength={30}
          />
          <TextInput
            label="Skin"
            value={character.details.skin}
            onChange={(value) => updateDetails("skin", value)}
            placeholder="e.g., Fair"
            maxLength={30}
          />
          <TextInput
            label="Hair"
            value={character.details.hair}
            onChange={(value) => updateDetails("hair", value)}
            placeholder="e.g., Brown"
            maxLength={30}
          />
        </div>
      </Card>

      {/* Character Appearance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Character Appearance</h3>
        <TextAreaInput
          value={character.details.appearance}
          onChange={(value) => updateDetails("appearance", value)}
          placeholder="Describe your character's physical appearance, distinctive features, clothing, and overall look..."
          rows={6}
          maxLength={2000}
        />
      </Card>

      {/* Backstory */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Character Backstory</h3>
        <TextAreaInput
          value={character.details.backstory}
          onChange={(value) => updateDetails("backstory", value)}
          placeholder="Tell your character's story, their history, motivations, and how they became an adventurer..."
          rows={8}
          maxLength={5000}
        />
      </Card>

      {/* Additional Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Allies & Organizations</h3>
          <TextAreaInput
            value={character.details.alliesAndOrganizations}
            onChange={(value) => updateDetails("alliesAndOrganizations", value)}
            placeholder="List allies, contacts, and organizations your character is connected to..."
            rows={6}
            maxLength={1000}
          />
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Additional Features & Traits</h3>
          <TextAreaInput
            value={character.details.additionalFeatures}
            onChange={(value) => updateDetails("additionalFeatures", value)}
            placeholder="Any additional features, racial traits, or special abilities..."
            rows={6}
            maxLength={1000}
          />
        </Card>
      </div>

      {/* Treasure */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Treasure</h3>
        <TextAreaInput
          value={character.details.treasure}
          onChange={(value) => updateDetails("treasure", value)}
          placeholder="List valuable items, heirlooms, magical artifacts, or other treasures..."
          rows={4}
          maxLength={1000}
        />
      </Card>
    </div>
  );
};
