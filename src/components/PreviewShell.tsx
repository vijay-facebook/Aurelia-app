import React, { useEffect, useRef, useState } from 'react';
import { ConfigContext, useConfig } from '../context/ConfigContext';
import { SiteConfig } from '../config/types';
import { Hero } from './Hero';
import { MarqueeTicker } from './MarqueeTicker';
import { ServicesGrid } from './ServicesGrid';
import { StorySection } from './StorySection';
import { StaffSection } from './StaffSection';
import { MenuSection } from './MenuSection';
import { GallerySection } from './GallerySection';
import { VideoGallery } from './VideoGallery';
import { OffersSection } from './OffersSection';
import { HomeServicesSection } from './HomeServicesSection';
import { KindWords } from './KindWords';
import { SocialMediaSection } from './SocialMediaSection';
import { BookingSection } from './BookingSection';
import { Header } from './Header';
import { Footer } from './Footer';

const noop = () => {};

/**
 * The page shown inside the admin's live-preview frame.
 *
 * It renders the SAME sections, in the SAME order, as the public website, but with the admin's
 * unsaved draft as the configuration - so every keystroke in the editor appears here instantly.
 */
export const PreviewShell: React.FC = () => {
  const base = useConfig();
  const [draft, setDraft] = useState<SiteConfig | null>(null);
  const highlightTimer = useRef<number | undefined>(undefined);

  // Until the editor sends its draft we show the saved site.
  const config = draft ?? base.config;

  useEffect(() => {
    const scrollToTarget = (target: string) => {
      const el =
        target === 'top'
          ? null
          : target === 'footer'
            ? document.querySelector('footer')
            : document.getElementById(target);

      if (!el) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Brief outline so the editor can see which part they are editing.
      document.querySelectorAll('[data-preview-focus]').forEach((n) => {
        (n as HTMLElement).style.outline = '';
        n.removeAttribute('data-preview-focus');
      });
      (el as HTMLElement).setAttribute('data-preview-focus', '1');
      (el as HTMLElement).style.outline = '3px solid #D9B98F';
      (el as HTMLElement).style.outlineOffset = '-3px';
      window.clearTimeout(highlightTimer.current);
      highlightTimer.current = window.setTimeout(() => {
        (el as HTMLElement).style.outline = '';
        el.removeAttribute('data-preview-focus');
      }, 1600);
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data;
      if (!data || typeof data !== 'object') return;
      if (data.type === 'CONFIG_UPDATE' && data.config) {
        setDraft(data.config as SiteConfig);
      } else if (data.type === 'SCROLL_TO' && typeof data.target === 'string') {
        scrollToTarget(data.target);
      }
    };

    window.addEventListener('message', handleMessage);
    // Tell the editor we are ready, so it sends the current draft (avoids a load-order race).
    window.parent?.postMessage({ type: 'PREVIEW_READY' }, window.location.origin);
    return () => {
      window.removeEventListener('message', handleMessage);
      window.clearTimeout(highlightTimer.current);
    };
  }, []);

  // Links inside the preview must not navigate the frame away.
  const blockNavigation = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a[href]')) e.preventDefault();
  };

  return (
    <ConfigContext.Provider value={{ ...base, config }}>
      <div
        onClickCapture={blockNavigation}
        className="min-h-screen bg-[#F6F1EA] text-[#1D1612] font-sans antialiased flex flex-col justify-between"
      >
        <Header onOpenBooking={noop} onNavigate={noop} activeSection="" />

        <main className="flex-1">
          <Hero onOpenBooking={noop} onExploreServices={noop} />
          <MarqueeTicker />
          <ServicesGrid onSelectService={noop} />
          <StorySection />
          <StaffSection onBookWithStylist={noop} />
          <MenuSection onBookItem={noop} />
          <GallerySection />
          <VideoGallery onBookService={noop} />
          <OffersSection onClaimOffer={noop} onShowToast={noop} />
          <HomeServicesSection onBookHomeService={noop} onShowToast={noop} />
          <KindWords />
          <SocialMediaSection onShowToast={noop} />
          <BookingSection />
        </main>

        <Footer />
      </div>
    </ConfigContext.Provider>
  );
};
