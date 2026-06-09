# DailyDiary

A local markdown diary app built with Electron + Vue 3 + TypeScript.

![Tech Stack](https://img.shields.io/badge/Electron-42.3.2-47848F?logo=electron)
![Vue](https://img.shields.io/badge/Vue-3.5.35-4FC08D?logo=vue.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-8.0+-646CFF?logo=vite)

## Features

- **Markdown Editor** - Full-featured editor with toolbar support for bold, italic, headings, lists, code blocks, quotes, links, images and more
- **Live Preview** - Real-time Markdown rendering with syntax highlighting
- **Split View** - Edit and preview side by side
- **Full-Text Search** - Fast indexed search across all diary entries with keyword highlighting in both editor and preview
- **Date Tree** - Hierarchical sidebar navigation organized by year, month and day
- **Tag Cloud** - Manage and filter diary entries by tags
- **Calendar View** - Visual calendar for quick date selection
- **Export to Word** - One-click export of diary entries to `.docx` format
- **Local Storage** - All diary files stored locally as Markdown (`.md`) files, no cloud dependency
- **Customizable Diary Directory** - Choose your preferred storage location

## Screenshots

*(Screenshots can be added here)*

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Framework | Electron |
| Frontend Framework | Vue 3 (Composition API) |
| Language | TypeScript |
| Build Tool | Vite |
| State Management | Pinia |
| Markdown Parser | marked |
| Search Engine | flexsearch |
| Word Export | docx |
| Date Handling | date-fns |
| UI Components | Custom (no external UI library) |

## Project Structure

```
DailyDiary/
├── electron/           # Electron main process
│   ├── main.js         # Main process entry
│   └── preload.js      # Preload script (IPC bridge)
├── src/
│   ├── components/     # Vue components
│   │   ├── MarkdownEditor.vue
│   │   ├── MarkdownPreview.vue
│   │   ├── EditorPane.vue
│   │   ├── Sidebar.vue
│   │   ├── SearchBar.vue
│   │   ├── DateTree.vue
│   │   ├── Calendar.vue
│   │   ├── TagCloud.vue
│   │   └── EntryHeader.vue
│   ├── composables/    # Vue composables
│   ├── stores/         # Pinia stores
│   ├── utils/          # Utility functions
│   ├── types/          # TypeScript type definitions
│   └── main.ts         # Renderer process entry
├── dist/               # Production build output
├── release/            # Packaged installer output
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js >= 18
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/gpkj007/DailyDiary.git
cd DailyDiary

# Install dependencies
npm install

# Start development mode
npm run start
```

### Build

```bash
# Build frontend only
npm run build

# Build and package installer (Windows .exe)
npm run electron:build
```

The installer will be generated in the `release/` directory.

## Diary File Format

Each diary entry is stored as a Markdown file with YAML frontmatter:

```markdown
---
title: "My Diary Entry"
date: 2026-06-08
tags: ["work", "reflection"]
---

Your diary content here...
```

Files are named `YYYY-MM-DD.md` and stored in your configured diary directory (default: `~/Documents/DailyDiary`).

## Configuration

Application settings are stored in `%APPDATA%/DailyDiary/settings.json` (Windows) or the platform equivalent.

Current configurable options:
- `diaryDir` - Custom diary storage directory

## Key Bindings / Toolbar Features

| Button | Action |
|--------|--------|
| B | Bold (`**text**`) |
| I | Italic (`*text*`) |
| S | Strikethrough (`~~text~~`) |
| H1-H3 | Headings |
| " | Blockquote |
| {} | Code block |
| - / 1. | Unordered / Ordered list |
| 🔗 | Link |
| 🖼 | Image |
| — | Horizontal rule |
| AA / aa | Uppercase / Lowercase transform |
| XML / JSON | Format code |

## License

ISC
