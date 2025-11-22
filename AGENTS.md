# Repository Guidelines

## Project Structure & Modules

- Core code lives in `src/`: `core/` (client, scheduler, storage, voice), `features/` (voiceAutoJoin, voiceAnnouncer, voiceReader, dailyMeme, autoReply, activity), `events/`, `utils/`, `types/`.
- Deployment helpers sit in `scripts/` (e.g., `deploy-termux.sh` for Termux + PM2).
- Tests belong in `test/` (unit and integration). Keep fixtures small to avoid slowing CI.

## Setup & Environment

- Install dependencies with `pnpm install` (Node.js ≥20 preferred).
- Env loading order: `.env` then `.env.local` overrides; required keys: `TOKEN`, `VOICE_CHANNEL_ID`, `TARGET_GUILD_ID`, `ADMIN_ROLE_IDS`, `TTS_LANG=id-ID`; add provider keys (TTS, meme APIs) when needed.
- Never commit secrets; use local env files and CI secrets for pipelines.

## Build, Test, and Development Commands

- `pnpm dev` — start the bot in watch/dev mode (uses `.env/.env.local`).
- `pnpm lint` — run ESLint checks; `pnpm format` / `format:check` for Prettier.
- `pnpm build` — compile TypeScript to `dist/`; `pnpm start` runs built output.
- `pnpm test` — placeholder; add unit/integration tests as features land.
- `pm2 start dist/index.js --name ngetikin-selfbot` — run production build on Termux with PM2.

## Coding Style & Naming Conventions

- TypeScript strict; prefer explicit return types on public functions.
- Follow ESLint + Prettier; run `pnpm lint --fix` before commits.
- File names: kebab-case (`voice-manager.ts`); classes/types: PascalCase; variables/functions: camelCase; constants/env keys: UPPER_SNAKE.
- Keep modules small: one responsibility per file; move shared helpers into `utils/`.

## Testing Guidelines

- Place fast unit tests in `test/unit`, heavier integration in `test/integration`.
- Mock Discord network calls and TTS/audio I/O; avoid external APIs in CI.
- Add regression tests for voice scheduling, TTS queue order, meme de-duplication.
- Prefer descriptive test names (`shouldQueueTtsInJoinOrder`); assert behavior, not implementation.

## Commit & Pull Request Guidelines

- Use short, imperative commit subjects (e.g., “Add voice queue backoff”), mirroring the existing history (`Create README.md`).
- One logical change per commit; include relevant docs or schema updates together.
- PRs should describe the feature/bug, list key commands run (lint/test/build), and link any tracking issue.
- Add screenshots or console snippets when log output changes; call out risk areas (Discord API, voice join flow).

## Security & Operations

- Selfbot usage violates Discord TOS; restrict to alt accounts and private guilds.
- Sanitize logs; never print tokens, channel IDs, or user IDs in plaintext.
- For Termux deploys, keep `pm2 save`/`pm2 resurrect` steps documented in `scripts/` if added; rotate logs periodically.
