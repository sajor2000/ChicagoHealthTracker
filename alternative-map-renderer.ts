/**
 * Alternative Map Rendering Strategy for Production Deployment
 * Uses Canvas 2D rendering as fallback when Mapbox layers fail to render
 */

interface MapFeature {
  geometry: {
    coordinates: number[][][];
  };
  properties: {
    name: string;
    diabetes_rate?: number;
    [key: string]: any;
  };
}

export class AlternativeMapRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private features: MapFeature[] = [];
  
  constructor(canvasElement: HTMLCanvasElement) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d')!;
  }
  
  /**
   * Load GeoJSON features for canvas rendering
   */
  loadFeatures(features: MapFeature[]) {
    this.features = features;
    console.log(`Canvas renderer loaded ${features.length} features`);
  }
  
  /**
   * Convert lat/lng to canvas coordinates
   */
  private projectToCanvas(lat: number, lng: number): [number, number] {
    // Simple Mercator projection for Chicago area
    const chicagoBounds = {
      north: 42.0231,
      south: 41.6447,
      east: -87.5240,
      west: -87.9403
    };
    
    const x = ((lng - chicagoBounds.west) / (chicagoBounds.east - chicagoBounds.west)) * this.canvas.width;
    const y = ((chicagoBounds.north - lat) / (chicagoBounds.north - chicagoBounds.south)) * this.canvas.height;
    
    return [x, y];
  }
  
  /**
   * Render health disparity overlays on canvas
   */
  renderHealthOverlays(diseaseProperty: string = 'diabetes_rate') {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Get values for color scaling
    const values = this.features
      .map(f => f.properties[diseaseProperty])
      .filter(v => typeof v === 'number' && v > 0)
      .sort((a, b) => a - b);
    
    const min = values[0];
    const max = values[values.length - 1];
    const range = max - min;
    
    console.log(`Canvas rendering ${diseaseProperty}: ${min} - ${max}`);
    
    this.features.forEach(feature => {
      const value = feature.properties[diseaseProperty];
      if (typeof value !== 'number' || value <= 0) return;
      
      // Calculate color intensity (0-1)
      const intensity = (value - min) / range;
      
      // Color mapping: Blue (low) to Red (high)
      let color: string;
      if (intensity < 0.25) {
        color = `rgba(43, 131, 186, 0.7)`; // Blue
      } else if (intensity < 0.5) {
        color = `rgba(171, 221, 164, 0.7)`; // Green
      } else if (intensity < 0.75) {
        color = `rgba(255, 255, 191, 0.7)`; // Yellow
      } else {
        color = `rgba(215, 25, 28, 0.7)`; // Red
      }
      
      this.renderFeature(feature, color);
    });
    
    console.log(`Canvas rendering complete: ${this.features.length} polygons`);
  }
  
  /**
   * Render individual polygon feature
   */
  private renderFeature(feature: MapFeature, fillColor: string) {
    const coords = feature.geometry.coordinates[0];
    if (!coords || coords.length < 3) return;
    
    this.ctx.beginPath();
    
    coords.forEach((coord, index) => {
      const [x, y] = this.projectToCanvas(coord[1], coord[0]);
      
      if (index === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }
    });
    
    this.ctx.closePath();
    this.ctx.fillStyle = fillColor;
    this.ctx.fill();
    this.ctx.strokeStyle = '#333333';
    this.ctx.lineWidth = 0.5;
    this.ctx.stroke();
  }
  
  /**
   * Test if canvas rendering works
   */
  testCanvasRendering(): boolean {
    try {
      this.ctx.fillStyle = '#ff0000';
      this.ctx.fillRect(0, 0, 100, 100);
      return true;
    } catch (error) {
      console.error('Canvas rendering failed:', error);
      return false;
    }
  }
}

/**
 * Initialize alternative renderer when Mapbox fails
 */
export function initializeAlternativeRenderer(mapContainer: HTMLElement, geoData: any): AlternativeMapRenderer | null {
  try {
    // Create canvas overlay
    const canvas = document.createElement('canvas');
    canvas.width = mapContainer.clientWidth;
    canvas.height = mapContainer.clientHeight;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1000';
    
    mapContainer.appendChild(canvas);
    
    const renderer = new AlternativeMapRenderer(canvas);
    
    if (renderer.testCanvasRendering()) {
      renderer.loadFeatures(geoData.features);
      renderer.renderHealthOverlays('diabetes_rate');
      
      console.log('Alternative canvas renderer initialized successfully');
      return renderer;
    } else {
      mapContainer.removeChild(canvas);
      return null;
    }
  } catch (error) {
    console.error('Alternative renderer initialization failed:', error);
    return null;
  }
}