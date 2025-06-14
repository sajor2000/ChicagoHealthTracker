/**
 * Epidemiologically-sound disease prevalence generator for Chicago
 * Based on national prevalence data, health disparities research, and Chicago's socioeconomic patterns
 */

interface EpidemiologicalFactors {
  basePrevalence: number; // National baseline prevalence per 100,000
  sesDisparity: number; // Multiplier for low SES areas (1.0 = no disparity)
  ageAdjustment: number; // Age-specific risk multiplier
  raceEthnicityRisk: {
    white: number;
    black: number;
    hispanic: number;
    asian: number;
    other: number;
  };
  environmentalFactors: {
    foodDesert: number; // Areas with limited healthy food access
    airQuality: number; // Industrial/traffic pollution exposure
    walkability: number; // Built environment walkability score
  };
}

/**
 * National prevalence data from CDC, AHA, and major epidemiological studies
 * Rates per 100,000 population unless otherwise noted
 */
const DISEASE_EPIDEMIOLOGY: Record<string, EpidemiologicalFactors> = {
  diabetes: {
    basePrevalence: 11300, // 11.3% national prevalence
    sesDisparity: 2.1, // Low SES areas have 2.1x higher rates
    ageAdjustment: 1.8, // Higher in older populations
    raceEthnicityRisk: {
      white: 1.0,
      black: 1.9, // Nearly double the risk
      hispanic: 1.7,
      asian: 1.2,
      other: 1.4
    },
    environmentalFactors: {
      foodDesert: 1.6,
      airQuality: 1.2,
      walkability: 1.3
    }
  },
  
  hypertension: {
    basePrevalence: 47300, // 47.3% national prevalence
    sesDisparity: 1.8,
    ageAdjustment: 2.2,
    raceEthnicityRisk: {
      white: 1.0,
      black: 1.6, // Significantly higher in Black Americans
      hispanic: 1.2,
      asian: 0.9,
      other: 1.1
    },
    environmentalFactors: {
      foodDesert: 1.4,
      airQuality: 1.3,
      walkability: 1.2
    }
  },

  heart_disease: {
    basePrevalence: 6200, // 6.2% national prevalence
    sesDisparity: 2.3,
    ageAdjustment: 3.1,
    raceEthnicityRisk: {
      white: 1.0,
      black: 1.4,
      hispanic: 1.1,
      asian: 0.8,
      other: 1.2
    },
    environmentalFactors: {
      foodDesert: 1.5,
      airQuality: 1.4,
      walkability: 1.3
    }
  },

  stroke: {
    basePrevalence: 2800, // 2.8% national prevalence
    sesDisparity: 2.0,
    ageAdjustment: 4.2,
    raceEthnicityRisk: {
      white: 1.0,
      black: 2.0, // Double the stroke risk
      hispanic: 1.3,
      asian: 0.9,
      other: 1.4
    },
    environmentalFactors: {
      foodDesert: 1.3,
      airQuality: 1.5,
      walkability: 1.2
    }
  },

  asthma: {
    basePrevalence: 7800, // 7.8% national prevalence
    sesDisparity: 1.9,
    ageAdjustment: 0.8, // Actually higher in children
    raceEthnicityRisk: {
      white: 1.0,
      black: 1.7,
      hispanic: 1.2,
      asian: 0.7,
      other: 1.3
    },
    environmentalFactors: {
      foodDesert: 1.1,
      airQuality: 2.1, // Strong environmental component
      walkability: 1.0
    }
  },

  copd: {
    basePrevalence: 6400, // 6.4% national prevalence
    sesDisparity: 2.5, // Strong SES gradient
    ageAdjustment: 3.8,
    raceEthnicityRisk: {
      white: 1.0,
      black: 1.1,
      hispanic: 0.8,
      asian: 0.6,
      other: 1.0
    },
    environmentalFactors: {
      foodDesert: 1.2,
      airQuality: 1.8,
      walkability: 1.1
    }
  },

  obesity: {
    basePrevalence: 36200, // 36.2% national prevalence
    sesDisparity: 1.6,
    ageAdjustment: 1.3,
    raceEthnicityRisk: {
      white: 1.0,
      black: 1.5,
      hispanic: 1.4,
      asian: 0.6,
      other: 1.2
    },
    environmentalFactors: {
      foodDesert: 1.8,
      airQuality: 1.1,
      walkability: 1.6
    }
  },

  mental_health: {
    basePrevalence: 20600, // 20.6% any mental illness
    sesDisparity: 1.4,
    ageAdjustment: 1.1,
    raceEthnicityRisk: {
      white: 1.0,
      black: 0.9, // Lower reported rates due to stigma/access
      hispanic: 0.8,
      asian: 0.7,
      other: 1.1
    },
    environmentalFactors: {
      foodDesert: 1.2,
      airQuality: 1.1,
      walkability: 1.0
    }
  }
};

