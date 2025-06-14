import { ViewMode, DiseaseType, VisualizationMode } from '@/types';

interface ControlPanelProps {
  activeView: ViewMode;
  selectedDisease: DiseaseType;
  visualizationMode: VisualizationMode;
  onViewChange: (view: ViewMode) => void;
  onDiseaseChange: (disease: DiseaseType) => void;
  onVisualizationModeChange: (mode: VisualizationMode) => void;
}

export default function ControlPanel({
  activeView,
  selectedDisease,
  visualizationMode,
  onViewChange,
  onDiseaseChange,
  onVisualizationModeChange,
}: ControlPanelProps) {
  return (
    <div 
      className="fixed top-[100px] left-6 w-80 p-6 max-h-[calc(100vh-120px)] custom-scrollbar backdrop-blur-[16px] rounded-xl z-[100] transition-all duration-300"
      style={{
        background: 'rgba(20, 20, 20, 0.95)',
        border: '1px solid var(--border-rush)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
        overflow: 'visible'
      }}
    >
      {/* Control panel content will go here */}
    </div>
  );
}