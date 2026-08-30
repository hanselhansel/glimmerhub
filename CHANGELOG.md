# Changelog

All notable changes to GlimmerHub are recorded here.

## [0.1.0.0] - 2026-08-30

### Added

- Personalized General and Physical AI briefings with transparent topic matching.
- Custom lens creation from descriptions, themes, exclusions, and example repositories.
- Dedicated project evidence pages, source views, topic views, and two-project comparison.
- Light and dark themes with browser-local preferences.
- Replaceable SVG brand assets and a documented design system.
- GitHub Pages deployment through GitHub Actions.
- Node test coverage for application state, lens ranking, routing, rendering, storage recovery, and navigation behavior.

### Changed

- Replaced the ranked card feed with one lead thesis and flat supporting signal rows.
- Moved Glimmer Score from a visual centerpiece to supporting evidence.
- Rebuilt the lens rail with a fixed New Lens action, scrollable tabs, overflow cues, responsive labels, and keyboard navigation.
- Split the frontend into focused data, scoring, routing, rendering, interaction, and style modules.

### Fixed

- Preserved briefing scroll position after project research.
- Added mobile touch sizing, menu dismissal, and lens deletion confirmation.
- Kept keyboard focus in the lens rail during arrow navigation.
- Scoped lens keyboard controls so Topics page actions do not trigger rail navigation.

### Removed

- Removed the circular radar, score rings, badge clouds, permanent card shadows, and centered project modals.
