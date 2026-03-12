# Evertale Landing Page — Implementation Plan (v2)

## Context
Build the Evertale pre-launch landing page. Goal: demand validation via price-qualified waitlist signups ($39). 12 sections in a trust-then-convert flow. Stack: Next.js 16 (App Router), TailwindCSS v4, ShadCN.

---

## A. Design System

### Design Philosophy

**Clean, modern, playful.** Think Apple simplicity meets children's bookshop warmth. Generous negative space lets the imagery and copy breathe. No visual clutter. The AI-generated illustrations carry the emotional weight — the UI stays out of the way.

---

### Colors — `src/app/globals.css`

**Clean white canvas, bold coral primary, near-black text.** No cream. No amber. Crisp and confident.

```css
:root {
  /* Page backgrounds */
  --background:         oklch(1 0 0);            /* pure white */
  --card:               oklch(0.99 0.003 260);   /* barely-there cool tint */

  /* Text */
  --foreground:         oklch(0.13 0.02 260);    /* near-black, cool undertone */
  --card-foreground:    oklch(0.13 0.02 260);
  --muted-foreground:   oklch(0.45 0.015 260);   /* mid gray for captions */

  /* Primary — CTA buttons, links, accents */
  --primary:            oklch(0.63 0.19 25);     /* warm coral — playful, bold */
  --primary-foreground: oklch(1 0 0);            /* white */

  /* Secondary — ghost buttons, outlines */
  --secondary:          oklch(0.97 0.003 260);   /* very light gray */
  --secondary-foreground: oklch(0.13 0.02 260);

  /* Muted — alternating section backgrounds */
  --muted:              oklch(0.97 0.003 260);   /* light cool gray */

  /* Accent — badges, highlights, soft backgrounds */
  --accent:             oklch(0.95 0.04 260);    /* soft lavender tint */
  --accent-foreground:  oklch(0.13 0.02 260);

  /* Structural */
  --border:             oklch(0.91 0.005 260);
  --input:              oklch(0.91 0.005 260);
  --ring:               oklch(0.63 0.19 25);     /* matches primary */
  --radius:             0.625rem;
}
```

**Section background rhythm:**
- Most sections: `bg-background` (white) — let negative space do the work
- Alternating accent sections: `bg-muted` (barely-there gray) — just enough contrast to signal a new block
- Quality Proof: `bg-foreground text-background` (dark, full inversion — images pop)
- Gift Positioning: `bg-accent` (soft lavender tint — feels special without shouting)

---

### Typography — `src/app/layout.tsx`

A serif heading font gives warmth and editorial weight. Sans body stays clean and modern.

```ts
import { DM_Serif_Display, Inter } from "next/font/google"

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-heading",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})
```

Usage:
- `h1`, `h2`, `h3` → `font-[family-name:--font-heading]` — serif, editorial
- Body, buttons, UI → `font-sans` (Inter) — clean, legible

---

### Layout & Spacing Principles

Generous negative space is the single biggest quality signal. When in doubt, add more space.

- **Max content width:** `max-w-5xl mx-auto px-6` (tighter than 6xl — feels more curated)
- **Section padding:** `py-24 md:py-32 lg:py-40` (very generous — each section breathes)
- **Between elements:** `gap-6` minimum inside sections, `gap-8` to `gap-12` between content blocks
- **Images:** `rounded-2xl` containers, subtle `shadow-sm` or `shadow-md`
- **Cards:** `rounded-xl`, no heavy borders — use subtle shadow or bg tint

### CTA Buttons

All CTAs are **large and confident**. No small buttons for primary actions.

- Primary CTA: `<Button size="lg" className="h-14 px-8 text-base rounded-full">` — tall, pill-shaped, impossible to miss
- Secondary CTA: Same size, `variant="outline"` with `rounded-full`
- Navbar CTA: `<Button size="default" className="rounded-full">` — slightly smaller but still prominent

---

## B. Section Copy & UI Layout

**Content rule:** The page is about **Evertale** — a platform for personalized storybooks. Momotaro is only mentioned once, in the Story Preview section (Section 10), as "our first story." Every other section talks about "your child's storybook" generically. This keeps the brand scalable and the message clear.

**How personalization works (internal context — informs copy, not shown verbatim):**
From a single photo, we generate a **character sheet** — a set of illustrated poses, expressions, and angles of the child as a watercolor character. Multiple sheets can be created for different outfits or scenes throughout the story. These sheets are then used to populate every page of the book template. The result: a consistent, recognizable character across the entire story, not a one-off image.

---

### Section 1 — Navbar

**Layout:** `sticky top-0 z-50`, `bg-background/90 backdrop-blur-md`, border-b when scrolled.

```
[Evertale]          How It Works · Stories · FAQ        [Get Started — $39]
```

- "Evertale" — `font-[family-name:--font-heading] text-xl`
- Nav links — `hidden md:flex`, `text-sm text-muted-foreground`
- CTA: `rounded-full` button, always visible, "Get Started — $39"

---

### Section 2 — Hero

