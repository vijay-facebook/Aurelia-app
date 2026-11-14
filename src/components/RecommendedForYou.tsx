import React, { useCallback, useEffect, useState } from 'react';
import { ArrowRight, RefreshCw, Sparkles, SlidersHorizontal, Trash2, AlertCircle } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import {
  BookingHistoryEntry,
  GuestPreferences,
  HISTORY_UPDATED_EVENT,
  clearBookingHistory,
  loadBookingHistory,
  loadGuestPreferences,
  saveGuestPreferences,
} from '../utils/bookingHistory';

interface RecommendationItem {
  serviceId: string;
  title: string;
  category: string;
  price: string;
  numericPrice: number;
  duration?: string;
  image?: string;
  personalizedReason: string;
  pairingTip: string;
}

interface RecommendedForYouProps {
  onSelectService: (serviceLabel: string) => void;
  disableAutoFetch?: boolean;
}

const FOCUS_OPTIONS = [
  'Hair Artistry',
  'Colour & Gloss',
  'Skin Radiance',
  'Spa & Recovery',
  'Nail Care',
  'Bridal & Occasion',
];

const VIBE_OPTIONS: { id: GuestPreferences['sessionVibe']; label: string }[] = [
  { id: 'express', label: 'Express Refresh' },
  { id: 'ritual', label: 'Unhurried Ritual' },
  { id: 'indulgence', label: 'Full Indulgence' },
];

const BUDGET_OPTIONS: { id: GuestPreferences['budgetTier']; label: string }[] = [
  { id: 'all', label: 'All Tiers' },
  { id: 'under-3000', label: 'Under ₹3,000' },
  { id: 'mid-tier', label: '₹3,000 – ₹6,000' },
];

