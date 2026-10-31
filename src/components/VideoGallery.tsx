import React, { useState } from 'react';
import { Play, X, Eye, Clock, Sparkles, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { VIDEO_ITEMS, VideoItem } from '../data/aureliaData';

interface VideoGalleryProps {
  onBookService?: (serviceTitle: string) => void;
}

export const VideoGallery: React.FC<VideoGalleryProps> = ({ onBookService }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const categories = [
    { id: 'all', label: 'All Stories' },
    { id: 'hair', label: 'Hair Transformations' },
    { id: 'skin', label: 'Skin Rituals' },
    { id: 'bridal', label: 'Bridal Masterclass' },
    { id: 'bts', label: 'Studio BTS' },
  ];

  const filteredVideos =
    selectedCategory === 'all'
      ? VIDEO_ITEMS
      : VIDEO_ITEMS.filter((video) => video.category === selectedCategory);

  return (
    <section id="videos" className="py-24 lg:py-32 bg-[#1D1612] text-[#F6F1EA] font-sans relative overflow-hidden border-t border-b border-[#32261E]">
      {/* Decorative background subtle glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#D9B98F]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.3em] text-[#D9B98F] font-medium block mb-4">
              · Aurelia Motion & Transformations ·
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-[#F6F1EA] tracking-tight leading-[1.05]">
              Stories in Motion — Before & After
            </h2>
          </div>
          <p className="text-sm lg:text-base text-[#D8C8B4]/80 font-light max-w-md leading-relaxed">
            Experience our artisanal hair artistry, soothing facial sculpting, and quiet studio atmosphere captured in cinematic detail.
          </p>
        </div>

        {/* Filter Tabs - 0-pill discipline (clean border-b links) */}
        <div className="flex items-center gap-6 sm:gap-10 border-b border-[#32261E] pb-4 mb-12 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`text-xs uppercase tracking-[0.2em] font-medium transition-all whitespace-nowrap pb-2 relative cursor-pointer ${
                selectedCategory === cat.id
                  ? 'text-[#D9B98F]'
                  : 'text-[#D8C8B4]/60 hover:text-[#F6F1EA]'
              }`}
            >
              {cat.label}
              {selectedCategory === cat.id && (
                <span className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-[#D9B98F]" />
              )}
            </button>
          ))}
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredVideos.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveVideo(item)}
              className="group cursor-pointer flex flex-col bg-[#261E19] border border-[#3A2F27] hover:border-[#D9B98F]/50 rounded-[6px] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
            >
              {/* Thumbnail Wrapper */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#15100D]">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#1D1612]/90 via-[#1D1612]/20 to-transparent" />

                {/* Duration & Views Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2 text-[10px] uppercase tracking-wider font-medium text-[#F6F1EA] bg-[#1D1612]/80 backdrop-blur-md px-2.5 py-1 rounded-[4px] border border-[#D8C8B4]/20">
                  <Clock className="w-3 h-3 text-[#D9B98F]" />
                  <span>{item.duration}</span>
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-medium text-[#D8C8B4] bg-[#1D1612]/80 backdrop-blur-md px-2.5 py-1 rounded-[4px] border border-[#D8C8B4]/20">
                  <Eye className="w-3 h-3 text-[#D9B98F]" />
                  <span>{item.views}</span>
                </div>

                {/* Play Icon Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-[#D9B98F] text-[#1D1612] flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                    <Play className="w-6 h-6 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Category tag */}
                <div className="absolute bottom-3 left-3 text-[11px] uppercase tracking-widest text-[#D9B98F] font-medium">
                  · {item.categoryLabel}
                </div>
              </div>

              {/* Video Info Content */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-xl font-light text-[#F6F1EA] group-hover:text-[#D9B98F] transition-colors leading-snug mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#D8C8B4]/70 font-light line-clamp-2 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#3A2F27] flex items-center justify-between text-xs text-[#D8C8B4]/80">
                  <span className="font-light italic">Artistry by {item.stylist}</span>
                  <span className="text-[#D9B98F] uppercase tracking-widest text-[10px] font-medium group-hover:underline">
                    Watch Reel →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal Player */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 lg:p-10 animate-fade-in">
          <div className="relative w-full max-w-4xl bg-[#1D1612] border border-[#D8C8B4]/30 rounded-[8px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-6 border-b border-[#3A2F27] flex items-center justify-between bg-[#15100D]">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#D9B98F] font-medium block">
                  · {activeVideo.categoryLabel} · Artistry by {activeVideo.stylist}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl text-[#F6F1EA] font-light mt-0.5">
                  {activeVideo.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="w-10 h-10 rounded-full bg-[#261E19] hover:bg-[#3A2F27] text-[#F6F1EA] flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Container */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              <video
                src={activeVideo.videoUrl}
                poster={activeVideo.thumbnail}
                controls
                autoPlay
                muted={isMuted}
                className="w-full h-full object-contain"
              >
                Your browser does not support video playback.
              </video>
            </div>

            {/* Modal Footer & Actions */}
            <div className="p-4 sm:p-6 bg-[#15100D] border-t border-[#3A2F27] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-[#D8C8B4]/80 font-light max-w-xl">
                {activeVideo.description}
              </p>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="px-3 py-2 bg-[#261E19] hover:bg-[#3A2F27] text-[#F6F1EA] rounded-[4px] text-xs flex items-center gap-2 border border-[#3A2F27] transition-colors cursor-pointer"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-[#D9B98F]" /> : <Volume2 className="w-4 h-4 text-[#D9B98F]" />}
                  <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                </button>

                {onBookService && (
                  <button
                    onClick={() => {
                      const serviceTitle = activeVideo.title;
                      setActiveVideo(null);
                      onBookService(serviceTitle);
                    }}
                    className="bg-[#D9B98F] hover:bg-[#AE9472] text-[#1D1612] px-5 py-2.5 rounded-[4px] text-xs uppercase tracking-widest font-medium transition-all flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Book This Service</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </section>
  );
};
