/**
 * IndexedDB Tile Cache for Leaflet GIS Maps
 * Provides persistent offline tile storage, instant cached tile rendering,
 * and area pre-caching capabilities.
 */

const DB_NAME = 'FleetGisMapTileCacheDB';
const DB_VERSION = 1;
const STORE_NAME = 'map_tiles';

export interface CacheStats {
  count: number;
  estimatedSizeBytes: number;
}

class MapTileCacheService {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private isEnabled: boolean = true;
  private memoryBlobUrls: Map<string, string> = new Map();

  constructor() {
    this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported in this environment'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.warn('Failed to open Map Tile Cache IndexedDB:', request.error);
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Retrieve cached tile Blob from IndexedDB
   */
  public async getTile(url: string): Promise<Blob | null> {
    if (!this.isEnabled) return null;
    try {
      const db = await this.initDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(url);

        req.onsuccess = () => {
          if (req.result && req.result.blob) {
            resolve(req.result.blob);
          } else {
            resolve(null);
          }
        };

        req.onerror = () => {
          resolve(null);
        };
      });
    } catch {
      return null;
    }
  }

  /**
   * Save tile Blob to IndexedDB
   */
  public async saveTile(url: string, blob: Blob): Promise<void> {
    if (!this.isEnabled) return;
    try {
      const db = await this.initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put({
        url,
        blob,
        size: blob.size,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.debug('Tile cache save failed (quota or db error):', err);
    }
  }

  /**
   * Fetch a tile, return Object URL, and cache in background
   */
  public async fetchAndCacheTileUrl(url: string): Promise<string> {
    // 1. Check in-memory ObjectURL cache
    if (this.memoryBlobUrls.has(url)) {
      return this.memoryBlobUrls.get(url)!;
    }

    // 2. Check IndexedDB
    const cachedBlob = await this.getTile(url);
    if (cachedBlob) {
      const objectUrl = URL.createObjectURL(cachedBlob);
      this.memoryBlobUrls.set(url, objectUrl);
      return objectUrl;
    }

    // 3. Fetch from remote tile server
    try {
      const resp = await fetch(url, { mode: 'cors' });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const blob = await resp.blob();
      
      // Save asynchronously
      this.saveTile(url, blob);
      
      const objectUrl = URL.createObjectURL(blob);
      this.memoryBlobUrls.set(url, objectUrl);
      return objectUrl;
    } catch {
      // Fallback directly to original URL
      return url;
    }
  }

  /**
   * Get cache stats
   */
  public async getStats(): Promise<CacheStats> {
    try {
      const db = await this.initDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const countReq = store.count();

        countReq.onsuccess = () => {
          const count = countReq.result || 0;
          // Approximate average size 18KB per tile
          const estimatedSizeBytes = count * 18 * 1024;
          resolve({ count, estimatedSizeBytes });
        };

        countReq.onerror = () => {
          resolve({ count: 0, estimatedSizeBytes: 0 });
        };
      });
    } catch {
      return { count: 0, estimatedSizeBytes: 0 };
    }
  }

  /**
   * Clear all cached tiles
   */
  public async clearCache(): Promise<void> {
    try {
      // Revoke all created Object URLs
      this.memoryBlobUrls.forEach((objUrl) => {
        try {
          URL.revokeObjectURL(objUrl);
        } catch {}
      });
      this.memoryBlobUrls.clear();

      const db = await this.initDB();
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      await new Promise<void>((resolve, reject) => {
        const req = store.clear();
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Error clearing tile cache:', err);
    }
  }

  /**
   * Preload tiles for a bounding box at multiple zoom levels
   */
  public async preloadAreaTiles(
    bounds: { north: number; south: number; east: number; west: number },
    zooms: number[],
    tileUrlPattern: string,
    subdomains: string = '1234',
    onProgress?: (loaded: number, total: number) => void
  ): Promise<{ loaded: number; total: number }> {
    const urls: string[] = [];

    const lat2tile = (lat: number, zoom: number) =>
      Math.floor(
        ((1 -
          Math.log(
            Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
          ) /
            Math.PI) /
          2) *
          Math.pow(2, zoom)
      );

    const lon2tile = (lon: number, zoom: number) =>
      Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));

    for (const z of zooms) {
      const minX = Math.max(0, lon2tile(bounds.west, z));
      const maxX = Math.min(Math.pow(2, z) - 1, lon2tile(bounds.east, z));
      const minY = Math.max(0, lat2tile(bounds.north, z));
      const maxY = Math.min(Math.pow(2, z) - 1, lat2tile(bounds.south, z));

      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
          const s = subdomains.length > 0 ? subdomains[(x + y) % subdomains.length] : '';
          const url = tileUrlPattern
            .replace('{s}', s)
            .replace('{z}', String(z))
            .replace('{x}', String(x))
            .replace('{y}', String(y));
          urls.push(url);
        }
      }
    }

    // Limit to max 120 tiles per batch to avoid flooding network
    const targetUrls = urls.slice(0, 120);
    let loaded = 0;

    for (const url of targetUrls) {
      await this.fetchAndCacheTileUrl(url);
      loaded++;
      if (onProgress) {
        onProgress(loaded, targetUrls.length);
      }
    }

    return { loaded, total: targetUrls.length };
  }
}

export const mapTileCache = new MapTileCacheService();
