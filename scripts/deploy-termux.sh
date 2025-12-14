#!/data/data/com.termux/files/usr/bin/bash
# Termux deploy helper for selfbot-discord
set -euo pipefail

APP_NAME="ngetikin-selfbot"
AUTO_PULL_NAME="ngetikin-autopull"
AUTO_RESTART_NAME="ngetikin-autorestart"
AUTO_INTERVAL=14400 # default 4 hours in seconds
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "[1/6] Updating Termux packages..."
pkg update -y >/dev/null
pkg upgrade -y >/dev/null

echo "[2/6] Checking dependencies (git, nodejs-lts, ffmpeg)..."
command -v git >/dev/null 2>&1 || pkg install -y git >/dev/null
command -v node >/dev/null 2>&1 || pkg install -y nodejs-lts >/dev/null
command -v ffmpeg >/dev/null 2>&1 || pkg install -y ffmpeg >/dev/null

echo "[3/6] Enabling corepack and preparing pnpm..."
corepack enable >/dev/null 2>&1 || true
corepack prepare pnpm@10.23.0 --activate >/dev/null
pnpm --version

echo "[4/6] Ensuring PM2 globally..."
command -v pm2 >/dev/null 2>&1 || npm install -g pm2 >/dev/null

cd "$REPO_DIR"
echo "[5/6] Installing project deps..."
pnpm install --frozen-lockfile

echo "[6/6] Building..."
pnpm build

echo "[PM2] Starting bot..."
pm2 start dist/index.js --name "$APP_NAME" --update-env --time --log-date-format "YYYY-MM-DD HH:mm:ss" --merge-logs || pm2 restart "$APP_NAME" --update-env --time --log-date-format "YYYY-MM-DD HH:mm:ss" --merge-logs
pm2 save

echo "[PM2] Setting log rotation to 10M..."
pm2 set pm2:logs/max_size 10M >/dev/null

echo "[PM2] Setting up auto git pull every $((AUTO_INTERVAL / 3600))h..."
pm2 delete "$AUTO_PULL_NAME" >/dev/null 2>&1 || true
pm2 start bash --name "$AUTO_PULL_NAME" -- -lc "cd '$REPO_DIR' && while true; do git pull --rebase; sleep $AUTO_INTERVAL; done"

echo "[PM2] Setting up periodic restart every $((AUTO_INTERVAL / 3600))h..."
pm2 delete "$AUTO_RESTART_NAME" >/dev/null 2>&1 || true
pm2 start bash --name "$AUTO_RESTART_NAME" -- -lc "while true; do sleep $AUTO_INTERVAL; pm2 restart '$APP_NAME' --update-env; done"
pm2 save

echo "Deploy complete. Commands:"
echo "  pm2 status"
echo "  pm2 logs $APP_NAME --lines 100"
echo "  pm2 resurrect    # after reboot"
