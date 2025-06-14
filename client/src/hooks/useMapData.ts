import { useQuery } from '@tanstack/react-query';
import { ChicagoGeoData, ViewMode } from '@/types';

interface PopulationData {
  [geoid: string]: {
    population: number;
    density: number;
  };
}

export function useChicagoGeoData(viewMode: ViewMode) {
  return useQuery<ChicagoGeoData>({
    queryKey: [`/api/chicago-areas/${viewMode}`, viewMode],
    enabled: true,
    retry: 3,
    onError: (error) => {
      console.error(`❌ API Error for ${viewMode}:`, error);
    },
    onSuccess: (data) => {
      console.log(`✅ API Success for ${viewMode}:`, {
        type: data?.type,
        features: data?.features?.length,
        firstFeature: data?.features?.[0]?.properties ? Object.keys(data.features[0].properties) : 'no properties'
      });
    }
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
