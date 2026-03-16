# Text Page Placement & Preview — Implementation Plan

## Context

Evertale needs an admin tool to define where story text appears on hand-crafted page backgrounds. Text-page images are manually uploaded to R2. This editor lets an admin visually place a draggable/resizable text box, preview rendered text with auto-fitting, tweak typography, and copy the resulting template config into a checked-in TS file. These templates will later be used to render final book pages.

---

## Files to Create

### 1. Types & Data

**`src/lib/text-pages/types.ts`** (~50 lines)
- `TextBox` (xPct, yPct, wPct, hPct — all 0-1 fractions)
- `FontConfig` (family, minSize, maxSize, lineHeight, color)
- `TextAlign`, `TextVAlign`
- `TextPageTemplate` (templateId, imageKey, textBox, align, valign, font, maxLines)
- `TextPageEntry` (pageId, text)

**`src/lib/story-assets/momotaro/text-pages.ts`** (~200 lines)
- `momotaroTextPages: TextPageEntry[]` — 27 entries extracted from `stories/momotaro/prompts.md` JSON block
- Each entry has `page` (number), `title`, and `text` (with `{{name}}` placeholder for child name)

**`src/lib/story-assets/momotaro/text-page-templates.ts`** (~20 lines, grows as templates are added)
- `momotaroTextPageTemplates: TextPageTemplate[]` — starts empty, populated via editor output

### 2. Text Fitting

**`src/lib/text-pages/fit-text.ts`** (~100 lines)
- `fitText(text, boxWidthPx, boxHeightPx, font, maxLines, measureWidth)` — binary search between minSize/maxSize to find largest font that fits within maxLines and box height
- `measureWidth` is a callback (canvas-based in browser, mockable in tests)
- `wrapText(text, maxWidth, fontSize, fontFamily, measureWidth)` — greedy word-wrap, returns lines array

### 3. R2 Image Listing

**`src/lib/storage/list-r2.ts`** (~35 lines)
- `listR2Objects(prefix: string)` — uses `ListObjectsV2Command` to list images under a prefix, returns `{ key, url }[]`
- Reuses R2 client from `r2.ts` (export `getR2Client`, `getBucketName`, `getPublicUrl`)

### 4. Admin Page & Actions

**`src/app/(main)/admin/text-pages/page.tsx`** (~35 lines)
- Server component, Clerk auth check (same pattern as `admin/story-scenes/page.tsx`)
- Loads Nunito font via `next/font/google`
- Fetches image list and existing templates, passes to client component

**`src/app/(main)/admin/text-pages/actions.ts`** (~60 lines)
- `listTextPageImages(storySlug)` — calls `listR2Objects` with prefix `{storySlug}/text-pages/`
- `loadExistingTemplates()` — returns current templates from the TS module

### 5. UI Components

**`src/app/(main)/admin/text-pages/text-page-editor-client.tsx`** (~350 lines)
- Main `"use client"` editor component
- Two-column layout: left = image preview with text box overlay, right = controls
- State: selectedImage, textBox, font, align, valign, maxLines, previewText, fittedSize
- Runs `fitText` on every config change for live preview
- Uses `onLoad` from `<img>` to get natural dimensions for font size reference

**`src/components/text-pages/text-box-overlay.tsx`** (~200 lines)
- Draggable + resizable box using raw pointer events (`setPointerCapture`)
- 8 resize handles (corners + edges)
- All coords stored as 0-1 percentages, clamped to valid range
- Renders preview text inside the box with fitted font size
- Visual: dashed border, corner handles, subtle tinted background

**`src/components/text-pages/typography-controls.tsx`** (~120 lines)
- shadcn Inputs for: minSize, maxSize, lineHeight, maxLines, color
- Selects for: align, valign, font family
- Controlled props, parent manages state

**`src/components/text-pages/template-output.tsx`** (~70 lines)
- Displays generated `TextPageTemplate` as formatted TypeScript
- "Copy to Clipboard" button with sonner toast confirmation

**`src/components/text-pages/image-picker.tsx`** (~90 lines)
- Grid of R2 image thumbnails
- Badge on images that already have templates
- Click to select for editing

---

## Files to Modify

**`src/lib/storage/r2.ts`** — Export `getR2Client`, `getBucketName`, `getPublicUrl` (currently private). Add `export` keyword to three existing functions.

**`src/app/globals.css`** — Add `--font-nunito` CSS variable to `@theme inline` block.

---

## Key Design Decisions

1. **CSS overlay rendering** (not canvas) — simpler, no new deps, sufficient for preview/config
2. **Raw pointer events** for drag/resize — no library dependency, full control
3. **Copy-to-clipboard for saving** — admin copies the template JSON and pastes into the TS file. Avoids fragile server-side file writing.
4. **Binary search font fitting** — with canvas-based `measureWidth` callback for accuracy
5. **Route: `admin/text-pages`** — follows existing admin pattern with Clerk auth

---

## Implementation Order

1. Types and data files (`types.ts`, `text-pages.ts`, `text-page-templates.ts`)
2. R2 listing (`list-r2.ts`, modify `r2.ts` exports)
3. Text fitting algorithm (`fit-text.ts`)
4. Server actions (`actions.ts`)
5. UI components bottom-up: text-box-overlay -> typography-controls -> template-output -> image-picker
6. Editor page (client component + server page)
7. Font loading (Nunito)

---

## Verification

1. Upload a test JPEG to R2 under `momotaro/text-pages/` prefix
2. Open `/admin/text-pages` — verify image appears in picker
3. Select image, draw text box, enter preview text — verify text renders and auto-fits
4. Adjust typography controls — verify live preview updates
5. Copy template config — verify valid TypeScript that matches `TextPageTemplate` type
6. Paste into `text-page-templates.ts` — verify no type errors
7. Unit tests: `fit-text.ts` with mock `measureWidth` — verify font size selection and word wrapping
