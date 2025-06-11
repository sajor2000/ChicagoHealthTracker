import mapboxgl from 'mapbox-gl';
import type { MapFeature, TooltipData } from '@/types';

// Configure Mapbox
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

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
  try {
    // Remove existing layers if they exist
    const existingLayers = [`${layerId}-fill`, `${layerId}-border`, `${layerId}-hover`, `${layerId}-labels`, `${layerId}-population`];
    existingLayers.forEach(layer => {
      if (map.getLayer(layer)) {
        map.removeLayer(layer);
      }
    });

    if (map.getSource(layerId)) {
      (map.getSource(layerId) as mapboxgl.GeoJSONSource).setData(data);
    } else {
      map.addSource(layerId, {
        type: 'geojson',
        data,
      });
    }

    const propertyKey = `${selectedDisease}_${visualizationMode}`;
    console.log(`Adding layer with property key: ${propertyKey}`);
    
    // Verify data has the expected properties
    if (data.features.length > 0) {
      const firstFeature = data.features[0];
      console.log(`First feature properties:`, Object.keys(firstFeature.properties || {}));
      console.log(`Property value for ${propertyKey}:`, firstFeature.properties?.[propertyKey]);
    }

    // Add fill layer
    map.addLayer({
      id: `${layerId}-fill`,
      type: 'fill',
      source: layerId,
      paint: {
        'fill-color': [
          'case',
          ['>', ['get', `${selectedDisease}_${visualizationMode}`], 0],
          [
            'interpolate',
            ['linear'],
            ['get', `${selectedDisease}_${visualizationMode}`],
            0, '#006747',      // Dark green for low values
            50, '#4a8c2a',     // Medium green
            100, '#a4c441',    // Yellow-green
            150, '#f4e04d',    // Yellow
            200, '#ff8c42',    // Orange
            300, '#f76c5e',    // Red
            400, '#d32f2f'     // Dark red for highest values
          ],
          'rgba(107, 114, 128, 0.3)' // Suppressed data color
        ],
        'fill-opacity': 0.8
      }
    });

    // Add border layer
    map.addLayer({
      id: `${layerId}-border`,
      type: 'line',
      source: layerId,
      paint: {
        'line-color': '#374151',
        'line-width': 0.5,
        'line-opacity': 0.8
      }
    });

    // Add hover layer
    map.addLayer({
      id: `${layerId}-hover`,
      type: 'line',
      source: layerId,
      paint: {
        'line-color': '#ffffff',
        'line-width': 2,
        'line-opacity': 0
      },
      filter: ['==', ['get', 'id'], '']
    });

    // Determine if this is community view for label sizing
    const isCommunityView = layerId.includes('community');

    // Add name labels
    map.addLayer({
      id: `${layerId}-labels`,
      type: 'symbol',
      source: layerId,
      layout: {
        'text-field': isCommunityView ? ['get', 'name'] : [
          'concat',
          'Tract ',
          ['get', 'tractce']
        ],
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': isCommunityView ? [
          'interpolate',
          ['linear'],
          ['zoom'],
          8, 10,
          12, 14,
          16, 18
        ] : 8,
        'text-offset': [0, 0],
        'text-anchor': 'center',
        'text-allow-overlap': false,
        'text-ignore-placement': false,
        'text-transform': 'uppercase',
        'text-padding': isCommunityView ? 10 : 2
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': 'rgba(0, 0, 0, 0.9)',
        'text-halo-width': isCommunityView ? 3 : 2,
        'text-opacity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          8, 0.8,
          10, 1.0
        ]
      }
    });

    // Add population labels
    map.addLayer({
      id: `${layerId}-population`,
      type: 'symbol',
      source: layerId,
      layout: {
        'text-field': [
          'concat',
          'Pop: ',
          ['to-string', ['round', ['/', ['get', 'population'], 1000]]],
          'k'
        ],
        'text-font': ['Open Sans Regular', 'Arial Unicode MS Regular'],
        'text-size': isCommunityView ? 9 : 7,
        'text-offset': [0, 0.8],
        'text-anchor': 'center',
        'text-allow-overlap': false,
        'text-ignore-placement': false
      },
      paint: {
        'text-color': '#e5e7eb',
        'text-halo-color': 'rgba(0, 0, 0, 0.6)',
        'text-halo-width': 1
      }
    });
    
  } catch (error) {
    console.error('Error adding data layer:', error);
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