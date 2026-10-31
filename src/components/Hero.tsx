import React from 'react';
import { ArrowRight, Star, Clock } from 'lucide-react';

interface HeroProps {
  onOpenBooking: () => void;
  onExploreServices: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBooking, onExploreServices }) => {
  return (
    <section id="hero" className="relative bg-[#F6F1EA] overflow-hidden pt-12 pb-20 border-b border-[#D8C8B4]/60">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Copy & CTAs */}
        <div className="lg:col-span-6 space-y-8 z-10">
          
          <div className="space-y-4">
            <span className="text-[11px] font-sans tracking-[0.3em] uppercase text-[#8C6A43] font-medium block">
              Luxury Beauty & Wellness Studio · Mumbai
            </span>
            <h1 className="font-serif text-6xl sm:text-7xl lg:text-8xl font-light leading-[0.98] text-[#1D1612] tracking-tight">
              Beauty, <br />
              <span className="italic font-light text-[#8C6A43]">Refined.</span>
            </h1>
          </div>

          <p className="font-sans text-sm sm:text-base text-[#6F5F51] font-light leading-relaxed max-w-lg">
            Where modern beauty meets timeless elegance. Hair, skin and spa rituals by senior artists, in a studio designed for slowing down.
          </p>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <button
              onClick={onOpenBooking}
              className="bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] px-8 py-4 rounded-full text-xs font-sans uppercase tracking-widest font-medium transition-all flex items-center gap-3 shadow-md group cursor-pointer"
            >
              <span>Book Appointment</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-[#D9B98F]" />
            </button>

            <button
              onClick={onExploreServices}
              className="text-xs font-sans uppercase tracking-widest text-[#1D1612] hover:text-[#8C6A43] font-medium flex items-center gap-2 transition-colors cursor-pointer group"
            >
              <span>Explore Services</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Rating & Operating Hours Bar */}
          <div className="pt-8 border-t border-[#D8C8B4]/60 flex flex-wrap items-center gap-6 text-xs font-sans text-[#6F5F51]">
            <div className="flex items-center gap-2">
              <div className="flex text-[#8C6A43]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                ))}
              </div>
              <span className="font-mono font-medium text-[#1D1612]">4.9</span>
              <span>from 860 reviews</span>
            </div>

            <span className="hidden sm:inline text-[#D8C8B4]">·</span>

            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#8C6A43]" />
              <span>Tue–Sun, 10am–8pm</span>
            </div>
          </div>

        </div>

        {/* Right Column: Architectural Arch Image with Badges */}
        <div className="lg:col-span-6 relative flex justify-center">
          
          <div className="relative max-w-md lg:max-w-lg w-full">
            
            {/* Rotating Circular Text Badge */}
            <div className="absolute -top-6 -right-6 z-20 w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-[#D8C8B4] bg-[#F6F1EA]/90 backdrop-blur-md flex items-center justify-center p-2 shadow-lg">
              <svg className="w-full h-full animate-spin-slow" viewBox="0 0 100 100">
                <path
                  id="circlePath"
                  d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
                  fill="none"
                />
                <text className="text-[9px] font-sans uppercase tracking-[0.2em] fill-[#1D1612]">
                  <textPath href="#circlePath">
                    AURELIA STUDIO · MUMBAI · AURELIA STUDIO ·
                  </textPath>
                </text>
              </svg>
            </div>

            {/* Arch-shaped Container */}
            <div className="relative rounded-t-full overflow-hidden border-2 border-[#D8C8B4] bg-[#EFE6DA] shadow-2xl aspect-[3/4]">
              <img
                src="/src/assets/images/hero_aurelia_arch_1793409239063.jpg"
                alt="Aurelia Beauty Salon Interior Arch"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Floating Availability Pill Badge */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] bg-[#F6F1EA]/95 backdrop-blur-md p-3.5 rounded-[8px] border border-[#D8C8B4] shadow-xl flex items-center justify-between text-xs font-sans">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#8C6A43] font-medium block">Next Available</span>
                <span className="font-serif text-sm font-medium text-[#1D1612]">Today, 4:30 pm</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#6F5F51] block">Signature Blowout</span>
                <span className="text-[10px] text-[#8C6A43] font-medium">with Leah</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
