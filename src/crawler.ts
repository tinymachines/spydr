import { chromium, firefox, webkit, Browser, Page, devices, BrowserContext } from 'playwright';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { crawlDb, CrawledSite } from './database';

export interface StealthOptions {
  webdriver?: boolean;
  plugins?: boolean;
  languages?: boolean;
  permissions?: boolean;
  chrome?: boolean;
  headersRealistic?: boolean;
  launchArgs?: boolean;
  contextOptions?: boolean;
  all?: boolean;
}

export interface CrawlOptions {
  browser?: 'chromium' | 'firefox' | 'webkit';
  userAgent?: string;
  headless?: boolean;
  timeout?: number;
  viewport?: { width: number; height: number };
  device?: string;
  locale?: string;
  timezone?: string;
  stealth?: boolean | StealthOptions;
  proxy?: {
    server: string;
    username?: string;
    password?: string;
  };
  networkInterface?: string;
  debug?: boolean;
}

export interface CrawlResult {
  url: string;
  urlHash: string;
  rawHtml: string;
  renderedHtml: string;
  textContent: string;
  links: string[];
  screenshotPath: string;
  timestamp: string;
  httpCode: number;
  crawlId: number;
}

function getStealthConfig(stealth?: boolean | StealthOptions): StealthOptions {
  if (stealth === false || stealth === undefined) {
    return {};
  }
  
  if (stealth === true) {
    // Default to all stealth features when stealth is simply true
    return {
      webdriver: true,
      plugins: true,
      languages: true,
      permissions: true,
      chrome: true,
      headersRealistic: true,
      launchArgs: true,
      contextOptions: true,
      all: true
    };
  }
  
  // If stealth.all is true, enable all features
  if (typeof stealth === 'object' && stealth.all) {
    return {
      webdriver: true,
      plugins: true,
      languages: true,
      permissions: true,
      chrome: true,
      headersRealistic: true,
      launchArgs: true,
      contextOptions: true,
      all: true
    };
  }
  
  // Return the specific configuration
  return stealth as StealthOptions;
}

