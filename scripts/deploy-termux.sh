#!/data/data/com.termux/files/usr/bin/bash
# Termux deploy helper for selfbot-discord
set -euo pipefail

APP_NAME="ngetikin-selfbot"
AUTO_PULL_NAME="ngetikin-autopull"
AUTO_PULL_INTERVAL=21600 # 6 hours in seconds
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "[1/6] Updating Termux packages..."
pkg update -y >/dev/null
pkg upgrade -y >/dev/null

echo "[2/6] Installing dependencies (git, nodejs-lts, ffmpeg)..."
pkg install -y git nodejs-lts ffmpeg >/dev/null

echo "[3/6] Enabling corepack and preparing pnpm..."
corepack enable >/dev/null 2>&1 || true
corepack prepare pnpm@10.15.0 --activate >/dev/null
pnpm --version

echo "[4/6] Installing PM2 globally..."
npm install -g pm2 >/dev/null

cd "$REPO_DIR"
echo "[5/6] Installing project deps..."
pnpm install --frozen-lockfile

echo "[6/6] Building..."
pnpm build

echo "[PM2] Starting bot..."
pm2 start dist/index.js --name "$APP_NAME" --update-env || pm2 restart "$APP_NAME" --update-env
pm2 save

echo "[PM2] Setting up auto git pull every 6h..."
pm2 delete "$AUTO_PULL_NAME" >/dev/null 2>&1 || true
pm2 start bash --name "$AUTO_PULL_NAME" -- -lc "cd '$REPO_DIR' && while true; do git pull --rebase; sleep $AUTO_PULL_INTERVAL; done"
pm2 save

echo "Deploy complete. Commands:"
echo "  pm2 status"
echo "  pm2 logs $APP_NAME --lines 50"
echo "  pm2 resurrect    # after reboot"
