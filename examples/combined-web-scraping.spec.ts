import { test, expect } from '@playwright/test';
import { join } from 'path';

test.describe('Complete Web Scraping Example', () => {
  test('scrape product listings with screenshots and data extraction', async ({ page }) => {
    const baseUrl = 'https://demo.playwright.dev/todomvc';
    const scrapedData: any[] = [];
    
    console.log('Starting web scraping session...');
    
    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: join('screenshots', 'initial-page.png'),
      fullPage: true 
    });
    
    const todos = ['Buy groceries', 'Read Playwright docs', 'Write test cases'];
    for (const todo of todos) {
      await page.fill('.new-todo', todo);
      await page.press('.new-todo', 'Enter');
    }
    
    await page.screenshot({ 
      path: join('screenshots', 'todos-added.png') 
    });
    
    const todoItems = await page.$$eval('.todo-list li', items => 
      items.map((item, index) => ({
        id: index + 1,
        text: item.querySelector('label')?.textContent || '',
        completed: item.classList.contains('completed')
      }))
    );
    
    await page.click('.todo-list li:nth-child(1) .toggle');
    await page.screenshot({ 
      path: join('screenshots', 'todo-completed.png') 
    });
    
    const filters = ['All', 'Active', 'Completed'];
    for (const filter of filters) {
      await page.click(`text=${filter}`);
      await page.waitForTimeout(500);
      
      const visibleCount = await page.locator('.todo-list li:visible').count();
      console.log(`${filter} filter shows ${visibleCount} items`);
      
      await page.screenshot({ 
        path: join('screenshots', `filter-${filter.toLowerCase()}.png`) 
      });
    }
    
    const pageData = {
      url: page.url(),
      title: await page.title(),
      todos: todoItems,
      timestamp: new Date().toISOString()
    };
    
    scrapedData.push(pageData);
    
    const fs = require('fs').promises;
    await fs.writeFile('scraped-todos.json', JSON.stringify(scrapedData, null, 2));
    console.log('Scraping completed. Data saved to scraped-todos.json');
  });

  test('crawl blog with pagination, screenshots, and content extraction', async ({ page }) => {
    const articles: any[] = [];
    const maxPages = 3;
    let currentPage = 1;
    
    async function scrapePage() {
      console.log(`Scraping page ${currentPage}...`);
      
      await page.screenshot({ 
        path: join('screenshots', `blog-page-${currentPage}.png`),
        fullPage: true 
      });
      
      const pageArticles = await page.$$eval('article, .post, [role="article"]', elements => 
        elements.map(article => {
          const titleElement = article.querySelector('h1, h2, h3, .title');
          const contentElement = article.querySelector('p, .content, .excerpt');
          const linkElement = article.querySelector('a');
          
          return {
            title: titleElement?.textContent?.trim() || '',
            excerpt: contentElement?.textContent?.trim().substring(0, 200) || '',
            link: linkElement?.getAttribute('href') || ''
          };
        })
      );
      
      articles.push(...pageArticles.filter(a => a.title));
      
      const links = await page.$$eval('a', anchors => 
        anchors.map(a => ({
          text: a.textContent?.trim(),
          href: a.getAttribute('href')
        })).filter(link => link.href)
      );
      
      console.log(`Found ${pageArticles.length} articles and ${links.length} links on page ${currentPage}`);
      
      const nextButton = await page.$('a:has-text("Next"), .pagination .next, [rel="next"]');
      if (nextButton && currentPage < maxPages) {
        await nextButton.click();
        await page.waitForLoadState('networkidle');
        currentPage++;
        return true;
      }
      
      return false;
    }
    
    await page.goto('https://playwright.dev/blog');
    
    let hasMore = true;
    while (hasMore && currentPage <= maxPages) {
      hasMore = await scrapePage();
    }
    
    const summary = {
      totalArticles: articles.length,
      pages: currentPage,
      articles: articles,
      scrapedAt: new Date().toISOString()
    };
    
    const fs = require('fs').promises;
    await fs.writeFile('blog-scrape-results.json', JSON.stringify(summary, null, 2));
    console.log(`Scraping complete: ${articles.length} articles from ${currentPage} pages`);
  });

  test('monitor page changes with screenshots', async ({ page }) => {
    const url = 'https://playwright.dev';
    const changes: any[] = [];
    
    await page.goto(url);
    
    const initialContent = await page.textContent('body');
    await page.screenshot({ 
      path: join('screenshots', 'monitor-initial.png') 
    });
    
    const initialData = {
      timestamp: new Date().toISOString(),
      contentLength: initialContent?.length || 0,
      links: await page.$$eval('a', links => links.length),
      images: await page.$$eval('img', imgs => imgs.length)
    };
    
    console.log('Initial page state:', initialData);
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    const newContent = await page.textContent('body');
    await page.screenshot({ 
      path: join('screenshots', 'monitor-after-reload.png') 
    });
    
    const newData = {
      timestamp: new Date().toISOString(),
      contentLength: newContent?.length || 0,
      links: await page.$$eval('a', links => links.length),
      images: await page.$$eval('img', imgs => imgs.length)
    };
    
    if (JSON.stringify(initialData) !== JSON.stringify(newData)) {
      changes.push({
        type: 'content-change',
        before: initialData,
        after: newData
      });
    }
    
    const fs = require('fs').promises;
    await fs.writeFile('page-changes.json', JSON.stringify(changes, null, 2));
    console.log('Monitoring complete. Changes saved to page-changes.json');
  });
});