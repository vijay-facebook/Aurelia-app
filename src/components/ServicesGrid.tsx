import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Clock,
  MessageSquarePlus,
  Sparkles,
  Star,
  Trash2,
  X,
  Check,
} from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { ServiceItemConfig } from '../config/types';
import { defaultConfig } from '../config/defaultConfig';
import {
  SERVICE_FEEDBACK_UPDATED_EVENT,
  ServiceFeedbackEntry,
  addUserServiceFeedback,
  deleteUserServiceFeedback,
  getFeedbackForService,
  loadUserServiceFeedback,
  summarizeServiceRatings,
} from '../utils/serviceReviews';

interface ServicesGridProps {
  onSelectService: (service: ServiceItemConfig) => void;
}

type DetailTab = 'overview' | 'reviews';

const RATING_LABELS: Record<number, string> = {
  1: 'Needs Improvement',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Exceptional',
};

const getMenuCategoriesForService = (category: string): string[] => {
  const normalized = (category || '').toLowerCase();
  if (normalized === 'nails' || normalized === 'spa' || normalized === 'nails-spa') {
    return ['nails-spa', 'nails', 'spa'];
  }
  return [normalized];
};

const getExtendedDescription = (service: ServiceItemConfig): string => {
  if (service.extendedDescription && service.extendedDescription.trim().length > 0) {
    return service.extendedDescription;
  }
  const matchedDefault = defaultConfig.services.find(
    (d) => d.id === service.id || d.title.toLowerCase() === service.title.toLowerCase()
  );
  if (matchedDefault?.extendedDescription) {
    return matchedDefault.extendedDescription;
  }
  return `${service.subtitle} Every session begins with an unhurried one-on-one consultation tailored to your preferences, using carefully sourced botanical formulations in a calm private setting.`;
};

function formatReviewDate(iso?: string): string {
  if (!iso) return 'Verified Studio Review';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return 'Recent Review';
  return parsed.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const StarRow: React.FC<{ rating: number; size?: 'sm' | 'md' }> = ({ rating, size = 'sm' }) => {
  const iconClass = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4';
  return (
    <div className="inline-flex items-center gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = rating >= star - 0.25;
        return (
          <Star
            key={star}
            className={`${iconClass} ${
              filled
                ? 'fill-[#8C6A43] text-[#8C6A43]'
                : 'fill-transparent text-[#D8C8B4]'
            }`}
          />
        );
      })}
    </div>
  );
};

