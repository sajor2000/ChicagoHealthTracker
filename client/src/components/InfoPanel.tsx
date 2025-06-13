import { AreaData, DiseaseType } from '@/types';
import { X } from 'lucide-react';
import { formatNumber, formatRate, getDiseaseInfo, getPrevalencePercentage } from '@/lib/utils';

interface InfoPanelProps {
  selectedArea: AreaData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoPanel({ selectedArea, isOpen, onClose }: InfoPanelProps) {
  if (!selectedArea) return null;

  const diseases: DiseaseType[] = ['diabetes', 'hypertension', 'heart', 'copd', 'asthma'];

  return (
    <div 
      className={`fixed top-[100px] right-6 w-[380px] max-h-[600px] backdrop-blur-[16px] rounded-xl z-[100] flex flex-col transition-transform duration-300 ${
        isOpen ? 'slide-in-right' : 'translate-x-[400px]'
      }`}
      style={{
        background: 'rgba(20, 20, 20, 0.98)',
        border: '1px solid var(--border-rush)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
      }}
    >
      {/* Panel Header */}
      <div 
        className="flex justify-between items-center p-6 border-b"
        style={{ borderBottomColor: 'var(--border-default)' }}
      >
        <h3 
          className="text-lg font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {selectedArea.name}
        </h3>
        <button
          onClick={onClose}
          className="p-2 rounded transition-all duration-200 hover:scale-110"
          style={{ 
            color: 'var(--text-tertiary)',
            ':hover': { 
              backgroundColor: 'var(--bg-hover)',
              color: 'var(--text-primary)'
            }
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-tertiary)';
          }}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {/* Population Metrics */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 
              className="text-base font-semibold uppercase tracking-wider"
              style={{ 
                color: 'var(--text-primary)',
                letterSpacing: '0.05em'
              }}
            >
              Population Metrics
            </h4>
            {/* Data Source Indicator */}
            {selectedArea.id && (
              <div className="text-[9px] px-2 py-1 rounded-full border" style={{
                background: selectedArea.id.includes('17031') ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                borderColor: selectedArea.id.includes('17031') ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)',
                color: selectedArea.id.includes('17031') ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)'
              }}>
                {selectedArea.id.includes('17031') ? 'Direct Census' : 'Spatial Aggregation'}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div 
              className="border rounded-lg p-4 text-center"
              style={{
                background: 'var(--bg-overlay)',
                borderColor: 'var(--border-subtle)'
              }}
            >
              <span 
                className="block text-xs uppercase tracking-wider mb-2"
                style={{ 
                  color: 'var(--text-tertiary)',
                  letterSpacing: '0.05em'
                }}
              >
                2020 Population
              </span>
              <span 
                className="block text-xl font-bold font-mono"
                style={{ color: 'var(--text-primary)' }}
              >
                {formatNumber(selectedArea.population)}
              </span>
            </div>
            <div 
              className="border rounded-lg p-4 text-center"
              style={{
                background: 'var(--bg-overlay)',
                borderColor: 'var(--border-subtle)'
              }}
            >
              <span 
                className="block text-xs uppercase tracking-wider mb-2"
                style={{ 
                  color: 'var(--text-tertiary)',
                  letterSpacing: '0.05em'
                }}
              >
                Density
              </span>
              <span 
                className="block text-xl font-bold font-mono"
                style={{ color: 'var(--text-primary)' }}
              >
                {formatNumber(selectedArea.density)}/sq mi
              </span>
            </div>
          </div>
        </section>

        {/* Demographics - 2020 Census */}
        {selectedArea.demographics && (
          <section className="mb-6">
            <h4 
              className="text-base font-semibold mb-4 uppercase tracking-wider"
              style={{ 
                color: 'var(--text-primary)',
                letterSpacing: '0.05em'
              }}
            >
              2020 Census Demographics
            </h4>
            
            {/* Race Distribution */}
            <div className="mb-4">
              <h5 
                className="text-sm font-medium mb-3"
                style={{ color: 'var(--text-secondary)' }}
              >
                Race Distribution
              </h5>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { label: 'White', value: selectedArea.demographics.race.white },
                  { label: 'Black/African American', value: selectedArea.demographics.race.black },
                  { label: 'Asian', value: selectedArea.demographics.race.asian },
                  { label: 'American Indian/Alaska Native', value: selectedArea.demographics.race.americanIndian },
                  { label: 'Pacific Islander', value: selectedArea.demographics.race.pacificIslander },
                  { label: 'Other Race', value: selectedArea.demographics.race.otherRace },
                  { label: 'Two or More Races', value: selectedArea.demographics.race.multiRace }
                ].map(item => (
                  <div 
                    key={item.label}
                    className="flex justify-between p-2 rounded"
                    style={{ background: 'var(--bg-overlay)', borderColor: 'var(--border-subtle)' }}
                  >
                    <span style={{ color: 'var(--text-tertiary)' }}>{item.label}</span>
                    <span 
                      className="font-mono font-medium"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {formatNumber(item.value)} ({((item.value / selectedArea.demographics.population.total) * 100).toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ethnicity Distribution */}
            <div className="mb-4">
              <h5 
                className="text-sm font-medium mb-3"
                style={{ color: 'var(--text-secondary)' }}
              >
                Ethnicity Distribution
              </h5>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div 
                  className="flex justify-between p-2 rounded"
                  style={{ background: 'var(--bg-overlay)', borderColor: 'var(--border-subtle)' }}
                >
                  <span style={{ color: 'var(--text-tertiary)' }}>Hispanic or Latino</span>
                  <span 
                    className="font-mono font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {formatNumber(selectedArea.demographics.ethnicity.hispanic)} ({((selectedArea.demographics.ethnicity.hispanic / selectedArea.demographics.ethnicity.total) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div 
                  className="flex justify-between p-2 rounded"
                  style={{ background: 'var(--bg-overlay)', borderColor: 'var(--border-subtle)' }}
                >
                  <span style={{ color: 'var(--text-tertiary)' }}>Not Hispanic or Latino</span>
                  <span 
                    className="font-mono font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {formatNumber(selectedArea.demographics.ethnicity.nonHispanic)} ({((selectedArea.demographics.ethnicity.nonHispanic / selectedArea.demographics.ethnicity.total) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Housing Characteristics */}
            <div className="mb-4">
              <h5 
                className="text-sm font-medium mb-3"
                style={{ color: 'var(--text-secondary)' }}
              >
                Housing Characteristics
              </h5>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div 
                  className="flex justify-between p-2 rounded"
                  style={{ background: 'var(--bg-overlay)', borderColor: 'var(--border-subtle)' }}
                >
                  <span style={{ color: 'var(--text-tertiary)' }}>Total Housing Units</span>
                  <span 
                    className="font-mono font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {formatNumber(selectedArea.demographics.housing.totalUnits)}
                  </span>
                </div>
                <div 
                  className="flex justify-between p-2 rounded"
                  style={{ background: 'var(--bg-overlay)', borderColor: 'var(--border-subtle)' }}
                >
                  <span style={{ color: 'var(--text-tertiary)' }}>Occupied Units</span>
                  <span 
                    className="font-mono font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {formatNumber(selectedArea.demographics.housing.occupied)} ({selectedArea.demographics.housing.totalUnits > 0 ? ((selectedArea.demographics.housing.occupied / selectedArea.demographics.housing.totalUnits) * 100).toFixed(1) : '0.0'}%)
                  </span>
                </div>
                <div 
                  className="flex justify-between p-2 rounded"
                  style={{ background: 'var(--bg-overlay)', borderColor: 'var(--border-subtle)' }}
                >
                  <span style={{ color: 'var(--text-tertiary)' }}>Vacant Units</span>
                  <span 
                    className="font-mono font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {formatNumber(selectedArea.demographics.housing.vacant)} ({selectedArea.demographics.housing.totalUnits > 0 ? ((selectedArea.demographics.housing.vacant / selectedArea.demographics.housing.totalUnits) * 100).toFixed(1) : '0.0'}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Age Demographics */}
            <div className="mb-4">
              <h5 
                className="text-sm font-medium mb-3"
                style={{ color: 'var(--text-secondary)' }}
              >
                Age Demographics
              </h5>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div 
                  className="flex justify-between p-2 rounded"
                  style={{ background: 'var(--bg-overlay)', borderColor: 'var(--border-subtle)' }}
                >
                  <span style={{ color: 'var(--text-tertiary)' }}>Under 18 years</span>
                  <span 
                    className="font-mono font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {formatNumber(selectedArea.demographics.population.total - selectedArea.demographics.population.adults18Plus)} ({(((selectedArea.demographics.population.total - selectedArea.demographics.population.adults18Plus) / selectedArea.demographics.population.total) * 100).toFixed(1)}%)
                  </span>
                </div>
                <div 
                  className="flex justify-between p-2 rounded"
                  style={{ background: 'var(--bg-overlay)', borderColor: 'var(--border-subtle)' }}
                >
                  <span style={{ color: 'var(--text-tertiary)' }}>18 years and over</span>
                  <span 
                    className="font-mono font-medium"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {formatNumber(selectedArea.demographics.population.adults18Plus)} ({((selectedArea.demographics.population.adults18Plus / selectedArea.demographics.population.total) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Disease Prevalence */}
        <section className="mb-6">
          <h4 
            className="text-base font-semibold mb-4 uppercase tracking-wider"
            style={{ 
              color: 'var(--text-primary)',
              letterSpacing: '0.05em'
            }}
          >
            Disease Prevalence
          </h4>
          <div className="flex flex-col gap-4">
            {diseases.map(diseaseType => {
              const disease = selectedArea.diseases[diseaseType];
              const diseaseInfo = getDiseaseInfo(diseaseType);
              
              if (!disease) return null;

              const prevalencePercentage = getPrevalencePercentage(disease.rate);

              return (
                <div 
                  key={diseaseType}
                  className="border rounded-lg p-4 relative overflow-hidden"
                  style={{
                    background: 'var(--bg-overlay)',
                    borderColor: 'var(--border-subtle)'
                  }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <span 
                      className="text-sm font-semibold"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {diseaseInfo.name}
                    </span>
                    <span 
                      className="text-xs font-mono"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {diseaseInfo.icdCodes}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className="text-center">
                      <span 
                        className="block text-xs uppercase tracking-wider mb-1"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        Raw Count
                      </span>
                      <span 
                        className="text-lg font-bold font-mono"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {formatNumber(disease.count)}
                      </span>
                      <span 
                        className="block text-xs"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        patients
                      </span>
                    </div>
                    <div className="text-center">
                      <span 
                        className="block text-xs uppercase tracking-wider mb-1"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        Age-Adjusted Rate
                      </span>
                      <span 
                        className="text-lg font-bold font-mono"
                        style={{ color: 'var(--rush-primary-light)' }}
                      >
                        {formatRate(disease.rate)}
                      </span>
                      <span 
                        className="block text-xs"
                        style={{ color: 'var(--text-tertiary)' }}
                      >
                        per 1,000
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-center mb-3">
                    <span 
                      className="text-xs"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      Population: {formatNumber(selectedArea.population)} | 
                      Prevalence: {((disease.count / selectedArea.population) * 100).toFixed(2)}%
                    </span>
                  </div>
                  
                  <div 
                    className="h-1 rounded transition-all duration-300"
                    style={{
                      width: `${prevalencePercentage}%`,
                      background: 'linear-gradient(to right, var(--data-lowest), var(--data-low), var(--data-medium), var(--data-high), var(--data-highest))'
                    }}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* Data Quality Indicator */}
        <section 
          className="border-t pt-4"
          style={{ borderTopColor: 'var(--border-subtle)' }}
        >
          <div className="flex items-center gap-4">
            <span 
              className="text-sm min-w-[120px]"
              style={{ color: 'var(--text-secondary)' }}
            >
              Data Completeness
            </span>
            <div 
              className="flex-1 h-1.5 rounded overflow-hidden"
              style={{ background: 'var(--border-subtle)' }}
            >
              <div 
                className="h-full transition-all duration-300"
                style={{
                  width: `${selectedArea.dataQuality}%`,
                  background: 'var(--status-success)'
                }}
              />
            </div>
            <span 
              className="text-sm font-semibold font-mono"
              style={{ color: 'var(--status-success)' }}
            >
              {selectedArea.dataQuality}%
            </span>
          </div>
        </section>
      </div>

      {/* Panel Footer */}
      <div 
        className="p-6 border-t"
        style={{ borderTopColor: 'var(--border-default)' }}
      >
        <p 
          className="text-xs mb-2"
          style={{ color: 'var(--text-muted)' }}
        >
          Data: Capricorn Network • Population: 2020 US Census
        </p>
        <p 
          className="text-xs"
          style={{ color: 'var(--text-muted)' }}
        >
          Last updated: December 2024
        </p>
      </div>
    </div>
  );
}
