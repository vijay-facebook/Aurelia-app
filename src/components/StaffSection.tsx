import React, { useState } from 'react';
import { StaffMemberConfig } from '../config/types';
import { useConfig } from '../context/ConfigContext';
import { StaffModal } from './StaffModal';
import { Clock, Instagram, Award, ArrowRight, ExternalLink } from 'lucide-react';

interface StaffSectionProps {
  onBookWithStylist: (stylistName: string) => void;
}

export const StaffSection: React.FC<StaffSectionProps> = ({ onBookWithStylist }) => {
  const { config } = useConfig();
  const [selectedStaffForModal, setSelectedStaffForModal] = useState<StaffMemberConfig | null>(null);

  if (!config.sectionsVisibility.team) return null;

  const staffMembers = config.staff.filter((s) => s.show !== false);

  return (
    <section id="team" className="py-24 lg:py-32 max-w-[1440px] mx-auto px-6 lg:px-12 border-t border-[#D8C8B4]/60 font-sans">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
        <div>
          <span className="text-[11px] font-sans tracking-[0.3em] uppercase text-[#8C6A43] font-medium block mb-3">
            {config.headings.teamEyebrow}
          </span>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-[#1D1612]">
            {config.headings.teamTitle}
          </h2>
        </div>

        <p className="font-sans text-sm text-[#6F5F51] font-light max-w-md leading-relaxed">
          Select your preferred practitioner for dedicated 1-on-1 consultation, precision styling, and unhurried care.
        </p>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {staffMembers.map((staff) => (
          <div
            key={staff.id}
            className="group bg-[#EFE6DA]/60 hover:bg-[#EFE6DA] rounded-[12px] border border-[#D8C8B4]/70 hover:border-[#8C6A43] transition-all duration-300 p-5 flex flex-col justify-between shadow-sm hover:shadow-md"
          >
            <div>
              {/* Photo */}
              <div
                className="relative aspect-[3/4] rounded-[8px] overflow-hidden mb-5 bg-[#E3D7C7] cursor-pointer"
                onClick={() => setSelectedStaffForModal(staff)}
              >
                <img
                  src={staff.image}
                  alt={staff.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Availability Pill */}
                <div className="absolute bottom-3 left-3 right-3 bg-[#F6F1EA]/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#D8C8B4] flex items-center justify-between text-[10px] text-[#1D1612]">
                  <span className="flex items-center gap-1 font-medium text-[#8C6A43]">
                    <Clock className="w-3 h-3" />
                    <span>Available</span>
                  </span>
                  <span className="font-mono text-[#6F5F51]">{staff.availableNext}</span>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-sans uppercase tracking-widest text-[#8C6A43] font-medium flex items-center gap-1">
                    <Award className="w-3 h-3 text-[#8C6A43]" />
                    <span>{staff.experience}</span>
                  </span>

                  <button
                    onClick={() => setSelectedStaffForModal(staff)}
                    className="text-[10px] font-sans uppercase tracking-wider text-[#1D1612] hover:text-[#8C6A43] underline font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>About Bio</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <h3
                  onClick={() => setSelectedStaffForModal(staff)}
                  className="font-serif text-2xl font-light text-[#1D1612] group-hover:text-[#8C6A43] transition-colors cursor-pointer"
                >
                  {staff.name}
                </h3>

                <p className="text-xs font-sans text-[#8C6A43] font-medium uppercase tracking-wider">
                  {staff.role}
                </p>

                <p className="text-xs font-sans text-[#6F5F51] font-light leading-relaxed line-clamp-2 pt-1">
                  {staff.bio}
                </p>

                {/* Specialties Pills */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {staff.specialties?.map((spec, idx) => (
                    <span
                      key={idx}
                      className="bg-[#F6F1EA] text-[#1D1612] text-[10px] font-sans px-2.5 py-1 rounded-full border border-[#D8C8B4]/60"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 space-y-2">
              <button
                onClick={() => onBookWithStylist(staff.name)}
                className="w-full bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] py-3 rounded-full text-xs font-sans uppercase tracking-widest font-medium transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm group/btn"
              >
                <span>Book with {staff.name.split(' ')[0]}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#D9B98F] group-hover/btn:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        ))}
      </div>

      <StaffModal
        staff={selectedStaffForModal}
        onClose={() => setSelectedStaffForModal(null)}
        onBookWithStylist={(stylistName) => {
          setSelectedStaffForModal(null);
          onBookWithStylist(stylistName);
        }}
      />

    </section>
  );
};
