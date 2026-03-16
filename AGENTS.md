## Learned User Preferences
- For visual or UX changes, validate the result in the browser instead of relying only on code review.
- Do not use serif fonts anywhere on the website.
- Keep Clerk on its default styling unless a custom auth theme is explicitly requested.
- Prefer `rounded-none` treatments, but avoid broad global style overrides when they break intentional component shapes such as circular avatars.
- On stacked/mid-size layouts, center content instead of right-aligning to avoid awkward empty space.
- Prefer clean, elegant code; avoid backward compatibility when it adds unnecessary complexity (e.g. delete data and migrate to a clean schema).
- Do not change components in the UI folder; they should stay reusable. Pass layout overrides via className props in the consuming component instead.

## Learned Workspace Facts
- `public/hero-example.png` is a reusable visual asset for landing-page and example-section mockups.
- `public/bedtime-story.jpeg` is used for the reading-moment section; image should be full-height of the section and span the full left side.
- This repo now prefers Supabase's modern env vars: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` for client access and `SUPABASE_SECRET_KEY` for server access, with legacy keys only as transition fallbacks.
- R2 storage: use stable keys for character sheet/preview retries so overwrites instead of duplicates.
- Character sheets are per story; a story may need multiple protagonist sheets for different life stages or scene phases, all derived from the uploaded photo.
- Character creation generates only character sheets and cover; story scenes are generated manually (admin) or after reservation.
- Scene template URLs for Replicate must be public (e.g. R2 momotaro/scenes/); localhost is not reachable.
- Site header and footer appear on all pages except checkout.
- Character page is for managing the character (upload new photo, reroll, continue to reserve); package selection happens on checkout, which is the canonical post-generation route.
- Checkout preview panel uses a static image (e.g. hero-example), not the character sheet/cover toggle.
- Founding Family Edition card copy: use "Everything in Personalized Storybook, plus..." to avoid repeating items.
- Stripe product and price IDs in env are not secrets; safe to document in .env.example.
