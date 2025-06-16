/**
 * Production Diagnostics System
 * Comprehensive debugging and monitoring for deployment environments
 */

interface DiagnosticReport {
  timestamp: string;
  environment: {
    url: string;
    protocol: string;
    hostname: string;
    isProduction: boolean;
    isHttps: boolean;
  };
  mapbox: {
    tokenExists: boolean;
    tokenPrefix: string;
    apiAccessible: boolean;
    apiStatus?: number;
    apiError?: string;
  };
  dom: {
    mapContainerExists: boolean;
    mapContainerVisible: boolean;
    viewport: {
      width: number;
      height: number;
    };
  };
  network: {
    corsEnabled: boolean;
    mixedContent: boolean;
  };
  errors: string[];
  warnings: string[];
}

class ProductionDiagnostics {
  private report: DiagnosticReport;
  private errorCollector: string[] = [];

  constructor() {
    this.report = this.initializeReport();
    this.setupErrorHandling();
  }

  private initializeReport(): DiagnosticReport {
    return {
      timestamp: new Date().toISOString(),
      environment: {
        url: window.location.href,
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        isProduction: this.isProductionEnvironment(),
        isHttps: window.location.protocol === 'https:',
      },
      mapbox: {
        tokenExists: false,
        tokenPrefix: '',
        apiAccessible: false,
      },
      dom: {
        mapContainerExists: false,
        mapContainerVisible: false,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      },
      network: {
        corsEnabled: true,
        mixedContent: false,
      },
      errors: [],
      warnings: [],
    };
  }

  private setupErrorHandling(): void {
    // Capture JavaScript errors
    window.addEventListener('error', (event) => {
      this.errorCollector.push(`JS Error: ${event.message} at ${event.filename}:${event.lineno}`);
    });

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.errorCollector.push(`Unhandled Promise: ${event.reason}`);
    });
  }

  private isProductionEnvironment(): boolean {
    return window.location.hostname.includes('.replit.app') ||
           window.location.hostname.includes('.vercel.app') ||
           window.location.hostname.includes('.netlify.app') ||
           (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');
  }

  public async runDiagnostics(): Promise<DiagnosticReport> {
    console.log('🔍 Running production diagnostics...');

    // Check Mapbox token
    await this.checkMapboxConfiguration();

    // Check DOM elements
    this.checkDOMElements();

    // Check network conditions
    await this.checkNetworkConditions();

    // Collect errors
    this.report.errors = [...this.errorCollector];

    // Add warnings based on findings
    this.generateWarnings();

    return this.report;
  }

  private async checkMapboxConfiguration(): Promise<void> {
    try {
      // Check for token in various locations
      const token = this.getMapboxToken();
      
      this.report.mapbox.tokenExists = !!token;
      this.report.mapbox.tokenPrefix = token ? `${token.substring(0, 8)}...` : '';

      if (!token) {
        this.report.errors.push('Mapbox token not found in environment variables');
        return;
      }

      // Test API accessibility
      try {
        const response = await fetch(
          `https://api.mapbox.com/styles/v1/mapbox/streets-v11?access_token=${token}`,
          { method: 'HEAD' }
        );
        
        this.report.mapbox.apiAccessible = response.ok;
        this.report.mapbox.apiStatus = response.status;

        if (!response.ok) {
          this.report.errors.push(`Mapbox API returned status ${response.status}`);
        }
      } catch (error) {
        this.report.mapbox.apiError = error instanceof Error ? error.message : 'Unknown API error';
        this.report.errors.push(`Mapbox API test failed: ${this.report.mapbox.apiError}`);
      }
    } catch (error) {
      this.report.errors.push(`Mapbox configuration check failed: ${error}`);
    }
  }

  private getMapboxToken(): string | null {
    // Try multiple token access patterns
    const tokenSources = [
      import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
      import.meta.env.MAPBOX_ACCESS_TOKEN,
      import.meta.env.REACT_APP_MAPBOX_TOKEN,
      import.meta.env.NEXT_PUBLIC_MAPBOX_TOKEN,
      (window as any).__MAPBOX_TOKEN__,
      (window as any).MAPBOX_ACCESS_TOKEN,
    ];

    return tokenSources.find(token => token && typeof token === 'string') || null;
  }

  private checkDOMElements(): void {
    const mapContainer = document.getElementById('map');
    this.report.dom.mapContainerExists = !!mapContainer;

    if (mapContainer) {
      const rect = mapContainer.getBoundingClientRect();
      this.report.dom.mapContainerVisible = rect.width > 0 && rect.height > 0;
      
      if (!this.report.dom.mapContainerVisible) {
        this.report.warnings.push('Map container exists but has zero dimensions');
      }
    } else {
      this.report.errors.push('Map container element not found');
    }
  }

  private async checkNetworkConditions(): Promise<void> {
    // Check for mixed content issues
    if (this.report.environment.isHttps) {
      this.report.network.mixedContent = false; // Assume good unless proven otherwise
    } else if (this.report.environment.isProduction) {
      this.report.warnings.push('Production site not using HTTPS - may cause mixed content issues');
    }

    // Test CORS with a simple request
    try {
      const response = await fetch('/api/health-check', { method: 'HEAD' });
      this.report.network.corsEnabled = response.ok;
    } catch (error) {
      this.report.warnings.push('API health check failed - possible CORS issue');
    }
  }

  private generateWarnings(): void {
    if (this.report.environment.isProduction) {
      if (!this.report.mapbox.tokenExists) {
        this.report.warnings.push('Production deployment missing Mapbox token');
      }
      
      if (!this.report.environment.isHttps) {
        this.report.warnings.push('Production site should use HTTPS');
      }
      
      if (!this.report.dom.mapContainerExists) {
        this.report.warnings.push('Map container missing - check build output');
      }
    }
  }

  public logReport(): void {
    console.group('🔍 Production Diagnostics Report');
    console.log('Environment:', this.report.environment);
    console.log('Mapbox Config:', this.report.mapbox);
    console.log('DOM Status:', this.report.dom);
    console.log('Network Status:', this.report.network);
    
    if (this.report.errors.length > 0) {
      console.error('Errors:', this.report.errors);
    }
    
    if (this.report.warnings.length > 0) {
      console.warn('Warnings:', this.report.warnings);
    }
    
    console.groupEnd();
  }

  public getHealthStatus(): 'healthy' | 'warning' | 'error' {
    if (this.report.errors.length > 0) return 'error';
    if (this.report.warnings.length > 0) return 'warning';
    return 'healthy';
  }
}

// Export singleton instance
export const productionDiagnostics = new ProductionDiagnostics();

// Export diagnostic runner for easy access
export async function runProductionDiagnostics(): Promise<DiagnosticReport> {
  const report = await productionDiagnostics.runDiagnostics();
  productionDiagnostics.logReport();
  return report;
}

// Export health check function
export function getApplicationHealth(): 'healthy' | 'warning' | 'error' {
  return productionDiagnostics.getHealthStatus();
}