# Evertale Development Log

## 2026-03-15 — Multi-phase character sheets

- Intent: support multiple character sheets per story (baby, child phases), story-driven config, R2 layout by story
- Pipeline: `run-character-pipeline.ts` now loads story config, generates sheets per phase (with outline), cover from coverPhase sheet, story scenes (skipped when templateUrl empty)
- New: `character_sheets`, `character_version_scenes` tables; `character_sheet_url` and `preview_image_url` dropped from `character_versions`
- New: `src/lib/replicate/generate-scene.ts` for scene/cover generation (character sheet + template)
- New: `src/lib/prompts/scene.ts` for story scene prompts
- Storage: `buildStoryStorageKey(storySlug, type, userId, fileName)` for `{storySlug}/characters|previews|assets/{userId}/...`
- API: generation-status returns `character_sheets` and `scenes`; getDownloadUrl uses cover from `character_version_scenes`
- Dashboard: cover from `character_version_scenes` where `scene_id = 'cover'`
- Character page: `CharacterPreviewPanel` accepts `characterSheets` and `scenes`, supports toggling sheets/cover/story scenes/original
- Order confirmation: cover from `character_version_scenes` instead of `preview_image_url`
- Delete actions: derive R2 keys from `character_sheets` and `character_version_scenes` image_url

## 2026-03-14 — Stripe product/price IDs for checkout

- Intent: wire checkout to the two hardcoded Stripe products (Personalized Book, Founding Family Edition)
- Added `STRIPE_PRICE_ID_PERSONALIZED_BOOK` and `STRIPE_PRICE_ID_FOUNDING_FAMILY_EDITION` to env schema and `.env.example`
- Added `getStripePriceId(productKey)` in `src/lib/stripe/products.ts` to resolve price IDs from env
- Updated `createCheckoutSession` in `src/app/checkout/actions.ts` to use `price: priceId` instead of inline `price_data`
- Checkout now creates sessions against the configured Stripe prices; product name/description/amount come from Stripe, not code

## 2026-03-13 — Full MVP Implementation (Phases 1-7)

### Phase 1: Foundation
- Installed: @clerk/nextjs, zod, @aws-sdk/client-s3, @aws-sdk/s3-request-presigner
- Created: env validation (src/lib/env.ts), ActionResult types (src/lib/types.ts), Zod schemas (src/lib/schemas.ts)
- Created: Supabase server/browser clients (src/lib/supabase/)
- Created: Clerk middleware protecting /create, /dashboard, /checkout, /characters, /order-confirmation
- Created: Clerk login/logout pages at (auth)/login and (auth)/logout
- Created: PostHog provider (src/components/providers/posthog-provider.tsx)
- Created: SQL migration with all 6 tables + founding_edition_counter + RPC (supabase/migrations/001_initial_schema.sql)
- Modified: layout.tsx with ClerkProvider, PostHogProvider, Toaster, Fraunces display font
- Created: .env.example

### Phase 2: Landing Page
- Added shadcn: card, dialog
- Created warm color palette (terracotta primary, warm cream background) in globals.css
- Added Fraunces serif display font for headlines
- Created: site-header (sticky, Clerk auth, mobile menu), site-footer
- Created sections: hero, example-experience, reading-moment, how-it-works, product-offer, first-story
- PostHog: hero_cta_click tracked on primary CTA
- All sections composed in page.tsx

### Phase 3: Storage & Photo Upload
- Installed: react-dropzone
- Created: R2 client helpers (src/lib/storage/r2.ts), presigned URL generation (src/lib/storage/presigned.ts)
- Created: /api/upload route with auth + ownership checks
- Created: photo-upload component (drag-and-drop with preview)
- Created: photo validators (type, size)

### Phase 4: Create Character Flow + Replicate Pipeline
- Installed: replicate
- Added shadcn: progress, skeleton, sonner
- Created: Replicate client, prompt templates (character-sheet, hero-poster)
- Created: /api/generate-character route (full pipeline: upload -> generate character sheet -> generate preview -> save to R2)
- Pipeline includes: auto-retry (max 2 attempts), immediate R2 save (Replicate deletes after 1hr)
- Created: /api/generation-status/[id] polling endpoint
- Created: useGenerationStatus hook (3s polling interval)
- Created: create flow UI (multi-step: child info -> photo upload -> generation screen)
- Business rules: max 3 children/account, max 3 generations/child