export const RecommendedForYou: React.FC<RecommendedForYouProps> = ({
  onSelectService,
  disableAutoFetch = false,
}) => {
  const { config } = useConfig();

  const [history, setHistory] = useState<BookingHistoryEntry[]>(() => loadBookingHistory());
  const [preferences, setPreferences] = useState<GuestPreferences>(() => loadGuestPreferences());
  const [prefsOpen, setPrefsOpen] = useState(false);

  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [curatorNote, setCuratorNote] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const fetchRecommendations = useCallback(
    async (currentHistory: BookingHistoryEntry[], currentPrefs: GuestPreferences) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/recommendations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingHistory: currentHistory,
            preferences: currentPrefs,
          }),
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || 'Could not load personalized recommendations.');
        }

        setCuratorNote(typeof data.curatorNote === 'string' ? data.curatorNote : '');
        setRecommendations(Array.isArray(data.recommendations) ? data.recommendations : []);
      } catch (err: any) {
        setError(err?.message || 'Unable to generate recommendations right now.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Sync when booking modal/section logs a new booking
  useEffect(() => {
    const handleHistoryUpdate = () => {
      const updated = loadBookingHistory();
      setHistory(updated);
      if (!disableAutoFetch) {
        fetchRecommendations(updated, loadGuestPreferences());
      }
    };
    window.addEventListener(HISTORY_UPDATED_EVENT, handleHistoryUpdate);
    return () => window.removeEventListener(HISTORY_UPDATED_EVENT, handleHistoryUpdate);
  }, [disableAutoFetch, fetchRecommendations]);

  // Initial recommendation fetch on mount
  useEffect(() => {
    if (!disableAutoFetch) {
      fetchRecommendations(history, preferences);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disableAutoFetch]);

  const updatePreferences = (patch: Partial<GuestPreferences>) => {
    const next = { ...preferences, ...patch };
    setPreferences(next);
    saveGuestPreferences(next);
  };

  const toggleFocusGoal = (goal: string) => {
    const exists = preferences.focusGoals.includes(goal);
    const nextGoals = exists
      ? preferences.focusGoals.filter((g) => g !== goal)
      : [...preferences.focusGoals, goal];
    updatePreferences({ focusGoals: nextGoals.length > 0 ? nextGoals : [goal] });
  };

  const recentServiceLabels = Array.from(
    new Set(history.flatMap((h) => h.services || []))
  ).slice(0, 4);

  if (!config.sectionsVisibility.services) return null;

  return (
    <section
      id="recommended"
      className="py-20 lg:py-28 max-w-[1440px] mx-auto px-6 lg:px-12 border-t border-[#D8C8B4]/60 font-sans"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
        <div className="space-y-3 max-w-2xl">
          <span className="text-[11px] font-sans tracking-[0.3em] uppercase text-[#8C6A43] font-medium block">
            Curated Concierge
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl font-light text-[#1D1612]">
            Recommended <span className="italic font-light text-[#8C6A43]">for You</span>
          </h2>
          <p className="text-sm text-[#6F5F51] font-light leading-relaxed">
            {curatorNote ||
              `Tailored treatments selected around ${
                history.length > 0
                  ? 'your previous studio visits and preferences.'
                  : 'your beauty preferences and desired ritual pace.'
              }`}
          </p>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setPrefsOpen((v) => !v)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-[6px] border text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              prefsOpen
                ? 'bg-[#1D1612] border-[#1D1612] text-[#F6F1EA]'
                : 'bg-[#EFE6DA] border-[#D8C8B4] text-[#1D1612] hover:border-[#8C6A43]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{prefsOpen ? 'Hide Preferences' : 'Tailor Preferences'}</span>
          </button>

          <button
            type="button"
            onClick={() => fetchRecommendations(history, preferences)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[6px] bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#D9B98F] ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Curating…' : 'Refresh Suggestions'}</span>
          </button>
        </div>
      </div>

      {/* Booking History & Preferences Bar */}
      {(recentServiceLabels.length > 0 || prefsOpen) && (
        <div className="mb-10 bg-[#EFE6DA]/70 border border-[#D8C8B4] rounded-[12px] p-5 sm:p-6 space-y-5">
          {recentServiceLabels.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#D8C8B4]/70 text-xs">
              <div className="flex flex-wrap items-center gap-2 text-[#6F5F51]">
                <span className="font-medium text-[#1D1612]">Based on your recent bookings:</span>
                <span>{recentServiceLabels.join(' · ')}</span>
              </div>
              <button
                type="button"
                onClick={() => clearBookingHistory()}
                className="inline-flex items-center gap-1.5 text-[11px] text-[#6F5F51] hover:text-[#1D1612] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            </div>
          )}

          {prefsOpen && (
            <div className="space-y-5">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-[#8C6A43] font-medium block mb-2.5">
                  Focus Areas
                </span>
                <div className="flex flex-wrap gap-2">
                  {FOCUS_OPTIONS.map((goal) => {
                    const active = preferences.focusGoals.includes(goal);
                    return (
                      <button
                        key={goal}
                        type="button"
                        onClick={() => toggleFocusGoal(goal)}
                        className={`px-3.5 py-2 rounded-[6px] border text-xs font-medium transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#1D1612] border-[#1D1612] text-[#F6F1EA]'
                            : 'bg-[#F6F1EA] border-[#D8C8B4] text-[#1D1612] hover:border-[#8C6A43]'
                        }`}
                      >
                        {goal}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#8C6A43] font-medium block mb-2.5">
                    Preferred Pace
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {VIBE_OPTIONS.map((opt) => {
                      const active = preferences.sessionVibe === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => updatePreferences({ sessionVibe: opt.id })}
                          className={`px-3 py-2 rounded-[6px] border text-xs font-medium transition-colors cursor-pointer truncate ${
                            active
                              ? 'bg-[#1D1612] border-[#1D1612] text-[#F6F1EA]'
                              : 'bg-[#F6F1EA] border-[#D8C8B4] text-[#1D1612] hover:border-[#8C6A43]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] uppercase tracking-wider text-[#8C6A43] font-medium block mb-2.5">
                    Investment Comfort
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {BUDGET_OPTIONS.map((opt) => {
                      const active = preferences.budgetTier === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => updatePreferences({ budgetTier: opt.id })}
                          className={`px-3 py-2 rounded-[6px] border text-xs font-medium transition-colors cursor-pointer truncate ${
                            active
                              ? 'bg-[#1D1612] border-[#1D1612] text-[#F6F1EA]'
                              : 'bg-[#F6F1EA] border-[#D8C8B4] text-[#1D1612] hover:border-[#8C6A43]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setPrefsOpen(false);
                    fetchRecommendations(history, preferences);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[6px] bg-[#8C6A43] hover:bg-[#1D1612] text-[#F6F1EA] text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer"
                >
                  <span>Update Recommendations</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-[#EFE6DA] border border-[#D8C8B4] rounded-[12px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#8C6A43] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#1D1612]">
                Personalized recommendations are momentarily unavailable
              </p>
              <p className="text-xs text-[#6F5F51] mt-1">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fetchRecommendations(history, preferences)}
            className="px-4 py-2 rounded-[6px] bg-[#1D1612] text-[#F6F1EA] text-xs font-medium uppercase tracking-wider hover:bg-[#8C6A43] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading Skeleton State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[0, 1, 2].map((skeletonIdx) => (
            <div
              key={skeletonIdx}
              className="rounded-[12px] border border-[#D8C8B4] bg-[#EFE6DA]/50 p-5 space-y-4 animate-pulse"
            >
              <div className="aspect-[4/3] rounded-[8px] bg-[#E3D7C7]" />
              <div className="h-3 w-32 rounded bg-[#E3D7C7]" />
              <div className="h-6 w-3/4 rounded bg-[#E3D7C7]" />
              <div className="h-12 w-full rounded bg-[#E3D7C7]" />
              <div className="h-10 w-full rounded bg-[#E3D7C7]" />
            </div>
          ))}
        </div>
      )}

      {/* Populated Recommendations Grid */}
      {!loading && !error && recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recommendations.map((rec) => {
            const hasImageError = failedImages[rec.serviceId];
            const metadataParts = [
              rec.category.replace(/-/g, ' '),
              rec.duration,
              rec.price,
            ].filter(Boolean);

            return (
              <article
                key={rec.serviceId}
                className="group bg-[#EFE6DA]/60 hover:bg-[#EFE6DA] rounded-[12px] border border-[#D8C8B4]/80 hover:border-[#8C6A43] transition-all p-5 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  {/* Image */}
                  <div className="aspect-[4/3] rounded-[8px] overflow-hidden bg-[#E3D7C7] border border-[#D8C8B4]/60">
                    {rec.image && !hasImageError ? (
                      <img
                        src={rec.image}
                        alt={rec.title}
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setFailedImages((prev) => ({ ...prev, [rec.serviceId]: true }))
                        }
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                        <Sparkles className="w-6 h-6 text-[#8C6A43] mb-2 opacity-70" />
                        <span className="font-serif text-base text-[#1D1612]">{rec.title}</span>
                      </div>
                    )}
                  </div>

                  {/* Clean Unboxed Metadata */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-sans uppercase tracking-wider text-[#8C6A43] font-medium tabular-nums">
                      {metadataParts.join(' · ')}
                    </div>

                    <h3 className="font-serif text-2xl font-light text-[#1D1612] leading-snug">
                      {rec.title}
                    </h3>

                    <p className="text-xs text-[#6F5F51] font-light leading-relaxed">
                      {rec.personalizedReason}
                    </p>

                    <p className="text-[11px] text-[#8C6A43] font-medium pt-1">
                      {rec.pairingTip}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectService(`${rec.title} (${rec.price})`)}
                  className="w-full bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] py-3 rounded-[6px] text-xs font-sans uppercase tracking-widest font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Reserve This Treatment</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#D9B98F]" />
                </button>
              </article>
            );
          })}
        </div>
      )}

      {/* Initial / Preview Static Fallback when Auto-Fetch Disabled */}
      {!loading && !error && recommendations.length === 0 && (
        <div className="bg-[#EFE6DA]/60 border border-[#D8C8B4] rounded-[12px] p-8 text-center space-y-4">
          <p className="font-serif text-2xl font-light text-[#1D1612]">
            Ready to curate your personalized studio ritual
          </p>
          <p className="text-xs text-[#6F5F51] max-w-md mx-auto">
            Select your beauty focus areas and tap below to receive three tailored service recommendations.
          </p>
          <button
            type="button"
            onClick={() => fetchRecommendations(history, preferences)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-[6px] bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] text-xs font-medium uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#D9B98F]" />
            <span>Generate Recommendations</span>
          </button>
        </div>
      )}
    </section>
  );
};
