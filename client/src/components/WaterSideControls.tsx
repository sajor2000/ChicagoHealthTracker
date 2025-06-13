import { ViewMode, DiseaseType, VisualizationMode } from '@/types';
import { MapPin, Home, Building2, Activity, BarChart3 } from 'lucide-react';

interface WaterSideControlsProps {
  activeView: ViewMode;
  selectedDisease: DiseaseType;
  visualizationMode: VisualizationMode;
  onViewChange: (view: ViewMode) => void;
  onDiseaseChange: (disease: DiseaseType) => void;
  onVisualizationModeChange: (mode: VisualizationMode) => void;
}

const diseaseOptions = [
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'hypertension', label: 'Hypertension' },
  { value: 'heart', label: 'Heart Disease' },
  { value: 'copd', label: 'COPD' },
  { value: 'asthma', label: 'Asthma' },
  { value: 'stroke', label: 'Stroke' },
  { value: 'ckd', label: 'Kidney Disease' },
  { value: 'depression', label: 'Depression' },
  { value: 'anxiety', label: 'Anxiety' },
  { value: 'obesity', label: 'Obesity' },
  { value: 'cancer', label: 'Cancer' },
  { value: 'arthritis', label: 'Arthritis' },
  { value: 'osteoporosis', label: 'Osteoporosis' },
  { value: 'liver', label: 'Liver Disease' },
  { value: 'substance', label: 'Substance Use' }
];

export default function WaterSideControls({
  activeView,
  selectedDisease,
  visualizationMode,
  onViewChange,
  onDiseaseChange,
  onVisualizationModeChange
}: WaterSideControlsProps) {
  return (
    <div className="fixed top-[120px] right-6 z-[90] flex flex-col gap-3">
      {/* Geographic View Toggle */}
      <div 
        className="backdrop-blur-[12px] rounded-lg border"
        style={{
          background: 'rgba(20, 20, 20, 0.90)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)'
        }}
      >
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
        
        <div className="p-2 flex flex-col gap-1">
          <button
            className={`flex items-center gap-2 px-3 py-2 rounded text-xs transition-all duration-200 text-left ${
              activeView === 'census' ? 'text-white' : 'hover:bg-[var(--bg-hover)]'
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
              activeView === 'community' ? 'text-white' : 'hover:bg-[var(--bg-hover)]'
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
              activeView === 'wards' ? 'text-white' : 'hover:bg-[var(--bg-hover)]'
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

      {/* Disease Category Toggle */}
      <div 
        className="backdrop-blur-[12px] rounded-lg border"
        style={{
          background: 'rgba(20, 20, 20, 0.90)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="px-3 py-2 border-b border-[var(--border-subtle)]">
          <span 
            className="text-xs uppercase tracking-wider font-medium"
            style={{ 
              color: 'var(--text-tertiary)',
              letterSpacing: '0.06em'
            }}
          >
            Disease Category
          </span>
        </div>
        
        <div className="p-2 max-h-64 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col gap-1">
            {diseaseOptions.map((disease) => (
              <button
                key={disease.value}
                className={`flex items-center gap-2 px-3 py-2 rounded text-xs transition-all duration-200 text-left ${
                  selectedDisease === disease.value ? 'text-white' : 'hover:bg-[var(--bg-hover)]'
                }`}
                style={{
                  background: selectedDisease === disease.value ? 'var(--rush-primary)' : 'transparent',
                  color: selectedDisease === disease.value ? 'white' : 'var(--text-secondary)'
                }}
                onClick={() => onDiseaseChange(disease.value as DiseaseType)}
                onMouseEnter={(e) => {
                  if (selectedDisease !== disease.value) {
                    e.currentTarget.style.background = 'var(--bg-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedDisease !== disease.value) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <Activity className="w-3 h-3 flex-shrink-0" />
                <span className="font-medium">{disease.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visualization Mode Toggle */}
      <div 
        className="backdrop-blur-[12px] rounded-lg border"
        style={{
          background: 'rgba(20, 20, 20, 0.90)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="px-3 py-2 border-b border-[var(--border-subtle)]">
          <span 
            className="text-xs uppercase tracking-wider font-medium"
            style={{ 
              color: 'var(--text-tertiary)',
              letterSpacing: '0.06em'
            }}
          >
            Visualization
          </span>
        </div>
        
        <div className="p-2 flex flex-col gap-1">
          <button
            className={`flex items-center gap-2 px-3 py-2 rounded text-xs transition-all duration-200 text-left ${
              visualizationMode === 'count' ? 'text-white' : 'hover:bg-[var(--bg-hover)]'
            }`}
            style={{
              background: visualizationMode === 'count' ? 'var(--rush-primary)' : 'transparent',
              color: visualizationMode === 'count' ? 'white' : 'var(--text-secondary)'
            }}
            onClick={() => onVisualizationModeChange('count')}
            onMouseEnter={(e) => {
              if (visualizationMode !== 'count') {
                e.currentTarget.style.background = 'var(--bg-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (visualizationMode !== 'count') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            <BarChart3 className="w-3 h-3 flex-shrink-0" />
            <span className="font-medium">Patient Count</span>
          </button>
          
          <button
            className={`flex items-center gap-2 px-3 py-2 rounded text-xs transition-all duration-200 text-left ${
              visualizationMode === 'rate' ? 'text-white' : 'hover:bg-[var(--bg-hover)]'
            }`}
            style={{
              background: visualizationMode === 'rate' ? 'var(--rush-primary)' : 'transparent',
              color: visualizationMode === 'rate' ? 'white' : 'var(--text-secondary)'
            }}
            onClick={() => onVisualizationModeChange('rate')}
            onMouseEnter={(e) => {
              if (visualizationMode !== 'rate') {
                e.currentTarget.style.background = 'var(--bg-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (visualizationMode !== 'rate') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            <BarChart3 className="w-3 h-3 flex-shrink-0" />
            <span className="font-medium">Age-Adjusted Rate</span>
          </button>
        </div>
      </div>
    </div>
  );
}