### Phase 5: Character Reveal Page
- Created: /characters/[id] server page with auth protection
- Created: character-reveal (fade-in animation, PostHog character_viewed)
- Created: character-sheet-display
- Created: reserve-cta (two pricing cards, PostHog reserve_book_clicked)
- Created: download poster server action

### Phase 6: Checkout & Orders (Stripe)
- Installed: stripe
- Created: Stripe client, product definitions ($39/$49)
- Created: founding edition atomic counter (Supabase RPC)
- Created: /checkout page with Suspense boundary
- Created: createCheckoutSession server action (Stripe Checkout with shipping)
- Created: /api/webhooks/stripe route (signature verified, creates order record)
- Created: /order-confirmation page

### Phase 7: Dashboard & Polish
- Added shadcn: alert-dialog, dropdown-menu, avatar
- Created: /dashboard page (children grid with character status)
- Created: child-card (preview, status badge, view/create/delete actions)
- Created: empty-state component
- Created: deleteChild, deleteCharacter server actions (cascade R2 + DB)
- Created: global error boundary (src/app/error.tsx)
- Created: 404 page (src/app/not-found.tsx)

### Build Status: PASSING
All routes compile and build successfully.

### Notes
- Clerk v6 does not export SignedIn/SignedOut components; using useAuth() hook instead
- Stripe SDK v20 expects apiVersion "2026-02-25.clover"
- Stripe webhook uses unknown cast for shipping_details (type mismatch in SDK)
- Next.js 16 deprecates middleware in favor of proxy (warning only, still works)

### Next Steps
- Configure environment variables (.env.local from .env.example)
- Run Supabase migration
- Set up Stripe products and webhook endpoint
- Add real imagery/illustrations to replace placeholders
- Add test coverage per CLAUDE.md testing strategy

## 2026-03-13 — Hero image update

- Intent: replace the hero placeholder artwork with `public/hero-example.png`
- Goal: keep the headline and CTAs readable with responsive image positioning and stronger mobile fade/overlay treatment
- Follow-up: replaced the full-width center split with a right-aligned image panel and softer desktop fade after browser review showed the child was being cut off
- Follow-up: removed the mobile content card and centered hero copy/CTAs over the image with stronger page-level overlays
- Follow-up: switched the site to a single sans font, enforced square corners globally, softened the hero overlays, and rebuilt the example section as a child-photo selector with a story-scene carousel
- Follow-up: expanded the example selector design to handle at least eight children with a horizontally scrollable cast row instead of a centered fixed-width layout
- Follow-up: added an explicit neutral Clerk appearance theme in `ClerkProvider` to remove the warm/orange default accents from auth UI and user menus
- Follow-up: removed the explicit Clerk appearance override and returned auth UI to Clerk defaults at the user's request

## 2026-03-13 — Supabase key migration

- Updated the app to prefer Supabase's modern key model: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` for client access and `SUPABASE_SECRET_KEY` for server access
- Kept legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY` as temporary fallbacks in code to make the transition non-breaking
- Updated `.env.example` and `CLAUDE.md` to document the modern Supabase environment variables

## 2026-03-13 — Replicate character-sheet input fix

- Fixed the Nano Banana 2 request payload to send the child photo under `image_input` instead of `image`
- Root cause: Replicate accepted the request but ignored the child photo, which produced the warning about `match_input_image` with no input images provided
- Updated the character-sheet prompt to match the prompt text from `~/Desktop/momotaro/prompts.md`

## 2026-03-13 — Replicate preview cover reference

- Wired preview generation to send two `image_input` URLs to Nano Banana 2: the generated character sheet and the uploaded cover image at `https://pub-ff52a9b8fb2f4031be59d54e6d7b632f.r2.dev/cover-example.jpeg`
- Updated the hero-poster prompt to treat the cover as the composition reference and replace `[NAME]` with the child's real name before rendering
- Set preview generation to request `resolution: "1K"` with `aspect_ratio: "5:4"` because the uploaded cover (`1152x928`) is much closer to 5:4 than 4:3
- Clarified the character-sheet generation payload to pass `resolution` and `aspect_ratio` as explicit object keys so the requested `5:4` shape is unambiguous in code

