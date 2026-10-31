import React from 'react';
import { useConfig } from '../context/ConfigContext';

export const MarqueeTicker: React.FC = () => {
  const { config } = useConfig();
  const items = config.marqueeItems?.length > 0 ? config.marqueeItems : ['Hair Styling', 'Colour', 'Skin Rituals', 'Bridal'];

  return (
    <div className="bg-[#EFE6DA] border-y border-[#D8C8B4] py-3.5 overflow-hidden font-serif text-sm sm:text-base text-[#1D1612] tracking-widest uppercase font-light">
      <div className="flex whitespace-nowrap animate-marquee">
        {items.concat(items).map((item, idx) => (
          <div key={idx} className="flex items-center gap-6 mx-4 shrink-0">
            <span>{item}</span>
            <span className="text-[#8C6A43] text-xs">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
};
