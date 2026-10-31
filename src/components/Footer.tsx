import React from 'react';
import { useConfig } from '../context/ConfigContext';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  const { config } = useConfig();
  const hours = config.openingHours;
  const isTueSun = !hours.tuesday.closed && !hours.sunday.closed && hours.monday.closed;
  const hoursText = isTueSun ? `Tue - Sun : ${hours.tuesday.open} - ${hours.tuesday.close}` : 'Open Daily';

  return (
    <footer className="bg-[#F6F1EA] text-[#1D1612] font-sans border-t border-[#D8C8B4] pt-20 pb-12 overflow-hidden relative">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 space-y-16 relative z-10">
        
        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 text-xs font-light">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <span className={`font-serif text-2xl ${config.brand.autoLetterSpacing ? 'tracking-[0.3em]' : ''} font-light uppercase block text-[#1D1612]`}>
              {config.brand.wordmark || config.brand.name}
            </span>
            <p className="text-[#6F5F51] leading-relaxed max-w-xs">
              {config.brand.tagline}
            </p>
          </div>

          {/* Visit */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C6A43] font-medium block">
              Visit
            </span>
            <p className="text-[#6F5F51] leading-relaxed">
              {config.businessInfo.addressLines?.join(', ')} <br />
              {config.businessInfo.city} {config.businessInfo.pincode}
            </p>
          </div>

          {/* Hours */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C6A43] font-medium block">
              Hours
            </span>
            <p className="text-[#6F5F51] leading-relaxed">
              {hoursText} <br />
              {hours.monday.closed ? 'Monday closed' : ''}
            </p>
          </div>

          {/* Follow */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C6A43] font-medium block">
              Follow
            </span>
            <div className="flex flex-col space-y-2 text-[#1D1612]">
              {config.social.links.instagram && (
                <a href={config.social.links.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-[#8C6A43] transition-colors">Instagram</a>
              )}
              {config.social.links.pinterest && (
                <a href={config.social.links.pinterest} target="_blank" rel="noopener noreferrer" className="hover:text-[#8C6A43] transition-colors">Pinterest</a>
              )}
              {config.social.links.whatsapp && (
                <a href={config.social.links.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-[#8C6A43] transition-colors">WhatsApp</a>
              )}
              {config.social.links.youtube && (
                <a href={config.social.links.youtube} target="_blank" rel="noopener noreferrer" className="hover:text-[#8C6A43] transition-colors">YouTube</a>
              )}
            </div>
          </div>

        </div>

        {/* Faded Large Brand Watermark */}
        <div className="pt-12 text-center select-none overflow-hidden">
          <span className={`font-serif text-6xl sm:text-8xl lg:text-[130px] font-light ${config.brand.autoLetterSpacing ? 'tracking-[0.35em]' : ''} text-[#D8C8B4]/40 uppercase block leading-none`}>
            {config.brand.wordmark || config.brand.name}
          </span>
        </div>

        {/* Copyright & Prominent Admin Portal Login */}
        <div className="pt-8 border-t border-[#D8C8B4]/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#6F5F51] gap-4">
          <span>{config.brand.copyright || `© ${config.brand.name} Studio. All rights reserved.`}</span>
          <a
            href="/admin"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8C6A43] text-white text-xs font-medium hover:bg-[#735432] shadow-sm transition-all transform hover:-translate-y-0.5"
          >
            <Shield size={14} />
            <span>Salon Admin Portal Login</span>
          </a>
        </div>

      </div>
    </footer>
  );
};
