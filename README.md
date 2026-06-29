# 💧 ironmp Launcher

Desktop game launcher built with Electron + React + TypeScript + Tailwind CSS.

## Getting Started

### Install dependencies
```bash
npm install
```

### Run in development (Vite + Electron)
Open **two terminals**:

**Terminal 1** — Start the Vite dev server:
```bash
npm run vite
```

**Terminal 2** — Start Electron (after Vite is running):
```bash
npm run electron
```

Or use concurrently (auto-waits for Vite):
```bash
npm run dev
```

### Build for production
```bash
npm run build
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
