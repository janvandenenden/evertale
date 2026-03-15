```markdown
# Evertale — Product Requirements Document (PRD)

Version: MVP  
Purpose: Validate demand for personalized children’s storybooks where a child becomes the hero of the story.

---

# 1. Product Vision

Evertale creates personalized storybooks where a **child becomes a character in the story**.

Unlike traditional personalized books that only customize name, skin tone, or hair, Evertale generates a **storybook character from a child’s photo**.

For every story:

1. A **new character sheet** is generated from the child’s photo.
2. The character is styled according to the **story world and clothing**.
3. The character is inserted into a **storybook preview scene**.
4. Parents can **reserve a printed book**.

The first available story is:

**Momotaro — The Peach Boy**

Future stories will generate **new character versions from the same child photo**, styled for those story worlds.

---

# 2. MVP Goals

Validate three hypotheses:

1. Parents will upload a photo of their child.
2. Parents emotionally respond to seeing their child inside a story.
3. Parents reserve a personalized book after seeing the preview.

---

# 3. Key Metrics

Tracked via **PostHog**.

| Metric                          | Target |
| ------------------------------- | ------ |
| Character creation rate         | >5%    |
| Character generation completion | >80%   |
| Reservation conversion          | >10%   |
| Founding edition uptake         | >20%   |

---

# 4. Core Product Flow
```

Landing page
↓
Create character
↓
Auth
↓
Upload photo
↓
Enter child info
↓
Generate character
↓
Character reveal
↓
Reserve book
↓
Checkout
↓
Confirmation
↓
Dashboard

```

Important rule:

**Each story generates a new character version from the child’s photo.**

The persistent asset is the **child profile and photo**, not a universal character.

---

# 5. Landing Page

The landing page sells **Evertale the platform**, not just the Momotaro book.

Key message:

A child can become the hero of a story.

### Hero

Headline:

**Your Child, the Hero of the Story**

Subheadline:

Turn a photo of your child into a beautifully illustrated storybook character.

Primary CTA:

**Create Your Child’s Character**

Secondary CTA:

**See How It Works**

Hero imagery options:

- Parent reading to child
- Photo → illustrated child transformation

---

### Example Child Experience

Interactive section where users can explore:

- example character sheet
- hero poster preview
- sample Momotaro scenes

Purpose: demonstrate product before signup.

---

### Reading Moment

Lifestyle imagery showing:

- parent reading to child
- grandparent reading to child

Reinforces emotional value.

---

### How It Works

Simple explanation:

1. Upload a photo of your child
2. We generate a storybook character
3. Your child appears in the story
4. We print and ship your hardcover book

---

### Product Offer

Two options:

**Personalized Book**

$39

Includes:

- personalized character
- hardcover book
- Momotaro story

---

**Founding Family Edition**

$49

Includes:

- personalized book
- printable character poster
- printable character sheet
- coloring pages
- Founding Family badge

Limited to **500 families**.

---

### Our First Story

Introduce:

**Momotaro — The Peach Boy**

Include:

- short story description
- preview spreads
- note that more stories will follow

---

# 6. Authentication

Use **Clerk**.

Options:

- Google
- email/password

Routes:

```

/login
/logout

```

Child information is **not collected during signup**.

---

# 7. Create Character Flow

Route:

```

/create

```

Form fields:

- child photo
- child name
- birth year

Limit:

- maximum **3 children per account**

Copy example:

> Your child will begin their first adventure in our first story: Momotaro.

---

# 8. Photo Validation

Before generation:

- detect **exactly one face**
- reject group photos
- reject blurry images

Error message:

> Please upload a photo that clearly shows one child's face.

Recommended step:

**photo cropping interface** before submission.

This improves generation quality.

---

# 9. Image Generation Pipeline

Use **Replicate**.

Two generation steps.

---

## Step 1 — Character Sheet

Output:

**One image containing multiple poses**

Prompt:

```

Create a children's book character sheet based on this child.

Keep recognizable facial features but stylize for a watercolor picture book.

Show:
front view
side view
three-quarter view
smiling
running
neutral pose

Simple clothing suitable for a folktale hero.

Clean white background.
Multiple poses and expressions.
Textured watercolor paper.

```

Notes:

- clothing varies by story
- Momotaro uses folktale clothing

---

## Step 2 — Hero Poster Preview

Input:

- character sheet
- pre-made scene with outline placeholder

Prompt:

```

Replace the placeholder outline character with the character from the reference character sheet.

Keep the exact pose, body proportions, and placement from the scene image.

Maintain the same environment, lighting, and composition.

The new character should match the style of the reference sheet while blending naturally into the watercolor storybook scene.

children's picture book illustration
watercolor and ink
soft pastel palette
storybook style

```

Scene composition includes:

- child hero
- old man
- old woman
- dog
- monkey
- pheasant
- ogres
- Momotaro environment

This image acts as the **main reveal poster**.

---

# 10. Generation State Handling

Generation may take **10–40 seconds**.

`character_versions.status` states:

```

pending
generating_character
generating_preview
completed
failed

```

UX flow:

```

upload photo
→ generation screen
→ reveal page

