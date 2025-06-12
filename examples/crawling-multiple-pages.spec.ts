import { test, expect } from '@playwright/test';

test.describe('Web Crawling Example', () => {
  test('crawl through multiple pages following links', async ({ page }) => {
    const visitedUrls = new Set<string>();
    const maxPages = 5;
    const baseUrl = 'https://playwright.dev';
    
    async function crawlPage(url: string, depth: number = 0) {
      if (visitedUrls.has(url) || visitedUrls.size >= maxPages || depth > 2) {
        return;
      }
      
      visitedUrls.add(url);
      console.log(`Crawling: ${url} (depth: ${depth})`);
      
      try {
        await page.goto(url, { waitUntil: 'networkidle' });
        
        const links = await page.$$eval('a[href]', (anchors) => 
          anchors
            .map(a => a.getAttribute('href'))
            .filter(href => href && href.startsWith('/'))
        );
        
        for (const link of links.slice(0, 3)) {
          const absoluteUrl = new URL(link, baseUrl).href;
          if (absoluteUrl.startsWith(baseUrl)) {
            await crawlPage(absoluteUrl, depth + 1);
          }
        }
      } catch (error) {
        console.error(`Failed to crawl ${url}:`, error);
      }
    }
    
    await crawlPage(baseUrl);
    
    console.log('Crawled pages:', Array.from(visitedUrls));
    expect(visitedUrls.size).toBeGreaterThan(0);
  });

  test('navigate through pagination', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/api-mocking');
    
    const results: string[] = [];
    let hasNextPage = true;
    let pageNum = 1;
    
    while (hasNextPage && pageNum <= 3) {
      console.log(`Processing page ${pageNum}`);
      
      const items = await page.$$eval('.item', elements => 
        elements.map(el => el.textContent || '')
      );
      results.push(...items);
      
      const nextButton = page.locator('button:has-text("Next")');
      hasNextPage = await nextButton.isEnabled();
      
      if (hasNextPage) {
        await nextButton.click();
        await page.waitForLoadState('networkidle');
        pageNum++;
      }
    }
    
    console.log(`Collected ${results.length} items across ${pageNum} pages`);
  });
});