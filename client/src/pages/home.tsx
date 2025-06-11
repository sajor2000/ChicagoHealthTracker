import { useState } from 'react';
import Header from '@/components/Header';
import MapContainer from '@/components/MapContainer';
import ControlPanel from '@/components/ControlPanel';
import InfoPanel from '@/components/InfoPanel';
import Legend from '@/components/Legend';
import { AppState, AreaData, ViewMode, DiseaseType, VisualizationMode } from '@/types';

export default function Home() {
  const [appState, setAppState] = useState<AppState>({
    selectedArea: null,
    activeView: 'census',
    selectedDisease: 'diabetes',
    visualizationMode: 'count',
    showSuppressed: true,
    isInfoPanelOpen: false,
  });

  const handleViewChange = (view: ViewMode) => {
    setAppState(prev => ({ ...prev, activeView: view }));
  };

  const handleDiseaseChange = (disease: DiseaseType) => {
    setAppState(prev => ({ ...prev, selectedDisease: disease }));
  };

  const handleVisualizationModeChange = (mode: VisualizationMode) => {
    setAppState(prev => ({ ...prev, visualizationMode: mode }));
  };

  const handleShowSuppressedChange = (show: boolean) => {
    setAppState(prev => ({ ...prev, showSuppressed: show }));
  };

  const handleAreaSelect = (area: AreaData) => {
    setAppState(prev => ({ 
      ...prev, 
      selectedArea: area, 
      isInfoPanelOpen: true 
    }));
  };

  const handleInfoPanelClose = () => {
    setAppState(prev => ({ ...prev, isInfoPanelOpen: false }));
  };

  // Close info panel when clicking outside (handled by MapContainer clicks)
  const handleMapClick = () => {
    if (appState.isInfoPanelOpen) {
      setAppState(prev => ({ ...prev, isInfoPanelOpen: false }));
    }
  };

  return (
    <div className="relative h-screen overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      <Header />
      
      <MapContainer
        activeView={appState.activeView}
        selectedDisease={appState.selectedDisease}
        visualizationMode={appState.visualizationMode}
        showSuppressed={appState.showSuppressed}
        onAreaSelect={handleAreaSelect}
      />
      
      <ControlPanel
        activeView={appState.activeView}
        selectedDisease={appState.selectedDisease}
        visualizationMode={appState.visualizationMode}
        showSuppressed={appState.showSuppressed}
        onViewChange={handleViewChange}
        onDiseaseChange={handleDiseaseChange}
        onVisualizationModeChange={handleVisualizationModeChange}
        onShowSuppressedChange={handleShowSuppressedChange}
      />
      
      <InfoPanel
        selectedArea={appState.selectedArea}
        isOpen={appState.isInfoPanelOpen}
        onClose={handleInfoPanelClose}
      />
      
      <Legend visualizationMode={appState.visualizationMode} />
    </div>
  );
}
