# Repository Guidelines

## Project Structure & Modules

- Core code lives in `src/`: `core/` (client, scheduler, storage, voice), `features/` (voiceAutoJoin, dailyMeme, autoReply, activity, autoEmoji, Groq chat), `events/`, `utils/`, `types/`.
- Deployment helpers sit in `scripts/` (e.g., `deploy-termux.sh` for Termux + PM2).
- Tests belong in `test/` (unit and integration). Keep fixtures small to avoid slowing CI.

## Setup & Environment

- Install dependencies with `pnpm install` (Node.js ≥20 preferred).
- Env loading order: `.env` then `.env.local` overrides; required keys: `TOKEN`, `VOICE_CHANNEL_ID`, `TARGET_GUILD_ID`, `ADMIN_ROLE_IDS`, `TTS_LANG=id-ID`; default `LOG_LEVEL=info`; optional `EMOJI_CHANNEL_IDS` (auto-emoji), `MEME_CHANNEL_ID` (daily meme), `MEME_API_URL` (override source), `ACTIVITY_MESSAGES` (presence rotation, max 20 entries); add provider keys (meme APIs, Groq). Rate configs now default to `RATE_MSGS_PER_MIN=5`, `RATE_PRESENCE_MIN=5`, `RATE_VOICE_JOIN_SEC=30`.
- Never commit secrets; use local env files and CI secrets for pipelines.

## Build, Test, and Development Commands

- `pnpm dev` — start the bot in watch/dev mode (uses `.env/.env.local`).
- `pnpm lint` — run ESLint checks; `pnpm format` / `format:check` for Prettier.
- `pnpm build` — compile TypeScript to `dist/`; `pnpm start` runs built output.
- `pnpm test` — unit + integration (scheduler, logger, env, voice join, daily meme, emoji/Groq/activity).
- `pm2 start dist/index.js --name ngetikin-selfbot` — run production build on Termux with PM2.

## Feature status (current)

- Voice: auto-join only; tidak ada announcer/reader.
- Auto emoji: channel-based (EMOJI_CHANNEL_IDS), react 5–20 emoji random; prioritise server non-animated, fallback unicode.
- Mention echo: admin mention + prefix `say` -> hapus pesan & kirim ulang teks.
- Daily meme: jika MEME_CHANNEL_ID set, fetch candaan-api image (fallback meme-api), jadwal 08/13/19 WIB; MEME_DEBUG_NOW untuk sekali kirim di start.
- Activity: rotasi presence (ACTIVITY_MESSAGES) atau rich presence via config/activity.json.
- Groq chat: mention (tanpa say) balas via Groq; default model `llama-3.2-1b-preview` (fallback otomatis model lain); rate-limit lokal.
- Scheduler: persisten ke `data/` untuk bertahan restart.

## Coding Style & Naming Conventions

- TypeScript strict; prefer explicit return types on public functions.
- Follow ESLint + Prettier; run `pnpm lint --fix` before commits.
- File names: kebab-case (`voice-manager.ts`); classes/types: PascalCase; variables/functions: camelCase; constants/env keys: UPPER_SNAKE.
- Keep modules small: one responsibility per file; move shared helpers into `utils/`.

## Testing Guidelines

- Unit: env validator, logger redaction/level, scheduler order/persist.
- Integration: event wiring, voice join/queue (mock), daily meme (mock fetch).
- Mock Discord network calls and TTS/audio I/O; avoid external APIs in CI.
- Prefer descriptive test names; assert behavior, not implementation.

## Commit & Pull Request Guidelines

- Use short, imperative commit subjects (e.g., “Add voice queue backoff”), mirroring the existing history (`Create README.md`).
- One logical change per commit; include relevant docs or schema updates together.
- PRs should describe the feature/bug, list key commands run (lint/test/build), and link any tracking issue.
- Add screenshots or console snippets when log output changes; call out risk areas (Discord API, voice join flow).

## Security & Operations

- Selfbot usage violates Discord TOS; restrict to alt accounts and private guilds.
- Sanitize logs; never print tokens, channel IDs, or user IDs in plaintext.
- For Termux deploys, keep `pm2 save`/`pm2 resurrect` steps documented in `scripts/` if added; rotate logs periodically.
- Termux deploy helper: `scripts/deploy-termux.sh` (pkg update/upgrade, install git/nodejs-lts/ffmpeg, pnpm, pm2 global, build, pm2 start+save, log rotation 10M, auto git pull setiap 6 jam).
