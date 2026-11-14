import React from 'react';
import { SiteConfig, StaffAvailabilityStatus, StaffMemberConfig } from '../config/types';
import {
  AddButton,
  Card,
  MediaField,
  Panel,
  SelectField,
  StringListField,
  TextAreaField,
  TextField,
  ToggleField,
  UploadHandler,
  newId,
  patchAt,
  removeAt,
} from './fields';

interface StaffManagementEditorProps {
  config: SiteConfig;
  update: (path: string, value: any) => void;
  upload: UploadHandler;
  uploading: boolean;
}

const ROLE_PRESETS = [
  'Master Barber',
  'Senior Barber',
  'Beard & Grooming Specialist',
  'Senior Stylist',
  'Master Artist',
  'Skin Specialist',
  'Lead Nail Artist & Aesthetician',
  'Founder & Creative Director',
];

const AVAILABILITY_OPTIONS: { value: StaffAvailabilityStatus; label: string }[] = [
  { value: 'Available', label: 'Available (Accepting Bookings)' },
  { value: 'Busy', label: 'Busy (In Session)' },
  { value: 'On Break', label: 'On Break' },
  { value: 'Off Duty', label: 'Off Duty / On Leave' },
];

const DEFAULT_SPECIALTIES = [
  'Precision Haircut',
  'Skin Fade',
  'Beard Trim & Hot Towel Shave',
  'Hair Colour & Gloss',
  'Scalp Ritual',
];

const statusBadgeClass = (status?: string) => {
  switch (status) {
    case 'Busy':
    case 'On Break':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    case 'Off Duty':
      return 'bg-red-500/15 text-red-300 border-red-500/30';
    default:
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
  }
};

