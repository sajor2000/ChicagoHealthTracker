import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { VisualizationMode, DiseaseType } from '@/types';

interface LegendProps {
  visualizationMode: VisualizationMode;
  selectedDisease: DiseaseType;
}

export default function Legend({ visualizationMode, selectedDisease }: LegendProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const legendNote = visualizationMode === 'count' ? 'Total patient counts' : 'Per 1,000 residents';

  // Disease-specific legend ranges based on actual data distributions
  const getLegendRanges = (disease: DiseaseType) => {
    switch (disease) {
      case 'diabetes':
        return { min: '20', low: '42', med: '57', high: '71', max: '84+' };
      case 'hypertension':
        return { min: '74', low: '144', med: '178', high: '221', max: '254+' };
      case 'heart':
        return { min: '12', low: '27', med: '37', high: '45', max: '54+' };
      case 'stroke':
        return { min: '8', low: '17', med: '22', high: '28', max: '36+' };
      case 'asthma':
        return { min: '11', low: '22', med: '28', high: '35', max: '40+' };
      case 'copd':
        return { min: '14', low: '31', med: '41', high: '52', max: '60+' };
      case 'obesity':
        return { min: '42', low: '75', med: '91', high: '111', max: '130+' };
      case 'depression':
      case 'mental_health':
        return { min: '18', low: '27', med: '29', high: '35', max: '38+' };
      default:
        return { min: '7', low: '25', med: '37', high: '68', max: '138+' };
    }
  };

  const ranges = getLegendRanges(selectedDisease);

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
                background: 'linear-gradient(to right, #006747, #4a8c2a, #a4c441, #f4e04d, #ff8c42, #f76c5e, #d32f2f, #8b0000)'
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
