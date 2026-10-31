import React from 'react';
import { GALLERY_IMAGES } from '../data/aureliaData';
import { Instagram } from 'lucide-react';

export const GallerySection: React.FC = () => {
  return (
    <section id="gallery" className="py-24 lg:py-32 bg-[#EFE6DA] border-y border-[#D8C8B4] font-sans">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-[11px] font-sans tracking-[0.3em] uppercase text-[#8C6A43] font-medium block mb-2">
              Gallery
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-[#1D1612]">
              Inside <span className="italic text-[#8C6A43]">the studio</span>
            </h2>
          </div>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-sans uppercase tracking-widest text-[#1D1612] hover:text-[#8C6A43] transition-colors"
          >
            <Instagram className="w-4 h-4 text-[#8C6A43]" />
            <span>@AURELIA.STUDIO</span>
          </a>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {GALLERY_IMAGES.map((item) => (
            <div
              key={item.id}
              className={`relative rounded-[8px] overflow-hidden border border-[#D8C8B4] group aspect-[4/3] bg-[#E3D7C7] ${item.span}`}
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1D1612]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                <span className="font-serif text-xl text-[#F6F1EA] italic">
                  {item.title}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
