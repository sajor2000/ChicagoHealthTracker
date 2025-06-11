import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { createMap, addDataLayer, createTooltip, updateTooltipContent, fitBoundsToFeature } from '@/lib/mapbox';
import { AreaData, ViewMode, DiseaseType, VisualizationMode, ChicagoGeoData } from '@/types';
import { useChicagoGeoData } from '@/hooks/useMapData';

interface MapContainerProps {
  activeView: ViewMode;
  selectedDisease: DiseaseType;
  visualizationMode: VisualizationMode;
  showSuppressed: boolean;
  onAreaSelect: (area: AreaData) => void;
}

export default function MapContainer({
  activeView,
  selectedDisease,
  visualizationMode,
  showSuppressed,
  onAreaSelect,
}: MapContainerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const tooltip = useRef<mapboxgl.Popup | null>(null);
  const [hoveredFeatureId, setHoveredFeatureId] = useState<string | null>(null);

  const { data: geoData, isLoading, error } = useChicagoGeoData(activeView);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Check for Mapbox token
    const hasValidToken = mapboxgl.accessToken && mapboxgl.accessToken !== 'default_token';
    
    if (!hasValidToken) {
      // Show fallback message
      mapContainer.current.innerHTML = `
        <div class="flex items-center justify-center h-full text-center p-8" style="background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%); color: var(--text-tertiary); font-family: var(--font-mono); font-size: 14px;">
          <div>
            <div style="margin-bottom: 16px; color: var(--rush-primary); font-size: 18px;">
              🗺️
            </div>
            <div>Interactive Chicago Disease Map</div>
            <div style="font-size: 12px; margin-top: 8px; opacity: 0.7;">
              Mapbox token required for map display
            </div>
          </div>
        </div>
      `;
      return;
    }

    try {
      map.current = createMap(mapContainer.current.id);
      tooltip.current = createTooltip();

      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
        if (tooltip.current) {
          tooltip.current.remove();
          tooltip.current = null;
        }
      };
    } catch (error) {
      console.error('Error initializing map:', error);
      mapContainer.current.innerHTML = `
        <div class="flex items-center justify-center h-full text-center p-8" style="background: var(--bg-base); color: var(--text-tertiary);">
          <div>
            <div style="margin-bottom: 16px; color: var(--status-error);">⚠️</div>
            <div>Map initialization failed</div>
            <div style="font-size: 12px; margin-top: 8px; opacity: 0.7;">
              Please check Mapbox configuration
            </div>
          </div>
        </div>
      `;
    }
  }, []);

  // Update map data when props change
  useEffect(() => {
    if (!map.current || !geoData || isLoading) return;

    const layerId = `${activeView}-data`;

    try {
      // Process data for visualization
      const processedData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: geoData.features.map(feature => ({
          ...feature,
          properties: {
            ...feature.properties,
            [`${selectedDisease}_count`]: feature.properties.diseases[selectedDisease]?.count || 0,
            [`${selectedDisease}_rate`]: feature.properties.diseases[selectedDisease]?.rate || 0,
          }
        }))
      };

      // Filter suppressed data if needed
      if (!showSuppressed) {
        processedData.features = processedData.features.filter(feature => 
          feature.properties[`${selectedDisease}_count`] >= 11
        );
      }

      addDataLayer(map.current, processedData, layerId, selectedDisease, visualizationMode);
      setupMapInteractions(layerId);

    } catch (error) {
      console.error('Error updating map data:', error);
    }
  }, [geoData, activeView, selectedDisease, visualizationMode, showSuppressed, isLoading]);

  // Setup map interactions
  const setupMapInteractions = (layerId: string) => {
    if (!map.current || !tooltip.current) return;

    const fillLayerId = `${layerId}-fill`;

    // Mouse enter event
    map.current.on('mouseenter', fillLayerId, (e) => {
      if (!map.current || !tooltip.current || !e.features?.length) return;

      map.current.getCanvas().style.cursor = 'pointer';
      
      const feature = e.features[0];
      const properties = feature.properties;
      
      if (properties) {
        // Set hover state
        if (hoveredFeatureId !== null) {
          map.current.setFeatureState(
            { source: layerId, id: hoveredFeatureId },
            { hover: false }
          );
        }
        
        setHoveredFeatureId(properties.id);
        map.current.setFeatureState(
          { source: layerId, id: properties.id },
          { hover: true }
        );

        // Show tooltip
        const tooltipContent = updateTooltipContent({
          name: properties.name || 'Unknown Area',
          population: properties.population || 0,
          patientCount: properties[`${selectedDisease}_count`] || 0,
          rate: properties[`${selectedDisease}_rate`] || 0,
        });

        tooltip.current
          .setLngLat(e.lngLat)
          .setHTML(tooltipContent)
          .addTo(map.current);
      }
    });

    // Mouse leave event
    map.current.on('mouseleave', fillLayerId, () => {
      if (!map.current || !tooltip.current) return;

      map.current.getCanvas().style.cursor = '';
      
      if (hoveredFeatureId !== null) {
        map.current.setFeatureState(
          { source: layerId, id: hoveredFeatureId },
          { hover: false }
        );
        setHoveredFeatureId(null);
      }

      tooltip.current.remove();
    });

    // Click event
    map.current.on('click', fillLayerId, (e) => {
      if (!map.current || !e.features?.length) return;

      const feature = e.features[0];
      const properties = feature.properties;
      
      if (properties && geoData) {
        const selectedFeature = geoData.features.find(f => f.id === properties.id);
        if (selectedFeature) {
          onAreaSelect(selectedFeature.properties);
          fitBoundsToFeature(map.current, selectedFeature);
        }
      }
    });
  };

  if (error) {
    return (
      <div 
        id="map"
        ref={mapContainer}
        className="fixed inset-0 top-20"
        style={{ background: 'var(--bg-base)' }}
      >
        <div className="flex items-center justify-center h-full text-center p-8">
          <div style={{ color: 'var(--text-tertiary)' }}>
            <div style={{ marginBottom: '16px', color: 'var(--status-error)', fontSize: '24px' }}>⚠️</div>
            <div>Failed to load map data</div>
            <div style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>
              {error.message || 'Please try refreshing the page'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="map"
      ref={mapContainer}
      className={`fixed inset-0 top-20 ${isLoading ? 'loading' : ''}`}
      style={{ background: 'var(--bg-base)' }}
    />
  );
}
