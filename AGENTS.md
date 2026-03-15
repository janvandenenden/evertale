## Learned User Preferences
- For visual or UX changes, validate the result in the browser instead of relying only on code review.
- Do not use serif fonts anywhere on the website.
- Keep Clerk on its default styling unless a custom auth theme is explicitly requested.
- Prefer not to use broad global style overrides when they break component-specific shapes such as circular avatars.
- On stacked/mid-size layouts, center content instead of right-aligning to avoid awkward empty space.
- Prefer clean, elegant code; avoid backward compatibility when it adds unnecessary complexity (e.g. delete data and migrate to a clean schema).

## Learned Workspace Facts
- `public/hero-example.png` is a reusable visual asset for landing-page and example-section mockups.
- `public/bedtime-story.jpeg` is used for the reading-moment section; image should be full-height on the left side.
- This repo now prefers Supabase's modern env vars: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` for client access and `SUPABASE_SECRET_KEY` for server access, with legacy keys only as transition fallbacks.
- Dashboard content width should match the landing page (e.g. max-w-6xl).
- R2 storage: use stable keys for character sheet/preview retries so overwrites instead of duplicates.
- Site header and footer appear on all pages except checkout.
- Character page: manage character (upload new photo, reroll, continue to reserve); package selection happens on checkout page.
- Checkout preview panel uses a static image (e.g. hero-example), not the character sheet/cover toggle.
- Founding Family Edition card copy: use "Everything in Personalized Storybook, plus..." to avoid repeating items.
- Stripe product and price IDs in env are not secrets; safe to document in .env.example.
