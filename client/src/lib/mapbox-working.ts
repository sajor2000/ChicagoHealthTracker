import mapboxgl from 'mapbox-gl';
import type { MapFeature, TooltipData } from '@/types';

// Configure Mapbox with deployment-ready token access
const mapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 
                   import.meta.env.MAPBOX_ACCESS_TOKEN ||
                   (window as any).__MAPBOX_TOKEN__;

if (!mapboxToken) {
  console.error('MAPBOX ACCESS TOKEN MISSING - Maps will not load');
  console.log('Available env vars:', Object.keys(import.meta.env));
  console.log('Deployment environment:', window.location.hostname);
} else {
  console.log('Mapbox token found, length:', mapboxToken.length);
  mapboxgl.accessToken = mapboxToken;
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
  console.log('🗺️ Adding data layer:', { layerId, selectedDisease, visualizationMode, featuresCount: data.features.length });
  console.log('🗺️ Map status:', { loaded: map.loaded(), styleLoaded: map.isStyleLoaded() });
  
  // Validate data before processing
  if (!data || !data.features || data.features.length === 0) {
    console.error('Invalid or empty GeoJSON data');
    return;
  }

  // Wait for map to be ready - use timeout to ensure style is loaded
  const attemptAddLayer = () => {
    try {
      // Deployment-specific: Ensure map is fully initialized
      if (!map.loaded() || !map.isStyleLoaded()) {
        console.log('🗺️ Deployment fix: Map not fully loaded, retrying...');
        setTimeout(attemptAddLayer, 300);
        return;
      }

      // Remove existing layers if they exist - with error handling for deployment
      const existingLayers = [`${layerId}-fill`, `${layerId}-border`, `${layerId}-hover`, `${layerId}-labels`, `${layerId}-population`];
      existingLayers.forEach(layer => {
        try {
          if (map.getLayer(layer)) {
            map.removeLayer(layer);
          }
        } catch (e) {
          console.log(`Layer cleanup note: ${layer} not found (normal)`);
        }
      });

      // Remove existing source if it exists - with deployment error handling
      try {
        if (map.getSource(layerId)) {
          (map.getSource(layerId) as mapboxgl.GeoJSONSource).setData(data);
        } else {
          map.addSource(layerId, {
            type: 'geojson',
            data,
            promoteId: 'id'
          });
        }
      } catch (sourceError) {
        console.error('Source management error:', sourceError);
        // Force remove and re-add source for deployment environments
        try {
          map.removeSource(layerId);
        } catch (e) {}
        map.addSource(layerId, {
          type: 'geojson',
          data,
          promoteId: 'id'
        });
      }

      const propertyKey = `${selectedDisease}_${visualizationMode}`;

      // Add fill layer with deployment error handling
      try {
        map.addLayer({
          id: `${layerId}-fill`,
          type: 'fill',
          source: layerId,
          paint: {
            'fill-color': [
            'case',
            ['>', ['get', propertyKey], 0],
            // Disease-specific color thresholds based on actual data distributions
            selectedDisease === 'diabetes' ? [
              'interpolate', ['linear'], ['get', propertyKey],
              19, '#006747',     // Green - lowest (19.6)
              42, '#4a8c2a',     // Medium green - 25th percentile
              57, '#a4c441',     // Yellow-green - median
              66, '#f4e04d',     // Yellow - 75th percentile
              71, '#ff8c42',     // Orange - 90th percentile
              78, '#f76c5e',     // Red - high values
              84, '#d32f2f'      // Dark red - max (83.9)
            ] : selectedDisease === 'hypertension' ? [
              'interpolate', ['linear'], ['get', propertyKey],
              74, '#006747',     // Green - lowest (74.5)
              144, '#4a8c2a',    // Medium green - 25th percentile
              178, '#a4c441',    // Yellow-green - median
              204, '#f4e04d',    // Yellow - 75th percentile
              221, '#ff8c42',    // Orange - 90th percentile
              237, '#f76c5e',    // Red - high values
              254, '#d32f2f'     // Dark red - max (253.4)
            ] : selectedDisease === 'heart_disease' ? [
              'interpolate', ['linear'], ['get', propertyKey],
              12, '#006747',     // Green - lowest (12.4)
              27, '#4a8c2a',     // Medium green - 25th percentile
              37, '#a4c441',     // Yellow-green - median
              42, '#f4e04d',     // Yellow - 75th percentile
              45, '#ff8c42',     // Orange - 90th percentile
              50, '#f76c5e',     // Red - high values
              54, '#d32f2f'      // Dark red - max (53.8)
            ] : selectedDisease === 'stroke' ? [
              'interpolate', ['linear'], ['get', propertyKey],
              7, '#006747',      // Green - lowest (7.6)
              17, '#4a8c2a',     // Medium green - 25th percentile
              22, '#a4c441',     // Yellow-green - median
              25, '#f4e04d',     // Yellow - 75th percentile
              28, '#ff8c42',     // Orange - 90th percentile
              32, '#f76c5e',     // Red - high values
              36, '#d32f2f'      // Dark red - max (35.8)
            ] : selectedDisease === 'asthma' ? [
              'interpolate', ['linear'], ['get', propertyKey],
              11, '#006747',     // Green - lowest (11)
              22, '#4a8c2a',     // Medium green - 25th percentile
              28, '#a4c441',     // Yellow-green - median
              32, '#f4e04d',     // Yellow - 75th percentile
              35, '#ff8c42',     // Orange - 90th percentile
              38, '#f76c5e',     // Red - high values
              40, '#d32f2f'      // Dark red - max (40.3)
            ] : selectedDisease === 'copd' ? [
              'interpolate', ['linear'], ['get', propertyKey],
              14, '#006747',     // Green - lowest (13.9)
              31, '#4a8c2a',     // Medium green - 25th percentile
              41, '#a4c441',     // Yellow-green - median
              47, '#f4e04d',     // Yellow - 75th percentile
              52, '#ff8c42',     // Orange - 90th percentile
              56, '#f76c5e',     // Red - high values
              60, '#d32f2f'      // Dark red - max (59.7)
            ] : selectedDisease === 'obesity' ? [
              'interpolate', ['linear'], ['get', propertyKey],
              42, '#006747',     // Green - lowest (42.2)
              75, '#4a8c2a',     // Medium green - 25th percentile
              91, '#a4c441',     // Yellow-green - median
              102, '#f4e04d',    // Yellow - 75th percentile
              111, '#ff8c42',    // Orange - 90th percentile
              120, '#f76c5e',    // Red - high values
              130, '#d32f2f'     // Dark red - max (130)
            ] : selectedDisease === 'depression' || selectedDisease === 'mental_health' ? [
              'interpolate', ['linear'], ['get', propertyKey],
              18, '#006747',     // Green - lowest (18.4)
              27, '#4a8c2a',     // Medium green - 25th percentile
              29, '#a4c441',     // Yellow-green - median
              33, '#f4e04d',     // Yellow - 75th percentile
              35, '#ff8c42',     // Orange - 90th percentile
              37, '#f76c5e',     // Red - high values
              38, '#d32f2f'      // Dark red - max (38.1)
            ] : [
              // Default fallback scale
              'interpolate', ['linear'], ['get', propertyKey],
              7, '#006747', 25, '#4a8c2a', 37, '#a4c441', 50, '#f4e04d',
              68, '#ff8c42', 100, '#f76c5e', 138, '#d32f2f', 260, '#8b0000'
            ],
            'rgba(107, 114, 128, 0.3)' // Suppressed data color
          ],
          'fill-opacity': 0.8
          }
        });
      } catch (fillLayerError) {
        console.error('Fill layer creation error:', fillLayerError);
      }

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
      try {
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
      } catch (borderLayerError) {
        console.error('Border layer creation error:', borderLayerError);
      }

      // Add hover layer
      try {
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
      } catch (hoverLayerError) {
        console.error('Hover layer creation error:', hoverLayerError);
      }

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

      console.log('✅ Successfully added map layers for:', layerId);
      
    } catch (error) {
      console.error('Error adding data layer:', error);
    }
  };

  // Use timeout to ensure map is fully ready
  if (map.loaded() && map.isStyleLoaded()) {
    console.log('🗺️ Map ready, adding layers immediately');
    attemptAddLayer();
  } else {
    console.log('🗺️ Map not ready, waiting...');
    setTimeout(() => {
      if (map.loaded() && map.isStyleLoaded()) {
        console.log('🗺️ Map ready after timeout, adding layers');
        attemptAddLayer();
      } else {
        console.log('🗺️ Map still not ready, using load event');
        map.once('load', () => {
          console.log('🗺️ Map load event fired, adding layers');
          attemptAddLayer();
        });
      }
    }, 500);
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