export const ServicesGrid: React.FC<ServicesGridProps> = ({ onSelectService }) => {
  const { config } = useConfig();
  const [detailService, setDetailService] = useState<ServiceItemConfig | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>('overview');

  const [userFeedback, setUserFeedback] = useState<ServiceFeedbackEntry[]>(() =>
    loadUserServiceFeedback()
  );

  // Feedback form state inside Service Detail modal
  const [draftRating, setDraftRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [draftAuthor, setDraftAuthor] = useState<string>('');
  const [draftComment, setDraftComment] = useState<string>('');
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [feedbackSuccess, setFeedbackSuccess] = useState<string | null>(null);

  useEffect(() => {
    const syncFeedback = () => setUserFeedback(loadUserServiceFeedback());
    window.addEventListener(SERVICE_FEEDBACK_UPDATED_EVENT, syncFeedback);
    return () => window.removeEventListener(SERVICE_FEEDBACK_UPDATED_EVENT, syncFeedback);
  }, []);

  useEffect(() => {
    if (!detailService) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDetailService(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [detailService]);

  const serviceSummaries = useMemo(() => {
    const map = new Map<
      string,
      { entries: ServiceFeedbackEntry[]; summary: ReturnType<typeof summarizeServiceRatings> }
    >();
    const configuredReviews = config.reviews || [];
    for (const svc of config.services) {
      const entries = getFeedbackForService(
        svc.id,
        userFeedback,
        configuredReviews,
        config.services
      );
      map.set(svc.id, {
        entries,
        summary: summarizeServiceRatings(entries),
      });
    }
    return map;
  }, [config.services, config.reviews, userFeedback]);

  if (!config.sectionsVisibility.services) return null;

  const openDetailModal = (service: ServiceItemConfig, initialTab: DetailTab = 'overview') => {
    setDetailService(service);
    setDetailTab(initialTab);
    setFeedbackError(null);
    setFeedbackSuccess(null);
    setDraftRating(5);
    setHoverRating(0);
    setDraftComment('');
  };

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!detailService) return;

    if (draftRating < 1 || draftRating > 5) {
      setFeedbackError('Please select a star rating from 1 to 5.');
      return;
    }
    if (!draftComment.trim()) {
      setFeedbackError('Please share a brief note about your experience.');
      return;
    }

    const updated = addUserServiceFeedback({
      serviceId: detailService.id,
      rating: draftRating,
      author: draftAuthor,
      comment: draftComment,
    });
    setUserFeedback(updated);
    setDraftAuthor('');
    setDraftComment('');
    setFeedbackError(null);
    setFeedbackSuccess('Thank you — your rating and feedback have been added.');
  };

  const handleDeleteReview = (feedbackId: string) => {
    const updated = deleteUserServiceFeedback(feedbackId);
    setUserFeedback(updated);
  };

  const relatedMenuItems = detailService
    ? (config.menu?.items || []).filter((item) =>
        getMenuCategoriesForService(detailService.category).includes(
          (item.category || '').toLowerCase()
        )
      )
    : [];

  const detailFeedbackData = detailService
    ? serviceSummaries.get(detailService.id) || {
        entries: [],
        summary: summarizeServiceRatings([]),
      }
    : null;

  const activeStarValue = hoverRating || draftRating;

  return (
    <section
      id="services"
      className="py-24 lg:py-32 max-w-[1440px] mx-auto px-6 lg:px-12 font-sans"
    >
      {/* Section Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
        <div>
          <span className="text-[11px] font-sans tracking-[0.3em] uppercase text-[#8C6A43] font-medium block mb-3">
            {config.headings.servicesEyebrow}
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-[#1D1612]">
            {config.headings.servicesTitle}
          </h2>
        </div>

        <p className="font-sans text-sm text-[#6F5F51] font-light max-w-md leading-relaxed">
          Every visit begins with a consultation, so the result suits your hair, your skin and your life.
        </p>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {config.services.map((service) => {
          const ratingInfo = serviceSummaries.get(service.id)?.summary || {
            averageRating: 0,
            totalCount: 0,
            distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          };

          return (
            <div
              key={service.id}
              onClick={() => onSelectService(service)}
              className="group bg-[#EFE6DA]/60 hover:bg-[#EFE6DA] rounded-[8px] border border-[#D8C8B4]/70 p-4 transition-all duration-300 hover:shadow-lg cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Image Container — opens Service Detail popup */}
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={`View details for ${service.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    openDetailModal(service, 'overview');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      openDetailModal(service, 'overview');
                    }
                  }}
                  className="relative aspect-[4/3] rounded-[6px] overflow-hidden mb-4 bg-[#E3D7C7] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8C6A43]"
                >
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />

                  <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1D1612]/80 backdrop-blur-md text-[#F6F1EA] text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-[4px]">
                    View Details
                  </div>

                  <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-[#F6F1EA] text-[#1D1612] group-hover:bg-[#1D1612] group-hover:text-[#F6F1EA] flex items-center justify-center transition-colors shadow-sm">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-serif text-2xl font-light text-[#1D1612] group-hover:text-[#8C6A43] transition-colors">
                      {service.title}
                    </h3>
                    <span className="font-sans text-xs text-[#6F5F51] font-medium font-mono shrink-0">
                      {service.price}
                    </span>
                  </div>

                  <p className="font-sans text-xs text-[#6F5F51] font-light leading-relaxed">
                    {service.subtitle}
                  </p>
                </div>
              </div>

              {/* Star Rating & Feedback Bar */}
              <div className="mt-4 pt-3 border-t border-[#D8C8B4]/70 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDetailModal(service, 'reviews');
                  }}
                  className="inline-flex items-center gap-2 text-left hover:opacity-80 transition-opacity cursor-pointer"
                  aria-label={`View ratings and leave feedback for ${service.title}`}
                >
                  <StarRow rating={ratingInfo.averageRating} size="sm" />
                  {ratingInfo.totalCount > 0 ? (
                    <span className="text-[11px] text-[#1D1612] font-mono tabular-nums">
                      {ratingInfo.averageRating.toFixed(1)}{' '}
                      <span className="text-[#6F5F51] font-sans">
                        ({ratingInfo.totalCount}{' '}
                        {ratingInfo.totalCount === 1 ? 'review' : 'reviews'})
                      </span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#6F5F51]">No ratings yet</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    openDetailModal(service, 'reviews');
                  }}
                  className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-medium text-[#8C6A43] hover:text-[#1D1612] px-2.5 py-1 rounded-full bg-[#F6F1EA] border border-[#D8C8B4] transition-colors cursor-pointer shrink-0"
                >
                  <MessageSquarePlus className="w-3 h-3" />
                  <span>Rate</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Service Detail & Feedback Popup */}
      {detailService && detailFeedbackData && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="service-detail-title"
          onClick={() => setDetailService(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8 bg-[#1D1612]/70 backdrop-blur-md animate-fade-in font-sans"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#F6F1EA] rounded-[12px] border border-[#D8C8B4] max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setDetailService(null)}
              className="sticky sm:absolute top-4 right-4 float-right sm:float-none z-10 p-2 text-[#1D1612] hover:text-[#8C6A43] bg-[#EFE6DA] hover:bg-[#E3D7C7] rounded-full transition-colors cursor-pointer"
              aria-label="Close service detail"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid md:grid-cols-12 gap-8 p-6 lg:p-10">
              {/* Left Column: Service Image, Price & Live Star Summary */}
              <div className="md:col-span-5 space-y-4">
                <div className="aspect-[4/3] md:aspect-[3/4] rounded-[8px] overflow-hidden border border-[#D8C8B4] bg-[#E3D7C7] shadow-md relative">
                  <img
                    src={detailService.image}
                    alt={detailService.title}
                    className="w-full h-full object-cover"
                  />
                  {detailService.popular && (
                    <div className="absolute top-3 left-3 bg-[#1D1612]/85 backdrop-blur-md text-[#D9B98F] text-[10px] uppercase tracking-widest px-3 py-1 rounded-[4px] border border-[#D8C8B4]/30 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" />
                      <span>Most Requested</span>
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 right-3 bg-[#F6F1EA]/95 backdrop-blur-md px-3.5 py-2 rounded-[6px] border border-[#D8C8B4] flex items-center justify-between text-xs text-[#1D1612]">
                    <span className="text-[10px] uppercase tracking-wider font-medium text-[#8C6A43]">
                      Starting Investment
                    </span>
                    <span className="font-mono font-medium">{detailService.price}</span>
                  </div>
                </div>

                {/* Compact Rating Summary Card */}
                <button
                  type="button"
                  onClick={() => setDetailTab('reviews')}
                  className="w-full text-left bg-[#EFE6DA] hover:bg-[#E3D7C7]/70 border border-[#D8C8B4] rounded-[8px] p-4 transition-colors cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-[#8C6A43] font-medium">
                      Guest Rating
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-[#6F5F51] underline underline-offset-2">
                      {detailTab === 'overview' ? 'Leave Feedback →' : 'Viewing Reviews'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-2xl font-medium text-[#1D1612] tabular-nums">
                      {detailFeedbackData.summary.totalCount > 0
                        ? detailFeedbackData.summary.averageRating.toFixed(1)
                        : '—'}
                    </span>
                    <div className="space-y-0.5">
                      <StarRow rating={detailFeedbackData.summary.averageRating} size="md" />
                      <p className="text-[11px] text-[#6F5F51]">
                        {detailFeedbackData.summary.totalCount}{' '}
                        {detailFeedbackData.summary.totalCount === 1 ? 'review' : 'reviews'}
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Right Column: Tabs for Overview & Ratings/Feedback */}
              <div className="md:col-span-7 flex flex-col justify-between space-y-6">
                <div className="space-y-5">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C6A43] font-medium block">
                      Service Detail · {detailService.category}
                    </span>
                    <h2
                      id="service-detail-title"
                      className="font-serif text-3xl lg:text-4xl text-[#1D1612] font-light leading-tight mt-1"
                    >
                      {detailService.title}
                    </h2>
                    <p className="text-xs font-sans text-[#8C6A43] font-medium mt-1">
                      {detailService.subtitle}
                    </p>
                  </div>

                  {/* Tab Switcher */}
                  <div className="flex items-center gap-2 border-b border-[#D8C8B4] pb-3">
                    <button
                      type="button"
                      onClick={() => setDetailTab('overview')}
                      className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-medium transition-colors cursor-pointer ${
                        detailTab === 'overview'
                          ? 'bg-[#1D1612] text-[#F6F1EA]'
                          : 'bg-[#EFE6DA] text-[#6F5F51] hover:text-[#1D1612]'
                      }`}
                    >
                      Overview
                    </button>
                    <button
                      type="button"
                      onClick={() => setDetailTab('reviews')}
                      className={`px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 ${
                        detailTab === 'reviews'
                          ? 'bg-[#1D1612] text-[#F6F1EA]'
                          : 'bg-[#EFE6DA] text-[#6F5F51] hover:text-[#1D1612]'
                      }`}
                    >
                      <Star className="w-3 h-3 fill-current" />
                      <span>Ratings & Feedback ({detailFeedbackData.summary.totalCount})</span>
                    </button>
                  </div>

                  {detailTab === 'overview' ? (
                    <div className="space-y-4">
                      <p className="text-xs sm:text-sm font-sans text-[#6F5F51] font-light leading-relaxed">
                        {getExtendedDescription(detailService)}
                      </p>

                      {relatedMenuItems.length > 0 && (
                        <div className="bg-[#EFE6DA] p-4 rounded-[8px] border border-[#D8C8B4] space-y-3">
                          <span className="font-serif text-sm font-medium text-[#1D1612] block">
                            Curated Treatments in This Category
                          </span>
                          <ul className="space-y-2.5">
                            {relatedMenuItems.slice(0, 4).map((item) => (
                              <li
                                key={item.id}
                                className="flex items-start justify-between gap-3 text-xs border-b border-[#D8C8B4]/60 last:border-b-0 pb-2 last:pb-0"
                              >
                                <div>
                                  <p className="font-medium text-[#1D1612]">{item.title}</p>
                                  <p className="text-[11px] text-[#6F5F51] font-light">
                                    {item.description}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="font-mono text-[#1D1612] font-medium block">
                                    {item.price}
                                  </span>
                                  <span className="text-[10px] text-[#8C6A43] inline-flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" />
                                    {item.duration}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {/* Rating Breakdown */}
                      <div className="bg-[#EFE6DA]/70 border border-[#D8C8B4] rounded-[8px] p-4 space-y-2">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count =
                            detailFeedbackData.summary.distribution[star as 1 | 2 | 3 | 4 | 5] || 0;
                          const pct =
                            detailFeedbackData.summary.totalCount > 0
                              ? Math.round((count / detailFeedbackData.summary.totalCount) * 100)
                              : 0;
                          return (
                            <div
                              key={star}
                              className="flex items-center gap-3 text-[11px] font-mono tabular-nums"
                            >
                              <span className="w-8 text-[#1D1612]">{star} ★</span>
                              <div className="flex-1 h-2 bg-[#D8C8B4]/50 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#8C6A43] rounded-full transition-all duration-300"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className="w-6 text-right text-[#6F5F51]">{count}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Leave Feedback Form */}
                      <form
                        onSubmit={handleSubmitFeedback}
                        className="bg-[#EFE6DA] border border-[#D8C8B4] rounded-[8px] p-4 space-y-3 text-xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-serif text-base font-medium text-[#1D1612]">
                            Leave Feedback for {detailService.title}
                          </span>
                          <span className="text-[11px] text-[#8C6A43] font-medium">
                            {RATING_LABELS[activeStarValue] || 'Select Rating'}
                          </span>
                        </div>

                        {/* Interactive 5-Star Picker */}
                        <div
                          role="radiogroup"
                          aria-label={`Rate ${detailService.title}`}
                          className="flex items-center gap-1.5"
                          onMouseLeave={() => setHoverRating(0)}
                        >
                          {[1, 2, 3, 4, 5].map((star) => {
                            const active = star <= activeStarValue;
                            return (
                              <button
                                key={star}
                                type="button"
                                role="radio"
                                aria-checked={draftRating === star}
                                aria-label={`Rate ${star} ${star === 1 ? 'star' : 'stars'}`}
                                onMouseEnter={() => setHoverRating(star)}
                                onClick={() => setDraftRating(star)}
                                className="p-1 transition-transform hover:scale-110 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#8C6A43] rounded"
                              >
                                <Star
                                  className={`w-6 h-6 transition-colors ${
                                    active
                                      ? 'fill-[#8C6A43] text-[#8C6A43]'
                                      : 'fill-transparent text-[#8C6A43]/40'
                                  }`}
                                />
                              </button>
                            );
                          })}
                          <span className="ml-2 font-mono text-[11px] text-[#6F5F51] tabular-nums">
                            {draftRating}.0 / 5.0
                          </span>
                        </div>

                        {feedbackError && (
                          <div className="bg-[#FDF2F2] border border-[#E5B8B8] text-[#7D2929] px-3 py-2 rounded-[6px] text-[11px]">
                            {feedbackError}
                          </div>
                        )}

                        {feedbackSuccess && (
                          <div className="bg-[#F6F1EA] border border-[#8C6A43]/50 text-[#1D1612] px-3 py-2 rounded-[6px] text-[11px] flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#8C6A43]" />
                            <span>{feedbackSuccess}</span>
                          </div>
                        )}

                        <input
                          type="text"
                          value={draftAuthor}
                          onChange={(e) => setDraftAuthor(e.target.value)}
                          placeholder="Your Name (optional, e.g. Meera N.)"
                          className="w-full bg-[#F6F1EA] text-[#1D1612] px-3 py-2 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                        />

                        <textarea
                          rows={2}
                          value={draftComment}
                          onChange={(e) => setDraftComment(e.target.value)}
                          placeholder={`Share how your ${detailService.title} session felt...`}
                          className="w-full bg-[#F6F1EA] text-[#1D1612] px-3 py-2 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43] resize-none"
                        />

                        <button
                          type="submit"
                          className="w-full sm:w-auto bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] px-5 py-2.5 rounded-[6px] text-[11px] uppercase tracking-wider font-medium transition-colors cursor-pointer"
                        >
                          Submit Feedback
                        </button>
                      </form>

                      {/* Existing Reviews List */}
                      <div className="space-y-3">
                        <span className="text-[10px] uppercase tracking-widest text-[#8C6A43] font-medium block">
                          Client Reviews ({detailFeedbackData.entries.length})
                        </span>

                        {detailFeedbackData.entries.length === 0 ? (
                          <p className="text-xs text-[#6F5F51] bg-[#EFE6DA]/40 border border-dashed border-[#D8C8B4] rounded-[8px] p-4 text-center">
                            No feedback submitted yet for {detailService.title}. Be the first to share your experience above.
                          </p>
                        ) : (
                          <ul className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                            {detailFeedbackData.entries.map((entry) => (
                              <li
                                key={entry.id}
                                className="bg-[#EFE6DA]/50 border border-[#D8C8B4] rounded-[8px] p-3.5 space-y-1.5 text-xs"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <StarRow rating={entry.rating} size="sm" />
                                    <span className="font-medium text-[#1D1612]">
                                      {entry.author}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-[#6F5F51] font-mono tabular-nums">
                                      {entry.location || formatReviewDate(entry.createdAt)}
                                    </span>
                                    {!entry.isConfiguredReview && (
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteReview(entry.id)}
                                        className="text-[#6F5F51] hover:text-[#8E2A2A] transition-colors cursor-pointer"
                                        aria-label="Remove review"
                                        title="Remove review"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-[#6F5F51] leading-relaxed">
                                  “{entry.comment}”
                                </p>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Book CTA */}
                <div className="pt-4 border-t border-[#D8C8B4] flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const chosen = detailService;
                      setDetailService(null);
                      onSelectService(chosen);
                    }}
                    className="flex-1 bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] py-3.5 px-6 rounded-[6px] text-xs uppercase tracking-widest font-medium transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <span>Book {detailService.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D9B98F]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetailService(null)}
                    className="px-5 py-3.5 rounded-[6px] border border-[#D8C8B4] bg-[#EFE6DA] hover:bg-[#E3D7C7] text-[#1D1612] text-xs uppercase tracking-widest font-medium transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
