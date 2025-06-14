import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { VisualizationMode, DiseaseType } from '@/types';
import { ColorScale } from '@/lib/dynamic-color-scaling';

interface LegendProps {
  visualizationMode: VisualizationMode;
  selectedDisease: DiseaseType;
}

export default function Legend({ visualizationMode, selectedDisease }: LegendProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [currentQuartiles, setCurrentQuartiles] = useState<ColorScale | null>(null);
  
  const legendNote = visualizationMode === 'count' ? 'Total patient counts' : 'Per 1,000 residents';

  // Check for dynamic quartile data from the map
  useEffect(() => {
    const checkQuartiles = () => {
      const quartileData = (window as any).__CURRENT_QUARTILES__;
      if (quartileData && 
          quartileData.disease === selectedDisease && 
          quartileData.mode === visualizationMode) {
        setCurrentQuartiles(quartileData.quartiles);
      }
    };

    checkQuartiles();
    const interval = setInterval(checkQuartiles, 500);
    return () => clearInterval(interval);
  }, [selectedDisease, visualizationMode]);

  // Get dynamic ranges from quartiles or fallback to static ranges
  const getRanges = () => {
    if (currentQuartiles) {
      return {
        min: Math.round(currentQuartiles.min).toLocaleString(),
        low: Math.round(currentQuartiles.q25).toLocaleString(),
        med: Math.round(currentQuartiles.median).toLocaleString(), 
        high: Math.round(currentQuartiles.q75).toLocaleString(),
        max: Math.round(currentQuartiles.max).toLocaleString() + '+'
      };
    }
    
    // Fallback static ranges (should rarely be used)
    return { min: '0', low: '25', med: '50', high: '75', max: '100+' };
  };

  const ranges = getRanges();

  return (
    <div 
      className="fixed bottom-6 left-6 backdrop-blur-[16px] rounded-lg z-[100] transition-all duration-300"
      style={{
        background: 'rgba(20, 20, 20, 0.95)',
        border: '1px solid var(--border-rush)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
        width: isExpanded ? '240px' : '48px',
        height: isExpanded ? 'auto' : '48px',
        overflow: 'hidden'
      }}
    >
      <div className="flex items-center justify-between p-3">
        <h4 
          className={`text-sm font-semibold transition-opacity duration-200 ${isExpanded ? 'opacity-100' : 'opacity-0'}`}
          style={{ color: 'var(--text-primary)' }}
        >
          {isExpanded ? 'Disease Prevalence' : ''}
        </h4>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-center hover:bg-gray-700 rounded p-1 transition-colors ml-auto"
          style={{ color: 'var(--text-primary)' }}
          aria-label={isExpanded ? 'Minimize legend' : 'Expand legend'}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
      </div>
      
      {isExpanded && (
        <div className="px-3 pb-3 transition-opacity duration-200">
          <div className="mb-2">
            <div 
              className="w-[200px] h-3 rounded-md mb-2"
              style={{
                background: 'linear-gradient(to right, #16a34a, #22c55e, #eab308, #f97316, #dc2626, #b91c1c, #7f1d1d)'
              }}
            />
            <div className="flex justify-between text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
              <span>{ranges.min}</span>
              <span>{ranges.med}</span>
              <span>{ranges.high}</span>
              <span>{ranges.max}</span>
            </div>
          </div>
          
          <p 
            className="text-xs text-center"
            style={{ color: 'var(--text-muted)' }}
          >
            {legendNote}
          </p>
        </div>
      )}
    </div>
  );
}
