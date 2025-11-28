// ============================================================================
// SkillsTab - Skills list, saving throws, and passive perception
// ============================================================================

import React from "react";
import { Card } from "@/components/ui/card";
import { CheckboxInput } from "@/components/form-fields";
import { useCharacter } from "@/hooks/useCharacter";
import { useCalculations } from "@/hooks/useCalculations";
import { formatBonus } from "@/utils/calculations";
import type { SkillName, AttributeName } from "@/types/character";

// ============================================================================
// Skill Display Names and Order
// ============================================================================

const skillDisplayNames: Record<SkillName, string> = {
  acrobatics: "Acrobatics",
  animalHandling: "Animal Handling",
  arcana: "Arcana",
  athletics: "Athletics",
  deception: "Deception",
  history: "History",
  insight: "Insight",
  intimidation: "Intimidation",
  investigation: "Investigation",
  medicine: "Medicine",
  nature: "Nature",
  perception: "Perception",
  performance: "Performance",
  persuasion: "Persuasion",
  religion: "Religion",
  sleightOfHand: "Sleight of Hand",
  stealth: "Stealth",
  survival: "Survival",
};

const skillOrder: SkillName[] = [
  "acrobatics",
  "animalHandling",
  "arcana",
  "athletics",
  "deception",
  "history",
  "insight",
  "intimidation",
  "investigation",
  "medicine",
  "nature",
  "perception",
  "performance",
  "persuasion",
  "religion",
  "sleightOfHand",
  "stealth",
  "survival",
];

// ============================================================================
// Saving Throw Display Names
// ============================================================================

const savingThrowDisplayNames: Record<AttributeName, string> = {
  strength: "Strength",
  dexterity: "Dexterity",
  constitution: "Constitution",
  intelligence: "Intelligence",
  wisdom: "Wisdom",
  charisma: "Charisma",
};

const savingThrowOrder: AttributeName[] = [
  "strength",
  "dexterity",
  "constitution",
  "intelligence",
  "wisdom",
  "charisma",
];

// ============================================================================
// SkillsTab Component
// ============================================================================

export const SkillsTab: React.FC = () => {
  const { character, toggleSkillProficiency, toggleSkillExpertise, toggleSavingThrowProficiency } =
    useCharacter();
  const { skillBonuses, savingThrowBonuses, passiveWisdomPerception } = useCalculations();

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Saving Throws */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Saving Throws</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {savingThrowOrder.map((attribute) => {
            const savingThrow = character.savingThrows[attribute];
            const bonus = savingThrowBonuses[attribute];

            return (
              <div
                key={attribute}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <CheckboxInput
                    checked={savingThrow.proficient}
                    onChange={() => toggleSavingThrowProficiency(attribute)}
                  />
                  <span className="font-medium">{savingThrowDisplayNames[attribute]}</span>
                </div>
                <span className="text-lg font-semibold ml-auto">{formatBonus(bonus)}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Skills */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Skills</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {skillOrder.map((skillName) => {
            const skill = character.skills[skillName];
            const bonus = skillBonuses[skillName];

            return (
              <div
                key={skillName}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex flex-col gap-1">
                    <CheckboxInput
                      checked={skill.proficient}
                      onChange={() => toggleSkillProficiency(skillName)}
                      label="Prof"
                    />
                    <CheckboxInput
                      checked={skill.expertise}
                      onChange={() => toggleSkillExpertise(skillName)}
                      label="Exp"
                      disabled={!skill.proficient}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{skillDisplayNames[skillName]}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {skill.attribute}
                    </span>
                  </div>
                </div>
                <span className="text-lg font-semibold ml-auto">{formatBonus(bonus)}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Passive Perception */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Passive Wisdom (Perception)</h3>
        <div className="flex justify-center">
          <div className="flex flex-col items-center p-6 border rounded-lg bg-muted/50 w-48">
            <span className="text-sm text-muted-foreground mb-2">Passive Perception</span>
            <span className="text-5xl font-bold">{passiveWisdomPerception}</span>
            <span className="text-xs text-muted-foreground mt-2">
              10 + Perception bonus
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
};
