import { useState, useCallback } from 'react';
import { ColorScale } from '@/lib/dynamic-color-scaling';

interface QuartileState {
  quartiles: ColorScale | null;
  disease: string;
  mode: 'count' | 'rate';
  viewMode: string;
}

const useQuartileData = () => {
  const [quartileState, setQuartileState] = useState<QuartileState>({
    quartiles: null,
    disease: '',
    mode: 'count',
    viewMode: ''
  });

  const updateQuartiles = useCallback((
    quartiles: ColorScale, 
    disease: string, 
    mode: 'count' | 'rate',
    viewMode: string
  ) => {
    setQuartileState({ quartiles, disease, mode, viewMode });
  }, []);

  const getQuartiles = useCallback(() => {
    return quartileState.quartiles;
  }, [quartileState.quartiles]);

  return {
    quartiles: quartileState.quartiles,
    disease: quartileState.disease,
    mode: quartileState.mode,
    viewMode: quartileState.viewMode,
    updateQuartiles,
    getQuartiles
  };
};

export default useQuartileData;