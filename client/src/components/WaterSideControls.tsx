import { ViewMode, DiseaseType, VisualizationMode } from '@/types';
import { MapPin, Home, Building2, Activity, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

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
  { value: 'heart_disease', label: 'Heart Disease' },
  { value: 'copd', label: 'COPD' },
  { value: 'asthma', label: 'Asthma' },
  { value: 'stroke', label: 'Stroke' },
  { value: 'obesity', label: 'Obesity' },
  { value: 'mental_health', label: 'Mental Health' }
];

export default function WaterSideControls({
  activeView,
  selectedDisease,
  visualizationMode,
  onViewChange,
  onDiseaseChange,
  onVisualizationModeChange
}: WaterSideControlsProps) {
  const [isControlPanelVisible, setIsControlPanelVisible] = useState(true);
  
  return (
    <div className="fixed top-[120px] right-6 z-[90] flex flex-col gap-3">
      {/* Toggle Button */}
      <button
        onClick={() => setIsControlPanelVisible(!isControlPanelVisible)}
        className="self-end backdrop-blur-[12px] rounded-lg border p-2 transition-all duration-200"
        style={{
          background: 'rgba(20, 20, 20, 0.90)',
          border: '1px solid var(--border-subtle)',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.3)'
        }}
      >
        {isControlPanelVisible ? (
          <ChevronUp className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
        ) : (
          <ChevronDown className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
        )}
      </button>
      
      {isControlPanelVisible && (
        <div className="flex flex-col gap-3">
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

      {/* Disease Category Dropdown */}
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
        
        <div className="p-2">
          <select
            value={selectedDisease}
            onChange={(e) => onDiseaseChange(e.target.value as DiseaseType)}
            className="w-full px-3 py-2 text-xs rounded border transition-all duration-200"
            style={{
              background: 'var(--bg-overlay)',
              borderColor: 'var(--border-default)',
              color: 'var(--text-secondary)'
            }}
          >
            {diseaseOptions.map((disease) => (
              <option key={disease.value} value={disease.value}>
                {disease.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rate Calculation Method */}
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
            Rate Calculation
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
            <div className="flex flex-col items-start">
              <span className="font-medium">Total Count</span>
              <span className="text-xs opacity-75">Raw patient numbers</span>
            </div>
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
            <div className="flex flex-col items-start">
              <span className="font-medium">Population-Adjusted Rate</span>
              <span className="text-xs opacity-75">Per 1,000 residents (2020 Census)</span>
            </div>
          </button>
          
          <button
            className={`flex items-center gap-2 px-3 py-2 rounded text-xs transition-all duration-200 text-left ${
              visualizationMode === 'age_adjusted' ? 'text-white' : 'hover:bg-[var(--bg-hover)]'
            }`}
            style={{
              background: visualizationMode === 'age_adjusted' ? 'var(--rush-primary)' : 'transparent',
              color: visualizationMode === 'age_adjusted' ? 'white' : 'var(--text-secondary)'
            }}
            onClick={() => onVisualizationModeChange('age_adjusted')}
            onMouseEnter={(e) => {
              if (visualizationMode !== 'age_adjusted') {
                e.currentTarget.style.background = 'var(--bg-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (visualizationMode !== 'age_adjusted') {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }
            }}
          >
            <BarChart3 className="w-3 h-3 flex-shrink-0" />
            <div className="flex flex-col items-start">
              <span className="font-medium">Age-Adjusted Density</span>
              <span className="text-xs opacity-75">Standardized by age distribution</span>
            </div>
          </button>
        </div>
      </div>
      </div>
      )}
    </div>
  );
}