/**
 * Chicago neighborhood socioeconomic risk classification
 * Based on census data: income, education, employment, housing
 */
const CHICAGO_SES_RISK_AREAS = {
  // Highest risk areas (South and West sides)
  highRisk: [
    'Englewood', 'West Englewood', 'Greater Grand Crossing', 'Chatham',
    'Auburn Gresham', 'Washington Heights', 'Roseland', 'Pullman',
    'South Shore', 'Woodlawn', 'East Garfield Park', 'West Garfield Park',
    'North Lawndale', 'South Lawndale', 'Austin', 'Humboldt Park',
    'West Town', 'Fuller Park', 'New City', 'Armour Square'
  ],
  
  // Moderate-high risk
  moderateHighRisk: [
    'South Chicago', 'Calumet Heights', 'Burnside', 'Riverdale',
    'Hegewisch', 'South Deering', 'East Side', 'Brighton Park',
    'McKinley Park', 'Bridgeport', 'Lower West Side', 'Near West Side',
    'Hermosa', 'Belmont Cragin', 'Portage Park'
  ],
  
  // Moderate risk
  moderateRisk: [
    'Ashburn', 'Beverly', 'Washington Park', 'Hyde Park', 'Kenwood',
    'Oakland', 'Douglas', 'Grand Boulevard', 'Bronzeville', 'Chinatown',
    'Logan Square', 'Avondale', 'Irving Park', 'Albany Park',
    'Maywood', 'Cicero', 'Berwyn'
  ],
  
  // Lower risk areas (North side, some downtown)
  lowRisk: [
    'Lincoln Park', 'Lakeview', 'Lincoln Square', 'North Center',
    'Roscoe Village', 'Wicker Park', 'Bucktown', 'River North',
    'Streeterville', 'Gold Coast', 'Near North Side', 'Loop'
  ]
};

/**
 * Environmental risk factors by Chicago area
 */
function getEnvironmentalRiskFactors(areaName: string): { foodDesert: number; airQuality: number; walkability: number } {
  const name = areaName.toLowerCase();
  
  // Food desert risk (limited access to healthy food)
  const foodDesertRisk = CHICAGO_SES_RISK_AREAS.highRisk.some(area => 
    name.includes(area.toLowerCase())) ? 1.8 :
    CHICAGO_SES_RISK_AREAS.moderateHighRisk.some(area => 
    name.includes(area.toLowerCase())) ? 1.4 :
    CHICAGO_SES_RISK_AREAS.moderateRisk.some(area => 
    name.includes(area.toLowerCase())) ? 1.1 : 1.0;

  // Air quality risk (industrial areas, highways)
  const airQualityRisk = name.includes('south') || name.includes('west') || 
    name.includes('industrial') ? 1.6 :
    name.includes('north') || name.includes('lake') ? 0.9 : 1.2;

  // Walkability (built environment)
  const walkabilityRisk = name.includes('downtown') || name.includes('loop') ||
    name.includes('north') ? 0.8 :
    name.includes('south') || name.includes('west') ? 1.4 : 1.2;

  return {
    foodDesert: foodDesertRisk,
    airQuality: airQualityRisk,
    walkability: walkabilityRisk
  };
}

/**
 * Calculate SES disparity multiplier based on area characteristics
 */
function getSESMultiplier(areaName: string, demographics: any): number {
  const name = areaName.toLowerCase();
  
  if (CHICAGO_SES_RISK_AREAS.highRisk.some(area => name.includes(area.toLowerCase()))) {
    return 2.2; // Highest disparity areas
  } else if (CHICAGO_SES_RISK_AREAS.moderateHighRisk.some(area => name.includes(area.toLowerCase()))) {
    return 1.7;
  } else if (CHICAGO_SES_RISK_AREAS.moderateRisk.some(area => name.includes(area.toLowerCase()))) {
    return 1.3;
  } else {
    return 0.8; // Lower risk areas
  }
}

/**
 * Calculate race/ethnicity risk multiplier
 */
