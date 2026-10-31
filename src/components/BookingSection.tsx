import React, { useState } from 'react';
import { SERVICES, MENU_ITEMS } from '../data/aureliaData';
import { MapPin, Phone, Calendar, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

interface BookingSectionProps {
  preselectedService?: string;
}

export const BookingSection: React.FC<BookingSectionProps> = ({ preselectedService }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    service: preselectedService || 'Signature Cut & Finish (₹2,400)',
    date: '',
    timeSlot: '04:30 PM',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const availableTimeSlots = [
    { label: 'Morning', slots: ['10:30 AM', '11:30 AM'] },
    { label: 'Afternoon', slots: ['01:00 PM', '02:30 PM', '04:30 PM'] },
    { label: 'Evening', slots: ['05:30 PM', '07:00 PM'] },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      alert('Please enter your name and phone number.');
      return;
    }
    setSubmitted(true);
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Aurelia Studio! I would like to request an appointment:\n\nName: ${formData.fullName}\nPhone: ${formData.phone}\nService: ${formData.service}\nPreferred Date: ${formData.date || 'Soonest Available'}\nTime Slot: ${formData.timeSlot}`
  );

  return (
    <section id="reservations" className="bg-[#1D1612] text-[#F6F1EA] py-24 lg:py-32 border-t border-[#D8C8B4]/20 font-sans">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Column: Details */}
        <div className="lg:col-span-5 space-y-8">
          
          <div className="space-y-4">
            <span className="text-[11px] font-sans tracking-[0.3em] uppercase text-[#D9B98F] font-medium block">
              Reservations
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light leading-tight text-[#F6F1EA]">
              Your best look <br />
              <span className="italic font-light text-[#D9B98F]">starts here.</span>
            </h2>
          </div>

          <p className="font-sans text-sm text-[#E3D7C7]/80 font-light leading-relaxed max-w-md">
            Tell us what you'd like and select your preferred date and time slot. We'll confirm your appointment by WhatsApp within the hour.
          </p>

          <div className="space-y-3 pt-4 border-t border-[#F6F1EA]/15 text-xs text-[#E3D7C7]/90 font-light">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-[#D9B98F]" />
              <span>14 Carter Road, Bandra West, Mumbai 400050</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#D9B98F]" />
              <span>+91 98200 00000 · WhatsApp Reservations</span>
            </div>
          </div>

        </div>

        {/* Right Column: Reservation Form */}
        <div className="lg:col-span-7">
          <div className="bg-[#2A211B] p-8 lg:p-10 rounded-[12px] border border-[#D8C8B4]/20 shadow-2xl">
            
            {submitted ? (
              <div className="text-center py-10 space-y-6 animate-fade-in">
                <div className="w-16 h-16 bg-[#D9B98F]/20 text-[#D9B98F] rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-3xl font-light text-[#F6F1EA]">
                    Appointment Requested
                  </h3>
                  <p className="text-xs text-[#E3D7C7]/80 max-w-md mx-auto">
                    Thank you, <span className="font-medium text-[#F6F1EA]">{formData.fullName}</span>. We have logged your request for <span className="text-[#D9B98F] font-medium">{formData.service}</span> on <span className="font-medium text-[#F6F1EA]">{formData.date || 'your preferred date'}</span> at <span className="text-[#D9B98F] font-mono font-medium">{formData.timeSlot}</span>.
                  </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href={`https://wa.me/919820000000?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto bg-[#D9B98F] text-[#1D1612] px-6 py-3 rounded-full text-xs font-medium uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#E3D7C7] transition-colors"
                  >
                    <span>Confirm via WhatsApp ↗</span>
                  </a>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="w-full sm:w-auto border border-[#D8C8B4]/40 text-[#F6F1EA] px-6 py-3 rounded-full text-xs uppercase tracking-wider hover:bg-[#F6F1EA]/10 transition-colors"
                  >
                    Book Another Service
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 text-xs font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#D9B98F] block font-medium">
                      Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Sanya Malhotra"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-[#1D1612] text-[#F6F1EA] p-3.5 rounded-[6px] border border-[#D8C8B4]/20 focus:outline-none focus:border-[#D9B98F] placeholder:text-[#F6F1EA]/30"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#D9B98F] block font-medium">
                      Phone Number *
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="e.g. +91 98200 12345"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#1D1612] text-[#F6F1EA] p-3.5 rounded-[6px] border border-[#D8C8B4]/20 focus:outline-none focus:border-[#D9B98F] placeholder:text-[#F6F1EA]/30"
                    />
                  </div>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Service Dropdown */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#D9B98F] block font-medium">
                      Service
                    </label>
                    <select
                      value={formData.service}
                      onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                      className="w-full bg-[#1D1612] text-[#F6F1EA] p-3.5 rounded-[6px] border border-[#D8C8B4]/20 focus:outline-none focus:border-[#D9B98F] cursor-pointer"
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

                  {/* Datepicker */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#D9B98F] block font-medium">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-[#1D1612] text-[#F6F1EA] p-3.5 rounded-[6px] border border-[#D8C8B4]/20 focus:outline-none focus:border-[#D9B98F] cursor-pointer"
                    />
                  </div>

                </div>

                {/* Interactive Time Slot Selector */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] uppercase tracking-[0.2em] text-[#D9B98F] font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#D9B98F]" />
                      <span>Select Preferred Time Slot *</span>
                    </label>
                    <span className="text-[10px] font-mono text-[#D9B98F]">
                      Selected: {formData.timeSlot}
                    </span>
                  </div>

                  <div className="space-y-2 bg-[#1D1612] p-4 rounded-[6px] border border-[#D8C8B4]/20">
                    {availableTimeSlots.map((group) => (
                      <div key={group.label} className="space-y-1.5">
                        <span className="text-[10px] uppercase tracking-wider text-[#E3D7C7]/60 block font-light">
                          {group.label}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {group.slots.map((slot) => {
                            const isSelected = formData.timeSlot === slot;
                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => setFormData({ ...formData, timeSlot: slot })}
                                className={`px-3 py-1.5 rounded-[4px] text-xs font-mono transition-all cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#D9B98F] text-[#1D1612] font-semibold shadow-sm ring-1 ring-[#D9B98F]'
                                    : 'bg-[#2A211B] text-[#E3D7C7] hover:bg-[#382b23] border border-[#D8C8B4]/20'
                                }`}
                              >
                                {slot}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#D9B98F] hover:bg-[#E3D7C7] text-[#1D1612] py-4 rounded-[6px] text-xs uppercase tracking-[0.25em] font-medium transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer mt-4"
                >
                  <span>Request Appointment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

          </div>
        </div>

      </div>
    </section>
  );
};
