# Project Blueprint – Discord Voice Selfbot (Fresh Start)

## 1. Tujuan Proyek

Membangun selfbot Discord berbasis TypeScript yang fokus pada fitur suara: auto join VC dengan jadwal, pengumuman join/leave via TTS, pembacaan pesan teks ke suara, pengiriman meme harian tiga kali, auto-reply admin yang cepat menghapus, custom activity rotation, hingga indikasi voice speaking. Target runtime adalah Termux di Redmi 6A, sehingga solusi harus ringan, toleran terhadap restart, dan mudah dipantau.

---

## 2. Stack & Tooling

- **Runtime**: Node.js ≥ 18 (pertimbangkan 20 untuk `fetch` native), pnpm.
- **Language**: TypeScript dengan `strict` mode.
- **Discord SDK**: `discord.js-selfbot-v13` (atau fork yang mendukung voice). Untuk audio, pertimbangkan `@discordjs/voice` atau `play-dl` + adapter custom.
- **TTS Providers**:
  - Primary: Google TTS (unofficial API) atau Azure (jika punya kredensial).
  - Fallback: Coqui TTS lokal (caching audio).
- **Scraping**: `node-fetch`/`axios` untuk API meme, `cheerio` untuk HTML parsing Lahelu (puppeteer jika butuh JS rendering).
- **Scheduling**: `node-cron` atau `cron` library lain untuk timer join VC & meme.
- **Storage/Persistence**:
  - JSON/lowdb atau SQLite (via `better-sqlite3`) untuk menyimpan state (timer, cooldown, anti-duplicate meme).
- **Tooling**: ESLint + Prettier + Husky (pre-commit lint-staged), GitHub Actions (install → lint → test → build → optional deploy script).
- **Process Manager**: PM2 di Termux dengan log rotation.

---

## 3. Modul dan Folder Struktur (Usulan)

```
src/
  config/          # loader env + schema
  core/
    client.ts      # Discord client bootstrap + event wiring
    scheduler.ts   # cron manager (meme schedule, VC cycle)
    storage.ts     # persistence helper (JSON/SQLite)
    voice/
      manager.ts   # join/leave logic + state machine
      tts.ts       # TTS provider wrapper + caching
      queue.ts     # queue audio playback
      speaking.ts  # inject silence + speaking indicator
  features/
    voiceAutoJoin/
      service.ts   # join 4h, rest 10m, persistence
    voiceAnnouncer/
      handler.ts   # join/leave event -> TTS phrase
    voiceReader/
      handler.ts   # text message -> TTS (filter length, rate limit)
    dailyMeme/
      service.ts   # fetch random meme (API + Lahelu scraping), anti duplicate
    autoReply/
      handler.ts   # admin auto-reply w/ template + self delete + rate limit
    activity/
      rotator.ts   # custom presence rotation (listening/playing/watching)
  commands/        # (optional) text commands jika masih relevan
  events/
    messageCreate.ts
    voiceStateUpdate.ts
    ready.ts
    presenceUpdate.ts (optional)
  utils/
    logger.ts
    rateLimiter.ts
    envValidator.ts
    httpClient.ts
  types/
tests/
  unit/
  integration/
scripts/
  deploy-termux.sh (SSH deploy to Redmi)
  validateEnv.ts
```

---

## 4. Fitur Detail & Catatan Implementasi

### 4.1 VC Auto Join + Rest

- **Workflow**: join voice channel (ID dari env) selama 4 jam → disconnect 10 menit → repeat.
- **State Persistence**: simpan `nextJoinTime`, `nextLeaveTime`, `currentState` ke storage (JSON/DB). Saat bot restart, baca state dan sesuaikan timer.
- **Implementation**:
  - `VoiceCycleService` dengan state machine (`IDLE`, `ON_VC`, `RESTING`).
  - Gunakan `setTimeout` + cron fallback, atau `node-cron` job yang memeriksa state tiap menit.
  - Handle error join (channel missing, permission denied), log minimal.

### 4.2 Voice Join/Leave Announcer

- **Trigger**: `voiceStateUpdate`.
- **Logic**:
  - Deteksi user join/leave target VC.
  - Format text (mis. “Kemi join voice”) sesuai bahasa/voice env.
  - Kirim ke TTS queue → putar di VC.
- **Config**: `ANNOUNCER_VOICE`, `ANNOUNCER_LANG`.
- **Rate limit**: cegah spam jika user spam connect/disconnect.

