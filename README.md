# Ronak Mehta — portfolio (v3)

Static site, no build step. GitHub Pages serves the repo root.

```
index.html                    Portfolio: WebGL "org" of 1,051 particles, scroll-driven story
assets/ronak.jpg              Portrait
assets/og.jpg                 Social preview image (1200×630)
artifacts/index.html          Northstar People Suite — launcher for every tool
artifacts/<tool>/index.html   One self-contained app per tool
artifacts/elevate/            Elevate — integrated talent suite for a sales-led org (standalone)
artifacts/shared/             Northstar design system v4 (ns.css), runtime (ns.js), dataset (ns-data.js)
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
Tools: performance-nexus, compintel-pro, retention-radar, pulse, leaders-field-guide,
competency-portal, people-ops-desk, workforce-planner, pipeline-ats, plus elevate.
All tool data is fictional (Northstar Labs, Brightkey Homes); state is saved in the visitor's browser only.
