// ============================================================================
// EquipmentTab - Equipment inventory, currency, proficiencies, and languages
// ============================================================================

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextInput, NumberInput, TextAreaInput } from "@/components/form-fields";
import { useCharacter } from "@/hooks/useCharacter";
import { Plus, Trash2 } from "lucide-react";

// ============================================================================
// EquipmentTab Component
// ============================================================================

export const EquipmentTab: React.FC = () => {
  const {
    character,
    addEquipment,
    updateEquipment,
    removeEquipment,
    updateCurrency,
    addProficiency,
    removeProficiency,
    addLanguage,
    removeLanguage,
  } = useCharacter();

  // ============================================================================
  // State for new items
  // ============================================================================

  const [newProficiency, setNewProficiency] = React.useState("");
  const [newLanguage, setNewLanguage] = React.useState("");

  // ============================================================================
  // Handlers
  // ============================================================================

  const handleAddProficiency = () => {
    if (newProficiency.trim()) {
      addProficiency(newProficiency.trim());
      setNewProficiency("");
    }
  };

  const handleAddLanguage = () => {
    if (newLanguage.trim()) {
      addLanguage(newLanguage.trim());
      setNewLanguage("");
    }
  };

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Currency */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Currency</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <NumberInput
            label="Copper (CP)"
            value={character.currency.copper}
            onChange={(value) => updateCurrency("copper", value)}
            min={0}
          />
          <NumberInput
            label="Silver (SP)"
            value={character.currency.silver}
            onChange={(value) => updateCurrency("silver", value)}
            min={0}
          />
          <NumberInput
            label="Electrum (EP)"
            value={character.currency.electrum}
            onChange={(value) => updateCurrency("electrum", value)}
            min={0}
          />
          <NumberInput
            label="Gold (GP)"
            value={character.currency.gold}
            onChange={(value) => updateCurrency("gold", value)}
            min={0}
          />
          <NumberInput
            label="Platinum (PP)"
            value={character.currency.platinum}
            onChange={(value) => updateCurrency("platinum", value)}
            min={0}
          />
        </div>
      </Card>

      {/* Equipment */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Equipment</h3>
          <Button
            size="sm"
            onClick={() =>
              addEquipment({
                id: crypto.randomUUID(),
                name: "",
                quantity: 1,
                description: "",
              })
            }
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        <div className="space-y-3">
          {character.equipment.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No equipment added yet. Click "Add Item" to create one.
            </p>
          ) : (
            character.equipment.map((item) => (
              <div key={item.id} className="p-3 border rounded-lg space-y-3">
                <div className="flex gap-3 items-end">
                  <TextInput
                    label="Item Name"
                    value={item.name}
                    onChange={(value) => updateEquipment(item.id, { name: value })}
                    className="flex-1"
                    placeholder="e.g., Longsword, Backpack"
                  />
                  <NumberInput
                    label="Qty"
                    value={item.quantity}
                    onChange={(value) => updateEquipment(item.id, { quantity: value })}
                    min={1}
                    className="w-20"
                  />
                  <NumberInput
                    label="Weight"
                    value={item.weight || 0}
                    onChange={(value) => updateEquipment(item.id, { weight: value })}
                    min={0}
                    step={0.1}
                    className="w-24"
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeEquipment(item.id)}
                    className="mb-1.5"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <TextAreaInput
                  label="Description"
                  value={item.description || ""}
                  onChange={(value) => updateEquipment(item.id, { description: value })}
                  placeholder="Optional description or notes"
                  rows={2}
                  resize="none"
                />
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Proficiencies & Languages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Proficiencies */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Other Proficiencies</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <TextInput
                value={newProficiency}
                onChange={setNewProficiency}
                placeholder="e.g., Smith's Tools, Heavy Armor"
                className="flex-1"
              />
              <Button size="sm" onClick={handleAddProficiency}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {character.proficiencies.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No proficiencies added yet.
                </p>
              ) : (
                character.proficiencies.map((proficiency, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded hover:bg-muted/50"
                  >
                    <span>{proficiency}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeProficiency(proficiency)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>

        {/* Languages */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Languages</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <TextInput
                value={newLanguage}
                onChange={setNewLanguage}
                placeholder="e.g., Common, Elvish"
                className="flex-1"
              />
              <Button size="sm" onClick={handleAddLanguage}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-2">
              {character.languages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No languages added yet.
                </p>
              ) : (
                character.languages.map((language, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded hover:bg-muted/50"
                  >
                    <span>{language}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeLanguage(language)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
