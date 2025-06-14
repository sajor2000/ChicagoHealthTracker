import mapboxgl from 'mapbox-gl';
import type { MapFeature, TooltipData } from '@/types';
import { getMapboxToken, isDeploymentEnvironment } from './deployment-config';

// Configure Mapbox with deployment-ready token access
const mapboxToken = getMapboxToken();

if (!mapboxToken) {
  console.error('MAPBOX ACCESS TOKEN MISSING - Maps will not load');
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
  const attemptAddLayer = () => {
    try {
      console.log('Adding data layer:', { layerId, selectedDisease, visualizationMode, featuresCount: data.features.length });
      
      // Validate data before processing
      if (!data || !data.features || data.features.length === 0) {
        console.error('Invalid or empty GeoJSON data');
        return;
      }

      // Critical deployment fix: Ensure map style is fully loaded
      if (!map.loaded() || !map.isStyleLoaded()) {
        console.log('Deployment fix: Map style not ready, waiting...');
        setTimeout(attemptAddLayer, isDeploymentEnvironment() ? 1000 : 200);
        return;
      }

      // Remove existing layers if they exist
      const existingLayers = [`${layerId}-fill`, `${layerId}-border`, `${layerId}-hover`, `${layerId}-labels`, `${layerId}-population`];
      existingLayers.forEach(layer => {
        try {
          if (map.getLayer(layer)) {
            map.removeLayer(layer);
          }
        } catch (e) {
          // Ignore layer cleanup errors in deployment
        }
      });

      // Remove existing source if it exists
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
              selectedDisease === 'diabetes' ? [
                'interpolate', ['linear'], ['get', propertyKey],
                19, '#006747', 42, '#4a8c2a', 57, '#a4c441', 66, '#f4e04d',
                71, '#ff8c42', 78, '#f76c5e', 84, '#d32f2f'
              ] : selectedDisease === 'hypertension' ? [
                'interpolate', ['linear'], ['get', propertyKey],
                74, '#006747', 144, '#4a8c2a', 171, '#a4c441', 195, '#f4e04d',
                210, '#ff8c42', 230, '#f76c5e', 260, '#d32f2f'
              ] : [
                'interpolate', ['linear'], ['get', propertyKey],
                7, '#006747', 25, '#4a8c2a', 37, '#a4c441', 50, '#f4e04d',
                68, '#ff8c42', 100, '#f76c5e', 138, '#d32f2f', 260, '#8b0000'
              ],
              'rgba(107, 114, 128, 0.3)'
            ],
            'fill-opacity': 0.8
          }
        });
      } catch (fillLayerError) {
        console.error('Fill layer creation error:', fillLayerError);
      }

      // Add border layer
      try {
        map.addLayer({
          id: `${layerId}-border`,
          type: 'line',
          source: layerId,
          paint: {
            'line-color': '#6b7280',
            'line-width': 0.5,
            'line-opacity': 0.8
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

      console.log('✅ Successfully added map layers for:', layerId);
      
    } catch (error) {
      console.error('Error adding data layer:', error);
      // Retry in deployment environments
      if (isDeploymentEnvironment()) {
        setTimeout(attemptAddLayer, 1500);
      }
    }
  };

  // Start the layer addition process
  attemptAddLayer();
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
      <div class="text-sm text-gray-300 mb-2">Population: ${data.population.toLocaleString()}</div>
      <div class="text-sm text-gray-300 mb-2">Density: ${(data.density || 0).toFixed(0)}/sq mi</div>
      <div class="font-medium text-orange-400 mb-1">${data.diseaseName || 'Disease'}: ${data.diseaseCount || data.patientCount} cases</div>
      <div class="text-sm text-gray-400">Rate: ${(data.diseaseRate || data.rate).toFixed(1)} per 100k</div>
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