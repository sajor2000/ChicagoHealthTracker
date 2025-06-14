/**
 * Simple disease prevalence generator for Chicago
 * Using realistic epidemiological rates without density adjustments
 */

interface DiseaseData {
  id: string;
  name: string;
  icdCodes: string;
  count: number;
  rate: number;
}

// Base disease prevalence rates per 1,000 population for proper visualization
const BASE_RATES = {
  diabetes: 80,         // 8% base prevalence
  hypertension: 150,    // 15% base prevalence
  heart_disease: 40,    // 4% base prevalence
  stroke: 20,           // 2% base prevalence
  asthma: 35,           // 3.5% base prevalence
  copd: 20,             // 2% base prevalence
  obesity: 250,         // 25% base prevalence
  mental_health: 80     // 8% base prevalence
};

const DISEASE_NAMES = {
  diabetes: 'Diabetes',
  hypertension: 'Hypertension', 
  heart_disease: 'Heart Disease',
  stroke: 'Stroke',
  asthma: 'Asthma',
  copd: 'COPD',
  obesity: 'Obesity',
  mental_health: 'Mental Health'
};

const ICD_CODES = {
  diabetes: 'E10-E14',
  hypertension: 'I10-I15',
  heart_disease: 'I20-I25', 
  stroke: 'I60-I69',
  asthma: 'J45-J46',
  copd: 'J40-J44',
  obesity: 'E66',
  mental_health: 'F32-F41'
};

/**
 * Generate disease data with proper health disparity patterns
 */
export function generateDiseaseData(population: number, disparityFactor: number = 1.0): Record<string, DiseaseData> {
  const diseases: Record<string, DiseaseData> = {};
  
  Object.keys(BASE_RATES).forEach(diseaseId => {
    const baseRate = BASE_RATES[diseaseId as keyof typeof BASE_RATES];
    
    // Apply health disparity factor with realistic variation
    const adjustedRate = baseRate * disparityFactor * (0.8 + Math.random() * 0.4);
    const ratePerThousand = parseFloat(adjustedRate.toFixed(1));
    
    // Calculate count directly from rate without additional density adjustments
    const count = Math.round((ratePerThousand / 1000) * population);
    
    diseases[diseaseId] = {
      id: diseaseId,
      name: DISEASE_NAMES[diseaseId as keyof typeof DISEASE_NAMES],
      icdCodes: ICD_CODES[diseaseId as keyof typeof ICD_CODES],
      count: Math.max(1, count),
      rate: ratePerThousand
    };
  });
  
  return diseases;
}

/**
 * Calculate health disparity factor based on demographics and geography
 */
export function calculateDisparityFactor(demographics: any): number {
  let factor = 1.0;
  
  if (demographics?.race && demographics?.totalPopulation > 0) {
    const totalPop = demographics.totalPopulation;
    const blackPct = (demographics.race.black || 0) / totalPop;
    const hispanicPct = (demographics.ethnicity?.hispanic || 0) / totalPop;
    
    // Apply stronger health disparity multipliers for more pronounced red zones
    // South/west Chicago areas get much higher disease rates
    factor += (blackPct * 1.4) + (hispanicPct * 0.9);
    
    // Additional strong disparity for areas with very high minority populations
    if (blackPct > 0.7 || hispanicPct > 0.6) {
      factor += 0.6;
    }
    
    // Extra boost for predominantly Black areas (south side patterns)
    if (blackPct > 0.5) {
      factor += 0.4;
    }
    
    // Extra boost for high Hispanic areas (west side patterns)
    if (hispanicPct > 0.4) {
      factor += 0.3;
    }
  }
  
  // Allow for stronger disparity range (0.5x to 3.2x baseline) for more red zones
  return Math.max(0.5, Math.min(factor, 3.2));
}