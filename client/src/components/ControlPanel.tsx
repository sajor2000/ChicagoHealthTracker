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
          color: 'var(--text-secondary)'
        }}
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {isCollapsed ? (
        // Collapsed view - only show key icons
        <div className="flex flex-col items-center gap-4 mt-2">
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
          </div>
        </div>
      ) : (
        // Expanded view - full controls
        <>
          {/* Geographic View Toggle */}
          <div className="mb-6">
            <label 
              className="block text-xs uppercase tracking-wider font-medium mb-3"
              style={{ 
                color: 'var(--text-tertiary)',
                letterSpacing: '0.08em'
              }}
            >
              Geographic View
            </label>
            <div className="flex flex-col gap-2">
              <button
                className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 text-left ${
                  activeView === 'census' 
                    ? 'text-white border-[var(--rush-primary)]' 
                    : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
                }`}
                style={{
                  background: activeView === 'census' ? 'var(--rush-primary)' : 'var(--bg-overlay)',
                  color: activeView === 'census' ? 'white' : 'var(--text-secondary)'
                }}
                onClick={() => onViewChange('census')}
              >
                <MapPin className="text-lg" />
                <div className="flex-1">
                  <div className="text-sm">Census Tracts</div>
                  <div 
                    className="text-xs opacity-80 ml-auto"
                    style={{ color: 'inherit' }}
                  >
                    Detailed boundaries
                  </div>
                </div>
              </button>
              
              <button
                className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 text-left ${
                  activeView === 'community' 
                    ? 'text-white border-[var(--rush-primary)]' 
                    : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
                }`}
                style={{
                  background: activeView === 'community' ? 'var(--rush-primary)' : 'var(--bg-overlay)',
                  color: activeView === 'community' ? 'white' : 'var(--text-secondary)'
                }}
                onClick={() => onViewChange('community')}
              >
                <Home className="text-lg" />
                <div className="flex-1">
                  <div className="text-sm">Community Areas</div>
                  <div 
                    className="text-xs opacity-80 ml-auto"
                    style={{ color: 'inherit' }}
                  >
                    77 neighborhoods
                  </div>
                </div>
              </button>

              <button
                className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-200 text-left ${
                  activeView === 'wards' 
                    ? 'text-white border-[var(--rush-primary)]' 
                    : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
                }`}
                style={{
                  background: activeView === 'wards' ? 'var(--rush-primary)' : 'var(--bg-overlay)',
                  color: activeView === 'wards' ? 'white' : 'var(--text-secondary)'
                }}
                onClick={() => onViewChange('wards')}
              >
                <HelpCircle className="text-lg" />
                <div className="flex-1">
                  <div className="text-sm">Alderman Wards</div>
                  <div 
                    className="text-xs opacity-80 ml-auto"
                    style={{ color: 'inherit' }}
                  >
                    50 political districts
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Disease Filter */}
          <div className="mb-6">
            <label 
              className="block text-xs uppercase tracking-wider font-medium mb-3"
              style={{ 
                color: 'var(--text-tertiary)',
                letterSpacing: '0.08em'
              }}
            >
              Disease Category
            </label>
            <Select 
              value={selectedDisease} 
              onValueChange={onDiseaseChange}
            >
              <SelectTrigger 
                className="h-10 text-sm border-[var(--border-default)] focus:border-[var(--rush-primary)] focus:ring-[var(--focus-ring)] cursor-pointer"
                style={{
                  background: 'var(--bg-overlay)',
                  color: 'var(--text-secondary)',
                  pointerEvents: 'auto'
                }}
              >
                <SelectValue placeholder="Select disease category" />
              </SelectTrigger>
              <SelectContent 
                className="z-[9999]"
                style={{
                  background: 'var(--bg-overlay)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-secondary)',
                  zIndex: 9999
                }}
                sideOffset={5}
              >
                <SelectItem value="diabetes">Diabetes (E10-E14)</SelectItem>
                <SelectItem value="hypertension">Hypertension (I10-I15)</SelectItem>
                <SelectItem value="heart">Heart Disease (I20-I25)</SelectItem>
                <SelectItem value="copd">COPD (J40-J44)</SelectItem>
                <SelectItem value="asthma">Asthma (J45)</SelectItem>
                <SelectItem value="stroke">Stroke (I60-I69)</SelectItem>
                <SelectItem value="ckd">Chronic Kidney Disease (N18)</SelectItem>
                <SelectItem value="depression">Depression (F32-F33)</SelectItem>
                <SelectItem value="anxiety">Anxiety Disorders (F40-F41)</SelectItem>
                <SelectItem value="obesity">Obesity (E66)</SelectItem>
                <SelectItem value="cancer">Cancer (C00-C97)</SelectItem>
                <SelectItem value="arthritis">Arthritis (M05-M06, M15-M19)</SelectItem>
                <SelectItem value="osteoporosis">Osteoporosis (M80-M81)</SelectItem>
                <SelectItem value="liver">Liver Disease (K70-K77)</SelectItem>
                <SelectItem value="substance">Substance Use Disorder (F10-F19)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Visualization Mode */}
          <div className="mb-6">
            <label 
              className="block text-xs uppercase tracking-wider font-medium mb-3"
              style={{ 
                color: 'var(--text-tertiary)',
                letterSpacing: '0.08em'
              }}
            >
              Data Display
            </label>
            <RadioGroup 
              value={visualizationMode} 
              onValueChange={onVisualizationModeChange}
              className="flex flex-col gap-3"
            >
              <div className="flex items-start gap-3">
                <RadioGroupItem value="count" id="count" className="mt-0.5" />
                <div className="flex-1">
                  <Label 
                    htmlFor="count" 
                    className="text-sm font-medium cursor-pointer"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Raw Counts
                  </Label>
                  <div 
                    className="text-xs ml-auto"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Total patients
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <RadioGroupItem value="rate" id="rate" className="mt-0.5" />
                <div className="flex-1">
                  <Label 
                    htmlFor="rate" 
                    className="text-sm font-medium cursor-pointer"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Population Adjusted
                  </Label>
                  <div 
                    className="text-xs ml-auto"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Per 1,000 residents
                  </div>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Data Quality Filter */}
          <div>
            <label 
              className="block text-xs uppercase tracking-wider font-medium mb-3"
              style={{ 
                color: 'var(--text-tertiary)',
                letterSpacing: '0.08em'
              }}
            >
              Data Quality
            </label>
            <div className="flex items-center gap-3">
              <Checkbox 
                id="suppressed"
                checked={showSuppressed}
                onCheckedChange={onShowSuppressedChange}
              />
              <Label 
                htmlFor="suppressed"
                className="text-sm cursor-pointer"
                style={{ color: 'var(--text-secondary)' }}
              >
                Show suppressed areas
              </Label>
              <HelpCircle 
                className="w-4 h-4 cursor-help ml-2"
                style={{ color: 'var(--text-muted)' }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}