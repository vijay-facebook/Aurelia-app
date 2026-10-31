import React, { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MarqueeTicker } from './components/MarqueeTicker';
import { ServicesGrid } from './components/ServicesGrid';
import { StorySection } from './components/StorySection';
import { StaffSection } from './components/StaffSection';
import { MenuSection } from './components/MenuSection';
import { GallerySection } from './components/GallerySection';
import { VideoGallery } from './components/VideoGallery';
import { OffersSection } from './components/OffersSection';
import { HomeServicesSection } from './components/HomeServicesSection';
import { KindWords } from './components/KindWords';
import { SocialMediaSection } from './components/SocialMediaSection';
import { WishlistSection } from './components/WishlistSection';
import { BookingSection } from './components/BookingSection';
import { BookingModal } from './components/BookingModal';
import { Footer } from './components/Footer';

import { SERVICES, ServiceCard, MenuItem, SessionOffer } from './data/aureliaData';
import { Calendar, Check } from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = useState('hero');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedServiceTitle, setSelectedServiceTitle] = useState<string | undefined>(undefined);

  // Saved Wishlist Services
  const [wishlistServices, setWishlistServices] = useState<ServiceCard[]>([
    SERVICES[1], // Hair Colour
    SERVICES[2], // Skin Care
  ]);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleNavigate = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenBookingWithService = (serviceName: string) => {
    setSelectedServiceTitle(serviceName);
    setIsBookingModalOpen(true);
  };

  const handleClaimOffer = (offer: SessionOffer) => {
    const fullOfferTitle = `${offer.title} (${offer.offerPrice} - Code: ${offer.code})`;
    setSelectedServiceTitle(fullOfferTitle);
    setIsBookingModalOpen(true);
    showToast(`Claimed Offer: ${offer.code}`);
  };

  const handleRemoveFromWishlist = (service: ServiceCard) => {
    setWishlistServices((prev) => prev.filter((s) => s.id !== service.id));
    showToast(`Removed ${service.title} from Wishlist`);
  };

  const handleClearWishlist = () => {
    setWishlistServices([]);
    showToast('Wishlist cleared');
  };

  return (
    <div className="min-h-screen bg-[#F6F1EA] text-[#1D1612] font-sans selection:bg-[#D9B98F] selection:text-[#1D1612] flex flex-col justify-between antialiased">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#1D1612] text-[#F6F1EA] text-xs font-sans px-5 py-3 rounded-[4px] border border-[#D8C8B4] shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-[#D9B98F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Primary Header */}
      <Header
        onOpenBooking={() => {
          setSelectedServiceTitle(undefined);
          setIsBookingModalOpen(true);
        }}
        onNavigate={handleNavigate}
        activeSection={activeSection}
      />

      {/* Main Page Body */}
      <main className="flex-1">
        {/* Hero Section */}
        <Hero
          onOpenBooking={() => {
            setSelectedServiceTitle(undefined);
            setIsBookingModalOpen(true);
          }}
          onExploreServices={() => handleNavigate('services')}
        />

        {/* Marquee Ticker */}
        <MarqueeTicker />

        {/* Services Grid ("Considered care, head to toe.") */}
        <ServicesGrid
          onSelectService={(service: ServiceCard) =>
            handleOpenBookingWithService(`${service.title} (${service.price})`)
          }
        />

        {/* Story Section ("A studio built on quiet expertise.") */}
        <StorySection />

        {/* Staff & Senior Artists Selection Section */}
        <StaffSection
          onBookWithStylist={(stylistName: string) =>
            handleOpenBookingWithService(`Consultation with ${stylistName}`)
          }
        />

        {/* Menu Section ("The Aurelia menu") */}
        <MenuSection
          onBookItem={(item: MenuItem) =>
            handleOpenBookingWithService(`${item.title} (${item.price})`)
          }
        />

        {/* Gallery Section ("Inside the studio") */}
        <GallerySection />

        {/* Video Gallery Section ("Stories in Motion — Before & After") */}
        <VideoGallery
          onBookService={(serviceTitle: string) =>
            handleOpenBookingWithService(serviceTitle)
          }
        />

        {/* Session Offers & Packages Section */}
        <OffersSection
          onClaimOffer={handleClaimOffer}
          onShowToast={showToast}
        />

        {/* Home Services Section ("Aurelia At-Home Salon & Spa") */}
        <HomeServicesSection
          onBookHomeService={(serviceTitle: string) =>
            handleOpenBookingWithService(serviceTitle)
          }
          onShowToast={showToast}
        />

        {/* Kind Words / Reviews */}
        <KindWords />

        {/* Social Media & Instagram Feed Section */}
        <SocialMediaSection onShowToast={showToast} />

        {/* Dedicated Wishlist Section using card-nexora styling */}
        <WishlistSection
          wishlistServices={wishlistServices}
          onRemoveFromWishlist={handleRemoveFromWishlist}
          onClearWishlist={handleClearWishlist}
          onBookService={(service: ServiceCard) =>
            handleOpenBookingWithService(`${service.title} (${service.price})`)
          }
          onExploreServices={() => handleNavigate('services')}
        />

        {/* Booking Reservation Section ("Your best look starts here.") */}
        <BookingSection preselectedService={selectedServiceTitle} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Booking Popup Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        preselectedTitle={selectedServiceTitle}
      />

      {/* Floating Appointment Badge Button */}
      <button
        onClick={() => {
          setSelectedServiceTitle(undefined);
          setIsBookingModalOpen(true);
        }}
        className="fixed bottom-6 right-6 z-40 bg-[#1D1612] text-[#F6F1EA] hover:bg-[#8C6A43] p-4 rounded-full shadow-2xl transition-all cursor-pointer flex items-center gap-2 group"
        title="Book Appointment at Aurelia Studio"
      >
        <Calendar className="w-5 h-5 text-[#D9B98F]" />
        <span className="text-xs uppercase tracking-widest font-medium hidden sm:inline">
          Book Appointment
        </span>
      </button>

    </div>
  );
}
