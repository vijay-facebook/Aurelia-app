import React, { useState } from 'react';
import { X, CheckCircle2, ArrowRight } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTitle?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, preselectedTitle }) => {
  const { config } = useConfig();
  
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState(preselectedTitle || config?.menu?.items?.[0]?.title || 'Signature Service');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState(config?.booking?.timeSlots?.[0] || '10:30 AM');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;
    setSubmitted(true);
  };

  const whatsappMsg = encodeURIComponent(
    config.booking.whatsappTemplate
      ? config.booking.whatsappTemplate
          .replace('{service}', service)
          .replace('{date}', date || 'Today')
          .replace('{time}', timeSlot)
          .replace('{name}', fullName)
          .replace('{phone}', phone)
      : `Hello ${config.brand.name} Studio! Requesting appointment:\nName: ${fullName}\nPhone: ${phone}\nService: ${service}\nDate: ${date || 'Today'}\nTime Slot: ${timeSlot}`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D1612]/70 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#F6F1EA] rounded-[12px] border border-[#D8C8B4] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#1D1612] hover:text-[#8C6A43] bg-[#EFE6DA] rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-8 space-y-5">
            <div className="w-14 h-14 bg-[#8C6A43]/20 text-[#8C6A43] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-2xl font-light text-[#1D1612]">
                Appointment Request Logged
              </h3>
              <p className="text-xs text-[#6F5F51]">
                {config.booking.successMessage || 'We will confirm your appointment shortly.'}
              </p>
            </div>

            <a
              href={`https://wa.me/${config.booking.whatsappNumber || config.businessInfo.whatsappNumber}?text=${whatsappMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1D1612] text-[#F6F1EA] px-6 py-3 rounded-full text-xs font-medium uppercase tracking-wider hover:bg-[#8C6A43] transition-colors"
            >
              <span>Confirm on WhatsApp ↗</span>
            </a>
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
                  Service / Package
                </label>
                <input
                  type="text"
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className="w-full bg-[#EFE6DA] text-[#1D1612] p-3 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                />
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
