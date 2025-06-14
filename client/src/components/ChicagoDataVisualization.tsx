import { useState, useMemo } from 'react';
import { AreaData, ViewMode, DiseaseType, VisualizationMode } from '@/types';
import { useChicagoGeoData } from '@/hooks/useMapData';
import { formatNumber, formatRate, getDiseaseColor, getDiseaseInfo } from '@/lib/utils';

interface ChicagoDataVisualizationProps {
  activeView: ViewMode;
  selectedDisease: DiseaseType;
  visualizationMode: VisualizationMode;
  onAreaSelect: (area: AreaData) => void;
}

export default function ChicagoDataVisualization({
  activeView,
  selectedDisease,
  visualizationMode,
  onAreaSelect,
}: ChicagoDataVisualizationProps) {
  const { data: geoData, isLoading, error } = useChicagoGeoData(activeView);
  const [hoveredArea, setHoveredArea] = useState<string | null>(null);

  // Calculate SVG bounds and scaling for Chicago
  const svgBounds = useMemo(() => {
    if (!geoData?.features) return null;

    let minLng = Infinity, maxLng = -Infinity;
    let minLat = Infinity, maxLat = -Infinity;

    geoData.features.forEach(feature => {
      const processCoordinates = (coords: any) => {
        if (Array.isArray(coords[0])) {
          coords.forEach(processCoordinates);
        } else if (Array.isArray(coords) && coords.length >= 2) {
          const lng = coords[0];
          const lat = coords[1];
          if (typeof lng === 'number' && typeof lat === 'number') {
            if (lng < minLng) minLng = lng;
            if (lng > maxLng) maxLng = lng;
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
          }
        }
      };
      
      processCoordinates(feature.geometry.coordinates);
    });

    // Use Chicago-specific bounds if calculation fails
    if (minLng === Infinity) {
      minLng = -87.94;
      maxLng = -87.52;
      minLat = 41.64;
      maxLat = 42.02;
    }

    const width = 1000;
    const height = 800;
    const padding = 40;

    const scaleX = (width - 2 * padding) / (maxLng - minLng);
    const scaleY = (height - 2 * padding) / (maxLat - minLat);
    const scale = Math.min(scaleX, scaleY);

    return {
      minLng, maxLng, minLat, maxLat,
      width, height, padding, scale
    };
  }, [geoData]);

  // Convert lat/lng to SVG coordinates
  const projectToSVG = (lng: number, lat: number) => {
    if (!svgBounds) return [0, 0];
    
    const x = svgBounds.padding + (lng - svgBounds.minLng) * svgBounds.scale;
    const y = svgBounds.height - svgBounds.padding - (lat - svgBounds.minLat) * svgBounds.scale;
    
    return [x, y];
  };

  // Convert geometry to SVG path
  const geometryToPath = (geometry: any) => {
    if (!geometry || !geometry.coordinates) return '';

    let coords: number[][];
    
    if (geometry.type === 'MultiPolygon') {
      // For MultiPolygon, take the first polygon's exterior ring
      coords = geometry.coordinates[0][0];
    } else if (geometry.type === 'Polygon') {
      // For Polygon, take the exterior ring
      coords = geometry.coordinates[0];
    } else {
      return '';
    }

    if (!coords || coords.length === 0) return '';

    let path = '';
    coords.forEach((coord: number[], index: number) => {
      if (coord.length >= 2) {
        const [x, y] = projectToSVG(coord[0], coord[1]);
        path += index === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
      }
    });
    path += ' Z';

    return path;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-tertiary">Loading Chicago geographic data...</div>
      </div>
    );
  }

  if (error || !geoData?.features) {
    console.error('Geographic data error:', error);
    console.log('GeoData available:', !!geoData, 'Features count:', geoData?.features?.length);
    return (
      <div className="flex items-center justify-center h-full text-center p-8">
        <div>
          <div className="text-status-error mb-4">Data Loading Error</div>
          <div className="text-text-tertiary text-sm">
            Unable to load authentic Chicago community boundaries
          </div>
          <div className="text-text-tertiary text-xs mt-2">
            View: {activeView} | Features: {geoData?.features?.length || 0}
          </div>
        </div>
      </div>
    );
  }

  if (!svgBounds) {
    console.log('SVG bounds calculation failed, geoData:', geoData);
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-tertiary">Processing geographic boundaries...</div>
      </div>
    );
  }

  console.log('Rendering Chicago boundaries:', {
    view: activeView,
    featureCount: geoData.features.length,
    bounds: svgBounds,
    firstFeature: geoData.features[0]?.properties,
    firstGeometry: geoData.features[0]?.geometry?.type
  });

  const diseaseInfo = getDiseaseInfo(selectedDisease);

  return (
    <div className="h-full relative bg-bg-base">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${svgBounds.width} ${svgBounds.height}`}
        className="absolute inset-0"
        style={{ background: '#0a0a0a' }}
      >
        {geoData.features.map((feature, index) => {
          const area = feature.properties;
          const disease = area.diseases[selectedDisease];
          const value = visualizationMode === 'count' ? disease?.count || 0 : disease?.rate || 0;
          const maxValue = visualizationMode === 'count' ? 5000 : 25;
          const fillColor = value > 0 ? getDiseaseColor(value / maxValue * 100) : '#374151';
          const isHovered = hoveredArea === area.id;
          const pathData = geometryToPath(feature.geometry);

          // Debug first few features
          if (index < 3) {
            console.log(`Feature ${index}:`, {
              name: area.name,
              pathLength: pathData.length,
              pathStart: pathData.substring(0, 50),
              geometry: feature.geometry.type
            });
          }

          if (!pathData) {
            console.warn(`No path data for feature: ${area.name}`);
            return null;
          }

          return (
            <g key={area.id}>
              <path
                d={pathData}
                fill={fillColor}
                stroke="#006747"
                strokeWidth={isHovered ? 2 : 1}
                strokeOpacity={0.9}
                fillOpacity={0.7}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredArea(area.id)}
                onMouseLeave={() => setHoveredArea(null)}
                onClick={() => onAreaSelect(area)}
              />
              
              {/* Enhanced area labels with names and population */}
              {(() => {
                try {
                  let centerCoords: number[] = [];
                  
                  if (feature.geometry.type === 'MultiPolygon') {
                    const coordinates = feature.geometry.coordinates as number[][][][];
                    const polygon = coordinates[0];
                    if (polygon && polygon[0] && polygon[0][0]) {
                      centerCoords = polygon[0][0];
                    }
                  } else if (feature.geometry.type === 'Polygon') {
                    const coordinates = feature.geometry.coordinates as number[][][];
                    const ring = coordinates[0];
                    if (ring && ring[0]) {
                      centerCoords = ring[0];
                    }
                  }
                  
                  if (centerCoords.length >= 2) {
                    const [x, y] = projectToSVG(centerCoords[0], centerCoords[1]);
                    
                    // Determine label content based on view mode
                    const labelName = activeView === 'community' 
                      ? area.name 
                      : `Tract ${area.geoid?.slice(-4) || area.name.split(' ').pop()}`;
                    
                    const fontSize = activeView === 'community' ? '10' : '7';
                    const popSize = activeView === 'community' ? '8' : '6';
                    
                    return (
                      <g className="pointer-events-none">
                        <text
                          x={x}
                          y={y - 6}
                          fill="#ffffff"
                          fontSize={fontSize}
                          fontWeight="600"
                          textAnchor="middle"
                          className="font-sans"
                          style={{ 
                            userSelect: 'none',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                            filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.8))'
                          }}
                        >
                          {labelName}
                        </text>
                        <text
                          x={x}
                          y={y + 8}
                          fill="#e5e7eb"
                          fontSize={popSize}
                          textAnchor="middle"
                          className="font-mono"
                          style={{ 
                            userSelect: 'none',
                            textShadow: '1px 1px 1px rgba(0,0,0,0.6)',
                            filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.6))'
                          }}
                        >
                          Pop: {(area.population / 1000).toFixed(0)}k
                        </text>
                      </g>
                    );
                  }
                } catch (error) {
                  console.warn('Error rendering label for', area.name);
                }
                return null;
              })()}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {hoveredArea && (
        <div 
          className="absolute pointer-events-none z-10 bg-bg-card border border-border-primary rounded-lg p-3 shadow-lg"
          style={{
            top: '20px',
            right: '20px',
            maxWidth: '280px'
          }}
        >
          {(() => {
            const area = geoData.features.find(f => f.properties.id === hoveredArea)?.properties;
            if (!area) return null;
            
            const disease = area.diseases[selectedDisease];
            return (
              <div className="text-sm">
                <h5 className="font-semibold text-text-primary mb-2">{area.name}</h5>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Population:</span>
                    <span className="font-mono text-text-primary">{formatNumber(area.population)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">{diseaseInfo.name} Cases:</span>
                    <span className="font-mono text-text-primary">{formatNumber(disease?.count || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Rate:</span>
                    <span className="font-mono text-rush-primary-light">{formatRate(disease?.rate || 0)} per 1,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Data Quality:</span>
                    <span className="font-mono text-text-primary">{area.dataQuality}%</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-bg-card border border-border-primary rounded-lg p-4 shadow-lg">
        <h6 className="font-semibold text-text-primary mb-3 text-sm">
          {diseaseInfo.name} - {visualizationMode === 'count' ? 'Patient Count' : 'Rate per 1,000'}
        </h6>
        <div className="space-y-2">
          {[
            { color: getDiseaseColor(0), label: visualizationMode === 'count' ? '0' : '0.0' },
            { color: getDiseaseColor(25), label: visualizationMode === 'count' ? '1,250' : '6.3' },
            { color: getDiseaseColor(50), label: visualizationMode === 'count' ? '2,500' : '12.5' },
            { color: getDiseaseColor(75), label: visualizationMode === 'count' ? '3,750' : '18.8' },
            { color: getDiseaseColor(100), label: visualizationMode === 'count' ? '5,000+' : '25.0+' }
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded border border-border-primary"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-xs font-mono text-text-secondary">{item.label}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-3 pt-3 border-t border-border-primary">
          <div className="text-xs text-text-tertiary">
            View: {activeView === 'community' ? 'Community Areas' : 'Census Tracts'}
          </div>
          <div className="text-xs text-text-tertiary">
            Total Areas: {geoData.features.length}
          </div>
        </div>
      </div>
    </div>
  );
}