/**
 * Enhanced Disease Prevalence System with Stronger Disparity Patterns
 * Based on CDC/NIH research with amplified visualization patterns for mapping
 */

import { DISEASE_PREVALENCE_DATA, calculateDiseasePrevalence, calculateSocioeconomicFactor } from './disease-prevalence-research.js';

interface Demographics {
  race: {
    white: number;
    black: number;
    americanIndian: number;
    asian: number;
    pacificIslander: number;
    otherRace: number;
    multiRace: number;
  };
  ethnicity: {
    total: number;
    hispanic: number;
    nonHispanic: number;
  };
  housing: {
    totalUnits: number;
    occupied: number;
    vacant: number;
  };
  age: {
    under18: number;
    age18Plus: number;
    age65Plus: number;
  };
}

/**
 * Enhanced disease prevalence calculation with amplified disparity patterns
 */
export function calculateEnhancedDiseasePrevalence(
  diseaseId: string,
  demographics: Demographics,
  totalPopulation: number,
  geographicLevel: 'census' | 'community' | 'ward' = 'census'
): { count: number; rate: number } {
  
  const disease = DISEASE_PREVALENCE_DATA.find(d => d.id === diseaseId);
  if (!disease) {
    throw new Error(`Disease ${diseaseId} not found in prevalence data`);
  }

  // Calculate demographic composition
  const blackPct = demographics.race.black / totalPopulation;
  const hispanicPct = demographics.ethnicity.hispanic / totalPopulation;
  const whitePct = demographics.race.white / totalPopulation;
  const age65Pct = demographics.age.age65Plus / totalPopulation;
  const minorityPct = blackPct + hispanicPct;

  // Base prevalence weighted by demographics
  let baseRate = disease.nationalPrevalence.overall;
  
  // Apply demographic-specific rates with stronger weighting
  if (blackPct > 0.1) {
    baseRate = (blackPct * disease.nationalPrevalence.blackNonHispanic) + 
               ((1 - blackPct) * baseRate);
  }
  
  if (hispanicPct > 0.1) {
    baseRate = (hispanicPct * disease.nationalPrevalence.hispanicLatino) + 
               ((1 - hispanicPct) * baseRate);
  }

  // Enhanced disparity multipliers for high-minority areas
  let disparityMultiplier = 1.0;
  
  // Diseases with strongest documented disparities get enhanced patterns
  if (diseaseId === 'stroke' && blackPct > 0.4) {
    disparityMultiplier = 2.1; // Amplified from 1.68 for visualization
  } else if (diseaseId === 'diabetes' && minorityPct > 0.5) {
    disparityMultiplier = 1.9; // Amplified from 1.43
  } else if (diseaseId === 'obesity' && blackPct > 0.5) {
    disparityMultiplier = 2.0; // Amplified from 1.44
  } else if (diseaseId === 'asthma' && minorityPct > 0.6) {
    disparityMultiplier = 2.2; // Amplified for environmental justice visualization
  } else if (diseaseId === 'hypertension' && blackPct > 0.5) {
    disparityMultiplier = 1.8; // Amplified from 1.29
  } else if (diseaseId === 'mental_health' && minorityPct > 0.6) {
    disparityMultiplier = 0.7; // Lower access/reporting in high-minority areas
  }

  // Additional SES-based adjustments
  const sesFactor = calculateSocioeconomicFactor(demographics, totalPopulation);
  if (sesFactor > 1.5) {
    disparityMultiplier *= 1.3; // Amplify for low SES areas
  }

  // Geographic level adjustments for better visualization contrast
  let levelMultiplier = 1.0;
  if (geographicLevel === 'community' || geographicLevel === 'ward') {
    if (minorityPct > 0.7) {
      levelMultiplier = 1.6; // Very high minority areas
    } else if (minorityPct > 0.5) {
      levelMultiplier = 1.4; // High minority areas
    } else if (minorityPct > 0.3) {
      levelMultiplier = 1.2; // Moderate minority areas
    } else if (minorityPct < 0.15) {
      levelMultiplier = 0.75; // Low minority areas for contrast
    }
  }

  // Apply all adjustments
  let finalRate = baseRate * disease.chicagoAdjustment * disparityMultiplier * levelMultiplier;

  // Age adjustments
  if (age65Pct > 0.15 && disease.riskFactors.age65Plus > 1.0) {
    finalRate *= (1 + (age65Pct - 0.15) * (disease.riskFactors.age65Plus - 1) * 0.3);
  }

  // Urban environment adjustments
  finalRate *= disease.riskFactors.urban;

  // Add realistic variation while maintaining patterns
  const variation = 0.8 + (Math.random() * 0.4); // ±20% variation
  finalRate *= variation;

  // Ensure minimum realistic rates
  finalRate = Math.max(disease.nationalPrevalence.overall * 0.3, finalRate);

  // Calculate count
  const count = Math.round((finalRate / 1000) * totalPopulation);

  return {
    count: Math.max(1, count),
    rate: parseFloat(finalRate.toFixed(1))
  };
}

