# Ngetikin Selfbot Discord

Discord **voice-focused selfbot** built with **TypeScript**, designed for lightweight runtime on **Termux (Android)** using PM2 + CI/CD deployment.
Project ini mencakup fitur TTS, voice automation, daily meme system, dan berbagai utilitas untuk pengalaman Discord yang interaktif.

---

## ✨ Features

### 🎧 Voice Automation (saat ini)

- Auto join Voice Channel target.
- TTS announcer/reader dinonaktifkan sementara (log-only).

### 😀 Auto Emoji Reaction (rencana)

- Channel spesifik (EMOJI_CHANNEL_IDS): auto-react 5–20 emoji acak.
- Prioritas emoji server non-animated; fallback emoji universal.

### 🧠 Mention Chat (Groq)

- Jika GROQ_API_KEY di-set, mention bot (tanpa prefix `say`) akan dibalas via Groq (default model `groq/compound`).
- Rate limit lokal: 1 request / 20 detik per channel.

### 😂 Daily Meme (sederhana)

- Jika MEME_CHANNEL_ID di-set, kirim meme dari candaan-api (default) setiap 6 jam.

### 🟢 Activity Rotation

- Jika ACTIVITY_MESSAGES di-set (comma-separated), rotasi presence tiap 5 menit.
- Opsional rich presence: jika ada `config/activity.json`, bot pakai itu (buttons/gambar/URL) dan melewati rotasi sederhana.

Contoh `config/activity.json`:

```json
{
  "applicationId": "367827983903490050",
  "name": "osu!",
  "details": "MariannE - Yooh",
  "state": "Arcade Game",
  "type": 0,
  "url": "https://www.youtube.com/watch?v=5icFcPkVzMg",
  "largeImage": "https://assets.ppy.sh/beatmaps/1550633/covers/list.jpg",
  "largeText": "Idle",
  "smallImage": "373370493127884800",
  "smallText": "click the circles",
  "buttons": [
    { "label": "Beatmap", "url": "https://osu.ppy.sh/beatmapsets/1391659#osu/2873429" }
  ],
  "customStatus": { "emoji": "😋", "text": "yum" }
}
```

### 😂 Daily Meme

- Kirim meme pagi, siang, sore.
- Source: Meme API + Lahelu scraping.
- Anti duplicate (hash tracking).

### ⚡ Admin Auto Reply

- Auto reply ke pesan admin.
- Hapus pesan bot sendiri setelah delay.
- Rate-limited + safe-guard.

### 🟢 Custom Activity Rotation

- Presence rotation (listening/playing/watching).
- Bisa diatur via JSON.

### 🧱 Production-Ready Setup

- TypeScript strict mode.
- ESLint, Prettier, Husky + lint-staged.
- GitHub Actions CI/CD pipeline:
  - install → lint → build → optional deploy to Termux.

- PM2 with log rotation.

---

## 📁 Project Structure (current skeleton)

```
src/
  core/
    client.ts
    scheduler.ts
    storage.ts
    voice.ts        # stub; to be expanded
  events/           # ready, messageCreate, voiceStateUpdate
  utils/            # env loader (dotenv+zod), logger with redaction
  types/            # env types
  features/         # reserved for voiceAutoJoin, announcer, reader, dailyMeme, autoReply, activity
scripts/
  (placeholder)
test/
  unit/
  integration/
```

---

## 🚀 Getting Started

### 1. Install dependencies

```sh
pnpm install
```

### 2. Setup environment file

Buat `.env` (opsional override di `.env.local`):

```
TOKEN=
VOICE_CHANNEL_ID=
TARGET_GUILD_ID=
ADMIN_ROLE_IDS=
TTS_LANG=id-ID
LOG_LEVEL=info
EMOJI_CHANNEL_IDS=
MEME_CHANNEL_ID=
MEME_API_URL=
MEME_DEBUG_NOW=
ACTIVITY_MESSAGES=
GROQ_API_KEY=
GROQ_MODEL=llama-3.2-1b-preview

# Opsional lain
MEME_API_KEY=
```

### 3. Development mode

```sh
pnpm dev
```

### 4. Lint & format

```sh
pnpm lint
pnpm format:check
```

### 5. Build & run

```sh
pnpm build
pnpm start
```

### 6. Run with PM2 (Termux)

```sh
pm2 start dist/index.js --name ngetikin-selfbot
```

---

## 🔐 Warning

This project uses **selfbot techniques**, which are **against Discord TOS**.
Use only on **alt accounts** and at your own risk.

---

## 🧩 Technologies

- TypeScript
- discord.js-selfbot-v13
- @discordjs/voice
- node-cron
- cheerio / puppeteer (optional)
- PM2
- GitHub Actions

---

## 📜 License

Licensed under the MIT License.
See [LICENSE](./LICENSE) for details.
