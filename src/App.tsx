import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { ConfigProvider } from './context/ConfigContext';
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

import { ServiceItemConfig, MenuItemConfig, OfferItemConfig } from './config/types';
import { Calendar, Check, Shield } from 'lucide-react';
import { AdminLogin } from './admin/AdminLogin';
import { AdminDashboard } from './admin/AdminDashboard';
import { PreviewShell } from './components/PreviewShell';

function PublicWebsite() {
  const [activeSection, setActiveSection] = useState('hero');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedServiceTitle, setSelectedServiceTitle] = useState<string | undefined>(undefined);

  // Wishlist items
  const [wishlistServices, setWishlistServices] = useState<ServiceItemConfig[]>([]);

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

  const handleClaimOffer = (offer: OfferItemConfig) => {
    const fullOfferTitle = `${offer.title} (${offer.offerPrice} - Code: ${offer.code})`;
    setSelectedServiceTitle(fullOfferTitle);
    setIsBookingModalOpen(true);
    showToast(`Claimed Offer: ${offer.code}`);
  };

  const handleRemoveFromWishlist = (service: ServiceItemConfig) => {
    setWishlistServices((prev) => prev.filter((s) => s.id !== service.id));
    showToast(`Removed ${service.title} from Wishlist`);
  };

  const handleClearWishlist = () => {
    setWishlistServices([]);
    showToast('Wishlist cleared');
  };

  return (
    <div className="min-h-screen bg-[#F6F1EA] text-[#1D1612] font-sans selection:bg-[#D9B98F] selection:text-[#1D1612] flex flex-col justify-between antialiased relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#1D1612] text-[#F6F1EA] text-xs font-sans px-5 py-3 rounded-[4px] border border-[#D8C8B4] shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 text-[#D9B98F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Panel Floating Access Link */}
      <a
        href="/admin"
        className="fixed top-3 right-3 z-40 bg-[#1D1612]/80 hover:bg-[#1D1612] text-[#F6F1EA] px-3 py-1.5 rounded-full text-[10px] font-sans uppercase tracking-widest backdrop-blur-md flex items-center gap-1.5 transition-all shadow-md"
        title="Admin CMS"
      >
        <Shield className="w-3 h-3 text-[#D9B98F]" />
        <span>Admin Panel</span>
      </a>

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
        <Hero
          onOpenBooking={() => {
            setSelectedServiceTitle(undefined);
            setIsBookingModalOpen(true);
          }}
          onExploreServices={() => handleNavigate('services')}
        />

        <MarqueeTicker />

        <ServicesGrid
          onSelectService={(service: ServiceItemConfig) =>
            handleOpenBookingWithService(`${service.title} (${service.price})`)
          }
        />

        <StorySection />

        <StaffSection
          onBookWithStylist={(stylistName: string) =>
            handleOpenBookingWithService(`Consultation with ${stylistName}`)
          }
        />

        <MenuSection
          onBookItem={(item: MenuItemConfig) =>
            handleOpenBookingWithService(`${item.title} (${item.price})`)
          }
        />

        <GallerySection />

        <VideoGallery
          onBookService={(serviceTitle: string) =>
            handleOpenBookingWithService(serviceTitle)
          }
        />

        <OffersSection
          onClaimOffer={handleClaimOffer}
          onShowToast={showToast}
        />

        <HomeServicesSection
          onBookHomeService={(serviceTitle: string) =>
            handleOpenBookingWithService(serviceTitle)
          }
          onShowToast={showToast}
        />

        <KindWords />

        <SocialMediaSection onShowToast={showToast} />

        <WishlistSection
          wishlistServices={wishlistServices}
          onRemoveFromWishlist={handleRemoveFromWishlist}
          onClearWishlist={handleClearWishlist}
          onBookService={(service: ServiceItemConfig) =>
            handleOpenBookingWithService(`${service.title} (${service.price})`)
          }
          onExploreServices={() => handleNavigate('services')}
        />

        <BookingSection preselectedService={selectedServiceTitle} />
      </main>

      <Footer />

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        preselectedTitle={selectedServiceTitle}
      />

      <button
        onClick={() => {
          setSelectedServiceTitle(undefined);
          setIsBookingModalOpen(true);
        }}
        className="fixed bottom-6 right-6 z-40 bg-[#1D1612] text-[#F6F1EA] hover:bg-[#8C6A43] p-4 rounded-full shadow-2xl transition-all cursor-pointer flex items-center gap-2 group"
        title="Book Appointment"
      >
        <Calendar className="w-5 h-5 text-[#D9B98F]" />
        <span className="text-xs uppercase tracking-widest font-medium hidden sm:inline">
          Book Appointment
        </span>
      </button>

    </div>
  );
}

function AdminRoute() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  if (!isAdminAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAdminAuthenticated(true)} />;
  }

  return <AdminDashboard onLogout={() => setIsAdminAuthenticated(false)} />;
}

export default function App() {
  return (
    <ConfigProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicWebsite />} />
          <Route path="/admin" element={<AdminRoute />} />
          <Route path="/preview" element={<PreviewShell />} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
