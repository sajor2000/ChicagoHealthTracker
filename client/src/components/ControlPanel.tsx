import { ViewMode, DiseaseType, VisualizationMode } from '@/types';
import { MapPin, Home, HelpCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface ControlPanelProps {
  activeView: ViewMode;
  selectedDisease: DiseaseType;
  visualizationMode: VisualizationMode;
  showSuppressed: boolean;
  onViewChange: (view: ViewMode) => void;
  onDiseaseChange: (disease: DiseaseType) => void;
  onVisualizationModeChange: (mode: VisualizationMode) => void;
  onShowSuppressedChange: (show: boolean) => void;
}

export default function ControlPanel({
  activeView,
  selectedDisease,
  visualizationMode,
  showSuppressed,
  onViewChange,
  onDiseaseChange,
  onVisualizationModeChange,
  onShowSuppressedChange,
}: ControlPanelProps) {
  return (
    <div 
      className="fixed top-[100px] left-6 w-80 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar backdrop-blur-[16px] rounded-xl p-6 z-[100]"
      style={{
        background: 'rgba(20, 20, 20, 0.95)',
        border: '1px solid var(--border-rush)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
      }}
    >
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
        <Select value={selectedDisease} onValueChange={onDiseaseChange}>
          <SelectTrigger 
            className="h-10 text-sm border-[var(--border-default)] focus:border-[var(--rush-primary)] focus:ring-[var(--focus-ring)]"
            style={{
              background: 'var(--bg-overlay)',
              color: 'var(--text-secondary)'
            }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent 
            style={{
              background: 'var(--bg-overlay)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-secondary)'
            }}
          >
            <SelectItem value="diabetes">Diabetes (E10-E14)</SelectItem>
            <SelectItem value="hypertension">Hypertension (I10-I15)</SelectItem>
            <SelectItem value="heart">Heart Disease (I20-I25)</SelectItem>
            <SelectItem value="copd">COPD (J40-J44)</SelectItem>
            <SelectItem value="asthma">Asthma (J45)</SelectItem>
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
            title="Areas with <11 patients"
          />
        </div>
      </div>
    </div>
  );
}
