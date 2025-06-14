export interface Disease {
  id: string;
  name: string;
  icdCodes: string;
  count: number;
  rate: number;
}

export interface Demographics {
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

export interface AreaData {
  id: string;
  name: string;
  geoid: string;
  population: number;
  density: number;
  diseases: Record<string, Disease>;
  dataQuality: number;
  demographics?: Demographics;
  geometry?: any;
}

export interface MapFeature {
  id: string;
  type: 'Feature';
  properties: AreaData;
  geometry: {
    type: 'Polygon' | 'MultiPolygon';
    coordinates: number[][][] | number[][][][];
  };
}

export interface ChicagoGeoData {
  type: 'FeatureCollection';
  features: MapFeature[];
}

export type ViewMode = 'census' | 'community' | 'wards';
export type DiseaseType = 'diabetes' | 'hypertension' | 'heart' | 'copd' | 'asthma' | 'stroke' | 'ckd' | 'depression' | 'anxiety' | 'obesity' | 'cancer' | 'arthritis' | 'osteoporosis' | 'liver' | 'substance';
export type VisualizationMode = 'count' | 'rate' | 'age_adjusted';

export interface AppState {
  selectedArea: AreaData | null;
  activeView: ViewMode;
  selectedDisease: DiseaseType;
  visualizationMode: VisualizationMode;
  showSuppressed: boolean;
  isInfoPanelOpen: boolean;
}

export interface TooltipData {
  name: string;
  population: number;
  density: number;
  patientCount: number;
  rate: number;
  diseaseName: string;
  diseaseCount: number;
  diseaseRate: number;
}

export interface CensusData {
  population: number;
  density: number;
}
