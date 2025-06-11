import { VisualizationMode } from '@/types';

interface LegendProps {
  visualizationMode: VisualizationMode;
}

export default function Legend({ visualizationMode }: LegendProps) {
  const legendNote = visualizationMode === 'count' ? 'Total patient counts' : 'Per 1,000 residents';

  return (
    <div 
      className="fixed bottom-6 left-6 backdrop-blur-[16px] rounded-lg p-4 z-[100]"
      style={{
        background: 'rgba(20, 20, 20, 0.95)',
        border: '1px solid var(--border-rush)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
      }}
    >
      <h4 
        className="text-sm font-semibold mb-3"
        style={{ color: 'var(--text-primary)' }}
      >
        Disease Prevalence
      </h4>
      
      <div className="mb-2">
        <div 
          className="w-[200px] h-3 rounded-md mb-2"
          style={{
            background: 'linear-gradient(to right, var(--data-lowest), var(--data-low), var(--data-medium), var(--data-high), var(--data-highest))'
          }}
        />
        <div className="flex justify-between text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>
          <span>0%</span>
          <span>5%</span>
          <span>10%</span>
          <span>15%</span>
          <span>20%+</span>
        </div>
      </div>
      
      <p 
        className="text-xs text-center"
        style={{ color: 'var(--text-muted)' }}
      >
        {legendNote}
      </p>
    </div>
  );
}
