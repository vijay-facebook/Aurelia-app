import React, { useState } from 'react';
import { X, CheckCircle2, ArrowRight, Clock } from 'lucide-react';
import { SERVICES, MENU_ITEMS } from '../data/aureliaData';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedTitle?: string;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, preselectedTitle }) => {
  if (!isOpen) return null;

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState(preselectedTitle || 'Signature Cut & Finish (₹2,400)');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('04:30 PM');
  const [submitted, setSubmitted] = useState(false);

  const availableTimeSlots = ['10:30 AM', '11:30 AM', '01:00 PM', '02:30 PM', '04:30 PM', '05:30 PM', '07:00 PM'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;
    setSubmitted(true);
  };

  const whatsappMsg = encodeURIComponent(
    `Hello Aurelia Studio! Requesting appointment:\nName: ${fullName}\nPhone: ${phone}\nService: ${service}\nDate: ${date || 'Today'}\nTime Slot: ${timeSlot}`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D1612]/70 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#F6F1EA] rounded-[12px] border border-[#D8C8B4] max-w-lg w-full p-6 sm:p-8 shadow-2xl relative">
        
        {/* Close */}
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
                We will confirm your appointment for <span className="font-medium text-[#1D1612]">{service}</span> on <span className="font-medium text-[#1D1612]">{date || 'your preferred date'}</span> at <span className="font-mono text-[#8C6A43] font-medium">{timeSlot}</span> via WhatsApp within the hour.
              </p>
            </div>

            <a
              href={`https://wa.me/919820000000?text=${whatsappMsg}`}
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
                Book <span className="italic text-[#8C6A43]">Aurelia Studio</span>
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
                  placeholder="e.g. +91 98200 12345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#EFE6DA] text-[#1D1612] p-3 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium block">
                    Service
                  </label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full bg-[#EFE6DA] text-[#1D1612] p-3 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43] cursor-pointer"
                  >
                    {SERVICES.map((s) => (
                      <option key={s.id} value={`${s.title} (${s.price})`}>
                        {s.title} ({s.price})
                      </option>
                    ))}
                    {MENU_ITEMS.map((m) => (
                      <option key={m.id} value={`${m.title} (${m.price})`}>
                        {m.title} ({m.price})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium block">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-[#EFE6DA] text-[#1D1612] p-3 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43] cursor-pointer"
                  />
                </div>
              </div>

              {/* Time Slot Selection Grid */}
              <div className="space-y-2 pt-1">
                <label className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Time Slot</span>
                </label>

                <div className="flex flex-wrap gap-1.5 bg-[#EFE6DA] p-2.5 rounded-[6px] border border-[#D8C8B4]">
                  {availableTimeSlots.map((slot) => {
                    const isSelected = timeSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setTimeSlot(slot)}
                        className={`px-2.5 py-1 rounded-[4px] text-[11px] font-mono transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#1D1612] text-[#F6F1EA] font-semibold'
                            : 'bg-[#F6F1EA] text-[#1D1612] hover:bg-[#D8C8B4]/40 border border-[#D8C8B4]'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] py-3.5 rounded-full uppercase tracking-widest text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md mt-2"
              >
                <span>Request Appointment</span>
                <ArrowRight className="w-4 h-4 text-[#D9B98F]" />
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
