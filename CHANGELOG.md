# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
- **Search keyword highlighting** — Search results are now highlighted in both the editor (overlay layer) and preview (HTML mark tags)
- **Export to Word** — Added "Export Word" button to export diary entries as `.docx` files
- **Markdown formatting** — Added "MD Format (✨)" toolbar button using Prettier to auto-format Markdown content
- **README.md** — Project documentation with features, tech stack, and usage guide
- **Spellcheck disabled** — Removed browser spellcheck red underlines in the editor

### Changed
- **Default editor mode** — Changed default editor mode from `split` to `edit`
- **Prettier integration** — Uses `prettier/standalone` with explicit markdown plugin for bundled environments

## [1.0.0] - 2026-06-09

### Added
- Initial release of DailyDiary
- Markdown editor with toolbar (bold, italic, headings, lists, code blocks, etc.)
- Live Markdown preview
- Split view (edit + preview side by side)
- Full-text search with flexsearch index
- Date tree sidebar navigation
- Tag cloud
- Calendar view for date selection
- Local file storage (`YYYY-MM-DD.md` format with YAML frontmatter)
- Customizable diary directory via settings
- Electron + Vue 3 + TypeScript + Vite stack
