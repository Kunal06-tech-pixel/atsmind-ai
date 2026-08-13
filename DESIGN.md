---
name: ATSmind AI
description: Cinematic resume intelligence rendered as a living evidence workspace
colors:
  night: "#0c0c0c"
  panel: "#0e1014"
  teal: "#079985"
  mint: "#2ed7b5"
  ice: "#a4fdf0"
  white: "#ffffff"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(3rem, 7vw, 6rem)"
    fontWeight: 600
    lineHeight: 0.9
    letterSpacing: "-0.04em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  control: "12px"
  card: "16px"
  frame: "24px"
  pill: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.night}"
    rounded: "{rounded.pill}"
    padding: "12px 20px"
---

# Design System: ATSmind AI

## Overview

**Creative North Star: "The Living Evidence Desk"**

The landing page behaves like a premium desktop analysis environment emerging from a cinematic dark field. Authenticated surfaces turn that same world into a focused operating environment: an ink-black evidence desk with restrained glass, crisp rules, mint actions, and dense document-centric layouts.

**Key Characteristics:**

- Full-screen atmospheric video behind high-contrast product storytelling.
- Glass surfaces used as document and evidence panes, not generic decoration.
- Teal, mint, and icy cyan reserved for analysis state and guided action.
- One staged opening sequence followed by scroll-triggered explanatory reveals.
- Authenticated screens use compact, immediate state transitions rather than landing-page choreography.

## Colors

The system is near-black and white with a resume-intelligence spectrum of teal through icy mint.

**The Evidence Color Rule.** Saturated teal and mint identify actionable evidence, active state, or AI assistance; they do not become undifferentiated decoration.

## Typography

**Display Font:** Inter, system UI fallback
**Body Font:** Inter, system UI fallback

Display type is compact and cinematic. Body copy stays calm and highly legible on video and glass.

## Layout

The public page uses a near-full-width responsive frame, fixed vertical guides, broad full-width separators, and reference-matched sections. Authenticated screens use a persistent 18rem navigation rail, a compact sticky command header, and a wide task canvas. Product demonstrations and data tables collapse into scrollable or stacked mobile views without page-level horizontal overflow.

## Elevation & Depth

Depth comes from backdrop blur, luminosity blending, inset highlights, and one soft ambient shadow beneath the main application frame.

## Shapes

Controls are pills; compact product controls use 12px corners; glass cards use 16px; hero and closing frames may use 24px. Product mockups never use fake browser chrome beyond the explicitly requested desktop title bar.

## Components

### Buttons

- **Primary:** White pill with black text and a directional arrow.
- **Secondary:** Transparent pill with a quiet white border.
- **State:** 160ms press scale; hover color or arrow shift only on fine pointers.

### Cards / Containers

- **Background:** Almost transparent white with luminosity blend and 4px blur.
- **Border:** Masked 1.4px vertical highlight gradient.
- **Fallback:** Opaque near-black surface when backdrop filtering is unavailable.

### Navigation

The public navigation mirrors the reference: mark-only left, five centered section links, one white CTA, and an accessible mobile menu.

Authenticated navigation uses a dark evidence rail with a mint active marker, explicit role context, a compact account block, and a drawer at smaller widths. It must always prioritize location and task clarity over spectacle.

### Authenticated controls

- **Primary action:** ice-white surface, near-black text, 12px corners.
- **Secondary action:** dark translucent surface with a quiet mint border.
- **Input:** opaque near-black field, visible label, cool white text, mint focus ring.
- **Table:** single contained surface, quiet header band, row separators, and mint selection/hover state.
- **Status:** semantic red, amber, blue, and green remain distinct but are tuned for dark surfaces.
- **Resume preview:** stays white and print-faithful; the surrounding builder chrome stays dark.

## Do's and Don'ts

### Do:

- **Do** label all demonstration scores and candidate content as sample data.
- **Do** preserve exact role-aware routing for Career and Recruit actions.
- **Do** retain the supplied video and entrance delays when motion is permitted.

### Don't:

- **Don't** invent customers, testimonials, prices, benchmarks, or hiring outcomes.
- **Don't** describe AI as calculating or overriding deterministic scores.
- **Don't** carry landing-page video, giant display typography, or orchestrated entrance choreography into authenticated pages.
- **Don't** return authenticated pages to the previous bright mint-white theme; they are the operational form of the same dark ATSmind world.
