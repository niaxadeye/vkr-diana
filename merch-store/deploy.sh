#!/bin/bash

set -e

cd /var/www/merch-store

echo "Pull latest code..."
git pull origin main

echo "Install and build server..."
cd /var/www/merch-store/server
npm install
npx prisma db push
npx prisma generate
npm run build
pm2 restart merch-server --update-env

echo "Install and build client..."
cd /var/www/merch-store/client
npm install
npm run build

echo "Reload nginx..."
systemctl reload nginx

echo "Deploy completed."