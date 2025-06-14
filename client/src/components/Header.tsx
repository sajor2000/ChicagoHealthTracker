import { Link } from 'wouter';
import rushLogo from '@assets/Xnip2025-06-13_18-03-51_1749855841178.png';
import capricornLogo from '@assets/Xnip2025-06-13_17-59-22_1749855841179.png';

interface HeaderProps {
  className?: string;
}

export default function Header({ className = '' }: HeaderProps) {
  return (
    <header className={`fixed top-0 left-0 right-0 h-24 z-50 ${className}`}>
      <div 
        className="h-full backdrop-blur-[16px] border-b"
        style={{ 
          background: 'linear-gradient(135deg, rgba(0, 103, 71, 0.95) 0%, rgba(20, 20, 20, 0.95) 100%)',
          borderBottomColor: 'rgba(0, 103, 71, 0.3)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)'
        }}
      >
        <div className="max-w-7xl mx-auto w-full h-full flex items-center justify-between px-8">
          {/* Logo and Title Section */}
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, var(--rush-primary) 0%, var(--rush-secondary) 100%)',
                  boxShadow: '0 4px 16px rgba(0, 103, 71, 0.3)'
                }}
              >
                <span className="text-xl font-bold text-white">CD</span>
              </div>
              <div>
                <h1 
                  className="text-2xl font-bold leading-tight"
                  style={{ color: 'white' }}
                >
                  Chicago Chronic Disease
                </h1>
                <p 
                  className="text-base font-medium -mt-1"
                  style={{ color: 'rgba(255, 255, 255, 0.9)' }}
                >
                  Data Commons
                </p>
              </div>
            </div>
            
            {/* Organization Credits - Always Visible */}
            <div className="flex items-center gap-6 pl-6 border-l border-white/20">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded">
                  <img 
                    src={rushLogo} 
                    alt="Rush Logo" 
                    className="h-6 w-auto filter brightness-110"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'block';
                    }}
                  />
                  <span className="text-white font-bold text-xs hidden">R</span>
                </div>
                <div className="text-sm">
                  <div className="text-white/80 font-medium text-xs uppercase tracking-wide">Built by</div>
                  <div className="text-white font-bold text-sm leading-tight">Rush Health Equity</div>
                  <div className="text-white font-bold text-sm leading-tight -mt-1">Analytics Studio</div>
                </div>
              </div>
              
              <div className="w-px h-8 bg-white/20"></div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded">
                  <img 
                    src={capricornLogo} 
                    alt="CAPriCORN Logo" 
                    className="h-6 w-auto filter brightness-110"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling.style.display = 'block';
                    }}
                  />
                  <span className="text-white font-bold text-xs hidden">C</span>
                </div>
                <div className="text-sm">
                  <div className="text-white/80 font-medium text-xs uppercase tracking-wide">Data by</div>
                  <div className="text-white font-bold text-sm leading-tight">CAPriCORN</div>
                  <div className="text-white/90 font-medium text-xs leading-tight">Research Network</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex">
            <a 
              href="#about"
              className="px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 hover:no-underline"
              style={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              About
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
