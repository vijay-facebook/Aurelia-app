import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, Copy, Check, Download, ShieldCheck, Smartphone, CheckCircle2, Clock } from 'lucide-react';
import { SiteConfig } from '../config/types';
import { useConfig } from '../context/ConfigContext';

export type PaymentMode = 'full' | 'deposit' | 'open';
export type PaymentStatus = 'pending' | 'paid' | 'pay-at-studio';

interface BookingPaymentQRProps {
  customerName: string;
  services: string[];
  date?: string;
  timeSlot: string;
  bookingRef: string;
  estimatedTotal: number;
  paymentMode: PaymentMode;
  paymentStatus: PaymentStatus;
  onPaymentModeChange: (mode: PaymentMode) => void;
  onPaymentStatusChange: (status: PaymentStatus) => void;
  variant?: 'light' | 'dark';
}

export function createBookingReference(brandName: string): string {
  const prefix = (brandName || 'STUDIO')
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, 3)
    .padEnd(3, 'X');
  const randomCode = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${randomCode}`;
}

export function calculateEstimatedBookingTotal(services: string[], config: SiteConfig): number {
  let total = 0;

  for (const rawLabel of services) {
    const label = rawLabel.trim();
    if (!label) continue;

    const menuMatch = config.menu?.items?.find(
      (item) =>
        `${item.title} (${item.price})`.toLowerCase() === label.toLowerCase() ||
        item.title.toLowerCase() === label.toLowerCase()
    );
    if (menuMatch?.numericPrice) {
      total += menuMatch.numericPrice;
      continue;
    }

    const serviceMatch = config.services?.find(
      (s) =>
        `${s.title} (${s.price})`.toLowerCase() === label.toLowerCase() ||
        s.title.toLowerCase() === label.toLowerCase()
    );
    if (serviceMatch?.numericPrice) {
      total += serviceMatch.numericPrice;
      continue;
    }

    const homeMatch = config.homeServices?.find(
      (h) =>
        `${h.title} (${h.price})`.toLowerCase() === label.toLowerCase() ||
        h.title.toLowerCase() === label.toLowerCase()
    );
    if (homeMatch?.numericPrice) {
      total += homeMatch.numericPrice;
      continue;
    }

    const priceMatch = label.match(/[₹$€£]\s*([\d,]+(?:\.\d+)?)/);
    if (priceMatch?.[1]) {
      const parsed = Number(priceMatch[1].replace(/,/g, ''));
      if (Number.isFinite(parsed) && parsed > 0) {
        total += parsed;
      }
    }
  }

  return Math.round(total);
}

export const BookingPaymentQR: React.FC<BookingPaymentQRProps> = ({
  customerName,
  services,
  date,
  timeSlot,
  bookingRef,
  estimatedTotal,
  paymentMode,
  paymentStatus,
  onPaymentModeChange,
  onPaymentStatusChange,
  variant = 'light',
}) => {
  const { config } = useConfig();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  const acceptPayment = config.booking.acceptContactlessPayment !== false;

  const currencySymbol = config.brand.currencySymbol || '₹';
  const currencyCode =
    currencySymbol === '$' ? 'USD' : currencySymbol === '€' ? 'EUR' : currencySymbol === '£' ? 'GBP' : 'INR';

  const shopSlug = (config.brand.customSlug || config.brand.name || 'studio')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');

  const shopUpiId = (config.booking.upiId || '').trim() || `${shopSlug || 'studio'}@upi`;
  const shopPayeeName = (config.booking.payeeName || '').trim() || `${config.brand.name} Studio`;
  const paymentNote =
    (config.booking.paymentNote || '').trim() ||
    'Scan with any UPI app for contactless deposit or studio checkout.';

  const payableAmount = useMemo(() => {
    if (estimatedTotal <= 0 || paymentMode === 'open') return 0;
    if (paymentMode === 'deposit') return Math.max(1, Math.round(estimatedTotal * 0.25));
    return estimatedTotal;
  }, [estimatedTotal, paymentMode]);

  const paymentUri = useMemo(() => {
    const params = new URLSearchParams();
    params.set('pa', shopUpiId);
    params.set('pn', shopPayeeName);
    params.set('tr', bookingRef);
    const serviceSummary = services.length > 0 ? services[0].split('(')[0].trim() : 'Appointment';
    const noteText = `${bookingRef} ${serviceSummary}${date ? ` ${date}` : ''} ${timeSlot}`.slice(0, 60);
    params.set('tn', noteText);
    params.set('cu', currencyCode);
    if (payableAmount > 0) {
      params.set('am', payableAmount.toFixed(2));
    }
    return `upi://pay?${params.toString()}`;
  }, [shopUpiId, shopPayeeName, bookingRef, services, date, timeSlot, currencyCode, payableAmount]);

  useEffect(() => {
    if (!acceptPayment) return;
    let cancelled = false;
    QRCode.toDataURL(paymentUri, {
      width: 280,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#1D1612',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });

    return () => {
      cancelled = true;
    };
  }, [paymentUri, acceptPayment]);

  if (!acceptPayment) return null;

  const isDark = variant === 'dark';

  const handleCopyUpi = () => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(shopUpiId).catch(() => {});
    }
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const formattedAmount = (amount: number) => `${currencySymbol}${amount.toLocaleString('en-IN')}`;

  return (
    <div
      className={`rounded-[12px] border p-4 sm:p-5 text-left space-y-4 ${
        isDark
          ? 'bg-[#15100D] border-[#D8C8B4]/25 text-[#F6F1EA]'
          : 'bg-[#EFE6DA]/80 border-[#D8C8B4] text-[#1D1612]'
      }`}
    >
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#D8C8B4]/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#8C6A43]/20 text-[#8C6A43] flex items-center justify-center shrink-0">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#8C6A43] font-medium">
              Contactless Payment
            </p>
            <h4 className={`font-serif text-base font-medium ${isDark ? 'text-[#F6F1EA]' : 'text-[#1D1612]'}`}>
              {shopPayeeName}
            </h4>
          </div>
        </div>
        <span
          className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${
            isDark
              ? 'bg-[#2A211B] border-[#D8C8B4]/25 text-[#D9B98F]'
              : 'bg-[#F6F1EA] border-[#D8C8B4] text-[#6F5F51]'
          }`}
        >
          Ref: {bookingRef}
        </span>
      </div>

      {/* Payment Mode Selector */}
      {estimatedTotal > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className={isDark ? 'text-[#E3D7C7]/75' : 'text-[#6F5F51]'}>
              Estimated Service Total: <strong className={isDark ? 'text-[#F6F1EA]' : 'text-[#1D1612]'}>{formattedAmount(estimatedTotal)}</strong>
            </span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                { id: 'deposit', label: `25% Deposit`, sub: formattedAmount(Math.max(1, Math.round(estimatedTotal * 0.25))) },
                { id: 'full', label: `Full Amount`, sub: formattedAmount(estimatedTotal) },
                { id: 'open', label: `Custom`, sub: 'Enter in App' },
              ] as { id: PaymentMode; label: string; sub: string }[]
            ).map((opt) => {
              const active = paymentMode === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    onPaymentModeChange(opt.id);
                    if (paymentStatus === 'paid') onPaymentStatusChange('pending');
                  }}
                  className={`px-2 py-2 rounded-[8px] border text-center transition-all cursor-pointer ${
                    active
                      ? isDark
                        ? 'bg-[#D9B98F] border-[#D9B98F] text-[#1D1612]'
                        : 'bg-[#1D1612] border-[#1D1612] text-[#F6F1EA]'
                      : isDark
                        ? 'bg-[#2A211B] border-[#3A2F27] text-[#E3D7C7] hover:border-[#D9B98F]/60'
                        : 'bg-[#F6F1EA] border-[#D8C8B4] text-[#1D1612] hover:border-[#8C6A43]'
                  }`}
                >
                  <div className="text-[10px] font-medium uppercase tracking-wider">{opt.label}</div>
                  <div className={`text-[11px] font-semibold mt-0.5 ${active ? '' : 'text-[#8C6A43]'}`}>
                    {opt.sub}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* QR + Shop Details */}
      <div className="grid sm:grid-cols-[auto_1fr] gap-4 items-center">
        {/* Crisp High-Contrast QR Frame */}
        <div className="mx-auto sm:mx-0 bg-white p-3 rounded-[10px] border border-[#D8C8B4] shadow-sm flex flex-col items-center">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt={`Contactless Payment QR for ${shopPayeeName}`}
              className="w-36 h-36 sm:w-40 sm:h-40 object-contain"
            />
          ) : (
            <div className="w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center bg-[#F6F1EA] text-[#6F5F51] text-xs">
              Generating QR…
            </div>
          )}
          <span className="mt-1.5 text-[9px] font-mono uppercase tracking-widest text-[#1D1612]/70">
            {payableAmount > 0 ? `Pay ${formattedAmount(payableAmount)}` : 'Scan & Enter Amount'}
          </span>
        </div>

        {/* Payment Summary & Actions */}
        <div className="space-y-3 min-w-0">
          <div className="space-y-1">
            <p className={`text-xs leading-relaxed ${isDark ? 'text-[#E3D7C7]/85' : 'text-[#6F5F51]'}`}>
              {paymentNote}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] pt-1">
              <span className={isDark ? 'text-[#E3D7C7]/70' : 'text-[#6F5F51]'}>Shop ID:</span>
              <code
                className={`px-2 py-0.5 rounded font-mono text-[11px] truncate max-w-full ${
                  isDark ? 'bg-[#2A211B] text-[#D9B98F]' : 'bg-[#F6F1EA] text-[#1D1612]'
                }`}
              >
                {shopUpiId}
              </code>
            </div>
            <p className={`text-[11px] ${isDark ? 'text-[#E3D7C7]/70' : 'text-[#6F5F51]'}`}>
              Guest: <span className={isDark ? 'text-[#F6F1EA]' : 'text-[#1D1612]'}>{customerName || 'Guest'}</span> · {timeSlot}
              {date ? ` · ${date}` : ''}
            </p>
          </div>

          {/* Utility Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopyUpi}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] border text-[11px] font-medium transition-colors cursor-pointer ${
                isDark
                  ? 'bg-[#2A211B] border-[#3A2F27] text-[#F6F1EA] hover:border-[#D9B98F]'
                  : 'bg-[#F6F1EA] border-[#D8C8B4] text-[#1D1612] hover:border-[#8C6A43]'
              }`}
            >
              {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-[#8C6A43]" />}
              <span>{copiedUpi ? 'UPI ID Copied' : 'Copy UPI ID'}</span>
            </button>

            {qrDataUrl && (
              <a
                href={qrDataUrl}
                download={`${shopSlug || 'studio'}-payment-qr-${bookingRef}.png`}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] border text-[11px] font-medium transition-colors ${
                  isDark
                    ? 'bg-[#2A211B] border-[#3A2F27] text-[#F6F1EA] hover:border-[#D9B98F]'
                    : 'bg-[#F6F1EA] border-[#D8C8B4] text-[#1D1612] hover:border-[#8C6A43]'
                }`}
              >
                <Download className="w-3.5 h-3.5 text-[#8C6A43]" />
                <span>Save QR</span>
              </a>
            )}

            <a
              href={paymentUri}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] border text-[11px] font-medium transition-colors ${
                isDark
                  ? 'bg-[#2A211B] border-[#3A2F27] text-[#D9B98F] hover:border-[#D9B98F]'
                  : 'bg-[#F6F1EA] border-[#D8C8B4] text-[#8C6A43] hover:border-[#8C6A43]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Open UPI App</span>
            </a>
          </div>
        </div>
      </div>

      {/* Contactless Status Confirmation */}
      <div className="pt-2 border-t border-[#D8C8B4]/30 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#8C6A43] shrink-0" />
          <span className={isDark ? 'text-[#E3D7C7]/80' : 'text-[#6F5F51]'}>
            {paymentStatus === 'paid'
              ? 'Payment marked complete — include Ref in WhatsApp below.'
              : paymentStatus === 'pay-at-studio'
                ? 'Pay at studio reception after your session.'
                : 'Scan above or pay at studio.'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPaymentStatusChange('paid')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider border transition-colors cursor-pointer ${
              paymentStatus === 'paid'
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : isDark
                  ? 'bg-[#2A211B] border-[#3A2F27] text-[#E3D7C7] hover:border-emerald-500'
                  : 'bg-[#F6F1EA] border-[#D8C8B4] text-[#1D1612] hover:border-emerald-600'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>{paymentStatus === 'paid' ? 'Paid' : "I've Paid"}</span>
          </button>

          <button
            type="button"
            onClick={() => onPaymentStatusChange('pay-at-studio')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider border transition-colors cursor-pointer ${
              paymentStatus === 'pay-at-studio'
                ? 'bg-[#8C6A43] border-[#8C6A43] text-white'
                : isDark
                  ? 'bg-[#2A211B] border-[#3A2F27] text-[#E3D7C7] hover:border-[#D9B98F]'
                  : 'bg-[#F6F1EA] border-[#D8C8B4] text-[#6F5F51] hover:border-[#8C6A43]'
            }`}
          >
            <Clock className="w-3 h-3" />
            <span>Pay Later</span>
          </button>
        </div>
      </div>
    </div>
  );
};
