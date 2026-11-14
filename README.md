# Ronak Mehta — portfolio (v3)

Static site, no build step. GitHub Pages serves the repo root.

```
index.html                    Portfolio: interactive globe, unit chart, floating product cards
assets/ronak.jpg              Portrait
assets/og.jpg                 Social preview image (1200×630)
artifacts/index.html          Northstar People Cloud — product hub (solution map, catalogue, workspaces)
artifacts/<tool>/index.html   One self-contained app per tool
artifacts/elevate/            Elevate — integrated talent suite for a sales-led org (standalone)
artifacts/shared/             Northstar v5 base design system (ns.css), runtime + suite shell (ns.js), dataset (ns-data.js)
artifacts/shots/              Card screenshots (WebP, 800 & 1600 wide)
```

## Portfolio stack (all from CDNs, pinned)
- three.js 0.186.1 (import map): the hero globe only
- GSAP 3.15.0 + ScrollTrigger + SplitText: reveals, pinned scenes, counters
- Lenis 1.3.26: smooth scroll

Design rule: every visual encodes a real fact from the CV, and is labelled.
- Hero globe: land dots (a 7 KB bitmask built from Natural Earth 110m land), Mumbai as home base,
  arcs to North America, Europe and APAC (the regions of the 600+ engineers partnered with). Drag to spin.
- Impact: a 10×10 unit chart (each dot = 1% of the workforce) scrubbed with the published attrition series.
- System: each pillar card carries a micro-chart of its own number (600+ org, attrition, eNPS 74, 90% automated).
- Journey: "people in my remit" by year, with a marker that follows the scroll.
- Work: one floating landscape card per product showing its real screenshot; cards float to the centre one by one as you scroll.
`prefers-reduced-motion` disables smooth scroll and motion. Append `?instant` to skip the loader (QA).

## Artifacts
Ten products, one suite. They share the suite shell (global header, product switcher, ⌘K, persona switch,
notifications) and one data model; each has its own identity built around the job it does:

| Product | Identity | Signature |
|---|---|---|
| performance-nexus | The review room · Instrument Sans + Source Serif 4, paper and indigo | review cycle spine, document-style review editor, 9-box |
| compintel-pro | The comp terminal · IBM Plex Sans/Mono, green-black chrome | band-position bar, merit pool tracker, compa histogram |
| retention-radar | Risk command center · Inter Tight + JetBrains Mono, dark-first | radar scope, score dials, signals feed, incident board |
| pulse | Voice of the employee · Manrope, blush and rose | eNPS gauge, anonymity-aware heatmap, close-the-loop plans |
| leaders-field-guide | The manager's handbook · Newsreader serif, warm paper | chapters, script library, focused 1:1 session mode |
| competency-portal | The career atlas · Space Grotesk/Mono, violet ramp | two-track ladder, level diff, dot-rated matrix |
| people-ops-desk | The service desk · Inter + Roboto Mono, compact | three-pane inbox, SLA countdowns, deflection funnel |
| workforce-planner | The planning sheet · Figtree + Spline Sans Mono, olive | spreadsheet grid, formula bar, scenario tabs, waterfalls |
| pipeline-ats | The hiring board · Sora, warm orange | stage-coloured kanban, week calendar, band-checked offers |
| elevate | Sales-org talent cloud (Brightkey Homes) · Outfit | quota bullet charts, leaderboard, career graph |

All tool data is fictional (Northstar Labs, Brightkey Homes); state is saved in the visitor's browser only.
