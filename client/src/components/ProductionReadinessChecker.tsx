/**
 * Production Readiness Checker Component
 * Displays deployment status and configuration validation
 */

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { runProductionDiagnostics } from '@/lib/production-diagnostics';
import { validateDeploymentConfig } from '@/lib/enhanced-deployment-config';

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

export default function ProductionReadinessChecker() {
  const [diagnosticReport, setDiagnosticReport] = useState<DiagnosticReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Auto-run diagnostics on mount
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setIsRunning(true);
    try {
      const report = await runProductionDiagnostics();
      setDiagnosticReport(report);
    } catch (error) {
      console.error('Diagnostics failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getOverallStatus = (): 'healthy' | 'warning' | 'error' => {
    if (!diagnosticReport) return 'warning';
    if (diagnosticReport.errors.length > 0) return 'error';
    if (diagnosticReport.warnings.length > 0) return 'warning';
    return 'healthy';
  };

  if (!diagnosticReport && !isRunning) {
    return null; // Hide if no data and not running
  }

  const overallStatus = getOverallStatus();
  const configValidation = validateDeploymentConfig();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div 
        className="bg-white border border-gray-200 rounded-lg shadow-lg p-4"
        style={{ backgroundColor: 'var(--bg-card)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon(overallStatus)}
            <span className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
              Production Status
            </span>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs px-2 py-1 rounded hover:bg-gray-100"
            style={{ color: 'var(--text-secondary)' }}
          >
            {showDetails ? 'Hide' : 'Details'}
          </button>
        </div>

        {isRunning && (
          <div className="text-xs text-gray-500 mb-2">
            Running diagnostics...
          </div>
        )}

        {diagnosticReport && (
          <>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Environment:</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {diagnosticReport.environment.isProduction ? 'Production' : 'Development'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Mapbox Token:</span>
                <span style={{ color: diagnosticReport.mapbox.tokenExists ? 'var(--text-success)' : 'var(--text-error)' }}>
                  {diagnosticReport.mapbox.tokenExists ? 'Present' : 'Missing'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>API Access:</span>
                <span style={{ color: diagnosticReport.mapbox.apiAccessible ? 'var(--text-success)' : 'var(--text-error)' }}>
                  {diagnosticReport.mapbox.apiAccessible ? 'OK' : 'Failed'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>Map Container:</span>
                <span style={{ color: diagnosticReport.dom.mapContainerExists ? 'var(--text-success)' : 'var(--text-error)' }}>
                  {diagnosticReport.dom.mapContainerExists ? 'Found' : 'Missing'}
                </span>
              </div>
            </div>

            {showDetails && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                {diagnosticReport.errors.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-1 mb-1">
                      <XCircle className="w-3 h-3 text-red-500" />
                      <span className="text-xs font-medium text-red-600">Errors</span>
                    </div>
                    <ul className="text-xs space-y-1">
                      {diagnosticReport.errors.map((error, index) => (
                        <li key={index} className="text-red-600 pl-4">
                          • {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {diagnosticReport.warnings.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-1 mb-1">
                      <AlertTriangle className="w-3 h-3 text-yellow-500" />
                      <span className="text-xs font-medium text-yellow-600">Warnings</span>
                    </div>
                    <ul className="text-xs space-y-1">
                      {diagnosticReport.warnings.map((warning, index) => (
                        <li key={index} className="text-yellow-600 pl-4">
                          • {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  Last check: {new Date(diagnosticReport.timestamp).toLocaleTimeString()}
                </div>
              </div>
            )}
          </>
        )}

        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className="mt-3 w-full text-xs py-2 px-3 rounded border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          style={{ color: 'var(--text-secondary)' }}
        >
          {isRunning ? 'Running...' : 'Refresh Check'}
        </button>
      </div>
    </div>
  );
}