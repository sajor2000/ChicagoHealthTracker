import { ViewMode, DiseaseType, VisualizationMode } from '@/types';
import { MapPin, Home, Building2, HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface ControlPanelProps {
  activeView: ViewMode;
  selectedDisease: DiseaseType;
  visualizationMode: VisualizationMode;
  showSuppressed: boolean;
  isCollapsed: boolean;
  onViewChange: (view: ViewMode) => void;
  onDiseaseChange: (disease: DiseaseType) => void;
  onVisualizationModeChange: (mode: VisualizationMode) => void;
  onShowSuppressedChange: (show: boolean) => void;
  onToggleCollapse: () => void;
}

export default function ControlPanel({
  activeView,
  selectedDisease,
  visualizationMode,
  showSuppressed,
  isCollapsed,
  onViewChange,
  onDiseaseChange,
  onVisualizationModeChange,
  onShowSuppressedChange,
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
        // Expanded view - display options only
        <>
          {/* Display Options */}
          <div className="mb-6">
            <label 
              className="block text-xs uppercase tracking-wider font-medium mb-3"
              style={{ 
                color: 'var(--text-tertiary)',
                letterSpacing: '0.08em'
              }}
            >
              Display Options
            </label>
            <div className="flex flex-col gap-3">
              <div className="flex items-center space-x-3">
                <Checkbox
                  id="show-suppressed"
                  checked={showSuppressed}
                  onCheckedChange={onShowSuppressedChange}
                  style={{
                    borderColor: 'var(--border-default)',
                    backgroundColor: 'var(--bg-overlay)'
                  }}
                />
                <Label 
                  htmlFor="show-suppressed" 
                  className="text-sm cursor-pointer"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Show Suppressed Data
                </Label>
              </div>
            </div>
          </div>

          {/* Attribution */}
          <div className="mb-6">
            <div className="text-xs space-y-3" style={{ color: 'var(--text-tertiary)' }}>
              <div className="border-t pt-3" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="mb-2">
                  <span className="font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Built by
                  </span>
                  <span className="text-xs">
                    Rush Health Equity Data Analytics Studio
                  </span>
                </div>
                
                <div>
                  <span className="font-medium block mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Data provided by
                  </span>
                  <span className="text-xs">
                    CAPriCORN
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}