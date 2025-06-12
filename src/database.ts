import * as sqlite3 from 'sqlite3';
import * as path from 'path';
import * as crypto from 'crypto';

export interface CrawledSite {
  id?: number;
  timestamp: string;
  url: string;
  url_hash: string;
  http_code: number;
  file_directory: string;
}

export interface DiscoveredLink {
  id?: number;
  crawled_site_id: number;
  url: string;
  url_hash: string;
}

export class CrawlDatabase {
  private db: sqlite3.Database;
  private dbPath: string;

  constructor(dbPath?: string) {
    this.dbPath = dbPath || path.join(process.cwd(), 'crawl.db');
    this.db = new sqlite3.Database(this.dbPath);
  }

  async initialize(): Promise<void> {
    // Create crawled_sites table
    await this.runQuery(`
      CREATE TABLE IF NOT EXISTS crawled_sites (
        id INTEGER PRIMARY KEY,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        url TEXT NOT NULL,
        url_hash TEXT NOT NULL UNIQUE,
        http_code INTEGER,
        file_directory TEXT NOT NULL
      )
    `);

    // Create links table
    await this.runQuery(`
      CREATE TABLE IF NOT EXISTS links (
        id INTEGER PRIMARY KEY,
        crawled_site_id INTEGER NOT NULL,
        url TEXT NOT NULL,
        url_hash TEXT NOT NULL,
        FOREIGN KEY (crawled_site_id) REFERENCES crawled_sites (id)
      )
    `);

    // Create indexes for better performance
    await this.runQuery(`
      CREATE INDEX IF NOT EXISTS idx_crawled_sites_url_hash ON crawled_sites (url_hash)
    `);

    await this.runQuery(`
      CREATE INDEX IF NOT EXISTS idx_links_crawled_site_id ON links (crawled_site_id)
    `);

    await this.runQuery(`
      CREATE INDEX IF NOT EXISTS idx_links_url_hash ON links (url_hash)
    `);
  }

  private runQuery(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (params.length === 0) {
        this.db.all(sql, (err: Error | null, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      } else {
        this.db.all(sql, params, (err: Error | null, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      }
    });
  }

  private runSingle(sql: string, params: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      if (params.length === 0) {
        this.db.all(sql, (err: Error | null, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows && rows.length > 0 ? rows[0] : null);
        });
      } else {
        this.db.all(sql, params, (err: Error | null, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows && rows.length > 0 ? rows[0] : null);
        });
      }
    });
  }

  private runStatement(sql: string, params: any[] = []): Promise<{ lastID: number; changes: number }> {
    return new Promise((resolve, reject) => {
      if (params.length === 0) {
        this.db.run(sql, function(this: any, err: Error | null) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      } else {
        this.db.run(sql, params, function(this: any, err: Error | null) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      }
    });
  }

  async insertCrawledSite(site: CrawledSite): Promise<number> {
    const result = await this.runStatement(`
      INSERT INTO crawled_sites (timestamp, url, url_hash, http_code, file_directory)
      VALUES (?, ?, ?, ?, ?)
    `, [site.timestamp, site.url, site.url_hash, site.http_code, site.file_directory]);
    
    return result.lastID;
  }

  async insertLinks(crawledSiteId: number, links: string[]): Promise<void> {
    if (links.length === 0) return;
    
    // Insert links one by one to avoid parameter limit issues
    for (const link of links) {
      const linkHash = this.generateUrlHash(link);
      await this.runStatement(`
        INSERT INTO links (crawled_site_id, url, url_hash)
        VALUES (?, ?, ?)
      `, [crawledSiteId, link, linkHash]);
    }
  }

  async getCrawledSite(urlHash: string): Promise<CrawledSite | null> {
    const result = await this.runSingle(`
      SELECT * FROM crawled_sites WHERE url_hash = ?
    `, [urlHash]);
    
    return result as CrawledSite || null;
  }

  async getAllCrawledSites(): Promise<CrawledSite[]> {
    const result = await this.runQuery(`
      SELECT * FROM crawled_sites ORDER BY timestamp DESC
    `);
    
    return result as CrawledSite[];
  }

  async getLinksForSite(crawledSiteId: number): Promise<DiscoveredLink[]> {
    const result = await this.runQuery(`
      SELECT * FROM links WHERE crawled_site_id = ?
    `, [crawledSiteId]);
    
    return result as DiscoveredLink[];
  }

  generateUrlHash(url: string): string {
    return crypto.createHash('sha256').update(url).digest('hex').substring(0, 16);
  }

  async close(): Promise<void> {
    return new Promise((resolve) => {
      this.db.close(() => {
        resolve();
      });
    });
  }
}

// Export singleton instance
export const crawlDb = new CrawlDatabase();