import React from 'react';
import { useConfig } from '../context/ConfigContext';

export const StorySection: React.FC = () => {
  const { config } = useConfig();
  if (!config.sectionsVisibility.story) return null;

  return (
    <section id="about" className="bg-[#1D1612] text-[#F6F1EA] py-24 lg:py-32 border-y border-[#D8C8B4]/20 font-sans">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Column: Image */}
        <div className="lg:col-span-5">
          <div className="relative rounded-[8px] overflow-hidden border border-[#D8C8B4]/20 shadow-2xl aspect-[3/4] bg-[#2A211B]">
            <img
              src={config.story.storyImage}
              alt="Studio story"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* Right Column: Story Copy & Stats */}
        <div className="lg:col-span-7 space-y-8 font-sans">
          
          <div className="space-y-4">
            <span className="text-[11px] font-sans tracking-[0.3em] uppercase text-[#D9B98F] font-medium block">
              {config.story.eyebrow}
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-[#F6F1EA] leading-tight">
              {config.story.headingPrefix} <br />
              <span className="italic font-light text-[#D9B98F]">{config.story.headingItalic}</span>
            </h2>
          </div>

          <div className="space-y-4 text-sm font-light text-[#E3D7C7]/80 leading-relaxed max-w-xl">
            {config.story.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {/* Founder Signature */}
          <div className="pt-2 font-serif text-xl italic text-[#D9B98F]">
            {config.story.founderName}, {config.story.founderTitle}
          </div>

          {/* Key Metrics Row */}
          <div className="pt-8 border-t border-[#F6F1EA]/15 grid grid-cols-3 gap-6">
            {config.story.stats.map((stat, idx) => (
              <div key={idx}>
                <span className="font-serif text-3xl sm:text-4xl font-light text-[#F6F1EA] block">{stat.value}</span>
                <span className="text-[10px] uppercase tracking-widest text-[#D9B98F] block mt-1">{stat.label}</span>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
