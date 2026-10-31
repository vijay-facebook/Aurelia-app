import React, { useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { MenuItemConfig } from '../config/types';

interface MenuSectionProps {
  onBookItem: (item: MenuItemConfig) => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ onBookItem }) => {
  const { config } = useConfig();
  const categories = config.menu?.categories?.length > 0 ? config.menu.categories : ['hair', 'skin', 'nails-spa', 'bridal'];
  const [activeCategory, setActiveCategory] = useState<string>(categories[0]);

  if (!config.sectionsVisibility.menu) return null;

  const filteredItems = config.menu.items.filter((item) => item.category === activeCategory);

  return (
    <section id="menu" className="py-24 lg:py-32 max-w-[1440px] mx-auto px-6 lg:px-12 font-sans">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-12">
        <span className="text-[11px] font-sans tracking-[0.3em] uppercase text-[#8C6A43] font-medium block">
          {config.headings.menuEyebrow}
        </span>
        <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-[#1D1612]">
          {config.headings.menuTitle}
        </h2>
        <p className="font-sans text-xs text-[#6F5F51] font-light leading-relaxed">
          Transparent pricing, no surprises. Final prices for colour depend on length and density and are confirmed at consultation.
        </p>
      </div>

      {/* Segmented Filter Tabs */}
      <div className="flex justify-center mb-12 border-b border-[#D8C8B4]">
        <div className="flex gap-8 overflow-x-auto pb-3 text-xs font-sans uppercase tracking-[0.2em] font-medium">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`pb-3 transition-colors cursor-pointer whitespace-nowrap uppercase ${
                activeCategory === cat
                  ? 'text-[#1D1612] border-b-2 border-[#1D1612] font-semibold'
                  : 'text-[#6F5F51] hover:text-[#1D1612]'
              }`}
            >
              {cat.replace('-', ' & ')}
            </button>
          ))}
        </div>
      </div>

      {/* Dotted Leader Line Menu Items */}
      <div className="max-w-3xl mx-auto space-y-8">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onBookItem(item)}
            className="group space-y-1.5 cursor-pointer p-3 rounded-[6px] hover:bg-[#EFE6DA]/60 transition-colors"
          >
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-serif text-xl font-normal text-[#1D1612] group-hover:text-[#8C6A43] transition-colors shrink-0">
                {item.title}
              </span>
              <div className="flex-1 border-b border-dotted border-[#D8C8B4] relative -top-1" />
              <span className="font-mono text-sm font-medium text-[#1D1612] shrink-0">
                {item.price}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs font-sans text-[#6F5F51] font-light">
              <p>{item.description}</p>
              <span className="text-[11px] font-mono text-[#8C6A43] shrink-0 ml-4">
                {item.duration}
              </span>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
};
