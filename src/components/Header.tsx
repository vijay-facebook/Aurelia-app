import React, { useState } from 'react';
import { ArrowRight, ExternalLink, X, Menu as MenuIcon } from 'lucide-react';

interface HeaderProps {
  onOpenBooking: () => void;
  onNavigate: (sectionId: string) => void;
  activeSection: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBooking, onNavigate, activeSection }) => {
  const [showDemoBanner, setShowDemoBanner] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#F6F1EA]/95 backdrop-blur-md border-b border-[#D8C8B4]/60 transition-all font-sans">
      {/* Top Banner (As seen in the template reference image) */}
      {showDemoBanner && (
        <div className="bg-[#1D1612] text-[#F6F1EA] text-[11px] py-1.5 px-4 flex items-center justify-between font-sans tracking-wide">
          <div className="flex-1 text-center font-light">
            <span className="opacity-80">Live preview · </span>
            <span className="font-medium text-[#D9B98F]">AURELIA</span> is a luxury beauty & wellness studio website.
          </div>
          <a
            href="https://aistudio.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 text-[#D9B98F] hover:text-white transition-colors text-[11px] font-medium uppercase tracking-wider"
          >
            <span>Customize This Design</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Main Navigation Row */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between gap-8">
        
        {/* Brand Wordmark */}
        <button
          onClick={() => onNavigate('hero')}
          className="text-left cursor-pointer group shrink-0"
        >
          <span className="font-serif text-2xl lg:text-3xl tracking-[0.3em] font-light text-[#1D1612] uppercase block group-hover:text-[#8C6A43] transition-colors">
            A U R E L I A
          </span>
        </button>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-sans text-xs tracking-[0.2em] text-[#2A211B] font-medium uppercase">
          <button
            onClick={() => onNavigate('services')}
            className={`hover:text-[#8C6A43] transition-colors cursor-pointer ${
              activeSection === 'services' ? 'text-[#8C6A43] border-b-2 border-[#8C6A43] pb-1' : ''
            }`}
          >
            Services
          </button>
          <button
            onClick={() => onNavigate('about')}
            className={`hover:text-[#8C6A43] transition-colors cursor-pointer ${
              activeSection === 'about' ? 'text-[#8C6A43] border-b-2 border-[#8C6A43] pb-1' : ''
            }`}
          >
            About
          </button>
          <button
            onClick={() => onNavigate('team')}
            className={`hover:text-[#8C6A43] transition-colors cursor-pointer ${
              activeSection === 'team' ? 'text-[#8C6A43] border-b-2 border-[#8C6A43] pb-1' : ''
            }`}
          >
            Artists
          </button>
          <button
            onClick={() => onNavigate('menu')}
            className={`hover:text-[#8C6A43] transition-colors cursor-pointer ${
              activeSection === 'menu' ? 'text-[#8C6A43] border-b-2 border-[#8C6A43] pb-1' : ''
            }`}
          >
            Menu
          </button>
          <button
            onClick={() => onNavigate('gallery')}
            className={`hover:text-[#8C6A43] transition-colors cursor-pointer ${
              activeSection === 'gallery' ? 'text-[#8C6A43] border-b-2 border-[#8C6A43] pb-1' : ''
            }`}
          >
            Gallery
          </button>
          <button
            onClick={() => onNavigate('videos')}
            className={`hover:text-[#8C6A43] transition-colors cursor-pointer ${
              activeSection === 'videos' ? 'text-[#8C6A43] border-b-2 border-[#8C6A43] pb-1' : ''
            }`}
          >
            Videos
          </button>
          <button
            onClick={() => onNavigate('offers')}
            className={`hover:text-[#8C6A43] transition-colors cursor-pointer ${
              activeSection === 'offers' ? 'text-[#8C6A43] border-b-2 border-[#8C6A43] pb-1' : ''
            }`}
          >
            Offers
          </button>
          <button
            onClick={() => onNavigate('social')}
            className={`hover:text-[#8C6A43] transition-colors cursor-pointer ${
              activeSection === 'social' ? 'text-[#8C6A43] border-b-2 border-[#8C6A43] pb-1' : ''
            }`}
          >
            Social
          </button>
          <button
            onClick={() => onNavigate('home-services')}
            className={`hover:text-[#8C6A43] transition-colors cursor-pointer ${
              activeSection === 'home-services' ? 'text-[#8C6A43] border-b-2 border-[#8C6A43] pb-1' : ''
            }`}
          >
            At-Home
          </button>
          <button
            onClick={() => onNavigate('reviews')}
            className={`hover:text-[#8C6A43] transition-colors cursor-pointer ${
              activeSection === 'reviews' ? 'text-[#8C6A43] border-b-2 border-[#8C6A43] pb-1' : ''
            }`}
          >
            Reviews
          </button>
        </nav>

        {/* CTA Action */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={onOpenBooking}
            className="bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] px-6 py-2.5 rounded-full text-xs font-sans uppercase tracking-widest font-medium transition-all flex items-center gap-2 cursor-pointer shadow-sm group"
          >
            <span>Book Appointment</span>
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
          <button onClick={() => { onNavigate('services'); setMobileMenuOpen(false); }} className="block w-full text-left py-2">Services</button>
          <button onClick={() => { onNavigate('about'); setMobileMenuOpen(false); }} className="block w-full text-left py-2">About</button>
          <button onClick={() => { onNavigate('menu'); setMobileMenuOpen(false); }} className="block w-full text-left py-2">Menu</button>
          <button onClick={() => { onNavigate('gallery'); setMobileMenuOpen(false); }} className="block w-full text-left py-2">Gallery</button>
          <button onClick={() => { onNavigate('videos'); setMobileMenuOpen(false); }} className="block w-full text-left py-2">Videos</button>
          <button onClick={() => { onNavigate('offers'); setMobileMenuOpen(false); }} className="block w-full text-left py-2">Offers</button>
          <button onClick={() => { onNavigate('home-services'); setMobileMenuOpen(false); }} className="block w-full text-left py-2">At-Home</button>
          <button onClick={() => { onNavigate('social'); setMobileMenuOpen(false); }} className="block w-full text-left py-2">Social</button>
          <button onClick={() => { onNavigate('reviews'); setMobileMenuOpen(false); }} className="block w-full text-left py-2">Reviews</button>
        </div>
      )}
    </header>
  );
};
