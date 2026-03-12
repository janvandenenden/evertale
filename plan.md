# Evertale Landing Page — Implementation Plan

## Context
Build the Evertale pre-launch landing page from scratch based on the PRD. The goal is demand validation — collecting price-qualified waitlist signups. The page has 12 sections in a trust-then-convert flow. The stack is Next.js 16 (App Router), TailwindCSS v4, ShadCN. Only the `Button` component and base scaffolding exist.

---

## A. Design System

### Colors — `src/app/globals.css`

All colors live as CSS custom properties in `:root` inside `globals.css`. To change the brand palette, update only these values — every component updates automatically.

The starter palette is **warm storybook** (cream background, terracotta primary, deep brown text). Values use OKLch to match the existing format.

```css
/* ─── BRAND PALETTE — update these to retheme the entire site ─── */
:root {
  /* Page backgrounds */
  --background:         oklch(0.98 0.012 80);   /* warm cream */
  --card:               oklch(0.99 0.008 80);   /* slightly lighter card */

  /* Text */
  --foreground:         oklch(0.18 0.025 60);   /* deep warm brown */
  --card-foreground:    oklch(0.18 0.025 60);
  --muted-foreground:   oklch(0.52 0.02 60);    /* softer brown for captions */

  /* Primary — CTA buttons, links, accents */
  --primary:            oklch(0.54 0.13 35);    /* terracotta */
  --primary-foreground: oklch(0.98 0 0);        /* white */

  /* Secondary — subtle backgrounds, outlines */
  --secondary:          oklch(0.94 0.02 80);    /* warm off-white */
  --secondary-foreground: oklch(0.18 0.025 60);

  /* Muted — section backgrounds, dividers */
  --muted:              oklch(0.95 0.015 80);   /* very light warm gray */

  /* Accent — badges, highlights */
  --accent:             oklch(0.88 0.07 80);    /* warm amber */
  --accent-foreground:  oklch(0.18 0.025 60);

  /* Structural */
  --border:             oklch(0.88 0.02 80);
  --input:              oklch(0.88 0.02 80);
  --ring:               oklch(0.54 0.13 35);    /* matches primary */
  --radius:             0.625rem;
}
```

**To retheme:** Change the 3 key values — `--background`, `--primary`, `--foreground`. Everything else derives from them.

**Section background alternation** (keeps page scannable without new variables):
- Odd sections: `bg-background` (warm cream)
- Even sections: `bg-muted` (slightly warmer off-white)
- Quality Proof section: `bg-foreground` (near-black, full contrast)
- Gift Positioning section: `bg-accent` (warm amber tint)

---

### Typography — `src/app/layout.tsx`

Two Google Fonts, easy to swap by changing the import:

```ts
// Headings — serif, editorial feel
import { Playfair_Display, Inter } from "next/font/google"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",    // use as: font-[family-name:--font-heading]
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",       // replaces Geist Sans
})
```

Add to `@theme inline` in `globals.css`:
```css
--font-heading: var(--font-heading);
```

Usage in components:
- All `h1`, `h2`, `h3` → `font-[family-name:--font-heading]`
- All body text → `font-sans` (Inter, already the default)

---

### Layout Principles

- **Max content width:** `max-w-6xl mx-auto px-6` (consistent across all sections)
- **Section padding:** `py-20 md:py-28`
- **Section alternation:** cream / off-white / cream (see above)
- **Border radius:** use `rounded-xl` for image containers, `rounded-lg` for cards
- **No decorative illustrations or icons added** — the AI-generated images carry all visual weight

---

## B. Section Copy & UI Layout

---

### Section 1 — Navbar

**Layout:** `sticky top-0 z-50`, `bg-background/95 backdrop-blur`. Two rows on mobile collapse to single row on desktop.
```
[Evertale]          How It Works · Stories · FAQ        [Join Early Access — $39 at Launch →]
```
- "Evertale" — wordmark in `font-[family-name:--font-heading]`, `text-xl font-bold`
- Nav links — hidden on mobile (`hidden md:flex`), visible on `md+`
- CTA button — `<Button size="sm">` always visible

