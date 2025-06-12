# Spydr - Advanced Web Crawler

A powerful TypeScript-based web crawler using Playwright with advanced stealth capabilities, database tracking, and comprehensive content extraction.

## 🚀 Features

- **Cross-browser support** (Chromium, Firefox, WebKit)
- **Advanced stealth mode** with granular control over detection-avoidance features
- **Database tracking** with SQLite backend for URL and link management
- **SHA-based file naming** for consistent content organization
- **Screenshot capture** with full-page scrolling
- **Multi-format content extraction** (HTML, text, links, JSON)
- **Network interface binding** for routing control
- **Device emulation** with 50+ predefined devices
- **Proxy support** with authentication
- **Debug mode** for troubleshooting
- **Comprehensive CLI** with extensive options

## 📦 Installation

```bash
# Clone the repository
git clone git@github.com:tinymachines/spydr.git
cd spydr

# Install dependencies
npm install

# Install browser binaries
npx playwright install

# Build the project
npm run build
```

## 🔧 Usage

### Basic Crawling
```bash
# Simple crawl
spydr crawl https://example.com

# With specific browser
spydr crawl https://example.com --browser firefox

# Headless mode with timeout
spydr crawl https://example.com --headless --timeout 15000
```

### Stealth Mode
```bash
# Enable all stealth features
spydr crawl https://example.com --stealth

# Granular stealth control
spydr crawl https://example.com -o "webdriver=on" -o "plugins=on"

# Stealth with selective overrides
spydr crawl https://example.com --stealth -o "headersRealistic=off"

# Get stealth help
spydr help-stealth
```

### Network & Debug Options
```bash
# Bind to specific network interface
spydr crawl https://example.com --interface eth0

# Enable debug logging
spydr crawl https://example.com --debug

# Combined network troubleshooting
spydr crawl https://example.com --interface wlan0 --debug --timeout 20000
```

### Device Emulation & Proxy
```bash
# Mobile device emulation
spydr crawl https://example.com --device "iPhone 12"

# Custom viewport
spydr crawl https://example.com --viewport "1440x900"

# Proxy with authentication
spydr crawl https://example.com --proxy "http://user:pass@proxy.com:8080"
```

## 🎛️ CLI Options

### Core Options
- `--browser <engine>` - Browser engine (chromium, firefox, webkit)
- `--headless` - Run in headless mode (default: true)
- `--timeout <ms>` - Navigation timeout in milliseconds
- `--viewport <size>` - Browser viewport size (e.g., "1920x1080")
- `--device <device>` - Device to emulate (e.g., "iPhone 12")
- `--user-agent <string>` - Custom user agent string

### Network & Interface
- `--interface <name>` - Network interface to bind to (e.g., "eth0", "wlan0")
- `--proxy <url>` - Proxy server (e.g., "http://proxy.example.com:8080")
- `--debug` - Enable debug logging for troubleshooting

### Localization
- `--locale <locale>` - Browser locale (e.g., "en-US")
- `--timezone <zone>` - Browser timezone (e.g., "America/New_York")

### Stealth Features
- `--stealth` - Enable all stealth features
- `-o, --option <key=value>` - Set specific stealth options

#### Available Stealth Options
- `all=on` - Enable all stealth features
- `webdriver=on|off` - Remove navigator.webdriver property
- `plugins=on|off` - Mock navigator.plugins with realistic data
- `languages=on|off` - Mock navigator.languages
- `permissions=on|off` - Mock navigator.permissions API
- `chrome=on|off` - Add chrome runtime object and hide automation indicators
- `headersRealistic=on|off` - Add realistic HTTP headers
- `launchArgs=on|off` - Use stealth browser launch arguments
- `contextOptions=on|off` - Use stealth browser context options

## 📁 Output Structure

Files are organized by timestamp and use SHA hashes for consistent naming:

```
crawl-output/
└── YYYYMMDDHH/
    ├── crawl-{SHA}.png         # Screenshot
    ├── raw-{SHA}.html          # Original HTML response
    ├── rendered-{SHA}.html     # HTML after JavaScript execution
    ├── text-{SHA}.txt          # Plain text content
    └── links-{SHA}.json        # Extracted links
```

## 🗄️ Database

Spydr maintains an SQLite database (`crawl.db`) tracking:
- **crawled_sites** - URLs, timestamps, HTTP codes, file locations
- **links** - Discovered links with references to parent crawls

## 🌐 Environment Variables

Set defaults using environment variables:
```bash
export SPYDR_BROWSER=firefox
export SPYDR_INTERFACE=eth0
export SPYDR_TIMEOUT=30000
export SPYDR_PROXY=http://proxy.example.com:8080
```

## 🚀 Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run development build
npm run dev

# Install browsers for testing
npx playwright install
```

## 📚 Examples

### Complete Stealth Crawl
```bash
spydr crawl https://target-site.com \
  --stealth \
  --interface eth0 \
  --timeout 20000 \
  --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
  --viewport "1920x1080"
```

### Mobile Device Testing
```bash
spydr crawl https://mobile-site.com \
  --device "iPhone 13 Pro" \
  --stealth \
  -o "chrome=off"
```

### Debug Network Issues
```bash
spydr crawl https://problematic-site.com \
  --debug \
  --interface wlan0 \
  --timeout 30000 \
  --headless false
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 📋 Changelog

### v2.0.0 (Latest)
- **Advanced Stealth Mode** - Granular control over 8 detection-avoidance features
- **Database Integration** - SQLite tracking with crawled_sites and links tables
- **SHA-based Naming** - Consistent file naming using URL hashes
- **Network Interface Binding** - Route traffic through specific interfaces
- **Debug Mode** - Comprehensive troubleshooting and logging
- **Text Extraction** - Plain text content extraction alongside HTML
- **Duplicate Detection** - Prevent re-crawling of already processed URLs
- **Improved CLI** - Enhanced help system and error handling

### v1.0.0
- Initial release with basic crawling capabilities
- Multi-browser support
- Device emulation
- Screenshot capture
- HTML and link extraction