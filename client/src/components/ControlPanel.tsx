import { ViewMode, DiseaseType, VisualizationMode } from '@/types';
import { MapPin, Home, Building2, ChevronLeft, ChevronRight } from 'lucide-react';

interface ControlPanelProps {
  activeView: ViewMode;
  selectedDisease: DiseaseType;
  visualizationMode: VisualizationMode;
  isCollapsed: boolean;
  onViewChange: (view: ViewMode) => void;
  onDiseaseChange: (disease: DiseaseType) => void;
  onVisualizationModeChange: (mode: VisualizationMode) => void;
  onToggleCollapse: () => void;
}

export default function ControlPanel({
  activeView,
  selectedDisease,
  visualizationMode,
  isCollapsed,
  onViewChange,
  onDiseaseChange,
  onVisualizationModeChange,
  onToggleCollapse,
}: ControlPanelProps) {
  return (
    <div 
      className={`fixed top-[100px] left-6 max-h-[calc(100vh-120px)] custom-scrollbar backdrop-blur-[16px] rounded-xl z-[100] transition-all duration-300 ${
        isCollapsed ? 'w-16 p-3' : 'w-80 p-6'
      }`}
      style={{
        background: 'rgba(20, 20, 20, 0.95)',
        border: '1px solid var(--border-rush)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
        overflow: 'visible'
      }}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full border bg-[var(--bg-overlay)] border-[var(--border-rush)] flex items-center justify-center hover:bg-[var(--rush-primary)] transition-colors duration-200"
        style={{ 
          background: 'rgba(20, 20, 20, 0.95)',
          borderColor: 'var(--border-rush)'
        }}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} />
        ) : (
          <ChevronLeft className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} />
        )}
      </button>

      {isCollapsed ? (
        // Collapsed view - mini controls
        <div className="flex flex-col items-center gap-4">
          <div className="text-xs text-center" style={{ color: 'var(--text-tertiary)' }}>
            Controls
          </div>
          <div className="flex flex-col gap-2">
            <button
              className={`w-8 h-8 rounded-lg border transition-all duration-200 flex items-center justify-center ${
                activeView === 'census' 
                  ? 'border-[var(--rush-primary)]' 
                  : 'border-[var(--border-default)]'
              }`}
              style={{
                background: activeView === 'census' ? 'var(--rush-primary)' : 'var(--bg-overlay)',
                color: activeView === 'census' ? 'white' : 'var(--text-secondary)'
              }}
              onClick={() => onViewChange('census')}
              title="Census Tracts"
            >
              <MapPin className="w-4 h-4" />
            </button>
            
            <button
              className={`w-8 h-8 rounded-lg border transition-all duration-200 flex items-center justify-center ${
                activeView === 'community' 
                  ? 'border-[var(--rush-primary)]' 
                  : 'border-[var(--border-default)]'
              }`}
              style={{
                background: activeView === 'community' ? 'var(--rush-primary)' : 'var(--bg-overlay)',
                color: activeView === 'community' ? 'white' : 'var(--text-secondary)'
              }}
              onClick={() => onViewChange('community')}
              title="Community Areas"
            >
              <Home className="w-4 h-4" />
            </button>
            
            <button
              className={`w-8 h-8 rounded-lg border transition-all duration-200 flex items-center justify-center ${
                activeView === 'wards' 
                  ? 'border-[var(--rush-primary)]' 
                  : 'border-[var(--border-default)]'
              }`}
              style={{
                background: activeView === 'wards' ? 'var(--rush-primary)' : 'var(--bg-overlay)',
                color: activeView === 'wards' ? 'white' : 'var(--text-secondary)'
              }}
              onClick={() => onViewChange('wards')}
              title="Alderman Wards"
            >
              <Building2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        // Expanded view
        <></>
      )}
    </div>
  );
}