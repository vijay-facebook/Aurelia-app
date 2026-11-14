import React from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Image as ImageIcon } from 'lucide-react';
import { SiteConfig } from '../../../config/types';
import {
  ACCENT_PALETTES,
  ASPECT_SPECS,
  PROMOTION_TEMPLATES,
} from './templates';
import {
  AccentPaletteId,
  PosterAspectRatio,
  PromotionAdData,
  PromotionStep,
  PromotionTemplateId,
} from './types';

interface AdCreationFormProps {
  step: PromotionStep;
  onStepChange: (step: PromotionStep) => void;
  data: PromotionAdData;
  onChange: (patch: Partial<PromotionAdData>) => void;
  onResetFromConfig: () => void;
  config: SiteConfig;
  theme?: 'dark' | 'light';
}

const STEPS: { id: PromotionStep; title: string; summary: string }[] = [
  { id: 1, title: '01. Salon Details', summary: 'Brand identity, contact line & booking QR' },
  { id: 2, title: '02. Template & Visuals', summary: 'Layout preset, palette, dimensions & photo' },
  { id: 3, title: '03. Ad Copy & Offer', summary: 'Headline, pricing, promo code & call to action' },
];

export const AdCreationForm: React.FC<AdCreationFormProps> = ({
  step,
  onStepChange,
  data,
  onChange,
  onResetFromConfig,
  config,
  theme = 'dark',
}) => {
  const isDark = theme === 'dark';

  const studioImages = Array.from(
    new Map(
      [
        { label: 'Hero Arch', url: config.hero.heroImage },
        ...(config.services || []).map((s) => ({ label: s.title, url: s.image })),
        ...(config.offers || []).map((o) => ({ label: o.title, url: o.image })),
        ...(config.gallery || []).map((g) => ({ label: g.title, url: g.image })),
      ]
        .filter((item) => Boolean(item.url))
        .map((item) => [item.url, item])
    ).values()
  ).slice(0, 8);

  const labelCls = `block text-xs font-medium mb-1.5 ${isDark ? 'text-[#C9D1D9]' : 'text-[#1D1612]'}`;
  const hintCls = `text-[11px] mt-1 ${isDark ? 'text-[#8B949E]' : 'text-[#6F5F51]'}`;
  const inputCls = `w-full px-3 py-2.5 rounded-lg border text-xs transition-colors focus:outline-none ${
    isDark
      ? 'bg-[#0D1117] border-[#30363D] text-[#F2F4F8] focus:border-[#58A6FF]'
      : 'bg-[#F6F1EA] border-[#D8C8B4] text-[#1D1612] focus:border-[#8C6A43]'
  }`;

  const applyOfferPreset = (offerId: string) => {
    const offer = (config.offers || []).find((o) => o.id === offerId);
    if (!offer) return;
    onChange({
      eyebrow: offer.badge || 'Limited Session Offer',
      headline: offer.title,
      subheadline: offer.subtitle || offer.description,
      offerBadge: offer.discountTag || '',
      promoCode: offer.code || '',
      priceHighlight: offer.offerPrice || '',
      validUntil: offer.validTill || '',
      featuredImage: offer.image || data.featuredImage,
    });
  };

  return (
    <div
      className={`rounded-xl border p-5 sm:p-6 space-y-6 ${
        isDark ? 'bg-[#161B22] border-[#30363D]' : 'bg-[#EFE6DA]/60 border-[#D8C8B4]'
      }`}
    >
      {/* Stepper Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-current/10">
        <div>
          <h3 className={`text-sm font-semibold ${isDark ? 'text-[#F2F4F8]' : 'text-[#1D1612]'}`}>
            Campaign Builder
          </h3>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-[#8B949E]' : 'text-[#6F5F51]'}`}>
            {STEPS.find((s) => s.id === step)?.summary}
          </p>
        </div>
        <button
          type="button"
          onClick={onResetFromConfig}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
            isDark
              ? 'bg-[#21262D] border-[#30363D] text-[#C9D1D9] hover:text-white'
              : 'bg-[#F6F1EA] border-[#D8C8B4] text-[#1D1612] hover:border-[#8C6A43]'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Sync Studio Info</span>
        </button>
      </div>

      {/* Interactive Step Selector Tabs */}
      <div
        className={`grid grid-cols-3 gap-1 p-1 rounded-lg border ${
          isDark ? 'bg-[#0D1117] border-[#30363D]' : 'bg-[#F6F1EA] border-[#D8C8B4]'
        }`}
      >
        {STEPS.map((s) => {
          const active = step === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onStepChange(s.id)}
              className={`px-2.5 py-2 rounded-md text-xs font-medium transition-colors cursor-pointer truncate ${
                active
                  ? isDark
                    ? 'bg-[#238636] text-white'
                    : 'bg-[#1D1612] text-[#F6F1EA]'
                  : isDark
                    ? 'text-[#8B949E] hover:text-[#F2F4F8]'
                    : 'text-[#6F5F51] hover:text-[#1D1612]'
              }`}
            >
              {s.title}
            </button>
          );
        })}
      </div>

      {/* STEP 1: SALON DETAILS */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Salon / Studio Name</label>
              <input
                type="text"
                value={data.salonName}
                onChange={(e) => onChange({ salonName: e.target.value })}
                placeholder="e.g. Aurelia Studio"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>City / Neighbourhood</label>
              <input
                type="text"
                value={data.city}
                onChange={(e) => onChange({ city: e.target.value })}
                placeholder="e.g. Bandra West, Mumbai"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Studio Tagline</label>
            <input
              type="text"
              value={data.tagline}
              onChange={(e) => onChange({ tagline: e.target.value })}
              placeholder="e.g. Artisanal Beauty & Wellness Sanctuary"
              className={inputCls}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Concierge Phone</label>
              <input
                type="text"
                value={data.phone}
                onChange={(e) => onChange({ phone: e.target.value })}
                placeholder="+91 98200 91823"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>WhatsApp Broadcast Number</label>
              <input
                type="text"
                value={data.whatsappNumber}
                onChange={(e) => onChange({ whatsappNumber: e.target.value })}
                placeholder="919820091823"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Direct Booking Link (Encoded into Poster QR)</label>
            <input
              type="url"
              value={data.bookingUrl}
              onChange={(e) => onChange({ bookingUrl: e.target.value })}
              placeholder="https://your-salon-site.com/#reservations"
              className={inputCls}
            />
            <p className={hintCls}>Customers scanning the poster QR code are routed directly to this booking URL.</p>
          </div>

          <label
            className={`flex items-center justify-between gap-3 p-3.5 rounded-lg border cursor-pointer ${
              isDark ? 'bg-[#0D1117] border-[#30363D]' : 'bg-[#F6F1EA] border-[#D8C8B4]'
            }`}
          >
            <div>
              <span className={`block text-xs font-medium ${isDark ? 'text-[#F2F4F8]' : 'text-[#1D1612]'}`}>
                Include Scannable Booking QR on Poster
              </span>
              <span className={`block text-[11px] ${isDark ? 'text-[#8B949E]' : 'text-[#6F5F51]'}`}>
                Adds a studio-specific QR badge on exported posters and flyers.
              </span>
            </div>
            <input
              type="checkbox"
              checked={data.includeQrCode}
              onChange={(e) => onChange({ includeQrCode: e.target.checked })}
              className="w-4 h-4 accent-[#238636]"
            />
          </label>
        </div>
      )}

      {/* STEP 2: TEMPLATE SELECTION & VISUALS */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <label className={labelCls}>Poster Layout Template</label>
            <div className="grid sm:grid-cols-2 gap-3">
              {PROMOTION_TEMPLATES.map((tpl) => {
                const selected = data.templateId === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() =>
                      onChange({
                        templateId: tpl.id as PromotionTemplateId,
                        aspectRatio: tpl.recommendedRatio,
                      })
                    }
                    className={`p-3.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      selected
                        ? isDark
                          ? 'bg-[#1F6FEB]/15 border-[#58A6FF] text-[#F2F4F8]'
                          : 'bg-[#1D1612] border-[#1D1612] text-[#F6F1EA]'
                        : isDark
                          ? 'bg-[#0D1117] border-[#30363D] text-[#C9D1D9] hover:border-[#8B949E]'
                          : 'bg-[#F6F1EA] border-[#D8C8B4] text-[#1D1612] hover:border-[#8C6A43]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold">{tpl.name}</span>
                      <span className="text-[10px] font-mono opacity-75">{tpl.recommendedRatio}</span>
                    </div>
                    <p className="text-[11px] opacity-80 mt-1 leading-relaxed">{tpl.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Color Palette</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(ACCENT_PALETTES).map((pal) => {
                  const active = data.paletteId === pal.id;
                  return (
                    <button
                      key={pal.id}
                      type="button"
                      onClick={() => onChange({ paletteId: pal.id as AccentPaletteId })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                        active
                          ? isDark
                            ? 'bg-[#21262D] border-[#58A6FF] text-white'
                            : 'bg-[#1D1612] border-[#1D1612] text-[#F6F1EA]'
                          : isDark
                            ? 'bg-[#0D1117] border-[#30363D] text-[#C9D1D9]'
                            : 'bg-[#F6F1EA] border-[#D8C8B4] text-[#1D1612]'
                      }`}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: pal.accent }}
                      />
                      <span className="truncate">{pal.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className={labelCls}>Poster Format / Aspect Ratio</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(ASPECT_SPECS).map((spec) => {
                  const active = data.aspectRatio === spec.id;
                  return (
                    <button
                      key={spec.id}
                      type="button"
                      onClick={() => onChange({ aspectRatio: spec.id as PosterAspectRatio })}
                      className={`px-3 py-2 rounded-lg border text-left transition-colors cursor-pointer ${
                        active
                          ? isDark
                            ? 'bg-[#21262D] border-[#58A6FF] text-white'
                            : 'bg-[#1D1612] border-[#1D1612] text-[#F6F1EA]'
                          : isDark
                            ? 'bg-[#0D1117] border-[#30363D] text-[#C9D1D9]'
                            : 'bg-[#F6F1EA] border-[#D8C8B4] text-[#1D1612]'
                      }`}
                    >
                      <div className="text-xs font-medium">{spec.label}</div>
                      <div className="text-[10px] opacity-70 truncate">{spec.useCase}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelCls}>Featured Photography</label>
            {studioImages.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {studioImages.map((img) => {
                  const active = data.featuredImage === img.url;
                  return (
                    <button
                      key={img.url}
                      type="button"
                      onClick={() => onChange({ featuredImage: img.url })}
                      title={img.label}
                      className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                        active
                          ? isDark
                            ? 'border-[#58A6FF]'
                            : 'border-[#8C6A43]'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            )}
            <div className="flex items-center gap-2 pt-1">
              <ImageIcon className={`w-4 h-4 shrink-0 ${isDark ? 'text-[#8B949E]' : 'text-[#6F5F51]'}`} />
              <input
                type="text"
                value={data.featuredImage}
                onChange={(e) => onChange({ featuredImage: e.target.value })}
                placeholder="/uploads/poster-image.jpg or https://..."
                className={inputCls}
              />
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: TEXT INPUT & CAMPAIGN COPY */}
      {step === 3 && (
        <div className="space-y-4">
          {config.offers && config.offers.length > 0 && (
            <div
              className={`p-3.5 rounded-lg border space-y-2 ${
                isDark ? 'bg-[#0D1117] border-[#30363D]' : 'bg-[#F6F1EA] border-[#D8C8B4]'
              }`}
            >
              <span className={`text-[11px] font-medium block ${isDark ? 'text-[#8B949E]' : 'text-[#6F5F51]'}`}>
                Quick-Fill from Active Studio Offers
              </span>
              <div className="flex flex-wrap gap-2">
                {config.offers.map((offer) => (
                  <button
                    key={offer.id}
                    type="button"
                    onClick={() => applyOfferPreset(offer.id)}
                    className={`px-3 py-1.5 rounded-md border text-xs transition-colors cursor-pointer ${
                      isDark
                        ? 'bg-[#161B22] border-[#30363D] text-[#C9D1D9] hover:border-[#58A6FF] hover:text-white'
                        : 'bg-[#EFE6DA] border-[#D8C8B4] text-[#1D1612] hover:border-[#8C6A43]'
                    }`}
                  >
                    {offer.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Eyebrow / Kicker</label>
              <input
                type="text"
                value={data.eyebrow}
                onChange={(e) => onChange({ eyebrow: e.target.value })}
                placeholder="e.g. Seasonal Atelier Offer"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Offer Callout (Optional)</label>
              <input
                type="text"
                value={data.offerBadge}
                onChange={(e) => onChange({ offerBadge: e.target.value })}
                placeholder="e.g. SAVE 20%"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Main Poster Headline</label>
            <input
              type="text"
              value={data.headline}
              onChange={(e) => onChange({ headline: e.target.value })}
              placeholder="e.g. Organic Balayage & Botanical Gloss"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Supporting Copy</label>
            <textarea
              rows={3}
              value={data.subheadline}
              onChange={(e) => onChange({ subheadline: e.target.value })}
              placeholder="Describe the ritual, benefits, and what is included..."
              className={inputCls}
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Price Highlight</label>
              <input
                type="text"
                value={data.priceHighlight}
                onChange={(e) => onChange({ priceHighlight: e.target.value })}
                placeholder="e.g. from ₹4,500"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Promo Code</label>
              <input
                type="text"
                value={data.promoCode}
                onChange={(e) => onChange({ promoCode: e.target.value.toUpperCase() })}
                placeholder="e.g. AURELIA20"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Valid Until</label>
              <input
                type="text"
                value={data.validUntil}
                onChange={(e) => onChange({ validUntil: e.target.value })}
                placeholder="e.g. 30 Nov 2026"
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Call-to-Action Label</label>
            <input
              type="text"
              value={data.ctaLabel}
              onChange={(e) => onChange({ ctaLabel: e.target.value })}
              placeholder="e.g. Reserve Your Session"
              className={inputCls}
            />
          </div>
        </div>
      )}

      {/* Wizard Navigation Footer */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-current/10">
        <button
          type="button"
          disabled={step === 1}
          onClick={() => onStepChange((step - 1) as PromotionStep)}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
            isDark
              ? 'bg-[#21262D] border-[#30363D] text-[#C9D1D9] hover:text-white'
              : 'bg-[#F6F1EA] border-[#D8C8B4] text-[#1D1612]'
          }`}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Previous</span>
        </button>

        <span className={`text-xs font-mono tabular-nums ${isDark ? 'text-[#8B949E]' : 'text-[#6F5F51]'}`}>
          Step {step} of 3
        </span>

        {step < 3 ? (
          <button
            type="button"
            onClick={() => onStepChange((step + 1) as PromotionStep)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              isDark
                ? 'bg-[#238636] hover:bg-[#2EA043] text-white'
                : 'bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA]'
            }`}
          >
            <span>Next Step</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onStepChange(1)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
              isDark
                ? 'bg-[#21262D] border-[#30363D] text-[#58A6FF] hover:border-[#58A6FF]'
                : 'bg-[#F6F1EA] border-[#8C6A43] text-[#8C6A43]'
            }`}
          >
            <span>Review from Step 1</span>
          </button>
        )}
      </div>
    </div>
  );
};
