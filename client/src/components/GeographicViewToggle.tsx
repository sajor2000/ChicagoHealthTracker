import { ViewMode } from '@/types';
import { MapPin, Home, Building2 } from 'lucide-react';

interface GeographicViewToggleProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function GeographicViewToggle({ activeView, onViewChange }: GeographicViewToggleProps) {
  return (
    <div 
      className="fixed top-[120px] right-6 z-[90] backdrop-blur-[12px] rounded-lg border"
      style={{
        background: 'rgba(20, 20, 20, 0.90)',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)'
      }}
    >
      {/* Header */}
      <div className="px-3 py-2 border-b border-[var(--border-subtle)]">
        <span 
          className="text-xs uppercase tracking-wider font-medium"
          style={{ 
            color: 'var(--text-tertiary)',
            letterSpacing: '0.06em'
          }}
        >
          Geographic View
        </span>
      </div>
      
      {/* Toggle Buttons */}
      <div className="p-2 flex flex-col gap-1">
        <button
          className={`flex items-center gap-2 px-3 py-2 rounded text-xs transition-all duration-200 text-left ${
            activeView === 'census' 
              ? 'text-white' 
              : 'hover:bg-[var(--bg-hover)]'
          }`}
          style={{
            background: activeView === 'census' ? 'var(--rush-primary)' : 'transparent',
            color: activeView === 'census' ? 'white' : 'var(--text-secondary)'
          }}
          onClick={() => onViewChange('census')}
          onMouseEnter={(e) => {
            if (activeView !== 'census') {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeView !== 'census') {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
          }}
        >
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="font-medium">Census Tracts</span>
        </button>
        
        <button
          className={`flex items-center gap-2 px-3 py-2 rounded text-xs transition-all duration-200 text-left ${
            activeView === 'community' 
              ? 'text-white' 
              : 'hover:bg-[var(--bg-hover)]'
          }`}
          style={{
            background: activeView === 'community' ? 'var(--rush-primary)' : 'transparent',
            color: activeView === 'community' ? 'white' : 'var(--text-secondary)'
          }}
          onClick={() => onViewChange('community')}
          onMouseEnter={(e) => {
            if (activeView !== 'community') {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeView !== 'community') {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
          }}
        >
          <Home className="w-3 h-3 flex-shrink-0" />
          <span className="font-medium">Community Areas</span>
        </button>
        
        <button
          className={`flex items-center gap-2 px-3 py-2 rounded text-xs transition-all duration-200 text-left ${
            activeView === 'wards' 
              ? 'text-white' 
              : 'hover:bg-[var(--bg-hover)]'
          }`}
          style={{
            background: activeView === 'wards' ? 'var(--rush-primary)' : 'transparent',
            color: activeView === 'wards' ? 'white' : 'var(--text-secondary)'
          }}
          onClick={() => onViewChange('wards')}
          onMouseEnter={(e) => {
            if (activeView !== 'wards') {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }
          }}
          onMouseLeave={(e) => {
            if (activeView !== 'wards') {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-secondary)';
            }
          }}
        >
          <Building2 className="w-3 h-3 flex-shrink-0" />
          <span className="font-medium">Alderman Wards</span>
        </button>
      </div>
    </div>
  );
}