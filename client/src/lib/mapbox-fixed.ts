import mapboxgl from 'mapbox-gl';
import type { MapFeature, TooltipData } from '@/types';
import { getMapboxToken } from './deployment-config';

// Configure Mapbox
const mapboxToken = getMapboxToken();
if (mapboxToken) {
  mapboxgl.accessToken = mapboxToken;
  console.log('Mapbox initialized successfully');
} else {
  console.error('Mapbox token missing');
}

export const mapConfig = {
  style: 'mapbox://styles/mapbox/dark-v11',
  center: [-87.6298, 41.8781] as [number, number],
  zoom: 10,
  minZoom: 8,
  maxZoom: 16,
};

export function createMap(container: string): mapboxgl.Map {
  return new mapboxgl.Map({
    container,
    ...mapConfig,
  });
}

export function addDataLayer(
  map: mapboxgl.Map, 
  data: GeoJSON.FeatureCollection, 
  layerId: string,
  selectedDisease: string,
  visualizationMode: 'count' | 'rate'
) {
  console.log(`🎯 addDataLayer called: ${layerId}, ${selectedDisease}, ${visualizationMode}, features: ${data.features.length}`);

  // Wait for map to be ready with polling approach
  let attempts = 0;
  const maxAttempts = 50;
  
  const tryAddLayer = () => {
    attempts++;
    
    if (!map.loaded() || !map.isStyleLoaded()) {
      if (attempts < maxAttempts) {
        setTimeout(tryAddLayer, 100);
        return;
      } else {
        console.error('Map failed to load after maximum attempts');
        return;
      }
    }

    console.log('Map is ready, adding layers...');
    
    try {
      // Remove existing layers
      cleanupLayers(map, layerId);
      
      // Add source
      map.addSource(layerId, {
        type: 'geojson',
        data: data
      });
      
      // Calculate values for color scaling
      const propertyKey = `${selectedDisease}_${visualizationMode}`;
      const values = data.features
        .map(f => f.properties?.[propertyKey])
        .filter(v => typeof v === 'number' && v > 0)
        .sort((a, b) => a - b);

      if (values.length === 0) {
        console.error('No valid data values found');
        return;
      }

      const min = values[0];
      const q25 = values[Math.floor(values.length * 0.25)];
      const median = values[Math.floor(values.length * 0.5)];
      const q75 = values[Math.floor(values.length * 0.75)];
      const max = values[values.length - 1];

      console.log(`Color scale: ${min} → ${q25} → ${median} → ${q75} → ${max}`);

      // Add fill layer
      map.addLayer({
        id: `${layerId}-fill`,
        type: 'fill',
        source: layerId,
        paint: {
          'fill-color': [
            'case',
            ['>', ['get', propertyKey], 0],
            [
              'interpolate',
              ['linear'],
              ['get', propertyKey],
              min, '#006d2c',
              q25, '#31a354',
              median, '#74c476',
              q75, '#fd8d3c',
              max, '#d94701'
            ],
            'rgba(128, 128, 128, 0.3)'
          ],
          'fill-opacity': 0.7
        }
      });

      // Add border layer
      map.addLayer({
        id: `${layerId}-line`,
        type: 'line',
        source: layerId,
        paint: {
          'line-color': '#ffffff',
          'line-width': 0.5,
          'line-opacity': 0.8
        }
      });

      console.log(`✅ Successfully added layers for ${layerId}`);

    } catch (error) {
      console.error('Error adding layers:', error);
    }
  };

  tryAddLayer();
}

function cleanupLayers(map: mapboxgl.Map, layerId: string) {
  const layerIds = [`${layerId}-fill`, `${layerId}-line`];
  
  layerIds.forEach(id => {
    if (map.getLayer(id)) {
      try {
        map.removeLayer(id);
      } catch (e) {
        // Ignore removal errors
      }
    }
  });
  
  if (map.getSource(layerId)) {
    try {
      map.removeSource(layerId);
    } catch (e) {
      // Ignore removal errors
    }
  }
}

export function createTooltip(): mapboxgl.Popup {
  return new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: [0, -10]
  });
}

export function updateTooltipContent(data: TooltipData): string {
  return `
    <div class="bg-gray-900 text-white p-3 rounded shadow-lg border border-gray-700 min-w-48">
      <div class="font-semibold text-base mb-2">${data.name}</div>
      <div class="space-y-1 text-sm">
        <div class="flex justify-between">
          <span class="text-gray-300">Population:</span>
          <span class="font-medium">${data.population.toLocaleString()}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-300">Patient Count:</span>
          <span class="font-medium">${data.patientCount.toLocaleString()}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-300">Rate per 1,000:</span>
          <span class="font-medium">${data.rate.toFixed(1)}</span>
        </div>
      </div>
    </div>
  `;
}

export function fitBoundsToFeature(map: mapboxgl.Map, feature: MapFeature) {
  const bounds = new mapboxgl.LngLatBounds();
  
  function addCoordinatesToBounds(coords: any) {
    if (Array.isArray(coords[0])) {
      coords.forEach((coord: any) => addCoordinatesToBounds(coord));
    } else {
      bounds.extend([coords[0], coords[1]]);
    }
  }
  
  addCoordinatesToBounds(feature.geometry.coordinates);
  
  map.fitBounds(bounds, {
    padding: { top: 100, bottom: 100, left: 400, right: 450 },
    duration: 1000,
  });
}