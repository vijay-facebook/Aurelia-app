import React, { useMemo, useState } from 'react';
import { CalendarPlus, Download, Check, ExternalLink } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import {
  CalendarConsultationInput,
  buildGoogleCalendarUrl,
  downloadConsultationIcs,
} from '../utils/calendarExport';

interface AddToCalendarActionsProps {
  event: CalendarConsultationInput;
  variant?: 'light' | 'dark';
  compact?: boolean;
}

export const AddToCalendarActions: React.FC<AddToCalendarActionsProps> = ({
  event,
  variant = 'light',
  compact = false,
}) => {
  const { config } = useConfig();
  const [downloaded, setDownloaded] = useState(false);

  const enrichedEvent = useMemo<CalendarConsultationInput>(() => {
    const address = [
      ...(config.businessInfo.addressLines || []),
      config.businessInfo.city,
      config.businessInfo.pincode,
    ]
      .filter(Boolean)
      .join(', ');

    return {
      ...event,
      studioName: event.studioName || config.brand.name,
      studioAddress: event.studioAddress || address,
      studioPhone: event.studioPhone || config.businessInfo.phone,
    };
  }, [event, config]);

  const googleCalendarHref = useMemo(
    () => buildGoogleCalendarUrl(enrichedEvent),
    [enrichedEvent]
  );

  const handleDownloadIcs = () => {
    downloadConsultationIcs(enrichedEvent);
    setDownloaded(true);
    window.setTimeout(() => setDownloaded(false), 2500);
  };

  const isDark = variant === 'dark';

  return (
    <div
      className={`flex flex-wrap items-center ${
        compact ? 'gap-2' : 'justify-center gap-2.5'
      }`}
    >
      <a
        href={googleCalendarHref}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 rounded-full font-medium uppercase tracking-wider transition-colors ${
          compact ? 'px-3 py-1.5 text-[10px]' : 'px-4 py-2 text-[11px]'
        } ${
          isDark
            ? 'bg-[#2A211B] hover:bg-[#3A2F27] text-[#D9B98F] border border-[#D8C8B4]/30'
            : 'bg-[#F6F1EA] hover:bg-white text-[#1D1612] border border-[#D8C8B4]'
        }`}
      >
        <CalendarPlus className="w-3.5 h-3.5 text-[#8C6A43]" />
        <span>Add to Google Calendar</span>
        <ExternalLink className="w-3 h-3 opacity-70" />
      </a>

      <button
        type="button"
        onClick={handleDownloadIcs}
        className={`inline-flex items-center gap-1.5 rounded-full font-medium uppercase tracking-wider transition-colors cursor-pointer ${
          compact ? 'px-3 py-1.5 text-[10px]' : 'px-4 py-2 text-[11px]'
        } ${
          isDark
            ? 'bg-[#15100D] hover:bg-[#2A211B] text-[#E3D7C7] border border-[#D8C8B4]/25'
            : 'bg-[#EFE6DA] hover:bg-[#E3D7C7] text-[#1D1612] border border-[#D8C8B4]'
        }`}
      >
        {downloaded ? (
          <>
            <Check className="w-3.5 h-3.5 text-[#8C6A43]" />
            <span>Saved .ics</span>
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5 text-[#8C6A43]" />
            <span>Download .ics</span>
          </>
        )}
      </button>
    </div>
  );
};
