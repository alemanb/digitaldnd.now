// ============================================================================
// PersonalityTab - Personality traits, ideals, bonds, flaws, and features
// ============================================================================

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextAreaInput, TextInput } from "@/components/form-fields";
import { useCharacter } from "@/hooks/useCharacter";
import { Plus, Trash2 } from "lucide-react";

// ============================================================================
// PersonalityTab Component
// ============================================================================

export const PersonalityTab: React.FC = () => {
  const { character, updatePersonality, addFeature, updateFeature, removeFeature } = useCharacter();

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Personality Traits */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Personality</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextAreaInput
            label="Personality Traits"
            value={character.personality.traits}
            onChange={(value) => updatePersonality("traits", value)}
            placeholder="Describe your character's personality traits..."
            rows={4}
            maxLength={500}
          />
          <TextAreaInput
            label="Ideals"
            value={character.personality.ideals}
            onChange={(value) => updatePersonality("ideals", value)}
            placeholder="What are your character's beliefs and ideals?"
            rows={4}
            maxLength={500}
          />
          <TextAreaInput
            label="Bonds"
            value={character.personality.bonds}
            onChange={(value) => updatePersonality("bonds", value)}
            placeholder="What connections does your character have?"
            rows={4}
            maxLength={500}
          />
          <TextAreaInput
            label="Flaws"
            value={character.personality.flaws}
            onChange={(value) => updatePersonality("flaws", value)}
            placeholder="What are your character's weaknesses or flaws?"
            rows={4}
            maxLength={500}
          />
        </div>
      </Card>

      {/* Features & Traits */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Features & Traits</h3>
          <Button
            size="sm"
            onClick={() =>
              addFeature({
                id: crypto.randomUUID(),
                name: "",
                description: "",
                source: "Custom",
              })
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Feature
          </Button>
        </div>

        <div className="space-y-4">
          {character.features.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No features or traits added yet. Click "Add Feature" to create one.
            </p>
          ) : (
            character.features.map((feature) => (
              <div key={feature.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex gap-3 items-start">
                  <TextInput
                    label="Feature Name"
                    value={feature.name}
                    onChange={(value) => updateFeature(feature.id, { name: value })}
                    placeholder="e.g., Rage, Sneak Attack, Divine Sense"
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFeature(feature.id)}
                    className="mt-7"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <TextAreaInput
                  label="Description"
                  value={feature.description}
                  onChange={(value) => updateFeature(feature.id, { description: value })}
                  placeholder="Describe how this feature works..."
                  rows={3}
                  maxLength={1000}
                />
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
