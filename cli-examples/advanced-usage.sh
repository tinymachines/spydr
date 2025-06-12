#!/bin/bash

# Advanced Spydr CLI Examples
# Make sure spydr is built: npm run build

echo "=== Advanced Web Crawling Examples ==="

# Environment variable usage
echo "1. Using environment variables:"
export SPYDR_BROWSER=webkit
export SPYDR_USER_AGENT="Research Bot 1.0"
export SPYDR_VIEWPORT=1280x720
./dist/cli.js crawl https://example.com
unset SPYDR_BROWSER SPYDR_USER_AGENT SPYDR_VIEWPORT

echo -e "\n2. Comprehensive crawling setup:"
./dist/cli.js crawl https://example.com \
  --browser firefox \
  --user-agent "Mozilla/5.0 (compatible; SpydrBot/1.0)" \
  --timeout 45000 \
  --device "iPad Pro" \
  --locale "en-US" \
  --timezone "America/New_York"

echo -e "\n3. WebKit with custom settings:"
./dist/cli.js crawl https://example.com \
  --browser webkit \
  --viewport "1440x900" \
  --timeout 30000

echo -e "\n4. Different mobile devices:"
echo "iPhone 12:"
./dist/cli.js crawl https://example.com --device "iPhone 12"

echo "Samsung Galaxy S21:"
./dist/cli.js crawl https://example.com --device "Galaxy S21"

echo "iPad:"
./dist/cli.js crawl https://example.com --device "iPad"

echo -e "\n5. Testing with various user agents:"
./dist/cli.js crawl https://httpbin.org/user-agent \
  --user-agent "curl/7.68.0"

./dist/cli.js crawl https://httpbin.org/user-agent \
  --user-agent "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"

echo "=== Advanced examples completed! ==="