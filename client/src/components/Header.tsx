import { Link } from 'wouter';

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
          <div className="branding">
            <h1 
              className="text-2xl font-bold mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              Chicago Chronic Disease Data Commons
            </h1>
            <p 
              className="text-base font-medium"
              style={{ color: 'var(--rush-primary)' }}
            >
              Rush University Health Equity Analytics Studio
            </p>
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