---

### Section 2 — Hero

**Layout:** Two columns on `md+`, stacked on mobile. Visual right, copy left.

**Copy:**
```
H1: Your Child,
    the Hero of Every Story

Subheadline:
We generate a watercolor storybook character from your child's photo.
Beautifully illustrated. Printed in hardcover. Kept forever.

[See Your Child in a Story]   [Join Early Access — $39 at Launch]
```

**Visual (right column):**
- Split panel: child photo (left half) | illustrated character in scene (right half)
- Thin dividing line or `→` glyph between the two halves
- Caption below: `"Real photo → storybook character"` in `text-sm text-muted-foreground`
- Rounded container `rounded-2xl overflow-hidden`

---

### Section 3 — Before/After

**Layout:** Section title centred, then a responsive grid of 3–4 examples.

**Copy:**
```
Eyebrow: "The Personalization"
H2: This Is What It Actually Looks Like

Subtext:
Each character is generated from the child's real photo — not a preset avatar.
These are examples from our beta.
```

**Each example card:**
- `grid grid-cols-2 gap-0 rounded-xl overflow-hidden` — left: photo, right: character
- Below card: `"Emma, age 5"` in `text-sm text-muted-foreground text-center`

---

### Section 4 — Quality Proof

**Layout:** Dark background (`bg-foreground`), full-bleed. Images dominate. Minimal text.

**Copy:**
```
Single line (white text, centred):
"Every page, illustrated for your child."

Below images, small caption:
"From our first story — Momotaro: The Peach Boy"
```

**Images:** 3 story spreads in a staggered grid (2-column on desktop, 1-column on mobile).

---

### Section 5 — How It Works

**Layout:** Horizontal stepper on `md+`, vertical list on mobile. Light background (`bg-muted`).

**Copy:**
```
H2: How It Works

01  Upload a photo
    Share a clear, recent photo of your child's face.

02  We create your character
    Our AI generates a watercolor illustration that looks like them — not a preset.

03  Your child becomes the hero
    They star in Momotaro — The Peach Boy, a beloved Japanese tale about
    courage, friendship, and finding your place in the world.

04  Printed and shipped to your door
    A beautiful hardcover book, sent to you. Books ship after launch —
    early access members are first.
```

---

### Section 6 — Social Proof

**Layout:** Centred. Large counter number + 2–3 quote cards in a grid.

**Copy:**
```
[1,240+]
families on the early access list

"I cried when I saw my daughter in the illustration.
It actually looked like her."
— Priya, mum of a 3-year-old

"The perfect birthday gift. Nothing else like it."
— Tom, dad of twins, age 6

"My son carried the preview around the house all day."
— Clara, mum of a 5-year-old
```

---

### Section 7 — Gift Positioning

**Layout:** Two columns on desktop — copy left, occasions right. Warm amber background (`bg-accent`).

**Copy:**
```
H2: The Gift They'll Keep for 20 Years

Body:
Most gifts are forgotten by February.
A storybook where your child is the hero is different — it gets read at bedtime
for years, then kept on a shelf for decades.

Right column heading: "Perfect for"
Badges: Birthdays · Holidays · New Baby · Grandparents Gifting
```

---

### Section 8 — Pricing & Early Access (Primary CTA)

**Layout:** Centred, constrained width. Pricing block above form.

**Copy:**
```
H2: Reserve Your Copy
Subhead: Founding Member Pricing

Pricing block:
~~$39~~  →  $29
"Founding member price.
Books are $39 at launch — early access members lock in $29."

Form:
[your@email.com            ]
[Child's age (optional) ▾  ]
[    Join Early Access      ]

Below button (muted):
"No payment now. We'll email you when books are ready to order."

Success state:
"You're on the list. We'll email you when Evertale is ready."
```

---

### Section 9 — Privacy & Safety

**Layout:** Two columns on desktop. Copy left, commitments list right.

