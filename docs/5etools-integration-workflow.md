# 5eTools Data Integration Workflow

## Overview
This document outlines the comprehensive workflow for integrating 5eTools data directly into the D&D 5e Online Character Sheet. The integration will embed race, class, spell, item, feat, and feature data from the `5etools-src` folder, replacing reliance on third-party websites with searchable, filterable comboboxes using shadcn/ui components.

**Status**: Design & Planning Phase
**Date**: 2025-11-27
**Dependencies**: Phase 7 Complete (Testing Infrastructure)

---

## Table of Contents
1. [Project Context](#1-project-context)
2. [5eTools Data Structure Analysis](#2-5etools-data-structure-analysis)
3. [Integration Architecture](#3-integration-architecture)
4. [Combobox Component Design](#4-combobox-component-design)
5. [Class-Based Conditional Logic](#5-class-based-conditional-logic)
6. [Custom Object Creation](#6-custom-object-creation)
7. [Implementation Phases](#7-implementation-phases)
8. [Data Processing Pipeline](#8-data-processing-pipeline)
9. [Testing Strategy](#9-testing-strategy)
10. [Performance Considerations](#10-performance-considerations)

---

## 1. Project Context

### Current State
The D&D 5e Character Sheet application has completed **7 phases** of development:
- ✅ Phase 1: Project Setup & Dependencies
- ✅ Phase 2: Core Data Layer
- ✅ Phase 3: Basic UI Components
- ✅ Phase 4: Tab Implementation
- ✅ Phase 5: Validation & Business Logic
- ✅ Phase 6: Styling & UX Enhancements
- ✅ Phase 7: Testing & Optimization (64% test coverage)

### Technology Stack
- **Framework**: React 19.2.0 with TypeScript
- **Build Tool**: Vite 7.2.4
- **Styling**: Tailwind CSS 4.1.17
- **UI Components**: shadcn/ui + Magic UI
- **State Management**: React Context API
- **Data Persistence**: LocalStorage

### Integration Goal
Embed comprehensive D&D 5e data directly into the character sheet to:
1. **Eliminate third-party dependencies** - No reliance on external websites
2. **Provide rich, searchable data** - Classes, spells, items, feats, features
3. **Enable intelligent filtering** - Class-based conditionals for valid options
4. **Support customization** - Allow users to create custom objects when needed
5. **Improve UX** - Searchable comboboxes with autocomplete

---

## 2. 5eTools Data Structure Analysis

### Available Data Files

#### Core Character Building Data
```
5etools-src/data/
├── class/
│   ├── class-wizard.json         # Class definitions
│   ├── class-barbarian.json
│   ├── class-fighter.json
│   └── ... (12 core classes)
├── races.json                    # All playable races
├── backgrounds.json              # Character backgrounds
├── feats.json                    # Character feats
├── optionalfeatures.json         # Class features, invocations
├── items.json                    # Equipment and magic items
├── items-base.json               # Basic equipment
└── spells/
    ├── spells-phb.json           # Player's Handbook spells
    ├── spells-xge.json           # Xanathar's Guide spells
    └── ... (additional sources)
```

### Data Schema Examples

#### Class Data Structure
```json
{
  "class": [
    {
      "name": "Wizard",
      "source": "PHB",
      "page": 112,
      "hd": { "number": 1, "faces": 6 },
      "proficiency": ["int", "wis"],
      "spellcastingAbility": "int",
      "casterProgression": "full",
      "preparedSpells": "<$level$> + <$int_mod$>",
      "cantripProgression": [3, 3, 3, 4, 4, ...],
      "startingProficiencies": {
        "weapons": ["dagger", "dart", "sling", "quarterstaff", "light crossbow"],
        "skills": [
          {
            "choose": {
              "from": ["arcana", "history", "insight", "investigation", "medicine", "religion"],
              "count": 2
            }
          }
        ]
      },
      "startingEquipment": { ... },
      "multiclassing": { "requirements": { "int": 13 } },
      "classFeatures": [ ... ]
    }
  ]
}
```

#### Race Data Structure
```json
{
  "race": [
    {
      "name": "Aarakocra",
      "source": "EEPC",
      "size": ["M"],
      "speed": { "walk": 25, "fly": 50 },
      "ability": [{ "dex": 2, "wis": 1 }],
      "age": { "mature": 3, "max": 30 },
      "languageProficiencies": [
        { "common": true, "auran": true }
      ],
      "entries": [ ... ]
    }
  ]
}
```

#### Spell Data Structure
```json
{
  "spell": [
    {
      "name": "Acid Splash",
      "source": "PHB",
      "level": 0,
      "school": "C",
      "time": [{ "number": 1, "unit": "action" }],
      "range": { "type": "point", "distance": { "type": "feet", "amount": 60 } },
      "components": { "v": true, "s": true },
      "duration": [{ "type": "instant" }],
      "entries": [ ... ],
      "damageInflict": ["acid"],
      "savingThrow": ["dexterity"],
      "classes": { "fromClassList": [{ "name": "Sorcerer", "source": "PHB" }] }
    }
  ]
}
```

#### Item Data Structure
```json
{
  "item": [
    {
      "name": "+1 Arcane Grimoire",
      "source": "TCE",
      "rarity": "uncommon",
      "reqAttune": "by a wizard",
      "wondrous": true,
      "weight": 3,
      "bonusSpellAttack": "+1",
      "bonusSpellSaveDc": "+1",
      "entries": [ ... ]
    }
  ]
}
```

#### Feat Data Structure
```json
{
  "feat": [
    {
      "name": "Aberrant Dragonmark",
      "source": "ERLW",
      "prerequisite": [{ "other": "No other dragonmark" }],
      "ability": [{ "con": 1 }],
      "additionalSpells": [ ... ],
      "entries": [ ... ]
    }
  ]
}
```

#### Optional Features (Class Features)
```json
{
  "optionalfeature": [
    {
      "name": "Agonizing Blast",
      "source": "PHB",
      "featureType": ["EI"],
      "prerequisite": [{ "spell": ["eldritch blast#c"] }],
      "entries": [ ... ]
    }
  ]
}
```

### Key Observations

1. **Structured JSON Format**: All data follows consistent schema patterns
2. **Cross-References**: Objects reference each other via source/name pairs
3. **Rich Metadata**: Includes prerequisites, sources, page numbers
4. **Hierarchical Data**: Classes contain subclasses, features, spell progressions
5. **Conditional Logic**: Prerequisites and requirements for features/spells
6. **Multiple Sources**: PHB, TCE, XGTE, and many more sourcebooks

---

## 3. Integration Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Character Sheet UI                        │
│  ┌────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ Class      │  │ Race         │  │ Spells       │        │
│  │ Combobox   │  │ Combobox     │  │ Combobox     │        │
│  └─────┬──────┘  └──────┬───────┘  └──────┬───────┘        │
│        │                │                  │                 │
└────────┼────────────────┼──────────────────┼─────────────────┘
         │                │                  │
         ▼                ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│              Data Integration Layer                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  GameDataContext (React Context)                     │   │
│  │  - Classes, Races, Spells, Items, Feats, Features   │   │
│  │  - Filtered/Searchable Data                          │   │
│  │  - Custom Objects Management                         │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              Data Processing Pipeline                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ JSON Loader  │→ │ Parser       │→ │ Transformer  │     │
│  │ (Lazy Load)  │  │ (Normalize)  │  │ (Index/Cache)│     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                  5eTools JSON Data                           │
│  classes/ | races.json | spells/ | items.json | feats.json │
└─────────────────────────────────────────────────────────────┘
```

### Core Components

#### 1. Data Processing Layer
**Location**: `src/data/5etools/`

```typescript
// src/data/5etools/loaders.ts
export async function loadClasses(): Promise<Class[]>
export async function loadRaces(): Promise<Race[]>
export async function loadSpells(): Promise<Spell[]>
export async function loadItems(): Promise<Item[]>
export async function loadFeats(): Promise<Feat[]>
export async function loadOptionalFeatures(): Promise<OptionalFeature[]>

// src/data/5etools/parsers.ts
export function parseClass(rawClass: any): Class
export function parseRace(rawRace: any): Race
export function parseSpell(rawSpell: any): Spell
```

#### 2. Data Context Layer
**Location**: `src/contexts/GameDataContext.tsx`

```typescript
interface GameDataContextType {
  // Core Data
  classes: Class[]
  races: Race[]
  spells: Spell[]
  items: Item[]
  feats: Feat[]
  optionalFeatures: OptionalFeature[]

  // Filtered Data (based on character state)
  getAvailableSpells: (characterClass: string, level: number) => Spell[]
  getAvailableFeatures: (characterClass: string, level: number) => OptionalFeature[]
  getAvailableItems: (characterClass?: string) => Item[]

  // Custom Objects
  customObjects: CustomObject[]
  addCustomObject: (type: string, object: CustomObject) => void

  // Loading State
  isLoading: boolean
  error: Error | null
}
```

#### 3. Combobox Components
**Location**: `src/components/data-combobox/`

```typescript
// Generic reusable combobox with 5etools data integration
interface DataComboboxProps<T> {
  data: T[]
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  searchPlaceholder: string
  emptyMessage: string
  allowCustom?: boolean
  onCreateCustom?: () => void
  filterFn?: (item: T, query: string) => boolean
  renderItem?: (item: T) => React.ReactNode
  getItemValue: (item: T) => string
  getItemLabel: (item: T) => string
}
```

---

## 4. Combobox Component Design

### Shadcn Combobox Integration

Based on shadcn/ui documentation, we'll use the **Combobox** component pattern:

```tsx
// src/components/data-combobox/DataCombobox.tsx
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
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

interface DataComboboxProps<T> {
  data: T[]
  value: string
  onValueChange: (value: string) => void
  placeholder: string
  searchPlaceholder: string
  emptyMessage?: string
  allowCustom?: boolean
  onCreateCustom?: () => void
  filterFn?: (item: T, query: string) => boolean
  getItemValue: (item: T) => string
  getItemLabel: (item: T) => string
  getItemDescription?: (item: T) => string
  className?: string
}

export function DataCombobox<T>({
  data,
  value,
  onValueChange,
  placeholder,
  searchPlaceholder,
  emptyMessage = "No results found.",
  allowCustom = false,
  onCreateCustom,
  filterFn,
  getItemValue,
  getItemLabel,
  getItemDescription,
  className,
}: DataComboboxProps<T>) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredData = React.useMemo(() => {
    if (!searchQuery) return data

    return data.filter((item) => {
      if (filterFn) {
        return filterFn(item, searchQuery)
      }
      // Default filter: search in label
      const label = getItemLabel(item).toLowerCase()
      return label.includes(searchQuery.toLowerCase())
    })
  }, [data, searchQuery, filterFn, getItemLabel])

  const selectedItem = data.find((item) => getItemValue(item) === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedItem ? getItemLabel(selectedItem) : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
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
                      onCreateCustom()
                      setOpen(false)
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
              {filteredData.map((item) => {
                const itemValue = getItemValue(item)
                const itemLabel = getItemLabel(item)
                const itemDescription = getItemDescription?.(item)

                return (
                  <CommandItem
                    key={itemValue}
                    value={itemValue}
                    onSelect={() => {
                      onValueChange(itemValue === value ? "" : itemValue)
                      setOpen(false)
                    }}
                  >
                    <div className="flex items-center w-full">
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === itemValue ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{itemLabel}</div>
                        {itemDescription && (
                          <div className="text-xs text-muted-foreground">
                            {itemDescription}
                          </div>
                        )}
                      </div>
                    </div>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
```

### Specialized Combobox Implementations

#### Class Combobox
```tsx
// src/components/data-combobox/ClassCombobox.tsx
import { DataCombobox } from './DataCombobox'
import { useGameData } from '@/contexts/GameDataContext'

export function ClassCombobox({
  value,
  onValueChange,
}: {
  value: string
  onValueChange: (value: string) => void
}) {
  const { classes, customObjects, addCustomObject } = useGameData()

  const allClasses = [
    ...classes,
    ...customObjects.filter((obj) => obj.type === 'class'),
  ]

  return (
    <DataCombobox
      data={allClasses}
      value={value}
      onValueChange={onValueChange}
      placeholder="Select class..."
      searchPlaceholder="Search classes..."
      emptyMessage="No class found."
      allowCustom={true}
      onCreateCustom={() => {
        // Open custom class creation dialog
      }}
      getItemValue={(item) => item.name}
      getItemLabel={(item) => item.name}
      getItemDescription={(item) =>
        `${item.source} - Hit Die: d${item.hd.faces}`
      }
      filterFn={(item, query) => {
        const lowerQuery = query.toLowerCase()
        return (
          item.name.toLowerCase().includes(lowerQuery) ||
          item.source.toLowerCase().includes(lowerQuery)
        )
      }}
    />
  )
}
```

#### Spell Combobox (with class filtering)
```tsx
// src/components/data-combobox/SpellCombobox.tsx
export function SpellCombobox({
  value,
  onValueChange,
  characterClass,
  characterLevel,
  spellLevel,
}: {
  value: string
  onValueChange: (value: string) => void
  characterClass: string
  characterLevel: number
  spellLevel: number
}) {
  const { getAvailableSpells, customObjects } = useGameData()

  // Filter spells based on class and level
  const availableSpells = getAvailableSpells(characterClass, characterLevel)
    .filter((spell) => spell.level === spellLevel)

  const customSpells = customObjects.filter(
    (obj) => obj.type === 'spell' && obj.level === spellLevel
  )

  const allSpells = [...availableSpells, ...customSpells]

  return (
    <DataCombobox
      data={allSpells}
      value={value}
      onValueChange={onValueChange}
      placeholder="Select spell..."
      searchPlaceholder="Search spells..."
      emptyMessage="No spells available for this class/level."
      allowCustom={true}
      getItemValue={(item) => item.name}
      getItemLabel={(item) => item.name}
      getItemDescription={(item) =>
        `${item.school} - ${item.components.v ? 'V' : ''}${item.components.s ? 'S' : ''}${item.components.m ? 'M' : ''}`
      }
    />
  )
}
```

---

## 5. Class-Based Conditional Logic

### Requirements System

The system must enforce class-based restrictions:
- **Spells**: Only show spells available to the selected class
- **Features**: Filter class features based on class and level
- **Equipment**: Show items with class restrictions (e.g., "by a wizard")
- **Skills**: Limit skill proficiencies to class options
- **Saving Throws**: Auto-set proficient saves based on class

### Implementation

```typescript
// src/utils/5etools/filters.ts

export function filterSpellsByClass(
  spells: Spell[],
  characterClass: string,
  level: number
): Spell[] {
  return spells.filter((spell) => {
    // Check if spell is available to this class
    const availableToClass = spell.classes?.fromClassList?.some(
      (cls) => cls.name.toLowerCase() === characterClass.toLowerCase()
    ) ?? false

    if (!availableToClass) return false

    // Check if character level is high enough to cast this spell
    const classData = getClassData(characterClass)
    const spellSlots = getSpellSlotsForLevel(classData, level)

    return spell.level <= spellSlots.maxSpellLevel
  })
}

export function filterFeaturesByClass(
  features: OptionalFeature[],
  characterClass: string,
  level: number
): OptionalFeature[] {
  return features.filter((feature) => {
    // Check class prerequisite
    const meetsClassRequirement = feature.prerequisite?.some((prereq) => {
      if (prereq.level?.class?.name) {
        return prereq.level.class.name.toLowerCase() === characterClass.toLowerCase()
      }
      return true
    }) ?? true

    // Check level prerequisite
    const meetsLevelRequirement = feature.prerequisite?.every((prereq) => {
      if (prereq.level?.level) {
        return level >= prereq.level.level
      }
      return true
    }) ?? true

    return meetsClassRequirement && meetsLevelRequirement
  })
}

export function filterItemsByClass(
  items: Item[],
  characterClass?: string
): Item[] {
  if (!characterClass) return items

  return items.filter((item) => {
    // If no attunement requirement, available to all
    if (!item.reqAttune) return true

    // Check if attunement is class-specific
    if (item.reqAttuneTags) {
      return item.reqAttuneTags.some((tag) => {
        return tag.class?.toLowerCase() === characterClass.toLowerCase()
      })
    }

    // If has attunement but no class restriction, available to all
    return true
  })
}
```

### Reactive Filtering Hook

```typescript
// src/hooks/use5eToolsFilters.ts

export function use5eToolsFilters(character: Character) {
  const { classes, spells, items, optionalFeatures } = useGameData()

  const availableSpells = React.useMemo(() => {
    if (!character.class) return []
    return filterSpellsByClass(spells, character.class, character.level)
  }, [spells, character.class, character.level])

  const availableFeatures = React.useMemo(() => {
    if (!character.class) return []
    return filterFeaturesByClass(optionalFeatures, character.class, character.level)
  }, [optionalFeatures, character.class, character.level])

  const availableItems = React.useMemo(() => {
    return filterItemsByClass(items, character.class)
  }, [items, character.class])

  return {
    availableSpells,
    availableFeatures,
    availableItems,
  }
}
```

---

## 6. Custom Object Creation

### Custom Object Dialog

```tsx
// src/components/dialogs/CreateCustomObjectDialog.tsx

interface CreateCustomObjectDialogProps {
  type: 'class' | 'race' | 'spell' | 'item' | 'feat' | 'feature'
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (object: CustomObject) => void
}

export function CreateCustomObjectDialog({
  type,
  open,
  onOpenChange,
  onSave,
}: CreateCustomObjectDialogProps) {
  const [formData, setFormData] = React.useState<Partial<CustomObject>>({
    type,
    source: 'Custom',
  })

  const handleSave = () => {
    const customObject: CustomObject = {
      ...formData,
      id: generateId(),
      isCustom: true,
    } as CustomObject

    onSave(customObject)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Custom {type}</DialogTitle>
          <DialogDescription>
            Create a custom {type} that isn't in the standard data.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dynamic form fields based on type */}
          {type === 'spell' && <CustomSpellForm data={formData} onChange={setFormData} />}
          {type === 'item' && <CustomItemForm data={formData} onChange={setFormData} />}
          {/* ... other forms */}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Create Custom {type}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### Custom Object Storage

```typescript
// src/contexts/GameDataContext.tsx

export function GameDataProvider({ children }: { children: React.ReactNode }) {
  const [customObjects, setCustomObjects] = useState<CustomObject[]>(() => {
    const stored = localStorage.getItem('customObjects')
    return stored ? JSON.parse(stored) : []
  })

  const addCustomObject = (object: CustomObject) => {
    setCustomObjects((prev) => {
      const updated = [...prev, object]
      localStorage.setItem('customObjects', JSON.stringify(updated))
      return updated
    })
  }

  const removeCustomObject = (id: string) => {
    setCustomObjects((prev) => {
      const updated = prev.filter((obj) => obj.id !== id)
      localStorage.setItem('customObjects', JSON.stringify(updated))
      return updated
    })
  }

  return (
    <GameDataContext.Provider value={{
      customObjects,
      addCustomObject,
      removeCustomObject,
      // ... other values
    }}>
      {children}
    </GameDataContext.Provider>
  )
}
```

---

## 7. Implementation Phases

### Phase 8: Data Infrastructure (Week 1)

**Goal**: Set up 5eTools data loading and processing infrastructure

**Tasks**:
1. ✅ Create data loading utilities
   - `src/data/5etools/loaders.ts`
   - Lazy loading for large data files
   - Error handling and retry logic

2. ✅ Create data type definitions
   - `src/types/5etools.ts`
   - TypeScript interfaces for all data types
   - Extend existing `Character` type

3. ✅ Build GameDataContext
   - `src/contexts/GameDataContext.tsx`
   - Centralized data management
   - Loading states and error handling

4. ✅ Create data parsers
   - `src/data/5etools/parsers.ts`
   - Normalize 5eTools JSON to app format
   - Handle edge cases and missing data

**Deliverables**:
- Data loading infrastructure
- Type-safe interfaces
- GameDataContext provider
- Unit tests for parsers

---

### Phase 9: Combobox Components (Week 2)

**Goal**: Build reusable combobox components with search and filtering

**Tasks**:
1. ✅ Create base DataCombobox component
   - `src/components/data-combobox/DataCombobox.tsx`
   - Searchable, filterable
   - Custom object support

2. ✅ Build specialized comboboxes
   - `ClassCombobox.tsx`
   - `RaceCombobox.tsx`
   - `SpellCombobox.tsx`
   - `ItemCombobox.tsx`
   - `FeatCombobox.tsx`

3. ✅ Add custom object creation dialogs
   - `CreateCustomObjectDialog.tsx`
   - Type-specific forms
   - Validation and storage

4. ✅ Implement search and filter logic
   - `src/utils/5etools/search.ts`
   - Fuzzy matching
   - Multi-field search

**Deliverables**:
- Reusable combobox component
- 5 specialized comboboxes
- Custom object creation system
- Component tests

---

### Phase 10: Class-Based Filtering (Week 3)

**Goal**: Implement intelligent class-based conditional filtering

**Tasks**:
1. ✅ Create filter utilities
   - `src/utils/5etools/filters.ts`
   - Class-based spell filtering
   - Level-based feature filtering
   - Item restriction filtering

2. ✅ Build filtering hooks
   - `src/hooks/use5eToolsFilters.ts`
   - Reactive data filtering
   - Performance optimization

3. ✅ Integrate with character state
   - Update CharacterContext
   - Auto-update on class/level change

4. ✅ Add validation logic
   - Prevent invalid selections
   - Show helpful error messages

**Deliverables**:
- Filtering utilities
- Reactive filtering hooks
- Integration with character state
- Filter logic tests

---

### Phase 11: UI Integration (Week 4)

**Goal**: Replace existing inputs with data-driven comboboxes

**Tasks**:
1. ✅ Update BasicInfoTab
   - Replace class select with ClassCombobox
   - Replace race select with RaceCombobox
   - Add background combobox

2. ✅ Update SpellcastingTab
   - Replace spell inputs with SpellCombobox
   - Add spell filtering by class/level
   - Implement prepared spell tracking

3. ✅ Update EquipmentTab
   - Replace equipment inputs with ItemCombobox
   - Add item filtering
   - Track magical items separately

4. ✅ Update SkillsTab
   - Add feat combobox
   - Add feature combobox
   - Update skill proficiencies

5. ✅ Add visual enhancements
   - Data source badges (PHB, TCE, etc.)
   - Prerequisite warnings
   - Tooltips with full descriptions

**Deliverables**:
- Updated tab components
- Data-driven UI
- Visual enhancements
- Integration tests

---

### Phase 12: Custom Objects & Polish (Week 5)

**Goal**: Finalize custom object system and polish UX

**Tasks**:
1. ✅ Complete custom object forms
   - Custom spell form
   - Custom item form
   - Custom feat form
   - Custom feature form

2. ✅ Add object management
   - Edit custom objects
   - Delete custom objects
   - Export/import custom objects

3. ✅ Performance optimization
   - Lazy load data files
   - Memoize filtered results
   - Optimize search algorithms

4. ✅ Accessibility improvements
   - Keyboard navigation
   - Screen reader support
   - ARIA labels

5. ✅ Documentation
   - User guide for custom objects
   - Developer documentation
   - API reference

**Deliverables**:
- Complete custom object system
- Performance optimizations
- Accessibility compliance
- Comprehensive documentation

---

### Phase 13: Testing & Deployment (Week 6)

**Goal**: Comprehensive testing and production deployment

**Tasks**:
1. ✅ Unit tests
   - Data loaders
   - Parsers
   - Filters
   - Search utilities

2. ✅ Component tests
   - DataCombobox
   - Specialized comboboxes
   - Custom object dialogs

3. ✅ Integration tests
   - Character creation flow
   - Class/level changes
   - Spell selection
   - Equipment management

4. ✅ E2E tests
   - Full character build
   - Custom object creation
   - Data persistence

5. ✅ Performance testing
   - Load time benchmarks
   - Search performance
   - Memory usage

6. ✅ Deployment
   - Build optimization
   - Bundle size analysis
   - Production deployment

**Deliverables**:
- 90%+ test coverage
- Performance benchmarks
- Production-ready build
- Deployment documentation

---

## 8. Data Processing Pipeline

### Data Loading Strategy

```typescript
// src/data/5etools/loaders.ts

/**
 * Lazy load data files only when needed
 * Cache loaded data to prevent re-fetching
 */

const dataCache = new Map<string, any>()

export async function loadClasses(): Promise<Class[]> {
  if (dataCache.has('classes')) {
    return dataCache.get('classes')
  }

  try {
    // Load all class files
    const classFiles = [
      'class-barbarian.json',
      'class-bard.json',
      'class-cleric.json',
      'class-druid.json',
      'class-fighter.json',
      'class-monk.json',
      'class-paladin.json',
      'class-ranger.json',
      'class-rogue.json',
      'class-sorcerer.json',
      'class-warlock.json',
      'class-wizard.json',
    ]

    const promises = classFiles.map((file) =>
      fetch(`/5etools-src/data/class/${file}`).then((res) => res.json())
    )

    const results = await Promise.all(promises)
    const classes = results.flatMap((data) => data.class || [])

    // Parse and normalize
    const parsed = classes.map(parseClass)

    dataCache.set('classes', parsed)
    return parsed
  } catch (error) {
    console.error('Failed to load classes:', error)
    throw new Error('Unable to load class data')
  }
}

export async function loadSpells(): Promise<Spell[]> {
  if (dataCache.has('spells')) {
    return dataCache.get('spells')
  }

  try {
    // Load core spell files
    const spellFiles = [
      'spells-phb.json',
      'spells-xge.json',
      'spells-tce.json',
      // Add more as needed
    ]

    const promises = spellFiles.map((file) =>
      fetch(`/5etools-src/data/spells/${file}`).then((res) => res.json())
    )

    const results = await Promise.all(promises)
    const spells = results.flatMap((data) => data.spell || [])

    const parsed = spells.map(parseSpell)

    dataCache.set('spells', parsed)
    return parsed
  } catch (error) {
    console.error('Failed to load spells:', error)
    throw new Error('Unable to load spell data')
  }
}
```

### Data Parsing & Normalization

```typescript
// src/data/5etools/parsers.ts

export function parseClass(raw: any): Class {
  return {
    id: `${raw.name.toLowerCase()}-${raw.source}`,
    name: raw.name,
    source: raw.source,
    page: raw.page,
    hitDice: {
      number: raw.hd.number,
      faces: raw.hd.faces,
    },
    proficiencies: {
      armor: raw.startingProficiencies?.armor || [],
      weapons: raw.startingProficiencies?.weapons || [],
      tools: raw.startingProficiencies?.tools || [],
      savingThrows: raw.proficiency || [],
      skills: parseSkillChoice(raw.startingProficiencies?.skills),
    },
    spellcasting: raw.spellcastingAbility ? {
      ability: raw.spellcastingAbility,
      progression: raw.casterProgression,
      cantrips: raw.cantripProgression || [],
      preparedSpells: raw.preparedSpells,
    } : null,
    features: raw.classFeatures || [],
    subclasses: raw.subclasses || [],
  }
}

export function parseSpell(raw: any): Spell {
  return {
    id: `${raw.name.toLowerCase()}-${raw.source}`,
    name: raw.name,
    source: raw.source,
    page: raw.page,
    level: raw.level,
    school: raw.school,
    castingTime: raw.time,
    range: raw.range,
    components: {
      verbal: raw.components.v || false,
      somatic: raw.components.s || false,
      material: raw.components.m || null,
    },
    duration: raw.duration,
    description: raw.entries,
    classes: raw.classes?.fromClassList?.map((cls: any) => cls.name) || [],
    ritual: raw.meta?.ritual || false,
    concentration: raw.duration?.some((d: any) => d.concentration) || false,
  }
}

function parseSkillChoice(skillData: any): SkillChoice {
  if (!skillData || !skillData.length) return null

  const choice = skillData[0].choose
  if (!choice) return null

  return {
    from: choice.from,
    count: choice.count,
  }
}
```

### Indexing & Search Optimization

```typescript
// src/data/5etools/search.ts

/**
 * Build search index for fast lookups
 */
export class SearchIndex<T> {
  private index: Map<string, T[]> = new Map()
  private items: T[] = []

  constructor(
    items: T[],
    private getSearchTerms: (item: T) => string[]
  ) {
    this.items = items
    this.buildIndex()
  }

  private buildIndex() {
    this.items.forEach((item) => {
      const terms = this.getSearchTerms(item)
      terms.forEach((term) => {
        const normalized = term.toLowerCase()
        if (!this.index.has(normalized)) {
          this.index.set(normalized, [])
        }
        this.index.get(normalized)!.push(item)
      })
    })
  }

  search(query: string): T[] {
    const normalized = query.toLowerCase()
    const results = new Set<T>()

    // Exact match
    if (this.index.has(normalized)) {
      this.index.get(normalized)!.forEach((item) => results.add(item))
    }

    // Partial match
    this.index.forEach((items, term) => {
      if (term.includes(normalized)) {
        items.forEach((item) => results.add(item))
      }
    })

    return Array.from(results)
  }
}

// Example usage
export function createSpellIndex(spells: Spell[]): SearchIndex<Spell> {
  return new SearchIndex(spells, (spell) => [
    spell.name,
    spell.source,
    spell.school,
    ...spell.classes,
  ])
}
```

---

## 9. Testing Strategy

### Unit Tests

```typescript
// src/data/5etools/__tests__/parsers.test.ts

describe('parseClass', () => {
  it('should parse basic class data', () => {
    const raw = {
      name: 'Wizard',
      source: 'PHB',
      hd: { number: 1, faces: 6 },
      proficiency: ['int', 'wis'],
    }

    const parsed = parseClass(raw)

    expect(parsed.name).toBe('Wizard')
    expect(parsed.hitDice.faces).toBe(6)
    expect(parsed.proficiencies.savingThrows).toEqual(['int', 'wis'])
  })

  it('should handle spellcasting classes', () => {
    const raw = {
      name: 'Wizard',
      source: 'PHB',
      hd: { number: 1, faces: 6 },
      spellcastingAbility: 'int',
      casterProgression: 'full',
    }

    const parsed = parseClass(raw)

    expect(parsed.spellcasting).toBeDefined()
    expect(parsed.spellcasting?.ability).toBe('int')
    expect(parsed.spellcasting?.progression).toBe('full')
  })
})
```

### Component Tests

```typescript
// src/components/data-combobox/__tests__/DataCombobox.test.tsx

describe('DataCombobox', () => {
  const mockData = [
    { id: '1', name: 'Wizard', source: 'PHB' },
    { id: '2', name: 'Fighter', source: 'PHB' },
  ]

  it('should render with placeholder', () => {
    render(
      <DataCombobox
        data={mockData}
        value=""
        onValueChange={vi.fn()}
        placeholder="Select class..."
        searchPlaceholder="Search..."
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
      />
    )

    expect(screen.getByRole('combobox')).toHaveTextContent('Select class...')
  })

  it('should filter items on search', async () => {
    const user = userEvent.setup()

    render(
      <DataCombobox
        data={mockData}
        value=""
        onValueChange={vi.fn()}
        placeholder="Select class..."
        searchPlaceholder="Search..."
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
      />
    )

    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByPlaceholderText('Search...'), 'Wiz')

    expect(screen.getByText('Wizard')).toBeInTheDocument()
    expect(screen.queryByText('Fighter')).not.toBeInTheDocument()
  })

  it('should show custom create option when no results', async () => {
    const onCreateCustom = vi.fn()

    render(
      <DataCombobox
        data={mockData}
        value=""
        onValueChange={vi.fn()}
        placeholder="Select class..."
        searchPlaceholder="Search..."
        allowCustom={true}
        onCreateCustom={onCreateCustom}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
      />
    )

    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.type(screen.getByPlaceholderText('Search...'), 'NonExistent')

    expect(screen.getByText(/Create Custom/i)).toBeInTheDocument()
  })
})
```

### Integration Tests

```typescript
// src/__tests__/integration/character-creation.test.tsx

describe('Character Creation Flow', () => {
  it('should filter spells based on selected class', async () => {
    const { user } = setup(<CharacterSheet />)

    // Select Wizard class
    await user.click(screen.getByRole('combobox', { name: /class/i }))
    await user.click(screen.getByText('Wizard'))

    // Navigate to spells tab
    await user.click(screen.getByRole('tab', { name: /spells/i }))

    // Open spell selection
    await user.click(screen.getByRole('combobox', { name: /cantrip/i }))

    // Verify only wizard spells are shown
    expect(screen.getByText('Mage Hand')).toBeInTheDocument()
    expect(screen.queryByText('Eldritch Blast')).not.toBeInTheDocument()
  })

  it('should update available features when level increases', async () => {
    const { user } = setup(<CharacterSheet />)

    // Set class to Warlock
    await selectClass('Warlock')

    // Set level to 2
    await user.clear(screen.getByLabelText(/level/i))
    await user.type(screen.getByLabelText(/level/i), '2')

    // Check available invocations
    const invocations = getAvailableInvocations()

    expect(invocations).toHaveLength(2) // 2 invocations at level 2
  })
})
```

---

## 10. Performance Considerations

### Optimization Strategies

#### 1. Lazy Loading
```typescript
// Only load data when GameDataContext is mounted
// Use React.lazy for tab components
const SpellcastingTab = React.lazy(() => import('./tabs/SpellcastingTab'))
```

#### 2. Memoization
```typescript
// Memoize filtered results
const filteredSpells = React.useMemo(() => {
  return filterSpellsByClass(allSpells, characterClass, level)
}, [allSpells, characterClass, level])
```

#### 3. Virtual Scrolling
```typescript
// For large lists (spells, items), use virtual scrolling
import { useVirtualizer } from '@tanstack/react-virtual'

const rowVirtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 35,
})
```

#### 4. Debounced Search
```typescript
// Debounce search input to prevent excessive filtering
const debouncedSearch = useDebouncedValue(searchQuery, 300)
```

#### 5. Code Splitting
```typescript
// Split 5etools data by source book
// Load PHB by default, lazy load others
const loadExtendedSpells = () => import('./data/5etools/extended-spells')
```

### Performance Targets

- **Initial Load**: < 2s
- **Search Response**: < 100ms
- **Combobox Open**: < 50ms
- **Filter Update**: < 200ms
- **Memory Usage**: < 100MB

---

## Summary

This workflow provides a comprehensive plan for integrating 5eTools data into the D&D 5e Character Sheet. Key features include:

✅ **Data-Driven UI** - Replace manual inputs with searchable comboboxes
✅ **Class-Based Filtering** - Intelligent filtering based on character class/level
✅ **Custom Objects** - Support for homebrew content creation
✅ **Performance Optimized** - Lazy loading, memoization, virtual scrolling
✅ **Type-Safe** - Full TypeScript coverage
✅ **Accessible** - WCAG 2.1 AA compliance
✅ **Tested** - Comprehensive test coverage (90%+ target)

**Next Steps**: Begin Phase 8 implementation with data infrastructure setup.

---

**Document Version**: 1.0
**Last Updated**: 2025-11-27
**Status**: Ready for Implementation
