# DailyTaskBar

A lightweight, always-on-top desktop task bar for managing your daily routines and habits. Built with Electron + React + TypeScript.

## Features

- **Floating Task Bar** — Frameless, transparent, always-on-top window that sits on your desktop
- **Task Management** — Create, edit, delete, archive, and reorder tasks with drag-and-drop
- **Task Types** — Daily, weekly, monthly, and one-time tasks with automatic reset
- **Priority Levels** — High, medium, low with color-coded indicators
- **Reminders** — Windows notifications with quiet hours support
- **System Tray** — Minimize to tray, quick actions from tray menu
- **Statistics** — Completion streaks, 7/30-day averages, daily chart
- **Keyboard Shortcuts** — Ctrl+N (add), Ctrl+F (search), Ctrl+, (settings), Ctrl+H (toggle completed)
- **Import/Export** — Backup and restore your data as JSON
- **Auto-start** — Launch with Windows
- **Themes** — Light, dark, and system themes with customizable accent color and font size
- **Compact Mode** — Toggle between compact and expanded views
- **Data Safety** — Automatic backups, data migration, corruption recovery

## Default Tasks (First Launch)

- 背单词 (Vocabulary)
- 刷一道递归题 (Recursion practice)
- PTE Repeat Sentence
- PTE Write Dictation
- 投递/查看岗位 (Job applications)
- 论文写作 30 分钟 (Thesis writing)

## Development

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Run in Development

```bash
npm run dev
```

This starts Vite with hot-reload and launches Electron automatically.

### Run Tests

```bash
npm test
```

### Type Check

```bash
npm run lint
```

### Build Windows Installer

```bash
npm run electron:build
```

Output will be in the `release/` directory.

## Project Structure

```
src/
  main/          Electron main process
  preload/       Preload script (contextBridge)
  shared/        Shared types
  renderer/
    components/  React UI components
    hooks/       Custom React hooks
    services/    Business logic services
    utils/       Utility functions
    types/       TypeScript declarations
tests/           Unit tests
```

## Data Location

All data is stored locally as JSON at:

```
%APPDATA%/daily-task-bar/dailytaskbar.json
```

A backup is automatically created at `dailytaskbar.backup.json` in the same directory.

## Architecture

- **Main Process** (`src/main/main.ts`) — Window management, tray, IPC, file I/O, auto-start
- **Preload** (`src/preload/preload.ts`) — Secure API bridge via `contextBridge`
- **Renderer** (`src/renderer/`) — React UI with hooks for state management
- **Storage** — JSON file read/write in main process, cached in renderer
- **Reset Logic** — Runs on app startup and date change; records completion history before resetting

## Troubleshooting

**App doesn't start**
- Delete `%APPDATA%/daily-task-bar/dailytaskbar.json` to reset data
- Check if another instance is already running (single-instance lock)

**Data seems corrupted**
- The app automatically tries `dailytaskbar.backup.json` if the main file is corrupted
- Manually restore from backup or delete both files to start fresh

**Notifications not working**
- Check Windows notification settings for the app
- Ensure notifications are enabled in Settings > Reminder
- Quiet hours may be active

**Window is off-screen**
- Delete `%APPDATA%/daily-task-bar/dailytaskbar.json` to reset window position
- Or toggle "Remember Window Position" off in Settings > Window

## Tech Stack

- Electron 33
- React 18
- TypeScript 5
- Vite 6
- Tailwind CSS 3
- Vitest
- electron-builder
