# Vins Fins — Image Rescrape v2 Design

**Status:** Approved 2026-04-17
**Scope:** Re-source bottle images for the 730 wines in `data/wines.ts`, replacing the low-quality Bing-scraped catalog produced by the original `scripts/fetch-images.js`.

## Problem

The original pipeline scored Bing Image Search hits by aspect/domain/filename but never checked that the image was actually the right wine. Results in production include:

- Wholly wrong products (an Antidoot natural sour wine is illustrated by a Voodoo Ranger IPA).
- Non-portrait aspect (3917×3917, 2048×2048) that breaks the tall-card grid.
- Retailer watermarks and artistic reflection shots instead of catalog photos.
- 7 wines still point to external hosts (`bodeboca.com`, `hungarianwines.eu`, `wine-amazing.com`, `architectureinterieureduvin.com`) that return 404 / 403 / connection-refused.

722 of 730 wines are on Vercel Blob; the rest are external. Quality is inconsistent enough that pre-launch requires a full quality pass, but not every image needs replacing.

## Goals

1. Every wine has a portrait bottle image that is actually that wine (no wrong-product hits).
2. Consistent 800×1200 portrait on white background, stored on Vercel Blob.
3. No silent fallback to a bad image — anything uncertain goes through human review.
4. Pipeline is resumable; intermediate state survives crashes.
5. Known-good existing images are preserved (no regressions).

## Non-goals

- Label OCR (considered, rejected as over-engineered for the win).
- Sourcing from wine distributors' B2B catalogs (valuable but requires out-of-band access; revisit post-launch).
- Rewriting `data/wines.ts` schema — only the `image` field changes.

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Source strategy | Multi-source waterfall | Vivino has best portrait coverage for natural wines, Wine-Searcher covers classics, producer domains catch rarities, Bing is a last-resort fallback. |
| Validation | Token match + human-in-loop for non-HIGH | Pure automation mis-matches on obscure wines; full manual review is impractical at 730. Hybrid = no wrong products in prod, bounded human work. |
| Failure handling | Unified review queue (flagged + no-match) | One interface; reviewer can accept a candidate, paste a URL, or mark placeholder. |
| Review UI | Local Next.js page | Fastest to review 100-200 items; builds in hours, not days. |
| Scope | Audit-first, rescrape-on-fail | Preserves known-good Blob images; avoids re-uploading ~300 wines that are already fine. |
| Normalization | Resize + pad to 800×1200 white JPG q=85 | Makes the grid uniform and decouples display from source shape. |

## Architecture

Four-stage pipeline with a human-review interlude between classify and apply.

```
┌────────┐   ┌────────────┐   ┌──────────┐   ┌────────────┐   ┌──────────┐
│ AUDIT  │──▶│  WATERFALL │──▶│ CLASSIFY │──▶│ REVIEW UI  │──▶│ NORMALIZE│
│ (730)  │   │  (fails)   │   │ (auto/   │   │ (flagged)  │   │ + UPLOAD │
│        │   │            │   │  flag)   │   │            │   │ + COMMIT │
└────────┘   └────────────┘   └──────────┘   └────────────┘   └──────────┘
     │             │                │                │                │
     ▼             ▼                ▼                ▼                ▼
  audit.json    candidates.json  classified.json  decisions.json   wines.ts (new)
```

Each stage writes a JSON state file under `scripts/v2/state/`. Any stage re-run reads the prior state and skips wines it already completed.

## Components

All new code lives under `scripts/v2/`; the review UI lives under `app/admin/image-review/`.

| File | Role |
|---|---|
| `orchestrate.ts` | Main entry. `--stage=audit\|scrape\|classify\|review\|apply\|all`. |
| `audit.ts` | Validate current image for each of 730 wines. Writes `state/audit.json`. |
| `sources/vivino.ts` | Scrape Vivino search results, extract candidate image URLs + source-page title. |
| `sources/wine-searcher.ts` | Same for Wine-Searcher. |
| `sources/producer.ts` | Guess producer domain from name, scrape `og:image` / product page. |
| `sources/bing.ts` | Last-resort Bing scrape, cleaned from original `fetch-images.js`. |
| `waterfall.ts` | For each failed wine, try sources in order until HIGH confidence or all exhausted. |
| `validate.ts` | Token match + aspect + size + domain + corner-variance → `{confidence, reasons}`. |
| `classify.ts` | Apply HIGH→auto-accept, else→flag rules. Writes `state/classified.json`. |
| `normalize.ts` | Fetch image, fit-onto-white 800×1200, encode JPG q=85. Returns Buffer. |
| `blob-upload.ts` | Upload to Vercel Blob at `vinsfins/images/v2/<wine-id>.jpg`. Deletes old blob on success. |
| `apply.ts` | Read `decisions.json`, update `data/wines.ts` via AST. |
| `state/*.json` | Resumable state per stage. |
| `app/admin/image-review/page.tsx` | Localhost-only review UI. |
| `app/admin/image-review/api/decide/route.ts` | POST handler; writes `state/decisions.json`. |

## Data flow (per wine)

```
wine
  │
  ▼
audit.validate(currentImageUrl)
  │
  ├── PASS → keep; no action
  └── FAIL
        │
        ▼
     waterfall.run(wine) → [candidate₁, candidate₂, …]
        │
        ▼
     validate each → confidence + reasons
        │
        ▼
     classify.pick():
        • HIGH (all rules pass) → auto-accept
        • MEDIUM / LOW / NONE → flag for review
        │
        ├── AUTO-ACCEPT → normalize + upload + record new URL
        └── FLAGGED     → enqueue to review UI
                             │
                             ▼
                        human picks candidate / pastes URL / placeholder
                             │
                             ▼
                        normalize + upload + record new URL
```

