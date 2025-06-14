import { useQuery } from '@tanstack/react-query';
import { ChicagoGeoData, ViewMode } from '@/types';

interface PopulationData {
  [geoid: string]: {
    population: number;
    density: number;
  };
}

export function useChicagoGeoData(viewMode: ViewMode) {
  // Use authentic Census Bureau API data for census tracts
  const endpoint = viewMode === 'census' 
    ? '/api/chicago-areas/census-direct' 
    : `/api/chicago-areas/${viewMode}`;
    
  return useQuery<ChicagoGeoData>({
    queryKey: [endpoint, viewMode],
    enabled: true,
  });
}

export function usePopulationData(geoids: string[]) {
  return useQuery<PopulationData>({
    queryKey: ['/api/census-population', geoids.join(',')],
    enabled: geoids.length > 0,
  });
}

export function useDiseaseData(areaIds: string[], diseaseType: string) {
  return useQuery({
    queryKey: ['/api/disease-data', areaIds.join(','), diseaseType],
    enabled: areaIds.length > 0 && !!diseaseType,
  });
}
