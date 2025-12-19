# Convex + Clerk Full Migration Implementation Plan

**Version:** 4.1 (Clean State Migration - No localStorage Data Transfer)
**Date:** 2024-12-18
**Project:** Online DND Character Sheet
**Status:** Production-Ready Implementation Guide
**Based on:** Official Convex & Clerk Documentation

---

## ⚠️ CRITICAL MIGRATION DECISION

### **CLEAN STATE MIGRATION - ALL LOCALSTORAGE DATA WILL BE IGNORED**

This implementation plan uses a **clean state migration strategy**:

- ✅ **NO data migration from localStorage**
- ✅ **ALL localStorage data will be cleared on first app load**
- ✅ **Users start fresh with new characters in Convex**
- ✅ **Simpler implementation - 7-8 hours saved**
- ✅ **No risk of data transformation bugs**
- ✅ **Guaranteed data integrity from day one**

**Phases 3.5 and 6 are COMPLETELY SKIPPED** - no transformation layer or migration component needed.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technology Stack Overview](#technology-stack-overview)
3. [Migration Decision: Full vs Hybrid](#migration-decision-full-vs-hybrid)
4. [Implementation Phases](#implementation-phases)
5. [Schema Migration Strategy](#schema-migration-strategy)
6. [Security & Authentication](#security--authentication)
7. [Testing Strategy](#testing-strategy)
8. [Rollback Plan](#rollback-plan)
9. [Effort Estimation](#effort-estimation)

---

## Executive Summary

### Objective
Complete migration from localStorage-based data persistence to a production-ready backend using **Convex** (real-time TypeScript database) and **Clerk** (JWT authentication).

### Key Goals
- ✅ Full migration to Convex (deprecate localStorage)
- ✅ Implement complete 19-table database schema
- ✅ Integrate Clerk authentication with JWT validation
- ✅ Maintain existing UI/UX with zero user-facing disruption
- ✅ Enable cross-device character synchronization
- ✅ Establish foundation for future collaborative features

### Migration Approach: **FULL MIGRATION WITH CLEAN STATE**

**⚠️ IMPORTANT: Clean State Migration**
- **ALL localStorage data will be IGNORED**
- **Starting with a CLEAN DATABASE - no data migration from localStorage**
- Users will create new characters in Convex from scratch
- No migration component needed (Phase 6 can be skipped)
- Simpler implementation without transformation complexity

**Why Full Migration with Clean State:**
- Convex (`convex@1.31.2`) already installed
- Clerk (`@clerk/clerk-react@5.59.0`) already integrated
- Clean architecture without dual system maintenance
- Immediate cross-device sync benefits
- Real-time reactive updates out-of-the-box
- **No complex data transformation layer needed**
- **No risk of data migration bugs or incomplete transfers**
- **Fresh start ensures data integrity from day one**

**Estimated Effort:** 29-38 hours (4-5 full workdays) - Reduced by 6-8 hours due to skipping migration layer

---

## Technology Stack Overview

### Current Stack
```yaml
Frontend:
  - Framework: React 19.2.0 (Vite)
  - UI: Radix UI + Tailwind CSS
  - Routing: React Router DOM 7.11.0
  - State: React Context API
  - Storage: localStorage (TO BE DEPRECATED)
  - Auth: Clerk 5.59.0 (✅ Already installed)

Testing:
  - Framework: Vitest 4.0.14
  - Components: @testing-library/react 16.3.0
  - Environment: Happy-dom 20.0.10
```

### New Stack Components (To Be Added)
```yaml
Backend:
  - Database: Convex 1.31.2 (✅ Already installed in node_modules)
  - Functions: Serverless TypeScript (queries, mutations, actions)
  - Real-time: Reactive subscriptions via WebSocket

Authentication:
  - Provider: Clerk (JWT-based)
  - Integration: ConvexProviderWithClerk
  - Token Validation: Automatic via Convex auth.config.ts

Features:
  - TypeScript-first schema with automatic type generation
  - Real-time reactive queries (useQuery hook)
  - Optimistic UI updates (useMutation hook)
  - Row-level security via ctx.auth.getUserIdentity()
  - Serverless edge deployment
```

---

## Migration Decision: Full vs Hybrid

### ✅ **Recommended: Full Migration**

**Advantages:**
1. **Clean Break** - No dual system maintenance
2. **Immediate Benefits** - Cross-device sync, real-time updates
3. **Simpler Codebase** - Single source of truth
4. **Future-Proof** - Foundation for collaboration features

**Effort:** 29-38 hours

**Steps:**
1. Complete Convex setup (Phase 1)
2. Implement schema (Phase 3) - **Skip Phase 3.5 (transformation layer not needed)**
3. Implement CRUD operations (Phase 4)
4. Rewrite CharacterContext to use Convex (Phase 5)
5. **Skip Phase 6 (no data migration needed)**
6. Deploy and test (Phases 7-8)

### ⚠️ **Alternative: Hybrid Approach**

**Use Case:** Gradual rollout, testing in production

**Advantages:**
- Lower initial risk
- Easy rollback
- Test with subset of users

**Disadvantages:**
- Dual system maintenance
- More complex codebase
- localStorage still required

**Recommendation:** Only use for very large user bases with migration concerns

---

## Implementation Phases

---

### **Phase 1: Convex Setup & Configuration** (⏱️ 2-3 hours)

**Goal:** Initialize Convex project and configure environment

#### Tasks

**1.1 Initialize Convex Project**

```bash
# Navigate to project root
cd /Users/alemanb/Documents/programming/development/online-dnd-sheet

# Initialize Convex (creates convex/ directory)
npx convex dev
```

**What Happens:**
- Creates `convex/` directory at project root (NOT in front-end/)
- Generates `convex/_generated/` with TypeScript types
- Creates `.env.local` with `CONVEX_DEPLOYMENT` and `VITE_CONVEX_URL`
- Starts local development server

**1.2 Project Structure (After Initialization)**

```
online-dnd-sheet/
├── convex/                    # NEW - Backend functions
│   ├── _generated/            # Auto-generated types
│   │   ├── api.d.ts           # Convex API types
│   │   ├── dataModel.d.ts     # Database types
│   │   └── server.d.ts        # Server context types
│   ├── schema.ts              # Database schema (Phase 3)
│   ├── auth.config.ts         # Clerk integration (Phase 2)
│   ├── helpers.ts             # Shared utilities
│   ├── constants.ts           # Skill mappings (Phase 3.5)
│   ├── transformers.ts        # Data transformation (Phase 3.5)
│   ├── migrations.ts          # LocalStorage migration (Phase 3.5)
│   ├── characters.ts          # Character CRUD (Phase 4)
│   └── tsconfig.json          # TypeScript config
├── front-end/
│   ├── .env.local             # UPDATED - Add Convex URL
│   └── src/
│       ├── main.tsx           # UPDATED - Add ConvexProviderWithClerk
│       └── contexts/
│           └── CharacterContext.tsx  # UPDATED - Use Convex hooks
└── docs/
    └── convex-clerk-implementation-plan-v4.md  # This file
```

**1.3 Configure Clerk JWT Template**

**⚠️ CRITICAL STEP - Must be done before auth.config.ts**

1. **Navigate to Clerk Dashboard**
   - Go to https://dashboard.clerk.com
   - Select your application

2. **Create Convex JWT Template**
   - Navigate to: **JWT Templates** → **New template**
   - Select preset: **Convex**
   - **⚠️ DO NOT RENAME** - Token name MUST be `convex`
   - Click **Save**

3. **Copy Issuer URL**
   - Copy the **Issuer** field value
   - Format (Development): `https://verb-noun-00.clerk.accounts.dev`
   - Format (Production): `https://clerk.yourdomain.com`
   - Save this URL - you'll need it for environment variables

**1.4 Environment Configuration**

**Frontend (.env.local)**
```env
# Convex (Auto-generated by `npx convex dev`)
VITE_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=dev:your-deployment

# Clerk (Already configured)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

**Backend (Convex Dashboard)**

Set via Convex Dashboard or CLI:
```bash
# Development
npx convex env set CLERK_JWT_ISSUER_DOMAIN "https://verb-noun-00.clerk.accounts.dev"

# Production (when deploying)
npx convex env set CLERK_JWT_ISSUER_DOMAIN "https://clerk.yourdomain.com" --prod
```

**⚠️ Important Notes:**
- `CLERK_JWT_ISSUER_DOMAIN` is set in **Convex Dashboard**, NOT in `.env` files
- Must match Issuer URL from Clerk JWT template exactly
- Run `npx convex dev` after setting to sync configuration

**Success Criteria:**
- ✅ `convex/` directory created at project root
- ✅ `npx convex dev` runs without errors
- ✅ TypeScript types generated in `convex/_generated/`
- ✅ Environment variables configured
- ✅ Clerk JWT template created with name `convex`
- ✅ Issuer domain copied and saved

---

### **Phase 2: Clerk Authentication Integration** (⏱️ 1 hour)

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
      applicationID: "convex", // MUST match JWT template name
    },
  ],
} satisfies AuthConfig;
```

**Critical Configuration Points:**
- **`applicationID`**: MUST be `"convex"` (matches Clerk JWT template name)
- **`domain`**: Must match Issuer URL from Clerk JWT template exactly
- After creating this file, run `npx convex dev` to sync to backend

**2.2 Update Frontend to Use ConvexProviderWithClerk**

**⚠️ IMPORTANT:** Replace `<ClerkProvider>` wrapper with integrated provider

```typescript
// front-end/src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider, useAuth } from '@clerk/clerk-react'
import { ConvexReactClient } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import './index.css'
import App from './App.tsx'

// Validate Clerk Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

// Initialize Convex client
const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProvider
        appearance={{
          cssLayerName: "clerk",
        }}
        publishableKey={PUBLISHABLE_KEY}
        signInUrl="/signin"
        signUpUrl="/signup"
      >
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <App />
        </ConvexProviderWithClerk>
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>,
)
```

**Key Changes:**
- Import `useAuth` from `@clerk/clerk-react`
- Import `ConvexReactClient` and `ConvexProviderWithClerk`
- Wrap `<App />` with `<ConvexProviderWithClerk>`
- Pass Clerk's `useAuth` hook to Convex provider

**2.3 Create Helper Functions for User Context**

```typescript
// convex/helpers.ts
import { QueryCtx, MutationCtx } from "./_generated/server";

/**
 * Gets the authenticated user's Clerk ID from the JWT token.
 * Throws an error if the user is not authenticated.
 *
 * @returns Clerk user ID (subject from JWT token)
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

**How JWT Validation Works:**
1. User signs in via Clerk
2. Clerk issues JWT token with user info
3. `ConvexProviderWithClerk` automatically attaches token to all requests
4. Convex validates token signature using Clerk's public keys
5. `ctx.auth.getUserIdentity()` returns validated user data

**⚠️ No Webhooks Needed:**
- User info comes directly from validated JWT token
- No sync delays or webhook configuration required
- Real-time authentication state

**2.4 Use Correct Authentication Hooks in Components**

**⚠️ CRITICAL:** Use Convex's auth hooks, NOT Clerk's

```typescript
// ❌ WRONG - Don't use Clerk's hooks for auth state
import { useAuth } from '@clerk/clerk-react';

// ✅ CORRECT - Use Convex's hooks
import { useConvexAuth, Authenticated, Unauthenticated, AuthLoading } from 'convex/react';

// Example: Check authentication state
function ProtectedComponent() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading) {
    return <div>Checking authentication...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
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
        <Navigate to="/signin" replace />
      </Unauthenticated>
      <Authenticated>
        <MainApp />
      </Authenticated>
    </>
  );
}
```

**Why `useConvexAuth()` instead of Clerk's `useAuth()`:**
- Waits for backend JWT validation to complete
- Ensures Convex queries will work (won't fail with "unauthorized")
- Prevents race conditions between frontend auth state and backend validation

**Success Criteria:**
- ✅ `auth.config.ts` created with correct domain
- ✅ Configuration synced via `npx convex dev`
- ✅ `main.tsx` updated with `ConvexProviderWithClerk`
- ✅ Helper functions created in `helpers.ts`
- ✅ Components use `useConvexAuth()` instead of Clerk's `useAuth()`
- ✅ JWT token validation working (test by querying authenticated data)

---

### **Phase 3: Database Schema Implementation** (⏱️ 3-4 hours)

**Goal:** Implement complete 19-table database schema in Convex

#### Database Design

**Schema Philosophy:**
- **Normalized Structure** - Flat tables with foreign key references
- **No Computed Fields** - Calculate modifiers in queries, not storage
- **One-to-Many** - Character → related data (attributes, skills, etc.)
- **Clerk User ID** - Direct reference via `clerkUserId: v.string()`

**Table Breakdown:**
1. **Core** (4 tables): characters, sessions, sessionCharacters, users (optional)
2. **Character Data** (6 tables): attributes, combat, skills, equipment, features, attacks
3. **Spellcasting** (3 tables): spellcasting metadata, spells, spell slots
4. **Character Development** (6 tables): saving throws, currency, details, personality, proficiencies, languages

**Total: 19 tables**

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
  // For basic auth, ctx.auth.getUserIdentity() is sufficient
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
    strength: v.number(), // 1-30 (modifiers calculated in queries)
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
    skillName: v.string(), // Display name: "Sleight of Hand", "Animal Handling"
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
    spellLevel: v.number(), // 0-9 (0 = cantrip)
    prepared: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_character", ["characterId"])
    .index("by_level", ["characterId", "spellLevel"]),

  characterSpellcasting: defineTable({
    characterId: v.id("characters"),
    spellcastingClass: v.string(), // e.g., "Wizard", "Cleric"
    spellcastingAbility: v.string(), // "intelligence", "wisdom", "charisma"
    spellSaveDC: v.number(), // 8 + proficiency + ability modifier
    spellAttackBonus: v.number(), // proficiency + ability modifier
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_character", ["characterId"]),

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

  // ========================================
  // Character Development Tables
  // ========================================

  characterSavingThrows: defineTable({
    characterId: v.id("characters"),
    attributeType: v.string(), // "strength", "dexterity", etc.
    proficient: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_character", ["characterId"])
    .index("by_character_attribute", ["characterId", "attributeType"]),

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

  characterPersonality: defineTable({
    characterId: v.id("characters"),
    traits: v.optional(v.string()),
    ideals: v.optional(v.string()),
    bonds: v.optional(v.string()),
    flaws: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_character", ["characterId"]),

  characterProficiencies: defineTable({
    characterId: v.id("characters"),
    proficiencyName: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_character", ["characterId"]),

  characterLanguages: defineTable({
    characterId: v.id("characters"),
    languageName: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_character", ["characterId"]),
});
```

**Key Schema Decisions:**
- **No Computed Fields**: Modifiers calculated in queries using `Math.floor((score - 10) / 2)`
- **Flat Structure**: Combat HP split into `hpMaximum`, `hpCurrent`, `hpTemporary` (no nested objects)
- **Skill Names**: Display names ("Sleight of Hand") not camelCase (`sleightOfHand`)
- **Timestamps**: Unix milliseconds (`Date.now()`) not ISO strings
- **User Association**: `clerkUserId: v.string()` directly (no foreign key to users table needed)

**Success Criteria:**
- ✅ All 19 tables defined in schema
- ✅ Indexes created for efficient queries
- ✅ TypeScript types auto-generated in `convex/_generated/dataModel.d.ts`
- ✅ No schema validation errors when running `npx convex dev`
- ✅ 100% localStorage field coverage

---

### **Phase 3.5: Migration Transformation Layer** (⏱️ SKIPPED - Not Needed)

**⚠️ THIS PHASE IS SKIPPED FOR CLEAN STATE MIGRATION**

**Original Goal:** Create data transformation utilities for localStorage → Convex migration

**Why This Phase is NOT Needed:**
- We are starting with a **clean database state**
- **ALL localStorage data will be IGNORED**
- No data transformation required
- Users will create new characters directly in Convex
- Simpler implementation with no migration complexity

#### Tasks

**3.5.1 Create Skill Name Mapping**

LocalStorage uses camelCase JavaScript properties, but Convex schema expects human-readable display names.

```typescript
// convex/constants.ts
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

**3.5.2 Create Transformation Helpers**

```typescript
// convex/transformers.ts
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
// convex/migrations.ts
import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getAuthUserId } from "./helpers";
import { SKILL_NAME_MAP } from "./constants";
import {
  transformCombatStats,
  transformAttributes,
  normalizeOptionalString,
} from "./transformers";

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
      throw new Error(
        "Invalid character data: missing required fields (characterName, race, class)"
      );
    }

    // 1. Create character record
    const characterId = await ctx.db.insert("characters", {
      clerkUserId,
      sessionId: undefined,
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

    // 9. Migrate saving throws (6 entries per character)
    if (char.savingThrows) {
      const savingThrowAttributes = [
        "strength",
        "dexterity",
        "constitution",
        "intelligence",
        "wisdom",
        "charisma",
      ];
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

    // 10. Migrate currency
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

    // 11. Migrate character details (appearance, backstory, etc.)
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
        alliesAndOrganizations: normalizeOptionalString(
          char.details.alliesAndOrganizations
        ),
        additionalFeatures: normalizeOptionalString(
          char.details.additionalFeatures
        ),
        treasure: normalizeOptionalString(char.details.treasure),
        symbolImageUrl: normalizeOptionalString(char.details.symbolImageUrl),
        createdAt: now,
        updatedAt: now,
      });
    }

    // 12. Migrate personality traits
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

    // 13. Migrate proficiencies (armor, weapons, tools)
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

    // 14. Migrate languages
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

    // Note: passiveWisdomPerception is a calculated field and not stored
    // Calculate on query: 10 + wisdomModifier + (perceptionProficient ? proficiencyBonus : 0) + (perceptionExpertise ? proficiencyBonus : 0)

    return characterId;
  },
});
```

**Success Criteria:**
- ✅ Skill name mapping constant created with all 18 skills
- ✅ Transformation helpers created for combat and attributes
- ✅ Comprehensive migration mutation handles 100% of character data (14 migration steps)
- ✅ Validation prevents incomplete data from being migrated
- ✅ Optional fields properly normalized (empty strings → undefined)
- ✅ Spellcasting fully supported (metadata, slots, cantrips, leveled spells)
- ✅ All Character interface fields covered

---

### **Phase 4: Character CRUD Operations** (⏱️ 6-8 hours)

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

    // Fetch all related data in parallel
    const [
      attributes,
      combat,
      skills,
      equipment,
      features,
      spells,
      attacks,
      savingThrows,
      currency,
      details,
      personality,
      proficiencies,
      languages,
      spellcasting,
      spellSlots,
    ] = await Promise.all([
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
      ctx.db
        .query("characterSavingThrows")
        .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
        .collect(),
      ctx.db
        .query("characterCurrency")
        .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
        .unique(),
      ctx.db
        .query("characterDetails")
        .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
        .unique(),
      ctx.db
        .query("characterPersonality")
        .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
        .unique(),
      ctx.db
        .query("characterProficiencies")
        .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
        .collect(),
      ctx.db
        .query("characterLanguages")
        .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
        .collect(),
      ctx.db
        .query("characterSpellcasting")
        .withIndex("by_character", (q) => q.eq("characterId", args.characterId))
        .unique(),
      ctx.db
        .query("characterSpellSlots")
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
      savingThrows,
      currency,
      details,
      personality,
      proficiencies,
      languages,
      spellcasting,
      spellSlots,
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
      clerkUserId,
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
- ✅ Character queries return complete data from all 19 tables
- ✅ Updates properly secured by user ownership (clerkUserId check)
- ✅ Soft delete preserves data (isActive: false)
- ✅ All operations type-safe via auto-generated types

---

### **Phase 5: Frontend Integration** (⏱️ 8-10 hours)

**Goal:** Connect React components to Convex backend

#### Tasks

**5.1 Update CharacterContext to Use Convex Hooks**

**⚠️ CRITICAL:** This completely replaces the localStorage-based context

```typescript
// front-end/src/contexts/CharacterContext.tsx
import { createContext, useContext, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface CharacterContextType {
  currentCharacterId: Id<"characters"> | null;
  character: any; // TODO: Create proper type from Convex schema
  isLoading: boolean;
  setCurrentCharacter: (id: Id<"characters">) => void;
  updateCharacter: (updates: any) => Promise<void>;
  updateAttributes: (attributes: any) => Promise<void>;
  updateCombat: (combat: any) => Promise<void>;
}

const CharacterContext = createContext<CharacterContextType | undefined>(
  undefined
);

export function CharacterProvider({ children }: { children: React.ReactNode }) {
  const [currentCharacterId, setCurrentCharacterId] =
    useState<Id<"characters"> | null>(null);

  // Reactive query - automatically updates when data changes
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
    await updateAttributesMutation({
      characterId: currentCharacterId,
      attributes,
    });
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
    throw new Error("useCharacter must be used within CharacterProvider");
  }
  return context;
}
```

**Key Changes:**
- Replace `useState` + localStorage → `useQuery` + Convex
- Replace `saveCharacter()` → `useMutation(api.characters.updateCharacter)`
- Replace `loadCharacter()` → Automatic via reactive query
- Remove `autoSave` prop - Convex mutations are immediate
- Remove `lastSaved` tracking - Convex handles persistence

**5.2 Create Character List Page**

```typescript
// front-end/src/pages/CharacterListPage.tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useNavigate } from "react-router-dom";

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

**5.3 Update App Routing**

```typescript
// front-end/src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { CharacterProvider } from "@/contexts/CharacterContext";
import { CharacterSheet } from "@/components/character-sheet";
import { CharacterListPage } from "@/pages/CharacterListPage";
import { SignInPage } from "@/pages/SignInPage";
import { SignUpPage } from "@/pages/SignUpPage";

const App = () => {
  return (
    <>
      <AuthLoading>
        <div className="flex items-center justify-center h-screen">
          <div>Checking authentication...</div>
        </div>
      </AuthLoading>

      <Unauthenticated>
        <Routes>
          <Route path="/signin/*" element={<SignInPage />} />
          <Route path="/signup/*" element={<SignUpPage />} />
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </Unauthenticated>

      <Authenticated>
        <CharacterProvider>
          <Routes>
            <Route path="/" element={<CharacterListPage />} />
            <Route path="/character/:id" element={<CharacterSheet />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CharacterProvider>
      </Authenticated>
    </>
  );
};

export default App;
```

**Key Changes:**
- Use `<Authenticated>`, `<Unauthenticated>`, `<AuthLoading>` from `convex/react`
- Remove manual `ProtectedRoute` component
- Add `/` route for character list
- Add `/character/:id` route for character sheet
- Wrap authenticated routes with `<CharacterProvider>`

**5.4 Clear localStorage on App Load (Clean State)**

**⚠️ CRITICAL: This ensures we start with a clean database state**

```typescript
// front-end/src/App.tsx
import { useEffect } from 'react';

const App = () => {
  // Clear all localStorage data on first load
  useEffect(() => {
    const hasCleared = localStorage.getItem('convex-migration-complete');

    if (!hasCleared) {
      // Clear all D&D character data from localStorage
      localStorage.removeItem('dnd-character');
      localStorage.removeItem('dnd-character-list');
      localStorage.removeItem('dnd-last-saved');

      // Mark cleanup as complete
      localStorage.setItem('convex-migration-complete', 'true');
      console.log('✅ localStorage cleared - starting with clean Convex state');
    }
  }, []);

  return (
    <>
      <AuthLoading>
        <div className="flex items-center justify-center h-screen">
          <div>Checking authentication...</div>
        </div>
      </AuthLoading>

      {/* Rest of app */}
    </>
  );
};
```

**5.5 Remove localStorage Dependencies**

```typescript
// front-end/src/utils/storage.ts
// DEPRECATED: All functions removed - Convex is now the single source of truth
// This file can be deleted after Phase 5 is complete
```

**Success Criteria:**
- ✅ CharacterContext uses Convex hooks (useQuery, useMutation)
- ✅ Characters load from Convex database
- ✅ Real-time updates working (change in one tab visible in another)
- ✅ **localStorage cleared on first app load**
- ✅ **No localStorage data persists after cleanup**
- ✅ No localStorage calls in main app flow
- ✅ Type safety maintained with auto-generated Convex types
- ✅ Routing updated with character list and detail pages

---

### **Phase 6: Data Migration from localStorage** (⏱️ SKIPPED - Not Needed)

**⚠️ THIS PHASE IS COMPLETELY SKIPPED FOR CLEAN STATE MIGRATION**

**Original Goal:** Migrate existing user data from localStorage to Convex

**Why This Phase is NOT Needed:**
- We are implementing a **CLEAN STATE migration**
- **ALL localStorage data will be IGNORED**
- No migration component will be created
- Users will start fresh with new characters in Convex
- localStorage will be cleared automatically on first app load

#### Tasks

**6.1 Create Migration Component**

```typescript
// front-end/src/components/DataMigration.tsx
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { loadCharacter, clearCharacter } from "@/utils/storage";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

type MigrationStatus =
  | "pending"
  | "validating"
  | "migrating"
  | "complete"
  | "error";

export function DataMigration() {
  const [status, setStatus] = useState<MigrationStatus>("pending");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [migratedCharacterId, setMigratedCharacterId] = useState<string | null>(
    null
  );

  // Use comprehensive migration mutation from Phase 3.5
  const migrateCharacter = useMutation(
    api.migrations.migrateLocalStorageCharacter
  );

  const validateCharacter = (
    character: any
  ): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check required fields
    if (!character.characterName || character.characterName.trim() === "") {
      errors.push("Character name is required");
    }
    if (!character.race) {
      errors.push("Race is required");
    }
    if (!character.class) {
      errors.push("Class is required");
    }

    // Check attributes structure
    if (!character.attributes || typeof character.attributes !== "object") {
      errors.push("Invalid attributes structure");
    }

    // Check combat structure
    if (!character.combat || typeof character.combat !== "object") {
      errors.push("Invalid combat stats structure");
    }

    // Check skills structure
    if (!character.skills || typeof character.skills !== "object") {
      errors.push("Invalid skills structure");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  };

  const migrateData = async () => {
    setStatus("validating");
    setErrorMessage("");

    try {
      // Load character from localStorage
      const localCharacter = loadCharacter();

      if (!localCharacter) {
        // No character data found - mark as complete
        setStatus("complete");
        return;
      }

      // Pre-migration validation
      const validation = validateCharacter(localCharacter);
      if (!validation.valid) {
        throw new Error(
          `Character data validation failed:\n${validation.errors.join("\n")}`
        );
      }

      setStatus("migrating");

      // Call comprehensive migration mutation
      // This handles ALL data transformation automatically
      const characterId = await migrateCharacter({
        localCharacter: localCharacter,
      });

      console.log(`✅ Character migrated successfully: ${characterId}`);
      setMigratedCharacterId(characterId);

      // Clear localStorage ONLY after successful migration
      clearCharacter();
      console.log("✅ LocalStorage cleared");

      setStatus("complete");
    } catch (error) {
      console.error("❌ Migration failed:", error);
      const message =
        error instanceof Error ? error.message : "Unknown migration error";
      setErrorMessage(message);
      setStatus("error");
    }
  };

  // Don't render if migration is complete
  if (status === "complete" && !migratedCharacterId) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-white border border-gray-200 rounded-lg shadow-xl p-6">
      {/* Success State */}
      {status === "complete" && migratedCharacterId && (
        <div className="flex items-start gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-gray-900 mb-1">
              Migration Complete!
            </h3>
            <p className="text-sm text-gray-600">
              Your character has been successfully migrated to your account and
              is now accessible from any device.
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {status === "error" && (
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 mb-1">Migration Failed</h3>
            <p className="text-sm text-gray-600 mb-3">
              {errorMessage || "An unknown error occurred during migration."}
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
      {status === "pending" && (
        <div>
          <h3 className="font-bold text-gray-900 mb-2">
            Character Data Found
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            We found character data in your browser. Migrate it to your account
            for cross-device access and backup.
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
      {status === "validating" && (
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
      {status === "migrating" && (
        <div className="flex items-center gap-3">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin flex-shrink-0" />
          <div>
            <h3 className="font-bold text-gray-900 mb-1">
              Migrating Character...
            </h3>
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

**6.2 Add Migration Component to App**

```typescript
// front-end/src/App.tsx
import { DataMigration } from "@/components/DataMigration";
import { Authenticated } from "convex/react";

function App() {
  return (
    <>
      {/* Only show migration prompt to authenticated users */}
      <Authenticated>
        <DataMigration />
      </Authenticated>

      {/* Rest of app */}
      <Routes>{/* ... */}</Routes>
    </>
  );
}
```

**Success Criteria:**
- ✅ LocalStorage data detected on first login
- ✅ Pre-migration validation prevents incomplete data
- ✅ Comprehensive migration completes successfully (all 19 tables)
- ✅ Data accessible from any device after migration
- ✅ LocalStorage cleared ONLY after successful Convex write
- ✅ Error handling provides clear debugging information
- ✅ Progress states give user feedback during migration

---

### **Phase 7: Testing & Quality Assurance** (⏱️ 6-8 hours)

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
  expect(character.attributes).toBeDefined();
  expect(character.combat).toBeDefined();
});

test("unauthorized access throws error", async () => {
  const t = convexTest(schema);

  // Create character as user1
  const asUser1 = t.withIdentity({ subject: "user1" });
  const characterId = await asUser1.mutation(api.characters.createCharacter, {
    characterName: "User 1 Character",
    race: "Human",
    class: "Fighter",
    level: 1,
  });

  // Try to access as user2
  const asUser2 = t.withIdentity({ subject: "user2" });
  await expect(
    asUser2.query(api.characters.getCharacter, { characterId })
  ).rejects.toThrow("Character not found or unauthorized");
});
```

**7.2 Integration Tests**

```typescript
// front-end/src/components/__tests__/CharacterSheet.integration.test.tsx
import { render, screen, waitFor } from "@testing-library/react";
import { ConvexReactClient } from "convex/react";
import { ConvexProvider } from "convex/react";
import { CharacterSheet } from "@/components/character-sheet/CharacterSheet";

const convex = new ConvexReactClient(process.env.VITE_CONVEX_URL as string);

describe("CharacterSheet Integration", () => {
  it("loads character from Convex", async () => {
    render(
      <ConvexProvider client={convex}>
        <CharacterSheet />
      </ConvexProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/character name/i)).toBeInTheDocument();
    });
  });
});
```

**7.3 E2E Tests with Playwright**

```typescript
// e2e/character-management.spec.ts
import { test, expect } from "@playwright/test";

test("complete character creation flow", async ({ page }) => {
  // Sign in
  await page.goto("/signin");
  await page.fill('[name="identifier"]', "test@example.com");
  await page.click('button:has-text("Continue")');
  await page.fill('[name="password"]', "password123");
  await page.click('button:has-text("Continue")');

  // Wait for redirect to character list
  await expect(page).toHaveURL("/");

  // Create character
  await page.click('button:has-text("Create New Character")');

  // Verify character appears in list
  await expect(page.locator("text=New Character")).toBeVisible();
});

test("character data persists across sessions", async ({ page, context }) => {
  // Create character in first session
  await page.goto("/");
  // ... create character flow

  // Close browser and reopen
  await context.close();
  const newContext = await page.context().browser()?.newContext();
  const newPage = await newContext!.newPage();

  // Verify character still exists
  await newPage.goto("/");
  await expect(newPage.locator("text=Test Character")).toBeVisible();
});
```

**Success Criteria:**
- ✅ All unit tests passing (Convex functions)
- ✅ Integration tests covering critical paths (React + Convex)
- ✅ E2E tests for user workflows (Playwright)
- ✅ >80% code coverage
- ✅ No TypeScript errors
- ✅ Linter passing

---

### **Phase 8: Deployment** (⏱️ 2-3 hours)

**Goal:** Deploy to production environment

#### Tasks

**8.1 Deploy Convex Backend**

```bash
# Deploy to production
npx convex deploy --prod

# Set production environment variables
npx convex env set CLERK_JWT_ISSUER_DOMAIN "https://clerk.yourdomain.com" --prod
```

**What Happens:**
- Convex creates production deployment
- Schema and functions deployed to production
- Production URL generated (e.g., `https://your-prod.convex.cloud`)

**8.2 Update Frontend Environment Variables**

```env
# .env.production
VITE_CONVEX_URL=https://your-prod.convex.cloud
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
```

**8.3 Deploy Frontend**

```bash
# Build frontend with production Convex URL
npm run build

# Deploy to Vercel/Netlify
vercel --prod
# OR
netlify deploy --prod
```

**8.4 Update Clerk Production Settings**

1. **Update Clerk JWT Template**
   - Navigate to Clerk Dashboard → JWT Templates
   - Select your "convex" template
   - Verify Issuer URL matches production domain
   - Save changes

2. **Update Allowed Origins** (if using Clerk Hosted Pages)
   - Add production URL to allowed redirect URLs
   - Add production URL to allowed origins

**8.5 Monitoring Setup**

**Convex Dashboard:**
- Monitor function execution times
- Track database query performance
- Set up alerts for errors

**Error Tracking (Sentry - Optional):**
```typescript
// front-end/src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay(),
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

**Success Criteria:**
- ✅ Backend deployed to Convex production
- ✅ Frontend deployed and connected to production backend
- ✅ Authentication working in production
- ✅ Monitoring and error tracking in place
- ✅ Production environment variables set correctly

---

## Effort Estimation

### Time Breakdown

| Phase | Description | Estimated Hours | Risk Level | Status |
|-------|-------------|----------------|------------|--------|
| **Phase 1** | Convex Setup & Configuration | 2-3 hours | Low | Required |
| **Phase 2** | Clerk Authentication Integration | 1 hour | Low | Required |
| **Phase 3** | Database Schema Implementation | 3-4 hours | Low | Required |
| **Phase 3.5** | ~~Migration Transformation Layer~~ | ~~4-5 hours~~ | ~~Medium~~ | **SKIPPED** |
| **Phase 4** | Character CRUD Operations | 6-8 hours | Medium | Required |
| **Phase 5** | Frontend Integration | 8-10 hours | High | Required |
| **Phase 6** | ~~Data Migration Component~~ | ~~3-4 hours~~ | ~~Medium~~ | **SKIPPED** |
| **Phase 7** | Testing & QA | 6-8 hours | Medium | Required |
| **Phase 8** | Deployment | 2-3 hours | Low | Required |
| **TOTAL** | **29-38 hours** | **(4-5 full workdays)** | | **7-8 hours saved** |

### Risk Assessment

**Low Risk:**
- Convex already installed
- Clerk already integrated
- Well-documented official APIs
- Excellent TypeScript support

**Medium Risk:**
- Frontend context rewrite (well-planned in Phase 5)
- ~~Data transformation complexity~~ - **ELIMINATED** (no migration needed)
- ~~Migration testing~~ - **ELIMINATED** (no migration component)

**High Risk:**
- None identified (good planning eliminates high-risk scenarios)

---

## Rollback Plan

### Emergency Rollback Procedure

If critical issues occur:

**Step 1: Create Legacy Context Backup**

Before starting Phase 5, save original context:
```bash
cp front-end/src/contexts/CharacterContext.tsx front-end/src/contexts/CharacterContextLegacy.tsx
```

**Step 2: Revert Frontend Changes**

```typescript
// front-end/src/main.tsx
// Comment out ConvexProviderWithClerk
// Restore original ClerkProvider-only setup

// front-end/src/contexts/CharacterContext.tsx
// Restore from CharacterContextLegacy.tsx
```

**Step 3: Re-enable localStorage**

```typescript
// front-end/src/utils/storage.ts
// Uncomment all localStorage functions
```

**Step 4: Notify Users**

Display banner: "Temporary maintenance mode - using offline storage"

**Step 5: Debug & Fix**

- Review Convex Dashboard logs
- Check authentication flow
- Verify environment variables
- Test with sample data

**Step 6: Re-deploy**

- Fix issues in development
- Test thoroughly
- Gradual production rollout

---

## Success Metrics

### Performance Targets

| Metric | Target | Measurement Tool |
|--------|--------|------------------|
| Page Load Time | <2s | Lighthouse |
| Time to Interactive | <3s | Lighthouse |
| Character Query Time | <200ms | Convex Dashboard |
| Mutation Response Time | <300ms | Convex Dashboard |
| Real-time Update Latency | <100ms | WebSocket monitoring |

### Quality Metrics

| Metric | Target |
|--------|--------|
| Test Coverage | >80% |
| TypeScript Strict Mode | Enabled |
| Zero ESLint Errors | ✅ |
| Accessibility Score | >90 (Lighthouse) |
| Bundle Size | <500KB initial, <2MB total |

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
├── convex/                    # Backend functions (NEW)
│   ├── _generated/            # Auto-generated types
│   │   ├── api.d.ts           # Convex API types
│   │   ├── dataModel.d.ts     # Database types
│   │   └── server.d.ts        # Server context types
│   ├── schema.ts              # Database schema (19 tables)
│   ├── auth.config.ts         # Clerk JWT validation
│   ├── helpers.ts             # getAuthUserId, getUserIdentity
│   ├── constants.ts           # SKILL_NAME_MAP (18 skills)
│   ├── transformers.ts        # Data transformation helpers
│   ├── migrations.ts          # localStorage → Convex migration
│   ├── characters.ts          # Character CRUD operations
│   └── tsconfig.json          # TypeScript config for Convex
├── front-end/
│   ├── .env.local             # UPDATED - Add VITE_CONVEX_URL
│   └── src/
│       ├── main.tsx           # UPDATED - ConvexProviderWithClerk
│       ├── App.tsx            # UPDATED - Use Convex auth components
│       ├── contexts/
│       │   └── CharacterContext.tsx  # UPDATED - Use Convex hooks
│       ├── components/
│       │   └── DataMigration.tsx     # NEW - Migration UI
│       ├── pages/
│       │   └── CharacterListPage.tsx # NEW - Character selection
│       └── utils/
│           └── storage.ts     # DEPRECATED - Keep for migration only
└── docs/
    ├── database-design.md
    └── convex-clerk-implementation-plan-v4.md  # This file
```

---

## Appendix B: Environment Variables

### Frontend (.env.local)
```env
# Convex (auto-generated by `npx convex dev`)
VITE_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=dev:your-deployment

# Clerk (already configured)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

### Backend (Convex Dashboard)

Set via Convex Dashboard or CLI:
```bash
# Development
npx convex env set CLERK_JWT_ISSUER_DOMAIN "https://verb-noun-00.clerk.accounts.dev"

# Production
npx convex env set CLERK_JWT_ISSUER_DOMAIN "https://clerk.yourdomain.com" --prod
```

**Important Notes:**
- `CLERK_JWT_ISSUER_DOMAIN` set in Convex Dashboard, NOT `.env` files
- Must match Issuer URL from Clerk JWT template exactly
- Run `npx convex dev` after setting to sync configuration
- No webhook secrets needed (JWT validation only)

---

## Appendix C: Key Learnings from Official Docs

### Authentication Flow (Official Convex Docs)

1. **User signs in via Clerk** → Clerk issues JWT token
2. **ConvexProviderWithClerk** → Automatically attaches token to requests
3. **Convex validates JWT** → Uses Clerk's public keys
4. **`ctx.auth.getUserIdentity()`** → Returns validated user data

**Critical Points:**
- ✅ No webhooks needed for basic authentication
- ✅ JWT template name MUST be `convex`
- ✅ Use `useConvexAuth()` instead of Clerk's `useAuth()`
- ✅ `ConvexProviderWithClerk` handles token refresh automatically

### Schema Design (Official Convex Docs)

**Best Practices:**
- Use `v.id("tableName")` for foreign key references
- Indexes required for efficient queries on foreign keys
- Timestamps as `v.number()` (milliseconds since epoch)
- Optional fields with `v.optional(v.string())`
- No support for computed/virtual fields (calculate in queries)

### Real-time Updates (Official Convex Docs)

**How It Works:**
- `useQuery()` creates WebSocket subscription
- Backend notifies frontend when data changes
- React automatically re-renders with new data
- No manual polling or cache invalidation needed

---

## Next Steps

1. ✅ **Review this document** with team
2. 📋 **Set up Convex account** and create project
3. 🚀 **Begin Phase 1** (Convex initialization)
4. ⚙️ **Complete Phases 2-3.5** (Auth + Schema + Transformations)
5. 🔄 **Execute Phase 4-5** (CRUD + Frontend)
6. 📊 **Track progress** using project management tool
7. 🧪 **Test thoroughly** (Phase 7)
8. 🌐 **Deploy to production** (Phase 8)

---

**Document Version:** 4.1 (Clean State Migration - No localStorage Data Transfer)
**Last Updated:** 2024-12-18
**Status:** Production-Ready Implementation Guide
**Migration Strategy:** Clean State - ALL localStorage data IGNORED
**Based on:** Official Convex & Clerk Documentation
**Document End**
