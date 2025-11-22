#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

echo "Using Node version: $(node -v)"

echo "Installing dependencies..."
pnpm install --frozen-lockfile

echo "Building..."
pnpm build

APP_NAME="ngetikin-selfbot"
ENTRY="dist/index.js"

echo "Starting PM2..."
pm2 start "$ENTRY" --name "$APP_NAME"
pm2 save

echo "Done. Use 'pm2 logs $APP_NAME' to view logs and 'pm2 resurrect' after reboot."
