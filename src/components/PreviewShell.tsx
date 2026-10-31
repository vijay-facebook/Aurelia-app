import React, { useEffect, useState } from 'react';
import { useConfig } from '../context/ConfigContext';
import { Hero } from './Hero';
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

export const PreviewShell: React.FC = () => {
  const { config: liveConfig } = useConfig();
  const [draftConfig, setDraftConfig] = useState(liveConfig);
  const [mode, setMode] = useState<'focus' | 'full'>('focus');
  const [focusedSection, setFocusedSection] = useState<string>('hero');

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'CONFIG_UPDATE') {
        setDraftConfig(event.data.config);
      } else if (event.data.type === 'SET_MODE') {
        setMode(event.data.mode);
      } else if (event.data.type === 'FOCUS_SECTION') {
        setFocusedSection(event.data.sectionId);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const renderSection = (id: string) => {
    switch (id) {
      case 'hero': return <Hero onOpenBooking={() => {}} onExploreServices={() => {}} />;
      case 'services': return <ServicesGrid onSelectService={() => {}} />;
      case 'about': return <StorySection />;
      case 'team': return <StaffSection onBookWithStylist={() => {}} />;
      case 'menu': return <MenuSection onBookItem={() => {}} />;
      case 'gallery': return <GallerySection />;
      case 'videos': return <VideoGallery onBookService={() => {}} />;
      case 'offers': return <OffersSection onClaimOffer={() => {}} onShowToast={() => {}} />;
      case 'home-services': return <HomeServicesSection onBookHomeService={() => {}} onShowToast={() => {}} />;
      case 'reviews': return <KindWords />;
      case 'social': return <SocialMediaSection onShowToast={() => {}} />;
      case 'booking': return <BookingSection />;
      default: return null;
    }
  };

  return (
    <div className="bg-[#F6F1EA] text-[#1D1612] font-sans min-h-screen">
      {mode === 'full' ? (
        <div className="space-y-0">
          <Header onOpenBooking={() => {}} onNavigate={() => {}} activeSection="" />
          <div className="space-y-12 py-12">
            {draftConfig.navigation.filter(n => n.show).map(n => (
              <div key={n.id} id={n.id} data-cms-section={n.id}>
                {renderSection(n.id)}
              </div>
            ))}
          </div>
          <Footer />
        </div>
      ) : (
        <div className="p-12 flex items-center justify-center min-h-screen">
          <div data-cms-section={focusedSection}>
            {renderSection(focusedSection)}
          </div>
        </div>
      )}
    </div>
  );
};
