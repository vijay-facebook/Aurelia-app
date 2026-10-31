import React from 'react';
import { ArrowUpRight, BookOpen } from 'lucide-react';
import { JOURNAL_ARTICLES } from '../data/products';

export const CraftsmanshipJournal: React.FC = () => {
  return (
    <section id="journal" className="py-20 max-w-[1680px] mx-auto px-6 lg:px-12 border-t border-[#D8C8B4]">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div>
          <span className="text-xs font-sans tracking-[0.25em] uppercase text-[#8C6A43] font-medium block mb-2">
            Editorial & Material Philosophy
          </span>
          <h2 className="font-serif text-4xl lg:text-5xl font-light text-[#010000]">
            The Craftsmanship Journal
          </h2>
        </div>
        <p className="font-sans text-sm text-[#6F5F51] max-w-md">
          In-depth material studies exploring quarry geologies, sand-cast bronze patination, and the wabi-sabi philosophy of living space.
        </p>
      </div>

      {/* Grid of Articles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {JOURNAL_ARTICLES.map((article) => (
          <article
            key={article.id}
            className="group bg-[#EFE6DA] rounded-[6px] border border-[#D8C8B4] overflow-hidden flex flex-col justify-between transition-all hover:-translate-y-1 hover:shadow-md cursor-pointer"
          >
            <div className="aspect-[16/10] bg-[#E3D7C7] overflow-hidden relative">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <span className="absolute top-3 left-3 bg-[#F6F1EA]/90 backdrop-blur-md text-[#2A211B] text-[10px] font-sans uppercase tracking-wider px-2.5 py-1 rounded-[2px] border border-[#D8C8B4]">
                {article.category}
              </span>
            </div>

            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-sans text-[#6F5F51]">
                  <span>{article.date}</span>
                  <span>·</span>
                  <span>{article.readTime}</span>
                </div>

                <h3 className="font-serif text-2xl text-[#010000] font-normal group-hover:text-[#8C6A43] transition-colors leading-snug">
                  {article.title}
                </h3>

                <p className="font-sans text-xs text-[#6F5F51] leading-relaxed line-clamp-3">
                  {article.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-[#D8C8B4]/70 flex items-center justify-between text-xs font-sans text-[#2A211B]">
                <span className="text-[11px] text-[#6F5F51]">{article.author}</span>
                <span className="flex items-center gap-1 font-medium group-hover:text-[#8C6A43]">
                  Read Essay <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
