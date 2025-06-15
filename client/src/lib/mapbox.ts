import mapboxgl from 'mapbox-gl';
import type { MapFeature, TooltipData } from '@/types';
import { getMapboxToken, isDeploymentEnvironment } from './deployment-config';

// Configure Mapbox with deployment-ready token access
const mapboxToken = getMapboxToken();

if (!mapboxToken) {
  console.error('MAPBOX ACCESS TOKEN MISSING - Maps will not load');
  console.log('Available env vars:', Object.keys(import.meta.env));
  console.log('Deployment environment:', window.location.hostname);
  console.log('Is deployment:', isDeploymentEnvironment());
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
        setTimeout(attemptAddLayer, isDeploymentEnvironment() ? 800 : 200);
        return;
      }

    // Remove existing layers if they exist
    const existingLayers = [`${layerId}-fill`, `${layerId}-border`, `${layerId}-hover`, `${layerId}-labels`, `${layerId}-population`];
    existingLayers.forEach(layer => {
      if (map.getLayer(layer)) {
        console.log('Removing existing layer:', layer);
        map.removeLayer(layer);
      }
    });

    // Remove existing source if it exists
    if (map.getSource(layerId)) {
      console.log('Updating existing source:', layerId);
      (map.getSource(layerId) as mapboxgl.GeoJSONSource).setData(data);
    } else {
      console.log('Adding new source:', layerId);
      map.addSource(layerId, {
        type: 'geojson',
        data,
      });
    }

    const propertyKey = `${selectedDisease}_${visualizationMode}`;

    // Calculate dynamic color scaling based on actual data values
    const values = data.features
      .map(f => f.properties?.[propertyKey])
      .filter(v => typeof v === 'number' && v > 0)
      .sort((a, b) => a - b);

    if (values.length === 0) {
      console.warn('No valid data values found for', propertyKey);
      return;
    }

    const min = values[0];
    const q25 = values[Math.floor(values.length * 0.25)];
    const median = values[Math.floor(values.length * 0.5)];
    const q75 = values[Math.floor(values.length * 0.75)];
    const q90 = values[Math.floor(values.length * 0.9)];
    const q95 = values[Math.floor(values.length * 0.95)];
    const max = values[values.length - 1];

    console.log(`Dynamic color scaling for ${selectedDisease} (${visualizationMode}):`, {
      min, q25, median, q75, q90, q95, max
    });

    // Disease-specific color gradients based on epidemiological characteristics
    let colorStops;
    const range = max - min;
    
    console.log(`Applying disease-specific color gradient for ${selectedDisease}, Range: ${range}`);
    
    switch (selectedDisease) {
      case 'diabetes':
        // Diabetes: Blue-to-red gradient reflecting metabolic health
        const diabetesStep = range / 6;
        colorStops = [
          min, '#1e40af',                      // Deep blue - excellent control
          min + diabetesStep, '#3b82f6',       // Blue - good control
          min + diabetesStep * 2, '#06b6d4',   // Cyan - moderate control
          min + diabetesStep * 3, '#eab308',   // Yellow - concerning levels
          min + diabetesStep * 4, '#f97316',   // Orange - poor control
          min + diabetesStep * 5, '#dc2626',   // Red - dangerous levels
          max, '#7f1d1d'                       // Dark red - crisis levels
        ];
        break;
        
      case 'hypertension':
        // Hypertension: Green-to-red gradient reflecting blood pressure ranges
        const htnStep = range / 6;
        colorStops = [
          min, '#059669',                      // Green - normal BP
          min + htnStep, '#10b981',           // Light green - elevated
          min + htnStep * 2, '#84cc16',       // Yellow-green - pre-hypertension
          min + htnStep * 3, '#eab308',       // Yellow - stage 1 HTN
          min + htnStep * 4, '#f97316',       // Orange - stage 2 HTN
          min + htnStep * 5, '#dc2626',       // Red - severe HTN
          max, '#991b1b'                      // Dark red - hypertensive crisis
        ];
        break;
        
      case 'heart_disease':
        // Heart disease: Purple-to-red gradient reflecting cardiac risk
        const hdStep = range / 6;
        colorStops = [
          min, '#7c3aed',                     // Purple - low cardiac risk
          min + hdStep, '#a855f7',           // Light purple - mild risk
          min + hdStep * 2, '#ec4899',       // Pink - moderate risk
          min + hdStep * 3, '#f97316',       // Orange - elevated risk
          min + hdStep * 4, '#dc2626',       // Red - high risk
          min + hdStep * 5, '#b91c1c',       // Dark red - very high risk
          max, '#7f1d1d'                     // Very dark red - critical risk
        ];
        break;
        
      case 'stroke':
        // Stroke: Teal-to-red gradient reflecting stroke risk
        const strokeStep = range / 6;
        colorStops = [
          min, '#0d9488',                     // Teal - low stroke risk
          min + strokeStep, '#14b8a6',       // Light teal - mild risk
          min + strokeStep * 2, '#22d3ee',   // Cyan - moderate risk
          min + strokeStep * 3, '#fbbf24',   // Amber - elevated risk
          min + strokeStep * 4, '#f97316',   // Orange - high risk
          min + strokeStep * 5, '#dc2626',   // Red - very high risk
          max, '#7f1d1d'                     // Dark red - extreme risk
        ];
        break;
        
      case 'asthma':
        // Asthma: Light blue-to-red gradient reflecting respiratory health
        const asthmaStep = range / 6;
        colorStops = [
          min, '#0ea5e9',                     // Sky blue - clear breathing
          min + asthmaStep, '#38bdf8',       // Light blue - mild symptoms
          min + asthmaStep * 2, '#67e8f9',   // Cyan - moderate symptoms
          min + asthmaStep * 3, '#fde047',   // Yellow - concerning symptoms
          min + asthmaStep * 4, '#fb923c',   // Orange - severe symptoms
          min + asthmaStep * 5, '#dc2626',   // Red - dangerous symptoms
          max, '#7f1d1d'                     // Dark red - life-threatening
        ];
        break;
        
      case 'copd':
        // COPD: Gray-to-red gradient reflecting lung function decline
        const copdStep = range / 6;
        colorStops = [
          min, '#64748b',                     // Gray - mild limitation
          min + copdStep, '#94a3b8',         // Light gray - moderate limitation
          min + copdStep * 2, '#cbd5e1',     // Very light gray - significant limitation
          min + copdStep * 3, '#fbbf24',     // Amber - severe limitation
          min + copdStep * 4, '#f97316',     // Orange - very severe
          min + copdStep * 5, '#dc2626',     // Red - end-stage
          max, '#7f1d1d'                     // Dark red - critical
        ];
        break;
        
      case 'obesity':
        // Obesity: Orange-to-red gradient reflecting BMI categories
        const obesityStep = range / 6;
        colorStops = [
          min, '#22c55e',                     // Green - normal weight
          min + obesityStep, '#84cc16',      // Yellow-green - overweight
          min + obesityStep * 2, '#eab308',  // Yellow - obese class I
          min + obesityStep * 3, '#f97316',  // Orange - obese class II
          min + obesityStep * 4, '#dc2626',  // Red - obese class III
          min + obesityStep * 5, '#b91c1c',  // Dark red - morbidly obese
          max, '#7f1d1d'                     // Very dark red - super obese
        ];
        break;
        
      case 'mental_health':
        // Mental health: Indigo-to-red gradient reflecting psychological distress
        const mhStep = range / 6;
        colorStops = [
          min, '#4338ca',                     // Indigo - good mental health
          min + mhStep, '#6366f1',           // Light indigo - mild stress
          min + mhStep * 2, '#8b5cf6',       // Purple - moderate distress
          min + mhStep * 3, '#ec4899',       // Pink - significant distress
          min + mhStep * 4, '#f97316',       // Orange - severe distress
          min + mhStep * 5, '#dc2626',       // Red - crisis level
          max, '#7f1d1d'                     // Dark red - emergency
        ];
        break;
        
      default:
        // Fallback: Standard green-to-red gradient
        colorStops = [
          min, '#16a34a',        // Dark green - lowest values
          q25, '#22c55e',        // Medium green - 25th percentile
          median, '#eab308',     // Yellow - median
          q75, '#f97316',        // Orange - 75th percentile
          q90, '#dc2626',        // Red - 90th percentile
          q95, '#b91c1c',        // Dark red - 95th percentile
          max, '#7f1d1d'         // Very dark red - maximum values
        ];
    }
    
    console.log(`Disease-specific color stops for ${selectedDisease}:`, colorStops);

    // Add fill layer with adaptive color scaling
    map.addLayer({
      id: `${layerId}-fill`,
      type: 'fill',
      source: layerId,
      paint: {
        'fill-color': [
          'case',
          ['>', ['get', propertyKey], 0],
          ['interpolate', ['linear'], ['get', propertyKey], ...colorStops],
          'rgba(107, 114, 128, 0.3)' // Suppressed data color
        ],
        'fill-opacity': [
          'case',
          ['>', ['get', propertyKey], 0],
          0.85,  // Higher opacity for valid data
          0.3    // Lower opacity for suppressed data
        ]
      }
    });
    
    console.log(`✅ Added ${layerId}-fill layer with disease-specific color scaling for ${selectedDisease}`);

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

    console.log('✅ Successfully added map layers for:', layerId);
    
  } catch (error) {
    console.error('Error adding data layer:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      layerId,
      selectedDisease,
      visualizationMode,  
      dataValid: !!data && !!data.features,
      featuresCount: data?.features?.length
    });
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