export const StaffManagementEditor: React.FC<StaffManagementEditorProps> = ({
  config,
  update,
  upload,
  uploading,
}) => {
  const staffList = config.staff || [];

  // Combine shop services & menu titles for quick-assign specialty suggestions
  const suggestedSpecialties = Array.from(
    new Set([
      ...(config.services || []).map((s) => s.title).filter(Boolean),
      ...(config.menu?.items || []).map((m) => m.title).filter(Boolean),
      ...DEFAULT_SPECIALTIES,
    ])
  ).slice(0, 12);

  const handleAddStaff = () => {
    const newStaff: StaffMemberConfig = {
      id: newId('staff'),
      name: 'New Barber / Stylist',
      role: 'Master Barber',
      specialties: ['Precision Haircut', 'Beard Sculpting'],
      experience: '5 Years Experience',
      bio: 'Experienced specialist delivering tailored cuts, grooming, and personalized care.',
      image: staffList[0]?.image || '',
      availableNext: 'Today, 3:00 PM',
      availabilityStatus: 'Available',
      instagram: '@studio.artist',
      sinceYear: String(new Date().getFullYear()),
      show: true,
    };
    update('staff', [...staffList, newStaff]);
  };

  return (
    <Panel
      title="Staff Management"
      subtitle="Add, edit, or remove barbers, stylists, and specialists along with their specialty services and availability status."
      action={<AddButton label="Add Staff Member" onClick={handleAddStaff} />}
    >
      {staffList.length === 0 ? (
        <div className="bg-[#0D1117] border border-dashed border-[#30363D] rounded-lg p-8 text-center space-y-3">
          <p className="text-xs text-[#8B949E]">No staff members added yet.</p>
          <div className="flex justify-center">
            <AddButton label="Add First Staff Member" onClick={handleAddStaff} />
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {staffList.map((member, index) => {
            const set = (patch: Partial<StaffMemberConfig>) =>
              update('staff', patchAt(staffList, index, patch));
            const status = member.availabilityStatus || (member.show === false ? 'Off Duty' : 'Available');
            const selectedRolePreset = ROLE_PRESETS.includes(member.role) ? member.role : 'custom';
            const memberSpecialties = member.specialties || [];

            const toggleSuggestedSpecialty = (spec: string) => {
              const exists = memberSpecialties.includes(spec);
              const next = exists
                ? memberSpecialties.filter((s) => s !== spec)
                : [...memberSpecialties, spec];
              set({ specialties: next });
            };

            return (
              <Card
                key={member.id}
                title={`${member.name || 'Unnamed Staff'} · #${index + 1}`}
                onDelete={() => update('staff', removeAt(staffList, index))}
              >
                {/* Status Summary Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#30363D]/70">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-medium px-2.5 py-1 rounded-full border ${statusBadgeClass(
                        status
                      )}`}
                    >
                      {status}
                    </span>
                    <span className="text-[11px] text-[#8B949E]">
                      {member.show === false ? 'Hidden from public site' : 'Visible on public site'}
                    </span>
                  </div>
                  <div className="w-full sm:w-auto">
                    <ToggleField
                      label="Show on Website"
                      checked={member.show !== false}
                      onChange={(checked) => set({ show: checked })}
                    />
                  </div>
                </div>

                {/* Identity & Role */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <TextField
                    label="Full Name"
                    value={member.name}
                    onChange={(v) => set({ name: v })}
                    placeholder="e.g. Aarav Verma"
                  />
                  <div className="space-y-1.5">
                    <SelectField
                      label="Role Preset"
                      value={selectedRolePreset}
                      options={[
                        ...ROLE_PRESETS.map((r) => ({ value: r, label: r })),
                        { value: 'custom', label: 'Custom Role...' },
                      ]}
                      onChange={(v) => {
                        if (v !== 'custom') set({ role: v });
                      }}
                    />
                    <TextField
                      label="Role / Title (Displayed on Card)"
                      value={member.role}
                      onChange={(v) => set({ role: v })}
                      placeholder="e.g. Master Barber & Fade Specialist"
                    />
                  </div>
                </div>

                {/* Availability Status & Schedule */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <SelectField
                    label="Availability Status"
                    value={status}
                    options={AVAILABILITY_OPTIONS}
                    onChange={(v) => set({ availabilityStatus: v as StaffAvailabilityStatus })}
                  />
                  <TextField
                    label="Next Available Slot"
                    value={member.availableNext}
                    onChange={(v) => set({ availableNext: v })}
                    placeholder="e.g. Today, 4:30 PM"
                  />
                </div>

                {/* Experience, Since Year, Instagram */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <TextField
                    label="Experience"
                    value={member.experience}
                    onChange={(v) => set({ experience: v })}
                    placeholder="e.g. 8 Years Experience"
                  />
                  <TextField
                    label="With Studio Since"
                    value={member.sinceYear}
                    onChange={(v) => set({ sinceYear: v })}
                    placeholder="e.g. 2020"
                  />
                  <TextField
                    label="Instagram Handle"
                    value={member.instagram}
                    onChange={(v) => set({ instagram: v })}
                    placeholder="e.g. @barber.studio"
                  />
                </div>

                {/* Specialty Services */}
                <div className="space-y-3 bg-[#161B22]/60 border border-[#30363D] rounded-lg p-4">
                  <StringListField
                    label="Specialty Services"
                    values={memberSpecialties}
                    onChange={(next) => set({ specialties: next })}
                    addLabel="Add Specialty"
                    hint="List the key services or grooming specialties this staff member performs."
                  />
                  {suggestedSpecialties.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-[#30363D]/70">
                      <span className="text-[10px] uppercase tracking-wider text-[#8B949E] block">
                        Quick-Toggle Shop Services
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestedSpecialties.map((spec) => {
                          const active = memberSpecialties.includes(spec);
                          return (
                            <button
                              key={spec}
                              type="button"
                              onClick={() => toggleSuggestedSpecialty(spec)}
                              className={`px-2.5 py-1 rounded text-[11px] border transition-colors cursor-pointer ${
                                active
                                  ? 'bg-[#238636]/20 border-[#238636] text-emerald-300'
                                  : 'bg-[#0D1117] border-[#30363D] text-[#8B949E] hover:text-white'
                              }`}
                            >
                              {active ? `✓ ${spec}` : `+ ${spec}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Biography & Photo */}
                <TextAreaField
                  label="Biography"
                  rows={2}
                  value={member.bio}
                  onChange={(v) => set({ bio: v })}
                />

                <MediaField
                  label="Profile Photo"
                  value={member.image}
                  onChange={(url) => set({ image: url })}
                  upload={upload}
                  uploading={uploading}
                />
              </Card>
            );
          })}
        </div>
      )}
    </Panel>
  );
};
