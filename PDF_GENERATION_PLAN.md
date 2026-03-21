# Plan: Generate Print-Ready PDF Book Interior for Lulu

## Context

Evertale needs to turn its 27 scene illustrations + 27 text pages into a print-ready PDF interior for Lulu print-on-demand. The book is US Letter Landscape (11 x 8.5 in), Paperback, Premium Color. Each scene has a matching text page with a background image and dynamically rendered text (child's name via `{{name}}`). An admin page is needed to preview spreads and trigger PDF generation.

---

## Book Layout

- **Format**: US Letter Landscape, 11 x 8.5 in (792 x 612 pt)
- **Bleed**: 0.125 in (9 pt) on all sides
- **PDF page size with bleed**: 11.25 x 8.75 in (810 x 630 pt)
- **Safe zone**: 0.5 in from trim edge for text
- **Page order**: Alternating -- Scene 1, Text 1, Scene 2, Text 2, ... Scene 27, Text 27
- **Total interior pages**: 54
- **All specs in a config file** (`src/lib/pdf/constants.ts`) so they can be easily updated later

### Image Aspect Ratio Handling

All images (scenes + text page backgrounds) are **5:4 ratio** (1.25:1), but the page is **11:8.5** (1.294:1). The page is slightly wider relative to height than the images.

**Strategy**: Scale image to fill page width, center vertically, crop top/bottom. This loses ~3.5% of the image height but ensures no horizontal gaps. Since the images are illustrations, slight vertical cropping is acceptable.

For text pages, the text box percentages were designed against the 5:4 image. We apply the same percentages to the _visible area_ of the image on the page (i.e., map coordinates relative to how the image is positioned on the page, not the raw page dimensions). This ensures text lands in the correct spot relative to the background art.

---

## Tech Approach

### PDF Library: `pdf-lib` + `@pdf-lib/fontkit` (server-side)

- Pure JS, no native deps, runs in Node.js
- `embedJpg`/`embedPng` for images, `embedFont` for custom Nunito font
- `PDFFont.widthOfTextAtSize()` replaces canvas-based `measureText` -- plugs into existing `fitText()` algorithm
- Returns `Uint8Array` for download or R2 upload

### Font: Serif font from text page templates

- The font family is defined per-template in `text-page-templates.ts` (currently "Nunito" but will be changed to a serif font)
- Download the chosen serif font `.ttf` to `src/assets/fonts/`
- Load via `fs.readFile` server-side, embed with fontkit
- Support loading different fonts by family name (read from template config)

---

## File Structure

```
src/lib/pdf/
  constants.ts            -- Lulu trim/bleed/safe-zone in points
  types.ts                -- PdfGenerationInput, BookPageData
  font-loader.ts          -- embedNunitoFont(pdfDoc) helper
  measure-width.ts        -- createPdfLibMeasureWidth(font) -> MeasureWidth
  render-scene-page.ts    -- Full-bleed scene image on a PDF page
  render-text-page.ts     -- Background image + fitted text on a PDF page
  generate-interior.ts    -- Orchestrator: fetch images, assemble 54-page PDF

src/app/api/admin/generate-pdf/
  route.ts                -- POST endpoint returning PDF binary

src/app/(main)/admin/book-preview/
  page.tsx                -- Server component (auth + data fetch)
  actions.ts              -- Server actions (fetch scenes, text data for a character version)
  book-preview-client.tsx -- Client: spread preview, name input, generate button
```

---

## Implementation Steps

### 1. Install dependencies
```bash
npm install pdf-lib @pdf-lib/fontkit
```

### 2. Add serif font asset
- Download the chosen serif font `.ttf` to `src/assets/fonts/` (font name TBD based on template config)

### 3. `src/lib/pdf/constants.ts`
Lulu spec constants as a config object (easily modifiable):
```ts
export const LULU_SPECS = {
  trimWidthIn: 11,
  trimHeightIn: 8.5,
  bleedIn: 0.125,
  safeMarginIn: 0.5,
} as const;
// Derived values in points (1 in = 72 pt)
export const TRIM_WIDTH_PT = LULU_SPECS.trimWidthIn * 72;  // 792
export const TRIM_HEIGHT_PT = LULU_SPECS.trimHeightIn * 72; // 612
// ... etc
```
Also: image scaling helpers for 5:4 -> 11:8.5 conversion (scale, offset calculations).

### 4. `src/lib/pdf/types.ts`
```ts
interface PdfGenerationInput {
  characterVersionId: string;
  childName: string;
  storySlug: string;
}
```

### 5. `src/lib/pdf/font-loader.ts`
- Read font `.ttf` from disk by family name (maps font family to `.ttf` file)
- Register fontkit on PDFDocument
- Return embedded PDFFont
- Cache embedded fonts per document to avoid re-embedding

### 6. `src/lib/pdf/measure-width.ts`
- `createPdfLibMeasureWidth(font: PDFFont): MeasureWidth`
- Uses `font.widthOfTextAtSize(text, fontSize)` -- plugs into existing `fitText()` from `src/lib/text-pages/fit-text.ts`

### 7. `src/lib/pdf/render-scene-page.ts`
- Add page at `PAGE_WIDTH_PT x PAGE_HEIGHT_PT`
- Embed scene JPEG, draw full-bleed (edge to edge)

### 8. `src/lib/pdf/render-text-page.ts`
- Add page at `PAGE_WIDTH_PT x PAGE_HEIGHT_PT`
- Draw background image full-bleed
- Convert text box percentages to point coordinates
- Scale font sizes: `templateFontSize * (PAGE_WIDTH_PT / imageNaturalWidth)`
- Call `fitText()` with pdf-lib measure function
- Draw text lines with proper align/valign

### 9. `src/lib/pdf/generate-interior.ts`
- Create PDFDocument, embed font
- For each page 1-27:
  - Fetch scene image from `character_version_scenes` (via R2)
  - Fetch text page background from R2 (via `imageKey` from template)
  - Render scene page (full bleed)
  - Replace `{{name}}` in text, render text page
- Return `pdfDoc.save()`
- Process images sequentially to manage memory

### 10. `src/app/api/admin/generate-pdf/route.ts`
- POST handler with Clerk auth + admin check
- Zod validation: `{ characterVersionId, childName, storySlug }`
- Call `generateInteriorPdf()`
- Return PDF as binary with `Content-Disposition: attachment`

### 11. Admin preview page (`src/app/(main)/admin/book-preview/`)
- **page.tsx**: Auth guard, fetch character versions (same pattern as `admin/story-scenes/page.tsx`)
- **actions.ts**: `getBookPreviewData(characterVersionId)` -- returns scene URLs + text data
- **book-preview-client.tsx**:
  - Character version selector (shadcn Select)
  - Child name input (shadcn Input)
  - Spread navigator: scene image left, text page right (with canvas-rendered text overlay)
  - Previous/next navigation
  - "Generate PDF" button -> calls API route, triggers download
  - Loading states with shadcn Skeleton/Progress

---

## Lulu API Integration Notes

Key info from the `openapi_public.yml` (at project root):

### Pod Package ID
For US Letter Landscape (11x8.5), Full Color, Premium, Paperback, 80# Coated White:
- Format: `1100X0850FCPREPB080CW444GXX` (needs verification via Lulu pricing calculator)
- Pattern: `{TrimSize}FC{Quality}PB{Paper}{Finish}{Linen}{Foil}`

### Print-Job Creation (`POST /print-jobs/`)
```json
{
  "contact_email": "...",
  "line_items": [{
    "printable_normalization": {
      "cover": { "source_url": "<public URL to cover PDF>" },
      "interior": { "source_url": "<public URL to interior PDF>" },
      "pod_package_id": "<27-char SKU>"
    },
    "quantity": 1,
    "title": "Momotaro - The Peach Boy"
  }],
  "shipping_address": { ... },
  "shipping_level": "MAIL"
}
```

Interior and cover files must be at **publicly accessible URLs** (R2 public URLs work). Lulu downloads, validates, and normalizes them.

### File Validation (optional but recommended)
- `POST /validate-interior/` with `{ source_url, pod_package_id }` -- async, poll `GET /validate-interior/{id}/`
- `POST /validate-cover/` with `{ source_url, pod_package_id, interior_page_count }`
- Statuses: VALIDATING -> VALIDATED/NORMALIZED/ERROR

### Cover Dimensions
- `POST /cover-dimensions/` with `{ pod_package_id, interior_page_count, unit: "inch" }`
- Returns exact `{ width, height, unit }` for the cover PDF
- This means we don't need to calculate spine width ourselves -- Lulu API tells us exact cover dimensions

### Auth
- OAuth2 client credentials: `POST /auth/realms/glasstree/protocol/openid-connect/token`
- Needs `LULU_CLIENT_KEY` and `LULU_CLIENT_SECRET` env vars
- Sandbox: `api.sandbox.lulu.com`, Production: `api.lulu.com`

### For This Phase
The generated interior PDF must be uploaded to R2 (public URL) so Lulu can download it. We won't integrate the full Print-Job creation flow yet -- just generate the PDF and make it downloadable/uploadable.

---

## Cover (Phase 2 -- stub only)

- Use Lulu's `POST /cover-dimensions/` endpoint to get exact dimensions
- Separate PDF: back cover + spine + front cover as single continuous page
- Front cover: existing cover image from character version
- Back cover + spine design: TBD
- `src/lib/pdf/generate-cover.ts` -- stub with types and TODO

---

## Key Files to Reuse

| File | What to reuse |
|------|--------------|
| `src/lib/text-pages/fit-text.ts` | `fitText()`, `wrapText()`, `MeasureWidth` type |
| `src/lib/text-pages/types.ts` | `TextPageTemplate`, `FontConfig`, `TextPageEntry` |
| `src/lib/story-assets/momotaro/text-page-templates.ts` | Template configs |
| `src/lib/story-assets/momotaro/text-pages.ts` | Text content with `{{name}}` |
| `src/lib/story-assets/momotaro/scenes.ts` | Scene definitions (page ordering) |
| `src/lib/storage/r2.ts` | `getFromR2()` for fetching images |
| `src/app/(main)/admin/story-scenes/page.tsx` | Admin page pattern |
| `src/app/(main)/admin/story-scenes/actions.ts` | Server action pattern |

---

## Important Considerations

1. **Missing templates**: Only 2 of 27 text page templates are configured. PDF generation should error clearly if a template is missing, and the admin preview should show which templates are not yet configured.

2. **Font size scaling**: Template font sizes (e.g., 28px) are relative to browser-displayed image dimensions (5:4 images). For the PDF, scale proportionally: `pdfImageDrawWidth / imageNaturalPixelWidth`. The image is drawn at `PAGE_WIDTH_PT` wide on the PDF, so `scaleFactor = PAGE_WIDTH_PT / imageNaturalWidth`.

3. **Image aspect ratio**: All images are 5:4, page is 11:8.5. Images are scaled to fill page width, centered vertically with slight top/bottom crop (~3.5%). Text box percentages are applied relative to the image's drawn position on the page.

4. **File size**: 54 high-res JPEGs could produce a large PDF. `pdf-lib.embedJpg` embeds raw bytes without re-encoding, which is efficient.

5. **Memory**: Process images sequentially rather than loading all 54 at once.

---

## Verification

1. Generate a PDF with a single spread (scene 1 + text 1) and open in a PDF viewer
2. Verify page dimensions match Lulu specs (11.25 x 8.75 in with bleed)
3. Verify text is positioned correctly on the text page
4. Verify images fill to bleed edge
5. Upload test PDF to R2 and validate via Lulu's `POST /validate-interior/` endpoint
6. Test with different child names (short, long) to verify text fitting

## Future Work (not in this phase)
- Full Lulu Print-Job creation flow (auth, create print-job, track status)
- Cover PDF generation using `POST /cover-dimensions/` for exact sizing
- Lulu webhook handling for print-job status updates
- Automated PDF generation on order placement
