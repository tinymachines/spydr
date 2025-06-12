# Spydr - Advanced Web Crawler

A powerful TypeScript-based web crawler using Playwright with advanced stealth capabilities, database tracking, and comprehensive content extraction.

## 🚀 Features

- **Cross-browser support** (Chromium, Firefox, WebKit)
- **Advanced stealth mode** with granular control over 9 detection-avoidance features
- **Root domain preloading** for session establishment and cookie handling
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

### Prerequisites - System Dependencies

Playwright requires certain system libraries to run browsers. Install them based on your distribution:

#### Ubuntu/Debian (20.04/22.04/24.04)
```bash
# Update package list
sudo apt update

# Install required dependencies
sudo apt install -y \
  libgtk-4-1 \
  libwoff1 \
  libvpx7 \
  libgstreamer-plugins-bad1.0-0 \
  libflite1 \
  libharfbuzz-icu0 \
  libenchant-2-2 \
  libsecret-1-0 \
  libhyphen0 \
  libmanette-0.2-0 \
  libgles2 \
  libx264-dev \
  libgstreamer1.0-0 \
  libgstreamer-plugins-base1.0-0

# Alternative: Install all Playwright dependencies automatically
npx playwright install-deps
```

#### Fedora/RHEL/CentOS
```bash
# Install required dependencies
sudo dnf install -y \
  gtk4 \
  woff2 \
  libvpx \
  gstreamer1-plugins-bad-free \
  flite \
  harfbuzz-icu \
  enchant2 \
  libsecret \
  hyphen \
  libmanette \
  mesa-libGLES \
  x264-libs

# Alternative: Install all Playwright dependencies automatically
npx playwright install-deps
```

#### Arch Linux
```bash
# Install required dependencies
sudo pacman -S --needed \
  gtk4 \
  woff2 \
  libvpx \
  gst-plugins-bad \
  flite \
  harfbuzz-icu \
  enchant \
  libsecret \
  hyphen \
  libmanette \
  libgles \
  x264
```

#### Alpine Linux
```bash
# Install required dependencies
apk add --no-cache \
  gtk4.0 \
  woff2 \
  libvpx \
  gst-plugins-bad \
  flite \
  harfbuzz-icu \
  enchant2 \
  libsecret \
  hyphen \
  libmanette \
  mesa-gles \
  x264-libs
```

### Project Installation

```bash
# Clone the repository
git clone git@github.com:tinymachines/spydr.git
cd spydr

# Install Node.js dependencies
npm install

# Install browser binaries
npx playwright install

# If you encounter dependency issues, run:
npx playwright install-deps

# Build the project
npm run build
```

### Docker Alternative

If you prefer to avoid system dependencies, you can run Spydr in Docker:

#### Using Docker Compose (Recommended)
```bash
# Clone the repository
git clone git@github.com:tinymachines/spydr.git
cd spydr

# Build and start container
docker-compose up -d

# Run crawls using the container
docker-compose exec spydr node dist/cli.js crawl https://example.com --stealth

# Run with debug mode
docker-compose exec spydr node dist/cli.js crawl https://example.com --debug

# Stop container
docker-compose down
```

#### Using Docker directly
```bash
# Build the image
docker build -t spydr .

# Run a crawl
docker run --rm \
  -v $(pwd)/crawl-output:/app/crawl-output \
  -v $(pwd)/crawl.db:/app/crawl.db \
  spydr node dist/cli.js crawl https://example.com --stealth

# Run interactively
docker run -it --rm \
  -v $(pwd)/crawl-output:/app/crawl-output \
  spydr bash
```

#### Pre-built Docker Image
```bash
# Pull from registry (when available)
docker pull tinymachines/spydr:latest

# Run directly
docker run --rm \
  -v $(pwd)/crawl-output:/app/crawl-output \
  tinymachines/spydr:latest \
  node dist/cli.js crawl https://example.com --stealth
```

### Troubleshooting Dependencies

