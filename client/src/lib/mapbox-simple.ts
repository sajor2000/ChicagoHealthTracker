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

// Simple layer management - no complex retry logic
export function addDataLayer(
  map: mapboxgl.Map, 
  data: GeoJSON.FeatureCollection, 
  layerId: string,
  selectedDisease: string,
  visualizationMode: 'count' | 'rate'
) {
  console.log(`🎯 addDataLayer called: ${layerId}, ${selectedDisease}, ${visualizationMode}, features: ${data.features.length}`);
  
  // Wait for map to be fully ready
  const executeWhenReady = () => {
    if (!map.loaded() || !map.isStyleLoaded()) {
      console.log('Map not fully ready, scheduling retry...');
      setTimeout(executeWhenReady, 100);
      return;
    }
    
    console.log('Map is ready, proceeding with layer addition...');
    performLayerAddition();
  };
  
  const performLayerAddition = () => {
    try {
    console.log(`Adding layer: ${layerId} for ${selectedDisease} (${visualizationMode})`);
    
    // Clean up existing layers first
    try {
      removeExistingLayers(map, layerId);
      console.log(`✓ Cleaned up existing layers for ${layerId}`);
    } catch (cleanupError) {
      console.error('Error cleaning up layers:', cleanupError);
    }
    
    // Add source
    try {
      if (!map.getSource(layerId)) {
        map.addSource(layerId, {
          type: 'geojson',
          data: data
        });
        console.log(`✓ Added source: ${layerId}`);
      } else {
        (map.getSource(layerId) as mapboxgl.GeoJSONSource).setData(data);
        console.log(`✓ Updated source: ${layerId}`);
      }
    } catch (sourceError) {
      console.error('Error adding/updating source:', sourceError);
      return;
    }

    // Calculate color values
    const propertyKey = `${selectedDisease}_${visualizationMode}`;
    const values = data.features
      .map(f => f.properties?.[propertyKey])
      .filter(v => typeof v === 'number' && v > 0)
      .sort((a, b) => a - b);

    if (values.length === 0) {
      console.error('No valid data values found');
      return;
    }

    const [min, q25, median, q75, max] = [
      values[0],
      values[Math.floor(values.length * 0.25)],
      values[Math.floor(values.length * 0.5)],
      values[Math.floor(values.length * 0.75)],
      values[values.length - 1]
    ];

    console.log(`Color scale: ${min} → ${q25} → ${median} → ${q75} → ${max}`);

    // Add fill layer with error handling
    try {
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
      console.log(`✓ Added fill layer: ${layerId}-fill`);
    } catch (fillError) {
      console.error('Error adding fill layer:', fillError);
    }

    // Add border layer with error handling
    try {
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
      console.log(`✓ Added line layer: ${layerId}-line`);
    } catch (lineError) {
      console.error('Error adding line layer:', lineError);
    }

    console.log(`✅ Successfully added layers for ${layerId}`);

    } catch (error) {
      console.error('Error adding layer:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        layerId,
        selectedDisease,
        visualizationMode,
        dataLength: data.features.length
      });
    }
  };

  // Start the execution
  executeWhenReady();
}

function removeExistingLayers(map: mapboxgl.Map, layerId: string) {
  const layerIds = [`${layerId}-fill`, `${layerId}-line`, `${layerId}-hover`];
  
  layerIds.forEach(id => {
    if (map.getLayer(id)) {
      map.removeLayer(id);
    }
  });
  
  if (map.getSource(layerId)) {
    map.removeSource(layerId);
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