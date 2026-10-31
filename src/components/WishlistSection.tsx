import React from 'react';
import { Heart, Trash2, Calendar, ArrowRight, Sparkles, Check } from 'lucide-react';
import { ServiceCard } from '../data/aureliaData';

interface WishlistSectionProps {
  wishlistServices: ServiceCard[];
  onRemoveFromWishlist: (service: ServiceCard) => void;
  onClearWishlist: () => void;
  onBookService: (service: ServiceCard) => void;
  onExploreServices: () => void;
}

export const WishlistSection: React.FC<WishlistSectionProps> = ({
  wishlistServices,
  onRemoveFromWishlist,
  onClearWishlist,
  onBookService,
  onExploreServices,
}) => {
  return (
    <section id="wishlist" className="py-24 lg:py-32 max-w-[1440px] mx-auto px-6 lg:px-12 border-t border-[#D8C8B4]/60 font-sans">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-[11px] font-sans tracking-[0.3em] uppercase text-[#8C6A43] font-medium block mb-2">
            Saved Rituals & Artifacts
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-[#1D1612]">
            Your <span className="italic text-[#8C6A43]">Saved</span> Selection
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {wishlistServices.length > 0 && (
            <button
              onClick={onClearWishlist}
              className="text-xs font-sans uppercase tracking-wider text-[#6F5F51] hover:text-red-700 underline transition-colors cursor-pointer"
            >
              Clear Entire List
            </button>
          )}
        </div>
      </div>

      {/* Grid of Wishlist Cards using card-nexora style */}
      {wishlistServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {wishlistServices.map((service) => (
            <div
              key={service.id}
              className="card-nexora flex flex-col justify-between space-y-6 shadow-sm hover:shadow-md transition-all group"
            >
              {/* Top Image Container */}
              <div className="relative aspect-[4/3] rounded-[8px] overflow-hidden bg-[#E3D7C7]">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />

                {/* Heart Saved Indicator */}
                <div className="absolute top-3 right-3 p-2 rounded-full bg-[#8C6A43] text-white shadow-sm">
                  <Heart className="w-4 h-4 fill-current" />
                </div>
              </div>

              {/* Info Body */}
              <div className="space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-sans text-[#8C6A43] font-medium uppercase tracking-wider">
                    <span>{service.category}</span>
                    <span className="font-mono text-[#1D1612] font-semibold">{service.price}</span>
                  </div>

                  <h3 className="font-serif text-2xl font-light text-[#1D1612] group-hover:text-[#8C6A43] transition-colors">
                    {service.title}
                  </h3>

                  <p className="font-sans text-xs text-[#6F5F51] font-light leading-relaxed">
                    {service.subtitle}
                  </p>
                </div>

                {/* Card Controls */}
                <div className="pt-4 border-t border-[#D8C8B4]/60 flex items-center justify-between gap-3">
                  <button
                    onClick={() => onBookService(service)}
                    className="btn-primary flex-1 text-xs font-sans uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#1D1612]" />
                    <span>Book Service</span>
                  </button>

                  <button
                    onClick={() => onRemoveFromWishlist(service)}
                    className="p-2.5 rounded-[4px] border border-[#D8C8B4] text-[#6F5F51] hover:text-red-700 hover:border-red-300 transition-colors cursor-pointer"
                    title="Remove from wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="card-nexora text-center py-16 px-6 space-y-4 max-w-2xl mx-auto">
          <div className="w-14 h-14 bg-[#EFE6DA] text-[#8C6A43] rounded-full flex items-center justify-center mx-auto shadow-inner">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-3xl font-light text-[#1D1612]">
            No Saved Rituals Yet
          </h3>
          <p className="font-sans text-xs text-[#6F5F51] font-light max-w-md mx-auto leading-relaxed">
            Browse our hair, skin, and spa rituals and click the heart icon on any service to save it to your personal wishlist.
          </p>
          <button
            onClick={onExploreServices}
            className="btn-primary inline-flex items-center gap-2 text-xs uppercase tracking-widest cursor-pointer mt-2"
          >
            <span>Explore Studio Services</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </section>
  );
};