1. **Check missing dependencies:**
   ```bash
   npx playwright install --dry-run
   ```

2. **Install specific browser dependencies:**
   ```bash
   # For Chromium only
   npx playwright install-deps chromium
   
   # For Firefox only
   npx playwright install-deps firefox
   
   # For WebKit only
   npx playwright install-deps webkit
   ```

3. **Verify installation:**
   ```bash
   # Test basic functionality
   npx playwright --version
   
   # Run a simple test
   node -e "console.log(require('playwright').chromium.executablePath())"
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

# Root domain preloading for session establishment
spydr crawl https://meatball.ai/pasta?search=rigatoni -o "rootDomainPreload=on"

# Get stealth help
spydr help-stealth
```

### Root Domain Preloading

Root domain preloading is a stealth feature that helps establish browser sessions and cookies by visiting the root domain before crawling the target URL. This technique can help bypass certain detection mechanisms and maintain consistent browser state.

#### How It Works
1. **Extract root domain**: From `https://example.com/deep/page` → `https://example.com`
2. **Preload root domain**: Navigate to root domain first, accept all cookies
3. **Maintain session**: Use same browser context for target URL crawl
4. **Preserve cookies**: All cookies and session data remain consistent

#### Example Usage
```bash
# Enable root domain preloading specifically
spydr crawl https://site.com/protected/page -o "rootDomainPreload=on" --debug

# Included automatically with full stealth mode
spydr crawl https://site.com/api/data --stealth --debug

# Combine with other stealth features
spydr crawl https://site.com/content -o "rootDomainPreload=on" -o "webdriver=on"
```

#### When to Use
- **Cookie-dependent sites**: Sites that require initial cookie establishment
- **Session-based authentication**: Pages that need session context from root domain
- **Anti-bot detection**: Sites that check for consistent browsing patterns
- **Complex web applications**: SPAs that initialize state from root domain

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
- `rootDomainPreload=on|off` - Preload root domain before crawling target URL

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

## 🛠️ Troubleshooting

### Common Issues

#### Missing System Dependencies
```bash
# Error: "Host system is missing dependencies to run browsers"
# Solution: Install system dependencies for your distribution

# Ubuntu/Debian
sudo apt install -y $(npx playwright install-deps --dry-run 2>&1 | grep -oP '(?<=apt install -y ).*')

# Or use the automatic installer
npx playwright install-deps
```

#### Browser Installation Issues
```bash
# Error: "Executable doesn't exist at /path/to/browser"
# Solution: Reinstall browsers
npx playwright install --force

# Install specific browser only
npx playwright install chromium --force
```

#### Permission Issues
```bash
# Error: "EACCES: permission denied"
# Solution: Check file permissions
chmod +x dist/cli.js

# Or run with node directly
node dist/cli.js crawl https://example.com
```

#### Network/Timeout Issues
```bash
# Use debug mode to diagnose
spydr crawl https://example.com --debug --timeout 30000

# Try different network interface
spydr crawl https://example.com --interface eth0 --debug

# Test with simple sites first
spydr crawl https://httpbin.org/get --debug
```

#### Database Issues
```bash
# Error: "SQLITE_CANTOPEN" or similar
# Solution: Check file permissions and disk space
ls -la crawl.db
df -h .

# Remove and recreate database
rm crawl.db*
spydr crawl https://example.com
```

### Getting Help

1. **Enable debug mode** for detailed logging:
   ```bash
   spydr crawl https://example.com --debug
   ```

2. **Check system requirements**:
   ```bash
   node --version  # Should be 16+
   npx playwright --version
   ```

3. **Verify installation**:
   ```bash
   npm run build
   node dist/cli.js --help
   ```

4. **Test with minimal configuration**:
   ```bash
   spydr crawl https://httpbin.org/get --headless --timeout 10000
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
- **Advanced Stealth Mode** - Granular control over 9 detection-avoidance features
- **Root Domain Preloading** - Establish sessions by visiting root domain before target URL
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