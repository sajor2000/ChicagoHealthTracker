/**
 * Enhanced Deployment Configuration
 * Robust environment detection and API configuration for production deployment
 */

interface DeploymentConfig {
  apiBaseUrl: string;
  mapboxToken: string | null;
  environment: 'development' | 'production' | 'preview';
  isSecure: boolean;
  domainWhitelist: string[];
}

class DeploymentManager {
  private config: DeploymentConfig;

  constructor() {
    this.config = this.detectEnvironment();
  }

  private detectEnvironment(): DeploymentConfig {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const origin = window.location.origin;

    // Determine environment type
    let environment: 'development' | 'production' | 'preview' = 'development';
    
    if (hostname.includes('.replit.app')) {
      environment = 'production';
    } else if (hostname.includes('preview') || hostname.includes('staging')) {
      environment = 'preview';
    } else if (hostname === 'localhost' || hostname === '127.0.0.1') {
      environment = 'development';
    } else {
      environment = 'production';
    }

    return {
      apiBaseUrl: this.resolveApiBaseUrl(origin, environment),
      mapboxToken: this.resolveMapboxToken(),
      environment,
      isSecure: protocol === 'https:',
      domainWhitelist: this.getDomainWhitelist(hostname),
    };
  }

  private resolveApiBaseUrl(origin: string, environment: string): string {
    // For all environments, use the current origin to avoid CORS issues
    return origin;
  }

  private resolveMapboxToken(): string | null {
    // Comprehensive token resolution for different deployment platforms
    const tokenCandidates = [
      // Vite environment variables (most common)
      import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
      import.meta.env.VITE_MAPBOX_TOKEN,
      
      // React environment variables
      import.meta.env.REACT_APP_MAPBOX_ACCESS_TOKEN,
      import.meta.env.REACT_APP_MAPBOX_TOKEN,
      
      // Next.js environment variables
      import.meta.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
      import.meta.env.NEXT_PUBLIC_MAPBOX_TOKEN,
      
      // Direct environment variables
      import.meta.env.MAPBOX_ACCESS_TOKEN,
      import.meta.env.MAPBOX_TOKEN,
      
      // Runtime injection (for platforms that inject at runtime)
      (window as any).__MAPBOX_TOKEN__,
      (window as any).MAPBOX_ACCESS_TOKEN,
      (window as any).VITE_MAPBOX_ACCESS_TOKEN,
      
      // Fallback for manual configuration
      (window as any).mapboxConfig?.accessToken,
    ];

    // Return the first valid token found
    for (const token of tokenCandidates) {
      if (token && typeof token === 'string' && token.startsWith('pk.')) {
        return token;
      }
    }

    return null;
  }

  private getDomainWhitelist(hostname: string): string[] {
    const whitelist = [
      'localhost',
      '127.0.0.1',
      '*.replit.app',
      '*.vercel.app',
      '*.netlify.app',
      '*.herokuapp.com',
    ];

    // Add current hostname if it's a custom domain
    if (!whitelist.some(domain => 
      domain.includes('*') ? hostname.includes(domain.replace('*', '')) : hostname === domain
    )) {
      whitelist.push(hostname);
    }

    return whitelist;
  }

  public getConfig(): DeploymentConfig {
    return { ...this.config };
  }

  public getApiUrl(endpoint: string): string {
    if (endpoint.startsWith('http')) {
      return endpoint; // Already absolute URL
    }
    
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.config.apiBaseUrl}${cleanEndpoint}`;
  }

  public getMapboxToken(): string | null {
    return this.config.mapboxToken;
  }

  public isProduction(): boolean {
    return this.config.environment === 'production';
  }

  public isSecure(): boolean {
    return this.config.isSecure;
  }

  public validateConfiguration(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check Mapbox token
    if (!this.config.mapboxToken) {
      errors.push('Mapbox access token is missing');
    } else if (!this.config.mapboxToken.startsWith('pk.')) {
      errors.push('Mapbox access token format is invalid');
    }

    // Check HTTPS in production
    if (this.config.environment === 'production' && !this.config.isSecure) {
      warnings.push('Production environment should use HTTPS');
    }

    // Check API base URL
    if (!this.config.apiBaseUrl) {
      errors.push('API base URL could not be determined');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  public logConfiguration(): void {
    console.group('🔧 Deployment Configuration');
    console.log('Environment:', this.config.environment);
    console.log('API Base URL:', this.config.apiBaseUrl);
    console.log('Mapbox Token Present:', !!this.config.mapboxToken);
    console.log('Token Prefix:', this.config.mapboxToken?.substring(0, 8) + '...');
    console.log('Secure Context:', this.config.isSecure);
    console.log('Domain Whitelist:', this.config.domainWhitelist);
    
    const validation = this.validateConfiguration();
    if (validation.errors.length > 0) {
      console.error('Configuration Errors:', validation.errors);
    }
    if (validation.warnings.length > 0) {
      console.warn('Configuration Warnings:', validation.warnings);
    }
    
    console.groupEnd();
  }
}

// Create singleton instance
export const deploymentManager = new DeploymentManager();

// Export convenience functions
export function getApiUrl(endpoint: string): string {
  return deploymentManager.getApiUrl(endpoint);
}

export function getMapboxToken(): string | null {
  return deploymentManager.getMapboxToken();
}

export function isDeploymentEnvironment(): boolean {
  return deploymentManager.isProduction();
}

export function validateDeploymentConfig() {
  return deploymentManager.validateConfiguration();
}

// Auto-log configuration in development
if (!deploymentManager.isProduction()) {
  deploymentManager.logConfiguration();
}