**Copy:**
```
H2: Your Child's Photo Is Yours. Always.

Left col body:
We know sharing a photo of your child takes trust.
Here's exactly what we do — and don't do — with it.

Right col (each with ✓ CheckCircle2 icon in green):
✓  Photos are used only to generate your book character.
✓  Photos are deleted from our servers within 30 days of book creation.
✓  We never use your child's photo to train AI models.
✓  We never share photos with third parties.
✓  Your data is encrypted in transit and at rest.

Link below list: "Read our full Privacy Policy →"
```

---

### Section 10 — Story Preview

**Layout:** Dark-tinted or muted background. Story info left, spread images right on desktop.

**Copy:**
```
Eyebrow: "Our First Adventure"
H2: Momotaro — The Peach Boy

Body:
Every Evertale begins with a classic — stories told for generations,
now with your child at the centre.

Momotaro is a beloved Japanese folktale about an unlikely hero who finds
courage, makes unexpected friends, and discovers his place in the world.
A perfect bedtime story for ages 3–8.

Badges: Courage · Friendship · Helping Others · Ages 3–8

Below spreads:
"More stories are coming. Join early access to help choose what we make next."
[Join Early Access →]
```

---

### Section 11 — FAQ

**Layout:** Constrained width (`max-w-2xl`), centred. ShadCN Accordion.

**Copy (6 items):**
```
Q: How much will the book cost?
A: Books will be $39 at launch. Founding members who join early access today
   lock in a price of $29.

Q: How does the personalization work?
A: You upload a photo of your child. Our AI creates a watercolor illustration
   that captures their likeness — face, features, colouring. That character
   becomes the hero of your chosen story.

Q: Is my child's photo stored?
A: Photos are only used to generate your book character and are deleted from
   our servers within 30 days of creation. We never use them to train AI models
   or share them with anyone. See our Privacy section for full details.

Q: What age is the book for?
A: Momotaro — The Peach Boy is written for ages 3–8 and reads beautifully aloud.

Q: When will the book be available?
A: We're in the final stages of production. Early access members will be
   the first to know — and the first to order.

Q: What if I don't like how my child's character looks?
A: We'll make it right. If the character doesn't capture your child's likeness
   to your satisfaction, we'll regenerate it before printing. Your happiness
   with the result matters more than a quick turnaround.
```

---

### Section 12 — Footer

**Layout:** Simple two-row. Separator above.

```
Evertale          About · FAQ · Contact · Privacy Policy

© 2026 Evertale
```

---

## C. Implementation Plan

---

## 1. Install Dependencies

```bash
npm install @supabase/supabase-js posthog-js
npx shadcn@latest add input accordion badge separator
```

---

## 2. Create `.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

## 3. Supabase Table

```sql
create table waitlist (
  id           uuid primary key default gen_random_uuid(),
  email        text not null unique,
  child_age    smallint,
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  utm_content  text,
  created_at   timestamptz not null default now()
);
alter table waitlist enable row level security;
```

---

## 4. File Structure

### Modify
- `src/app/layout.tsx` — update metadata, wrap children in `<PostHogProvider>`
- `src/app/page.tsx` — replace boilerplate with section orchestrator (~30 lines)

### Create
```
src/
├── app/api/waitlist/route.ts          POST handler
├── lib/
│   ├── supabase.ts                    server-only Supabase admin client
│   └── posthog.ts                     PostHog init + provider ("use client")
├── hooks/
│   └── use-waitlist-form.ts           form state + submission + PostHog events
└── components/sections/
    ├── navbar.tsx                     ("use client" for scroll shadow)
    ├── hero.tsx                       ("use client" for CTA PostHog event)
    ├── before-after.tsx               ("use client" for IntersectionObserver)
    ├── quality-proof.tsx              (server)
    ├── how-it-works.tsx               (server)
    ├── social-proof.tsx               (server)
    ├── gift-positioning.tsx           (server)
    ├── pricing.tsx                    ("use client" — form + PostHog)
    ├── privacy.tsx                    (server + thin client wrapper for event)
    ├── story-preview.tsx              (server)
    ├── faq.tsx                        (server — uses ShadCN Accordion)
    └── footer.tsx                     (server)
```

