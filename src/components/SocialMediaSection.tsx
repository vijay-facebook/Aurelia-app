import React from 'react';
import { Instagram, Youtube, Share2, Heart, MessageCircle, ExternalLink, ArrowUpRight, MessageSquareCode, Facebook, Music, Send } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';

interface SocialMediaSectionProps {
  onShowToast: (message: string) => void;
}

export const SocialMediaSection: React.FC<SocialMediaSectionProps> = ({ onShowToast }) => {
  const { config } = useConfig();
  if (!config.sectionsVisibility.social) return null;

  const links = config.social.links;
  const channels = [
    { name: 'Instagram', handle: links.instagram ? 'Instagram Feed' : '', icon: Instagram, url: links.instagram, active: Boolean(links.instagram) },
    { name: 'YouTube', handle: 'Video Channel', icon: Youtube, url: links.youtube, active: Boolean(links.youtube) },
    { name: 'Pinterest', handle: 'Inspiration Board', icon: Share2, url: links.pinterest, active: Boolean(links.pinterest) },
    { name: 'WhatsApp', handle: config.businessInfo.phone, icon: MessageSquareCode, url: links.whatsapp || `https://wa.me/${config.businessInfo.whatsappNumber}`, active: Boolean(config.businessInfo.whatsappNumber || links.whatsapp) },
    { name: 'Facebook', handle: 'Community Page', icon: Facebook, url: links.facebook, active: Boolean(links.facebook) },
    { name: 'TikTok', handle: 'Short Reels', icon: Music, url: links.tiktok, active: Boolean(links.tiktok) },
    { name: 'Telegram', handle: 'Updates Channel', icon: Send, url: links.telegram, active: Boolean(links.telegram) },
  ].filter(c => c.active);

  const handleShareStudio = () => {
    if (navigator.share) {
      navigator.share({
        title: config.brand.name,
        text: config.social.shareText || config.brand.tagline,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      onShowToast('Studio link copied to clipboard!');
    }
  };

  return (
    <section id="social" className="py-24 lg:py-32 bg-[#1D1612] text-[#F6F1EA] font-sans relative overflow-hidden border-t border-[#3A2F27]">
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-[#D9B98F]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-[0.3em] text-[#D9B98F] font-medium block mb-3">
              · Community & Feed ·
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-[#F6F1EA] tracking-tight leading-[1.05]">
              {config.social.sectionHeading || 'Follow Our Daily Craftsmanship'}
            </h2>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {links.instagram && (
              <a
                href={links.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#D9B98F] hover:bg-[#AE9472] text-[#1D1612] px-6 py-3 rounded-[4px] text-xs font-sans uppercase tracking-widest font-semibold transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Instagram className="w-4 h-4" />
                <span>Follow Instagram</span>
              </a>
            )}

            <button
              onClick={handleShareStudio}
              className="bg-[#261E19] hover:bg-[#3A2F27] text-[#F6F1EA] px-4 py-3 rounded-[4px] text-xs font-sans uppercase tracking-widest font-medium border border-[#3A2F27] transition-all flex items-center gap-2 cursor-pointer"
              title="Share Studio"
            >
              <Share2 className="w-4 h-4 text-[#D9B98F]" />
              <span className="hidden sm:inline">Share Studio</span>
            </button>
          </div>
        </div>

        {/* Social Handles Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {channels.map((channel, idx) => {
            const Icon = channel.icon;
            return (
              <a
                key={idx}
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#261E19] border border-[#3A2F27] hover:border-[#D9B98F]/60 p-5 rounded-[8px] flex items-center justify-between group transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#15100D] border border-[#3A2F27] flex items-center justify-center text-[#D9B98F] group-hover:bg-[#D9B98F] group-hover:text-[#1D1612] transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-[#F6F1EA] group-hover:text-[#D9B98F] transition-colors">
                      {channel.name}
                    </h3>
                    <p className="text-[11px] text-[#D8C8B4]/60 font-light">
                      {channel.handle}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <ArrowUpRight className="w-4 h-4 text-[#D8C8B4]/40 group-hover:text-[#D9B98F] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform inline-block" />
                </div>
              </a>
            );
          })}
        </div>

        {/* Feed Posts */}
        {config.social.posts?.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {config.social.posts.map((post) => (
              <a
                key={post.id}
                href={post.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative bg-[#261E19] rounded-[8px] overflow-hidden border border-[#3A2F27] hover:border-[#D9B98F]/50 transition-all duration-300 hover:-translate-y-1 block"
              >
                <div className="relative aspect-square overflow-hidden bg-[#15100D]">
                  <img
                    src={post.image}
                    alt={post.caption}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-[#1D1612]/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-between backdrop-blur-xs">
                    
                    <div className="flex items-center justify-between text-xs text-[#D9B98F] font-medium">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4 fill-current" />
                          {post.likes}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {post.comments}
                        </span>
                      </div>
                      <Instagram className="w-4 h-4" />
                    </div>

                    <div>
                      <p className="text-xs text-[#F6F1EA] font-light leading-relaxed line-clamp-3 mb-2">
                        {post.caption}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {post.tags?.map((tag, i) => (
                          <span key={i} className="text-[10px] text-[#D9B98F]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#3A2F27] flex items-center justify-between text-[11px] text-[#D8C8B4] font-medium uppercase tracking-wider">
                      <span>View Post</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#D9B98F]" />
                    </div>

                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