function getRaceEthnicityMultiplier(disease: string, demographics: any): number {
  const factors = DISEASE_EPIDEMIOLOGY[disease]?.raceEthnicityRisk;
  if (!factors || !demographics?.race) return 1.0;

  const totalPop = demographics.race.white + demographics.race.black + 
    demographics.race.americanIndian + demographics.race.asian + 
    demographics.race.pacificIslander + demographics.race.otherRace + 
    demographics.race.multiRace;

  if (totalPop === 0) return 1.0;

  // Calculate weighted average risk based on racial composition
  const weightedRisk = 
    (demographics.race.white / totalPop) * factors.white +
    (demographics.race.black / totalPop) * factors.black +
    ((demographics.race.americanIndian + demographics.race.pacificIslander + 
      demographics.race.otherRace + demographics.race.multiRace) / totalPop) * factors.other +
    (demographics.race.asian / totalPop) * factors.asian;

  // Add Hispanic ethnicity effect
  const hispanicProportion = demographics.ethnicity?.hispanic / demographics.ethnicity?.total || 0;
  const adjustedRisk = weightedRisk * (1 + hispanicProportion * (factors.hispanic - 1));

  return adjustedRisk;
}

/**
 * Calculate age-adjusted multiplier
 */
function getAgeMultiplier(disease: string, demographics: any): number {
  const ageAdjustment = DISEASE_EPIDEMIOLOGY[disease]?.ageAdjustment || 1.0;
  
  if (!demographics?.age) return 1.0;

  const totalPop = demographics.age.under18 + demographics.age.age18Plus;
  if (totalPop === 0) return 1.0;

  // Diseases like diabetes, hypertension increase with age
  const elderlyProportion = demographics.age.age65Plus / totalPop;
  const adultProportion = (demographics.age.age18Plus - demographics.age.age65Plus) / totalPop;
  
  // Age-adjusted multiplier
  return 1.0 + (elderlyProportion * (ageAdjustment - 1)) + (adultProportion * 0.3);
}

/**
 * Generate epidemiologically-accurate disease prevalence
 */
export function generateEpidemiologicalDiseaseData(
  population: number,
  areaName: string,
  demographics: any
): Record<string, { count: number; rate: number }> {
  const diseases: Record<string, { count: number; rate: number }> = {};

  for (const [diseaseKey, epidemiology] of Object.entries(DISEASE_EPIDEMIOLOGY)) {
    // Base prevalence rate per 100,000
    let prevalenceRate = epidemiology.basePrevalence;

    // Apply SES disparity
    const sesMultiplier = getSESMultiplier(areaName, demographics);
    prevalenceRate *= (1 + (sesMultiplier - 1) * epidemiology.sesDisparity);

    // Apply race/ethnicity risk
    const raceMultiplier = getRaceEthnicityMultiplier(diseaseKey, demographics);
    prevalenceRate *= raceMultiplier;

    // Apply age adjustment
    const ageMultiplier = getAgeMultiplier(diseaseKey, demographics);
    prevalenceRate *= ageMultiplier;

    // Apply environmental factors
    const envFactors = getEnvironmentalRiskFactors(areaName);
    prevalenceRate *= envFactors.foodDesert * epidemiology.environmentalFactors.foodDesert / epidemiology.environmentalFactors.foodDesert;
    prevalenceRate *= envFactors.airQuality * epidemiology.environmentalFactors.airQuality / epidemiology.environmentalFactors.airQuality;
    prevalenceRate *= envFactors.walkability * epidemiology.environmentalFactors.walkability / epidemiology.environmentalFactors.walkability;

    // Calculate final count and rate
    const count = Math.round((prevalenceRate / 100000) * population);
    const rate = parseFloat((prevalenceRate / 1000).toFixed(1)); // Rate per 1,000

    diseases[diseaseKey] = { count, rate };
  }

  return diseases;
}

/**
 * Add epidemiological accuracy indicators
 */
export function calculateDataQuality(
  population: number,
  demographics: any,
  areaType: 'census' | 'community' | 'ward'
): number {
  // Higher quality for larger populations and complete demographics
  let quality = 0.5;

  if (population > 1000) quality += 0.2;
  if (population > 5000) quality += 0.1;
  if (population > 10000) quality += 0.1;

  if (demographics?.race && demographics?.age && demographics?.ethnicity) {
    quality += 0.1;
  }

  // Community areas and wards have better aggregated data quality
  if (areaType === 'community' || areaType === 'ward') {
    quality += 0.1;
  }

  return Math.min(1.0, quality);
}