**Layout:** Full-width. Large hero image dominates. Copy sits above or overlaid on the image with enough contrast.

**Structure (mobile-first, stacked):**
1. Copy block (centred on mobile, left-aligned on desktop)
2. Full-width hero image below copy

**Copy:**
```
H1: Your Child,
    the Hero of Every Story

Subheadline:
We turn a photo of your child into a storybook character —
illustrated across every page, printed in hardcover, and kept forever.

[Get Started — $39]          [See How It Works]
```

**Hero image:**
- Large, warm photograph: a parent reading a beautifully illustrated storybook to their child. The book is visible, the child is engaged, the moment is intimate.
- Full-width on mobile, right-column or full-bleed on desktop
- `rounded-2xl` container, subtle shadow
- This image is emotional, not explanatory — it sells the *experience* of the product, not the mechanics.

---

### Section 3 — Before/After

**Layout:** Centred title, then a grid of 3 examples. White background.

**Copy:**
```
Eyebrow: "See the Difference"
H2: From Photo to Storybook Character

Subtext:
Upload a photo. We build a full character — expressions, poses, outfits —
that looks like your child on every single page.
```

**Each card:**
- Left: child's photo. Right: a strip of 2–3 character sheet poses (different angles/expressions/outfits) showing the range.
- `rounded-xl overflow-hidden`
- Caption: `"Liam, age 4"` — `text-sm text-muted-foreground`
- Grid: `grid-cols-1 md:grid-cols-3 gap-8`

---

### Section 4 — Quality Proof

**Layout:** Dark background (`bg-foreground text-background`), full-bleed. Maximum image, minimum text.

**Copy:**
```
Centred, white text:
"Every page, illustrated for your child."

Below images, small caption:
"Pages from a real Evertale storybook"
```

**Images:** 3 story spreads in a relaxed grid. `rounded-xl` with subtle white/10 border. Generous padding around them.

---

### Section 5 — How It Works

**Layout:** Centred heading, then 4 steps in a horizontal row on `md+`, vertical stack on mobile. `bg-muted`.

**Copy:**
```
H2: How It Works

01  Upload a Photo
    A clear, recent photo of your child's face. That's all we need.

02  We Build Your Character
    From your photo we create a full character sheet — poses, expressions,
    and outfits — so your child looks like themselves on every page.

03  They Star in the Story
    Your child's character is placed into every scene of a beautifully
    written adventure. Consistent, recognizable, theirs.

04  A Real Book, Delivered
    Printed hardcover, shipped to your door.
    Early access members are the first to receive theirs.
```

Each step: large number in `text-primary font-[family-name:--font-heading] text-4xl`, title bold, description in `text-muted-foreground`.

---

### Section 6 — Social Proof

**Layout:** Centred. Large number + subtitle, then quote cards below. White background. Lots of vertical space.

**Copy:**
```
"1,240+"
families on the waitlist

---

"I cried when I saw my daughter in the illustration.
It actually looked like her."
— Priya, mum of a 3-year-old

"The perfect birthday gift. Nothing else like it."
— Tom, dad of twins, age 6

"My son carried the preview around the house all day."
— Clara, mum of a 5-year-old
```

Number: `text-6xl md:text-7xl font-[family-name:--font-heading]`
Quotes: in cards with `bg-muted rounded-xl p-8`, `grid-cols-1 md:grid-cols-3 gap-6`

---

### Section 7 — Gift Positioning

**Layout:** Two columns on desktop. `bg-accent` (soft lavender). Generous padding.

**Copy:**
```
H2: The Gift They'll Keep for 20 Years

Body:
Most kids' gifts are forgotten by February.
A storybook where your child is the hero is different —
read at bedtime for years, kept on a shelf for decades.

Right column:
"Perfect for"
Badges: Birthdays · Holidays · New Baby · Grandparents
```

Badges: `<Badge variant="secondary">` with `rounded-full px-4 py-1.5 text-sm`

---

### Section 8 — Pricing & Early Access (Primary CTA)

**Layout:** Centred, constrained to `max-w-lg`. Clean, focused. White background. Tons of space above and below.

**Copy:**
```
H2: Get Your Child's Storybook

Price:
$39
"Hardcover, illustrated, shipped."

Form:
[your@email.com                    ]
[Child's age (optional)          ▾ ]

[         Join the Waitlist         ]   ← full-width, large, rounded-full, primary

Below button (muted, small):
"No payment now. We'll email you when your book is ready to order."

Success state:
"You're on the list — we'll be in touch soon."
```

The price is just **$39**. No crossed-out numbers, no "founding member" complexity. Clean and confident.

---

### Section 9 — Privacy & Safety

**Layout:** Two columns on desktop. `bg-muted`. Copy left, commitments right.

**Copy:**
```
H2: Your Child's Photo Is Safe With Us

Left:
We know sharing a photo of your child takes trust.
Here's exactly what we do — and what we never will.

Right (each with CheckCircle2 icon in primary color):
✓  Photos are used only to create your child's book character.
✓  Photos are deleted within 30 days of book creation.
✓  We never use photos to train AI models.
✓  We never share photos with third parties.
✓  All data is encrypted in transit and at rest.

"Read our Privacy Policy →"
```

