import React from 'react';

interface DiseaseColorLegendProps {
  selectedDisease: string;
  visualizationMode: 'count' | 'rate' | 'age_adjusted';
  dataRange?: {
    min: number;
    max: number;
  };
}

const DiseaseColorLegend: React.FC<DiseaseColorLegendProps> = ({
  selectedDisease,
  visualizationMode,
  dataRange
}) => {
  
  // Disease-specific color gradients and descriptions
  const getDiseaseColorInfo = (disease: string) => {
    switch (disease) {
      case 'diabetes':
        return {
          colors: ['#1e40af', '#3b82f6', '#06b6d4', '#eab308', '#f97316', '#dc2626', '#7f1d1d'],
          labels: ['Excellent Control', 'Good Control', 'Moderate Control', 'Concerning', 'Poor Control', 'Dangerous', 'Crisis'],
          description: 'Blue indicates good diabetic control, red shows poor control'
        };
      case 'hypertension':
        return {
          colors: ['#059669', '#10b981', '#84cc16', '#eab308', '#f97316', '#dc2626', '#991b1b'],
          labels: ['Normal BP', 'Elevated', 'Pre-HTN', 'Stage 1', 'Stage 2', 'Severe', 'Crisis'],
          description: 'Green shows normal blood pressure, red indicates hypertensive ranges'
        };
      case 'heart_disease':
        return {
          colors: ['#7c3aed', '#a855f7', '#ec4899', '#f97316', '#dc2626', '#b91c1c', '#7f1d1d'],
          labels: ['Low Risk', 'Mild Risk', 'Moderate', 'Elevated', 'High Risk', 'Very High', 'Critical'],
          description: 'Purple indicates low cardiac risk, red shows high cardiovascular risk'
        };
      case 'stroke':
        return {
          colors: ['#0d9488', '#14b8a6', '#22d3ee', '#fbbf24', '#f97316', '#dc2626', '#7f1d1d'],
          labels: ['Low Risk', 'Mild Risk', 'Moderate', 'Elevated', 'High Risk', 'Very High', 'Extreme'],
          description: 'Teal indicates low stroke risk, red shows extreme stroke risk'
        };
      case 'asthma':
        return {
          colors: ['#0ea5e9', '#38bdf8', '#67e8f9', '#fde047', '#fb923c', '#dc2626', '#7f1d1d'],
          labels: ['Clear', 'Mild', 'Moderate', 'Concerning', 'Severe', 'Dangerous', 'Critical'],
          description: 'Blue shows clear breathing, red indicates severe respiratory symptoms'
        };
      case 'copd':
        return {
          colors: ['#64748b', '#94a3b8', '#cbd5e1', '#fbbf24', '#f97316', '#dc2626', '#7f1d1d'],
          labels: ['Mild', 'Moderate', 'Significant', 'Severe', 'Very Severe', 'End-Stage', 'Critical'],
          description: 'Gray shows mild limitation, red indicates severe lung function decline'
        };
      case 'obesity':
        return {
          colors: ['#22c55e', '#84cc16', '#eab308', '#f97316', '#dc2626', '#b91c1c', '#7f1d1d'],
          labels: ['Normal', 'Overweight', 'Obese I', 'Obese II', 'Obese III', 'Morbid', 'Super'],
          description: 'Green shows normal weight, red indicates severe obesity categories'
        };
      case 'mental_health':
        return {
          colors: ['#4338ca', '#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#dc2626', '#7f1d1d'],
          labels: ['Good Health', 'Mild Stress', 'Moderate', 'Significant', 'Severe', 'Crisis', 'Emergency'],
          description: 'Indigo shows good mental health, red indicates psychological crisis'
        };
      default:
        return {
          colors: ['#16a34a', '#22c55e', '#eab308', '#f97316', '#dc2626', '#b91c1c', '#7f1d1d'],
          labels: ['Lowest', 'Low', 'Moderate', 'High', 'Very High', 'Severe', 'Extreme'],
          description: 'Green indicates low prevalence, red shows high disease burden'
        };
    }
  };

  const colorInfo = getDiseaseColorInfo(selectedDisease);
  const diseaseDisplayName = selectedDisease.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div 
      className="backdrop-blur-[12px] rounded-lg border w-64"
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
          {diseaseDisplayName} Color Scale
        </span>
      </div>
      
      <div className="p-3">
        {/* Color gradient bar */}
        <div className="mb-3">
          <div 
            className="h-4 rounded-md shadow-inner"
            style={{
              background: `linear-gradient(to right, ${colorInfo.colors.join(', ')})`
            }}
          />
          
          {/* Range labels */}
          {dataRange && (
            <div className="flex justify-between mt-1 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              <span>{dataRange.min.toFixed(1)}</span>
              <span>{dataRange.max.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        {/* Color meanings */}
        <div className="space-y-1 mb-3">
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: colorInfo.colors[0] }}
              />
              <span style={{ color: 'var(--text-secondary)' }}>{colorInfo.labels[0]}</span>
            </div>
            <div className="flex items-center gap-1">
              <div 
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: colorInfo.colors[colorInfo.colors.length - 1] }}
              />
              <span style={{ color: 'var(--text-secondary)' }}>{colorInfo.labels[colorInfo.labels.length - 1]}</span>
            </div>
          </div>
        </div>
        
        {/* Description */}
        <div className="text-xs leading-relaxed" style={{ color: 'var(--text-tertiary)' }}>
          {colorInfo.description}
        </div>
        
        {/* Units */}
        <div className="mt-2 text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {visualizationMode === 'count' ? 'Total cases' : 'Per 1,000 residents'}
        </div>
      </div>
    </div>
  );
};

export default DiseaseColorLegend;