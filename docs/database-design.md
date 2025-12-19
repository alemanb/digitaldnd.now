# Database Design Documentation

## DND Character Sheet - Database Schema & Architecture

**Version:** 2.0 - Convex Implementation
**Last Updated:** 2024-12-18
**Primary Database:** Convex (Real-time TypeScript Database)
**Alternative:** PostgreSQL/Supabase (legacy reference)
**Authentication:** Clerk
**Active Implementation:** See `/docs/convex-clerk-implementation-plan.md` (Version 3.1)

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Principles](#architecture-principles)
3. [Convex vs PostgreSQL Comparison](#convex-vs-postgresql-comparison)
4. [Entity-Relationship Diagram](#entity-relationship-diagram)
5. [Database Schema](#database-schema)
6. [Table Definitions](#table-definitions)
7. [Relationships](#relationships)
8. [Row-Level Security (RLS)](#row-level-security-rls)
9. [Clerk Integration](#clerk-integration)
10. [Indexes & Performance](#indexes--performance)
11. [Migration Guide](#migration-guide)

---

## Overview

**⚠️ IMPORTANT NOTE:**
This document provides the **logical database design** for the DND Character Sheet application. While SQL examples are shown for reference, the **primary implementation uses Convex** (a real-time TypeScript database). See `/docs/convex-clerk-implementation-plan.md` for the complete Convex implementation with 19 tables and full migration support.

This database design supports a multi-user DND 5e character sheet application with the following capabilities:

- ✅ **User Authentication**: Integrated with Clerk for secure user management (JWT-based)
- ✅ **Multi-Session Support**: Users can create and manage multiple game sessions
- ✅ **Character Management**: Full DND 5e character data storage (100% localStorage coverage)
- ✅ **Character Sharing**: Characters can be associated with multiple sessions
- ✅ **Real-Time Sync**: Convex provides instant updates across devices
- ✅ **Authorization**: Application-level access control via Clerk JWT validation
- ✅ **Audit Trail**: Automatic timestamp tracking on all records

---

## Architecture Principles

### 1. **Normalized Design**
- Character data is split into logical tables (19 tables total)
- Eliminates data redundancy and maintains data integrity
- Easier to maintain and query specific character aspects
- **Convex Implementation**: TypeScript schema with `defineTable()` and indexes

### 2. **Clerk-First Authentication (JWT-Based)**
- Clerk manages user authentication and sessions
- **No webhook sync required** - Convex validates JWT tokens directly
- `clerkUserId` from `ctx.auth.getUserIdentity()` used throughout schema
- **Convex Implementation**: `auth.config.ts` with Clerk issuer domain

### 3. **Application-Level Authorization (Convex)**
- Authorization via `ctx.auth.getUserIdentity()` in queries/mutations
- Users can only access their own characters, sessions, and related data
- Security enforced through Convex function logic with Clerk JWT validation
- **PostgreSQL Alternative**: Row-Level Security (RLS) policies (if using Supabase)

### 4. **Real-Time Synchronization (Convex)**
- Convex provides automatic real-time updates across all devices
- No polling or manual refresh needed
- Live queries reactively update UI components
- **Benefits**: Multi-device access, collaborative features ready

### 5. **Flexible Session Management**
- Users can create multiple game sessions
- Characters can be created independently or assigned to sessions
- Many-to-many relationship allows character sharing across sessions
- **Convex Implementation**: `sessionCharacters` junction table with indexes

### 6. **Audit & Compliance**
- All tables include `createdAt` and `updatedAt` timestamps (stored as numbers)
- Automatic timestamp updates on modifications
- Supports compliance and debugging requirements
- **Convex Implementation**: `v.number()` for Unix timestamps

---

## Convex vs PostgreSQL Comparison

| Feature | Convex (Primary) | PostgreSQL/Supabase (Alternative) |
|---------|------------------|-----------------------------------|
| **Setup Time** | ⚡ 5 minutes (`npx convex dev`) | 🕐 30-60 minutes (DB setup, migrations, ORM) |
| **Type Safety** | ✅ End-to-end TypeScript | ⚠️ Requires ORM (Prisma/Drizzle) |
| **Real-Time** | ✅ Built-in live queries | ⚠️ Requires Supabase Realtime or polling |
| **Authentication** | ✅ JWT validation (no webhooks) | ⚠️ Webhook sync required |
| **Authorization** | ✅ Application-level via functions | ✅ Row-Level Security (RLS) |
| **Serverless Functions** | ✅ Built-in (queries, mutations, actions) | ❌ Requires separate API layer |
| **Schema Migration** | ✅ Automatic via `npx convex dev` | ⚠️ Manual migrations via ORM |
| **Scaling** | ✅ Automatic serverless scaling | ⚠️ Manual capacity planning |
| **Deployment** | ✅ `npx convex deploy` (30 seconds) | ⚠️ Multiple steps (DB, API, frontend) |
| **Cost (Low Traffic)** | ✅ Free tier generous | ✅ Supabase free tier available |
| **SQL Queries** | ❌ No raw SQL (TypeScript queries) | ✅ Full SQL support |
| **Existing Tools** | ⚠️ Limited third-party integrations | ✅ Extensive ecosystem |
| **Learning Curve** | ⚡ Low (if you know TypeScript) | ⚠️ Medium (SQL + ORM + RLS) |
| **Use Case** | ✅ **New projects, real-time apps, TypeScript teams** | ✅ SQL expertise, existing infrastructure, complex queries |

**Recommendation**: Use **Convex** for this project because:
1. ✅ Real-time character sync across devices built-in
2. ✅ TypeScript end-to-end (matches existing React codebase)
3. ✅ Zero backend code needed (Convex handles API layer)
4. ✅ Faster development (schema changes auto-migrate)
5. ✅ Clerk integration simpler (no webhook sync)

**When to use PostgreSQL/Supabase instead**:
- You have existing PostgreSQL infrastructure
- Your team prefers SQL over TypeScript queries
- You need complex SQL joins or transactions
- Third-party integrations require PostgreSQL

---

## Entity-Relationship Diagram

**Note**: This diagram shows the logical relationships. For Convex implementation:
- Replace PostgreSQL types with Convex types (`v.string()`, `v.number()`, etc.)
- Use `clerkUserId: v.string()` instead of foreign key to users table
- Authentication handled via `ctx.auth.getUserIdentity()` in Convex functions
- See `/docs/convex-clerk-implementation-plan.md` for complete Convex schema

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLERK AUTHENTICATION                          │
│                     (Managed by Clerk Service)                       │
│                                                                      │
│  ┌──────────────────────────────────────┐                          │
│  │         Clerk User Object            │                          │
│  ├──────────────────────────────────────┤                          │
│  │ • id (PK)                            │                          │
│  │ • email_addresses[]                  │                          │
│  │ • first_name                         │                          │
│  │ • last_name                          │                          │
│  │ • image_url                          │                          │
│  │ • created_at                         │                          │
│  │ • updated_at                         │                          │
│  └──────────────┬───────────────────────┘                          │
│                 │                                                   │
└─────────────────┼───────────────────────────────────────────────────┘
                  │
                  │ 1:1 Sync via Webhook
                  ▼
┌──────────────────────────────────────────┐
│            users                         │
├──────────────────────────────────────────┤
│ id              TEXT (PK) ◄──────────────┼─── Clerk User ID
│ clerk_user_id   TEXT (UNIQUE, NOT NULL)  │
│ email           TEXT (NOT NULL)          │
│ first_name      TEXT                     │
│ last_name       TEXT                     │
│ image_url       TEXT                     │
│ created_at      TIMESTAMP (DEFAULT NOW)  │
│ updated_at      TIMESTAMP (DEFAULT NOW)  │
└──────────────┬───────────────────────────┘
               │
               │ 1:N (One user has many sessions)
               │
               ├──────────────────────────────────────────────┐
               │                                              │
               ▼                                              ▼
┌──────────────────────────────────────────┐   ┌──────────────────────────────────────────┐
│          sessions                        │   │          characters                      │
├──────────────────────────────────────────┤   ├──────────────────────────────────────────┤
│ id              UUID (PK, DEFAULT)       │   │ id              UUID (PK, DEFAULT)       │
│ user_id         TEXT (FK → users.id)     │   │ user_id         TEXT (FK → users.id)     │
│ session_name    TEXT (NOT NULL)          │   │ character_name  TEXT (NOT NULL)          │
│ is_active       BOOLEAN (DEFAULT false)  │   │ player_name     TEXT                     │
│ last_accessed   TIMESTAMP (DEFAULT NOW)  │   │ race            TEXT (NOT NULL)          │
│ created_at      TIMESTAMP (DEFAULT NOW)  │   │ class           TEXT (NOT NULL)          │
│ updated_at      TIMESTAMP (DEFAULT NOW)  │   │ level           INTEGER (DEFAULT 1)      │
└──────────────┬───────────────────────────┘   │ background      TEXT                     │
               │                                │ alignment       TEXT                     │
               │ 1:N                            │ experience_points INTEGER (DEFAULT 0)   │
               │                                │ session_id      UUID (FK → sessions.id)  │
               ▼                                │ created_at      TIMESTAMP (DEFAULT NOW)  │
┌──────────────────────────────────────────┐   │ updated_at      TIMESTAMP (DEFAULT NOW)  │
│      session_characters                  │   │ is_active       BOOLEAN (DEFAULT true)   │
├──────────────────────────────────────────┤   └──────────────┬───────────────────────────┘
│ id              UUID (PK, DEFAULT)       │                  │
│ session_id      UUID (FK → sessions.id)  │                  │ 1:1 relationships to:
│ character_id    UUID (FK → characters.id)│                  │
│ added_at        TIMESTAMP (DEFAULT NOW)  │                  ├─► character_attributes
└──────────────────────────────────────────┘                  ├─► character_combat
                                                              │
                                                              │ 1:N relationships to:
                                                              ├─► character_skills
                                                              ├─► character_equipment
                                                              ├─► character_features
                                                              ├─► character_spells
                                                              └─► character_attacks
```

---

## Database Schema

### Core Entities

| Table | Purpose | Relationship |
|-------|---------|--------------|
| `users` | Clerk user synchronization | Synced from Clerk webhooks |
| `sessions` | Game session management | Belongs to user |
| `characters` | DND character basic info | Belongs to user, optionally to session |
| `session_characters` | Junction table for many-to-many | Links sessions and characters |

### Character Data Tables

| Table | Purpose | Relationship |
|-------|---------|--------------|
| `character_attributes` | STR, DEX, CON, INT, WIS, CHA | One-to-one with character |
| `character_combat` | HP, AC, initiative, death saves | One-to-one with character |
| `character_skills` | Skill proficiencies and expertise | One-to-many with character |
| `character_equipment` | Inventory items | One-to-many with character |
| `character_features` | Class/race features and traits | One-to-many with character |
| `character_spells` | Known and prepared spells | One-to-many with character |
| `character_attacks` | Attacks and weapons | One-to-many with character |
| `character_saving_throws` | Saving throw proficiencies | One-to-many with character (6 entries) |
| `character_currency` | Wealth tracking (CP, SP, EP, GP, PP) | One-to-one with character |
| `character_details` | Appearance, backstory, physical traits | One-to-one with character |
| `character_personality` | Traits, ideals, bonds, flaws | One-to-one with character |
| `character_proficiencies` | Armor, weapon, tool proficiencies | One-to-many with character |
| `character_languages` | Known languages | One-to-many with character |

---

## Table Definitions

### 1. users

**Purpose**: Store synchronized user data from Clerk authentication.

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY DEFAULT auth.jwt()->>'sub',
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Fields**:
- `id`: Primary key derived from Clerk JWT token
- `clerk_user_id`: Unique identifier from Clerk
- `email`: User's primary email address

**Notes**:
- Automatically populated via Clerk webhooks
- `id` defaults to the authenticated user's Clerk ID via `auth.jwt()->>'sub'`

---

### 2. sessions

**Purpose**: Manage user-created game sessions.

```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT false,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Fields**:
- `id`: UUID primary key
- `user_id`: Foreign key to users table
- `session_name`: User-defined session name
- `is_active`: Indicates currently active session

**Use Cases**:
- Campaign management
- Multiple parallel games
- Session-specific character grouping

---

### 3. characters

**Purpose**: Store DND 5e character basic information.

```sql
CREATE TABLE characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  character_name TEXT NOT NULL,
  player_name TEXT,
  race TEXT NOT NULL,
  class TEXT NOT NULL,
  level INTEGER DEFAULT 1 CHECK (level >= 1 AND level <= 20),
  background TEXT,
  alignment TEXT,
  experience_points INTEGER DEFAULT 0,
  proficiency_bonus INTEGER DEFAULT 2,
  inspiration BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);
```

**Key Fields**:
- `id`: UUID primary key
- `user_id`: Owner of the character (FK to users)
- `session_id`: Optional association with a session
- `level`: Character level (1-20) with CHECK constraint

**Notes**:
- `session_id` is nullable - characters can exist independently
- `ON DELETE SET NULL` for `session_id` preserves characters when sessions are deleted
- `ON DELETE CASCADE` for `user_id` removes all characters when user is deleted

---

### 4. session_characters (Junction Table)

**Purpose**: Enable many-to-many relationship between sessions and characters.

```sql
CREATE TABLE session_characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, character_id)
);
```

**Key Features**:
- Prevents duplicate character-session associations via `UNIQUE` constraint
- `CASCADE` deletion removes associations when either session or character is deleted

**Use Cases**:
- Sharing characters across multiple campaigns
- Guest characters in one-shot sessions
- Character party management

---

### 5. character_attributes

**Purpose**: Store the six core DND attributes.

```sql
CREATE TABLE character_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID UNIQUE NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  strength INTEGER DEFAULT 10 CHECK (strength >= 1 AND strength <= 30),
  dexterity INTEGER DEFAULT 10 CHECK (dexterity >= 1 AND dexterity <= 30),
  constitution INTEGER DEFAULT 10 CHECK (constitution >= 1 AND constitution <= 30),
  intelligence INTEGER DEFAULT 10 CHECK (intelligence >= 1 AND intelligence <= 30),
  wisdom INTEGER DEFAULT 10 CHECK (wisdom >= 1 AND wisdom <= 30),
  charisma INTEGER DEFAULT 10 CHECK (charisma >= 1 AND charisma <= 30),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features**:
- `UNIQUE` constraint on `character_id` enforces one-to-one relationship
- `CHECK` constraints ensure valid attribute scores (1-30)
- Defaults to 10 (standard human average)

**Notes**:
- Modifiers are calculated in application layer: `Math.floor((score - 10) / 2)`

---

### 6. character_combat

**Purpose**: Store combat-related statistics.

```sql
CREATE TABLE character_combat (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID UNIQUE NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  armor_class INTEGER DEFAULT 10,
  initiative INTEGER DEFAULT 0,
  speed INTEGER DEFAULT 30,
  hp_maximum INTEGER DEFAULT 10,
  hp_current INTEGER DEFAULT 10,
  hp_temporary INTEGER DEFAULT 0,
  hit_dice_total TEXT DEFAULT '1d8',
  hit_dice_current INTEGER DEFAULT 1,
  death_saves_successes INTEGER DEFAULT 0 CHECK (death_saves_successes >= 0 AND death_saves_successes <= 3),
  death_saves_failures INTEGER DEFAULT 0 CHECK (death_saves_failures >= 0 AND death_saves_failures <= 3),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features**:
- `UNIQUE` constraint on `character_id` (one-to-one)
- Death saves constrained to 0-3 range
- `hit_dice_total` stored as text (e.g., "2d8")

---

### 7. character_skills

**Purpose**: Track skill proficiencies and expertise.

```sql
CREATE TABLE character_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  proficient BOOLEAN DEFAULT false,
  expertise BOOLEAN DEFAULT false,
  attribute_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(character_id, skill_name)
);
```

**Key Features**:
- One-to-many relationship with characters
- `UNIQUE` constraint prevents duplicate skills per character
- `attribute_type` stores the governing attribute (e.g., "dexterity" for Acrobatics)

**Standard Skills**:
- Acrobatics (DEX), Animal Handling (WIS), Arcana (INT)
- Athletics (STR), Deception (CHA), History (INT)
- Insight (WIS), Intimidation (CHA), Investigation (INT)
- Medicine (WIS), Nature (INT), Perception (WIS)
- Performance (CHA), Persuasion (CHA), Religion (INT)
- Sleight of Hand (DEX), Stealth (DEX), Survival (WIS)

---

### 8. character_equipment

**Purpose**: Store character inventory items.

```sql
CREATE TABLE character_equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  weight DECIMAL(10,2),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features**:
- One-to-many relationship
- `weight` supports decimal values (e.g., 0.5 lbs)
- `quantity` tracks stackable items

---

### 9. character_features

**Purpose**: Store racial features, class abilities, and feats.

```sql
CREATE TABLE character_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  description TEXT,
  source TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features**:
- `source` indicates origin: "Class", "Race", "Feat", "Background"
- Supports unlimited features per character

---

### 10. character_spells

**Purpose**: Track known and prepared spells.

```sql
CREATE TABLE character_spells (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  spell_name TEXT NOT NULL,
  spell_level INTEGER NOT NULL CHECK (spell_level >= 0 AND spell_level <= 9),
  prepared BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features**:
- `spell_level` 0-9 (cantrips to 9th level spells)
- `prepared` tracks preparation status for classes that require it

---

### 11. character_attacks

**Purpose**: Store weapons and attack actions.

```sql
CREATE TABLE character_attacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  attack_name TEXT NOT NULL,
  attack_bonus INTEGER DEFAULT 0,
  damage_type TEXT,
  damage_dice TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features**:
- `damage_dice` stored as text (e.g., "1d8+3", "2d6")
- `damage_type`: slashing, piercing, bludgeoning, fire, etc.

---

### 12. character_saving_throws

**Purpose**: Store saving throw proficiencies for each attribute.

```sql
CREATE TABLE character_saving_throws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  attribute_type TEXT NOT NULL CHECK (attribute_type IN ('strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma')),
  proficient BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(character_id, attribute_type)
);
```

**Key Features**:
- One-to-many relationship (6 entries per character)
- `UNIQUE` constraint prevents duplicate saving throws
- `CHECK` constraint ensures valid attribute types

---

### 13. character_currency

**Purpose**: Track character wealth across all currency types.

```sql
CREATE TABLE character_currency (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID UNIQUE NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  copper INTEGER DEFAULT 0,
  silver INTEGER DEFAULT 0,
  electrum INTEGER DEFAULT 0,
  gold INTEGER DEFAULT 0,
  platinum INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features**:
- `UNIQUE` constraint on `character_id` enforces one-to-one relationship
- All five D&D currency denominations supported

---

### 14. character_details

**Purpose**: Store character appearance, backstory, and physical traits.

```sql
CREATE TABLE character_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID UNIQUE NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  age INTEGER DEFAULT 20,
  height TEXT,
  weight TEXT,
  eyes TEXT,
  skin TEXT,
  hair TEXT,
  appearance TEXT,
  backstory TEXT,
  allies_and_organizations TEXT,
  additional_features TEXT,
  treasure TEXT,
  symbol_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features**:
- `UNIQUE` constraint on `character_id` (one-to-one)
- Long text fields for narrative content (appearance, backstory)

---

### 15. character_personality

**Purpose**: Store personality traits, ideals, bonds, and flaws.

```sql
CREATE TABLE character_personality (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID UNIQUE NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  traits TEXT,
  ideals TEXT,
  bonds TEXT,
  flaws TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features**:
- `UNIQUE` constraint on `character_id` (one-to-one)
- Stores D&D personality framework elements

---

### 16. character_proficiencies

**Purpose**: Track armor, weapon, and tool proficiencies.

```sql
CREATE TABLE character_proficiencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  proficiency_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features**:
- One-to-many relationship
- Flexible storage for all proficiency types

---

### 17. character_languages

**Purpose**: Track known languages.

```sql
CREATE TABLE character_languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  language_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features**:
- One-to-many relationship
- Supports unlimited languages per character

---

## Relationships

### User ↔ Sessions (1:N)
- One user can create many sessions
- Sessions are deleted when user is deleted (`CASCADE`)

### User ↔ Characters (1:N)
- One user can own many characters
- Characters are deleted when user is deleted (`CASCADE`)

### Sessions ↔ Characters (N:M via session_characters)
- Sessions can have many characters
- Characters can be in many sessions
- Junction table manages the association

### Characters ↔ Character Data Tables (1:1 or 1:N)
- **1:1 relationships**: `character_attributes`, `character_combat`, `character_currency`, `character_details`, `character_personality`
- **1:N relationships**: `character_skills`, `character_equipment`, `character_features`, `character_spells`, `character_attacks`, `character_saving_throws`, `character_proficiencies`, `character_languages`

---

## Row-Level Security (RLS)

All tables implement RLS policies to ensure users can only access their own data.

### Example Policy (users table)

```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.jwt()->>'sub' = id);
```

### Example Policy (characters table)

```sql
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own characters" ON characters
  FOR ALL USING (auth.jwt()->>'sub' = user_id);
```

### Cascading Security

Tables like `character_skills` inherit security through foreign key relationships:

```sql
CREATE POLICY "Users can manage own character skills" ON character_skills
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM characters c
      WHERE c.id = character_id AND c.user_id = auth.jwt()->>'sub'
    )
  );
```

---

## Clerk Integration

### **Convex Implementation (Primary)**

Convex uses **JWT-based authentication** - no webhooks required.

#### **Setup Steps:**

1. **Configure Clerk JWT Template**
   - Clerk Dashboard → JWT Templates → Select "Convex"
   - **Critical**: Template MUST be named `convex` (do not rename)
   - Copy Issuer URL (e.g., `https://your-app.clerk.accounts.dev`)

2. **Create `convex/auth.config.ts`**
   ```typescript
   export default {
     providers: [
       {
         domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
         applicationID: "convex",
       },
     ],
   };
   ```

3. **Wrap App with Providers**
   ```typescript
   import { ClerkProvider, useAuth } from "@clerk/clerk-react";
   import { ConvexProviderWithClerk } from "convex/react-clerk";
   import { ConvexReactClient } from "convex/react";

   const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

   <ClerkProvider publishableKey="pk_...">
     <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
       <App />
     </ConvexProviderWithClerk>
   </ClerkProvider>
   ```

4. **Access User in Convex Functions**
   ```typescript
   import { query } from "./_generated/server";

   export const getMyCharacters = query({
     handler: async (ctx) => {
       const identity = await ctx.auth.getUserIdentity();
       if (!identity) throw new Error("Not authenticated");

       return await ctx.db
         .query("characters")
         .filter((q) => q.eq(q.field("clerkUserId"), identity.subject))
         .collect();
     },
   });
   ```

**Key Differences from PostgreSQL/Supabase:**
- ❌ **No user sync webhooks needed**
- ❌ **No separate users table required** (optional for metadata only)
- ✅ **JWT validation automatic** via Convex
- ✅ **User ID from `identity.subject`** (Clerk user ID)
- ✅ **Authorization in application layer** via Convex functions

---

### **PostgreSQL/Supabase Implementation (Alternative)**

⚠️ **Note**: This approach uses webhooks and is only needed if using PostgreSQL/Supabase instead of Convex.

<details>
<summary>Click to expand PostgreSQL webhook implementation</summary>

Clerk sends webhook events when users are created, updated, or deleted.

**Webhook Endpoint**: `/api/webhooks/clerk`

**Events Handled**:
1. `user.created` → Insert into `users` table
2. `user.updated` → Update `users` table
3. `user.deleted` → Delete from `users` table (cascades to all related data)

**Example Webhook Handler**:

```typescript
import { Webhook } from 'svix'
import { WebhookEvent } from '@clerk/nextjs/server'

export async function POST(req: Request) {
  const evt: WebhookEvent = await verifyWebhook(req)

  if (evt.type === 'user.created') {
    const { id, email_addresses, first_name, last_name, image_url } = evt.data

    await db.users.insert({
      id: id,
      clerk_user_id: id,
      email: email_addresses[0].email_address,
      first_name: first_name || '',
      last_name: last_name || '',
      image_url: image_url || '',
    })
  }

  return new Response('OK', { status: 200 })
}
```

### JWT Token Integration (PostgreSQL)

Database uses Clerk JWT tokens for RLS policies:

```sql
DEFAULT auth.jwt()->>'sub'
```

This extracts the user ID from the JWT token, automatically linking records to the authenticated user.

</details>

---

## Indexes & Performance

### Primary Indexes

All foreign keys are automatically indexed for join performance.

### Additional Indexes

```sql
-- Sessions
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_is_active ON sessions(is_active);

-- Characters
CREATE INDEX idx_characters_user_id ON characters(user_id);
CREATE INDEX idx_characters_session_id ON characters(session_id);

-- Character Data Tables
CREATE INDEX idx_character_attributes_character_id ON character_attributes(character_id);
CREATE INDEX idx_character_combat_character_id ON character_combat(character_id);
CREATE INDEX idx_character_skills_character_id ON character_skills(character_id);
CREATE INDEX idx_character_equipment_character_id ON character_equipment(character_id);
CREATE INDEX idx_character_features_character_id ON character_features(character_id);
CREATE INDEX idx_character_spells_character_id ON character_spells(character_id);
CREATE INDEX idx_character_spells_level ON character_spells(spell_level);
CREATE INDEX idx_character_attacks_character_id ON character_attacks(character_id);
CREATE INDEX idx_character_saving_throws_character_id ON character_saving_throws(character_id);
CREATE INDEX idx_character_currency_character_id ON character_currency(character_id);
CREATE INDEX idx_character_details_character_id ON character_details(character_id);
CREATE INDEX idx_character_personality_character_id ON character_personality(character_id);
CREATE INDEX idx_character_proficiencies_character_id ON character_proficiencies(character_id);
CREATE INDEX idx_character_languages_character_id ON character_languages(character_id);
```

### Query Optimization Tips

1. **Eager Loading**: Load related data in single queries using joins
2. **Pagination**: Use `LIMIT` and `OFFSET` for large result sets
3. **Selective Fetching**: Only query needed columns
4. **Connection Pooling**: Use connection pooling for API routes

---

## Migration Guide

### From localStorage to Database

**Step 1**: Export existing character data from localStorage

```typescript
import { loadCharacter } from '@/utils/storage'

const localCharacter = loadCharacter()
if (localCharacter) {
  console.log(JSON.stringify(localCharacter, null, 2))
}
```

**Step 2**: Transform data structure

```typescript
async function migrateCharacter(localCharacter: Character, userId: string) {
  // 1. Insert character
  const character = await db.characters.insert({
    user_id: userId,
    character_name: localCharacter.characterName,
    player_name: localCharacter.playerName,
    race: localCharacter.race,
    class: localCharacter.class,
    level: localCharacter.level,
    // ... other fields
  })

  // 2. Insert attributes
  await db.character_attributes.insert({
    character_id: character.id,
    strength: localCharacter.attributes.strength.score,
    dexterity: localCharacter.attributes.dexterity.score,
    // ... other attributes
  })

  // 3. Insert combat stats
  await db.character_combat.insert({
    character_id: character.id,
    armor_class: localCharacter.combat.armorClass,
    // ... other combat fields
  })

  // 4. Insert skills (iterate)
  for (const [skillName, skillData] of Object.entries(localCharacter.skills)) {
    await db.character_skills.insert({
      character_id: character.id,
      skill_name: skillName,
      proficient: skillData.proficient,
      expertise: skillData.expertise,
      attribute_type: skillData.attribute,
    })
  }

  // ... repeat for equipment, features, spells, attacks
}
```

**Step 3**: Clear localStorage after successful migration

```typescript
import { clearCharacter } from '@/utils/storage'

await migrateCharacter(localCharacter, currentUser.id)
clearCharacter()
```

---

## Future Enhancements

### Planned Features

1. **Character Templates**: Pre-configured character builds
2. **Shared Campaigns**: Multi-user session management with permissions
3. **Character History**: Version tracking and rollback capabilities
4. **File Uploads**: Character portraits and document attachments
5. **Real-time Sync**: WebSocket updates for collaborative sessions
6. **Advanced Search**: Full-text search across character data

### Schema Evolution

The schema is designed for extensibility:
- New character data tables can be added without affecting existing structure
- JSONB columns can be added for flexible, unstructured data
- Computed columns can be added for frequently calculated values

---

## Summary

This database design provides:

✅ **Security**: Clerk authentication + RLS policies
✅ **Scalability**: Normalized schema + strategic indexes
✅ **Flexibility**: Session management + character sharing
✅ **Data Integrity**: Foreign keys + check constraints
✅ **Audit Trail**: Automatic timestamps
✅ **Performance**: Optimized indexes + efficient queries
✅ **Complete Coverage**: All 17 character data tables covering 100% of D&D 5e character sheet

**Schema Statistics**:
- **Total Tables**: 17
  - Core: 4 (users, sessions, characters, session_characters)
  - Character Data: 13 (attributes, combat, skills, equipment, features, spells, attacks, saving throws, currency, details, personality, proficiencies, languages)
- **1:1 Relationships**: 5 (attributes, combat, currency, details, personality)
- **1:N Relationships**: 8 (skills, equipment, features, spells, attacks, saving throws, proficiencies, languages)
- **Indexes**: 20+ for optimal query performance

**Recommended Stack (Primary Implementation)**:
- **Database**: ⭐ **Convex** (Real-time TypeScript database with built-in auth integration)
- **Authentication**: Clerk (JWT-based, no webhooks needed)
- **Frontend**: React 19 + Vite
- **Hosting**: Vercel (frontend) + Convex (backend)
- **Benefits**: Real-time sync, TypeScript end-to-end, serverless functions, zero configuration

**Alternative Stack (PostgreSQL/Supabase)**:
- **Database**: Supabase (PostgreSQL with RLS and real-time)
- **ORM**: Drizzle ORM or Prisma
- **Authentication**: Clerk (webhook-based sync)
- **Hosting**: Vercel + Supabase
- **Use Case**: If you prefer SQL or have existing PostgreSQL infrastructure

**Implementation Guide**:
- **Convex Setup**: See `/docs/convex-clerk-implementation-plan.md` (Version 3.1 - Complete)
- **Tables**: 19 total (4 core + 13 character data + 2 optional)
- **Migration**: Full localStorage → Convex migration support included
- **Coverage**: 100% of localStorage Character fields
