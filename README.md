# Ngetikin Selfbot Discord

Discord **voice-focused selfbot** built with **TypeScript**, designed for lightweight runtime on **Termux (Android)** using PM2 + CI/CD deployment.
Project ini mencakup fitur TTS, voice automation, daily meme system, dan berbagai utilitas untuk pengalaman Discord yang interaktif.

---

## ✨ Features

### 🎧 Voice Automation

* Auto join Voice Channel **4 jam** → rest **10 menit** → repeat.
* State persistence: survive restart Termux.
* Voice activity indicator (fake speaking).

### 🔊 TTS Engine

* Announce user join/leave di VC.
* Baca pesan teks menjadi suara:

  * “Kemi menulis: halo guys…”
* Queue-system agar audio tidak tabrakan.

### 😂 Daily Meme

* Kirim meme pagi, siang, sore.
* Source: Meme API + Lahelu scraping.
* Anti duplicate (hash tracking).

### ⚡ Admin Auto Reply

* Auto reply ke pesan admin.
* Hapus pesan bot sendiri setelah delay.
* Rate-limited + safe-guard.

### 🟢 Custom Activity Rotation

* Presence rotation (listening/playing/watching).
* Bisa diatur via JSON.

### 🧱 Production-Ready Setup

* TypeScript strict mode.
* ESLint, Prettier, Husky + lint-staged.
* GitHub Actions CI/CD pipeline:

  * install → lint → build → optional deploy to Termux.
* PM2 with log rotation.

---

## 📁 Project Structure

```
src/
  config/
  core/
    client.ts
    scheduler.ts
    storage.ts
    voice/
      manager.ts
      tts.ts
      queue.ts
      speaking.ts
  features/
    voiceAutoJoin/
    voiceAnnouncer/
    voiceReader/
    dailyMeme/
    autoReply/
    activity/
  events/
  utils/
  types/
scripts/
  deploy-termux.sh
test/
```

---

## 🚀 Getting Started

### 1. Install dependencies

```sh
pnpm install
```

### 2. Setup environment file

Buat `.env`:

```
TOKEN=
VOICE_CHANNEL_ID=
TARGET_GUILD_ID=
ADMIN_ROLE_IDS=
TTS_LANG=id-ID
```

### 3. Development mode

```sh
pnpm dev
```

### 4. Build

```sh
pnpm build
```

### 5. Run with PM2 (Termux)

```sh
pm2 start dist/index.js --name ngetikin-selfbot
```

---

## 🔐 Warning

This project uses **selfbot techniques**, which are **against Discord TOS**.
Use only on **alt accounts** and at your own risk.

---

## 🧩 Technologies

* TypeScript
* discord.js-selfbot-v13
* @discordjs/voice
* node-cron
* cheerio / puppeteer (optional)
* PM2
* GitHub Actions

---

## 📜 License

Licensed under the MIT License.
See [LICENSE](./LICENSE) for details.
