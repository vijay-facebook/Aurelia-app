import React, { useEffect, useMemo, useState } from 'react';
import { Video, ExternalLink, X, CheckCircle2, ArrowRight } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import {
  BookingPaymentQR,
  PaymentMode,
  PaymentStatus,
  calculateEstimatedBookingTotal,
  createBookingReference,
} from './BookingPaymentQR';
import {
  BookingHistoryEntry,
  HISTORY_UPDATED_EVENT,
  loadBookingHistory,
  recordBookingHistory,
} from '../utils/bookingHistory';
import { LoyaltyPointsTracker } from './LoyaltyPointsTracker';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTitle?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, preselectedTitle }) => {
  const { config } = useConfig();
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState<string[]>(preselectedTitle ? [preselectedTitle] : (config?.menu?.items?.[0]?.title ? [`${config.menu.items[0].title} (${config.menu.items[0].price})`] : ['Signature Service']));
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState(config?.booking?.timeSlots?.[0] || '10:30 AM');
  const [submitted, setSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('deposit');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [appliedRewardLabel, setAppliedRewardLabel] = useState<string | null>(null);
  const [meetAppointments, setMeetAppointments] = useState<BookingHistoryEntry[]>(() =>
    loadBookingHistory().filter((item) => Boolean(item.meetUrl))
  );

  useEffect(() => {
    const sync = () => {
      setMeetAppointments(loadBookingHistory().filter((item) => Boolean(item.meetUrl)));
    };
    window.addEventListener(HISTORY_UPDATED_EVENT, sync);
    return () => window.removeEventListener(HISTORY_UPDATED_EVENT, sync);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setSubmitted(false);
    setPaymentMode('deposit');
    setPaymentStatus('pending');
    setAppliedRewardLabel(null);
    if (preselectedTitle) {
      setService([preselectedTitle]);
    } else if (config?.menu?.items?.[0]?.title) {
      setService([`${config.menu.items[0].title} (${config.menu.items[0].price})`]);
    } else {
      setService(['Signature Service']);
    }
  }, [isOpen, preselectedTitle, config?.menu?.items]);

  const estimatedTotal = useMemo(
    () => calculateEstimatedBookingTotal(service, config),
    [service, config]
  );

  if (!isOpen) return null;

  const menuOptionValues = new Set(
    (config?.menu?.items || []).map((item) => `${item.title} (${item.price})`)
  );
  const customSelectedServices = service.filter((s) => !menuOptionValues.has(s));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone || service.length === 0) return;
    const generatedRef = createBookingReference(config.brand.name);
    setBookingRef(generatedRef);
    setPaymentMode(estimatedTotal > 0 ? 'deposit' : 'open');
    setPaymentStatus('pending');
    recordBookingHistory({
      services: service,
      date,
      timeSlot,
      customerName: fullName.trim(),
      bookingRef: generatedRef,
    });
    setSubmitted(true);
  };

  const baseWhatsappText = config.booking.whatsappTemplate
    ? config.booking.whatsappTemplate
        .replace('{service}', service.join(', '))
        .replace('{date}', date || 'Today')
        .replace('{time}', timeSlot)
        .replace('{name}', fullName)
        .replace('{phone}', phone)
    : `Hello ${config.brand.name} Studio! Requesting appointment:\nName: ${fullName}\nPhone: ${phone}\nServices: ${service.join(', ')}\nDate: ${date || 'Today'}\nTime Slot: ${timeSlot}`;

  const paymentSummarySuffix = bookingRef
    ? `\nBooking Ref: ${bookingRef}${
        paymentStatus === 'paid'
          ? ' (Contactless QR Payment Completed)'
          : paymentStatus === 'pay-at-studio'
            ? ' (Pay at Studio)'
            : ''
      }`
    : '';

  const rewardSuffix = appliedRewardLabel
    ? `\nLoyalty Reward Redeemed: ${appliedRewardLabel}`
    : '';

  const whatsappMsg = encodeURIComponent(`${baseWhatsappText}${paymentSummarySuffix}${rewardSuffix}`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D1612]/70 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#F6F1EA] rounded-[12px] border border-[#D8C8B4] max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
        
        <button
          onClick={onClose}
          className="sticky sm:absolute top-0 sm:top-4 float-right sm:float-none right-0 sm:right-4 z-10 p-2 text-[#1D1612] hover:text-[#8C6A43] bg-[#EFE6DA] rounded-full transition-colors cursor-pointer"
          aria-label="Close booking modal"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-4 space-y-5">
            <div className="w-12 h-12 bg-[#8C6A43]/20 text-[#8C6A43] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-serif text-2xl font-light text-[#1D1612]">
                Booking Confirmed
              </h3>
              <p className="text-xs text-[#6F5F51]">
                {config.booking.successMessage || 'We will confirm your appointment shortly.'}
              </p>
            </div>

            <LoyaltyPointsTracker
              variant="light"
              justEarnedPoints={config.booking.pointsPerAppointment ?? 100}
              rewardApplied={Boolean(appliedRewardLabel)}
              onApplyReward={(label) => setAppliedRewardLabel(label)}
            />

            <BookingPaymentQR
              customerName={fullName}
              services={service}
              date={date}
              timeSlot={timeSlot}
              bookingRef={bookingRef}
              estimatedTotal={estimatedTotal}
              paymentMode={paymentMode}
              paymentStatus={paymentStatus}
              onPaymentModeChange={setPaymentMode}
              onPaymentStatusChange={setPaymentStatus}
              variant="light"
            />

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1">
              <a
                href={`https://wa.me/${config.booking.whatsappNumber || config.businessInfo.whatsappNumber}?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#1D1612] text-[#F6F1EA] px-6 py-3 rounded-full text-xs font-medium uppercase tracking-wider hover:bg-[#8C6A43] transition-colors"
              >
                <span>Confirm on WhatsApp ↗</span>
              </a>
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3 rounded-full text-xs font-medium uppercase tracking-wider border border-[#D8C8B4] text-[#6F5F51] hover:text-[#1D1612] hover:border-[#8C6A43] transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                setTimeout(() => {
                  document.getElementById('virtual-consultations')?.scrollIntoView({ behavior: 'smooth' });
                }, 120);
              }}
              className="text-[11px] uppercase tracking-wider text-[#8C6A43] hover:text-[#1D1612] underline underline-offset-4 cursor-pointer"
            >
              Need a pre-visit video chat? Host Virtual Consultation via Google Meet
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#8C6A43] font-medium block">
                Direct Reservation
              </span>
              <h3 className="font-serif text-3xl font-light text-[#1D1612]">
                Book <span className="italic text-[#8C6A43]">{config.brand.name} Studio</span>
              </h3>
            </div>

            <LoyaltyPointsTracker
              variant="light"
              rewardApplied={Boolean(appliedRewardLabel)}
              onApplyReward={(label) => setAppliedRewardLabel(label)}
            />

            {meetAppointments.length > 0 && (
              <div className="bg-[#EFE6DA] border border-[#D8C8B4] rounded-[10px] p-3.5 space-y-2 text-xs">
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#8C6A43] font-semibold">
                  <Video className="w-3.5 h-3.5" />
                  <span>Scheduled Google Meet Consultations</span>
                </div>
                <div className="space-y-1.5">
                  {meetAppointments.slice(0, 3).map((appt) => (
                    <div
                      key={appt.id}
                      className="flex items-center justify-between gap-2 bg-[#F6F1EA] border border-[#D8C8B4]/70 rounded-[6px] px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-[#1D1612] truncate">
                          {appt.customerName || appt.bookingRef || 'Consultation'} · {appt.services.join(', ')}
                        </p>
                        <p className="text-[10px] text-[#6F5F51] font-mono tabular-nums">
                          {[appt.date || 'Upcoming', appt.timeSlot].filter(Boolean).join(' • ')}
                        </p>
                      </div>
                      <a
                        href={appt.meetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-medium shrink-0"
                      >
                        <span>Join</span>
                        <ExternalLink className="w-3 h-3 text-[#D9B98F]" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium block">
                  Full Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Sanya Malhotra"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-[#EFE6DA] text-[#1D1612] p-3 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium block">
                  Phone Number *
                </label>
                <input
                  required
                  type="tel"
                  placeholder="+91 98200 00000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#EFE6DA] text-[#1D1612] p-3 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium block">
                  Service / Package (Select multiple)
                </label>
                <select
                  multiple
                  required
                  value={service}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setService(selected);
                  }}
                  className="w-full bg-[#EFE6DA] text-[#1D1612] p-3 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43] h-32"
                >
                  {customSelectedServices.length > 0 && (
                    <optgroup label="Selected Service">
                      {customSelectedServices.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {config?.menu?.categories?.map((cat) => (
                    <optgroup key={cat} label={cat}>
                      {config.menu.items
                        .filter((item) => item.category === cat)
                        .map((item) => (
                          <option key={item.id} value={`${item.title} (${item.price})`}>
                            {item.title} - {item.price}
                          </option>
                        ))}
                    </optgroup>
                  ))}
                  {/* Uncategorized items */}
                  {config?.menu?.items
                    ?.filter((item) => !config?.menu?.categories?.includes(item.category))
                    .map((item) => (
                      <option key={item.id} value={`${item.title} (${item.price})`}>
                        {item.title} - {item.price}
                      </option>
                    ))}
                  {(!config?.menu?.items || config.menu.items.length === 0) && customSelectedServices.length === 0 && (
                    <option value="Signature Service">Signature Service</option>
                  )}
                </select>
                {service.length > 0 && (
                  <p className="text-[11px] text-[#6F5F51] pt-1">
                    Selected: <span className="font-medium text-[#1D1612]">{service.join(', ')}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium block">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#EFE6DA] text-[#1D1612] p-3 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium block">
                    Time Slot
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-[#EFE6DA] text-[#1D1612] p-3 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                  >
                    {config.booking.timeSlots?.map((slot, i) => (
                      <option key={i} value={slot}>{slot}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] py-3.5 rounded-[6px] text-xs uppercase tracking-widest font-medium transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer pt-3"
              >
                <span>Request Appointment</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D9B98F]" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
