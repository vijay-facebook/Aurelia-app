import React from 'react';

export const StorySection: React.FC = () => {
  return (
    <section id="about" className="bg-[#1D1612] text-[#F6F1EA] py-24 lg:py-32 border-y border-[#D8C8B4]/20 font-sans">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Column: Image */}
        <div className="lg:col-span-5">
          <div className="relative rounded-[8px] overflow-hidden border border-[#D8C8B4]/20 shadow-2xl aspect-[3/4] bg-[#2A211B]">
            <img
              src="/src/assets/images/story_stylist_1793409260598.jpg"
              alt="Hairstylist expertly styling hair in Aurelia studio"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Right Column: Story Copy & Stats */}
        <div className="lg:col-span-7 space-y-8 font-sans">
          
          <div className="space-y-4">
            <span className="text-[11px] font-sans tracking-[0.3em] uppercase text-[#D9B98F] font-medium block">
              Our Story
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-[#F6F1EA] leading-tight">
              A studio built on <br />
              <span className="italic font-light text-[#D9B98F]">quiet expertise.</span>
            </h2>
          </div>

          <div className="space-y-4 text-sm font-light text-[#E3D7C7]/80 leading-relaxed max-w-xl">
            <p>
              Aurelia began as a two-chair studio with one idea: luxury should feel personal, not performative. Today our senior artists still take the time to understand you before they pick up a brush.
            </p>
            <p>
              We work with cruelty-free, professional formulas, keep our appointments unhurried, and follow up after every colour service.
            </p>
          </div>

          {/* Founder Signature */}
          <div className="pt-2 font-serif text-xl italic text-[#D9B98F]">
            Leah D'Souza, founder
          </div>

          {/* Key Metrics Row */}
          <div className="pt-8 border-t border-[#F6F1EA]/15 grid grid-cols-3 gap-6">
            <div>
              <span className="font-serif text-3xl sm:text-4xl font-light text-[#F6F1EA] block">12</span>
              <span className="text-[10px] uppercase tracking-widest text-[#D9B98F] block mt-1">Senior Artists</span>
            </div>
            <div>
              <span className="font-serif text-3xl sm:text-4xl font-light text-[#F6F1EA] block">2014</span>
              <span className="text-[10px] uppercase tracking-widest text-[#D9B98F] block mt-1">Established</span>
            </div>
            <div>
              <span className="font-serif text-3xl sm:text-4xl font-light text-[#F6F1EA] block">100%</span>
              <span className="text-[10px] uppercase tracking-widest text-[#D9B98F] block mt-1">Cruelty-Free</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
