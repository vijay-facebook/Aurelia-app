import React from 'react';
import { X, Award, Clock, Instagram, Calendar, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { StaffMember } from '../data/aureliaData';

interface StaffModalProps {
  staff: StaffMember | null;
  onClose: () => void;
  onBookWithStylist: (stylistName: string) => void;
}

export const StaffModal: React.FC<StaffModalProps> = ({ staff, onClose, onBookWithStylist }) => {
  if (!staff) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8 bg-[#1D1612]/70 backdrop-blur-md animate-fade-in font-sans">
      <div className="bg-[#F6F1EA] rounded-[12px] border border-[#D8C8B4] max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-[#1D1612] hover:text-[#8C6A43] bg-[#EFE6DA] hover:bg-[#E3D7C7] rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-12 gap-8 p-6 lg:p-10">
          
          {/* Left Column: Portrait */}
          <div className="md:col-span-5 space-y-4">
            <div className="aspect-[3/4] rounded-[8px] overflow-hidden border border-[#D8C8B4] bg-[#E3D7C7] shadow-md relative">
              <img
                src={staff.image}
                alt={staff.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />

              {/* Next Available Pill */}
              <div className="absolute bottom-3 left-3 right-3 bg-[#F6F1EA]/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#D8C8B4] flex items-center justify-between text-[10px] text-[#1D1612]">
                <span className="flex items-center gap-1 font-medium text-[#8C6A43]">
                  <Clock className="w-3 h-3" />
                  <span>Next Slot</span>
                </span>
                <span className="font-mono text-[#6F5F51]">{staff.availableNext}</span>
              </div>
            </div>

            <a
              href={`https://instagram.com/${staff.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 text-xs font-sans uppercase tracking-wider text-[#1D1612] hover:text-[#8C6A43] py-2 border border-[#D8C8B4] rounded-[6px] bg-[#EFE6DA] transition-colors"
            >
              <Instagram className="w-4 h-4 text-[#8C6A43]" />
              <span>Follow {staff.instagram}</span>
            </a>
          </div>

          {/* Right Column: Full Biography & Credentials */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#8C6A43] font-medium">
                <Award className="w-3.5 h-3.5 text-[#8C6A43]" />
                <span>{staff.experience}</span>
              </div>

              <div>
                <h2 className="font-serif text-3xl lg:text-4xl text-[#1D1612] font-light leading-tight">
                  {staff.name}
                </h2>
                <p className="text-xs font-sans text-[#8C6A43] font-medium uppercase tracking-wider mt-1">
                  {staff.role}
                </p>
              </div>

              {/* Bio Paragraphs */}
              <div className="space-y-2 text-xs font-sans text-[#6F5F51] font-light leading-relaxed">
                <p>{staff.bio}</p>
                <p>
                  Dedicated to preserving natural hair and skin integrity through unhurried consultation, custom formulation, and precision technique.
                </p>
              </div>

              {/* Master Credentials */}
              <div className="bg-[#EFE6DA] p-4 rounded-[8px] border border-[#D8C8B4] space-y-2 text-xs font-sans">
                <span className="font-serif text-sm font-medium text-[#1D1612] block">Professional Certifications & Training</span>
                <ul className="space-y-1.5 text-[11px] text-[#6F5F51] font-light">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#8C6A43] shrink-0" />
                    <span>International Masterclasses (Milan & London Atelier)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#8C6A43] shrink-0" />
                    <span>Certified Organic & Cruelty-Free Formula Practitioner</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#8C6A43] shrink-0" />
                    <span>Senior Practitioner at Aurelia Studio since 2018</span>
                  </li>
                </ul>
              </div>

              {/* Core Specialties */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-[#8C6A43] font-medium block">
                  Core Specialties & Services
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {staff.specialties.map((spec, idx) => (
                    <span
                      key={idx}
                      className="bg-[#EFE6DA] text-[#1D1612] text-xs font-sans px-3 py-1 rounded-full border border-[#D8C8B4]"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* CTA Button */}
            <div className="pt-4 border-t border-[#D8C8B4]">
              <button
                onClick={() => {
                  onClose();
                  onBookWithStylist(`Consultation with ${staff.name}`);
                }}
                className="w-full bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] py-3.5 rounded-full text-xs font-sans uppercase tracking-widest font-medium transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer group"
              >
                <Calendar className="w-4 h-4 text-[#D9B98F]" />
                <span>Book Appointment with {staff.name.split(' ')[0]}</span>
                <ArrowRight className="w-4 h-4 text-[#D9B98F] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