Final step: `apply.ts` reads `decisions.json` and rewrites the matching `image:` fields in `data/wines.ts`.

## Confidence rules

Defined in `validate.ts`. Note that `data/wines.ts` has no `producer` field — the producer/domaine name is embedded in `name` (often ALL-CAPS, e.g. `"BEER WoopWoop sous voile ANTIDOOT 0,75cl"` → producer token `ANTIDOOT`). A helper `extractProducerToken(wine.name)` heuristically extracts it by (1) preferring ALL-CAPS tokens of length ≥ 4, (2) falling back to the longest significant token.

A candidate has:

- `aspectRatio = height / width`
- `minSide = min(width, height)`
- `urlTokens` — lowercased significant tokens in the image URL and source-page `<title>`
- `producerTokenHit` — `extractProducerToken(wine.name)` appears in URL or title
- `wineTokenCount` — count of distinct wine-name tokens (excluding producer token and stop-words like `BEER`, `wine`, `bottle`, years, volumes) in URL/title
- `domainAllowed` — domain ∈ wine-retailer whitelist (vivino, wine-searcher, producer domains, curated caviste sites)
- `domainBlocked` — domain ∈ stock/social/wiki blocklist
- `cornerVariance` — average chromatic std-dev of 4 50×50 corner patches (heuristic for "clean background")

| Confidence | Rule |
|---|---|
| **HIGH** | aspect ≥ 1.3 ∧ min-side ≥ 600 ∧ `producerTokenHit` ∧ `wineTokenCount` ≥ 2 ∧ `domainAllowed` ∧ `cornerVariance` < 0.15 ∧ ¬`domainBlocked` |
| **MEDIUM** | Missing one of: `cornerVariance` check, OR `wineTokenCount` = 1 (but `producerTokenHit` = true), OR `domainAllowed` = false but domain reputable |
| **LOW** | aspect + size pass + ≥1 token match, but `producerTokenHit` = false OR domain weak |
| **NONE** | fails aspect or size, OR 0 token match, OR `domainBlocked` |

Auto-accept = HIGH only. Everything else → review. When `extractProducerToken` returns nothing (wine names like `"Pinot Noir Reserve 2019"` with no clear producer), HIGH is unreachable and the wine is flagged by construction.

## Review UI

Route: `/admin/image-review` (Next.js page, dev-only).

Gate: the route handler checks `process.env.NODE_ENV === 'development'` and rejects any request with a `forwarded` or `x-forwarded-for` header. The admin route is not included in production builds (add to `next.config.mjs` `pageExtensions` filter if needed).

For each flagged wine, the page shows:

- Wine metadata: name, producer, region, category, current image (if any).
- Candidate thumbnails from the waterfall, annotated with source + confidence + reasons.
- Actions: **Accept [candidate N]**, **Paste URL**, **Placeholder (category)**, **Skip**.
- Undo-last-5 button (rewrites `decisions.json`).

Actions POST to `/admin/image-review/api/decide`, which writes to `scripts/v2/state/decisions.json`.

## Error handling

| Failure | Behavior |
|---|---|
| Source 429 / IP block | Backoff 5s/15s/60s. Skip source for this wine. Log to `state/source-health.json`. 10 consecutive failures → disable source for the run. |
| Source HTML layout change | Throw typed `SourceParseError`, skip source, log. |
| Image fetch timeout / 4xx / 5xx | Retry once with 5s delay. On second fail, drop candidate. |
| Normalize fails (corrupt image) | Drop candidate. |
| Blob upload fails | Retry twice with backoff. Third fail → halt. No silent state corruption. |
| Wine missing producer/region | Waterfall runs with name only; confidence ceiling capped at MEDIUM. |
| Crash mid-stage | Re-run reads stage output file; completed wines skipped. |

All skipped wines are logged with reason. Final run prints a summary: `audited: N, passed: X, rescraped: Y, auto-accepted: A, flagged: F, applied: P`.

## Testing

- **`validate.test.ts`** — synthetic inputs:
  - Voodoo Ranger URL for Antidoot wine → NONE.
  - Correct portrait on vivino.com with producer token → HIGH.
  - Square aspect otherwise HIGH-worthy → MEDIUM.
  - Stock-photo domain → NONE.
- **`sources/*.test.ts`** — one golden-fixture test per source (saved HTML from a known Vivino/Wine-Searcher search). Parser must extract expected candidates.
- **`waterfall.int.test.ts`** — live integration run against 10 curated wines (known-good, known-broken, obscure natural, producer-less beer). Gated behind `RUN_INTEGRATION=1`.
- **Manual smoke** — run review UI against 5 flagged wines end-to-end; verify accept → write → apply → resulting Blob URL serves 200 with correct aspect.

No tests against the full 730 — the whole point of the human-in-loop is cases that can't be validated automatically.

## Operational notes

- Run `scripts/v2/orchestrate.ts --stage=audit` first to see the baseline (how many of 730 pass validation as-is).
- `scripts/v2/orchestrate.ts --stage=scrape` runs the waterfall on failed wines. Expect 1–3 seconds per wine for successful HIGH hits; flagged wines are slower because all sources run.
- `scripts/v2/orchestrate.ts --stage=review` starts `next dev` and opens the review UI.
- `scripts/v2/orchestrate.ts --stage=apply` rewrites `data/wines.ts` and runs the existing image-migration to Blob.
- Commit `data/wines.ts` separately from the scripts to make the content change reviewable.

## Rollback

- Blob writes use a `v2/` prefix so old URLs remain intact until `apply.ts` runs.
- Apply stage commits the `wines.ts` change as a single commit; `git revert` restores old URLs.
- Old Blob objects are *not* deleted until 7 days after apply (set via `blob.del()` scheduled deletion) — gives time to spot regressions.