```

Loading message example:

> We're creating your child's story character.
> This usually takes about 20 seconds.

---

# 11. Generation Failure Handling

If generation fails:

1. automatically retry once
2. if second failure → mark as failed

Fields:

```

generation_count
last_error

```

User message:

> Something went wrong creating the character.
> Please try again.

---

# 12. Generation Limits

To control costs:

| Limit | Value |
|-----|-----|
| Children per account | 3 |
| Generations per child | 3 |

Cost assumptions:

- ~$0.07 per image
- ~2 images per generation

Total generation cost per account should remain low.

---

# 13. Character Reveal Page

Route:

```

/characters/[id]

```

Purpose:

Deliver the emotional payoff.

Display:

- hero preview poster
- child name
- story name
- reserve book CTA
- character sheet

Heading:

**Meet Your Child’s Story Character**

Optional feature:

Downloadable **character poster** for sharing.

---

# 14. Purchase Options

Users choose between two products.

### Personalized Book

Price: **$39**

Includes:

- personalized character
- hardcover printed book
- Momotaro story

---

### Founding Family Edition

Price: **$49**

Includes:

- book
- printable poster
- character sheet
- coloring pages
- Founding Family badge

Limit:

**500 families**

---

# 15. Checkout

Use **Stripe Checkout**.

Route:

```

/checkout

```

Collect:

- shipping address
- email
- product type
- character reference

Metadata stored:

```

user_id
child_id
character_version_id
story_id
product_type

```

Shipping message:

> Books are expected to ship after the Momotaro launch in May.

---

# 16. Confirmation Page

Route:

```

/order-confirmation

```

Display:

- character preview
- child name
- order type

Title:

**Your Child’s Story Is Reserved**

---

# 17. Dashboard

Route:

```

/dashboard

```

The dashboard centers around **children**.

Each child card shows:

- child name
- character generation status
- preview image
- order status

Actions:

- view character
- reserve book
- create new character

---

# 18. Data Model

```

users
└ children
└ child_photos
└ character_versions
└ orders

```

Principles:

- user = parent account
- child = child profile
- character version = story-specific output

---

# 19. Database Tables

Use **Supabase**.

---

### users

```

id
clerk_user_id
email
created_at
updated_at

```

---

### children

```

id
user_id
name
birth_year
created_at
updated_at

```

Constraint:

max **3 children per user**

---

### child_photos

```

id
child_id
image_url
storage_key
created_at

```

---

### stories

```

id
slug
title
status
created_at

```

Example:

```

momotaro
Momotaro — The Peach Boy

```

---

### character_versions

```

id
child_id
story_id
source_photo_id
status
character_sheet_url
preview_image_url
generation_count
last_error
created_at
updated_at

```

---

### orders

```

id
user_id
child_id
character_version_id
story_id
stripe_session_id
product_type
price_cents
currency
status
shipping_name
shipping_line1
shipping_line2
shipping_city
shipping_postal_code
shipping_country
created_at
updated_at

```

---

# 20. Storage

Use **Cloudflare R2**.

Bucket structure:

```

uploads/
characters/
previews/
assets/

```

Meaning:

- uploads → original photos
- characters → character sheets
- previews → hero poster previews
- assets → static story images

---

# 21. Replicate Integration

API route:

```

/api/generate-character

```

Pipeline:

1. upload photo to S3
2. generate character sheet
3. generate hero poster preview
4. upload outputs to S3
5. store metadata in Supabase
6. return character_version_id

Generation occurs server-side.

---

# 22. Analytics

Use **PostHog**.

Events:

```

hero_cta_click
signup_completed
photo_uploaded
character_generation_started
character_generation_completed
character_viewed
reserve_book_clicked
checkout_completed

```

Funnel:

```

Landing page
→ create character click
→ signup
→ photo upload
→ character generation
→ reveal
→ reserve
→ checkout

```

---

# 23. Tech Stack

Frontend:

- Next.js (App Router)
- ShadCN components

Backend:

- Supabase (database)
- Cloudflare R2 (image storage)

Auth:

- Clerk

Payments:

- Stripe

Image generation:

- Replicate

Analytics:

- PostHog

---

# 24. Privacy Principles

Parents upload photos of children.

Rules:

- photos stored securely
- photos used only for character generation
- photos not used for model training

Users must be able to:

- delete a child profile
- delete uploaded photos
- delete generated characters

---

# 25. Launch Checklist

Before launch confirm:

- landing page live
- Clerk auth working
- create flow implemented
- generation pipeline working
- S3 storage configured
- Supabase schema deployed
- Stripe checkout configured
- founding edition limit enforced
- generation limits enforced
- PostHog tracking active
- dashboard working

---

# 26. MVP Principle

The most important moment is the **character reveal**.

If parents feel:

> "That actually looks like my child"

then purchase conversion becomes much easier.

The MVP optimizes for:

- strong reveal
- simple purchase
- emotional impact

Not for:

- many stories
- complex customization
- advanced dashboards

---

# 27. MVP Summary

The Evertale MVP allows a parent to:

1. Sign in
2. Upload a child photo
3. Generate a Momotaro character sheet
4. See their child inside the story world
5. Reserve a personalized hardcover book

The MVP focuses on:

**Momotaro + character reveal + reservation conversion**

Future stories can later reuse the same child photo while generating new story-specific characters.
```
