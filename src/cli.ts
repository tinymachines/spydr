#!/usr/bin/env node

import { Command } from 'commander';
import { crawlUrl, CrawlOptions, StealthOptions } from './crawler';

// Helper function to collect multiple option values
function collect(value: string, previous: string[]) {
  return previous.concat([value]);
}

const program = new Command();

program
  .name('spydr')
  .description('Web crawling tool powered by Playwright')
  .version('1.0.0');

// Helper function to show stealth options help
function showStealthHelp() {
  console.log(`
Stealth Mode Options:
  --stealth                Enable all stealth features (equivalent to --stealth --all)
  -o, --option <key=value> Set specific stealth option

Available Stealth Features:
  all=on                   Enable all stealth features (default when --stealth is used)
  webdriver=on|off         Remove navigator.webdriver property
  plugins=on|off           Mock navigator.plugins with realistic data
  languages=on|off         Mock navigator.languages
  permissions=on|off       Mock navigator.permissions API
  chrome=on|off            Add chrome runtime object and hide automation indicators
  headersRealistic=on|off  Add realistic HTTP headers
  launchArgs=on|off        Use stealth browser launch arguments
  contextOptions=on|off    Use stealth browser context options
  rootDomainPreload=on|off Preload root domain before crawling target URL

Examples:
  spydr crawl https://example.com --stealth
  spydr crawl https://example.com -o "webdriver=on" -o "plugins=on"
  spydr crawl https://example.com --stealth -o "headersRealistic=off"
  spydr crawl https://meatball.ai/pasta?search=rigatoni -o "rootDomainPreload=on"
  spydr help-stealth       Show this help message
`);
}

program
  .command('help-stealth')
  .description('Show detailed help for stealth mode options')
  .action(() => {
    showStealthHelp();
  });

program
  .command('crawl')
  .description('Crawl a URL and extract content')
  .argument('<url>', 'URL to crawl')
  .option('-b, --browser <browser>', 'Browser to use (chromium, firefox, webkit)', process.env.SPYDR_BROWSER || 'chromium')
  .option('-u, --user-agent <userAgent>', 'Custom user agent string', process.env.SPYDR_USER_AGENT)
  .option('--headless', 'Run browser in headless mode (default: true)', process.env.SPYDR_HEADLESS !== 'false')
  .option('--timeout <ms>', 'Navigation timeout in milliseconds', process.env.SPYDR_TIMEOUT || '30000')
  .option('--viewport <size>', 'Viewport size (e.g., "1920x1080")', process.env.SPYDR_VIEWPORT || '1920x1080')
  .option('--device <device>', 'Emulate device (e.g., "iPhone 12")', process.env.SPYDR_DEVICE)
  .option('--locale <locale>', 'Browser locale (e.g., "en-US")', process.env.SPYDR_LOCALE)
  .option('--timezone <timezone>', 'Browser timezone (e.g., "America/New_York")', process.env.SPYDR_TIMEZONE)
  .option('--proxy <proxy>', 'Proxy server (e.g., "http://proxy.example.com:8080")', process.env.SPYDR_PROXY)
  .option('--interface <interface>', 'Network interface to bind to (e.g., "eth0", "wlan0")', process.env.SPYDR_INTERFACE)
  .option('--debug', 'Enable debug logging')
  .option('--stealth', 'Enable all stealth features')
  .option('-o, --option <key=value>', 'Set stealth option (use "help-stealth" for details)', collect, [])
  .option('--cookies-persistent', 'Save cookies for domain reuse between crawl sessions')
  .option('--overwrite-data', 'Overwrite existing records for this URL/hash instead of skipping')
  .action(async (url: string, options) => {
    try {
      // Parse viewport
      let viewport = undefined;
      if (options.viewport && !options.device) {
        const [width, height] = options.viewport.split('x').map(Number);
        if (width && height) {
          viewport = { width, height };
        }
      }

      // Parse proxy
      let proxy = undefined;
      if (options.proxy) {
        const proxyUrl = new URL(options.proxy);
        proxy = {
          server: options.proxy,
          username: proxyUrl.username || undefined,
          password: proxyUrl.password || undefined
        };
      }

      // Parse stealth options
      let stealth: boolean | StealthOptions = false;
      if (options.stealth || options.option.length > 0) {
        if (options.stealth && options.option.length === 0) {
          // Simple --stealth flag defaults to all features
          stealth = true;
        } else {
          // Parse individual options
          const stealthConfig: StealthOptions = {};
          
          // If --stealth is used, default to all features, then override with specific options
          if (options.stealth) {
            stealthConfig.all = true;
          }
          
          // Parse -o options
          for (const opt of options.option) {
            const [key, value] = opt.split('=');
            if (!key || !value) {
              console.error(`Invalid option format: ${opt}. Use key=value format.`);
              process.exit(1);
            }
            
            const boolValue = value.toLowerCase() === 'on' || value.toLowerCase() === 'true';
            
            switch (key.toLowerCase()) {
              case 'all':
                stealthConfig.all = boolValue;
                break;
              case 'webdriver':
                stealthConfig.webdriver = boolValue;
                break;
              case 'plugins':
                stealthConfig.plugins = boolValue;
                break;
              case 'languages':
                stealthConfig.languages = boolValue;
                break;
              case 'permissions':
                stealthConfig.permissions = boolValue;
                break;
              case 'chrome':
                stealthConfig.chrome = boolValue;
                break;
              case 'headersrealistic':
              case 'headers-realistic':
                stealthConfig.headersRealistic = boolValue;
                break;
              case 'launchargs':
              case 'launch-args':
                stealthConfig.launchArgs = boolValue;
                break;
              case 'contextoptions':
              case 'context-options':
                stealthConfig.contextOptions = boolValue;
                break;
              case 'rootdomainpreload':
              case 'root-domain-preload':
                stealthConfig.rootDomainPreload = boolValue;
                break;
              default:
                console.error(`Unknown stealth option: ${key}`);
                console.log('Use "spydr help-stealth" to see available options.');
                process.exit(1);
            }
          }
          
          stealth = stealthConfig;
        }
      }

      const crawlOptions: CrawlOptions = {
        browser: options.browser,
        userAgent: options.userAgent,
        headless: options.headless,
        timeout: parseInt(options.timeout),
        viewport,
        device: options.device,
        locale: options.locale,
        timezone: options.timezone,
        stealth,
        proxy,
        networkInterface: options.interface,
        debug: options.debug,
        cookiesPersistent: options.cookiesPersistent,
        overwriteData: options.overwriteData
      };

      console.log(`Crawling: ${url}`);
      console.log(`Browser: ${options.browser}`);
      if (options.userAgent) console.log(`User Agent: ${options.userAgent}`);
      if (options.device) console.log(`Device: ${options.device}`);
      if (options.interface) console.log(`Network Interface: ${options.interface}`);
      if (options.debug) console.log(`Debug: Enabled`);
      
      // Show stealth configuration
      if (stealth) {
        if (stealth === true) {
          console.log(`Stealth: All features enabled`);
        } else {
          const enabledFeatures = Object.entries(stealth)
            .filter(([_, value]) => value === true)
            .map(([key, _]) => key);
          if (enabledFeatures.length > 0) {
            console.log(`Stealth: ${enabledFeatures.join(', ')}`);
          }
        }
      }
      
      await crawlUrl(url, crawlOptions);
      console.log('Crawling completed successfully');
    } catch (error) {
      console.error('Error during crawling:', error);
      process.exit(1);
    }
  });

program.parse();