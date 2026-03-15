# Evertale MVP Implementation Plan

## Context

Evertale is a personalized children's storybook platform. Parents upload a photo of their child, a storybook character is generated via AI (Replicate), and they can reserve a printed hardcover book. The MVP focuses on one story — Momotaro — and optimizes for the emotional "character reveal" moment to drive purchase conversion.

The codebase is a fresh Next.js 16 scaffold with Tailwind v4, shadcn/ui (radix-nova), and TypeScript. Supabase JS client and PostHog are installed but not configured. No pages, API routes, auth, or database schema exist yet.

---

## Phase 1: Foundation (Database, Auth, Analytics, Environment)

**Goal:** All infrastructure so every subsequent phase has auth, database, and analytics.

**Install:**
- `@clerk/nextjs` — auth
- `zod` — validation
- `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` — R2 storage (S3-compatible)

**Create:**

| File | Purpose |
|------|---------|
| `src/lib/supabase/server.ts` | Server-side Supabase client (service role key) |
| `src/lib/supabase/browser.ts` | Browser-side Supabase client (anon key) |
| `src/lib/types.ts` | `ActionResult<T>` type, shared DB types |
| `src/lib/schemas.ts` | Zod schemas for children, photos, orders |
| `src/lib/env.ts` | Runtime env var validation |
| `src/middleware.ts` | Clerk middleware protecting /create, /dashboard, /checkout, /characters |
| `src/app/(auth)/login/[[...login]]/page.tsx` | Clerk sign-in |
| `src/app/(auth)/logout/[[...logout]]/page.tsx` | Clerk sign-out |
| `src/components/providers/posthog-provider.tsx` | Client-side PostHog init |
| `supabase/migrations/001_initial_schema.sql` | All 6 tables: users, children, child_photos, stories, character_versions, orders |
| `.env.example` | Template for all required env vars |

**Modify:**
- `src/app/layout.tsx` — wrap with ClerkProvider + PostHogProvider

**DB notes:**
- UUID primary keys, `created_at`/`updated_at` timestamps
- `character_versions.status` enum: pending, generating_character, generating_preview, completed, failed
- Seed row for Momotaro story

**Verify:** `npm run build` passes, `/login` renders Clerk UI, PostHog initializes in browser, Supabase client connects.

---

## Phase 2: Landing Page

**Goal:** Complete landing page per PRD. Mostly static — can be built in parallel with Phase 1.

**Add shadcn components:** `card`, `dialog`

**Create:**

| File | Purpose |
|------|---------|
| `src/components/layout/site-header.tsx` | Nav with sign-in/create CTA |
| `src/components/layout/site-footer.tsx` | Footer |
| `src/components/sections/hero.tsx` | Headline, subheadline, 2 CTAs |
| `src/components/sections/example-experience.tsx` | Example character sheet/poster preview |
| `src/components/sections/reading-moment.tsx` | Lifestyle imagery |
| `src/components/sections/how-it-works.tsx` | 4-step process |
| `src/components/sections/product-offer.tsx` | Two pricing cards ($39 / $49) |
| `src/components/sections/first-story.tsx` | Momotaro introduction |

**Modify:** `src/app/page.tsx` — compose all sections

**PostHog:** Track `hero_cta_click` on primary CTA.

**Verify:** All sections render, primary CTA links to `/create`, responsive on mobile/tablet/desktop.

---

## Phase 3: Storage and Photo Upload

**Goal:** R2 storage + photo upload capability. Required before image generation.

**Install:** `react-dropzone`

**Create:**

| File | Purpose |
|------|---------|
| `src/lib/storage/r2.ts` | R2 client config + helpers (upload, getUrl, delete) |
| `src/lib/storage/presigned.ts` | Presigned URL generation |
| `src/app/api/upload/route.ts` | Upload API route |
| `src/components/create/photo-upload.tsx` | Drag-and-drop upload with preview |
| `src/lib/validators/photo.ts` | File type, size, dimension validation |

**R2 bucket structure:** `uploads/`, `characters/`, `previews/`, `assets/`

**Verify:** Upload image via UI, image appears in R2, presigned URLs work, `child_photos` record created in Supabase.

---

## Phase 4: Create Character Flow + Replicate Pipeline

**Goal:** The core user journey: enter child info, upload photo, trigger generation, see loading screen.

**Install:** `replicate`
**Add shadcn components:** `progress`, `skeleton`, `sonner`

**Create:**

| File | Purpose |
|------|---------|
| `src/app/create/page.tsx` | Server component shell |
| `src/app/create/actions.ts` | Server actions: createChild, triggerGeneration |
| `src/components/create/create-flow.tsx` | Multi-step form orchestrator (client) |
| `src/components/create/child-info-form.tsx` | Name + birth year step |
| `src/components/create/generation-screen.tsx` | Loading screen with status polling |
| `src/lib/replicate/client.ts` | Replicate client init |
| `src/lib/replicate/generate-character.ts` | Character sheet generation (step 1) |
| `src/lib/replicate/generate-preview.ts` | Hero poster generation (step 2) |
| `src/lib/prompts/character-sheet.ts` | Character sheet prompt template |
| `src/lib/prompts/hero-poster.ts` | Hero poster prompt template |
| `src/app/api/generate-character/route.ts` | Full pipeline orchestration |
| `src/app/api/generation-status/[id]/route.ts` | Status polling endpoint |
| `src/hooks/use-generation-status.ts` | Client polling hook |

