import React, { useState } from 'react';
import { MapPin, Phone, CheckCircle2 } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';

interface BookingSectionProps {
  preselectedService?: string;
}

export const BookingSection: React.FC<BookingSectionProps> = ({ preselectedService }) => {
  const { config } = useConfig();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    service: preselectedService || config.menu?.items?.[0]?.title || 'Signature Service',
    date: '',
    timeSlot: config.booking.timeSlots?.[0] || '10:30 AM',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone) {
      alert('Please enter your name and phone number.');
      return;
    }
    setSubmitted(true);
  };

  const whatsappMessage = encodeURIComponent(
    config.booking.whatsappTemplate
      ? config.booking.whatsappTemplate
          .replace('{service}', formData.service)
          .replace('{date}', formData.date || 'Soonest Available')
          .replace('{time}', formData.timeSlot)
          .replace('{name}', formData.fullName)
          .replace('{phone}', formData.phone)
      : `Hello Aurelia Concierge, I would like to book an appointment:\nService: ${formData.service}\nDate: ${formData.date}\nTime: ${formData.timeSlot}\nName: ${formData.fullName}\nPhone: ${formData.phone}`
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
              {config.headings.bookingTitle.split(' ')[0]} <br />
              <span className="italic font-light text-[#D9B98F]">{config.headings.bookingTitle.split(' ').slice(1).join(' ')}</span>
            </h2>
          </div>

          <p className="font-sans text-sm text-[#E3D7C7]/80 font-light leading-relaxed max-w-md">
            Tell us what you'd like and select your preferred date and time slot. We'll confirm your appointment by WhatsApp within the hour.
          </p>

          <div className="space-y-3 pt-4 border-t border-[#F6F1EA]/15 text-xs text-[#E3D7C7]/90 font-light">
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-[#D9B98F]" />
              <span>{config.businessInfo.addressLines?.join(', ')}, {config.businessInfo.city} {config.businessInfo.pincode}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#D9B98F]" />
              <span>{config.businessInfo.phone} · WhatsApp Reservations</span>
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
                    {config.booking.successMessage || 'Thank you for your request. We will confirm shortly.'}
                  </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href={`https://wa.me/${config.booking.whatsappNumber || config.businessInfo.whatsappNumber}?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto bg-[#D9B98F] text-[#1D1612] px-6 py-3 rounded-full text-xs font-medium uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#E3D7C7] transition-colors"
                  >
                    <span>Confirm via WhatsApp ↗</span>
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#D9B98F] font-medium block">
                      Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Sana Mehta"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-[#15100D] border border-[#3A2F27] text-[#F6F1EA] p-3 rounded-[6px] text-xs focus:outline-none focus:border-[#D9B98F]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#D9B98F] font-medium block">
                      Phone Number *
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="+91 98200 00000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-[#15100D] border border-[#3A2F27] text-[#F6F1EA] p-3 rounded-[6px] text-xs focus:outline-none focus:border-[#D9B98F]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-[#D9B98F] font-medium block">
                    Preferred Service / Package
                  </label>
                  <input
                    type="text"
                    value={formData.service}
                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                    className="w-full bg-[#15100D] border border-[#3A2F27] text-[#F6F1EA] p-3 rounded-[6px] text-xs focus:outline-none focus:border-[#D9B98F]"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#D9B98F] font-medium block">
                      Preferred Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-[#15100D] border border-[#3A2F27] text-[#F6F1EA] p-3 rounded-[6px] text-xs focus:outline-none focus:border-[#D9B98F]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-[#D9B98F] font-medium block">
                      Time Slot
                    </label>
                    <select
                      value={formData.timeSlot}
                      onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                      className="w-full bg-[#15100D] border border-[#3A2F27] text-[#F6F1EA] p-3 rounded-[6px] text-xs focus:outline-none focus:border-[#D9B98F]"
                    >
                      {config.booking.timeSlots?.map((slot, idx) => (
                        <option key={idx} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#D9B98F] hover:bg-[#AE9472] text-[#1D1612] py-4 rounded-[6px] text-xs uppercase tracking-widest font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <span>Request Appointment</span>
                </button>
              </form>
            )}

          </div>
        </div>

      </div>
    </section>
  );
};
