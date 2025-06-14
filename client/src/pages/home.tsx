import { useState } from 'react';
import Header from '@/components/Header';
import MapContainer from '@/components/MapContainer';
import ControlPanel from '@/components/ControlPanel';
import InfoPanel from '@/components/InfoPanel';
import Legend from '@/components/Legend';
import WaterSideControls from '@/components/WaterSideControls';
import { AppState, AreaData, ViewMode, DiseaseType, VisualizationMode } from '@/types';

export default function Home() {
  const [appState, setAppState] = useState<AppState>({
    selectedArea: null,
    activeView: 'census',
    selectedDisease: 'diabetes',
    visualizationMode: 'rate',
    showSuppressed: true,
    isInfoPanelOpen: false,
  });
  
  const [isControlPanelCollapsed, setIsControlPanelCollapsed] = useState(false);

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

  const handleToggleControlPanelCollapse = () => {
    setIsControlPanelCollapsed(prev => !prev);
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
      
      {/* Data Disclaimer Banner */}
      <div 
        className="fixed top-24 left-0 right-0 z-40 py-2 px-4"
        style={{ 
          background: 'linear-gradient(90deg, rgba(255, 193, 7, 0.95) 0%, rgba(255, 152, 0, 0.95) 100%)',
          borderBottom: '1px solid rgba(255, 193, 7, 0.5)'
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <div className="flex items-center gap-3 text-center">
            <span className="text-amber-900 text-lg">⚠️</span>
            <span className="text-amber-900 font-semibold text-sm">
              DEMONSTRATION DATA: This platform displays synthetic health data for proof-of-concept purposes only. 
              Not intended for clinical or policy decisions.
            </span>
          </div>
        </div>
      </div>
      
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
        isCollapsed={isControlPanelCollapsed}
        onViewChange={handleViewChange}
        onDiseaseChange={handleDiseaseChange}
        onVisualizationModeChange={handleVisualizationModeChange}
        onShowSuppressedChange={handleShowSuppressedChange}
        onToggleCollapse={handleToggleControlPanelCollapse}
      />
      
      <WaterSideControls
        activeView={appState.activeView}
        selectedDisease={appState.selectedDisease}
        visualizationMode={appState.visualizationMode}
        onViewChange={handleViewChange}
        onDiseaseChange={handleDiseaseChange}
        onVisualizationModeChange={handleVisualizationModeChange}
      />
      
      <InfoPanel
        selectedArea={appState.selectedArea}
        isOpen={appState.isInfoPanelOpen}
        onClose={handleInfoPanelClose}
      />
      
      <Legend visualizationMode={appState.visualizationMode} selectedDisease={appState.selectedDisease} />
    </div>
  );
}
