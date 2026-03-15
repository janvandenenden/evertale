# Evertale — Claude Development Guide

## Project

Evertale is a platform where parents create **personalized children's storybooks**.

Parents upload a **photo of their child**. The system generates:

1. A **storybook character sheet**
2. A **storybook preview poster**
3. Option to **reserve a printed hardcover book**

The MVP story is:

**Momotaro — The Peach Boy**

Future stories will reuse the **child photo** but generate **new story-specific characters**.

The most important product moment is the **character reveal**.

---

# Tech Stack

Frontend

- Next.js (App Router)
- Tailwind
- shadcn/ui

Backend

- Supabase (Postgres)

Storage

- Cloudflare R2

Auth

- Clerk

Payments

- Stripe

AI Generation

- Replicate

Analytics

- PostHog

---

## Critical Rules

### 1. Code Organization

- Many small files over few large files
- High cohesion, low coupling
- 200-400 lines typical, 800 lines absolute max per file
- Organize by feature/domain, not by type
- Colocate server actions with their route (`actions.ts` next to `page.tsx`)
- Keep prompt templates in `src/lib/prompts/` -- one file per domain

### 2. UI Components

- **Always use shadcn/ui components** before building custom ones
- Check `src/components/ui/` for existing components before creating new ones
- If shadcn has a component for it, use it (Button, Card, Input, Select, Dialog, Tabs, Badge, Skeleton, Progress, Toast, etc.)
- Compose shadcn primitives for complex UI -- do not reinvent dropdowns, modals, or form controls
- Style with Tailwind utility classes, avoid custom CSS unless absolutely necessary

### 3. Code Style

- No emojis in code, comments, or documentation
- Immutability always -- never mutate objects or arrays
- No `console.log` in production code (use structured logging or remove before commit)
- Use `"use client"` directive only when the component genuinely needs client interactivity
- Prefer Server Components by default

### 4. TypeScript

- Strict null checks enabled
- Avoid `any` -- use `unknown` and narrow with type guards when dealing with external data
- `as` casts are acceptable for third-party library boundaries but should not be used to silence type errors in our own code
- Infer types from Drizzle schema using `typeof table.$inferSelect` and `typeof table.$inferInsert`
- Validate external input (API requests, form data, webhooks) with Zod

### 5. Error Handling

All server actions and API helpers return a result object:

```typescript
type ActionResult<T> =
  | {
      success: true;
      data: T;
    }
  | {
      success: false;
      error: string;
    };
```

Never throw from server actions. Catch internally and return `{ success: false, error: "..." }`. On the client, check `result.success` and show toast on failure.

### 6. Security

- No hardcoded secrets -- all sensitive values in environment variables
- Validate all user inputs with Zod before processing
- Parameterized queries only (Drizzle handles this)
- Verify Stripe webhook signatures
- Verify Clerk session before any authenticated operation
- Never expose internal error details to the client

## Bug Fixing Protocol

**Mandatory: test-first bug fixes.** When you encounter a bug:

1. **Write a failing test first** that reproduces the bug
2. **Run the test** -- confirm it fails for the expected reason
3. **Fix the bug** in the source code
4. **Run the test again** -- the bug is only considered fixed when the test passes
5. Commit the test and the fix together

This creates a strong feedback loop and prevents regressions. No exceptions.

## Testing

### Frameworks

- **Vitest** -- unit tests, component tests, screenshot/visual debugging
- **Playwright** -- E2E tests for critical user flows

### Strategy

- Unit tests for: utilities, prompt builders, Zod schemas, data transformations
- Component tests (Vitest + React Testing Library) for: admin forms, creation flow steps
- E2E tests (Playwright) for: full book creation flow, Stripe checkout, admin workflows
- Use Vitest's browser mode or screenshot capabilities for visual UI debugging
- 80% minimum coverage target for `src/lib/` and `src/db/`

### Test file conventions

- Unit/component tests: `*.test.ts(x)` colocated with source or in `__tests__/`
- E2E tests: `e2e/*.spec.ts`
- Test utilities: `src/test/` directory

## Environment Variables

```
# AI Services
REPLICATE_API_TOKEN=

# Storage (Cloudflare R2)
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_PUBLIC_URL=

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=
SUPABASE_SECRET_KEY=
# Payments (Stripe)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

```

## Available Commands

```bash
npm run dev                # Start Next.js dev server
npm run test               # Run Vitest
npm run test:e2e           # Run Playwright
```

## Git Workflow

- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- Never commit to main directly
- PRs require review
- All tests must pass before merge
- Commit test + fix together for bug fixes

## Implementation Plan

See `implementation-plan.md` at the project root for the full phased build plan (7 phases from foundation to polish). Always check the current phase before starting work.

## Replicate Model IDs

see https://replicate.com/google/nano-banana-2/api/learn-more
google/nano-banana-2

## Action Log Discipline

**Before starting any task, read the latest `DEV_LOG.md` entry.** It is the single source of truth for current status, open problems, and decisions. Do not begin work until you've checked it.

**All actions, decisions, and problems must be logged in `DEV_LOG.md`** at the project root.

- Before starting work on a phase or task, add a dated entry stub describing intent
- Log what was done, what files were created/modified, and any problems encountered
- If a problem was solved, log the root cause and the fix
- If a problem is unresolved, mark it clearly so it can be picked up later
- Keep entries concise but specific -- future you (or another developer) should be able to understand what happened and why

**Per-phase planning guardrail:** Before starting any phase, check for a dedicated plan file (e.g., `PHASE_1_PLAN.md`). If it’s missing, pause, prompt the user to generate one (plan mode), and commit that plan before implementation work begins.

**Note:** Replicate’s `run()` may not return final image URLs immediately. Prefer creating a prediction and polling (or handling webhooks) so async generation completes before persisting results.
