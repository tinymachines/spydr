# DuckDB CLI Installation and Usage Guide

## Overview

DuckDB is an in-process SQL database that's perfect for analyzing the crawled data stored in `crawl.db`. This guide covers installation instructions for all major platforms and sample queries to explore your crawler data.

## Installation Instructions

### Linux (x86_64)

```bash
# Download and extract
wget https://github.com/duckdb/duckdb/releases/download/v1.3.0/duckdb_cli-linux-amd64.gz
gunzip duckdb_cli-linux-amd64.gz

# Make executable and optionally move to PATH
chmod +x duckdb_cli-linux-amd64
sudo mv duckdb_cli-linux-amd64 /usr/local/bin/duckdb
```

### Linux (ARM64)

```bash
# Download and extract
wget https://github.com/duckdb/duckdb/releases/download/v1.3.0/duckdb_cli-linux-arm64.gz
gunzip duckdb_cli-linux-arm64.gz

# Make executable and optionally move to PATH
chmod +x duckdb_cli-linux-arm64
sudo mv duckdb_cli-linux-arm64 /usr/local/bin/duckdb
```

### macOS (Universal - Intel & Apple Silicon)

```bash
# Download and extract
curl -L -o duckdb_cli-osx-universal.gz https://github.com/duckdb/duckdb/releases/download/v1.3.0/duckdb_cli-osx-universal.gz
gunzip duckdb_cli-osx-universal.gz

# Make executable and optionally move to PATH
chmod +x duckdb_cli-osx-universal
sudo mv duckdb_cli-osx-universal /usr/local/bin/duckdb
```

### Windows (x86_64)

1. Download: https://github.com/duckdb/duckdb/releases/download/v1.3.0/duckdb_cli-windows-amd64.zip
2. Extract the ZIP file
3. Run `duckdb.exe` from the extracted folder
4. Optionally add to PATH for system-wide access

### Quick Install (Linux/macOS)

```bash
# Automated installation script
curl -fsSL https://install.duckdb.org/ | bash
```

## Connecting to the Crawler Database

Once installed, connect to your crawler database:

```bash
# From the project root directory
duckdb crawl.db
```

## Sample Queries

### View All Crawled Pages

```sql
-- List all crawled pages with basic info
SELECT url, status_code, created_at 
FROM pages 
ORDER BY created_at DESC 
LIMIT 20;
```

### Check Crawl Statistics

```sql
-- Count pages by status code
SELECT status_code, COUNT(*) as count 
FROM pages 
GROUP BY status_code 
ORDER BY count DESC;

-- Total pages crawled
SELECT COUNT(*) as total_pages FROM pages;

-- Pages crawled today
SELECT COUNT(*) as pages_today 
FROM pages 
WHERE DATE(created_at) = CURRENT_DATE;
```

### Find Failed Pages

```sql
-- List pages that failed to load
SELECT url, status_code, error, created_at 
FROM pages 
WHERE status_code >= 400 OR error IS NOT NULL 
ORDER BY created_at DESC;
```

### Search Page Content

```sql
-- Find pages containing specific text
SELECT url, title, created_at 
FROM pages 
WHERE content LIKE '%search term%' 
ORDER BY created_at DESC;

-- Find pages by title
SELECT url, title, status_code 
FROM pages 
WHERE title ILIKE '%keyword%';
```

### Analyze Page Performance

```sql
-- Pages with longest content
SELECT url, LENGTH(content) as content_length, title 
FROM pages 
WHERE content IS NOT NULL 
ORDER BY content_length DESC 
LIMIT 10;

-- Recent crawl activity by hour
SELECT 
  DATE_TRUNC('hour', created_at) as hour,
  COUNT(*) as pages_crawled
FROM pages 
WHERE created_at >= CURRENT_DATE - INTERVAL '24 hours'
GROUP BY hour 
ORDER BY hour DESC;
```

### Export Data

```sql
-- Export to CSV
COPY (SELECT * FROM pages) TO 'crawled_pages.csv' WITH (HEADER, DELIMITER ',');

-- Export to Parquet (more efficient)
COPY (SELECT * FROM pages) TO 'crawled_pages.parquet' (FORMAT PARQUET);

-- Export to JSON
COPY (SELECT * FROM pages LIMIT 100) TO 'crawled_pages.json' (FORMAT JSON);
```

### Useful DuckDB Commands

```sql
-- Show all tables
SHOW TABLES;

-- Describe table structure
DESCRIBE pages;

-- Show database size
SELECT database_size();

-- Exit DuckDB
.exit
```

## Tips

1. **Auto-completion**: DuckDB CLI supports tab completion for table and column names
2. **Output formats**: Use `.mode` to change output format (e.g., `.mode line`, `.mode csv`)
3. **Save queries**: Use `.read filename.sql` to run SQL files
4. **Performance**: DuckDB is optimized for analytical queries and can handle large datasets efficiently
5. **Memory usage**: For large databases, you can set memory limits with `SET memory_limit = '4GB';`

## Further Resources

- [DuckDB Documentation](https://duckdb.org/docs/)
- [DuckDB SQL Reference](https://duckdb.org/docs/sql/introduction)
- [DuckDB CLI Documentation](https://duckdb.org/docs/api/cli)