export async function crawlUrl(url: string, options: CrawlOptions = {}): Promise<CrawlResult> {
  // Initialize database
  await crawlDb.initialize();
  
  // Generate URL hash for consistent file naming
  const urlHash = crypto.createHash('sha256').update(url).digest('hex').substring(0, 16);
  
  // Check if we've already crawled this URL
  const existingSite = await crawlDb.getCrawledSite(urlHash);
  if (existingSite) {
    console.log(`URL already crawled: ${url} (hash: ${urlHash})`);
    console.log(`Previous crawl: ${existingSite.timestamp} (ID: ${existingSite.id})`);
    return {
      url,
      urlHash,
      rawHtml: '',
      renderedHtml: '',
      textContent: '',
      links: [],
      screenshotPath: '',
      timestamp: existingSite.timestamp,
      httpCode: existingSite.http_code,
      crawlId: existingSite.id!
    };
  }
  
  // Select browser engine
  const browserType = options.browser || 'chromium';
  const browsers = { chromium, firefox, webkit };
  
  if (!browsers[browserType]) {
    throw new Error(`Invalid browser: ${browserType}. Must be one of: chromium, firefox, webkit`);
  }

  // Determine stealth configuration
  const stealthConfig = getStealthConfig(options.stealth);
  
  // Launch browser with stealth options
  const launchOptions: any = {
    headless: options.headless !== false,
    proxy: options.proxy
  };

  // Add debug logging
  if (options.debug) {
    console.log('Debug: Browser launch options:', JSON.stringify(launchOptions, null, 2));
  }

  // Initialize browser args array
  let browserArgs: string[] = [];

  // Add stealth launch options
  if (stealthConfig.launchArgs) {
    browserArgs = [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--disable-blink-features=AutomationControlled',
      '--disable-ipc-flooding-protection',
      '--disable-renderer-backgrounding',
      '--disable-backgrounding-occluded-windows',
      '--disable-background-timer-throttling',
      '--disable-features=TranslateUI',
      '--disable-default-apps',
      '--disable-extensions',
      '--disable-component-extensions-with-background-pages',
      '--disable-background-networking',
      '--no-first-run',
      '--no-default-browser-check',
      '--no-pings',
      '--password-store=basic',
      '--use-mock-keychain'
    ];
  }

  // Add network interface binding if specified
  if (options.networkInterface) {
    browserArgs.push(`--bind-to-interface=${options.networkInterface}`);
    if (options.debug) {
      console.log(`Debug: Binding to network interface: ${options.networkInterface}`);
    }
  }

  // Set browser args if any were added
  if (browserArgs.length > 0) {
    launchOptions.args = browserArgs;
  }

  const browser: Browser = await browsers[browserType].launch(launchOptions);

  let context: BrowserContext | undefined;
  let page: Page;

  try {
    // Create context with stealth options
    const contextOptions: any = {
      userAgent: options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      locale: options.locale || 'en-US',
      timezoneId: options.timezone || 'America/New_York'
    };

    // Add context stealth options
    if (stealthConfig.contextOptions) {
      contextOptions.permissions = ['geolocation'];
      contextOptions.geolocation = { latitude: 40.7128, longitude: -74.0060 }; // NYC coordinates
      contextOptions.colorScheme = 'light';
      contextOptions.reducedMotion = 'no-preference';
      contextOptions.forcedColors = 'none';
    }

    // Add realistic headers to avoid detection
    if (stealthConfig.headersRealistic) {
      contextOptions.extraHTTPHeaders = {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'max-age=0',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'Upgrade-Insecure-Requests': '1',
        'sec-ch-ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"'
      };
    }

    // Handle device emulation
    if (options.device) {
      const device = devices[options.device];
      if (!device) {
        throw new Error(`Unknown device: ${options.device}`);
      }
      Object.assign(contextOptions, device);
    } else if (options.viewport) {
      contextOptions.viewport = options.viewport;
    }

    context = await browser.newContext(contextOptions);
    page = await context.newPage();

    // Add stealth scripts based on configuration
    if (stealthConfig.webdriver || stealthConfig.plugins || stealthConfig.languages || stealthConfig.permissions || stealthConfig.chrome) {
      await page.addInitScript((config) => {
        // Remove webdriver property
        if (config.webdriver) {
          Object.defineProperty(navigator, 'webdriver', {
            get: () => undefined,
          });
        }

        // Mock plugins
        if (config.plugins) {
          Object.defineProperty(navigator, 'plugins', {
            get: () => [
              {
                0: {
                  type: "application/x-google-chrome-pdf",
                  suffixes: "pdf",
                  description: "Portable Document Format",
                  enabledPlugin: null
                },
                description: "Portable Document Format",
                filename: "internal-pdf-viewer",
                length: 1,
                name: "Chrome PDF Plugin"
              }
            ],
          });
        }

        // Mock languages
        if (config.languages) {
          Object.defineProperty(navigator, 'languages', {
            get: () => ['en-US', 'en'],
          });
        }

        // Mock permissions
        if (config.permissions) {
          const originalQuery = window.navigator.permissions.query;
          window.navigator.permissions.query = (parameters) => (
            parameters.name === 'notifications' ?
              Promise.resolve({ state: Notification.permission } as PermissionStatus) :
              originalQuery(parameters)
          );
        }

        // Mock chrome object
        if (config.chrome) {
          (window as any).chrome = {
            runtime: {},
          };
          
          // Hide automation indicators
          Object.defineProperty(navigator, 'maxTouchPoints', {
            get: () => 1,
          });
        }
      }, stealthConfig);
    }

    // Set navigation timeout
    if (options.timeout) {
      page.setDefaultTimeout(options.timeout);
      if (options.debug) {
        console.log(`Debug: Set page timeout to ${options.timeout}ms`);
      }
    }
    
    // Navigate to the URL and wait for network to be idle
    if (options.debug) {
      console.log(`Debug: Starting navigation to ${url}`);
      console.log(`Debug: Waiting for networkidle event...`);
    }
    
    const response = await page.goto(url, { waitUntil: 'networkidle' });
    const httpCode = response?.status() || 0;
    
    if (options.debug) {
      console.log(`Debug: Navigation completed with HTTP ${httpCode}`);
    }
    
    // Extract raw HTML (initial response)
    const rawHtml = await page.content();
    
    // Wait a bit more for any dynamic content to load
    await page.waitForTimeout(2000);
    
    // Extract rendered HTML (DOM after JS execution)
    const renderedHtml = await page.content();
    
    // Extract all links from the rendered page
    const links = await page.evaluate(() => {
      const anchors = Array.from(document.querySelectorAll('a[href]'));
      return anchors.map(anchor => (anchor as HTMLAnchorElement).href).filter(href => href);
    });
    
    // Extract plain text version of the page
    const textContent = await page.evaluate(() => {
      // Remove script and style elements
      const scripts = document.querySelectorAll('script, style');
      scripts.forEach(el => el.remove());
      
      // Get text content and clean it up
      const text = document.body.innerText || document.body.textContent || '';
      
      // Clean up excessive whitespace
      return text
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
    });
    
    // Create timestamped directory structure: ./crawl-output/YYYYMMDDHH/
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const hourTimestamp = new Date().toISOString().slice(0, 13).replace(/[-T:]/g, '').slice(0, 10);
    const outputDir = path.join(process.cwd(), 'crawl-output', hourTimestamp);
    await fs.mkdir(outputDir, { recursive: true });
    
    // Auto-scroll to capture full page content (with reasonable limit)
    await autoScroll(page);
    
    // Save all files using URL hash instead of timestamp
    const screenshotPath = path.join(outputDir, `crawl-${urlHash}.png`);
    await page.screenshot({ 
      path: screenshotPath, 
      fullPage: true 
    });
    
    const rawHtmlPath = path.join(outputDir, `raw-${urlHash}.html`);
    await fs.writeFile(rawHtmlPath, rawHtml, 'utf-8');
    
    const renderedHtmlPath = path.join(outputDir, `rendered-${urlHash}.html`);
    await fs.writeFile(renderedHtmlPath, renderedHtml, 'utf-8');
    
    const linksPath = path.join(outputDir, `links-${urlHash}.json`);
    await fs.writeFile(linksPath, JSON.stringify(links, null, 2), 'utf-8');
    
    const textPath = path.join(outputDir, `text-${urlHash}.txt`);
    await fs.writeFile(textPath, textContent, 'utf-8');
    
    // Save crawl data to database
    const crawledSite: CrawledSite = {
      timestamp: new Date().toISOString(),
      url: url,
      url_hash: urlHash,
      http_code: httpCode,
      file_directory: hourTimestamp
    };
    
    const crawlId = await crawlDb.insertCrawledSite(crawledSite);
    
    // Save discovered links to database
    if (links.length > 0) {
      await crawlDb.insertLinks(crawlId, links);
    }
    
    console.log(`✓ URL Hash: ${urlHash}`);
    console.log(`✓ HTTP Code: ${httpCode}`);
    console.log(`✓ Raw HTML saved to: ${rawHtmlPath}`);
    console.log(`✓ Rendered HTML saved to: ${renderedHtmlPath}`);
    console.log(`✓ Links (${links.length}) saved to: ${linksPath}`);
    console.log(`✓ Text version saved to: ${textPath}`);
    console.log(`✓ Screenshot saved to: ${screenshotPath}`);
    console.log(`✓ Crawl data saved to database (ID: ${crawlId})`);
    
    return {
      url,
      urlHash,
      rawHtml,
      renderedHtml,
      textContent,
      links,
      screenshotPath,
      timestamp,
      httpCode,
      crawlId
    };
  } finally {
    await context?.close();
    await browser.close();
  }
}

async function autoScroll(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const maxHeight = 50000; // Reasonable limit to prevent infinite scrolling
      
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        
        if (totalHeight >= scrollHeight || totalHeight >= maxHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}