### 4.3 Voice Message Reader

- **Trigger**: `messageCreate` (text). Filter per channel + panjang pesan.
- **Flow**:
  - Format “{username} menulis: {content}”.
  - Sanitasi mention/simbol sensitif.
  - Masukkan ke TTS queue (per channel).
- **Rate limiting**: per user/per channel.

### 4.4 Daily Meme Sender (3x/day)

- **Schedule**: misal 06:00, 12:00, 18:00 WIB (node-cron).
- **Sources**: Meme API (Reddit, MemeAPI) + scraping Lahelu.
- **Anti duplicate**: simpan hash URL di storage.
- **Randomization**: pilih sumber acak tiap slot.
- **Resiliency**: fallback text jika API down.

### 4.5 Auto Reply for Admin Only

- **Trigger**: `messageCreate`.
- **Logic**:
  - Cek role admin (env `ADMIN_ROLE_IDS`).
  - Reply template (bisa random). Hapus sendiri setelah delay pendek.
  - Rate limit (mis. 1 reply / 30 detik per admin).

### 4.6 Custom Activity Rotator

- **Config**: list aktivitas (type + text) di JSON/env.
- **Rotation**: update presence tiap X menit.
- **Implementation**: service `PresenceRotator` pakai `setInterval`.

### 4.7 Voice Activity Indicator

- **Goal**: tunjukkan “speaking” saat audio/tts jalan.
- **Approach**:
  - Ketika queue playing, kirim silent packets (Silence hack) bersamaan audio.
  - Pastikan modul audio memicu speaking on/off.

---

## 5. Supporting Systems

### 5.1 Storage

- JSON/lowdb atau SQLite untuk state (voice schedule, meme history, rate limit).
- Abstraksi `StorageService` supaya mudah ganti backend.

### 5.2 Logging

- Pino dengan level minimal (info/error). Format ringkas untuk Termux.
- Tambah context per modul (voice, meme, tts) agar mudah debug.

### 5.3 Rate Limiter

- Utility sederhana (token bucket/sliding window) untuk auto reply, TTS, meme.
- Simpan state in-memory + snapshot ke storage jika perlu survive restart.

### 5.4 Env Validation

- Schema memeriksa:
  - TOKEN wajib, voice IDs valid, TTS config ada.
  - Depedensi (mis. AUTO_STATUS_ROTATOR ⇒ VOICE_CHANNEL_ID).
  - CLI `pnpm validate:env -- --all --json --fail-on-warn`.

### 5.5 CI/CD

- GitHub Actions job:
  1. Checkout + Node 20 + pnpm install.
  2. `pnpm lint`.
  3. `pnpm test`.
  4. `pnpm build`.
  5. (Opsional) jalankan deploy script (SSH ke Termux).
- Tambahkan badge di README.

### 5.6 Deploy ke Termux

- Script `scripts/deploy-termux.sh`:
  ```
  #!/bin/sh
  ssh user@termux "
    cd /path/to/selfbot &&
    git pull &&
    pnpm install --frozen-lockfile &&
    pnpm build &&
    pm2 restart selfbot
  "
  ```
- Dokumentasikan pengaturan PM2 (watch, log rotation).

---

## 6. Security & Anti-Detection

- `.env` wajib, jangan commit.
- Anti-spam:
  - throttle announcer dan voice reader.
  - randomize delay auto reply.
  - batasi channel/role target.
- Logging sanitasi ID/token.

---

## 7. Non-Functional Target

- **Ringan**: hindari puppeteer berat kecuali perlu; caching TTS audio.
- **Stabil**: semua timer harus handle restart (persist state).
- **Sumber daya**: auto trim caches.
- **Error handling**: tangkap exception di tiap feature, log ringkas.

---

## 8. Implementation Phasing

1. **Core bootstrap**: client, env loader, logger, storage.
2. **Voice manager + scheduler (4h/10m)**.
3. **TTS subsystem + queue** (announcer & reader share).
4. **Daily meme 3x/day** (multi sources + anti duplicates).
5. **Auto reply admin + rate limit**.
6. **Activity rotator + voice indicator**.
7. **CI/CD + deploy script**.
8. **Hardening**: tests (unit/integration), doc, monitoring.

Blueprint ini menjadi acuan saat membangun repo baru agar kebutuhan audio, scheduler, dan automation tercakup sejak awal.
