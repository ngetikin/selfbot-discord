v0.0 Scope & guardrail

- Tegaskan risiko selfbot (TOS), gunakan akun alt; single guild privat, Termux-only.
- Fitur target: voice (auto join, announcer, reader), fun (daily meme), utility (autoReply, activity).
- Keputusan TTS: `espeak-ng` offline; siapkan adaptor spawn + opsi voice/lang dari env.

v0.1 Bootstrap repo

- Versi Node 20 (`.nvmrc`), init pnpm, `package.json` minimal `type: module` (atau sesuaikan), set `lint`, `lint:fix`, `dev`, `build`, `test`.
- `.gitignore` + `.env.example` (TOKEN, VOICE_CHANNEL_ID, TARGET_GUILD_ID, ADMIN_ROLE_IDS, TTS_LANG, MEME_API_KEY?).
- `tsconfig.json` strict, outDir `dist/`, rootDir `src/`, resolve path alias jika perlu.
- ESLint + Prettier + TypeScript plugin; share config; jalankan `pnpm lint` untuk validasi.
- Husky simple: pre-commit (cek branch name kecuali wip; lint-staged optional), commit-msg (conventional commit; WIP bypass), pre-push (cek branch name; WIP bypass).

v0.2 Kerangka bot

- Struktur folder: `src/core`, `src/features`, `src/events`, `src/utils`, `src/types`, `scripts`, `test/unit`, `test/integration`.
- Entry `src/index.ts`: load env + validate, init logger, init client dengan intents minimal, global error handler, start event loader.
- Event loader di `src/events/index.ts`: auto-load file handler `ready`, `messageCreate`, `voiceStateUpdate`.
- Utils: logger dengan redaction token/IDs, helper waktu/cooldown, validator env (zod/yup + dotenv).
- Types: config shape, queue item (TTS), scheduler task, storage interface.

v0.3 Core services

- Client wrapper: Discord.js (selfbot) dengan retry + rate-limit guard + graceful shutdown.
- Scheduler: in-memory queue + persist JSON (Termux friendly); API add/delay/cancel; tick loop.
- Storage: file-based JSON abstraction dengan path di `data/`; siap ganti ke KV/Redis nanti.
- Voice service kerangka: join/leave helpers, audio player pipeline, antrean TTS (hook ke `espeak-ng` adaptor).

v0.4 Fitur voice

- voiceAutoJoin: on ready/reconnect join VOICE_CHANNEL_ID dengan permission check dan cooldown.
- voiceAnnouncer: dengar event voiceStateUpdate; bikin pesan TTS join/leave; antrean; pilih voice/lang dari env.
- voiceReader: komando/trigger teks channel tertentu → push ke antrean TTS; filter panjang/profanity opsional; hindari loop self-reply.
- Rate-limit guard: join ≥30s, audio request throttle, error fallback (skip item jika gagal synth).

v0.5 Fitur fun/utility

- dailyMeme: scheduler harian; sumber API (reddit/other) + de-dupe; fallback cache lokal; formatting embed sederhana.
- autoReply: pola teks (regex/glob) → respon; konfigurasi file JSON/YAML; jangan balas diri sendiri; cooldown per user/channel.
- activity: daftar presence; rotasi tiap ≥5 menit; dukung streaming/custom status; patuhi rate limit.

v0.6 Tooling & kualitas

- Tes unit: env validator, logger redaction, scheduler ops, TTS queue order.
- Tes integration: event flow mock Discord, voice queue -> adaptor `espeak-ng` (mock spawn), daily meme scheduler (mock fetch).
- Setup lint-staged (opsional) untuk format/lint pada staged files; update pre-commit jika diaktifkan.
- GitHub Actions: workflow lint + test pada push/PR; cache pnpm.

v0.7 Deploy & ops

- Script `scripts/deploy-termux.sh`: install deps, build, pm2 start `dist/index.js`, `pm2 save/resurrect`; set env via file.
- Logging level/env (`LOG_LEVEL`, `DEBUG`); redaksi ID/token; rotate log dengan pm2 config.
- Graceful shutdown hook (SIGINT/SIGTERM) untuk tutup voice dan flush queue.

v0.8 Review & backlog

- Jalankan `pnpm lint && pnpm test && pnpm build`; perbaiki isu.
- Audit rate-limit config (msg ≤5/menit/channel, presence ≥5m, voice join ≥30s) dan tambahkan ke config/env.
- Susun backlog lanjutan: moderasi ringan, dashboard kecil, opsi provider TTS lain jika perlu.
