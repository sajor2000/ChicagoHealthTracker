import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { VisualizationMode } from '@/types';

interface LegendProps {
  visualizationMode: VisualizationMode;
}

export default function Legend({ visualizationMode }: LegendProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const legendNote = visualizationMode === 'count' ? 'Total patient counts' : 'Per 1,000 residents';

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
                background: 'linear-gradient(to right, #006747, #4a8c2a, #a4c441, #f4e04d, #ff8c42, #f76c5e, #d32f2f)'
              }}
            />
            <div className="flex justify-between text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
              <span>Low</span>
              <span>Medium</span>
              <span>High</span>
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
