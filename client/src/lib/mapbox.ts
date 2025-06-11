import mapboxgl from 'mapbox-gl';
import { MapFeature, TooltipData } from '@/types';

// Set Mapbox access token from environment variables
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

if (!MAPBOX_TOKEN) {
  console.error('Mapbox access token not found. Please set VITE_MAPBOX_ACCESS_TOKEN environment variable.');
} else {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

export const mapConfig = {
  container: 'map',
  style: 'mapbox://styles/mapbox/dark-v11',
  center: [-87.6298, 41.8781] as [number, number], // Chicago coordinates
  zoom: 10,
  minZoom: 8,
  maxZoom: 16,
  pitch: 0,
  bearing: 0,
  attributionControl: false, // Custom attribution
};

export function createMap(container: string): mapboxgl.Map {
  if (!MAPBOX_TOKEN) {
    throw new Error('Mapbox access token is required. Please configure VITE_MAPBOX_ACCESS_TOKEN.');
  }

  try {
    const map = new mapboxgl.Map({
      ...mapConfig,
      container,
      accessToken: MAPBOX_TOKEN,
    });

    // Handle map load errors
    map.on('error', (e) => {
      console.error('Mapbox GL error:', e.error);
    });

    // Custom map styling overrides
    map.on('load', () => {
      try {
        // Darken the base map
        if (map.getLayer('background')) {
          map.setPaintProperty('background', 'background-color', '#0a0a0a');
        }
        
        // Reduce road visibility
        const roadLayers = ['road-primary', 'road-secondary', 'road-street', 'road-trunk'];
        roadLayers.forEach(layer => {
          if (map.getLayer(layer)) {
            map.setPaintProperty(layer, 'line-opacity', 0.3);
          }
        });
        
        // Emphasize water features
        if (map.getLayer('water')) {
          map.setPaintProperty('water', 'fill-color', '#001f3f');
        }
      } catch (error) {
        console.warn('Failed to apply custom map styling:', error);
      }
    });

    return map;
  } catch (error) {
    console.error('Failed to create map:', error);
    if (error instanceof Error && error.message.includes('token')) {
      throw new Error('Invalid Mapbox access token. Please check your VITE_MAPBOX_ACCESS_TOKEN configuration.');
    }
    throw error;
  }
}

export function addDataLayer(
  map: mapboxgl.Map, 
  data: GeoJSON.FeatureCollection, 
  layerId: string,
  selectedDisease: string,
  visualizationMode: 'count' | 'rate'
) {
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

  // Add fill layer
  map.addLayer({
    id: `${layerId}-fill`,
    type: 'fill',
    source: layerId,
    paint: {
      'fill-color': [
        'case',
        ['>', ['get', ['concat', selectedDisease, '_', visualizationMode]], 0],
        [
          'interpolate',
          ['linear'],
          ['get', ['concat', selectedDisease, '_', visualizationMode]],
          0, 'rgba(0, 103, 71, 0.3)',
          5, '#4a8c2a',
          10, '#a4c441',
          15, '#f4e04d',
          20, '#f76c5e'
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
      'line-color': '#006747',
      'line-width': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        3,
        1
      ],
      'line-opacity': 0.8
    }
  });

  // Add hover layer
  map.addLayer({
    id: `${layerId}-hover`,
    type: 'fill',
    source: layerId,
    paint: {
      'fill-color': '#006747',
      'fill-opacity': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        0.3,
        0
      ]
    }
  });

  // Determine if this is community or census view based on layerId
  const isCommunityView = layerId.includes('community');
  
  // Add area name labels
  map.addLayer({
    id: `${layerId}-labels`,
    type: 'symbol',
    source: layerId,
    layout: {
      'text-field': isCommunityView 
        ? ['get', 'name']
        : ['concat', 'Tract ', ['slice', ['get', 'geoid'], -4]],
      'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
      'text-size': isCommunityView ? 12 : 9,
      'text-offset': [0, -0.5],
      'text-anchor': 'center',
      'text-allow-overlap': false,
      'text-ignore-placement': false
    },
    paint: {
      'text-color': '#ffffff',
      'text-halo-color': 'rgba(0, 0, 0, 0.8)',
      'text-halo-width': 2
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
    <div style="font-family: var(--font-primary); color: var(--text-secondary);">
      <h5 style="color: var(--text-primary); font-weight: 600; margin-bottom: 12px; font-size: 14px;">${data.name}</h5>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px;">
        <span style="color: var(--text-tertiary);">Population:</span>
        <strong style="color: var(--text-primary); font-family: var(--font-mono);">${data.population.toLocaleString()}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px;">
        <span style="color: var(--text-tertiary);">Patients:</span>
        <strong style="color: var(--text-primary); font-family: var(--font-mono);">${data.patientCount.toLocaleString()}</strong>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 12px;">
        <span style="color: var(--text-tertiary);">Rate:</span>
        <strong style="color: var(--rush-primary-light); font-family: var(--font-mono);">${data.rate.toFixed(1)} per 1,000</strong>
      </div>
    </div>
  `;
}

export function fitBoundsToFeature(map: mapboxgl.Map, feature: MapFeature) {
  const coordinates = feature.geometry.coordinates;
  const bounds = new mapboxgl.LngLatBounds();
  
  function addCoordinatesToBounds(coords: any) {
    if (Array.isArray(coords[0])) {
      coords.forEach(addCoordinatesToBounds);
    } else {
      bounds.extend(coords as [number, number]);
    }
  }
  
  addCoordinatesToBounds(coordinates);
  
  map.fitBounds(bounds, {
    padding: { top: 100, bottom: 100, left: 400, right: 450 },
    duration: 1000,
  });
}
