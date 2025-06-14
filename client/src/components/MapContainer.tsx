import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { createMap, addDataLayer, createTooltip, updateTooltipContent, fitBoundsToFeature } from '@/lib/mapbox-deployment';
import { AreaData, ViewMode, DiseaseType, VisualizationMode } from '@/types';
import { useChicagoGeoData } from '@/hooks/useMapData';
import ChicagoDataVisualization from './ChicagoDataVisualization';

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
  const [useMapboxFallback, setUseMapboxFallback] = useState(false);
  const [mapStyleLoaded, setMapStyleLoaded] = useState(false);

  const { data: geoData, isLoading, error } = useChicagoGeoData(activeView);

  // Check if Mapbox token is available
  const hasMapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    try {
      const containerElement = mapContainer.current;
      containerElement.id = 'map';
      
      // Clear any existing content
      containerElement.innerHTML = '';
      
      map.current = createMap('map');
      tooltip.current = createTooltip();

      // Add map load event listener
      map.current.on('load', () => {
        console.log('Mapbox map loaded successfully');
        setMapStyleLoaded(true);
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e.error);
        setUseMapboxFallback(true);
      });

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
      setUseMapboxFallback(true);
    }
  }, []);

  // Clear all geographic layers to ensure only current view is shown
  const clearAllGeographicLayers = () => {
    if (!map.current) return;
    
    const allViewTypes = ['census', 'community', 'wards'];
    const layerSuffixes = ['-data-fill', '-data-border', '-data-hover', '-data-labels', '-data-population'];
    
    allViewTypes.forEach(viewType => {
      layerSuffixes.forEach(suffix => {
        const layerName = `${viewType}${suffix}`;
        if (map.current!.getLayer(layerName)) {
          map.current!.removeLayer(layerName);
        }
      });
      
      // Remove the source as well
      const sourceName = `${viewType}-data`;
      if (map.current!.getSource(sourceName)) {
        map.current!.removeSource(sourceName);
      }
    });
  };

  // Update map data when props change
  useEffect(() => {
    console.log('Map data update:', {
      hasMap: !!map.current,
      hasGeoData: !!geoData,
      isLoading,
      activeView,
      selectedDisease,
      mapStyleLoaded,
      featuresCount: (geoData as any)?.features?.length
    });

    if (!map.current || !geoData || isLoading) return;

    const layerId = `${activeView}-data`;

    try {
      // Clear all existing geographic layers first
      clearAllGeographicLayers();

      // Process data for visualization
      const geoDataTyped = geoData as any;
      console.log('Raw geoData sample:', {
        type: geoDataTyped.type,
        featuresCount: geoDataTyped.features?.length,
        firstFeatureProps: geoDataTyped.features?.[0]?.properties ? Object.keys(geoDataTyped.features[0].properties) : 'none',
        firstFeatureDiseases: geoDataTyped.features?.[0]?.properties?.diseases ? Object.keys(geoDataTyped.features[0].properties.diseases) : 'none'
      });

      const processedData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: geoDataTyped.features.map((feature: any) => {
          const diseaseData = feature.properties?.diseases?.[selectedDisease];
          const count = diseaseData?.count || 0;
          const rate = diseaseData?.rate || 0;
          
          return {
            ...feature,
            properties: {
              ...feature.properties,
              [`${selectedDisease}_count`]: count,
              [`${selectedDisease}_rate`]: rate,
            },
            geometry: feature.geometry as GeoJSON.Geometry
          } as GeoJSON.Feature;
        })
      };

      console.log('Processed data ready:', {
        featuresCount: processedData.features.length,
        sampleFeature: processedData.features[0]?.properties,
        hasGeometry: !!processedData.features[0]?.geometry
      });

      // Filter suppressed data if needed
      if (!showSuppressed) {
        processedData.features = processedData.features.filter(feature => 
          feature.properties && feature.properties[`${selectedDisease}_count`] >= 11
        );
      }

      // Convert visualization mode to count/rate for Mapbox compatibility
      const mapboxMode = visualizationMode === 'age_adjusted' ? 'rate' : visualizationMode as 'count' | 'rate';
      addDataLayer(map.current, processedData, layerId, selectedDisease, mapboxMode);
      setupMapInteractions(layerId);

    } catch (error) {
      console.error('Error updating map data:', error);
    }
  }, [geoData, activeView, selectedDisease, visualizationMode, showSuppressed, isLoading, mapStyleLoaded]);

  // Setup map interactions
  const setupMapInteractions = (layerId: string) => {
    if (!map.current || !tooltip.current) return;

    const fillLayerId = `${layerId}-fill`;
    
    // Remove existing event listeners for old layers
    const allPossibleLayers = ['community-data-fill', 'census-data-fill'];
    allPossibleLayers.forEach(layer => {
      if (map.current && map.current.getLayer(layer)) {
        try {
          // Remove all event listeners for this layer - use proper method signature
          const mapInstance = map.current as any;
          mapInstance.off('mouseenter', layer, undefined);
          mapInstance.off('mouseleave', layer, undefined);
          mapInstance.off('click', layer, undefined);
        } catch (e) {
          // Ignore errors when removing non-existent listeners
        }
      }
    });

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
          density: properties.density || 0,
          patientCount: properties[`${selectedDisease}_count`] || 0,
          rate: properties[`${selectedDisease}_rate`] || 0,
          diseaseName: selectedDisease,
          diseaseCount: properties[`${selectedDisease}_count`] || 0,
          diseaseRate: properties[`${selectedDisease}_rate`] || 0,
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
        const selectedFeature = (geoData as any).features.find((f: any) => f.id === properties.id);
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
        className="fixed inset-0 top-32"
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

  // Use Mapbox if token is available and not using fallback, otherwise fall back to SVG
  if (!hasMapboxToken || useMapboxFallback) {
    return (
      <ChicagoDataVisualization
        activeView={activeView}
        selectedDisease={selectedDisease}
        visualizationMode={visualizationMode}
        showSuppressed={showSuppressed}
        onAreaSelect={onAreaSelect}
      />
    );
  }

  return (
    <div 
      id="map"
      ref={mapContainer}
      className={`fixed inset-0 top-32 ${isLoading ? 'loading' : ''}`}
      style={{ background: 'var(--bg-base)' }}
    />
  );
}
