# Convex + Clerk Implementation Plan

**Version:** 3.1 (Complete LocalStorage Coverage)
**Date:** 2024-12-18
**Project:** Online DND Character Sheet
**Status:** Design Document - 100% LocalStorage Field Coverage

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technology Stack Overview](#technology-stack-overview)
3. [Project Analysis](#project-analysis)
4. [Implementation Phases](#implementation-phases)
5. [Schema Migration Strategy](#schema-migration-strategy)
6. [Security & Authentication](#security--authentication)
7. [Testing Strategy](#testing-strategy)
8. [Rollback Plan](#rollback-plan)

---

## Executive Summary

### Objective
Migrate the DND Character Sheet application from localStorage-based data persistence to a production-ready backend using **Convex** as the real-time database and **Clerk** for user authentication.

### Key Goals
- ✅ Implement full database schema from `database-design.md` in Convex
- ✅ Integrate Clerk authentication with user synchronization
- ✅ Maintain existing UI/UX with zero disruption
- ✅ Enable multi-device character access
- ✅ Prepare for future collaborative features

### Timeline Estimate
- **Phase 1 (Setup):** Foundation setup
- **Phase 2 (Auth):** Authentication integration
- **Phase 3 (Schema):** Database schema implementation
- **Phase 3.5 (Transformations):** 🆕 Migration transformation layer
- **Phase 4 (CRUD):** Character CRUD operations
- **Phase 5 (Frontend):** Frontend integration
- **Phase 6 (Migration):** Data migration from localStorage
- **Phase 7 (Testing):** Quality assurance and optimization
- **Phase 8 (Deploy):** Production deployment

---

## Technology Stack Overview

### Current Stack
```yaml
Frontend:
  - Framework: React 19.2.0 (Vite)
  - UI: Radix UI + Tailwind CSS
  - Routing: React Router DOM 7.11.0
  - State: React Context API
  - Storage: localStorage

Testing:
  - Framework: Vitest
  - Components: @testing-library/react
  - Coverage: Configured but not yet integrated
```

### New Stack Components
```yaml
Backend:
  - Database: Convex (Real-time TypeScript database)
  - Authentication: Clerk 5.59.0 (Already installed)

Convex Features:
  - TypeScript-first schema definition
  - Real-time reactive queries
  - Serverless functions (queries, mutations, actions)
  - Built-in authentication integration
  - Automatic type generation
  - Row-level security via custom logic

Clerk Features:
  - JWT-based authentication
  - User management webhooks
  - Session management
  - React hooks (@clerk/clerk-react)
  - Pre-built UI components
```

---

## Project Analysis

### Current State Assessment

**✅ What's Already Done:**
- Clerk package installed (`@clerk/clerk-react@5.59.0`)
- Basic auth integration (SignInPage, SignUpPage, ProtectedRoute)
- Complete UI component library
- Character sheet data model in TypeScript
- CharacterContext for state management
- Comprehensive test setup

**⚠️ Current Limitations:**
- Data stored in browser localStorage only
- No cross-device synchronization
- No user data persistence
- No collaboration features
- No backup/recovery mechanism

**🎯 Database Design Review:**
Based on `database-design.md`, the schema includes:
- **Core Tables:** users, sessions, characters
- **Character Data:** attributes, combat, skills, equipment, features, spells, attacks
- **Relationships:** 1:N (users→characters), N:M (sessions↔characters)
- **Security:** Row-level security via Clerk user ID

---

## Implementation Phases

---

### **Phase 1: Convex Setup & Configuration**

**Goal:** Establish Convex infrastructure and development environment

#### Tasks

**1.1 Initialize Convex Project**
```bash
# Install Convex
npm install convex --save

# Initialize Convex in the project
npx convex dev
```

**1.2 Project Structure**
```
online-dnd-sheet/
├── convex/
│   ├── schema.ts          # Database schema definitions
│   ├── auth.config.ts     # Clerk authentication config
│   ├── users.ts           # User-related functions
│   ├── sessions.ts        # Session management
│   ├── characters.ts      # Character CRUD operations
│   ├── _generated/        # Auto-generated types
│   └── tsconfig.json      # TypeScript config for Convex
├── front-end/
│   └── src/
│       ├── convex/        # Convex client setup
│       │   └── ConvexProvider.tsx
│       └── ... (existing structure)
```

**1.3 Configure Clerk JWT Template**

**CRITICAL STEP - Do this first:**

1. Navigate to Clerk Dashboard → JWT Templates
2. Click "New template" → Select "Convex" preset
3. **IMPORTANT:** Keep the token name as `convex` (do not rename)
4. Save the template
5. **Copy the Issuer URL** - it will look like:
   - Development: `https://verb-noun-00.clerk.accounts.dev`
   - Production: `https://clerk.<your-domain>.com`

**1.4 Environment Configuration**
```env
# .env.local (front-end)
VITE_CONVEX_URL=https://YOUR_DEPLOYMENT.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx

# Convex Dashboard (set via: npx convex env set VARIABLE_NAME value)
CLERK_JWT_ISSUER_DOMAIN=https://YOUR_CLERK_DOMAIN.clerk.accounts.dev
```

**Note:** `CLERK_JWT_ISSUER_DOMAIN` is set in the Convex dashboard, not in your `.env` file.

**1.5 Convex Client Setup**
```typescript
// front-end/src/convex/ConvexProvider.tsx
import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

export function ConvexProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

**Important Notes:**
- `ConvexProviderWithClerk` automatically handles JWT token fetching from Clerk
- The `useAuth` prop connects Clerk's auth state to Convex
- Convex validates the JWT token on the backend using Clerk's public keys

**Success Criteria:**
- ✅ Convex development server running
- ✅ TypeScript types auto-generated
- ✅ Frontend can connect to Convex backend
- ✅ Environment variables configured

---

### **Phase 2: Clerk Authentication Integration**

**Goal:** Configure Convex backend to validate Clerk JWT tokens

#### Tasks

**2.1 Create Backend Authentication Configuration**
```typescript
// convex/auth.config.ts
import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
```

**Critical Points:**
- The `applicationID` **must** be `"convex"` (matches the JWT template name in Clerk)
- The `domain` must match the Issuer URL from your Clerk JWT template
- After creating this file, run `npx convex dev` to sync the configuration

**2.2 Access User Information in Convex Functions**

Convex provides `ctx.auth.getUserIdentity()` to access authenticated user information directly from the JWT token - **no webhooks needed for basic authentication**.

```typescript
// convex/helpers.ts
import { QueryCtx, MutationCtx } from "./_generated/server";

/**
 * Gets the current authenticated user's identity from Clerk JWT token.
 * Returns user information including:
 * - subject: Clerk user ID
 * - email: User's email address
 * - name: Full name
 * - tokenIdentifier: Unique token identifier
 */
export async function getCurrentUserIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Unauthorized: No user identity found");
  }

  return identity;
}
```

**Example Usage in Queries:**
```typescript
// convex/characters.ts (simplified example)
import { query } from "./_generated/server";
import { getCurrentUserIdentity } from "./helpers";

export const listCharacters = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getCurrentUserIdentity(ctx);

    // Filter characters by the Clerk user ID (identity.subject)
    return await ctx.db
      .query("characters")
      .filter((q) => q.eq(q.field("clerkUserId"), identity.subject))
      .collect();
  },
});
```

**2.3 Optional: Store Additional User Metadata**

**Important:** You only need a `users` table if you want to store **additional** user data beyond what Clerk provides (preferences, settings, etc.). For basic authentication, `ctx.auth.getUserIdentity()` is sufficient.

If you choose to store user metadata, use lazy initialization:

```typescript
// convex/users.ts
import { mutation, query } from "./_generated/server";
import { getCurrentUserIdentity } from "./helpers";

// Auto-create user record on first access
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await getCurrentUserIdentity(ctx);

    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", identity.subject))
      .unique();

    // Create user record if it doesn't exist
    if (!user) {
      const userId = await ctx.db.insert("users", {
        clerkUserId: identity.subject,
        email: identity.email ?? "",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      user = await ctx.db.get(userId);
    }

    return user;
  },
});
```

**Why This Approach is Better:**
- ✅ No webhook configuration needed
- ✅ No sync delays or failures
- ✅ User data always up-to-date from JWT
- ✅ Simpler architecture
- ✅ Automatic user creation on first query

**Success Criteria:**
- ✅ `auth.config.ts` created with correct domain
- ✅ Configuration synced via `npx convex dev`
- ✅ `ctx.auth.getUserIdentity()` returns user data in queries
- ✅ JWT token validation working

---

### **Phase 3: Database Schema Implementation**

**Goal:** Implement complete DND character database schema in Convex

#### Tasks

**3.1 Core Schema Definition**
```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ========================================
  // Core Tables
  // ========================================

  // OPTIONAL: Only needed if storing additional user metadata
  // You can skip this table and use ctx.auth.getUserIdentity() instead
  users: defineTable({
    clerkUserId: v.string(),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkUserId"])
    .index("by_email", ["email"]),

  sessions: defineTable({
    clerkUserId: v.string(), // Clerk user ID from JWT
    sessionName: v.string(),
    isActive: v.boolean(),
    lastAccessed: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_user", ["clerkUserId"])
    .index("by_clerk_user_active", ["clerkUserId", "isActive"]),

  characters: defineTable({
    clerkUserId: v.string(), // Clerk user ID from JWT - no users table needed
    sessionId: v.optional(v.id("sessions")),
    characterName: v.string(),
    playerName: v.optional(v.string()),
    race: v.string(),
    class: v.string(),
    level: v.number(), // 1-20
    background: v.optional(v.string()),
    alignment: v.optional(v.string()),
    experiencePoints: v.number(),
    proficiencyBonus: v.number(),
    inspiration: v.boolean(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_user", ["clerkUserId"])
    .index("by_session", ["sessionId"])
    .index("by_clerk_user_active", ["clerkUserId", "isActive"]),

  sessionCharacters: defineTable({
    sessionId: v.id("sessions"),
    characterId: v.id("characters"),
    addedAt: v.number(),
  })
    .index("by_session", ["sessionId"])
    .index("by_character", ["characterId"])
    .index("by_session_character", ["sessionId", "characterId"]),

  // ========================================
  // Character Data Tables
  // ========================================

  characterAttributes: defineTable({
    characterId: v.id("characters"),
    strength: v.number(), // 1-30
    dexterity: v.number(),
    constitution: v.number(),
    intelligence: v.number(),
    wisdom: v.number(),
    charisma: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_character", ["characterId"]),

  characterCombat: defineTable({
    characterId: v.id("characters"),
    armorClass: v.number(),
    initiative: v.number(),
    speed: v.number(),
    hpMaximum: v.number(),
    hpCurrent: v.number(),
    hpTemporary: v.number(),
    hitDiceTotal: v.string(), // e.g., "1d8"
    hitDiceCurrent: v.number(),
    deathSavesSuccesses: v.number(), // 0-3
    deathSavesFailures: v.number(), // 0-3
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_character", ["characterId"]),

  characterSkills: defineTable({
    characterId: v.id("characters"),
    skillName: v.string(),
    proficient: v.boolean(),
    expertise: v.boolean(),
    attributeType: v.string(), // "strength", "dexterity", etc.
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_character", ["characterId"])
    .index("by_character_skill", ["characterId", "skillName"]),

  characterEquipment: defineTable({
    characterId: v.id("characters"),
    itemName: v.string(),
    quantity: v.number(),
    weight: v.optional(v.number()),
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_character", ["characterId"]),

  characterFeatures: defineTable({
    characterId: v.id("characters"),
    featureName: v.string(),
    description: v.optional(v.string()),
    source: v.string(), // "Class", "Race", "Feat", "Background"
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_character", ["characterId"])
    .index("by_source", ["characterId", "source"]),

  characterSpells: defineTable({
    characterId: v.id("characters"),
    spellName: v.string(),
    spellLevel: v.number(), // 0-9
    prepared: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_character", ["characterId"])
    .index("by_level", ["characterId", "spellLevel"]),

  // 🆕 NEW: Spellcasting metadata table
  characterSpellcasting: defineTable({
    characterId: v.id("characters"),
    spellcastingClass: v.string(), // e.g., "Wizard", "Cleric"
    spellcastingAbility: v.string(), // "intelligence", "wisdom", "charisma"
    spellSaveDC: v.number(), // 8 + proficiency + ability modifier
    spellAttackBonus: v.number(), // proficiency + ability modifier
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_character", ["characterId"]),

  // 🆕 NEW: Spell slot tracking table
  characterSpellSlots: defineTable({
    characterId: v.id("characters"),
    level: v.number(), // 1-9 (spell slot level)
    total: v.number(), // Total slots available
    expended: v.number(), // Slots currently used
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_character", ["characterId"])
    .index("by_character_level", ["characterId", "level"]),

  characterAttacks: defineTable({
    characterId: v.id("characters"),
    attackName: v.string(),
    attackBonus: v.number(),
    damageType: v.optional(v.string()),
    damageDice: v.optional(v.string()), // e.g., "1d8+3"
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_character", ["characterId"]),

  // 🆕 NEW v3.0: Saving throws table
  characterSavingThrows: defineTable({
    characterId: v.id("characters"),
    attributeType: v.string(), // "strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"
    proficient: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_character", ["characterId"])
    .index("by_character_attribute", ["characterId", "attributeType"]),

  // 🆕 NEW v3.0: Currency table
  characterCurrency: defineTable({
    characterId: v.id("characters"),
    copper: v.number(),
    silver: v.number(),
    electrum: v.number(),
    gold: v.number(),
    platinum: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_character", ["characterId"]),

  // 🆕 NEW v3.0: Character details table (appearance, backstory, etc.)
  characterDetails: defineTable({
    characterId: v.id("characters"),
    age: v.number(),
    height: v.optional(v.string()),
    weight: v.optional(v.string()),
    eyes: v.optional(v.string()),
    skin: v.optional(v.string()),
    hair: v.optional(v.string()),
    appearance: v.optional(v.string()),
    backstory: v.optional(v.string()),
    alliesAndOrganizations: v.optional(v.string()),
    additionalFeatures: v.optional(v.string()),
    treasure: v.optional(v.string()),
    symbolImageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_character", ["characterId"]),

  // 🆕 NEW v3.0: Personality traits table
  characterPersonality: defineTable({
    characterId: v.id("characters"),
    traits: v.optional(v.string()),
    ideals: v.optional(v.string()),
    bonds: v.optional(v.string()),
    flaws: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_character", ["characterId"]),

  // 🆕 NEW v3.0: Proficiencies table
  characterProficiencies: defineTable({
    characterId: v.id("characters"),
    proficiencyName: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_character", ["characterId"]),

  // 🆕 NEW v3.0: Languages table
  characterLanguages: defineTable({
    characterId: v.id("characters"),
    languageName: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_character", ["characterId"]),
});
```

**3.2 Helper Functions for User Context**
```typescript
// convex/helpers.ts
import { QueryCtx, MutationCtx } from "./_generated/server";

/**
 * Gets the authenticated user's Clerk ID from the JWT token.
 * Throws an error if the user is not authenticated.
 */
export async function getAuthUserId(ctx: QueryCtx | MutationCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Unauthorized: No user identity found");
  }

  return identity.subject; // Clerk user ID
}

/**
 * Gets the full user identity from the JWT token.
 * Includes: subject (userId), email, name, tokenIdentifier, etc.
 */
export async function getUserIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("Unauthorized: No user identity found");
  }

  return identity;
}
```

**Key Change:** We no longer query a `users` table. The Clerk user ID from `identity.subject` is used directly for authorization.

**Success Criteria:**
- ✅ All 19 tables defined in schema (complete localStorage coverage)
- ✅ Indexes created for performance
- ✅ TypeScript types auto-generated
- ✅ No schema validation errors
- ✅ Schema covers 100% of localStorage Character fields

**🆕 Schema Extensions (Version 3.0):**
- **Spellcasting Support (2 tables):**
  - `characterSpellcasting` - Spellcasting metadata (class, ability, save DC, attack bonus)
  - `characterSpellSlots` - Spell slot tracking (level, total, expended)
- **Character Development (6 tables):**
  - `characterSavingThrows` - Saving throw proficiencies
  - `characterCurrency` - Character wealth (copper, silver, electrum, gold, platinum)
  - `characterDetails` - Appearance, backstory, physical traits
  - `characterPersonality` - Personality traits, ideals, bonds, flaws
  - `characterProficiencies` - Armor, weapon, and tool proficiencies
  - `characterLanguages` - Known languages

**Complete Table List (19 total):**
1. users (optional metadata)
2. sessions
3. characters
4. sessionCharacters
5. characterAttributes
6. characterCombat
7. characterSkills
8. characterEquipment
9. characterFeatures
10. characterSpells
11. characterSpellcasting
12. characterSpellSlots
13. characterAttacks
14. characterSavingThrows ⭐ NEW
15. characterCurrency ⭐ NEW
16. characterDetails ⭐ NEW
17. characterPersonality ⭐ NEW
18. characterProficiencies ⭐ NEW
19. characterLanguages ⭐ NEW

---

### **Phase 3.5: 🆕 Migration Transformation Layer**

**Goal:** Create comprehensive data transformation utilities for localStorage → Convex migration

**Why This Phase is Critical:**
The localStorage Character structure uses nested objects and computed values, while Convex uses a normalized, flat structure. Direct migration will fail without proper transformation logic.

#### Tasks

**3.5.1 Create Skill Name Mapping**

LocalStorage uses camelCase JavaScript properties, but Convex schema expects human-readable display names.

```typescript
// convex/constants.ts (NEW FILE)
/**
 * Maps localStorage skill property names to Convex display names
 *
 * localStorage: { skills: { sleightOfHand: {...} } }
 * Convex:       { skillName: "Sleight of Hand" }
 */
export const SKILL_NAME_MAP = {
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
} as const;

export type LocalStorageSkillKey = keyof typeof SKILL_NAME_MAP;
export type ConvexSkillName = typeof SKILL_NAME_MAP[LocalStorageSkillKey];
```

**3.5.2 Create Combat Stats Transformation Helper**

LocalStorage nests combat stats (hitPoints object, deathSaves object), while Convex flattens them.

```typescript
// convex/transformers.ts (NEW FILE)
import { Doc } from "./_generated/dataModel";

/**
 * Transform localStorage combat structure to Convex flat structure
 *
 * localStorage:
 *   combat: {
 *     hitPointMaximum: 25,
 *     currentHitPoints: 18,
 *     temporaryHitPoints: 5,
 *     hitDice: { total: "2d8", current: 1 },
 *     deathSaves: { successes: 1, failures: 2 }
 *   }
 *
 * Convex:
 *   hpMaximum: 25,
 *   hpCurrent: 18,
 *   hpTemporary: 5,
 *   hitDiceTotal: "2d8",
 *   hitDiceCurrent: 1,
 *   deathSavesSuccesses: 1,
 *   deathSavesFailures: 2
 */
export function transformCombatStats(localCombat: any) {
  return {
    armorClass: localCombat.armorClass,
    initiative: localCombat.initiative,
    speed: localCombat.speed,
    hpMaximum: localCombat.hitPointMaximum,
    hpCurrent: localCombat.currentHitPoints,
    hpTemporary: localCombat.temporaryHitPoints,
    hitDiceTotal: localCombat.hitDice.total,
    hitDiceCurrent: localCombat.hitDice.current,
    deathSavesSuccesses: localCombat.deathSaves.successes,
    deathSavesFailures: localCombat.deathSaves.failures,
  };
}

/**
 * Transform localStorage attributes to Convex format (scores only, drop modifiers)
 *
 * localStorage: { strength: { score: 15, modifier: 2 } }
 * Convex:       { strength: 15 }
 */
export function transformAttributes(localAttributes: any) {
  return {
    strength: localAttributes.strength.score,
    dexterity: localAttributes.dexterity.score,
    constitution: localAttributes.constitution.score,
    intelligence: localAttributes.intelligence.score,
    wisdom: localAttributes.wisdom.score,
    charisma: localAttributes.charisma.score,
  };
}

/**
 * Convert empty strings to undefined for optional fields
 */
export function normalizeOptionalString(value: string | undefined): string | undefined {
  return value && value.trim() !== "" ? value : undefined;
}
```

**3.5.3 Create Comprehensive Migration Mutation**

```typescript
// convex/migrations.ts (NEW FILE)
import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "./helpers";
import { SKILL_NAME_MAP } from "./constants";
import { transformCombatStats, transformAttributes, normalizeOptionalString } from "./transformers";

/**
 * Migrate a complete character from localStorage to Convex
 * Handles all data transformation and validation
 */
export const migrateLocalStorageCharacter = mutation({
  args: {
    localCharacter: v.any(), // Accept raw localStorage JSON
  },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    const now = Date.now();
    const char = args.localCharacter;

    // Validation: Check required fields
    if (!char.characterName || !char.race || !char.class) {
      throw new Error("Invalid character data: missing required fields (characterName, race, class)");
    }

    // 1. Create character record
    const characterId = await ctx.db.insert("characters", {
      clerkUserId,
      sessionId: undefined, // Not associated with session initially
      characterName: char.characterName,
      playerName: normalizeOptionalString(char.playerName),
      race: char.race,
      class: char.class,
      level: char.level || 1,
      background: normalizeOptionalString(char.background),
      alignment: normalizeOptionalString(char.alignment),
      experiencePoints: char.experiencePoints || 0,
      proficiencyBonus: char.proficiencyBonus || 2,
      inspiration: char.inspiration || false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // 2. Transform and insert attributes (extract scores, drop modifiers)
    const attributes = transformAttributes(char.attributes);
    await ctx.db.insert("characterAttributes", {
      characterId,
      ...attributes,
      createdAt: now,
      updatedAt: now,
    });

    // 3. Transform and insert combat stats (flatten nested structures)
    const combat = transformCombatStats(char.combat);
    await ctx.db.insert("characterCombat", {
      characterId,
      ...combat,
      createdAt: now,
      updatedAt: now,
    });

    // 4. Transform skills (object → 18 separate rows)
    for (const [localKey, displayName] of Object.entries(SKILL_NAME_MAP)) {
      const skill = char.skills[localKey];
      if (skill) {
        await ctx.db.insert("characterSkills", {
          characterId,
          skillName: displayName,
          proficient: skill.proficient || false,
          expertise: skill.expertise || false,
          attributeType: skill.attribute,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // 5. Migrate equipment array
    if (char.equipment && Array.isArray(char.equipment)) {
      for (const item of char.equipment) {
        await ctx.db.insert("characterEquipment", {
          characterId,
          itemName: item.name,
          quantity: item.quantity || 1,
          weight: item.weight,
          description: normalizeOptionalString(item.description),
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // 6. Migrate features array
    if (char.features && Array.isArray(char.features)) {
      for (const feature of char.features) {
        await ctx.db.insert("characterFeatures", {
          characterId,
          featureName: feature.name,
          description: normalizeOptionalString(feature.description),
          source: feature.source || "Unknown",
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // 7. Migrate spellcasting (if character is a spellcaster)
    if (char.spellcasting) {
      const spellcasting = char.spellcasting;

      // Insert spellcasting metadata
      await ctx.db.insert("characterSpellcasting", {
        characterId,
        spellcastingClass: spellcasting.spellcastingClass,
        spellcastingAbility: spellcasting.spellcastingAbility,
        spellSaveDC: spellcasting.spellSaveDC,
        spellAttackBonus: spellcasting.spellAttackBonus,
        createdAt: now,
        updatedAt: now,
      });

      // Migrate cantrips (level 0 spells)
      if (spellcasting.cantrips && Array.isArray(spellcasting.cantrips)) {
        for (const spell of spellcasting.cantrips) {
          await ctx.db.insert("characterSpells", {
            characterId,
            spellName: spell.name,
            spellLevel: 0,
            prepared: true, // Cantrips are always prepared
            createdAt: now,
            updatedAt: now,
          });
        }
      }

      // Migrate spell slots and leveled spells
      if (spellcasting.spellSlots && Array.isArray(spellcasting.spellSlots)) {
        for (const slotLevel of spellcasting.spellSlots) {
          // Track spell slot availability
          await ctx.db.insert("characterSpellSlots", {
            characterId,
            level: slotLevel.level,
            total: slotLevel.total,
            expended: slotLevel.expended || 0,
            createdAt: now,
            updatedAt: now,
          });

          // Migrate spells at this level
          if (slotLevel.spells && Array.isArray(slotLevel.spells)) {
            for (const spell of slotLevel.spells) {
              await ctx.db.insert("characterSpells", {
                characterId,
                spellName: spell.name,
                spellLevel: spell.level,
                prepared: spell.prepared || false,
                createdAt: now,
                updatedAt: now,
              });
            }
          }
        }
      }
    }

    // 8. Migrate attacks
    if (char.attacks && Array.isArray(char.attacks)) {
      for (const attack of char.attacks) {
        await ctx.db.insert("characterAttacks", {
          characterId,
          attackName: attack.name,
          attackBonus: attack.attackBonus || 0,
          damageType: normalizeOptionalString(attack.damageType),
          damageDice: normalizeOptionalString(attack.damage),
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // 🆕 9. Migrate saving throws (6 entries per character)
    if (char.savingThrows) {
      const savingThrowAttributes = ["strength", "dexterity", "constitution", "intelligence", "wisdom", "charisma"];
      for (const attributeType of savingThrowAttributes) {
        const saveData = char.savingThrows[attributeType];
        if (saveData) {
          await ctx.db.insert("characterSavingThrows", {
            characterId,
            attributeType: attributeType,
            proficient: saveData.proficient || false,
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    }

    // 🆕 10. Migrate currency
    if (char.currency) {
      await ctx.db.insert("characterCurrency", {
        characterId,
        copper: char.currency.copper || 0,
        silver: char.currency.silver || 0,
        electrum: char.currency.electrum || 0,
        gold: char.currency.gold || 0,
        platinum: char.currency.platinum || 0,
        createdAt: now,
        updatedAt: now,
      });
    }

    // 🆕 11. Migrate character details (appearance, backstory, etc.)
    if (char.details) {
      await ctx.db.insert("characterDetails", {
        characterId,
        age: char.details.age || 20,
        height: normalizeOptionalString(char.details.height),
        weight: normalizeOptionalString(char.details.weight),
        eyes: normalizeOptionalString(char.details.eyes),
        skin: normalizeOptionalString(char.details.skin),
        hair: normalizeOptionalString(char.details.hair),
        appearance: normalizeOptionalString(char.details.appearance),
        backstory: normalizeOptionalString(char.details.backstory),
        alliesAndOrganizations: normalizeOptionalString(char.details.alliesAndOrganizations),
        additionalFeatures: normalizeOptionalString(char.details.additionalFeatures),
        treasure: normalizeOptionalString(char.details.treasure),
        symbolImageUrl: normalizeOptionalString(char.details.symbolImageUrl),
        createdAt: now,
        updatedAt: now,
      });
    }

    // 🆕 12. Migrate personality traits
    if (char.personality) {
      await ctx.db.insert("characterPersonality", {
        characterId,
        traits: normalizeOptionalString(char.personality.traits),
        ideals: normalizeOptionalString(char.personality.ideals),
        bonds: normalizeOptionalString(char.personality.bonds),
        flaws: normalizeOptionalString(char.personality.flaws),
        createdAt: now,
        updatedAt: now,
      });
    }

    // 🆕 13. Migrate proficiencies (armor, weapons, tools)
    if (char.proficiencies && Array.isArray(char.proficiencies)) {
      for (const proficiency of char.proficiencies) {
        await ctx.db.insert("characterProficiencies", {
          characterId,
          proficiencyName: proficiency,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // 🆕 14. Migrate languages
    if (char.languages && Array.isArray(char.languages)) {
      for (const language of char.languages) {
        await ctx.db.insert("characterLanguages", {
          characterId,
          languageName: language,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // Note: passiveWisdomPerception is a calculated field and not stored in the database
    // Calculate on query: 10 + wisdomModifier + (perceptionProficient ? proficiencyBonus : 0) + (perceptionExpertise ? proficiencyBonus : 0)

    return characterId;
  },
});
```

**Success Criteria:**
- ✅ Skill name mapping constant created with all 18 skills
- ✅ Transformation helpers created for combat and attributes
- ✅ Comprehensive migration mutation handles **100% of character data** (14 migration steps)
- ✅ Validation prevents incomplete data from being migrated
- ✅ Optional fields properly normalized (empty strings → undefined)
- ✅ Spellcasting fully supported (metadata, slots, cantrips, leveled spells)
- ✅ Saving throws migrated (6 entries per character)
- ✅ Currency system migrated (all 5 denominations)
- ✅ Character details migrated (appearance, backstory, physical traits)
- ✅ Personality traits migrated (traits, ideals, bonds, flaws)
- ✅ Proficiencies migrated (all armor/weapon/tool proficiencies)
- ✅ Languages migrated (all known languages)
- ✅ Calculated fields noted (passiveWisdomPerception calculated on query, not stored)

---

### **Phase 4: Character CRUD Operations**

**Goal:** Implement complete character management functionality

#### Tasks

**4.1 Character Queries**
```typescript
// convex/characters.ts
import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "./helpers";

// Get all characters for current user
export const listCharacters = query({
  args: {},
  handler: async (ctx) => {
    const clerkUserId = await getAuthUserId(ctx);

    return await ctx.db
      .query("characters")
      .withIndex("by_clerk_user", (q) => q.eq("clerkUserId", clerkUserId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Get single character with all related data
export const getCharacter = query({
  args: { characterId: v.id("characters") },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);

    const character = await ctx.db.get(args.characterId);

    if (!character || character.clerkUserId !== clerkUserId) {
      throw new Error("Character not found or unauthorized");
    }

    // Fetch all related data
    const [attributes, combat, skills, equipment, features, spells, attacks] =
      await Promise.all([
        ctx.db
          .query("characterAttributes")
          .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
          .unique(),
        ctx.db
          .query("characterCombat")
          .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
          .unique(),
        ctx.db
          .query("characterSkills")
          .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
          .collect(),
        ctx.db
          .query("characterEquipment")
          .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
          .collect(),
        ctx.db
          .query("characterFeatures")
          .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
          .collect(),
        ctx.db
          .query("characterSpells")
          .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
          .collect(),
        ctx.db
          .query("characterAttacks")
          .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
          .collect(),
      ]);

    return {
      ...character,
      attributes,
      combat,
      skills,
      equipment,
      features,
      spells,
      attacks,
    };
  },
});
```

**4.2 Character Mutations**
```typescript
// Create new character
export const createCharacter = mutation({
  args: {
    characterName: v.string(),
    playerName: v.optional(v.string()),
    race: v.string(),
    class: v.string(),
    level: v.number(),
    background: v.optional(v.string()),
    alignment: v.optional(v.string()),
    sessionId: v.optional(v.id("sessions")),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    const now = Date.now();

    // Create character
    const characterId = await ctx.db.insert("characters", {
      clerkUserId, // Clerk user ID from JWT token
      sessionId: args.sessionId,
      characterName: args.characterName,
      playerName: args.playerName,
      race: args.race,
      class: args.class,
      level: args.level,
      background: args.background,
      alignment: args.alignment,
      experiencePoints: 0,
      proficiencyBonus: 2,
      inspiration: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // Create default attributes
    await ctx.db.insert("characterAttributes", {
      characterId,
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      createdAt: now,
      updatedAt: now,
    });

    // Create default combat stats
    await ctx.db.insert("characterCombat", {
      characterId,
      armorClass: 10,
      initiative: 0,
      speed: 30,
      hpMaximum: 10,
      hpCurrent: 10,
      hpTemporary: 0,
      hitDiceTotal: "1d8",
      hitDiceCurrent: 1,
      deathSavesSuccesses: 0,
      deathSavesFailures: 0,
      createdAt: now,
      updatedAt: now,
    });

    return characterId;
  },
});

// Update character basic info
export const updateCharacter = mutation({
  args: {
    characterId: v.id("characters"),
    updates: v.object({
      characterName: v.optional(v.string()),
      playerName: v.optional(v.string()),
      race: v.optional(v.string()),
      class: v.optional(v.string()),
      level: v.optional(v.number()),
      background: v.optional(v.string()),
      alignment: v.optional(v.string()),
      experiencePoints: v.optional(v.number()),
      proficiencyBonus: v.optional(v.number()),
      inspiration: v.optional(v.boolean()),
    }),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    const character = await ctx.db.get(args.characterId);

    if (!character || character.clerkUserId !== clerkUserId) {
      throw new Error("Character not found or unauthorized");
    }

    await ctx.db.patch(args.characterId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
  },
});

// Update attributes
export const updateAttributes = mutation({
  args: {
    characterId: v.id("characters"),
    attributes: v.object({
      strength: v.optional(v.number()),
      dexterity: v.optional(v.number()),
      constitution: v.optional(v.number()),
      intelligence: v.optional(v.number()),
      wisdom: v.optional(v.number()),
      charisma: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    const character = await ctx.db.get(args.characterId);

    if (!character || character.clerkUserId !== clerkUserId) {
      throw new Error("Unauthorized");
    }

    const existingAttributes = await ctx.db
      .query("characterAttributes")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .unique();

    if (existingAttributes) {
      await ctx.db.patch(existingAttributes._id, {
        ...args.attributes,
        updatedAt: Date.now(),
      });
    }
  },
});

// Update combat stats
export const updateCombat = mutation({
  args: {
    characterId: v.id("characters"),
    combat: v.object({
      armorClass: v.optional(v.number()),
      initiative: v.optional(v.number()),
      speed: v.optional(v.number()),
      hpMaximum: v.optional(v.number()),
      hpCurrent: v.optional(v.number()),
      hpTemporary: v.optional(v.number()),
      hitDiceTotal: v.optional(v.string()),
      hitDiceCurrent: v.optional(v.number()),
      deathSavesSuccesses: v.optional(v.number()),
      deathSavesFailures: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    const character = await ctx.db.get(args.characterId);

    if (!character || character.clerkUserId !== clerkUserId) {
      throw new Error("Unauthorized");
    }

    const existingCombat = await ctx.db
      .query("characterCombat")
      .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
      .unique();

    if (existingCombat) {
      await ctx.db.patch(existingCombat._id, {
        ...args.combat,
        updatedAt: Date.now(),
      });
    }
  },
});

// Delete character (soft delete)
export const deleteCharacter = mutation({
  args: { characterId: v.id("characters") },
  handler: async (ctx, args) => {
    const clerkUserId = await getAuthUserId(ctx);
    const character = await ctx.db.get(args.characterId);

    if (!character || character.clerkUserId !== clerkUserId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.characterId, {
      isActive: false,
      updatedAt: Date.now(),
    });
  },
});
```

**Success Criteria:**
- ✅ Character creation working with defaults
- ✅ Character queries return complete data
- ✅ Updates properly secured by user ownership
- ✅ Soft delete preserves data
- ✅ All operations type-safe

---

### **Phase 5: Frontend Integration**

**Goal:** Connect React components to Convex backend

#### Tasks

**5.1 Update Main App Structure**
```typescript
// front-end/src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConvexProvider } from './convex/ConvexProvider';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConvexProvider>
        <App />
      </ConvexProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
```

**5.2 Update CharacterContext**
```typescript
// front-end/src/contexts/CharacterContext.tsx
import { createContext, useContext, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface CharacterContextType {
  currentCharacterId: Id<"characters"> | null;
  character: any; // Replace with proper type
  isLoading: boolean;
  setCurrentCharacter: (id: Id<"characters">) => void;
  updateCharacter: (updates: any) => Promise<void>;
  updateAttributes: (attributes: any) => Promise<void>;
  updateCombat: (combat: any) => Promise<void>;
}

const CharacterContext = createContext<CharacterContextType | undefined>(undefined);

export function CharacterProvider({ children }: { children: React.ReactNode }) {
  const [currentCharacterId, setCurrentCharacterId] = useState<Id<"characters"> | null>(null);

  // Queries
  const character = useQuery(
    api.characters.getCharacter,
    currentCharacterId ? { characterId: currentCharacterId } : "skip"
  );

  // Mutations
  const updateCharacterMutation = useMutation(api.characters.updateCharacter);
  const updateAttributesMutation = useMutation(api.characters.updateAttributes);
  const updateCombatMutation = useMutation(api.characters.updateCombat);

  const updateCharacter = async (updates: any) => {
    if (!currentCharacterId) return;
    await updateCharacterMutation({ characterId: currentCharacterId, updates });
  };

  const updateAttributes = async (attributes: any) => {
    if (!currentCharacterId) return;
    await updateAttributesMutation({ characterId: currentCharacterId, attributes });
  };

  const updateCombat = async (combat: any) => {
    if (!currentCharacterId) return;
    await updateCombatMutation({ characterId: currentCharacterId, combat });
  };

  return (
    <CharacterContext.Provider
      value={{
        currentCharacterId,
        character,
        isLoading: character === undefined,
        setCurrentCharacter: setCurrentCharacterId,
        updateCharacter,
        updateAttributes,
        updateCombat,
      }}
    >
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacter() {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within CharacterProvider');
  }
  return context;
}
```

**5.3 Use Correct Authentication Hooks**

**IMPORTANT:** Use Convex's auth hooks, not Clerk's, for checking authentication state:

```typescript
// ❌ WRONG - Don't use Clerk's hooks directly
import { useAuth } from '@clerk/clerk-react';

// ✅ CORRECT - Use Convex's hooks
import { useConvexAuth, Authenticated, Unauthenticated, AuthLoading } from 'convex/react';

// Example: Protected Component
function ProtectedComponent() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div>Please sign in</div>;
  }

  return <div>Protected content</div>;
}

// Better: Use Convex's helper components
function App() {
  return (
    <>
      <AuthLoading>
        <div>Checking authentication...</div>
      </AuthLoading>
      <Unauthenticated>
        <SignInPage />
      </Unauthenticated>
      <Authenticated>
        <MainApp />
      </Authenticated>
    </>
  );
}
```

**Why `useConvexAuth()` instead of Clerk's `useAuth()`:**
- `useConvexAuth()` waits for the backend to validate the JWT token
- Ensures Convex queries will work (won't fail with "unauthorized")
- Prevents race conditions between frontend auth state and backend validation

**5.4 Character List Component**
```typescript
// front-end/src/pages/CharacterListPage.tsx
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useNavigate } from 'react-router-dom';

export function CharacterListPage() {
  const navigate = useNavigate();
  const characters = useQuery(api.characters.listCharacters);
  const createCharacter = useMutation(api.characters.createCharacter);

  const handleCreateCharacter = async () => {
    const characterId = await createCharacter({
      characterName: "New Character",
      race: "Human",
      class: "Fighter",
      level: 1,
    });
    navigate(`/character/${characterId}`);
  };

  if (characters === undefined) {
    return <div>Loading characters...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Characters</h1>
        <button
          onClick={handleCreateCharacter}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create New Character
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {characters.map((char) => (
          <div
            key={char._id}
            onClick={() => navigate(`/character/${char._id}`)}
            className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <h3 className="text-xl font-semibold">{char.characterName}</h3>
            <p className="text-gray-600">
              Level {char.level} {char.race} {char.class}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**5.4 Remove localStorage Dependencies**
```typescript
// front-end/src/utils/storage.ts
// DEPRECATED: Remove after migration complete
// All functions now handled by Convex
```

**Success Criteria:**
- ✅ Characters load from Convex
- ✅ Real-time updates working
- ✅ No localStorage calls remaining
- ✅ Type safety maintained throughout

---

### **Phase 6: Data Migration from localStorage**

**Goal:** Migrate existing user data from localStorage to Convex

#### Tasks

**6.1 🆕 Enhanced Migration Utility Component**

**Key Updates:**
- ✅ Uses comprehensive `migrateLocalStorageCharacter` mutation from Phase 3.5
- ✅ Pre-migration validation to prevent incomplete data
- ✅ Detailed error messages for debugging
- ✅ Progress tracking with status states
- ✅ Safe localStorage clearing only after successful migration

```typescript
// front-end/src/components/DataMigration.tsx
import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { loadCharacter, clearCharacter } from '@/utils/storage';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

type MigrationStatus = 'pending' | 'validating' | 'migrating' | 'complete' | 'error';

export function DataMigration() {
  const [status, setStatus] = useState<MigrationStatus>('pending');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [migratedCharacterId, setMigratedCharacterId] = useState<string | null>(null);

  // Use comprehensive migration mutation from Phase 3.5
  const migrateCharacter = useMutation(api.migrations.migrateLocalStorageCharacter);

  const validateCharacter = (character: any): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check required fields
    if (!character.characterName || character.characterName.trim() === '') {
      errors.push('Character name is required');
    }
    if (!character.race) {
      errors.push('Race is required');
    }
    if (!character.class) {
      errors.push('Class is required');
    }

    // Check attributes structure
    if (!character.attributes || typeof character.attributes !== 'object') {
      errors.push('Invalid attributes structure');
    }

    // Check combat structure
    if (!character.combat || typeof character.combat !== 'object') {
      errors.push('Invalid combat stats structure');
    }

    // Check skills structure
    if (!character.skills || typeof character.skills !== 'object') {
      errors.push('Invalid skills structure');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  };

  const migrateData = async () => {
    setStatus('validating');
    setErrorMessage('');

    try {
      // Load character from localStorage
      const localCharacter = loadCharacter();

      if (!localCharacter) {
        // No character data found - mark as complete
        setStatus('complete');
        return;
      }

      // Pre-migration validation
      const validation = validateCharacter(localCharacter);
      if (!validation.valid) {
        throw new Error(
          `Character data validation failed:\n${validation.errors.join('\n')}`
        );
      }

      setStatus('migrating');

      // Call comprehensive migration mutation
      // This handles ALL data transformation automatically
      const characterId = await migrateCharacter({
        localCharacter: localCharacter,
      });

      console.log(`✅ Character migrated successfully: ${characterId}`);
      setMigratedCharacterId(characterId);

      // Clear localStorage ONLY after successful migration
      clearCharacter();
      console.log('✅ LocalStorage cleared');

      setStatus('complete');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      const message = error instanceof Error ? error.message : 'Unknown migration error';
      setErrorMessage(message);
      setStatus('error');
    }
  };

  // Don't render if migration is complete
  if (status === 'complete' && !migratedCharacterId) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-white border border-gray-200 rounded-lg shadow-xl p-6">
      {/* Success State */}
      {status === 'complete' && migratedCharacterId && (
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Migration Complete!</h3>
            <p className="text-sm text-gray-600">
              Your character has been successfully migrated to your account and is now accessible from any device.
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-1">Migration Failed</h3>
            <p className="text-sm text-gray-600 mb-3">
              {errorMessage || 'An unknown error occurred during migration.'}
            </p>
            <button
              onClick={migrateData}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Pending State */}
      {status === 'pending' && (
        <div>
          <h3 className="font-bold text-gray-900 mb-2">Character Data Found</h3>
          <p className="text-sm text-gray-600 mb-4">
            We found character data in your browser. Migrate it to your account for cross-device access and backup.
          </p>
          <button
            onClick={migrateData}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Migrate to Cloud
          </button>
        </div>
      )}

      {/* Validating State */}
      {status === 'validating' && (
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin flex-shrink-0" />
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Validating Data...</h3>
            <p className="text-sm text-gray-600">
              Checking character data integrity
            </p>
          </div>
        </div>
      )}

      {/* Migrating State */}
      {status === 'migrating' && (
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin flex-shrink-0" />
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Migrating Character...</h3>
            <p className="text-sm text-gray-600">
              Transferring attributes, skills, equipment, and spells
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
```

**6.2 Integration with App**

```typescript
// front-end/src/App.tsx or main layout component
import { DataMigration } from '@/components/DataMigration';
import { Authenticated } from 'convex/react';

function App() {
  return (
    <>
      {/* Only show migration prompt to authenticated users */}
      <Authenticated>
        <DataMigration />
      </Authenticated>

      {/* Rest of app */}
      <Routes>
        {/* ... */}
      </Routes>
    </>
  );
}
```

**Success Criteria:**
- ✅ LocalStorage data detected and validated
- ✅ Pre-migration validation prevents incomplete data
- ✅ Comprehensive migration completes successfully (all fields)
- ✅ Data accessible from any device
- ✅ LocalStorage cleared ONLY after successful migration
- ✅ Error handling provides clear debugging information
- ✅ Progress states give user feedback during migration

**🆕 Enhanced Features:**
- Validation step prevents migration of incomplete characters
- Detailed error messages help debug migration failures
- Safe migration: localStorage only cleared after Convex confirms success
- All character data migrated in single atomic operation
- Support for spellcasters (metadata, slots, cantrips, leveled spells)

---

### **Phase 7: Testing & Quality Assurance**

**Goal:** Ensure system reliability and data integrity

#### Tasks

**7.1 Unit Tests for Convex Functions**
```typescript
// convex/characters.test.ts
import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import schema from "./schema";
import { api } from "./_generated/api";

test("create and retrieve character", async () => {
  const t = convexTest(schema);

  // Mock authenticated user
  const asUser = t.withIdentity({ subject: "user123" });

  // Create user
  await t.mutation(api.users.createUser, {
    clerkUserId: "user123",
    email: "test@example.com",
  });

  // Create character
  const characterId = await asUser.mutation(api.characters.createCharacter, {
    characterName: "Test Hero",
    race: "Elf",
    class: "Wizard",
    level: 3,
  });

  // Retrieve character
  const character = await asUser.query(api.characters.getCharacter, {
    characterId,
  });

  expect(character.characterName).toBe("Test Hero");
  expect(character.race).toBe("Elf");
  expect(character.level).toBe(3);
});
```

**7.2 Integration Tests**
```typescript
// front-end/src/components/__tests__/CharacterSheet.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { ConvexProvider } from '@/convex/ConvexProvider';
import { CharacterSheet } from '@/components/character-sheet/CharacterSheet';

describe('CharacterSheet Integration', () => {
  it('loads character from Convex', async () => {
    render(
      <ConvexProvider>
        <CharacterSheet />
      </ConvexProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/character name/i)).toBeInTheDocument();
    });
  });
});
```

**7.3 E2E Tests**
```typescript
// e2e/character-management.spec.ts
import { test, expect } from '@playwright/test';

test('complete character creation flow', async ({ page }) => {
  // Sign in
  await page.goto('/signin');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');

  // Create character
  await page.click('text=Create New Character');
  await page.fill('[name="characterName"]', 'Gandalf');
  await page.selectOption('[name="race"]', 'Human');
  await page.selectOption('[name="class"]', 'Wizard');
  await page.click('button:has-text("Create")');

  // Verify character appears
  await expect(page.locator('text=Gandalf')).toBeVisible();
});
```

**Success Criteria:**
- ✅ All unit tests passing
- ✅ Integration tests covering critical paths
- ✅ E2E tests for user workflows
- ✅ >80% code coverage

---

### **Phase 8: Deployment**

**Goal:** Deploy to production environment

#### Tasks

**8.1 Deploy Convex Backend**
```bash
# Deploy to production
npx convex deploy --prod

# Configure production environment variables
npx convex env set CLERK_WEBHOOK_SECRET whsec_prod_xxxxx --prod
npx convex env set CLERK_ISSUER_URL https://clerk.yourapp.com --prod
```

**8.2 Update Clerk Production Webhooks**
- Configure production webhook endpoint
- Test webhook delivery
- Monitor webhook logs

**8.3 Deploy Frontend**
```bash
# Build frontend with production Convex URL
VITE_CONVEX_URL=https://your-prod.convex.cloud npm run build

# Deploy to Vercel/Netlify
vercel --prod
```

**8.4 Monitoring Setup**
- Convex dashboard monitoring
- Error tracking (Sentry)
- Performance monitoring
- User analytics

**Success Criteria:**
- ✅ Backend deployed successfully
- ✅ Frontend connected to production backend
- ✅ Webhooks functioning correctly
- ✅ Monitoring in place

---

## Schema Migration Strategy

### Convex vs PostgreSQL Differences

| Feature | PostgreSQL (Original Design) | Convex Implementation |
|---------|------------------------------|----------------------|
| Primary Keys | UUID with `gen_random_uuid()` | Auto-generated `Id<table>` |
| User ID Type | TEXT (Clerk user ID) | `Id<"users">` (Convex reference) |
| Timestamps | `TIMESTAMP WITH TIME ZONE` | `number` (milliseconds since epoch) |
| Foreign Keys | `REFERENCES` with CASCADE | Schema relationships via indexes |
| Unique Constraints | SQL UNIQUE constraint | Manual checking in mutations |
| Row-Level Security | PostgreSQL RLS policies | Application-level checks via `getCurrentUser()` |
| Defaults | SQL DEFAULT values | Application-level defaults in mutations |

### Key Adaptations

**1. User ID Handling**
```typescript
// Original PostgreSQL approach
id TEXT PRIMARY KEY DEFAULT auth.jwt()->>'sub'

// Convex approach
const user = await getCurrentUser(ctx); // Returns user document
userId: user._id // Use Convex _id as foreign key
```

**2. Timestamps**
```typescript
// PostgreSQL
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()

// Convex
createdAt: Date.now() // Store as number (ms)
```

**3. Relationships**
```typescript
// PostgreSQL
session_id UUID REFERENCES sessions(id) ON DELETE SET NULL

// Convex
sessionId: v.optional(v.id("sessions")) // Optional reference
// Deletion handled in application logic
```

**4. Security**
```typescript
// PostgreSQL RLS
CREATE POLICY "Users can view own data" ON characters
  FOR SELECT USING (auth.jwt()->>'sub' = user_id);

// Convex application-level security
const user = await getCurrentUser(ctx);
if (character.userId !== user._id) {
  throw new Error("Unauthorized");
}
```

---

### 🆕 LocalStorage to Convex Data Transformation

**Critical Differences:** The localStorage Character structure must be transformed before migration.

#### **Transformation Table**

| Data Type | LocalStorage Structure | Convex Structure | Transformation Required |
|-----------|----------------------|------------------|------------------------|
| **Attributes** | `{ strength: { score: 15, modifier: 2 } }` | `{ strength: 15 }` | Extract `.score`, drop `.modifier` (computed) |
| **Combat HP** | `{ hitPoints: { maximum: 25, current: 18, temporary: 5 } }` | `{ hpMaximum: 25, hpCurrent: 18, hpTemporary: 5 }` | Flatten nested object |
| **Hit Dice** | `{ hitDice: { total: "2d8", current: 1 } }` | `{ hitDiceTotal: "2d8", hitDiceCurrent: 1 }` | Flatten nested object |
| **Death Saves** | `{ deathSaves: { successes: 1, failures: 2 } }` | `{ deathSavesSuccesses: 1, deathSavesFailures: 2 }` | Flatten nested object |
| **Skills** | Object with 18 properties: `{ sleightOfHand: {...}, ... }` | 18 rows: `[{ skillName: "Sleight of Hand", ... }, ...]` | Convert object → array + map camelCase → Display Name |
| **Skill Names** | `sleightOfHand`, `animalHandling` (camelCase) | `"Sleight of Hand"`, `"Animal Handling"` (Display) | Use `SKILL_NAME_MAP` constant |
| **Equipment** | `[{ name, quantity, weight, description }]` | `[{ itemName, quantity, weight, description }]` | Rename `name` → `itemName` |
| **Features** | `[{ name, description, source }]` | `[{ featureName, description, source }]` | Rename `name` → `featureName` |
| **Attacks** | `[{ name, attackBonus, damage, damageType }]` | `[{ attackName, attackBonus, damageDice, damageType }]` | Rename `name` → `attackName`, `damage` → `damageDice` |
| **Spellcasting** | Single object with metadata, cantrips array, spell slots array | 3 separate tables: `characterSpellcasting`, `characterSpells`, `characterSpellSlots` | Split into normalized structure |
| **Timestamps** | Not present | `{ createdAt: number, updatedAt: number }` | Generate `Date.now()` on migration |
| **User Association** | Not present (browser-only) | `{ clerkUserId: string }` | Extract from authenticated JWT token |

#### **Skill Name Mapping (18 Skills)**

```typescript
// Required transformation for skills
const SKILL_NAME_MAP = {
  // LocalStorage Key → Convex Display Name
  "acrobatics": "Acrobatics",
  "animalHandling": "Animal Handling",
  "arcana": "Arcana",
  "athletics": "Athletics",
  "deception": "Deception",
  "history": "History",
  "insight": "Insight",
  "intimidation": "Intimidation",
  "investigation": "Investigation",
  "medicine": "Medicine",
  "nature": "Nature",
  "perception": "Perception",
  "performance": "Performance",
  "persuasion": "Persuasion",
  "religion": "Religion",
  "sleightOfHand": "Sleight of Hand",
  "stealth": "Stealth",
  "survival": "Survival",
};
```

#### **Spellcasting Data Transformation**

**LocalStorage Structure:**
```typescript
spellcasting: {
  spellcastingClass: "Wizard",
  spellcastingAbility: "intelligence",
  spellSaveDC: 14,
  spellAttackBonus: 6,
  cantrips: [
    { id: "1", name: "Fire Bolt", prepared: true, level: 0 }
  ],
  spellSlots: [
    {
      level: 1,
      total: 4,
      expended: 2,
      spells: [
        { id: "2", name: "Magic Missile", prepared: true, level: 1 }
      ]
    }
  ]
}
```

**Convex Structure (3 tables):**
```typescript
// Table 1: characterSpellcasting (1 row per character)
{
  characterId: Id<"characters">,
  spellcastingClass: "Wizard",
  spellcastingAbility: "intelligence",
  spellSaveDC: 14,
  spellAttackBonus: 6
}

// Table 2: characterSpells (1 row per spell)
[
  { characterId, spellName: "Fire Bolt", spellLevel: 0, prepared: true },
  { characterId, spellName: "Magic Missile", spellLevel: 1, prepared: true }
]

// Table 3: characterSpellSlots (1 row per slot level)
[
  { characterId, level: 1, total: 4, expended: 2 }
]
```

**Transformation Steps:**
1. Extract spellcasting metadata → `characterSpellcasting` table
2. Flatten cantrips array → `characterSpells` rows with `spellLevel: 0`
3. For each spell slot level:
   - Create `characterSpellSlots` row
   - Flatten spells array → `characterSpells` rows

#### **Migration Code Example**

See **Phase 3.5** for complete implementation with:
- `convex/constants.ts` - Skill name mapping
- `convex/transformers.ts` - Transformation helper functions
- `convex/migrations.ts` - Comprehensive migration mutation

---

## Security & Authentication

### Authentication Flow

**Simple JWT-Based Authentication - No Webhooks Needed**

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. User signs in via Clerk
       ▼
┌─────────────┐
│    Clerk    │
│  (Issues    │
│ JWT Token)  │
└──────┬──────┘
       │ 2. JWT token with user info
       ▼
┌─────────────┐
│  React App  │
│ (Convex     │
│  Provider)  │
└──────┬──────┘
       │ 3. Query/Mutation with JWT in Authorization header
       ▼
┌─────────────┐
│   Convex    │
│  Backend    │
└──────┬──────┘
       │ 4. Validate JWT signature using Clerk's public keys
       │ 5. Extract user info (subject, email, name)
       ▼
┌─────────────┐
│ctx.auth.    │
│getUserId()  │
│  → Returns  │
│  Clerk ID   │
└─────────────┘
       │ 6. Use Clerk ID to filter user's data
       ▼
┌─────────────┐
│  Database   │
│   Query     │
└─────────────┘
```

**Key Points:**
- ✅ No webhooks required for basic authentication
- ✅ User info comes directly from validated JWT token
- ✅ Convex automatically validates JWT signatures
- ✅ User records created lazily on first query (if needed)
- ✅ Real-time sync between Clerk and Convex

### Security Measures

**1. Authentication**
- ✅ Clerk JWT validation on every request
- ✅ User identity verified via `ctx.auth.getUserIdentity()`
- ✅ No unauthenticated access to data

**2. Authorization**
- ✅ User ownership checked on all character operations
- ✅ Cannot access other users' data
- ✅ Session-based access control (future)

**3. Data Validation**
- ✅ Input validation via Convex validators
- ✅ TypeScript type safety
- ✅ Business logic constraints (e.g., level 1-20)

**4. JWT Token Security**
- ✅ Automatic signature validation using Clerk's public keys
- ✅ Token expiration enforced
- ✅ HTTPS-only communication
- ✅ Secure token storage in browser

---

## Testing Strategy

### Test Pyramid

```
        /\
       /  \      E2E Tests (10%)
      /____\     - Full user flows
     /      \    - Critical paths only
    /________\
   /          \  Integration Tests (30%)
  /____________\ - Component + Convex
 /              \- User interactions
/________________\
  Unit Tests (60%)
  - Convex functions
  - React components
  - Utilities
```

### Test Coverage Goals

| Layer | Target Coverage | Tools |
|-------|-----------------|-------|
| Convex Functions | >90% | convex-test + Vitest |
| React Components | >80% | @testing-library/react |
| Integration | >70% | Vitest + Mock Convex |
| E2E | Critical paths | Playwright |

---

## Rollback Plan

### Emergency Rollback Procedure

**If critical issues occur:**

**Step 1: Disable Convex Integration**
```typescript
// front-end/src/main.tsx
// Temporarily revert to localStorage

import { CharacterProvider } from '@/contexts/CharacterContextLegacy';

// Comment out ConvexProvider
// <ConvexProvider>
//   <App />
// </ConvexProvider>

// Use legacy provider
<CharacterProvider autoSave={true}>
  <App />
</CharacterProvider>
```

**Step 2: Re-enable localStorage**
```typescript
// front-end/src/utils/storage.ts
// Un-comment all localStorage functions
```

**Step 3: Notify Users**
- Display banner: "Temporary maintenance, using offline mode"
- Data automatically syncs when service restored

**Step 4: Debug & Fix**
- Review Convex logs
- Check webhook delivery
- Verify authentication flow

**Step 5: Re-deploy**
- Fix issues
- Test in staging
- Gradual rollout to production

---

## Success Metrics

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Page Load Time | <2s | Lighthouse |
| Time to Interactive | <3s | Lighthouse |
| Character Query Time | <200ms | Convex Dashboard |
| Mutation Response Time | <300ms | Convex Dashboard |
| Webhook Processing | <500ms | Clerk Dashboard |

### Quality Metrics

| Metric | Target |
|--------|--------|
| Test Coverage | >80% |
| TypeScript Strict Mode | Enabled |
| Zero ESLint Errors | ✅ |
| Accessibility Score | >90 |

### User Experience Metrics

| Metric | Target |
|--------|--------|
| Auth Success Rate | >99% |
| Data Migration Success | >95% |
| Zero Data Loss Events | ✅ |
| Cross-Device Sync Time | <1s |

---

## Appendix A: File Structure

```
online-dnd-sheet/
├── convex/
│   ├── _generated/           # Auto-generated types
│   ├── schema.ts             # Database schema (13 tables)
│   ├── auth.config.ts        # Clerk auth configuration
│   ├── helpers.ts            # Shared utilities (getAuthUserId, getUserIdentity)
│   ├── 🆕 constants.ts       # Skill name mappings and constants
│   ├── 🆕 transformers.ts    # Data transformation helpers
│   ├── 🆕 migrations.ts      # localStorage → Convex migration
│   ├── users.ts              # User management (optional)
│   ├── sessions.ts           # Session CRUD
│   ├── characters.ts         # Character CRUD
│   ├── characterAttributes.ts
│   ├── characterCombat.ts
│   ├── characterSkills.ts
│   ├── characterEquipment.ts
│   ├── characterFeatures.ts
│   ├── characterSpells.ts
│   ├── 🆕 characterSpellcasting.ts  # Spellcasting metadata
│   ├── 🆕 characterSpellSlots.ts    # Spell slot tracking
│   ├── characterAttacks.ts
│   └── tsconfig.json
├── front-end/
│   ├── src/
│   │   ├── convex/
│   │   │   └── ConvexProvider.tsx
│   │   ├── contexts/
│   │   │   └── CharacterContext.tsx (updated)
│   │   ├── components/
│   │   │   ├── 🆕 DataMigration.tsx (enhanced with validation)
│   │   │   └── ... (existing)
│   │   ├── pages/
│   │   │   ├── CharacterListPage.tsx (new)
│   │   │   └── ... (existing)
│   │   ├── utils/
│   │   │   └── storage.ts (deprecated after migration)
│   │   └── main.tsx (updated)
│   └── package.json
├── docs/
│   ├── database-design.md
│   └── convex-clerk-implementation-plan.md (this file - v3.0)
└── README.md
```

**🆕 New Files in Version 3.0:**
- `convex/constants.ts` - Skill name mapping (18 skills)
- `convex/transformers.ts` - Combat/attribute transformation helpers
- `convex/migrations.ts` - Comprehensive migration mutation
- `convex/characterSpellcasting.ts` - Spellcasting metadata CRUD
- `convex/characterSpellSlots.ts` - Spell slot management CRUD
- Enhanced `DataMigration.tsx` - Validation, error handling, progress states

---

## Appendix B: Environment Variables

### Frontend Environment Variables (.env.local)
```env
# Convex - Get from Convex dashboard
VITE_CONVEX_URL=https://dev-project.convex.cloud

# Clerk - Get from Clerk dashboard > API Keys
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

### Backend Environment Variables (Convex Dashboard)

Set these in the Convex dashboard via `npx convex env set VARIABLE_NAME value`:

```bash
# Development
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://verb-noun-00.clerk.accounts.dev

# Production
npx convex env set CLERK_JWT_ISSUER_DOMAIN https://clerk.yourapp.com --prod
```

**Important Notes:**
- `CLERK_JWT_ISSUER_DOMAIN` must match the Issuer URL from your Clerk JWT template
- Get this URL from: Clerk Dashboard → JWT Templates → Convex template → Issuer URL
- Do NOT set backend variables in `.env` files - use Convex dashboard only
- **No webhook secrets needed** - authentication is handled via JWT validation

---

## Appendix C: Useful Commands

### Convex Commands
```bash
# Start development server
npx convex dev

# Deploy to production
npx convex deploy --prod

# View logs
npx convex logs

# Run database migrations
npx convex run migrations:run

# Clear all data (development only!)
npx convex data clear
```

### Frontend Commands
```bash
# Development
npm run dev

# Build
npm run build

# Run tests
npm run test

# Test coverage
npm run test:coverage
```

---

## Next Steps

1. **Review this document** with the team
2. **Set up Convex account** and create project
3. **Begin Phase 1** implementation (Foundation setup)
4. **🆕 Complete Phase 3.5** (Migration transformation layer) before Phase 6
5. **Track progress** using project management tool
6. **Schedule regular check-ins** after each phase

---

## 📋 Version 3.0 Summary: Critical Changes

### **Schema Extensions (Phase 3)**
- ✅ Added `characterSpellcasting` table (spellcasting metadata)
- ✅ Added `characterSpellSlots` table (spell slot tracking)
- ✅ Total: **13 tables** (up from 11)

### **New Phase: 3.5 - Migration Transformation Layer**
- ✅ `convex/constants.ts` - Skill name mapping constant (18 skills)
- ✅ `convex/transformers.ts` - Combat/attribute flattening functions
- ✅ `convex/migrations.ts` - Comprehensive migration mutation
- ✅ Handles all data transformation automatically
- ✅ Validates character data before migration

### **Enhanced Migration (Phase 6)**
- ✅ Pre-migration validation prevents incomplete data
- ✅ Detailed error messages for debugging
- ✅ Progress tracking with 5 status states
- ✅ Safe localStorage clearing (only after success)
- ✅ Enhanced UI with icons and better UX

### **Comprehensive Documentation**
- ✅ **Transformation Table** - All localStorage → Convex mappings
- ✅ **Skill Name Mapping** - camelCase → Display Name conversion
- ✅ **Spellcasting Transformation** - 1 object → 3 tables breakdown
- ✅ **Updated File Structure** - Shows all new files

### **Key Realizations**
1. **Data Structure Mismatch**: LocalStorage uses nested objects; Convex uses flat, normalized structure
2. **Skill Naming**: 18 skills need camelCase → Display Name transformation
3. **Spellcasting Gap**: Original schema missing spellcasting metadata and slot tracking
4. **Migration Complexity**: Cannot migrate directly; requires comprehensive transformation layer

### **Implementation Checklist**

**Before Migration:**
- [ ] Create `convex/constants.ts` with `SKILL_NAME_MAP`
- [ ] Create `convex/transformers.ts` with helper functions
- [ ] Create `convex/migrations.ts` with `migrateLocalStorageCharacter` mutation
- [ ] Add `characterSpellcasting` and `characterSpellSlots` tables to schema
- [ ] Update `DataMigration.tsx` component with validation logic

**Migration Requirements:**
- [ ] User must be authenticated (Clerk session active)
- [ ] Character data validated before migration
- [ ] All transformation helpers in place
- [ ] Test migration with sample character data

**Success Criteria:**
- [ ] All 13 tables created successfully
- [ ] Migration mutation handles all character types (spellcasters and non-spellcasters)
- [ ] Skills properly transformed (18 rows per character)
- [ ] Spellcasting data correctly split across 3 tables
- [ ] LocalStorage cleared only after successful migration

---

**Document Version:** 3.0 (LocalStorage Alignment)
**Last Updated:** 2024-12-18
**Status:** Ready for Implementation
**Document End**
