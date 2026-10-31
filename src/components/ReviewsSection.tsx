import React from 'react';
import { Star, CheckCircle2, Quote } from 'lucide-react';
import { REVIEWS } from '../data/products';

export const ReviewsSection: React.FC = () => {
  return (
    <section className="py-20 bg-[#EFE6DA] border-t border-[#D8C8B4]">
      <div className="max-w-[1680px] mx-auto px-6 lg:px-12">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-sans tracking-[0.25em] uppercase text-[#8C6A43] font-medium block">
            Verified Patron Testimonials
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-light text-[#010000]">
            Trusted in Architectural Residences Worldwide
          </h2>
          <div className="flex items-center justify-center gap-1 text-[#8C6A43] pt-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
            <span className="font-mono text-xs font-medium text-[#010000] ml-2">4.9 / 5.0 Average Satisfaction</span>
          </div>
        </div>

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#F6F1EA] p-8 rounded-[6px] border border-[#D8C8B4] flex flex-col justify-between space-y-6 relative shadow-sm"
            >
              <Quote className="w-8 h-8 text-[#D8C8B4] absolute top-6 right-6" />

              <div className="space-y-4">
                <div className="flex items-center gap-1 text-[#8C6A43]">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>

                <p className="font-sans text-xs text-[#2A211B] leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-4 border-t border-[#D8C8B4] space-y-1">
                <div className="flex items-center justify-between text-xs font-sans">
                  <span className="font-serif text-base text-[#010000] font-medium">{rev.author}</span>
                  <span className="flex items-center gap-1 text-[10px] text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded-[2px]">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified Owner
                  </span>
                </div>
                <div className="flex justify-between text-[11px] font-sans text-[#6F5F51]">
                  <span>{rev.location}</span>
                  <span>{rev.productName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