---

## 5. Key Implementations

### `src/lib/supabase.ts`
Server-only client using `SUPABASE_SERVICE_ROLE_KEY` (never sent to browser).

### `src/lib/posthog.ts`
Client component. Init PostHog once on `window` mount. Export `posthog` instance and `PostHogProvider` wrapper.

### `src/app/api/waitlist/route.ts`
- Validate email (required) and child_age (optional, 1–12)
- Upsert to Supabase with `ignoreDuplicates: true` (idempotent — no error on re-submit)
- Send confirmation email via Resend using `fetch` directly (no SDK needed)
- Resend failure is **non-fatal** — signup persists, error logged only

### `src/hooks/use-waitlist-form.ts`
- Manages `email`, `childAge`, `status` (`idle/loading/success/error`) state
- Reads UTM params from `window.location.search` on mount
- Posts to `/api/waitlist`, fires PostHog events on success

### Placeholder images
Use `https://placehold.co/{w}x{h}` URLs. User has real AI-generated images to swap in during build. Each `<Image>` tagged with `{/* TODO: replace with real image */}` and a descriptive `alt` text so the correct image is obvious. All images use fixed `width`/`height` props to avoid CLS when swapped.

---

## 6. Section Specs (12 sections)

| # | Component | Key content |
|---|---|---|
| 1 | `navbar` | Sticky, wordmark, 3 anchor links, CTA "Join Early Access — $39 at Launch" |
| 2 | `hero` | H1 "Your Child, the Hero of Every Story", split photo→character visual, 2 CTAs |
| 3 | `before-after` | "This Is What the Personalization Actually Looks Like", 3–4 side-by-side examples |
| 4 | `quality-proof` | Full-bleed Momotaro spreads, single copy line "Every page, illustrated for your child." |
| 5 | `how-it-works` | 4 numbered steps, step 4 includes shipping timeline expectation |
| 6 | `social-proof` | Waitlist counter "1,240+ families", 2–3 beta quotes |
| 7 | `gift-positioning` | "The Gift They'll Keep for 20 Years", occasion Badges |
| 8 | `pricing` | $39 crossed out → $29 founding, email + optional child age form, "No payment now" |
| 9 | `privacy` | 5 specific commitments with CheckCircle2 icons |
| 10 | `story-preview` | Momotaro intro, themes as Badges, 2 spread previews |
| 11 | `faq` | 6 questions in ShadCN Accordion |
| 12 | `footer` | Links + copyright |

---

## 7. PostHog Events

| Event | Trigger |
|---|---|
| `navbar_cta_click` | Navbar CTA click |
| `hero_cta_click` | Hero primary CTA click |
| `demo_interaction` | Before/after section enters viewport |
| `pricing_section_view` | Pricing section enters viewport |
| `privacy_section_view` | Privacy section enters viewport |
| `waitlist_signup` | Successful form submit |
| `signup_with_age` | Successful submit with child_age provided |

---

## 8. Implementation Order

1. Install deps + ShadCN components
2. `.env.local` + Supabase table
3. `lib/supabase.ts`, `lib/posthog.ts`, update `layout.tsx`
4. `api/waitlist/route.ts` (test with curl)
5. `hooks/use-waitlist-form.ts`
6. `page.tsx` orchestrator (stubs)
7. Sections in order: Navbar → Hero → Pricing (end-to-end flow) → remaining
8. PostHog events added per section as built
9. Mobile responsiveness + accessibility pass

---

## 9. Verification

1. `npm run dev` — page loads without errors
2. Submit form with a real email → row appears in Supabase `waitlist` table with UTM fields populated
3. Confirmation email received via Resend
4. PostHog dashboard shows `waitlist_signup` event with correct properties
5. `npm run build` passes with no TypeScript or lint errors
6. Mobile: test at 375px — navbar collapses correctly, form is usable, images don't overflow
