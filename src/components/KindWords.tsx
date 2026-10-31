import React, { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export const KindWords: React.FC = () => {
  const { config } = useConfig();
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!config.sectionsVisibility.reviews) return null;

  const reviews = config.reviews?.length > 0 ? config.reviews : [];
  if (reviews.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const currentReview = reviews[currentIndex] || reviews[0];

  return (
    <section id="reviews" className="py-24 lg:py-32 max-w-[1440px] mx-auto px-6 lg:px-12 text-center font-sans">
      
      <div className="max-w-3xl mx-auto space-y-8">
        
        <span className="text-[11px] font-sans tracking-[0.3em] uppercase text-[#8C6A43] font-medium block">
          {config.headings.reviewsEyebrow}
        </span>

        {/* Decorative Quote Mark */}
        <div className="font-serif text-7xl lg:text-8xl text-[#8C6A43]/40 leading-none select-none">
          “
        </div>

        {/* Quote */}
        <p className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1D1612] leading-relaxed italic">
          "{currentReview.quote}"
        </p>

        {/* Author & Service */}
        <div className="space-y-1 font-sans text-xs tracking-[0.2em] uppercase font-medium text-[#1D1612]">
          <div>{currentReview.author} · <span className="text-[#8C6A43]">{currentReview.service}</span></div>
          <div className="text-[11px] text-[#6F5F51] font-light">{currentReview.location}</div>
        </div>

        {/* Carousel Navigation */}
        <div className="flex items-center justify-center gap-6 pt-6">
          <button
            onClick={handlePrev}
            className="p-2.5 rounded-full border border-[#D8C8B4] text-[#1D1612] hover:bg-[#1D1612] hover:text-[#F6F1EA] transition-colors cursor-pointer"
            aria-label="Previous review"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Dots */}
          <div className="flex items-center gap-2">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx ? 'bg-[#8C6A43] w-5' : 'bg-[#D8C8B4]'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="p-2.5 rounded-full border border-[#D8C8B4] text-[#1D1612] hover:bg-[#1D1612] hover:text-[#F6F1EA] transition-colors cursor-pointer"
            aria-label="Next review"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </section>
  );
};
