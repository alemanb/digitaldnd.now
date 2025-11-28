// ============================================================================
// SpellcastingTab - Spellcasting stats, spell slots, and spell management
// ============================================================================

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextInput, NumberInput, CheckboxInput } from "@/components/form-fields";
import { useCharacter } from "@/hooks/useCharacter";
import { useCalculations } from "@/hooks/useCalculations";
import { useClassRestrictions } from "@/hooks/useClassRestrictions";
import { Plus, Trash2 } from "lucide-react";

// ============================================================================
// SpellcastingTab Component
// ============================================================================

export const SpellcastingTab: React.FC = () => {
  const { character, addSpell, updateSpell, removeSpell, toggleSpellPrepared, updateSpellSlots } = useCharacter();
  const { spellcastingStats } = useCalculations();
  const { canCastSpells, shouldShowSpellcasting } = useClassRestrictions();

  // ============================================================================
  // Render - No Spellcasting Available
  // ============================================================================

  if (!canCastSpells || !shouldShowSpellcasting || !character.spellcasting) {
    return (
      <div className="flex items-center justify-center py-16">
        <Card className="p-8 text-center max-w-md">
          <h3 className="text-lg font-semibold mb-2">No Spellcasting Available</h3>
          <p className="text-muted-foreground">
            The {character.class} class does not have spellcasting abilities. Choose a spellcasting
            class (Bard, Cleric, Druid, Paladin, Ranger, Sorcerer, Warlock, or Wizard) to use this
            tab.
          </p>
        </Card>
      </div>
    );
  }

  // ============================================================================
  // Render - Spellcasting Available
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Spellcasting Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Spellcasting Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center p-4 border rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground mb-2">Spellcasting Ability</span>
            <span className="text-2xl font-bold capitalize">
              {spellcastingStats?.spellcastingAbility || character.spellcasting.spellcastingAbility}
            </span>
          </div>

          <div className="flex flex-col items-center p-4 border rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground mb-2">Spell Save DC</span>
            <span className="text-2xl font-bold">
              {spellcastingStats?.spellSaveDC || character.spellcasting.spellSaveDC}
            </span>
            <span className="text-xs text-muted-foreground mt-1">Auto-calculated</span>
          </div>

          <div className="flex flex-col items-center p-4 border rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground mb-2">Spell Attack Bonus</span>
            <span className="text-2xl font-bold">
              +{spellcastingStats?.spellAttackBonus || character.spellcasting.spellAttackBonus}
            </span>
            <span className="text-xs text-muted-foreground mt-1">Auto-calculated</span>
          </div>
        </div>
      </Card>

      {/* Cantrips */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Cantrips (Level 0)</h3>
          <Button
            size="sm"
            onClick={() =>
              addSpell({
                id: crypto.randomUUID(),
                name: "",
                level: 0,
                prepared: true,
              }, 0)
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Cantrip
          </Button>
        </div>

        <div className="space-y-2">
          {character.spellcasting.cantrips.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No cantrips added yet. Click "Add Cantrip" to create one.
            </p>
          ) : (
            character.spellcasting.cantrips.map((spell) => (
              <div key={spell.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <TextInput
                  value={spell.name}
                  onChange={(value) => updateSpell(spell.id, 0, { name: value })}
                  placeholder="Cantrip name"
                  className="flex-1"
                />
                <Button size="icon" variant="ghost" onClick={() => removeSpell(spell.id, 0)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Spell Levels 1-9 */}
      {character.spellcasting.spellSlots.map((slotLevel) => (
        <Card key={slotLevel.level} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">Level {slotLevel.level} Spells</h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <NumberInput
                    value={slotLevel.total}
                    onChange={(value) => updateSpellSlots(slotLevel.level, value, slotLevel.expended)}
                    min={0}
                    max={9}
                    inputClassName="w-16"
                  />
                  <span className="text-sm text-muted-foreground">Total Slots</span>
                </div>
                <div className="flex items-center gap-2">
                  <NumberInput
                    value={slotLevel.expended}
                    onChange={(value) => updateSpellSlots(slotLevel.level, slotLevel.total, value)}
                    min={0}
                    max={slotLevel.total}
                    inputClassName="w-16"
                  />
                  <span className="text-sm text-muted-foreground">Expended</span>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() =>
                addSpell({
                  id: crypto.randomUUID(),
                  name: "",
                  level: slotLevel.level,
                  prepared: false,
                }, slotLevel.level)
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Spell
            </Button>
          </div>

          <div className="space-y-2">
            {slotLevel.spells.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No level {slotLevel.level} spells added yet.
              </p>
            ) : (
              slotLevel.spells.map((spell) => (
                <div key={spell.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <CheckboxInput
                    checked={spell.prepared}
                    onChange={() => toggleSpellPrepared(spell.id, slotLevel.level)}
                    label="Prep"
                  />
                  <TextInput
                    value={spell.name}
                    onChange={(value) => updateSpell(spell.id, slotLevel.level, { name: value })}
                    placeholder="Spell name"
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeSpell(spell.id, slotLevel.level)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};
