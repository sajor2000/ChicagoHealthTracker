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
          {/* Title Section - Far Left */}
          <div>
            <h1 
              className="text-lg font-bold leading-tight"
              style={{ color: 'white' }}
            >
              Chicago Chronic Disease Data Commons
            </h1>
          </div>
          
          {/* Expanded Organization Credits */}
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-lg border border-white/20">
                <img 
                  src={rushLogo} 
                  alt="Rush Logo" 
                  className="h-8 w-auto filter brightness-110"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <span className="text-white font-bold text-lg hidden">R</span>
              </div>
              <div>
                <div className="text-white/80 font-medium text-xs uppercase tracking-wide mb-1">Built by</div>
                <div className="text-white font-bold text-base leading-tight">Rush Health Equity</div>
                <div className="text-white font-bold text-base leading-tight -mt-1">Analytics Studio</div>
              </div>
            </div>
            
            <div className="w-px h-12 bg-white/20"></div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 bg-white/10 rounded-lg border border-white/20">
                <img 
                  src={capricornLogo} 
                  alt="CAPriCORN Logo" 
                  className="h-8 w-auto filter brightness-110"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <span className="text-white font-bold text-lg hidden">C</span>
              </div>
              <div>
                <div className="text-white/80 font-medium text-xs uppercase tracking-wide mb-1">Data by</div>
                <div className="text-white font-bold text-base leading-tight">CAPriCORN</div>
                <div className="text-white/90 font-medium text-sm leading-tight">Research Network</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
