import React, { useCallback, useState } from 'react';
import { SiteConfig } from '../../../config/types';
import { useConfig } from '../../../context/ConfigContext';
import { AdCreationForm } from './AdCreationForm';
import { PosterPreviewEngine } from './PosterPreviewEngine';
import { ExportShareModule } from './ExportShareModule';
import { PosterAspectRatio, PromotionAdData, PromotionStep } from './types';

interface PromotionStudioProps {
  theme?: 'dark' | 'light';
  configOverride?: SiteConfig;
}

function buildInitialAdData(config: SiteConfig): PromotionAdData {
  const firstOffer = config.offers?.[0];
  const firstService = config.services?.[0];
  const origin =
    typeof window !== 'undefined' && window.location?.origin
      ? `${window.location.origin}/#reservations`
      : '#reservations';

  return {
    salonName: config.brand.name || 'Aurelia',
    tagline: config.brand.tagline || 'Artisanal Beauty & Wellness Sanctuary',
    city: config.businessInfo.city || 'Mumbai',
    phone: config.businessInfo.phone || '',
    whatsappNumber: config.booking.whatsappNumber || config.businessInfo.whatsappNumber || '',
    bookingUrl: origin,
    includeQrCode: true,

    templateId: 'editorial-arch',
    aspectRatio: '4:5',
    paletteId: 'champagne',
    featuredImage: firstOffer?.image || firstService?.image || config.hero.heroImage || '',

    eyebrow: firstOffer?.badge || 'Curated Studio Campaign',
    headline: firstOffer?.title || firstService?.title || 'Artisanal Hair & Skin Rituals',
    subheadline:
      firstOffer?.subtitle ||
      firstService?.subtitle ||
      'Unhurried 1-on-1 consultations with botanical care.',
    offerBadge: firstOffer?.discountTag || '',
    promoCode: firstOffer?.code || '',
    priceHighlight: firstOffer?.offerPrice || firstService?.price || '',
    validUntil: firstOffer?.validTill || '',
    ctaLabel: 'Book Appointment',
  };
}

export const PromotionStudio: React.FC<PromotionStudioProps> = ({
  theme = 'dark',
  configOverride,
}) => {
  const { config: contextConfig } = useConfig();
  const config = configOverride || contextConfig;
  const isDark = theme === 'dark';

  const [step, setStep] = useState<PromotionStep>(1);
  const [adData, setAdData] = useState<PromotionAdData>(() => buildInitialAdData(config));

  const handlePatch = useCallback((patch: Partial<PromotionAdData>) => {
    setAdData((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleResetFromConfig = useCallback(() => {
    setAdData(buildInitialAdData(config));
  }, [config]);

  const handleMatchRatio = useCallback((ratio: PosterAspectRatio) => {
    setAdData((prev) => ({ ...prev, aspectRatio: ratio }));
  }, []);

  return (
    <section
      aria-label="Promotion Studio"
      className={`space-y-6 ${isDark ? 'text-[#C9D1D9]' : 'text-[#1D1612]'}`}
    >
      {/* Workspace Header */}
      <div
        className={`rounded-xl border p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4 ${
          isDark ? 'bg-[#161B22] border-[#30363D]' : 'bg-[#EFE6DA]/60 border-[#D8C8B4]'
        }`}
      >
        <div>
          <h2 className={`text-lg font-semibold ${isDark ? 'text-[#F2F4F8]' : 'text-[#1D1612]'}`}>
            Promotion Studio
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#8B949E]' : 'text-[#6F5F51]'}`}>
            Build branded salon posters in three steps, preview layouts live, and export channel-ready visuals and captions.
          </p>
        </div>
        <div className={`text-xs font-mono tabular-nums ${isDark ? 'text-[#8B949E]' : 'text-[#6F5F51]'}`}>
          {adData.salonName} · {adData.aspectRatio}
        </div>
      </div>

      {/* 2-Column Studio Grid */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-6 space-y-6">
          <AdCreationForm
            step={step}
            onStepChange={setStep}
            data={adData}
            onChange={handlePatch}
            onResetFromConfig={handleResetFromConfig}
            config={config}
            theme={theme}
          />
          <ExportShareModule
            data={adData}
            onMatchRatio={handleMatchRatio}
            theme={theme}
          />
        </div>

        <div className="lg:col-span-6 lg:sticky lg:top-20">
          <PosterPreviewEngine data={adData} theme={theme} />
        </div>
      </div>
    </section>
  );
};
