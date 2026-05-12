#!/bin/bash

set -e

PROJECT_DIR="/var/www/vkr-diana/merch-store"

echo "Go to repository..."
cd /var/www/vkr-diana

echo "Pull latest code..."
git pull origin main

echo "Install and build server..."
cd "$PROJECT_DIR/server"
npm install
npx prisma db push
npx prisma generate
npm run build
pm2 restart merch-server --update-env

echo "Install and build client..."
cd "$PROJECT_DIR/client"
npm install
npm run build

echo "Reload nginx..."
systemctl reload nginx

echo "Deploy completed."