import { test, expect } from '@playwright/test';
import { join } from 'path';

test.describe('Screenshot Examples', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://playwright.dev');
  });

  test('capture full page screenshot', async ({ page }) => {
    await page.screenshot({ 
      path: join('screenshots', 'full-page.png'),
      fullPage: true 
    });
    
    console.log('Full page screenshot saved to screenshots/full-page.png');
  });

  test('capture specific element screenshots', async ({ page }) => {
    const heroSection = page.locator('.hero');
    await heroSection.screenshot({ 
      path: join('screenshots', 'hero-section.png') 
    });
    
    const navBar = page.locator('nav').first();
    await navBar.screenshot({ 
      path: join('screenshots', 'navigation.png') 
    });
    
    console.log('Element screenshots saved to screenshots directory');
  });

  test('capture screenshots with different formats and quality', async ({ page }) => {
    await page.screenshot({ 
      path: join('screenshots', 'high-quality.jpg'),
      quality: 100,
      type: 'jpeg'
    });
    
    await page.screenshot({ 
      path: join('screenshots', 'low-quality.jpg'),
      quality: 30,
      type: 'jpeg'
    });
    
    await page.screenshot({ 
      path: join('screenshots', 'transparent.png'),
      omitBackground: true
    });
  });

  test('capture viewport screenshots at different sizes', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize({ 
        width: viewport.width, 
        height: viewport.height 
      });
      
      await page.screenshot({ 
        path: join('screenshots', `${viewport.name}-view.png`) 
      });
      
      console.log(`Captured ${viewport.name} screenshot: ${viewport.width}x${viewport.height}`);
    }
  });

  test('capture screenshots during interaction', async ({ page }) => {
    await page.screenshot({ 
      path: join('screenshots', 'before-click.png') 
    });
    
    await page.click('text=Get started');
    await page.waitForLoadState('networkidle');
    
    await page.screenshot({ 
      path: join('screenshots', 'after-click.png') 
    });
    
    await page.hover('.hero');
    await page.screenshot({ 
      path: join('screenshots', 'on-hover.png') 
    });
  });

  test('capture screenshot with custom clip area', async ({ page }) => {
    await page.screenshot({
      path: join('screenshots', 'clipped-area.png'),
      clip: {
        x: 0,
        y: 0,
        width: 800,
        height: 600
      }
    });
  });
});