# Reconstruction Plan

## SiLeMa → Single HTML Page

**Current**: Supabase backend (SQL schema, RLS, Edge Functions, Android Kotlin app, 6 doc files)  
**Target**: 1 self-contained HTML file (~200 lines), localStorage, zero dependencies

Core logic (3 operations):
1. Register: name + emergency email → localStorage
2. Daily check-in: tap button → record timestamp in localStorage
3. Alert: if last check-in > 2 days, show prominent warning (email simulated via mailto: link)

Delete everything in `silema/` except the single HTML output.

## BioEvolution → Vanilla JS + Canvas

**Current**: Next.js 16 + React 19 + Recharts + Radix UI + Tailwind (~20 files, package.json, tsconfig, etc.)  
**Target**: 4 vanilla JS files (~1,800 lines), zero dependencies

| New File | Source | LOC Target |
|----------|--------|------------|
| `js/types.js` | src/types.ts | ~80 |
| `js/core.js` | Environment.ts + Organism.ts + Glimmer.ts + Gloomer.ts | ~900 |
| `js/renderer.js` | CanvasWorld.tsx + ControlPanel + DataCharts + Tooltip | ~500 |
| `js/main.js` | page.tsx orchestration | ~200 |
| `index.html` | layout.tsx + globals.css inline | ~100 |

Delete: `生物演变1.01/` entirely, replace with `bioevolution/`.

## Execution Order

1. Create `bioevolution/` directory structure
2. Write all 5 files (types.js, core.js, renderer.js, main.js, index.html)
3. Create `silema.html` (single file)
4. Delete old directories (`silema/`, `生物演变1.01/`)
5. Update RECONSTRUCTION-PLAN.md
6. Git commit + push
