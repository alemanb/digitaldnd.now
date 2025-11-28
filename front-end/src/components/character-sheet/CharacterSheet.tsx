// ============================================================================
// CharacterSheet - Main character sheet container with tab navigation
// ============================================================================

import React from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CharacterSheetHeader } from "./CharacterSheetHeader";
import {
  BasicInfoTab,
  CombatTab,
  SkillsTab,
  EquipmentTab,
  PersonalityTab,
  AppearanceTab,
  SpellcastingTab,
} from "./tabs";

// ============================================================================
// Tab Configuration
// ============================================================================

const tabs = [
  { id: "basic-info", label: "Basic Info" },
  { id: "combat", label: "Combat" },
  { id: "skills", label: "Skills" },
  { id: "equipment", label: "Equipment" },
  { id: "personality", label: "Personality" },
  { id: "appearance", label: "Appearance" },
  { id: "spells", label: "Spells" },
] as const;

// ============================================================================
// CharacterSheet Component
// ============================================================================

export const CharacterSheet: React.FC = () => {
  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-2 sm:p-4 md:p-6">
      <Card className="w-full max-w-5xl shadow-2xl animate-in fade-in duration-500">
        <CharacterSheetHeader />

        <Tabs defaultValue="basic-info" className="w-full">
          <TabsList className="grid w-full grid-cols-7 rounded-none border-b">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary transition-all duration-200 hover:bg-muted/50 text-xs sm:text-sm whitespace-nowrap px-2 sm:px-4"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="p-3 sm:p-4 md:p-6">
            <TabsContent value="basic-info" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <BasicInfoTab />
            </TabsContent>

            <TabsContent value="combat" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <CombatTab />
            </TabsContent>

            <TabsContent value="skills" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <SkillsTab />
            </TabsContent>

            <TabsContent value="equipment" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <EquipmentTab />
            </TabsContent>

            <TabsContent value="personality" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <PersonalityTab />
            </TabsContent>

            <TabsContent value="appearance" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <AppearanceTab />
            </TabsContent>

            <TabsContent value="spells" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <SpellcastingTab />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
};
