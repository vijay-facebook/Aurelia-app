import React, { useState } from 'react';
import { ArrowRight, ExternalLink, X, Menu as MenuIcon, Shield } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';

interface HeaderProps {
  onOpenBooking: () => void;
  onNavigate: (sectionId: string) => void;
  activeSection: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBooking, onNavigate, activeSection }) => {
  const { config } = useConfig();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeNavItems = config.navigation
    .filter((item) => item.show)
    .filter((item) => {
      // Check section visibility toggle
      const visKey = item.id === 'about' ? 'story' : item.id === 'team' ? 'team' : item.id;
      if (visKey in config.sectionsVisibility) {
        return (config.sectionsVisibility as any)[visKey];
      }
      return true;
    })
    .sort((a, b) => a.order - b.order);

  return (
    <header className="sticky top-0 z-50 bg-[#F6F1EA]/95 backdrop-blur-md border-b border-[#D8C8B4]/60 transition-all font-sans">
      {/* Top Announcement Bar */}
      {config.announcementBar.enabled && (
        <div className="bg-[#1D1612] text-[#F6F1EA] text-[11px] py-1.5 px-4 flex items-center justify-between font-sans tracking-wide">
          <div className="flex-1 text-center font-light">
            <span>{config.announcementBar.text}</span>
          </div>
          {config.announcementBar.linkText && (
            <a
              href={config.announcementBar.linkUrl}
              className="hidden sm:flex items-center gap-1 text-[#D9B98F] hover:text-white transition-colors text-[11px] font-medium uppercase tracking-wider"
            >
              <span>{config.announcementBar.linkText}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* Main Navigation Row */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between gap-8">
        
        {/* Brand Logo / Wordmark */}
        <button
          onClick={() => onNavigate('hero')}
          className="text-left cursor-pointer group shrink-0"
        >
          {config.brand.logoImage ? (
            <img src={config.brand.logoImage} alt={config.brand.name} className="h-10 object-contain" />
          ) : (
            <span className={`font-serif text-2xl lg:text-3xl ${config.brand.autoLetterSpacing ? 'tracking-[0.3em]' : ''} font-light text-[#1D1612] uppercase block group-hover:text-[#8C6A43] transition-colors`}>
              {config.brand.wordmark || config.brand.name}
            </span>
          )}
        </button>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8 font-sans text-xs tracking-[0.2em] text-[#2A211B] font-medium uppercase">
          {activeNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`hover:text-[#8C6A43] transition-colors cursor-pointer ${
                activeSection === item.id ? 'text-[#8C6A43] border-b-2 border-[#8C6A43] pb-1' : ''
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* CTA Action */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/admin"
            title="Admin Portal Login"
            className="p-2.5 rounded-full border border-[#D8C8B4] text-[#1D1612] hover:bg-[#1D1612] hover:text-[#F6F1EA] transition-colors flex items-center justify-center"
          >
            <Shield className="w-4 h-4" />
          </a>
          <button
            onClick={onOpenBooking}
            className="bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] px-6 py-2.5 rounded-full text-xs font-sans uppercase tracking-widest font-medium transition-all flex items-center gap-2 cursor-pointer shadow-sm group"
          >
            <span>{config.hero.primaryButtonText}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Mobile Menu Icon */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-[#1D1612] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F6F1EA] border-b border-[#D8C8B4] p-6 space-y-4 text-xs uppercase tracking-widest font-medium text-[#1D1612]">
          {activeNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileMenuOpen(false);
              }}
              className="block w-full text-left py-2 hover:text-[#8C6A43]"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
