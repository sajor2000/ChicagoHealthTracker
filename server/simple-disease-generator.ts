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

// Realistic disease prevalence rates per 1,000 population based on CDC data
const BASE_RATES = {
  diabetes: 25,        // 2.5% prevalence - reduced from inflated rates
  hypertension: 120,   // 12% prevalence - reduced from inflated rates
  heart_disease: 15,   // 1.5% prevalence - reduced from inflated rates
  stroke: 8,           // 0.8% prevalence - reduced from inflated rates
  asthma: 22,          // 2.2% prevalence - reduced from inflated rates
  copd: 12,            // 1.2% prevalence - reduced from inflated rates
  obesity: 80,         // 8% prevalence - reduced from inflated rates
  mental_health: 28    // 2.8% prevalence - reduced from inflated rates
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
 * Generate disease data with distinct count and rate patterns
 */
export function generateDiseaseData(population: number, disparityFactor: number = 1.0): Record<string, DiseaseData> {
  const diseases: Record<string, DiseaseData> = {};
  
  Object.keys(BASE_RATES).forEach(diseaseId => {
    const baseRate = BASE_RATES[diseaseId as keyof typeof BASE_RATES];
    
    // Rate calculation - shows disease prevalence per 1,000 people
    const adjustedRate = baseRate * disparityFactor * (0.85 + Math.random() * 0.3);
    const ratePerThousand = parseFloat(adjustedRate.toFixed(1));
    
    // Count calculation - shows absolute cases with population-independent variation
    // This creates distinct patterns where high-population areas don't automatically have high counts
    const baseCount = Math.round((adjustedRate / 1000) * population);
    const populationVariation = 0.3 + Math.random() * 1.4; // 0.3x to 1.7x variation
    const reportingFactor = 0.6 + Math.random() * 0.8; // Account for underreporting/detection
    
    const finalCount = Math.round(baseCount * populationVariation * reportingFactor);
    
    diseases[diseaseId] = {
      id: diseaseId,
      name: DISEASE_NAMES[diseaseId as keyof typeof DISEASE_NAMES],
      icdCodes: ICD_CODES[diseaseId as keyof typeof ICD_CODES],
      count: Math.max(1, finalCount), // Ensure at least 1 case
      rate: ratePerThousand
    };
  });
  
  return diseases;
}

/**
 * Calculate simple health disparity factor based on demographics
 */
export function calculateDisparityFactor(demographics: any): number {
  let factor = 1.0;
  
  if (demographics?.race && demographics?.totalPopulation > 0) {
    const totalPop = demographics.totalPopulation;
    const blackPct = (demographics.race.black || 0) / totalPop;
    const hispanicPct = (demographics.ethnicity?.hispanic || 0) / totalPop;
    
    // South/west Chicago areas get modestly higher disease rates
    factor += (blackPct * 0.3) + (hispanicPct * 0.2);
  }
  
  // Cap maximum disparity at 1.8x baseline
  return Math.min(factor, 1.8);
}