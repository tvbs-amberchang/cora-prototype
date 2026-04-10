# Cross-Site Style Contract (CORA Baseline)

This document defines the shared visual system for:

- `cora-prototype` (source of truth)
- `proposal-to-product-site` (must align to this contract)

## 1) Brand Tokens

### Color Scale

Use CORA color families as the only base colors:

- `brand`
  - 50 `#e8f0fe`
  - 100 `#c5d9f9`
  - 200 `#9ebef3`
  - 300 `#74a3ed`
  - 400 `#4d89e7`
  - 500 `#0054b2`
  - 600 `#004a9e`
  - 700 `#003d82`
  - 800 `#002f66`
  - 900 `#0a1628`
  - 950 `#060d17`
- `accent`
  - 50 `#ecfeff`
  - 100 `#cffafe`
  - 200 `#a5f3fc`
  - 300 `#67e8f9`
  - 400 `#22d3ee`
  - 500 `#06b6d4`
  - 600 `#0891b2`
- `surface`
  - 0 `#ffffff`
  - 50 `#f8fafc`
  - 100 `#f1f5f9`

### Semantic Mapping

- Page background: `surface-50`
- Card background: `surface-0`
- Primary text: `slate-900`
- Secondary text: `slate-600`
- Tertiary text: `slate-400`
- Border: `slate-200`
- Primary action: `brand-500` (hover `brand-600`, active `brand-700`)
- Accent highlights: `accent-400` or `accent-500`

## 2) Typography

Use this order for all pages:

- `font-sans: Inter, Noto Sans TC, system-ui, -apple-system, sans-serif`

Guidelines:

- Headings: `font-semibold` or `font-bold`
- Body text: `font-normal`
- UI helper text: `text-xs` to `text-sm`, avoid ultra-light weights

## 3) Radius, Shadow, Motion

- Radius
  - Card/container: `rounded-xl` (12px)
  - Large visual block: `rounded-2xl` (16px)
  - Pills/badges: `rounded-full`
- Shadow
  - Default card: `shadow-card`
  - Hover card: `shadow-card-hover`
- Motion
  - Interaction duration: `duration-200` (or `duration-250` for card elevation)
  - Avoid scale-hover that changes layout flow

## 4) Shared Component Contract

Each site should support these utility-level classes with equivalent visual output:

- `.card`
- `.card-interactive`
- `.btn-primary`
- `.btn-secondary`
- `.input-base`
- `.badge`

Interaction requirements:

- Clickable elements must have `cursor-pointer`
- Button and input focus must show visible ring state
- Hover contrast must be obvious in both light and dark surfaces

## 5) Layout Rhythm

- Standard page container: max width near `1200px` to `1280px`
- Base section spacing:
  - Mobile: `py-12` to `py-16`
  - Desktop: `py-16` to `py-24`
- Card internal spacing:
  - Default: `p-5` or `p-6`

## 6) Allowed Differentiation

Landing-only effects are allowed when they do not break brand consistency:

- Decorative background glow
- Hero-specific gradient text
- Motion ornaments

But these must still be derived from `brand` and `accent` colors.

## 7) QA Checklist

- Uses `brand/accent/surface` as primary design tokens
- Uses `Inter + Noto Sans TC` font stack
- Primary/secondary button states match this contract
- Card border/radius/shadow match this contract
- Inputs have consistent focus ring behavior
- Mobile and desktop spacing follows the same rhythm
