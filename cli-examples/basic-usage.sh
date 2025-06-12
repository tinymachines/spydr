#!/bin/bash

# Basic Spydr CLI Examples
# Make sure spydr is built: npm run build

echo "=== Basic Web Crawling Examples ==="

# Simple crawl
echo "1. Basic crawl:"
./dist/cli.js crawl https://example.com

echo -e "\n2. Firefox with custom user agent:"
./dist/cli.js crawl https://httpbin.org/user-agent \
  --browser firefox \
  --user-agent "Mozilla/5.0 (compatible; SpydrBot/1.0)"

echo -e "\n3. Mobile device emulation:"
./dist/cli.js crawl https://whatismyviewport.com \
  --device "iPhone 12"

echo -e "\n4. Custom viewport:"
./dist/cli.js crawl https://example.com \
  --viewport "800x600"

echo -e "\n5. With locale and timezone:"
./dist/cli.js crawl https://example.com \
  --locale "fr-FR" \
  --timezone "Europe/Paris"

echo -e "\n6. Increased timeout for slow sites:"
./dist/cli.js crawl https://example.com \
  --timeout 60000

echo "=== Examples completed! ==="