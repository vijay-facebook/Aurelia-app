import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { ServiceItemConfig } from '../config/types';

interface ServicesGridProps {
  onSelectService: (service: ServiceItemConfig) => void;
}

export const ServicesGrid: React.FC<ServicesGridProps> = ({ onSelectService }) => {
  const { config } = useConfig();
  if (!config.sectionsVisibility.services) return null;

  return (
    <section id="services" className="py-24 lg:py-32 max-w-[1440px] mx-auto px-6 lg:px-12 font-sans">
      
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
        <div>
          <span className="text-[11px] font-sans tracking-[0.3em] uppercase text-[#8C6A43] font-medium block mb-3">
            {config.headings.servicesEyebrow}
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-[#1D1612]">
            {config.headings.servicesTitle}
          </h2>
        </div>

        <p className="font-sans text-sm text-[#6F5F51] font-light max-w-md leading-relaxed">
          Every visit begins with a consultation, so the result suits your hair, your skin and your life.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {config.services.map((service) => (
          <div
            key={service.id}
            onClick={() => onSelectService(service)}
            className="group bg-[#EFE6DA]/60 hover:bg-[#EFE6DA] rounded-[8px] border border-[#D8C8B4]/70 p-4 transition-all duration-300 hover:shadow-lg cursor-pointer flex flex-col justify-between"
          >
            {/* Image Container */}
            <div className="relative aspect-[4/3] rounded-[6px] overflow-hidden mb-4 bg-[#E3D7C7]">
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />

              <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-[#F6F1EA] text-[#1D1612] group-hover:bg-[#1D1612] group-hover:text-[#F6F1EA] flex items-center justify-center transition-colors shadow-sm">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-2xl font-light text-[#1D1612] group-hover:text-[#8C6A43] transition-colors">
                  {service.title}
                </h3>
                <span className="font-sans text-xs text-[#6F5F51] font-medium font-mono">
                  {service.price}
                </span>
              </div>

              <p className="font-sans text-xs text-[#6F5F51] font-light leading-relaxed">
                {service.subtitle}
              </p>
            </div>

          </div>
        ))}
      </div>

    </section>
  );
};
