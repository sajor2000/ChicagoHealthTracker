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
            7, '#006747',      // Dark green - lowest values (min: 7.4)
            25, '#4a8c2a',     // Medium green - low values (25th percentile: 27.2)
            37, '#a4c441',     // Yellow-green - below median (median: 37.1)
            50, '#f4e04d',     // Yellow - moderate values
            68, '#ff8c42',     // Orange - high values (75th percentile: 68.3)
            100, '#f76c5e',    // Red - very high values
            138, '#d32f2f',    // Dark red - highest values (90th percentile: 137.9)
            260, '#8b0000'     // Deep red - extreme values (max: 257.4)
          ],
          'rgba(107, 114, 128, 0.3)' // Suppressed data color
        ],
        'fill-opacity': 0.8
      }
    });

    // Determine border style based on geographic level
    const getBorderStyle = (layerId: string) => {
      if (layerId.includes('census')) {
        return { width: 0.3, color: '#6b7280', opacity: 0.6 }; // Thin gray for census tracts
      } else if (layerId.includes('community')) {
        return { width: 1.0, color: '#374151', opacity: 0.8 }; // Medium for community areas
      } else if (layerId.includes('wards')) {
        return { width: 2.0, color: '#1f2937', opacity: 1.0 }; // Thick dark for alderman wards
      }
      return { width: 0.5, color: '#374151', opacity: 0.8 }; // Default
    };

    const borderStyle = getBorderStyle(layerId);

    // Add border layer with distinct styling per geographic level
    map.addLayer({
      id: `${layerId}-border`,
      type: 'line',
      source: layerId,
      paint: {
        'line-color': borderStyle.color,
        'line-width': borderStyle.width,
        'line-opacity': borderStyle.opacity
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
        'text-field': isCommunityView ? ['get', 'community'] : [
          'concat',
          'Tract ',
          ['get', 'tractce']
        ],
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': isCommunityView ? [
          'interpolate',
          ['linear'],
          ['zoom'],
          8, 9,
          10, 12,
          12, 15,
          16, 20
        ] : 8,
        'text-offset': [0, 0],
        'text-anchor': 'center',
        'text-allow-overlap': isCommunityView,
        'text-ignore-placement': isCommunityView,
        'text-transform': 'uppercase',
        'text-padding': isCommunityView ? 5 : 2,
        'text-optional': true
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