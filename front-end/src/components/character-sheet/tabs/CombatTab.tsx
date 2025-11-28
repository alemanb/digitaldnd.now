// ============================================================================
// CombatTab - Combat stats, HP tracking, attacks, and death saves
// ============================================================================

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NumberInput, TextInput, CheckboxInput } from "@/components/form-fields";
import { useCharacter } from "@/hooks/useCharacter";
import { useCalculations } from "@/hooks/useCalculations";
import { Plus, Trash2 } from "lucide-react";

// ============================================================================
// CombatTab Component
// ============================================================================

export const CombatTab: React.FC = () => {
  const {
    character,
    updateCombatStat,
    updateHitPoints,
    updateDeathSaves,
    addAttack,
    updateAttack,
    removeAttack,
  } = useCharacter();
  const { initiative, hitDiceDisplay } = useCalculations();

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Combat Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Combat Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center p-4 border rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground mb-2">Armor Class</span>
            <NumberInput
              value={character.combat.armorClass}
              onChange={(value) => updateCombatStat("armorClass", value)}
              min={1}
              max={30}
              inputClassName="text-3xl font-bold w-20 h-20"
            />
          </div>

          <div className="flex flex-col items-center p-4 border rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground mb-2">Initiative</span>
            <div className="text-3xl font-bold">{initiative >= 0 ? '+' : ''}{initiative}</div>
            <span className="text-xs text-muted-foreground mt-1">Dex modifier</span>
          </div>

          <div className="flex flex-col items-center p-4 border rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground mb-2">Speed</span>
            <NumberInput
              value={character.combat.speed}
              onChange={(value) => updateCombatStat("speed", value)}
              min={0}
              max={120}
              inputClassName="text-3xl font-bold w-20 h-20"
            />
            <span className="text-xs text-muted-foreground mt-1">feet</span>
          </div>

          <div className="flex flex-col items-center p-4 border rounded-lg bg-muted/50">
            <span className="text-sm text-muted-foreground mb-2">Hit Dice</span>
            <div className="text-3xl font-bold">{hitDiceDisplay}</div>
            <span className="text-xs text-muted-foreground mt-1">Total</span>
          </div>
        </div>
      </Card>

      {/* Hit Points */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Hit Points</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <NumberInput
            label="Maximum HP"
            value={character.combat.hitPointMaximum}
            onChange={(value) => updateHitPoints("maximum", value)}
            min={1}
            required
          />
          <NumberInput
            label="Current HP"
            value={character.combat.currentHitPoints}
            onChange={(value) => updateHitPoints("current", value)}
            min={0}
            max={character.combat.hitPointMaximum}
            required
          />
          <NumberInput
            label="Temporary HP"
            value={character.combat.temporaryHitPoints}
            onChange={(value) => updateHitPoints("temporary", value)}
            min={0}
          />
        </div>
      </Card>

      {/* Death Saves */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Death Saves</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Successes</label>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <CheckboxInput
                  key={`success-${i}`}
                  checked={character.combat.deathSaves.successes >= i}
                  onChange={(checked) => {
                    const newValue = checked
                      ? Math.max(i, character.combat.deathSaves.successes)
                      : Math.min(i - 1, character.combat.deathSaves.successes);
                    updateDeathSaves("successes", newValue);
                  }}
                />
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Failures</label>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <CheckboxInput
                  key={`failure-${i}`}
                  checked={character.combat.deathSaves.failures >= i}
                  onChange={(checked) => {
                    const newValue = checked
                      ? Math.max(i, character.combat.deathSaves.failures)
                      : Math.min(i - 1, character.combat.deathSaves.failures);
                    updateDeathSaves("failures", newValue);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Attacks & Spellcasting */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Attacks & Spellcasting</h3>
          <Button
            size="sm"
            onClick={() => addAttack({
              id: crypto.randomUUID(),
              name: "New Attack",
              attackBonus: 0,
              damageType: "",
              damage: "1d6",
            })}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Attack
          </Button>
        </div>

        <div className="space-y-3">
          {character.attacks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No attacks added yet. Click "Add Attack" to create one.
            </p>
          ) : (
            character.attacks.map((attack) => (
              <div key={attack.id} className="flex gap-3 items-end p-3 border rounded-lg">
                <TextInput
                  label="Name"
                  value={attack.name}
                  onChange={(value) => updateAttack(attack.id, { name: value })}
                  className="flex-1"
                />
                <NumberInput
                  label="Attack Bonus"
                  value={attack.attackBonus}
                  onChange={(value) => updateAttack(attack.id, { attackBonus: value })}
                  className="w-24"
                />
                <TextInput
                  label="Damage"
                  value={attack.damage}
                  onChange={(value) => updateAttack(attack.id, { damage: value })}
                  placeholder="1d8+3"
                  className="w-24"
                />
                <TextInput
                  label="Type"
                  value={attack.damageType}
                  onChange={(value) => updateAttack(attack.id, { damageType: value })}
                  placeholder="Slashing"
                  className="w-32"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => removeAttack(attack.id)}
                  className="mb-1.5"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
