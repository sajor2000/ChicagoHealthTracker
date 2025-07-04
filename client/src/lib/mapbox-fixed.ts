import mapboxgl from 'mapbox-gl';
import type { MapFeature, TooltipData } from '@/types';
import { getMapboxToken } from './enhanced-deployment-config';

// Configure Mapbox with enhanced deployment support
const mapboxToken = getMapboxToken();
if (mapboxToken) {
  mapboxgl.accessToken = mapboxToken;
  console.log('Mapbox initialized with token:', mapboxToken.substring(0, 8) + '...');
  
  // Test token validity immediately
  fetch(`https://api.mapbox.com/styles/v1/mapbox/dark-v11?access_token=${mapboxToken}`)
    .then(response => {
      if (response.ok) {
        console.log('Mapbox token validation: SUCCESS');
      } else {
        console.error('Mapbox token validation failed:', response.status, response.statusText);
      }
    })
    .catch(error => {
      console.error('Mapbox token test failed:', error);
    });
} else {
  console.error('Mapbox token not found - check environment configuration');
}

export const mapConfig = {
  style: 'mapbox://styles/mapbox/dark-v11',
  center: [-87.6298, 41.8781] as [number, number],
  zoom: 10,
  minZoom: 8,
  maxZoom: 16,
};

export function createMap(container: string | HTMLElement): mapboxgl.Map {
  console.log('Creating Mapbox map with config:', mapConfig);
  console.log('Current Mapbox token:', mapboxgl.accessToken ? mapboxgl.accessToken.substring(0, 8) + '...' : 'MISSING');
  
  const map = new mapboxgl.Map({
    container,
    ...mapConfig,
  });

  // Add comprehensive error handling
  map.on('error', (e) => {
    console.error('Mapbox map error:', e);
    console.error('Error details:', {
      type: e.type,
      error: e.error,
      message: e.error?.message
    });
  });

  map.on('load', () => {
    console.log('Mapbox map loaded successfully');
  });

  map.on('style.load', () => {
    console.log('Mapbox style loaded successfully');
  });

  return map;
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
    
    // Debug: Check map state before adding layers
    console.log('Pre-layer debug:', {
      allLayers: map.getStyle().layers.map(l => l.id),
      existingSource: !!map.getSource(layerId),
      mapLoaded: map.loaded(),
      styleLoaded: map.isStyleLoaded()
    });
    
    try {
      // Remove existing layers
      cleanupLayers(map, layerId);
      
      // Add source
      map.addSource(layerId, {
        type: 'geojson',
        data: data
      });
      
      // Calculate values for color scaling with improved quartile distribution
      const propertyKey = `${selectedDisease}_${visualizationMode}`;
      const values = data.features
        .map(f => f.properties?.[propertyKey])
        .filter(v => typeof v === 'number' && v > 0)
        .sort((a, b) => a - b);

      if (values.length === 0) {
        console.error('No valid data values found');
        return;
      }

      // Use percentile-based scaling for better color distribution
      const min = values[Math.floor(values.length * 0.05)]; // Skip bottom 5% outliers
      const q25 = values[Math.floor(values.length * 0.25)];
      const median = values[Math.floor(values.length * 0.5)];
      const q75 = values[Math.floor(values.length * 0.75)];
      const max = values[Math.floor(values.length * 0.95)]; // Skip top 5% outliers

      console.log(`Color scale for ${propertyKey}: ${min} → ${q25} → ${median} → ${q75} → ${max}`);
      console.log(`Sample feature values:`, data.features.slice(0, 3).map(f => ({ 
        name: f.properties?.name, 
        [propertyKey]: f.properties?.[propertyKey] 
      })));

      // Set quartile data for Legend component
      (window as any).__CURRENT_QUARTILES__ = {
        disease: selectedDisease,
        mode: visualizationMode,
        quartiles: {
          min,
          q25,
          median,
          q75,
          max
        }
      };

      // Add fill layer with explicit layout properties
      map.addLayer({
        id: `${layerId}-fill`,
        type: 'fill',
        source: layerId,
        layout: {
          'visibility': 'visible'
        },
        paint: {
          'fill-color': [
            'interpolate',
            ['linear'],
            ['get', propertyKey],
            min, '#16a34a',    // Dark green - use actual data min
            q25, '#eab308',    // Yellow - use actual data q25
            q75, '#f97316',    // Orange - use actual data q75
            max, '#dc2626'     // Red - use actual data max
          ],
          'fill-opacity': 0.8
        }
      });

      // Add border layer
      map.addLayer({
        id: `${layerId}-line`,
        type: 'line',
        source: layerId,
        paint: {
          'line-color': '#333333',
          'line-width': 1.0,
          'line-opacity': 0.9
        }
      });

      // Force enable all map interaction controls after adding layers
      setTimeout(() => {
        map.dragPan.enable();
        map.scrollZoom.enable();
        map.boxZoom.enable();
        map.doubleClickZoom.enable();
        map.touchZoomRotate.enable();
        map.keyboard.enable();
        
        // Ensure the map canvas is properly interactive
        const canvas = map.getCanvas();
        canvas.style.pointerEvents = 'auto';
        canvas.style.touchAction = 'none';
        
        console.log(`🎮 Map controls reactivated for ${layerId}`);
      }, 50);
      
      console.log(`✅ Successfully added layers for ${layerId}`);
      
      // Force layer visibility and check if they're actually rendered
      setTimeout(() => {
        const fillLayer = map.getLayer(`${layerId}-fill`);
        const lineLayer = map.getLayer(`${layerId}-line`);
        console.log('Complete layer debug:', {
          fillLayerExists: !!fillLayer,
          lineLayerExists: !!lineLayer,
          allLayers: map.getStyle().layers.map(l => l.id),
          sourceExists: !!map.getSource(layerId),
          featureCount: map.querySourceFeatures(layerId).length
        });
        
        if (fillLayer) {
          map.setLayoutProperty(`${layerId}-fill`, 'visibility', 'visible');
        }
        
        if (lineLayer) {
          map.setLayoutProperty(`${layerId}-line`, 'visibility', 'visible');
        }
        
        // Force map repaint
        map.triggerRepaint();
      }, 100);

    } catch (error) {
      console.error('Error adding layers:', error);
    }
  };

  tryAddLayer();
}

function cleanupLayers(map: mapboxgl.Map, layerId: string) {
  // Only clean up OTHER view layers, not the current one (fixes production flickering)
  const allViewTypes = ['census-data', 'community-data', 'wards-data'];
  const layerSuffixes = ['-fill', '-line'];
  
  allViewTypes.forEach(viewType => {
    // Skip cleanup for the layer we're about to add
    if (viewType === layerId) return;
    
    layerSuffixes.forEach(suffix => {
      const fullLayerId = `${viewType}${suffix}`;
      if (map.getLayer(fullLayerId)) {
        try {
          map.removeLayer(fullLayerId);
        } catch (e) {
          // Ignore removal errors
        }
      }
    });
    
    // Remove sources for other views only
    if (map.getSource(viewType)) {
      try {
        map.removeSource(viewType);
      } catch (e) {
        // Ignore removal errors
      }
    }
  });
  
  console.log(`🧹 Production-safe cleanup: preserved ${layerId}, removed others`);
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