**Generation pipeline (server-side):**
1. Upload child photo to R2, get public URL
2. Create `character_versions` record (status: `pending`)
3. Set status `generating_character` → call Replicate with character sheet prompt + photo URL
4. Poll Replicate until succeeded/failed
5. Download character sheet → upload to R2 → update DB (Replicate auto-deletes after 1hr!)
6. Set status `generating_preview` → call Replicate with hero poster prompt + character sheet + scene
7. Poll → download → upload to R2 → update DB
8. Set status `completed` (or on failure: retry once if `generation_count < 2`, else mark `failed`)

**Replicate API pattern:**
```ts
const prediction = await replicate.predictions.create({
  model: 'google/nano-banana-2',
  input: { prompt, image: photoUrl }
});
// Poll: replicate.predictions.get(prediction.id) until status === 'succeeded'
// Save output immediately to R2
```

**Business rules:** Max 3 children/account, max 3 generations/child, auto-retry once on failure.

**Verify:** Form enforces limits, generation runs end-to-end, images saved to R2, status polling updates UI, redirect to reveal on completion.

---

## Phase 5: Character Reveal Page

**Goal:** The most important product moment. Emotionally impactful display of the generated character.

**Create:**

| File | Purpose |
|------|---------|
| `src/app/characters/[id]/page.tsx` | Server component: fetch + render reveal |
| `src/components/character/character-reveal.tsx` | Hero poster with reveal animation |
| `src/components/character/character-sheet-display.tsx` | Character sheet grid |
| `src/components/character/reserve-cta.tsx` | CTA card with both pricing options |
| `src/app/characters/[id]/actions.ts` | Download poster action |

**Design:**
- Hero poster is the dominant visual (large, centered, subtle fade-in animation)
- Character sheet displayed below as secondary
- Two CTAs: "$39 Personalized Book" / "$49 Founding Family Edition"
- Auth-protected: users can only see their own characters
- Failed state shows error + "Try Again" button

**PostHog:** `character_viewed` on load, `reserve_book_clicked` on CTA click.

**Verify:** Poster displays prominently, CTAs link to `/checkout` with correct params, auth protection works, failed state handled.

---

## Phase 6: Checkout and Orders (Stripe)

**Goal:** Close the conversion loop with Stripe Checkout.

**Install:** `stripe`

**Create:**

| File | Purpose |
|------|---------|
| `src/lib/stripe/client.ts` | Stripe client init |
| `src/lib/stripe/products.ts` | Product definitions ($39 book, $49 founding edition) |
| `src/app/checkout/page.tsx` | Pre-checkout order summary |
| `src/app/checkout/actions.ts` | createCheckoutSession server action |
| `src/app/api/webhooks/stripe/route.ts` | Webhook handler (signature verified) |
| `src/app/order-confirmation/page.tsx` | Post-purchase confirmation |
| `src/lib/stripe/founding-edition.ts` | Atomic counter for 500 limit |

**Stripe flow:**
- Checkout session metadata: user_id, child_id, character_version_id, story_id, product_type
- Shipping address collection enabled
- Webhook: `checkout.session.completed` → create order record
- Founding Family Edition: atomic check-and-increment to prevent overselling

**PostHog:** `checkout_completed` after successful payment.

**Verify:** CTA creates Stripe session, payment completes, webhook creates order, confirmation page renders, founding edition counter works.

---

## Phase 7: Dashboard and Polish

**Goal:** User dashboard + launch readiness.

**Add shadcn components:** `alert-dialog`, `dropdown-menu`, `avatar`

**Create:**

| File | Purpose |
|------|---------|
| `src/app/dashboard/page.tsx` | User's children + statuses |
| `src/app/dashboard/actions.ts` | deleteChild, deletePhoto, deleteCharacter |
| `src/components/dashboard/child-card.tsx` | Card with preview, status, actions |
| `src/components/dashboard/empty-state.tsx` | No children yet |
| `src/components/layout/user-menu.tsx` | Clerk UserButton in header |
| `src/app/error.tsx` | Global error boundary |
| `src/app/not-found.tsx` | 404 page |

**Privacy:** Delete actions cascade (R2 files + Supabase records).

**Polish:** Loading skeletons on all pages, SEO metadata, mobile responsiveness audit.

**Verify:** Full end-to-end flow: landing -> signup -> create -> upload -> generate -> reveal -> checkout -> confirm -> dashboard. All PostHog funnel events fire.

---

## Dependency Graph

```
Phase 1 (Foundation) ----> Phase 3 (Storage) ----> Phase 4 (Create + Replicate) ----> Phase 5 (Reveal) ----> Phase 6 (Checkout) ----> Phase 7 (Dashboard)
         \                                   /
          --> Phase 2 (Landing) ------------
```

Phases 1 & 2 can run in parallel. All others are sequential.

---

## Risk Mitigations

| Risk | Mitigation |
|------|-----------|
| Replicate output auto-deletes after 1hr | Download and save to R2 immediately within the pipeline |
| Generation takes 10-40s | Robust polling UI with clear messaging, auto-retry on failure |
| Founding Edition overselling | Atomic DB counter (Supabase RPC with transaction) |
| Child photo privacy | Presigned URLs with expiry, never publicly accessible, delete functionality from day one |
