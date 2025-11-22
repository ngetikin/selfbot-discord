v0.0 Scope & guardrail
- Klarifikasi tujuan bot, fitur wajib, dan toleransi risiko TOS (selfbot = rawan banned).
- Prioritas: fleksibel (semua bisa dikerjakan bertahap v0.1→v0.8).
- Platform: Termux-only, single guild privat.
- TTS: pilih paling ringan & praktis → `espeak-ng` (offline, unlimited); siapkan adaptor Node spawn.

v0.1 Bootstrap repo
- Inisialisasi Node 20 + pnpm; tambah `.nvmrc` dan `pnpm init`.
- Buat `.gitignore`, `.env.example` (TOKEN, VOICE_CHANNEL_ID, TARGET_GUILD_ID, ADMIN_ROLE_IDS, TTS_LANG, API keys).
- Tambah `tsconfig.json` (strict, outDir `dist/`), ESLint+Prettier config, skrip `lint`, `lint:fix`, `build`, `dev`.

v0.2 Kerangka bot
- Struktur folder `src/`, `test/`, `scripts/` sesuai AGENTS.md; entry `src/index.ts` login + error handler.
- Loader event `src/events/` untuk `ready`, `messageCreate`, `voiceStateUpdate`.
- Util umum: logger yang redact token/IDs, helper waktu, validator env (zod/yup).
- Types kontrak: config, queue item, scheduler task.

v0.3 Core services
- Client wrapper dengan intents minimal; guard rate limit dan retry.
- Scheduler terpusat (JSON persist sederhana).
- Storage abstraksi file dengan antarmuka ganti ke KV/Redis nanti.

v0.4 Fitur voice
- voiceAutoJoin: join VOICE_CHANNEL_ID on ready/reconnect + cooldown/permission guard.
- voiceAnnouncer: TTS join/leave dengan antrean; bahasa dari env, driver `espeak-ng`.
- voiceReader: baca teks channel tertentu ke TTS; filter panjang/profanity opsional.

v0.5 Fitur fun/utility
- dailyMeme: fetch API (reddit/other) dengan de-dupe, jadwal, cache fallback.
- autoReply: pola teks → respon dari config JSON/YAML; hindari loop self-reply.
- activity: rotasi presence/streaming; patuhi rate limit.

v0.6 Tooling & kualitas
- Tes unit/integration (mock Discord/TTS); regresi untuk queue TTS dan scheduler.
- GitHub Actions lint+test; skrip `pnpm dev/test/lint/build`.
- Logging level, sanitasi ID/token, debug flag.

v0.7 Deploy & ops
- `scripts/deploy-termux.sh`: build + pm2 start `dist/index.js`; dokumentasi `pm2 save/resurrect`.
- Hardening: shutdown hook, retry, minimal intents; rate-limit guard (msg <= 5/min per channel, presence change <= 1/5m, voice join throttle 1/30s).

v0.8 Review & backlog
- Jalankan lint/test/build; catat gap/bug; backlog fitur lanjutan (moderasi ringan, dashboard?).

Keputusan awal (dijawab):
- Prioritas: fleksibel, jalan sesuai urutan versi.
- TTS: `espeak-ng` offline (ringan, praktis, nyaris tanpa batas).
- Target runtime: Termux saja.
- Lingkup: single guild privat.
- Batas aktivitas: pesan ≤5/menit per channel, presence ganti ≥5 menit, join voice ≥30 detik.
