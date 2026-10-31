import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#F6F1EA] text-[#1D1612] font-sans border-t border-[#D8C8B4] pt-20 pb-12 overflow-hidden relative">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 space-y-16 relative z-10">
        
        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-xs font-light">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <span className="font-serif text-2xl tracking-[0.3em] font-light uppercase block text-[#1D1612]">
              A U R E L I A
            </span>
            <p className="text-[#6F5F51] leading-relaxed max-w-xs">
              Luxury beauty and wellness in the heart of Bandra.
            </p>
          </div>

          {/* Visit */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C6A43] font-medium block">
              Visit
            </span>
            <p className="text-[#6F5F51] leading-relaxed">
              14 Carter Road <br />
              Bandra West, Mumbai 400050
            </p>
          </div>

          {/* Hours */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C6A43] font-medium block">
              Hours
            </span>
            <p className="text-[#6F5F51] leading-relaxed">
              Tue - Sun : 10am - 8pm <br />
              Monday closed
            </p>
          </div>

          {/* Follow */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C6A43] font-medium block">
              Follow
            </span>
            <div className="flex flex-col space-y-2 text-[#1D1612]">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#8C6A43] transition-colors">Instagram</a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#8C6A43] transition-colors">Pinterest</a>
              <a href="https://wa.me/919820000000" target="_blank" rel="noopener noreferrer" className="hover:text-[#8C6A43] transition-colors">WhatsApp</a>
            </div>
          </div>

        </div>

        {/* Faded Large Brand Watermark */}
        <div className="pt-12 text-center select-none overflow-hidden">
          <span className="font-serif text-6xl sm:text-8xl lg:text-[130px] font-light tracking-[0.35em] text-[#D8C8B4]/40 uppercase block leading-none">
            A U R E L I A
          </span>
        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-[#D8C8B4]/60 text-center text-[11px] text-[#6F5F51]">
          © Aurelia Studio · A demo website designed and built by Nexora
        </div>

      </div>
    </footer>
  );
};
