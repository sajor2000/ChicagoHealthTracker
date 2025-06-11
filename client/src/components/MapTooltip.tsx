import { TooltipData } from '@/types';
import { formatNumber, formatRate } from '@/lib/utils';

interface MapTooltipProps {
  data: TooltipData;
}

export default function MapTooltip({ data }: MapTooltipProps) {
  return (
    <div 
      className="min-w-[200px] p-4 rounded-lg border"
      style={{
        background: 'var(--bg-overlay)',
        borderColor: 'var(--border-rush)',
        fontFamily: 'var(--font-primary)',
        color: 'var(--text-secondary)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
      }}
    >
      <h5 
        className="font-semibold mb-3 text-sm"
        style={{ color: 'var(--text-primary)' }}
      >
        {data.name}
      </h5>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span style={{ color: 'var(--text-tertiary)' }}>Population:</span>
          <strong 
            className="font-mono"
            style={{ color: 'var(--text-primary)' }}
          >
            {formatNumber(data.population)}
          </strong>
        </div>
        
        <div className="flex justify-between items-center text-xs">
          <span style={{ color: 'var(--text-tertiary)' }}>Patients:</span>
          <strong 
            className="font-mono"
            style={{ color: 'var(--text-primary)' }}
          >
            {formatNumber(data.patientCount)}
          </strong>
        </div>
        
        <div className="flex justify-between items-center text-xs">
          <span style={{ color: 'var(--text-tertiary)' }}>Rate:</span>
          <strong 
            className="font-mono"
            style={{ color: 'var(--rush-primary-light)' }}
          >
            {formatRate(data.rate)} per 1,000
          </strong>
        </div>
      </div>
    </div>
  );
}
