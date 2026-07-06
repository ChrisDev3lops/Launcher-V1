# 💧 ironmp Launcher

Desktop game launcher built with Tauri + Rust + React + TypeScript + Vite + Tailwind CSS.

## Getting Started

### Install dependencies
```bash
bun install
```

### Run in development
```bash
bun run tauri:dev
```

### Build for production
```bash
bun run tauri:build
```

## Backend Connection

Edit `.env` to point to your backend:
```
VITE_API_URL=http://localhost:3000/api
```

Or change it at runtime in **Settings → Settings → Backend API URL**.

## Expected Backend Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/login` | Login → returns `{ token, user }` |
| POST | `/api/auth/register` | Register |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/games` | List all games |
| GET | `/api/games/featured` | Featured game |
| GET | `/api/shop/featured` | Featured shop items |
| GET | `/api/shop/daily` | Daily shop items |
| POST | `/api/shop/purchase/:id` | Purchase item |
| GET | `/api/leaderboard/global` | Global leaderboard |
| GET | `/api/user/profile` | User profile |
| PATCH | `/api/user/settings` | Update settings |

## Pages

- **Home** — Featured banner, news cards, recent players
- **Library** — Manage and launch builds
- **Shop** — Featured + Daily items with countdown timer
- **Leaderboard** — Global rankings with podium
- **Downloads** — Active/queued downloads
- **Settings** — Themes, backend URL, launch options
