import { ReviewItemConfig, ServiceItemConfig } from '../config/types';

export interface ServiceFeedbackEntry {
  id: string;
  serviceId: string;
  rating: number;
  author: string;
  comment: string;
  createdAt: string;
  location?: string;
  isConfiguredReview?: boolean;
}

export interface ServiceRatingSummary {
  averageRating: number;
  totalCount: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

const STORAGE_KEY = 'aurelia_service_feedback_v1';
export const SERVICE_FEEDBACK_UPDATED_EVENT = 'aurelia:service-feedback-updated';

export function loadUserServiceFeedback(): ServiceFeedbackEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is ServiceFeedbackEntry =>
        Boolean(item) &&
        typeof item.id === 'string' &&
        typeof item.serviceId === 'string' &&
        typeof item.rating === 'number' &&
        item.rating >= 1 &&
        item.rating <= 5
    );
  } catch {
    return [];
  }
}

export function addUserServiceFeedback(input: {
  serviceId: string;
  rating: number;
  author: string;
  comment: string;
}): ServiceFeedbackEntry[] {
  if (typeof window === 'undefined') return [];
  const clampedRating = Math.min(5, Math.max(1, Math.round(input.rating)));
  const current = loadUserServiceFeedback();
  const nextEntry: ServiceFeedbackEntry = {
    id: `sf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    serviceId: input.serviceId,
    rating: clampedRating,
    author: input.author.trim() || 'Verified Studio Guest',
    comment: input.comment.trim(),
    createdAt: new Date().toISOString(),
  };

  const next = [nextEntry, ...current].slice(0, 100);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(SERVICE_FEEDBACK_UPDATED_EVENT));
  } catch {
    // Ignore storage quota errors cleanly
  }
  return next;
}

export function deleteUserServiceFeedback(feedbackId: string): ServiceFeedbackEntry[] {
  if (typeof window === 'undefined') return [];
  const current = loadUserServiceFeedback();
  const next = current.filter((item) => item.id !== feedbackId);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(SERVICE_FEEDBACK_UPDATED_EVENT));
  } catch {
    // Ignore
  }
  return next;
}

function mapConfigReviewToServiceId(
  review: ReviewItemConfig,
  services: ServiceItemConfig[]
): string | null {
  const serviceText = (review.service || '').toLowerCase();
  const quoteText = (review.quote || '').toLowerCase();
  const combined = `${serviceText} ${quoteText}`;

  const directMatch = services.find(
    (s) =>
      serviceText.includes(s.title.toLowerCase()) ||
      s.id.toLowerCase() === serviceText.replace(/\s+/g, '-')
  );
  if (directMatch) return directMatch.id;

  if (/(balayage|colour|color|gloss|highlight)/.test(combined)) {
    return services.find((s) => s.id === 'hair-colour')?.id || null;
  }
  if (/(cut|blowout|style|styling)/.test(combined)) {
    return services.find((s) => s.id === 'hair-styling')?.id || null;
  }
  if (/(facial|skin|glow|barrier|hydra)/.test(combined)) {
    return services.find((s) => s.id === 'skin-care')?.id || null;
  }
  if (/(bridal|wedding|makeup|make-up)/.test(combined)) {
    return services.find((s) => s.id === 'bridal')?.id || null;
  }
  if (/(nail|manicure|pedicure|gel)/.test(combined)) {
    return services.find((s) => s.id === 'nail-studio')?.id || null;
  }
  if (/(spa|massage|aromatherapy)/.test(combined)) {
    return services.find((s) => s.id === 'spa')?.id || null;
  }
  return null;
}

export function getFeedbackForService(
  serviceId: string,
  userFeedback: ServiceFeedbackEntry[],
  configuredReviews: ReviewItemConfig[],
  allServices: ServiceItemConfig[]
): ServiceFeedbackEntry[] {
  const userEntries = userFeedback.filter((entry) => entry.serviceId === serviceId);

  const mappedConfigEntries: ServiceFeedbackEntry[] = configuredReviews
    .filter((rev) => mapConfigReviewToServiceId(rev, allServices) === serviceId)
    .map((rev) => ({
      id: `cfg-${rev.id}`,
      serviceId,
      rating: Math.min(5, Math.max(1, Math.round(rev.rating || 5))),
      author: rev.author,
      comment: rev.quote,
      location: rev.location,
      createdAt: '',
      isConfiguredReview: true,
    }));

  return [...userEntries, ...mappedConfigEntries];
}

export function summarizeServiceRatings(entries: ServiceFeedbackEntry[]): ServiceRatingSummary {
  const distribution: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  if (entries.length === 0) {
    return { averageRating: 0, totalCount: 0, distribution };
  }

  let totalScore = 0;
  for (const entry of entries) {
    const star = Math.min(5, Math.max(1, Math.round(entry.rating))) as 1 | 2 | 3 | 4 | 5;
    distribution[star] += 1;
    totalScore += star;
  }

  return {
    averageRating: Math.round((totalScore / entries.length) * 10) / 10,
    totalCount: entries.length,
    distribution,
  };
}
