# 5e.tools Embedded Data Integration Design

## Overview
Comprehensive design document for embedding 5e.tools data directly into the D&D 5e Online Character Sheet with intelligent class-based auto-updates, deduplication, and shadcn/ui combobox components.

**Status**: Design Phase
**Date**: 2025-11-28
**Replaces**: External 5e.tools data references
**Dependencies**: Phase 7 Complete, shadcn/ui installed

---

## Table of Contents
1. [Architecture Overview](#1-architecture-overview)
2. [Data Deduplication System](#2-data-deduplication-system)
3. [Class-Based Auto-Update Engine](#3-class-based-auto-update-engine)
4. [Combobox Component Design](#4-combobox-component-design)
5. [Source Badge System](#5-source-badge-system)
6. [Type Definitions](#6-type-definitions)
7. [Implementation Phases](#7-implementation-phases)
8. [API Specifications](#8-api-specifications)

---

## 1. Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Character Sheet UI Layer                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │ ClassCombobox  │  │ SpellCombobox  │  │ ItemCombobox   │   │
│  │ + Source Badge │  │ + Source Badge │  │ + Source Badge │   │
│  └────────┬───────┘  └────────┬───────┘  └────────┬───────┘   │
│           │                   │                    │             │
└───────────┼───────────────────┼────────────────────┼─────────────┘
            │                   │                    │
            ▼                   ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Auto-Update & Validation Layer                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  ClassBasedAutoUpdate Engine                              │  │
│  │  • Proficiency auto-assignment                            │  │
│  │  • Spell slot calculations                                │  │
│  │  • Hit dice updates                                       │  │
│  │  • Saving throw proficiencies                             │  │
│  │  • Skill restrictions                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Data Management Layer                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  GameDataContext (React Context)                          │  │
│  │  • Deduplicated data storage                              │  │
│  │  • Class-filtered spell lists                             │  │
│  │  • Item restriction validation                            │  │
│  │  • Custom object management                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│              Data Processing & Deduplication Layer               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ DataLoader   │→ │ Deduplicator │→ │ Transformer  │         │
│  │ (Lazy Load)  │  │ (Priority)   │  │ (Index/Cache)│         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                  5e.tools JSON Data Layer                        │
│  class/ | races.json | spells/ | items.json | feats.json |     │
│  optionalfeatures.json | backgrounds.json | languages.json      │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Principles

1. **Deduplication First**: Remove duplicate entries before indexing
2. **Source Priority**: PHB → XPHB → XGE → TCE → Other
3. **Class-Based Intelligence**: Auto-update fields based on selected class
4. **Single Source of Truth**: GameDataContext manages all game data
5. **Performance Optimized**: Lazy loading, memoization, indexed search
6. **Type Safety**: Full TypeScript coverage with strict types

---

## 2. Data Deduplication System

### Problem Statement

5e.tools data contains duplicates across sources:
- Same spell in PHB and XPHB (2024 reprint)
- Race entries from multiple books (DMG, EEPC, MPMM)
- Classes with "reprintedAs" references

### Deduplication Strategy

#### Priority System

```typescript
const SOURCE_PRIORITY: Record<string, number> = {
  // 2024 Core Rulebooks (Highest Priority)
  'XPHB': 100,      // Player's Handbook 2024
  'XDMG': 100,      // Dungeon Master's Guide 2024
  'XMM': 100,       // Monster Manual 2024

  // 2014 Core Rulebooks
  'PHB': 90,        // Player's Handbook 2014
  'DMG': 90,        // Dungeon Master's Guide 2014
  'MM': 90,         // Monster Manual 2014

  // Major Expansions
  'TCE': 80,        // Tasha's Cauldron of Everything
  'XGE': 80,        // Xanathar's Guide to Everything
  'MPMM': 75,       // Mordenkainen Presents: Monsters of the Multiverse

  // Campaign Settings
  'SCAG': 70,       // Sword Coast Adventurer's Guide
  'ERLW': 70,       // Eberron: Rising from the Last War
  'GGTR': 70,       // Guildmasters' Guide to Ravnica

  // Default for unknown sources
  'DEFAULT': 50
};
```

#### Deduplication Algorithm

```typescript
// src/data/5etools/deduplicator.ts

export interface DeduplicationConfig {
  priorityMap: Record<string, number>;
  preserveReprintedAs: boolean;
  keepSourceVariants: boolean;
}

export class DataDeduplicator<T extends { name: string; source: string }> {
  private priorityMap: Record<string, number>;
  private preserveReprintedAs: boolean;

  constructor(config: DeduplicationConfig) {
    this.priorityMap = config.priorityMap;
    this.preserveReprintedAs = config.preserveReprintedAs;
  }

  /**
   * Deduplicate array of data objects by name, keeping highest priority source
   */
  deduplicate(data: T[]): T[] {
    const deduplicationMap = new Map<string, T>();

    for (const item of data) {
      const key = this.normalizeKey(item.name);
      const existing = deduplicationMap.get(key);

      if (!existing) {
        deduplicationMap.set(key, item);
        continue;
      }

      // Compare priorities
      const existingPriority = this.getPriority(existing.source);
      const itemPriority = this.getPriority(item.source);

      // Replace if new item has higher priority
      if (itemPriority > existingPriority) {
        deduplicationMap.set(key, item);
      }

      // Handle "reprintedAs" field
      if (this.preserveReprintedAs && 'reprintedAs' in item) {
        const reprintedAs = (item as any).reprintedAs;
        if (Array.isArray(reprintedAs) && reprintedAs.length > 0) {
          // Keep the reprint version
          const reprintSource = this.extractSource(reprintedAs[0]);
          const reprintPriority = this.getPriority(reprintSource);

          if (reprintPriority > itemPriority) {
            // This is an old version, skip it
            continue;
          }
        }
      }
    }

    return Array.from(deduplicationMap.values());
  }

  /**
   * Normalize name for comparison (lowercase, trim, remove special chars)
   */
  private normalizeKey(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-');
  }

  /**
   * Get priority score for source
   */
  private getPriority(source: string): number {
    return this.priorityMap[source] || this.priorityMap['DEFAULT'] || 50;
  }

  /**
   * Extract source from "Name|SOURCE" format
   */
  private extractSource(reprintedAs: string): string {
    const parts = reprintedAs.split('|');
    return parts.length > 1 ? parts[1] : 'UNKNOWN';
  }

  /**
   * Get statistics about deduplication
   */
  getStats(originalData: T[], deduplicatedData: T[]): DeduplicationStats {
    const duplicateCount = originalData.length - deduplicatedData.length;
    const sourceDistribution = this.getSourceDistribution(deduplicatedData);

    return {
      originalCount: originalData.length,
      deduplicatedCount: deduplicatedData.length,
      duplicatesRemoved: duplicateCount,
      deduplicationRate: duplicateCount / originalData.length,
      sourceDistribution
    };
  }

  private getSourceDistribution(data: T[]): Record<string, number> {
    const distribution: Record<string, number> = {};

    for (const item of data) {
      distribution[item.source] = (distribution[item.source] || 0) + 1;
    }

    return distribution;
  }
}

export interface DeduplicationStats {
  originalCount: number;
  deduplicatedCount: number;
  duplicatesRemoved: number;
  deduplicationRate: number;
  sourceDistribution: Record<string, number>;
}
```

#### Usage Example

```typescript
// src/data/5etools/loaders.ts

import { DataDeduplicator, SOURCE_PRIORITY } from './deduplicator';

export async function loadClasses(): Promise<DndClass[]> {
  // Load all class files
  const classFiles = [
    'class-barbarian.json',
    'class-bard.json',
    // ... etc
  ];

  const promises = classFiles.map(file =>
    fetch(`/data/class/${file}`).then(res => res.json())
  );

  const results = await Promise.all(promises);
  const allClasses = results.flatMap(data => data.class || []);

  // Deduplicate classes
  const deduplicator = new DataDeduplicator<any>({
    priorityMap: SOURCE_PRIORITY,
    preserveReprintedAs: true,
    keepSourceVariants: false
  });

  const deduplicatedClasses = deduplicator.deduplicate(allClasses);

  // Log stats
  const stats = deduplicator.getStats(allClasses, deduplicatedClasses);
  console.log('Class deduplication stats:', stats);

  // Parse and return
  return deduplicatedClasses.map(parseClass);
}
```

### Deduplication Rules by Data Type

| Data Type | Deduplication Key | Special Rules |
|-----------|------------------|---------------|
| **Classes** | `name` only | Prefer XPHB over PHB |
| **Spells** | `name` only | Prefer XPHB > TCE > XGE > PHB |
| **Races** | `name + source` | Keep MPMM variants separate |
| **Items** | `name + rarity` | Keep magic item variants |
| **Feats** | `name` only | Prefer XPHB over PHB |
| **Features** | `name + featureType` | Keep class-specific variants |
| **Backgrounds** | `name` only | Prefer XPHB over PHB |

---

## 3. Class-Based Auto-Update Engine

### Overview

When a user selects a class, the system automatically updates related fields:
- ✅ Saving throw proficiencies
- ✅ Hit dice type
- ✅ Spellcasting ability (if applicable)
- ✅ Available skill proficiencies
- ✅ Spell slot progression
- ✅ Cantrip progression
- ✅ Class features by level

### Auto-Update Rules Engine

```typescript
// src/utils/5etools/classAutoUpdate.ts

export interface ClassAutoUpdateRules {
  savingThrowProficiencies: (keyof Attributes)[];
  hitDice: {
    number: number;
    faces: number;
  };
  spellcasting: {
    enabled: boolean;
    ability?: keyof Attributes;
    progression?: 'full' | 'half' | 'third' | 'pact';
    preparedSpells?: string; // Formula like "<$level$> + <$int_mod$>"
  };
  skillProficiencies: {
    from: string[];
    count: number;
  };
  features: ClassFeature[];
}

export class ClassAutoUpdateEngine {
  private classDataMap: Map<string, DndClass> = new Map();

  constructor(classes: DndClass[]) {
    for (const cls of classes) {
      this.classDataMap.set(cls.name.toLowerCase(), cls);
    }
  }

  /**
   * Get auto-update rules for a specific class
   */
  getRules(className: string): ClassAutoUpdateRules | null {
    const classData = this.classDataMap.get(className.toLowerCase());
    if (!classData) return null;

    return {
      savingThrowProficiencies: classData.proficiency as (keyof Attributes)[],
      hitDice: classData.hd,
      spellcasting: {
        enabled: !!classData.spellcastingAbility,
        ability: classData.spellcastingAbility as keyof Attributes | undefined,
        progression: classData.casterProgression,
        preparedSpells: classData.preparedSpells
      },
      skillProficiencies: this.extractSkillProficiencies(classData),
      features: classData.classFeatures || []
    };
  }

  /**
   * Apply auto-updates to character based on class selection
   */
  applyAutoUpdates(
    character: Character,
    className: string
  ): Partial<Character> {
    const rules = this.getRules(className);
    if (!rules) return {};

    const updates: Partial<Character> = {
      class: className
    };

    // Update saving throw proficiencies
    if (character.savingThrows) {
      const savingThrows = { ...character.savingThrows };

      // Reset all to not proficient
      for (const attr of Object.keys(savingThrows) as (keyof Attributes)[]) {
        savingThrows[attr] = {
          ...savingThrows[attr],
          proficient: false
        };
      }

      // Set proficient based on class
      for (const attr of rules.savingThrowProficiencies) {
        savingThrows[attr] = {
          ...savingThrows[attr],
          proficient: true
        };
      }

      updates.savingThrows = savingThrows;
    }

    // Update hit dice
    if (character.combat) {
      updates.combat = {
        ...character.combat,
        hitDice: {
          total: `${character.level || 1}d${rules.hitDice.faces}`,
          current: character.level || 1
        }
      };
    }

    // Update spellcasting
    if (rules.spellcasting.enabled) {
      const spellcasting: Spellcasting = {
        spellcastingClass: className,
        spellcastingAbility: rules.spellcasting.ability!,
        spellSaveDC: this.calculateSpellSaveDC(character),
        spellAttackBonus: this.calculateSpellAttackBonus(character),
        cantrips: character.spellcasting?.cantrips || [],
        spellSlots: this.calculateSpellSlots(
          className,
          character.level || 1,
          rules.spellcasting.progression
        )
      };

      updates.spellcasting = spellcasting;
    } else {
      // Remove spellcasting if class doesn't have it
      updates.spellcasting = undefined;
    }

    return updates;
  }

  /**
   * Calculate spell save DC based on class and attributes
   */
  private calculateSpellSaveDC(character: Character): number {
    const proficiencyBonus = calculateProficiencyBonus(character.level || 1);
    const spellcastingAbility = character.spellcasting?.spellcastingAbility;

    if (!spellcastingAbility) return 8 + proficiencyBonus;

    const abilityMod = character.attributes[spellcastingAbility].modifier;
    return 8 + proficiencyBonus + abilityMod;
  }

  /**
   * Calculate spell attack bonus
   */
  private calculateSpellAttackBonus(character: Character): number {
    const proficiencyBonus = calculateProficiencyBonus(character.level || 1);
    const spellcastingAbility = character.spellcasting?.spellcastingAbility;

    if (!spellcastingAbility) return proficiencyBonus;

    const abilityMod = character.attributes[spellcastingAbility].modifier;
    return proficiencyBonus + abilityMod;
  }

  /**
   * Calculate spell slots based on class progression
   */
  private calculateSpellSlots(
    className: string,
    level: number,
    progression?: 'full' | 'half' | 'third' | 'pact'
  ): SpellSlotLevel[] {
    if (!progression) return [];

    // Use standard 5e spell slot tables
    return getSpellSlotTable(progression, level);
  }

  /**
   * Extract skill proficiency choices from class data
   */
  private extractSkillProficiencies(classData: DndClass): {
    from: string[];
    count: number;
  } {
    const skills = classData.startingProficiencies?.skills?.[0];

    if (!skills || !('choose' in skills)) {
      return { from: [], count: 0 };
    }

    return {
      from: skills.choose.from || [],
      count: skills.choose.count || 0
    };
  }
}

/**
 * Standard 5e spell slot tables
 */
function getSpellSlotTable(
  progression: 'full' | 'half' | 'third' | 'pact',
  level: number
): SpellSlotLevel[] {
  // Implementation of spell slot tables
  // Returns array of SpellSlotLevel objects
  // Based on official D&D 5e rules

  const tables = {
    full: FULL_CASTER_TABLE,
    half: HALF_CASTER_TABLE,
    third: THIRD_CASTER_TABLE,
    pact: PACT_MAGIC_TABLE
  };

  return tables[progression][level] || [];
}
```

### Auto-Update Triggers

```typescript
// src/contexts/CharacterContext.tsx

export function CharacterProvider({ children }: { children: React.ReactNode }) {
  const [character, setCharacter] = useState<Character>(initialCharacter);
  const { classes } = useGameData();
  const autoUpdateEngine = useMemo(
    () => new ClassAutoUpdateEngine(classes),
    [classes]
  );

  /**
   * Update character class with auto-updates
   */
  const updateClass = useCallback((className: string) => {
    const updates = autoUpdateEngine.applyAutoUpdates(character, className);

    setCharacter(prev => ({
      ...prev,
      ...updates
    }));
  }, [character, autoUpdateEngine]);

  return (
    <CharacterContext.Provider value={{
      character,
      updateClass,
      // ... other methods
    }}>
      {children}
    </CharacterContext.Provider>
  );
}
```

---

## 4. Combobox Component Design

### Base Combobox Component

```typescript
// src/components/data-combobox/DataCombobox.tsx

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { SourceBadge } from "./SourceBadge"

export interface DataComboboxItem {
  value: string;
  label: string;
  source: string;
  description?: string;
}

export interface DataComboboxProps {
  data: DataComboboxItem[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage?: string;
  allowCustom?: boolean;
  onCreateCustom?: () => void;
  className?: string;
  disabled?: boolean;
}

export function DataCombobox({
  data,
  value,
  onValueChange,
  placeholder,
  searchPlaceholder,
  emptyMessage = "No results found.",
  allowCustom = false,
  onCreateCustom,
  className,
  disabled = false,
}: DataComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredData = React.useMemo(() => {
    if (!searchQuery) return data;

    const lowerQuery = searchQuery.toLowerCase();
    return data.filter(item =>
      item.label.toLowerCase().includes(lowerQuery) ||
      item.description?.toLowerCase().includes(lowerQuery) ||
      item.source.toLowerCase().includes(lowerQuery)
    );
  }, [data, searchQuery]);

  const selectedItem = data.find(item => item.value === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {selectedItem ? (
              <>
                <span className="truncate">{selectedItem.label}</span>
                <SourceBadge source={selectedItem.source} size="sm" />
              </>
            ) : (
              placeholder
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              <div className="flex flex-col items-center gap-2 p-4">
                <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                {allowCustom && onCreateCustom && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onCreateCustom();
                      setOpen(false);
                    }}
                    className="mt-2"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Custom
                  </Button>
                )}
              </div>
            </CommandEmpty>
            <CommandGroup>
              {filteredData.map(item => (
                <CommandItem
                  key={item.value}
                  value={item.value}
                  onSelect={() => {
                    onValueChange(item.value === value ? "" : item.value);
                    setOpen(false);
                  }}
                >
                  <div className="flex items-center w-full gap-2">
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        value === item.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{item.label}</span>
                        <SourceBadge source={item.source} size="xs" />
                      </div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

### Specialized Comboboxes

#### Class Combobox

```typescript
// src/components/data-combobox/ClassCombobox.tsx

import { DataCombobox, DataComboboxItem } from './DataCombobox';
import { useGameData } from '@/contexts/GameDataContext';
import { useCharacter } from '@/contexts/CharacterContext';

export function ClassCombobox() {
  const { classes } = useGameData();
  const { character, updateClass } = useCharacter();

  const classItems: DataComboboxItem[] = classes.map(cls => ({
    value: cls.name.toLowerCase(),
    label: cls.name,
    source: cls.source,
    description: `Hit Die: d${cls.hd.faces} | ${cls.spellcastingAbility ? 'Spellcaster' : 'Non-spellcaster'}`
  }));

  return (
    <DataCombobox
      data={classItems}
      value={character.class?.toLowerCase() || ''}
      onValueChange={(value) => {
        const className = classes.find(c => c.name.toLowerCase() === value)?.name || '';
        updateClass(className);
      }}
      placeholder="Select class..."
      searchPlaceholder="Search classes..."
      emptyMessage="No class found."
    />
  );
}
```

#### Spell Combobox

```typescript
// src/components/data-combobox/SpellCombobox.tsx

export function SpellCombobox({
  spellLevel,
  value,
  onValueChange,
}: {
  spellLevel: number;
  value: string;
  onValueChange: (value: string) => void;
}) {
  const { getAvailableSpells } = useGameData();
  const { character } = useCharacter();

  const spells = getAvailableSpells(
    character.class || '',
    character.level || 1,
    spellLevel
  );

  const spellItems: DataComboboxItem[] = spells.map(spell => ({
    value: `${spell.name}-${spell.source}`.toLowerCase(),
    label: spell.name,
    source: spell.source,
    description: `${getSchoolName(spell.school)} | ${getComponentsString(spell.components)}`
  }));

  return (
    <DataCombobox
      data={spellItems}
      value={value}
      onValueChange={onValueChange}
      placeholder="Select spell..."
      searchPlaceholder="Search spells..."
      emptyMessage="No spells available for this class and level."
    />
  );
}
```

---

## 5. Source Badge System

### Badge Component

```typescript
// src/components/data-combobox/SourceBadge.tsx

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const SOURCE_METADATA: Record<string, {
  color: string;
  label: string;
  fullName: string;
}> = {
  'XPHB': { color: 'bg-blue-500', label: 'PHB24', fullName: "Player's Handbook 2024" },
  'PHB': { color: 'bg-blue-600', label: 'PHB', fullName: "Player's Handbook" },
  'TCE': { color: 'bg-purple-500', label: 'TCE', fullName: "Tasha's Cauldron of Everything" },
  'XGE': { color: 'bg-green-500', label: 'XGE', fullName: "Xanathar's Guide to Everything" },
  'MPMM': { color: 'bg-red-500', label: 'MPMM', fullName: "Mordenkainen Presents: Monsters of the Multiverse" },
  'SCAG': { color: 'bg-amber-500', label: 'SCAG', fullName: "Sword Coast Adventurer's Guide" },
  'ERLW': { color: 'bg-indigo-500', label: 'ERLW', fullName: "Eberron: Rising from the Last War" },
  'DEFAULT': { color: 'bg-gray-500', label: 'Other', fullName: 'Other Source' }
};

export interface SourceBadgeProps {
  source: string;
  size?: 'xs' | 'sm' | 'md';
  showTooltip?: boolean;
  className?: string;
}

export function SourceBadge({
  source,
  size = 'sm',
  showTooltip = true,
  className
}: SourceBadgeProps) {
  const metadata = SOURCE_METADATA[source] || SOURCE_METADATA['DEFAULT'];

  const sizeClasses = {
    xs: 'text-[10px] px-1 py-0',
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1'
  };

  const badge = (
    <Badge
      variant="secondary"
      className={cn(
        metadata.color,
        'text-white font-medium',
        sizeClasses[size],
        className
      )}
    >
      {metadata.label}
    </Badge>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badge}
          </TooltipTrigger>
          <TooltipContent>
            <p>{metadata.fullName}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badge;
}
```

---

## 6. Type Definitions

### Enhanced Character Types

```typescript
// src/types/5etools.ts

export interface DndClass {
  name: string;
  source: string;
  page: number;
  hd: {
    number: number;
    faces: number;
  };
  proficiency: string[]; // Saving throw proficiencies
  spellcastingAbility?: string;
  casterProgression?: 'full' | 'half' | 'third' | 'pact';
  preparedSpells?: string;
  cantripProgression?: number[];
  spellsKnownProgressionFixed?: number[];
  startingProficiencies?: {
    armor?: string[];
    weapons?: string[];
    tools?: string[];
    skills?: Array<{
      choose: {
        from: string[];
        count: number;
      };
    }>;
  };
  startingEquipment?: any;
  multiclassing?: any;
  classFeatures?: ClassFeature[];
  subclasses?: Subclass[];
  reprintedAs?: string[];
}

export interface DndSpell {
  name: string;
  source: string;
  page: number;
  level: number;
  school: string; // "A", "C", "D", "E", "I", "N", "T", "V"
  time: Array<{
    number: number;
    unit: string;
  }>;
  range: {
    type: string;
    distance?: {
      type: string;
      amount: number;
    };
  };
  components: {
    v?: boolean;
    s?: boolean;
    m?: string | { text: string };
  };
  duration: Array<{
    type: string;
    duration?: {
      type: string;
      amount: number;
    };
    concentration?: boolean;
  }>;
  entries: any[];
  entriesHigherLevel?: any[];
  damageInflict?: string[];
  savingThrow?: string[];
  conditionInflict?: string[];
  classes?: {
    fromClassList?: Array<{
      name: string;
      source: string;
    }>;
  };
  reprintedAs?: string[];
}

export interface DndItem {
  name: string;
  source: string;
  page: number;
  type: string;
  rarity: string;
  reqAttune?: string | boolean;
  reqAttuneTags?: Array<{
    class?: string;
    race?: string;
    background?: string;
  }>;
  weight?: number;
  value?: number;
  entries: any[];
  bonusWeapon?: string;
  bonusAc?: string;
  bonusSpellAttack?: string;
  bonusSpellSaveDc?: string;
  wondrous?: boolean;
  weapon?: boolean;
  armor?: boolean;
  reprintedAs?: string[];
}

export interface DndRace {
  name: string;
  source: string;
  page: number;
  size: string[];
  speed: {
    walk: number;
    fly?: number;
    swim?: number;
  };
  ability?: Array<{
    [key: string]: number;
  }>;
  age?: {
    mature: number;
    max: number;
  };
  darkvision?: number;
  traitTags?: string[];
  languageProficiencies?: Array<{
    [key: string]: boolean | number;
  }>;
  skillProficiencies?: Array<{
    [key: string]: boolean;
  }>;
  entries: any[];
  reprintedAs?: string[];
}

export interface DndFeat {
  name: string;
  source: string;
  page: number;
  prerequisite?: Array<{
    level?: number;
    ability?: Array<{
      [key: string]: number;
    }>;
    proficiency?: any[];
    spellcasting?: boolean;
    race?: any[];
    other?: string;
  }>;
  ability?: Array<{
    [key: string]: number;
  }>;
  skillProficiencies?: any[];
  additionalSpells?: any[];
  entries: any[];
  reprintedAs?: string[];
}

export interface DndOptionalFeature {
  name: string;
  source: string;
  page: number;
  featureType: string[]; // "EI" = Eldritch Invocation, "FS" = Fighting Style, etc.
  prerequisite?: Array<{
    level?: {
      level: number;
      class?: {
        name: string;
        source: string;
      };
    };
    spell?: string[];
    patron?: string;
    pact?: string;
  }>;
  entries: any[];
  reprintedAs?: string[];
}
```

---

## 7. Implementation Phases

### Phase 8: Data Infrastructure (Week 1)

**Goal**: Set up deduplication and class-based auto-update systems

**Tasks**:
1. ✅ Implement DataDeduplicator class
2. ✅ Create source priority system
3. ✅ Build ClassAutoUpdateEngine
4. ✅ Update data loaders with deduplication
5. ✅ Add deduplication statistics logging
6. ✅ Create auto-update trigger system

**Testing**:
- Unit tests for deduplicator
- Verify source priority ordering
- Test auto-update rules for each class

**Deliverables**:
- Deduplication system
- Auto-update engine
- Enhanced data loaders
- Unit tests

---

### Phase 9: Combobox Components (Week 2)

**Goal**: Build shadcn-based combobox components with source badges

**Tasks**:
1. ✅ Create base DataCombobox component
2. ✅ Implement SourceBadge component
3. ✅ Build ClassCombobox with auto-updates
4. ✅ Build SpellCombobox with filtering
5. ✅ Build ItemCombobox with restrictions
6. ✅ Build RaceCombobox, FeatCombobox
7. ✅ Add search and filter logic

**Testing**:
- Component visual tests
- Search functionality tests
- Badge rendering tests
- Auto-update integration tests

**Deliverables**:
- 6+ specialized comboboxes
- Source badge system
- Search/filter utilities
- Component tests

---

### Phase 10: UI Integration (Week 3)

**Goal**: Replace existing inputs with new comboboxes

**Tasks**:
1. ✅ Update BasicInfoTab with ClassCombobox
2. ✅ Update SpellcastingTab with SpellCombobox
3. ✅ Update EquipmentTab with ItemCombobox
4. ✅ Test auto-update behaviors
5. ✅ Add visual feedback for auto-updates

**Testing**:
- End-to-end user flows
- Auto-update verification
- Cross-tab synchronization

**Deliverables**:
- Updated tab components
- Auto-update visual feedback
- Integration tests

---

### Phase 11: Testing & Optimization (Week 4)

**Goal**: Comprehensive testing and performance optimization

**Tasks**:
1. ✅ Unit tests for all systems
2. ✅ Integration tests for workflows
3. ✅ Performance optimization
4. ✅ Accessibility audit
5. ✅ Documentation

**Deliverables**:
- 90%+ test coverage
- Performance benchmarks
- Accessibility compliance
- Complete documentation

---

## 8. API Specifications

### GameDataContext API

```typescript
export interface GameDataContextType {
  // Core Data (Deduplicated)
  classes: DndClass[];
  races: DndRace[];
  spells: DndSpell[];
  items: DndItem[];
  feats: DndFeat[];
  optionalFeatures: DndOptionalFeature[];
  backgrounds: DndBackground[];
  languages: DndLanguage[];

  // Filtered Data Methods
  getAvailableSpells: (
    characterClass: string,
    level: number,
    spellLevel?: number
  ) => DndSpell[];

  getAvailableFeatures: (
    characterClass: string,
    level: number,
    featureType?: string
  ) => DndOptionalFeature[];

  getAvailableItems: (
    characterClass?: string,
    rarity?: string
  ) => DndItem[];

  // Auto-Update Methods
  getClassAutoUpdateRules: (className: string) => ClassAutoUpdateRules | null;
  applyClassAutoUpdates: (
    character: Character,
    className: string
  ) => Partial<Character>;

  // Custom Objects
  customObjects: CustomObject[];
  addCustomObject: (object: CustomObject) => void;
  updateCustomObject: (id: string, object: Partial<CustomObject>) => void;
  deleteCustomObject: (id: string) => void;

  // Loading State
  isLoading: boolean;
  error: Error | null;

  // Statistics
  getDeduplicationStats: () => Record<string, DeduplicationStats>;
}
```

### CharacterContext API

```typescript
export interface CharacterContextType {
  character: Character;

  // Class-based updates
  updateClass: (className: string) => void; // Triggers auto-updates

  // Other updates
  updateAttribute: (attr: keyof Attributes, score: number) => void;
  updateLevel: (level: number) => void;
  updateRace: (race: string) => void;

  // Spell management
  addSpell: (spell: DndSpell, level: number) => void;
  removeSpell: (spellId: string) => void;
  togglePreparedSpell: (spellId: string) => void;

  // Equipment management
  addItem: (item: DndItem) => void;
  removeItem: (itemId: string) => void;

  // Feature management
  addFeature: (feature: DndOptionalFeature) => void;
  removeFeature: (featureId: string) => void;

  // Validation
  validateCharacter: () => ValidationResult;

  // Persistence
  saveCharacter: () => void;
  loadCharacter: (id: string) => void;
  exportCharacter: () => string;
  importCharacter: (json: string) => void;
}
```

---

## Summary

This design document provides a comprehensive plan for embedding 5e.tools data directly into the character sheet with:

✅ **Intelligent Deduplication**: Source priority system removes duplicates
✅ **Class-Based Auto-Updates**: Automatic field updates when class changes
✅ **Shadcn Comboboxes**: Modern, accessible UI components
✅ **Source Badges**: Visual indicators showing data source
✅ **Type-Safe**: Full TypeScript coverage
✅ **Performance Optimized**: Lazy loading, memoization, indexed search
✅ **Tested**: Comprehensive test coverage planned

---

**Document Version**: 1.0
**Last Updated**: 2025-11-28
**Status**: Ready for Implementation
**Next Phase**: Phase 8 - Data Infrastructure
