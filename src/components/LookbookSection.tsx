import React, { useState } from 'react';
import { Plus, ShoppingBag, Eye, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface LookbookSectionProps {
  products: Product[];
  currencySymbol: string;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const LookbookSection: React.FC<LookbookSectionProps> = ({
  products,
  currencySymbol,
  onQuickView,
  onAddToCart,
}) => {
  const [activeHotspotId, setActiveHotspotId] = useState<string | null>('aurelia-chair');

  const hotspotProducts = products.filter((p) => p.hotspot);

  return (
    <section id="lookbook" className="py-20 bg-[#EFE6DA] border-y border-[#D8C8B4] relative overflow-hidden">
      <div className="max-w-[1680px] mx-auto px-6 lg:px-12">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-sans tracking-[0.25em] uppercase text-[#8C6A43] font-medium block mb-2">
              Spatial Composition
            </span>
            <h2 className="font-serif text-4xl lg:text-5xl font-light text-[#010000]">
              The Architectural Lookbook
            </h2>
          </div>
          <p className="font-sans text-sm text-[#6F5F51] max-w-md">
            Hover or click interactive hotspots in this sunlit architectural living space to discover product specs and style pairings.
          </p>
        </div>

        {/* Interactive Room Canvas */}
        <div className="relative rounded-[8px] border border-[#D8C8B4] overflow-hidden shadow-xl bg-[#2A211B]">
          <img
            src="/src/assets/images/room_lookbook_interior_1793383607293.jpg"
            alt="Architectural interior lookbook scene with oak furniture and brass lighting"
            className="w-full h-[520px] sm:h-[620px] lg:h-[720px] object-cover opacity-95"
            referrerPolicy="no-referrer"
          />

          {/* Hotspots */}
          {hotspotProducts.map((p) => {
            if (!p.hotspot) return null;
            const isActive = activeHotspotId === p.id;

            return (
              <div
                key={p.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
                style={{ top: p.hotspot.top, left: p.hotspot.left }}
              >
                {/* Pulsing Hotspot Marker */}
                <button
                  onClick={() => setActiveHotspotId(isActive ? null : p.id)}
                  className={`relative w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-transform ${
                    isActive ? 'scale-125 bg-[#8C6A43] text-white shadow-lg' : 'bg-[#F6F1EA] text-[#2A211B] hover:scale-110 shadow-md'
                  }`}
                  aria-label={`Hotspot for ${p.name}`}
                >
                  <Plus className={`w-4 h-4 transition-transform ${isActive ? 'rotate-45' : ''}`} />
                  <span className="absolute inset-0 rounded-full bg-[#D9B98F] animate-ping opacity-30 pointer-events-none" />
                </button>

                {/* Popover Card */}
                {isActive && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-12 w-64 bg-[#F6F1EA] rounded-[6px] border border-[#D8C8B4] p-3 shadow-2xl z-30 animate-fade-in font-sans">
                    <div className="aspect-[4/3] rounded-[4px] overflow-hidden mb-2 bg-[#EFE6DA]">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-[10px] uppercase text-[#8C6A43] font-sans font-medium tracking-wider block">
                      {p.category}
                    </span>
                    <h4 className="font-serif text-base text-[#010000] font-normal leading-snug line-clamp-1">
                      {p.name}
                    </h4>
                    <div className="font-mono text-xs font-semibold text-[#010000] my-1">
                      {currencySymbol}{p.price.toLocaleString()}
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-[#D8C8B4]">
                      <button
                        onClick={() => onQuickView(p)}
                        className="flex-1 bg-[#EFE6DA] hover:bg-[#E3D7C7] text-[#2A211B] text-[11px] py-1.5 rounded-[2px] uppercase font-medium flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                      <button
                        onClick={() => onAddToCart(p)}
                        className="flex-1 bg-[#2A211B] hover:bg-[#1D1612] text-[#F6F1EA] text-[11px] py-1.5 rounded-[2px] uppercase font-medium flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <ShoppingBag className="w-3 h-3 text-[#D9B98F]" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                )}

              </div>
            );
          })}

          {/* Bottom Canvas Info Overlay */}
          <div className="absolute bottom-6 left-6 right-6 backdrop-blur-md bg-[#2A211B]/80 text-[#F6F1EA] p-4 rounded-[6px] border border-[#D8C8B4]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-sans text-xs">
            <div>
              <span className="font-serif text-lg text-white block">Villa Aurelia Living Sanctuary</span>
              <span className="text-[#D8C8B4]">Interiors by Nexora Architectural Practice</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#D9B98F] text-[11px] uppercase tracking-wider">
                Click Hotspots to Explore 4 Tagged Artifacts
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
