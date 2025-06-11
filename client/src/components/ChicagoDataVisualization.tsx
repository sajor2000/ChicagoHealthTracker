import { useState, useMemo } from 'react';
import { AreaData, ViewMode, DiseaseType, VisualizationMode } from '@/types';
import { useChicagoGeoData } from '@/hooks/useMapData';
import { formatNumber, formatRate, getDiseaseColor, getDiseaseInfo } from '@/lib/utils';

interface ChicagoDataVisualizationProps {
  activeView: ViewMode;
  selectedDisease: DiseaseType;
  visualizationMode: VisualizationMode;
  showSuppressed: boolean;
  onAreaSelect: (area: AreaData) => void;
}

export default function ChicagoDataVisualization({
  activeView,
  selectedDisease,
  visualizationMode,
  showSuppressed,
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
      const coords = feature.geometry.coordinates;
      const flatCoords = coords.flat(4);
      
      for (let i = 0; i < flatCoords.length; i += 2) {
        const lng = flatCoords[i];
        const lat = flatCoords[i + 1];
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
    });

    const width = 800;
    const height = 600;
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
    return (
      <div className="flex items-center justify-center h-full text-center p-8">
        <div>
          <div className="text-status-error mb-4">Data Loading Error</div>
          <div className="text-text-tertiary text-sm">
            Unable to load authentic Chicago community boundaries
          </div>
        </div>
      </div>
    );
  }

  if (!svgBounds) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-text-tertiary">Processing geographic boundaries...</div>
      </div>
    );
  }

  const diseaseInfo = getDiseaseInfo(selectedDisease);

  return (
    <div className="h-full relative bg-bg-base">
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${svgBounds.width} ${svgBounds.height}`}
        className="absolute inset-0"
      >
        {geoData.features.map((feature) => {
          const area = feature.properties;
          const disease = area.diseases[selectedDisease];
          const value = visualizationMode === 'count' ? disease?.count || 0 : disease?.rate || 0;
          const maxValue = visualizationMode === 'count' ? 5000 : 25;
          const fillColor = value > 0 ? getDiseaseColor(value / maxValue * 100) : '#374151';
          const isHovered = hoveredArea === area.id;

          return (
            <g key={area.id}>
              <path
                d={geometryToPath(feature.geometry)}
                fill={fillColor}
                stroke="#006747"
                strokeWidth={isHovered ? 2 : 0.5}
                strokeOpacity={0.8}
                fillOpacity={0.8}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredArea(area.id)}
                onMouseLeave={() => setHoveredArea(null)}
                onClick={() => onAreaSelect(area)}
              />
              
              {/* Area labels for larger communities */}
              {activeView === 'community' && (() => {
                try {
                  let centerCoords: number[] = [];
                  
                  if (feature.geometry.type === 'MultiPolygon') {
                    const polygon = feature.geometry.coordinates[0];
                    if (polygon && polygon[0] && polygon[0][0]) {
                      centerCoords = polygon[0][0];
                    }
                  } else if (feature.geometry.type === 'Polygon') {
                    const ring = feature.geometry.coordinates[0];
                    if (ring && ring[0]) {
                      centerCoords = ring[0];
                    }
                  }
                  
                  if (centerCoords.length >= 2) {
                    const [x, y] = projectToSVG(centerCoords[0], centerCoords[1]);
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="#e5e7eb"
                        fontSize="8"
                        textAnchor="middle"
                        className="pointer-events-none font-mono"
                        style={{ userSelect: 'none' }}
                      >
                        {area.name.split(' ')[0]}
                      </text>
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