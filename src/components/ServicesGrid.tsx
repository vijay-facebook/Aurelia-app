import React, { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Clock, Sparkles, X } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { ServiceItemConfig } from '../config/types';
import { defaultConfig } from '../config/defaultConfig';

interface ServicesGridProps {
  onSelectService: (service: ServiceItemConfig) => void;
}

const getMenuCategoriesForService = (category: string): string[] => {
  const normalized = (category || '').toLowerCase();
  if (normalized === 'nails' || normalized === 'spa' || normalized === 'nails-spa') {
    return ['nails-spa', 'nails', 'spa'];
  }
  return [normalized];
};

const getExtendedDescription = (service: ServiceItemConfig): string => {
  if (service.extendedDescription && service.extendedDescription.trim().length > 0) {
    return service.extendedDescription;
  }
  const matchedDefault = defaultConfig.services.find(
    (d) => d.id === service.id || d.title.toLowerCase() === service.title.toLowerCase()
  );
  if (matchedDefault?.extendedDescription) {
    return matchedDefault.extendedDescription;
  }
  return `${service.subtitle} Every session begins with an unhurried one-on-one consultation tailored to your preferences, using carefully sourced botanical formulations in a calm private setting.`;
};

export const ServicesGrid: React.FC<ServicesGridProps> = ({ onSelectService }) => {
  const { config } = useConfig();
  const [detailService, setDetailService] = useState<ServiceItemConfig | null>(null);

  useEffect(() => {
    if (!detailService) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDetailService(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [detailService]);

  if (!config.sectionsVisibility.services) return null;

  const relatedMenuItems = detailService
    ? (config.menu?.items || []).filter((item) =>
        getMenuCategoriesForService(detailService.category).includes((item.category || '').toLowerCase())
      )
    : [];

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
            {/* Image Container — opens Service Detail popup */}
            <div
              role="button"
              tabIndex={0}
              aria-label={`View details for ${service.title}`}
              onClick={(e) => {
                e.stopPropagation();
                setDetailService(service);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  setDetailService(service);
                }
              }}
              className="relative aspect-[4/3] rounded-[6px] overflow-hidden mb-4 bg-[#E3D7C7] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8C6A43]"
            >
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />

              <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1D1612]/80 backdrop-blur-md text-[#F6F1EA] text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-[4px]">
                View Details
              </div>

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

      {/* Service Detail Popup */}
      {detailService && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-detail-title"
          onClick={() => setDetailService(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8 bg-[#1D1612]/70 backdrop-blur-md animate-fade-in font-sans"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#F6F1EA] rounded-[12px] border border-[#D8C8B4] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setDetailService(null)}
              className="absolute top-4 right-4 z-10 p-2 text-[#1D1612] hover:text-[#8C6A43] bg-[#EFE6DA] hover:bg-[#E3D7C7] rounded-full transition-colors cursor-pointer"
              aria-label="Close service detail"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid md:grid-cols-12 gap-8 p-6 lg:p-10">
              {/* Left Column: Service Image & Price */}
              <div className="md:col-span-5 space-y-4">
                <div className="aspect-[4/3] md:aspect-[3/4] rounded-[8px] overflow-hidden border border-[#D8C8B4] bg-[#E3D7C7] shadow-md relative">
                  <img
                    src={detailService.image}
                    alt={detailService.title}
                    className="w-full h-full object-cover"
                  />
                  {detailService.popular && (
                    <div className="absolute top-3 left-3 bg-[#1D1612]/85 backdrop-blur-md text-[#D9B98F] text-[10px] uppercase tracking-widest px-3 py-1 rounded-[4px] border border-[#D8C8B4]/30 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      <span>Most Requested</span>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 right-3 bg-[#F6F1EA]/95 backdrop-blur-md px-3.5 py-2 rounded-[6px] border border-[#D8C8B4] flex items-center justify-between text-xs text-[#1D1612]">
                    <span className="text-[10px] uppercase tracking-wider font-medium text-[#8C6A43]">
                      Starting Investment
                    </span>
                    <span className="font-mono font-medium">{detailService.price}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Extended Description & Booking Trigger */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C6A43] font-medium block">
                    Service Detail · {detailService.category}
                  </span>

                  <div>
                    <h2
                      id="service-detail-title"
                      className="font-serif text-3xl lg:text-4xl text-[#1D1612] font-light leading-tight"
                    >
                      {detailService.title}
                    </h2>
                    <p className="text-xs font-sans text-[#8C6A43] font-medium mt-1.5">
                      {detailService.subtitle}
                    </p>
                  </div>

                  <p className="text-xs sm:text-sm font-sans text-[#6F5F51] font-light leading-relaxed">
                    {getExtendedDescription(detailService)}
                  </p>

                  {relatedMenuItems.length > 0 && (
                    <div className="bg-[#EFE6DA] p-4 rounded-[8px] border border-[#D8C8B4] space-y-3">
                      <span className="font-serif text-sm font-medium text-[#1D1612] block">
                        Curated Treatments in This Category
                      </span>
                      <ul className="space-y-2.5">
                        {relatedMenuItems.slice(0, 4).map((item) => (
                          <li
                            key={item.id}
                            className="flex items-start justify-between gap-3 text-xs border-b border-[#D8C8B4]/60 last:border-b-0 pb-2 last:pb-0"
                          >
                            <div>
                              <p className="font-medium text-[#1D1612]">{item.title}</p>
                              <p className="text-[11px] text-[#6F5F51] font-light">{item.description}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="font-mono text-[#1D1612] font-medium block">{item.price}</span>
                              <span className="text-[10px] text-[#8C6A43] inline-flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                {item.duration}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Book CTA */}
                <div className="pt-4 border-t border-[#D8C8B4] flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const chosen = detailService;
                      setDetailService(null);
                      onSelectService(chosen);
                    }}
                    className="flex-1 bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] py-3.5 px-6 rounded-[6px] text-xs uppercase tracking-widest font-medium transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <span>Book {detailService.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D9B98F]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailService(null)}
                    className="px-5 py-3.5 rounded-[6px] border border-[#D8C8B4] bg-[#EFE6DA] hover:bg-[#E3D7C7] text-[#1D1612] text-xs uppercase tracking-widest font-medium transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
