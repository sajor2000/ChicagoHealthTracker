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
  return null;
}