export interface CalendarConsultationInput {
  title?: string;
  services?: string[];
  date?: string;
  timeSlot?: string;
  durationMinutes?: number;
  customerName?: string;
  bookingRef?: string;
  stylist?: string;
  meetUrl?: string;
  studioName?: string;
  studioAddress?: string;
  studioPhone?: string;
  notes?: string;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function formatUtcIcsTimestamp(date: Date): string {
  return (
    `${date.getUTCFullYear()}` +
    `${pad2(date.getUTCMonth() + 1)}` +
    `${pad2(date.getUTCDate())}T` +
    `${pad2(date.getUTCHours())}` +
    `${pad2(date.getUTCMinutes())}` +
    `${pad2(date.getUTCSeconds())}Z`
  );
}

function parseTimeSlot(timeSlot?: string): { hours: number; minutes: number } {
  if (!timeSlot || !timeSlot.trim()) {
    return { hours: 10, minutes: 30 };
  }
  const clean = timeSlot.trim();

  // Match 12-hour format e.g. "10:30 AM" or "2:00 PM"
  const match12 = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    let hours = Number(match12[1]);
    const minutes = Math.min(59, Math.max(0, Number(match12[2])));
    const meridiem = match12[3].toUpperCase();
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return { hours: Math.min(23, Math.max(0, hours)), minutes };
  }

  // Match 24-hour format e.g. "14:30"
  const match24 = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (match24) {
    return {
      hours: Math.min(23, Math.max(0, Number(match24[1]))),
      minutes: Math.min(59, Math.max(0, Number(match24[2]))),
    };
  }

  return { hours: 10, minutes: 30 };
}

export function resolveConsultationWindow(
  dateStr?: string,
  timeSlot?: string,
  durationMinutes = 60
): { start: Date; end: Date; utcStart: string; utcEnd: string } {
  const { hours, minutes } = parseTimeSlot(timeSlot);
  let start: Date;

  if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
    const [y, m, d] = dateStr.trim().split('-').map(Number);
    start = new Date(y, m - 1, d, hours, minutes, 0, 0);
  } else {
    const now = new Date();
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hours, minutes, 0, 0);
  }

  if (Number.isNaN(start.getTime())) {
    const fallback = new Date();
    fallback.setDate(fallback.getDate() + 1);
    fallback.setHours(10, 30, 0, 0);
    start = fallback;
  }

  const end = new Date(start.getTime() + Math.max(15, durationMinutes) * 60_000);
  return {
    start,
    end,
    utcStart: formatUtcIcsTimestamp(start),
    utcEnd: formatUtcIcsTimestamp(end),
  };
}

function buildEventSummary(input: CalendarConsultationInput): string {
  const studio = input.studioName?.trim() || 'Aurelia Studio';
  if (input.title?.trim()) return `${input.title.trim()} — ${studio}`;
  const serviceSummary = input.services?.filter(Boolean).join(', ');
  if (serviceSummary) return `${studio}: ${serviceSummary}`;
  return `${studio} Consultation`;
}

function buildEventDescription(input: CalendarConsultationInput): string {
  const lines: string[] = [];
  if (input.bookingRef) lines.push(`Booking Reference: ${input.bookingRef}`);
  if (input.customerName) lines.push(`Guest: ${input.customerName}`);
  if (input.services && input.services.length > 0) {
    lines.push(`Booked Services: ${input.services.join(', ')}`);
  }
  if (input.stylist) lines.push(`Specialist: ${input.stylist}`);
  if (input.meetUrl) {
    lines.push(`Google Meet Video Link: ${input.meetUrl}`);
  }
  if (input.studioPhone) lines.push(`Studio Contact: ${input.studioPhone}`);
  if (input.notes) lines.push(`Notes: ${input.notes}`);
  return lines.join('\n');
}

function buildEventLocation(input: CalendarConsultationInput): string {
  if (input.meetUrl) {
    return input.studioAddress
      ? `Google Meet (${input.meetUrl}) / ${input.studioAddress}`
      : `Google Meet: ${input.meetUrl}`;
  }
  return input.studioAddress || input.studioName || 'Studio Appointment';
}

function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

function foldIcsLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  let idx = 0;
  parts.push(line.slice(0, 75));
  idx = 75;
  while (idx < line.length) {
    parts.push(' ' + line.slice(idx, idx + 74));
    idx += 74;
  }
  return parts.join('\r\n');
}

export function buildIcsContent(input: CalendarConsultationInput): string {
  const { utcStart, utcEnd } = resolveConsultationWindow(
    input.date,
    input.timeSlot,
    input.durationMinutes ?? (input.meetUrl ? 45 : 60)
  );
  const stamp = formatUtcIcsTimestamp(new Date());
  const uidBase = (input.bookingRef || `consult-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '');
  const uid = `${uidBase}@aureliastudio.app`;
  const summary = buildEventSummary(input);
  const description = buildEventDescription(input);
  const location = buildEventLocation(input);

  const rawLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Aurelia Studio//Booking Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${utcStart}`,
    `DTEND:${utcEnd}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(location)}`,
    ...(input.meetUrl ? [`URL:${escapeIcsText(input.meetUrl)}`] : []),
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapeIcsText(`Reminder: ${summary}`)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  return rawLines.map(foldIcsLine).join('\r\n') + '\r\n';
}

export function downloadConsultationIcs(
  input: CalendarConsultationInput,
  filename?: string
): void {
  if (typeof window === 'undefined') return;
  const ics = buildIcsContent(input);
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const safeRef = (input.bookingRef || 'consultation')
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, '-');
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${safeRef}-calendar.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function buildGoogleCalendarUrl(input: CalendarConsultationInput): string {
  const { utcStart, utcEnd } = resolveConsultationWindow(
    input.date,
    input.timeSlot,
    input.durationMinutes ?? (input.meetUrl ? 45 : 60)
  );
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: buildEventSummary(input),
    dates: `${utcStart}/${utcEnd}`,
    details: buildEventDescription(input),
    location: buildEventLocation(input),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
