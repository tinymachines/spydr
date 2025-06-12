import { test, expect } from '@playwright/test';

test.describe('Text and Link Extraction', () => {
  test('extract all text content from a page', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    const allText = await page.textContent('body');
    console.log('Page text length:', allText?.length);
    
    const headings = await page.$$eval('h1, h2, h3', elements => 
      elements.map(el => ({
        tag: el.tagName,
        text: el.textContent?.trim()
      }))
    );
    console.log('Headings found:', headings);
    
    const paragraphs = await page.$$eval('p', elements => 
      elements.map(el => el.textContent?.trim()).filter(text => text && text.length > 50)
    );
    console.log(`Found ${paragraphs.length} substantial paragraphs`);
  });

  test('extract all links from a page', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    const links = await page.$$eval('a[href]', anchors => 
      anchors.map(anchor => ({
        text: anchor.textContent?.trim(),
        href: anchor.getAttribute('href'),
        target: anchor.getAttribute('target')
      }))
    );
    
    const internalLinks = links.filter(link => 
      link.href?.startsWith('/') || link.href?.includes('playwright.dev')
    );
    const externalLinks = links.filter(link => 
      link.href?.startsWith('http') && !link.href?.includes('playwright.dev')
    );
    
    console.log(`Total links: ${links.length}`);
    console.log(`Internal links: ${internalLinks.length}`);
    console.log(`External links: ${externalLinks.length}`);
    
    console.log('Sample external links:', externalLinks.slice(0, 5));
  });

  test('extract structured data from a page', async ({ page }) => {
    await page.goto('https://playwright.dev/docs/intro');
    
    const navigationItems = await page.$$eval('.navbar__items a', items =>
      items.map(item => ({
        text: item.textContent?.trim(),
        href: item.getAttribute('href')
      }))
    );
    
    const codeBlocks = await page.$$eval('pre code', blocks =>
      blocks.map(block => ({
        language: block.className,
        code: block.textContent
      }))
    );
    
    const metadata = await page.evaluate(() => {
      return {
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.getAttribute('content'),
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
        ogImage: document.querySelector('meta[property="og:image"]')?.getAttribute('content')
      };
    });
    
    console.log('Page metadata:', metadata);
    console.log(`Found ${codeBlocks.length} code examples`);
    console.log(`Navigation items: ${navigationItems.length}`);
  });

  test('extract data from tables', async ({ page }) => {
    await page.goto('https://en.wikipedia.org/wiki/List_of_countries_by_population_(United_Nations)');
    
    const tableData = await page.$$eval('table.wikitable tr', rows => {
      return rows.slice(1, 11).map(row => {
        const cells = row.querySelectorAll('td');
        return {
          rank: cells[0]?.textContent?.trim(),
          country: cells[1]?.textContent?.trim(),
          population: cells[2]?.textContent?.trim()
        };
      });
    });
    
    console.log('Top 10 countries by population:', tableData);
  });

  test('extract and save data to JSON', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    const pageData = await page.evaluate(() => {
      const getLinks = () => Array.from(document.querySelectorAll('a[href]')).map(a => ({
        text: a.textContent?.trim(),
        href: a.getAttribute('href')
      }));
      
      const getImages = () => Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt,
        width: img.width,
        height: img.height
      }));
      
      const getMetaTags = () => {
        const metas: Record<string, string> = {};
        document.querySelectorAll('meta').forEach(meta => {
          const name = meta.getAttribute('name') || meta.getAttribute('property');
          const content = meta.getAttribute('content');
          if (name && content) {
            metas[name] = content;
          }
        });
        return metas;
      };
      
      return {
        url: window.location.href,
        title: document.title,
        meta: getMetaTags(),
        headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
          level: h.tagName,
          text: h.textContent?.trim()
        })),
        links: getLinks(),
        images: getImages(),
        timestamp: new Date().toISOString()
      };
    });
    
    const fs = require('fs').promises;
    await fs.writeFile('extracted-data.json', JSON.stringify(pageData, null, 2));
    console.log('Data saved to extracted-data.json');
  });
});