---

### Section 10 — Story Preview

**Layout:** `bg-muted`. Copy left, story spread images right on desktop.

This is the **only section** that names a specific story. Everything else is about Evertale.

**Copy:**
```
Eyebrow: "Our First Story"
H2: Momotaro — The Peach Boy

Body:
A beloved Japanese folktale about an unlikely hero who finds
courage, makes unexpected friends, and discovers where he belongs.
Reimagined with your child at the centre. Perfect for ages 3–8.

Badges: Courage · Friendship · Kindness · Ages 3–8

Below spreads:
"More stories are on the way."
[Join the Waitlist →]
```

---

### Section 11 — FAQ

**Layout:** `max-w-2xl mx-auto`, centred. ShadCN Accordion. White background.

**Copy (6 items):**
```
Q: How much does a book cost?
A: $39 for a printed hardcover, illustrated and shipped.

Q: How does the personalization work?
A: You upload a photo of your child. We generate a full character sheet —
   multiple poses, expressions, and outfits — so your child looks like
   themselves on every page of the story.

Q: Is my child's photo stored?
A: Photos are only used to create the book character and are deleted
   within 30 days. We never use them for AI training or share them.

Q: What age is the book for?
A: Our first story is written for ages 3–8 and reads beautifully aloud.

Q: When will books be ready?
A: We're in the final stages. Waitlist members will be the first to know
   and the first to order.

Q: What if the character doesn't look right?
A: We'll regenerate it until you're happy. Your satisfaction matters more
   than a quick turnaround.
```

---

### Section 12 — Footer

**Layout:** `border-t`, simple. Generous top padding.

```
Evertale          About · FAQ · Contact · Privacy Policy

© 2026 Evertale
```

---

## C. Implementation Details

---

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js posthog-js
npx shadcn@latest add input accordion badge separator
```

---

### 2. Create `.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
RESEND_API_KEY=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

---

### 3. Supabase Table

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

### 4. File Structure

**Modify:**
- `src/app/layout.tsx` — fonts, metadata, PostHogProvider
- `src/app/globals.css` — brand palette
- `src/app/page.tsx` — section orchestrator

**Create:**
```
src/
├── app/api/waitlist/route.ts
├── lib/
│   ├── supabase.ts
│   └── posthog.ts
├── hooks/
│   └── use-waitlist-form.ts
└── components/sections/
    ├── navbar.tsx
    ├── hero.tsx
    ├── before-after.tsx
    ├── quality-proof.tsx
    ├── how-it-works.tsx
    ├── social-proof.tsx
    ├── gift-positioning.tsx
    ├── pricing.tsx
    ├── privacy.tsx
    ├── story-preview.tsx
    ├── faq.tsx
    └── footer.tsx
```

---

### 5. Key Implementations

**`src/lib/supabase.ts`** — Server-only client via `SUPABASE_SERVICE_ROLE_KEY`.

**`src/lib/posthog.ts`** — `"use client"`. Init on window mount. Export `PostHogProvider`.

**`src/app/api/waitlist/route.ts`**
- Validate email (required), child_age (optional, 1–12)
- Upsert to Supabase (`ignoreDuplicates: true`)
- Send confirmation via Resend `fetch` (non-fatal on failure)

**`src/hooks/use-waitlist-form.ts`**
- State: `email`, `childAge`, `status` (idle/loading/success/error)
- Reads UTM params on mount
- Posts to `/api/waitlist`, fires PostHog events

**Placeholder images** — `https://placehold.co/{w}x{h}` with `{/* TODO: replace */}` comments and descriptive `alt` text. Fixed `width`/`height` to prevent CLS.

---

### 6. PostHog Events

| Event | Trigger |
|---|---|
| `navbar_cta_click` | Navbar CTA |
| `hero_cta_click` | Hero primary CTA |
| `demo_interaction` | Before/after enters viewport |
| `pricing_section_view` | Pricing enters viewport |
| `privacy_section_view` | Privacy enters viewport |
| `waitlist_signup` | Successful form submit |
| `signup_with_age` | Submit with child_age |

---

### 7. Implementation Order

1. Install deps + ShadCN components
2. `.env.local`
3. `globals.css` palette + `layout.tsx` fonts
4. `lib/supabase.ts`, `lib/posthog.ts`
5. `api/waitlist/route.ts`
6. `hooks/use-waitlist-form.ts`
7. `page.tsx` orchestrator
8. Sections: Navbar → Hero → Pricing (end-to-end flow) → remaining in order
9. PostHog events wired per section
10. Responsive + accessibility pass

---

### 8. Verification

1. `npm run dev` — loads without errors
2. Form submit → row in Supabase `waitlist` table
3. Confirmation email via Resend
4. PostHog events fire correctly
5. `npm run build` — no TS/lint errors
6. Mobile 375px — navbar collapses, form usable, images contained