/**
 * Generate enhanced disease data with stronger disparity patterns
 */
export function generateEnhancedDiseases(
  population: number,
  demographics: Demographics,
  geographicLevel: 'census' | 'community' | 'ward' = 'census'
): Record<string, any> {
  
  if (!demographics || population <= 0) {
    return generateFallbackDiseases(population);
  }

  const diseases: Record<string, any> = {};
  
  // Generate disease data for each condition with enhanced disparities
  for (const diseaseData of DISEASE_PREVALENCE_DATA) {
    try {
      const { count, rate } = calculateEnhancedDiseasePrevalence(
        diseaseData.id,
        demographics,
        population,
        geographicLevel
      );
      
      diseases[diseaseData.id] = {
        id: diseaseData.id,
        name: diseaseData.name,
        icdCodes: diseaseData.icdCodes,
        count: count,
        rate: rate
      };
      
    } catch (error) {
      console.warn(`Error calculating ${diseaseData.id} prevalence:`, error);
      diseases[diseaseData.id] = generateFallbackDisease(diseaseData, population);
    }
  }
  
  return diseases;
}

/**
 * Generate fallback disease data
 */
function generateFallbackDiseases(population: number): Record<string, any> {
  const diseases: Record<string, any> = {};
  
  for (const diseaseData of DISEASE_PREVALENCE_DATA) {
    diseases[diseaseData.id] = generateFallbackDisease(diseaseData, population);
  }
  
  return diseases;
}

/**
 * Generate fallback data for a single disease
 */
function generateFallbackDisease(diseaseData: any, population: number): any {
  const baseRate = diseaseData.nationalPrevalence.overall;
  const variation = 0.8 + (Math.random() * 0.4);
  const rate = baseRate * variation * diseaseData.chicagoAdjustment;
  const count = Math.round((rate / 1000) * population);
  
  return {
    id: diseaseData.id,
    name: diseaseData.name,
    icdCodes: diseaseData.icdCodes,
    count: Math.max(1, count),
    rate: parseFloat(rate.toFixed(1))
  };
}

/**
 * Calculate enhanced grading thresholds for better color visualization
 */
export function calculateEnhancedGradingThresholds(
  diseaseId: string, 
  geographicLevel: 'census' | 'community' | 'ward' = 'census'
) {
  const disease = DISEASE_PREVALENCE_DATA.find(d => d.id === diseaseId);
  if (!disease) return null;
  
  const baseRate = disease.nationalPrevalence.overall * disease.chicagoAdjustment;
  const disparityRatio = disease.nationalPrevalence.disparityRatio;
  
  // Create wider threshold ranges for better color contrast
  let multipliers = [0.4, 0.65, 1.0, 1.6, 2.4]; // Wider spread
  
  if (geographicLevel === 'community' || geographicLevel === 'ward') {
    // Even wider spread for aggregated levels
    multipliers = [0.3, 0.6, 1.0, 1.8, 2.8];
  }
  
  // For high-disparity diseases, create even wider ranges
  if (disparityRatio > 1.5) {
    multipliers = multipliers.map(m => m * 1.2);
  }
  
  return {
    veryLow: baseRate * multipliers[0],
    low: baseRate * multipliers[1],
    moderate: baseRate * multipliers[2],
    high: baseRate * multipliers[3],
    veryHigh: baseRate * multipliers[4],
    disparityRatio: disparityRatio
  };
}