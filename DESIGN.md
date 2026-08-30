# GlimmerHub design system

## Product character

GlimmerHub is an editorial intelligence product for open-source movement. It should feel calm, current, and evidence-led. It must not look like a generic analytics dashboard, developer terminal, or launch directory.

## Hierarchy

1. One lead signal and its thesis.
2. Five to eight secondary movements.
3. Evidence and credibility.
4. Scores, filters, and controls.

A score never outranks the explanation it supports.

## Visual grammar

- Light-first warm paper canvas.
- Flat rows with hairline separators.
- No permanent card shadows.
- No score circles, badge clouds, gradients, or ambient glows.
- Amber marks GlimmerHub judgment or confirming evidence. Repository facts stay neutral.
- The evidence thread connects a claim to releases, commits, mentions, and adoption signals.

## Typography

Use the native system stack only:

```css
-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif,
"Apple Color Emoji", "Segoe UI Emoji"
```

| Role | Size / line | Weight | Tracking |
| --- | --- | --- | --- |
| Briefing title | 36 / 40 | 650 | -0.03em |
| Lead headline | 28 / 33 | 650 | -0.02em |
| Section title | 18 / 24 | 650 | -0.01em |
| Row title | 16 / 23 | 600 | -0.01em |
| Body | 15 / 23 | 400 | normal |
| Metadata | 12 / 17 | 450 | normal |
| Micro label | 11 / 14 | 600 | 0.08em |

Numbers use tabular numerals.

## Color

### Light

- Canvas: `#F7F7F4`
- Surface: `#FFFFFF`
- Primary ink: `#1C1E21`
- Secondary ink: `#686E77`
- Tertiary ink: `#8A9099`
- Hairline: `#E1E2DE`
- Soft hover: `#F1F2EF`
- Amber marker: `#D3A72F`
- Amber text: `#765A00`
- Positive: `#267A57`
- Warning: `#9A6218`
- Negative: `#B24848`

### Dark

- Canvas: `#0D0F12`
- Surface: `#12151A`
- Primary ink: `#F1F0EB`
- Secondary ink: `#A0A5AE`
- Tertiary ink: `#737A84`
- Hairline: `#2B3037`
- Soft hover: `#181C21`
- Amber marker: `#E1B943`
- Amber text: `#F0D47B`
- Positive: `#55C694`

## Spacing and geometry

Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px.

- Controls: 4px radius.
- Search and larger panels: 6px radius.
- Row hover surface: 8px radius.
- Borders: 1px hairlines.
- Shadow: only menus and overlays.

## Layout

- Maximum content width: 1200px.
- Desktop header: 64px.
- Mobile header: 56px.
- Lens rail: 48px.
- Briefing desktop: fluid main column, 280px right rail, 48px gap.
- Mobile: one column with the lens and lead thesis before secondary content.

### Lens rail

- Lens tabs scroll inside a dedicated viewport.
- New Lens occupies a fixed far-edge column outside the viewport.
- Desktop label: `+ New lens`. Mobile label: `+ New`.
- A hairline separates creation from navigation.
- All controls use flex centering across the same 48px height.
- Long names cap at 180px desktop and 144px mobile, with ellipsis and a full-name tooltip.
- A 22px edge fade appears only where hidden tabs remain.
- Arrow Left, Arrow Right, Home, and End move between lenses and activate the focused lens.

## Interaction

- Hover and focus color: 120ms.
- Tray and route transitions: 180ms.
- Easing: `cubic-bezier(0.2, 0, 0, 1)`.
- No scaling on hover.
- Remove transitions for `prefers-reduced-motion`.
- Dedicated routes replace centered project modals.

## Mobile rules

Remove desktop navigation, tertiary metadata, and repeated actions. Keep the active lens, lead thesis, project name, short explanation, weekly movement, and one route into the briefing. All touch targets are at least 44px.

## Brand assets

`apps/web/assets/brand/mark.svg` and `favicon.svg` are temporary generic G assets. All placements reference these files so a final logo can replace them without layout changes.
