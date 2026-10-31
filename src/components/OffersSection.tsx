import React, { useState } from 'react';
import { Tag, Clock, Check, ArrowRight, Sparkles, Copy, Percent } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { OfferItemConfig } from '../config/types';

interface OffersSectionProps {
  onClaimOffer: (offer: OfferItemConfig) => void;
  onShowToast: (message: string) => void;
}

export const OffersSection: React.FC<OffersSectionProps> = ({ onClaimOffer, onShowToast }) => {
  const { config } = useConfig();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!config.sectionsVisibility.offers) return null;

  const activeOffers = config.offers.filter((o) => o.active !== false);

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    onShowToast(`Promo code '${code}' copied to clipboard!`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  return (
    <section id="offers" className="py-24 lg:py-32 bg-[#F6F1EA] text-[#1D1612] font-sans relative border-t border-[#D8C8B4]/60">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.3em] text-[#8C6A43] font-medium block mb-3">
              {config.headings.offersEyebrow}
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-[#1D1612] tracking-tight leading-[1.05]">
              {config.headings.offersTitle}
            </h2>
          </div>
          <div className="flex items-center gap-3 bg-[#EFE6DA] px-5 py-3 rounded-[4px] border border-[#D8C8B4]">
            <Sparkles className="w-4 h-4 text-[#8C6A43]" />
            <span className="text-xs font-medium text-[#2A211B] uppercase tracking-wider">
              Limited-Time Seasonal Passes
            </span>
          </div>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {activeOffers.map((offer) => (
            <div
              key={offer.id}
              className="bg-white border border-[#D8C8B4] rounded-[12px] p-6 lg:p-8 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 relative"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-6">
                  <span className="text-[11px] uppercase tracking-widest font-semibold text-[#8C6A43] bg-[#F6F1EA] px-3 py-1 rounded-[4px] border border-[#D8C8B4]/80">
                    {offer.badge}
                  </span>
                  <span className="text-xs font-semibold text-[#1D1612] bg-[#D9B98F] px-3 py-1 rounded-[4px] flex items-center gap-1">
                    <Percent className="w-3 h-3" />
                    {offer.discountTag}
                  </span>
                </div>

                <div className="relative aspect-[16/9] rounded-[8px] overflow-hidden mb-6 bg-[#1D1612]/5 border border-[#D8C8B4]/40">
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[10px] text-white font-medium bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-[4px]">
                    <Clock className="w-3 h-3 text-[#D9B98F]" />
                    <span>{offer.validTill}</span>
                  </div>
                </div>

                <span className="text-xs text-[#8C6A43] uppercase tracking-widest font-medium block mb-1">
                  {offer.subtitle}
                </span>
                <h3 className="font-serif text-2xl font-light text-[#1D1612] leading-snug mb-3 group-hover:text-[#8C6A43] transition-colors">
                  {offer.title}
                </h3>
                <p className="text-xs text-[#6C6B6B] font-light leading-relaxed mb-6">
                  {offer.description}
                </p>

                <ul className="space-y-2 mb-8 pt-4 border-t border-[#ECE3D6]">
                  {offer.highlights?.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#2A211B] font-light">
                      <Check className="w-3.5 h-3.5 text-[#8C6A43] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 border-t border-[#D8C8B4] space-y-4">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-[#6C6B6B] line-through mr-2 font-light">
                      {offer.originalPrice}
                    </span>
                    <span className="font-serif text-3xl font-normal text-[#1D1612]">
                      {offer.offerPrice}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleCopyCode(offer.code, e)}
                    className="text-[11px] font-mono uppercase bg-[#F6F1EA] hover:bg-[#EFE6DA] text-[#2A211B] px-3 py-1.5 rounded-[4px] border border-[#D8C8B4] flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Click to copy promo code"
                  >
                    <Tag className="w-3 h-3 text-[#8C6A43]" />
                    <span>{offer.code}</span>
                    {copiedCode === offer.code ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-[#6C6B6B]" />
                    )}
                  </button>
                </div>

                <button
                  onClick={() => onClaimOffer(offer)}
                  className="w-full bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] py-3 rounded-[4px] text-xs uppercase tracking-widest font-medium transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md group/btn"
                >
                  <span>Claim Session Pass</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform text-[#D9B98F]" />
                </button>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
