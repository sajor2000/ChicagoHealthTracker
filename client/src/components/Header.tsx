import { Link } from 'wouter';
import rushLogo from '@assets/Xnip2025-06-13_18-03-51_1749855841178.png';
import capricornLogo from '@assets/Xnip2025-06-13_17-59-22_1749855841179.png';

interface HeaderProps {
  className?: string;
}

export default function Header({ className = '' }: HeaderProps) {
  return (
    <header className={`fixed top-0 left-0 right-0 h-20 z-50 ${className}`}>
      <div 
        className="h-full backdrop-blur-[12px] border-b-2"
        style={{ 
          backgroundColor: 'var(--bg-elevated)',
          borderBottomColor: 'var(--rush-primary)'
        }}
      >
        <div className="max-w-7xl mx-auto w-full h-full flex justify-between items-center px-6">
          <div className="branding flex items-center gap-6">
            <div>
              <h1 
                className="text-2xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                Chicago Chronic Disease Data Commons
              </h1>
            </div>
            
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-tertiary)' }}>
              <div className="flex items-center gap-2">
                <span>Built by</span>
                <img 
                  src={rushLogo} 
                  alt="Rush Logo" 
                  className="h-4 w-auto"
                />
                <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Rush Health Equity Data Analytics Studio
                </span>
              </div>
              
              <div className="w-px h-4 bg-[var(--border-subtle)]"></div>
              
              <div className="flex items-center gap-2">
                <span>Data by</span>
                <img 
                  src={capricornLogo} 
                  alt="CAPriCORN Logo" 
                  className="h-4 w-auto"
                />
                <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>
                  CAPriCORN
                </span>
              </div>
            </div>
          </div>
          
          <nav className="header-nav hidden md:flex gap-8">
            <a 
              href="#about"
              className="text-sm uppercase tracking-wider transition-colors duration-200 hover:no-underline"
              style={{ 
                color: 'var(--text-tertiary)',
                letterSpacing: '0.05em'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--rush-primary-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }}
            >
              About
            </a>
            <a 
              href="#methodology"
              className="text-sm uppercase tracking-wider transition-colors duration-200 hover:no-underline"
              style={{ 
                color: 'var(--text-tertiary)',
                letterSpacing: '0.05em'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--rush-primary-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }}
            >
              Methodology
            </a>
            <a 
              href="#download"
              className="text-sm uppercase tracking-wider transition-colors duration-200 hover:no-underline"
              style={{ 
                color: 'var(--text-tertiary)',
                letterSpacing: '0.05em'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--rush-primary-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }}
            >
              Download Data
            </a>
            <a 
              href="#api"
              className="text-sm uppercase tracking-wider transition-colors duration-200 hover:no-underline"
              style={{ 
                color: 'var(--text-tertiary)',
                letterSpacing: '0.05em'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--rush-primary-light)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }}
            >
              API Access
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