## 2026-03-13 — Character and checkout split layout

- Refactored `characters/[id]` into a two-column layout on desktop with package selection on the left and a toggleable art preview panel on the right
- Defaulted the character-page offer stack to highlight the Founding Family package while keeping both pricing options above the fold on larger screens
- Refactored `/checkout` to reuse the same split-page structure, showing the selected package card on the left and the character sheet / cover toggle on the right
- Kept the mobile flow stacked with package selection first so pricing and the primary CTA stay visible without scrolling past the artwork
- Normalized product metadata so optional fields like `badge_label` exist on both package variants, which fixes the `ProductCard` union-type error in TypeScript

## 2026-03-13 — Reserve CTA hierarchy update

- Reworked `src/components/character/reserve-cta.tsx` to show the Founding Family Edition as the single in-view primary offer instead of two stacked cards
- Rewrote the headline and supporting copy to emphasize the keepsake bundle rather than asking users to choose a print version
- Demoted the standard hardcover option to a smaller secondary button labeled `Only reserve the book`
- Moved reserve click tracking onto the `Link` elements inside each CTA to keep the button composition simpler

## 2026-03-13 — Full-width character and checkout layouts

- Refactored `src/app/characters/[id]/page.tsx` and `src/app/checkout/page.tsx` into full-width split layouts with a bordered, padded left rail and a flush right media pane
- Updated `src/components/character/character-preview-panel.tsx` to remove the title and helper copy, and place the sheet/cover selector directly over the artwork
- Made the preview panel fill the full right column height on desktop so the image area reads as a dedicated visual pane rather than an inset card

## 2026-03-13 — Dashboard and character page updates

- Dashboard: matched max-width to landing page (max-w-6xl), removed duplicate "New Character" from child cards
- Character page: removed redirect to checkout so users land on character page after generation
- Character page: added view original photo, upload new, and reroll controls to preview panel (icon buttons with titles)
- Generation flow: redirects to character page (not checkout) when complete
- Created /api/reroll-character to regenerate with same photo, extracted pipeline to lib/replicate/run-character-pipeline.ts

## 2026-03-13 — Founding Family checkout shortcut

- Updated `src/components/character/reserve-cta.tsx` so the default Founding Family CTA now creates the Stripe checkout session directly from the character page instead of routing through `/checkout`
- Kept the book-only path as the lighter alternate route into the checkout page
- Moved the image toggle in `src/components/character/character-preview-panel.tsx` from the top-left to the top-right

## 2026-03-13 — Unified reserve flow

- Updated `src/components/character/reserve-cta.tsx` so both package choices now create the Stripe checkout session directly from the character page
- Replaced the shared loading boolean with a product-specific pending state so only the selected CTA shows the redirecting state
- Removed the mixed `/checkout` vs `/characters` entry behavior from the reserve step to keep the purchase flow consistent

## 2026-03-13 — Checkout as the canonical post-generation step

- Changed `src/components/create/generation-screen.tsx` to send completed generations straight to `/checkout` with the Founding Family package preselected
- Updated `src/app/checkout/page.tsx` to include the richer package-selection block from the character detail experience above the payment CTA
- Reverted `src/components/character/reserve-cta.tsx` from direct Stripe redirects back to package-selection links into `/checkout`
- Removed the `Change package` back-link from `src/components/checkout/checkout-form.tsx` and updated Stripe `cancel_url` in `src/app/checkout/actions.ts` to return to the same checkout selection state
- Redirected completed `src/app/characters/[id]/page.tsx` requests into the default checkout route so the purchase flow has a single canonical URL
