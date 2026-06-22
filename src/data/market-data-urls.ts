// Market-data JSON URLs — each API repo serves its own data via raw.githubusercontent.com
// (cached by GitHub's CDN; apps additionally cache in localStorage with 1h TTL).
// Scrapers live in each API repo as a GH Actions cron; no CF Worker, no shared aggregator repo.

export const FII_DII_LATEST_URL = 'https://raw.githubusercontent.com/chirag127/oriz-flow-fii-dii-activity-api/main/data/latest.json';
export const MMI_LATEST_URL = 'https://raw.githubusercontent.com/chirag127/oriz-mmi-tickertape-mmi-api/main/data/latest.json';
