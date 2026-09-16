import L from 'leaflet';
import { mapTileCache } from './mapTileCache';

/**
 * Custom Leaflet Tile Layer with IndexedDB offline caching and fast retrieval
 */
export class CachedTileLayer extends L.TileLayer {
  constructor(urlTemplate: string, options?: L.TileLayerOptions) {
    super(urlTemplate, {
      crossOrigin: 'anonymous',
      ...options,
    });
  }

  // Override createTile to intercept tile creation and serve from IndexedDB cache
  createTile(coords: L.Coords, done: L.DoneCallback): HTMLElement {
    const tile = document.createElement('img');

    L.DomEvent.on(tile, 'load', L.Util.bind(this._tileOnLoad, this, done, tile));
    L.DomEvent.on(tile, 'error', L.Util.bind(this._tileOnError, this, done, tile));

    if (this.options.crossOrigin || this.options.crossOrigin === '') {
      tile.crossOrigin = this.options.crossOrigin === true ? '' : this.options.crossOrigin;
    }

    tile.alt = '';
    tile.setAttribute('role', 'presentation');

    const tileUrl = this.getTileUrl(coords);

    // If cache is disabled, load directly
    if (!mapTileCache.getEnabled()) {
      tile.src = tileUrl;
      return tile;
    }

    // Try reading from cache or fetching + caching in background
    mapTileCache
      .fetchAndCacheTileUrl(tileUrl)
      .then((resolvedUrl) => {
        tile.src = resolvedUrl;
      })
      .catch(() => {
        tile.src = tileUrl;
      });

    return tile;
  }
}

export function createCachedTileLayer(url: string, options?: L.TileLayerOptions): CachedTileLayer {
  return new CachedTileLayer(url, options);
}
