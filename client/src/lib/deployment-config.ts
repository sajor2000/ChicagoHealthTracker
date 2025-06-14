/**
 * Deployment-specific configuration for production environments
 * Handles API endpoint resolution and environment variable access
 */

export function getApiUrl(endpoint: string): string {
  // Handle deployment environment URL resolution
  if (endpoint.startsWith('/api/')) {
    // Check if we're in a deployed Replit environment
    if (window.location.hostname.includes('.replit.app')) {
      return `${window.location.origin}${endpoint}`;
    }
    
    // Check if we're in a custom deployment
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return `${window.location.origin}${endpoint}`;
    }
  }
  
  // Default to relative URL for local development
  return endpoint;
}

export function getMapboxToken(): string | null {
  // Try multiple environment variable access patterns for deployment
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 
               import.meta.env.MAPBOX_ACCESS_TOKEN ||
               (window as any).__MAPBOX_TOKEN__ ||
               (window as any).MAPBOX_ACCESS_TOKEN;
  
  return token || null;
}

export function isDeploymentEnvironment(): boolean {
  return window.location.hostname.includes('.replit.app') ||
         (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');
}