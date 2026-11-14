import React, { useEffect, useMemo, useState } from 'react';
import { User } from 'firebase/auth';
import {
  Video,
  Copy,
  Check,
  ExternalLink,
  Settings2,
  PhoneOff,
  History,
  Search,
  RefreshCw,
  LogOut,
  ShieldAlert,
  X,
  Sparkles,
  Link2,
  CalendarCheck,
  Trash2,
} from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import {
  ConferenceRecord,
  MeetAccessType,
  MeetEntryPointAccess,
  MeetSpaceResponse,
  createMeetSpace,
  endActiveMeetConference,
  getMeetAccessToken,
  getMeetSpace,
  googleSignInForMeet,
  initMeetAuth,
  listConferenceRecords,
  logoutMeetAuth,
  updateMeetSpaceSettings,
} from '../services/googleMeetAuth';
import {
  BookingHistoryEntry,
  HISTORY_UPDATED_EVENT,
  attachMeetLinkToAppointment,
  loadBookingHistory,
  normalizeGoogleMeetUrl,
  recordBookingHistory,
  removeMeetLinkFromAppointment,
} from '../utils/bookingHistory';

const CONSULTATION_TOPICS = [
  'Bridal Trial Consultation',
  'Balayage Colour Matching',
  'Skin Barrier Assessment',
  'Keratin & Scalp Diagnosis',
  'Custom Atelier Styling',
];

const ACCESS_TYPE_LABELS: Record<MeetAccessType, string> = {
  ACCESS_TYPE_UNSPECIFIED: 'Default',
  OPEN: 'Open (Anyone with link can join)',
  TRUSTED: 'Trusted (Workspace org & invited guests)',
  RESTRICTED: 'Restricted (Only invited participants)',
};

const ENTRY_POINT_LABELS: Record<MeetEntryPointAccess, string> = {
  ENTRY_POINT_ACCESS_UNSPECIFIED: 'Default',
  ALL: 'All Entry Points (Meet link & phone)',
  CREATOR_APP_ONLY: 'Creator App Only',
};

type PendingMutation =
  | {
      type: 'update_settings';
      spaceName: string;
      meetingCode: string;
      nextAccessType: MeetAccessType;
      nextEntryPointAccess: MeetEntryPointAccess;
      previousAccessType?: MeetAccessType;
      previousEntryPointAccess?: MeetEntryPointAccess;
    }
  | {
      type: 'end_conference';
      spaceName: string;
      meetingCode: string;
    };

function formatRecordTimestamp(iso?: string): string {
  if (!iso) return '—';
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatAppointmentLabel(entry: BookingHistoryEntry): string {
  const who = entry.customerName ? `${entry.customerName} · ` : '';
  const ref = entry.bookingRef ? `[${entry.bookingRef}] ` : '';
  const serviceText = entry.services.join(', ') || 'Studio Appointment';
  const when = [entry.date || 'Flexible date', entry.timeSlot].filter(Boolean).join(' @ ');
  const linkedTag = entry.meetUrl ? ' • Meet Linked' : '';
  return `${ref}${who}${serviceText} (${when})${linkedTag}`;
}

export const GoogleMeetConsultation: React.FC = () => {
  const { config } = useConfig();
  const visibleStaff = (config.staff || []).filter((s) => s.show !== false);

  const [needsAuth, setNeedsAuth] = useState<boolean>(() => !getMeetAccessToken());
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Room creation state
  const [selectedStylist, setSelectedStylist] = useState<string>(
    visibleStaff[0]?.name || 'Master Stylist'
  );
  const [topic, setTopic] = useState<string>(CONSULTATION_TOPICS[0]);
  const [createAccessType, setCreateAccessType] = useState<MeetAccessType>('TRUSTED');
  const [isCreating, setIsCreating] = useState(false);
  const [activeSpace, setActiveSpace] = useState<MeetSpaceResponse | null>(null);
  const [copiedUri, setCopiedUri] = useState(false);

  // Inspect & settings state
  const [lookupInput, setLookupInput] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [editAccessType, setEditAccessType] = useState<MeetAccessType>('TRUSTED');
  const [editEntryPointAccess, setEditEntryPointAccess] =
    useState<MeetEntryPointAccess>('ALL');

  // Conference records state
  const [records, setRecords] = useState<ConferenceRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [hasLoadedRecords, setHasLoadedRecords] = useState(false);

  // Appointment Meet URL linking state (Staff paste + User access)
  const [appointments, setAppointments] = useState<BookingHistoryEntry[]>(() =>
    loadBookingHistory()
  );
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string>(() => {
    const initial = loadBookingHistory();
    return initial[0]?.id || '__new__';
  });
  const [pastedMeetUrl, setPastedMeetUrl] = useState<string>('');
  const [newGuestName, setNewGuestName] = useState<string>('');
  const [newApptDate, setNewApptDate] = useState<string>('');
  const [newApptTimeSlot, setNewApptTimeSlot] = useState<string>(
    config.booking.timeSlots?.[0] || '10:30 AM'
  );
  const [copiedApptId, setCopiedApptId] = useState<string | null>(null);

  // Feedback & confirmation modal
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [pendingMutation, setPendingMutation] = useState<PendingMutation | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  useEffect(() => {
    const unsubscribe = initMeetAuth(
      (authedUser) => {
        setUser(authedUser);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setNeedsAuth(true);
      }
    );
    return unsubscribe;
  }, []);

  useEffect(() => {
    const syncAppointments = () => {
      const latest = loadBookingHistory();
      setAppointments(latest);
      setSelectedAppointmentId((prev) => {
        if (prev === '__new__') return latest.length > 0 && !pastedMeetUrl ? latest[0].id : prev;
        if (latest.some((a) => a.id === prev)) return prev;
        return latest[0]?.id || '__new__';
      });
    };
    window.addEventListener(HISTORY_UPDATED_EVENT, syncAppointments);
    return () => window.removeEventListener(HISTORY_UPDATED_EVENT, syncAppointments);
  }, [pastedMeetUrl]);

  useEffect(() => {
    if (visibleStaff.length > 0 && !visibleStaff.some((s) => s.name === selectedStylist)) {
      setSelectedStylist(visibleStaff[0].name);
    }
  }, [visibleStaff, selectedStylist]);

  const appointmentsWithMeet = useMemo(
    () => appointments.filter((item) => Boolean(item.meetUrl)),
    [appointments]
  );

  const handleApiError = (err: unknown, fallback: string) => {
    const msg = err instanceof Error ? err.message : fallback;
    if (
      msg === 'AUTH_REQUIRED' ||
      msg.includes('(401)') ||
      msg.toLowerCase().includes('invalid authentication credentials') ||
      msg.toLowerCase().includes('missing google oauth bearer')
    ) {
      setNeedsAuth(true);
      setErrorMessage('Your Google Meet session expired. Please sign in with Google again.');
      return;
    }
    setErrorMessage(msg || fallback);
  };

  const syncSpaceToEditor = (space: MeetSpaceResponse) => {
    setActiveSpace(space);
    setLookupInput(space.meetingCode || space.name.replace(/^spaces\//, ''));
    setEditAccessType(space.config?.accessType || 'TRUSTED');
    setEditEntryPointAccess(space.config?.entryPointAccess || 'ALL');
    if (space.meetingUri) {
      setPastedMeetUrl(space.meetingUri);
    }
  };

  const loadConferenceHistory = async () => {
    setIsLoadingRecords(true);
    setErrorMessage(null);
    try {
      const list = await listConferenceRecords();
      setRecords(list);
      setHasLoadedRecords(true);
    } catch (err) {
      handleApiError(err, 'Unable to load recent Google Meet records.');
    } finally {
      setIsLoadingRecords(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const result = await googleSignInForMeet();
      setUser(result.user);
      setNeedsAuth(false);
      setStatusMessage('Connected to Google Meet.');
      await loadConferenceHistory();
    } catch (err) {
      handleApiError(err, 'Google sign-in was cancelled or failed.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await logoutMeetAuth();
    setUser(null);
    setNeedsAuth(true);
    setActiveSpace(null);
    setRecords([]);
    setHasLoadedRecords(false);
    setStatusMessage(null);
    setErrorMessage(null);
  };

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!getMeetAccessToken()) {
      setNeedsAuth(true);
      return;
    }
    setIsCreating(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const created = await createMeetSpace({ accessType: createAccessType });
      syncSpaceToEditor(created);
      setStatusMessage(
        `Created virtual consultation room ${created.meetingCode} for ${topic}. Link ready to attach to an appointment.`
      );
    } catch (err) {
      handleApiError(err, 'Failed to create Google Meet consultation room.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleLookupSpace = async (codeOverride?: string) => {
    const target = (codeOverride ?? lookupInput).trim();
    if (!target) {
      setErrorMessage('Enter a Google Meet space ID or meeting code to inspect.');
      return;
    }
    if (!getMeetAccessToken()) {
      setNeedsAuth(true);
      return;
    }
    setIsLookingUp(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const fetched = await getMeetSpace(target);
      syncSpaceToEditor(fetched);
      setStatusMessage(`Loaded settings for room ${fetched.meetingCode}.`);
    } catch (err) {
      handleApiError(err, 'Unable to find that Google Meet space.');
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleCopyUri = async () => {
    if (!activeSpace?.meetingUri) return;
    try {
      await navigator.clipboard.writeText(activeSpace.meetingUri);
      setCopiedUri(true);
      setTimeout(() => setCopiedUri(false), 2000);
    } catch {
      setStatusMessage(`Meet link ready: ${activeSpace.meetingUri}`);
    }
  };

  const handleCopyAppointmentUrl = async (apptId: string, url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedApptId(apptId);
      setTimeout(() => setCopiedApptId(null), 2000);
    } catch {
      setStatusMessage(`Google Meet link: ${url}`);
    }
  };

  const handleAttachMeetUrlToAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);

    const normalizedUrl = normalizeGoogleMeetUrl(pastedMeetUrl);
    if (!normalizedUrl) {
      setErrorMessage(
        'Please paste a valid Google Meet URL (e.g. https://meet.google.com/abc-defg-hij).'
      );
      return;
    }

    if (selectedAppointmentId === '__new__' || appointments.length === 0) {
      const updatedList = recordBookingHistory({
        services: [topic || 'Virtual Consultation'],
        date: newApptDate || undefined,
        timeSlot: newApptTimeSlot || undefined,
        customerName: newGuestName.trim() || 'Virtual Consultation Guest',
        bookingRef: `VM-${Math.floor(1000 + Math.random() * 9000)}`,
        meetUrl: normalizedUrl,
        meetStylist: selectedStylist,
        meetTopic: topic,
      });
      setAppointments(updatedList);
      if (updatedList[0]) {
        setSelectedAppointmentId(updatedList[0].id);
      }
      setNewGuestName('');
      setStatusMessage(
        `Saved virtual appointment with Google Meet link (${normalizedUrl}) for user access.`
      );
      return;
    }

    const updatedList = attachMeetLinkToAppointment(selectedAppointmentId, {
      meetUrl: normalizedUrl,
      meetStylist: selectedStylist,
      meetTopic: topic,
    });
    setAppointments(updatedList);
    const targetAppt = updatedList.find((a) => a.id === selectedAppointmentId);
    setStatusMessage(
      `Saved Google Meet URL to appointment ${
        targetAppt?.bookingRef || targetAppt?.services.join(', ') || ''
      }. The client can now join directly from their appointment links.`
    );
  };

  const handleRemoveAppointmentMeetLink = (appointmentId: string) => {
    const updatedList = removeMeetLinkFromAppointment(appointmentId);
    setAppointments(updatedList);
    setStatusMessage('Removed Google Meet URL from appointment.');
  };

  const requestSettingsUpdateConfirmation = () => {
    if (!activeSpace) return;
    setPendingMutation({
      type: 'update_settings',
      spaceName: activeSpace.name,
      meetingCode: activeSpace.meetingCode,
      nextAccessType: editAccessType,
      nextEntryPointAccess: editEntryPointAccess,
      previousAccessType: activeSpace.config?.accessType,
      previousEntryPointAccess: activeSpace.config?.entryPointAccess,
    });
  };

  const requestEndConferenceConfirmation = () => {
    if (!activeSpace) return;
    setPendingMutation({
      type: 'end_conference',
      spaceName: activeSpace.name,
      meetingCode: activeSpace.meetingCode,
    });
  };

  const executeConfirmedMutation = async () => {
    if (!pendingMutation) return;
    setIsMutating(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      if (pendingMutation.type === 'update_settings') {
        const updated = await updateMeetSpaceSettings(pendingMutation.spaceName, {
          accessType: pendingMutation.nextAccessType,
          entryPointAccess: pendingMutation.nextEntryPointAccess,
        });
        syncSpaceToEditor(updated);
        setStatusMessage(`Updated security settings for room ${updated.meetingCode}.`);
      } else {
        await endActiveMeetConference(pendingMutation.spaceName);
        setStatusMessage(
          `Ended active Google Meet conference in room ${pendingMutation.meetingCode}.`
        );
        await loadConferenceHistory();
      }
      setPendingMutation(null);
    } catch (err) {
      setPendingMutation(null);
      handleApiError(err, 'Operation could not be completed.');
    } finally {
      setIsMutating(false);
    }
  };

  const whatsappShareHref = activeSpace
    ? `https://wa.me/${
        config.booking.whatsappNumber || config.businessInfo.whatsappNumber || ''
      }?text=${encodeURIComponent(
        `Hello from ${config.brand.name} Studio!\nJoin your virtual consultation (${topic}) with ${selectedStylist}:\nGoogle Meet Link: ${activeSpace.meetingUri}\nRoom Code: ${activeSpace.meetingCode}`
      )}`
    : '#';

  return (
    <section
      id="virtual-consultations"
      className="py-24 px-6 bg-[#EFE6DA]/60 border-t border-b border-[#D8C8B4]/70"
    >
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="text-[11px] uppercase tracking-[0.28em] text-[#8C6A43] font-medium block">
              Private Video Atelier • Google Meet
            </span>
            <h2 className="font-serif text-4xl sm:text-5xl font-light text-[#1D1612]">
              Virtual <span className="italic text-[#8C6A43]">Consultations</span>
            </h2>
            <p className="text-sm text-[#6F5F51] font-light leading-relaxed">
              Launch private Google Meet consultations for bridal previews, colour matching,
              and skin assessments directly with {config.brand.name} specialists, and attach
              Meet links to booked appointments for effortless client access.
            </p>
          </div>

          {!needsAuth && user && (
            <div className="flex items-center gap-3 bg-[#F6F1EA] border border-[#D8C8B4] rounded-full px-4 py-2 self-start md:self-auto shadow-sm">
              <div className="w-7 h-7 rounded-full bg-[#8C6A43]/15 text-[#8C6A43] flex items-center justify-center text-xs font-medium">
                {(user.displayName || user.email || 'G').charAt(0).toUpperCase()}
              </div>
              <div className="text-left pr-2">
                <p className="text-[11px] font-medium text-[#1D1612] leading-tight">
                  {user.displayName || 'Google Account'}
                </p>
                <p className="text-[10px] text-[#6F5F51] leading-tight">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={handleSignOut}
                className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-[#6F5F51] hover:text-[#1D1612] border-l border-[#D8C8B4] pl-3 cursor-pointer"
                title="Sign out of Google Meet"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        {errorMessage && (
          <div className="bg-[#FDF2F2] border border-[#E5B8B8] text-[#7D2929] rounded-[10px] px-4 py-3 text-xs flex items-center justify-between gap-4">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-[#7D2929]/70 hover:text-[#7D2929] cursor-pointer"
              aria-label="Dismiss error"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {statusMessage && (
          <div className="bg-[#F6F1EA] border border-[#8C6A43]/40 text-[#1D1612] rounded-[10px] px-4 py-3 text-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#8C6A43]" />
              <span>{statusMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-[#6F5F51] hover:text-[#1D1612] cursor-pointer"
              aria-label="Dismiss message"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Authentication Gate or Meet Workspace */}
        {needsAuth ? (
          <div className="bg-[#F6F1EA] border border-[#D8C8B4] rounded-[14px] p-8 sm:p-10 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[#8C6A43] font-medium">
                <Video className="w-4 h-4" />
                <span>Google Meet Studio Access</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-light text-[#1D1612]">
                Connect your Google account to host & manage live consultations
              </h3>
              <p className="text-xs text-[#6F5F51] leading-relaxed">
                Sign in with Google to generate instant Meet links for pre-appointment hair,
                bridal, or skin consultations, configure room entry policies, and review recent
                conference records.
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="gsi-material-button bg-white hover:bg-[#F8F9FA] text-[#1f1f1f] border border-[#747775] rounded-full px-5 py-2.5 shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-60"
              >
                <div className="gsi-material-button-state" />
                <div className="gsi-material-button-content-wrapper flex items-center gap-3">
                  <div className="gsi-material-button-icon w-5 h-5 shrink-0">
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 48 48"
                      xmlnsXlink="http://www.w3.org/1999/xlink"
                      style={{ display: 'block' }}
                    >
                      <path
                        fill="#EA4335"
                        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                      />
                      <path
                        fill="#34A853"
                        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                      />
                      <path fill="none" d="M0 0h48v48H0z" />
                    </svg>
                  </div>
                  <span className="gsi-material-button-contents text-sm font-medium tracking-normal">
                    {isLoggingIn ? 'Connecting…' : 'Sign in with Google'}
                  </span>
                  <span style={{ display: 'none' }}>Sign in with Google</span>
                </div>
              </button>
              <span className="text-[11px] text-[#6F5F51]">
                Uses your Google Meet consultation credentials securely in-session.
              </span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Create Consultation Room */}
            <div className="lg:col-span-6 bg-[#F6F1EA] border border-[#D8C8B4] rounded-[14px] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[#D8C8B4]/70 pb-4">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.22em] text-[#8C6A43] font-medium block">
                    New Virtual Session
                  </span>
                  <h3 className="font-serif text-2xl font-light text-[#1D1612]">
                    Launch Consultation Room
                  </h3>
                </div>
                <Sparkles className="w-5 h-5 text-[#8C6A43]" />
              </div>

              <form onSubmit={handleCreateSpace} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium block">
                    Specialist / Stylist
                  </label>
                  <select
                    value={selectedStylist}
                    onChange={(e) => setSelectedStylist(e.target.value)}
                    className="w-full bg-[#EFE6DA] text-[#1D1612] px-3.5 py-2.5 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                  >
                    {visibleStaff.length > 0 ? (
                      visibleStaff.map((member) => (
                        <option key={member.id} value={member.name}>
                          {member.name} — {member.role}
                        </option>
                      ))
                    ) : (
                      <option value="Master Stylist">Master Stylist</option>
                    )}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium block">
                    Consultation Topic
                  </label>
                  <select
                    value={CONSULTATION_TOPICS.includes(topic) ? topic : 'custom'}
                    onChange={(e) => {
                      if (e.target.value !== 'custom') setTopic(e.target.value);
                    }}
                    className="w-full bg-[#EFE6DA] text-[#1D1612] px-3.5 py-2.5 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                  >
                    {CONSULTATION_TOPICS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                    <option value="custom">Custom Consultation Focus…</option>
                  </select>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter custom consultation focus"
                    className="w-full bg-[#EFE6DA]/70 text-[#1D1612] px-3.5 py-2 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium block">
                    Initial Room Access Policy
                  </label>
                  <select
                    value={createAccessType}
                    onChange={(e) => setCreateAccessType(e.target.value as MeetAccessType)}
                    className="w-full bg-[#EFE6DA] text-[#1D1612] px-3.5 py-2.5 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                  >
                    <option value="TRUSTED">{ACCESS_TYPE_LABELS.TRUSTED}</option>
                    <option value="OPEN">{ACCESS_TYPE_LABELS.OPEN}</option>
                    <option value="RESTRICTED">{ACCESS_TYPE_LABELS.RESTRICTED}</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isCreating}
                  className="w-full bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] py-3.5 rounded-[6px] text-xs uppercase tracking-widest font-medium transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
                >
                  <Video className="w-4 h-4 text-[#D9B98F]" />
                  <span>{isCreating ? 'Creating Meet Space…' : 'Create Google Meet Room'}</span>
                </button>
              </form>

              {activeSpace && (
                <div className="bg-[#EFE6DA] border border-[#D8C8B4] rounded-[10px] p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-[#8C6A43] font-medium block">
                        Active Room Ready
                      </span>
                      <p className="font-mono text-base font-medium text-[#1D1612] tabular-nums">
                        {activeSpace.meetingCode}
                      </p>
                      <p className="text-[11px] text-[#6F5F51] break-all mt-0.5">
                        {activeSpace.meetingUri}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider bg-[#F6F1EA] border border-[#D8C8B4] text-[#1D1612] shrink-0">
                      {activeSpace.config?.accessType || 'TRUSTED'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <a
                      href={activeSpace.meetingUri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] px-4 py-2 rounded-full text-[11px] uppercase tracking-wider font-medium transition-colors"
                    >
                      <span>Join Google Meet</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#D9B98F]" />
                    </a>

                    <button
                      type="button"
                      onClick={handleCopyUri}
                      className="inline-flex items-center gap-1.5 bg-[#F6F1EA] hover:bg-white text-[#1D1612] border border-[#D8C8B4] px-3.5 py-2 rounded-full text-[11px] uppercase tracking-wider font-medium transition-colors cursor-pointer"
                    >
                      {copiedUri ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#8C6A43]" />
                          <span>Copied Link</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#8C6A43]" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>

                    <a
                      href={whatsappShareHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-[#F6F1EA] hover:bg-white text-[#1D1612] border border-[#D8C8B4] px-3.5 py-2 rounded-full text-[11px] uppercase tracking-wider font-medium transition-colors"
                    >
                      <span>Share via WhatsApp ↗</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Inspect Space Settings & Recent Records */}
            <div className="lg:col-span-6 space-y-6">
              {/* Inspect & Manage Space Settings */}
              <div className="bg-[#F6F1EA] border border-[#D8C8B4] rounded-[14px] p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-[#D8C8B4]/70 pb-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.22em] text-[#8C6A43] font-medium block">
                      Space Controls
                    </span>
                    <h3 className="font-serif text-2xl font-light text-[#1D1612]">
                      Inspect & Manage Room
                    </h3>
                  </div>
                  <Settings2 className="w-5 h-5 text-[#8C6A43]" />
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5 text-xs">
                  <input
                    type="text"
                    value={lookupInput}
                    onChange={(e) => setLookupInput(e.target.value)}
                    placeholder="Meeting code or space ID (e.g. abc-defg-hij)"
                    className="flex-1 bg-[#EFE6DA] text-[#1D1612] px-3.5 py-2.5 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43] font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => handleLookupSpace()}
                    disabled={isLookingUp}
                    className="inline-flex items-center justify-center gap-1.5 bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] px-4 py-2.5 rounded-[6px] text-[11px] uppercase tracking-wider font-medium transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <Search className="w-3.5 h-3.5 text-[#D9B98F]" />
                    <span>{isLookingUp ? 'Loading…' : 'Lookup Space'}</span>
                  </button>
                </div>

                {activeSpace ? (
                  <div className="space-y-4 pt-1 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium block">
                          Access Type
                        </label>
                        <select
                          value={editAccessType}
                          onChange={(e) => setEditAccessType(e.target.value as MeetAccessType)}
                          className="w-full bg-[#EFE6DA] text-[#1D1612] px-3 py-2.5 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                        >
                          <option value="OPEN">OPEN</option>
                          <option value="TRUSTED">TRUSTED</option>
                          <option value="RESTRICTED">RESTRICTED</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium block">
                          Entry Point Access
                        </label>
                        <select
                          value={editEntryPointAccess}
                          onChange={(e) =>
                            setEditEntryPointAccess(e.target.value as MeetEntryPointAccess)
                          }
                          className="w-full bg-[#EFE6DA] text-[#1D1612] px-3 py-2.5 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                        >
                          <option value="ALL">ALL</option>
                          <option value="CREATOR_APP_ONLY">CREATOR_APP_ONLY</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={requestSettingsUpdateConfirmation}
                        className="inline-flex items-center gap-1.5 bg-[#8C6A43] hover:bg-[#1D1612] text-[#F6F1EA] px-4 py-2.5 rounded-[6px] text-[11px] uppercase tracking-wider font-medium transition-colors cursor-pointer"
                      >
                        <Settings2 className="w-3.5 h-3.5" />
                        <span>Update Room Settings</span>
                      </button>

                      <button
                        type="button"
                        onClick={requestEndConferenceConfirmation}
                        className="inline-flex items-center gap-1.5 bg-[#FDF2F2] hover:bg-[#F7DFDF] text-[#8E2A2A] border border-[#E5B8B8] px-4 py-2.5 rounded-[6px] text-[11px] uppercase tracking-wider font-medium transition-colors cursor-pointer"
                      >
                        <PhoneOff className="w-3.5 h-3.5" />
                        <span>End Active Conference</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-[#6F5F51]">
                    Create a room on the left or enter a Google Meet code above to configure access
                    policies or close an active session.
                  </p>
                )}
              </div>

              {/* Recent Conference Records */}
              <div className="bg-[#F6F1EA] border border-[#D8C8B4] rounded-[14px] p-6 sm:p-8 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#D8C8B4]/70 pb-3">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-[#8C6A43]" />
                    <h4 className="font-serif text-xl font-light text-[#1D1612]">
                      Recent Conference Records
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={loadConferenceHistory}
                    disabled={isLoadingRecords}
                    className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#8C6A43] hover:text-[#1D1612] cursor-pointer disabled:opacity-60"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRecords ? 'animate-spin' : ''}`} />
                    <span>{hasLoadedRecords ? 'Refresh' : 'Load History'}</span>
                  </button>
                </div>

                {isLoadingRecords ? (
                  <p className="text-xs text-[#6F5F51] py-3">Fetching conference records…</p>
                ) : records.length === 0 ? (
                  <p className="text-xs text-[#6F5F51] py-2">
                    {hasLoadedRecords
                      ? 'No past Google Meet conference records were returned for this account yet.'
                      : 'Click "Load History" to review your recent virtual consultations.'}
                  </p>
                ) : (
                  <ul className="divide-y divide-[#D8C8B4]/60 text-xs">
                    {records.map((rec) => {
                      const spaceCode = rec.space?.replace(/^spaces\//, '') || '';
                      return (
                        <li
                          key={rec.name}
                          className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="space-y-0.5">
                            <p className="font-mono text-[11px] text-[#1D1612] font-medium tabular-nums">
                              {spaceCode ? `Room ${spaceCode}` : rec.name}
                            </p>
                            <p className="font-mono text-[11px] text-[#6F5F51] tabular-nums">
                              {formatRecordTimestamp(rec.startTime)} →{' '}
                              {rec.endTime ? formatRecordTimestamp(rec.endTime) : 'Ongoing'}
                            </p>
                          </div>
                          {spaceCode && (
                            <button
                              type="button"
                              onClick={() => handleLookupSpace(spaceCode)}
                              className="self-start sm:self-auto text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full border border-[#D8C8B4] text-[#1D1612] hover:border-[#8C6A43] hover:text-[#8C6A43] transition-colors cursor-pointer"
                            >
                              Inspect Space
                            </button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Staff Paste Google Meet URL -> Appointment Data + User Access List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Staff Form: Paste & Store Google Meet URL in Appointment Data */}
          <div className="lg:col-span-6 bg-[#F6F1EA] border border-[#D8C8B4] rounded-[14px] p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#D8C8B4]/70 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.22em] text-[#8C6A43] font-medium block">
                  Staff Dispatch • Appointment Linker
                </span>
                <h3 className="font-serif text-2xl font-light text-[#1D1612]">
                  Attach Google Meet URL to Appointment
                </h3>
              </div>
              <Link2 className="w-5 h-5 text-[#8C6A43]" />
            </div>

            <form onSubmit={handleAttachMeetUrlToAppointment} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label
                  htmlFor="meet-appointment-select"
                  className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium block"
                >
                  Select Target Appointment
                </label>
                <select
                  id="meet-appointment-select"
                  value={selectedAppointmentId}
                  onChange={(e) => setSelectedAppointmentId(e.target.value)}
                  className="w-full bg-[#EFE6DA] text-[#1D1612] px-3.5 py-2.5 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                >
                  {appointments.map((appt) => (
                    <option key={appt.id} value={appt.id}>
                      {formatAppointmentLabel(appt)}
                    </option>
                  ))}
                  <option value="__new__">+ Create New Virtual Consultation Appointment</option>
                </select>
              </div>

              {(selectedAppointmentId === '__new__' || appointments.length === 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#EFE6DA]/60 border border-[#D8C8B4] rounded-[8px] p-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium block">
                      Guest Name
                    </label>
                    <input
                      type="text"
                      value={newGuestName}
                      onChange={(e) => setNewGuestName(e.target.value)}
                      placeholder="e.g. Ananya Rao"
                      className="w-full bg-[#F6F1EA] text-[#1D1612] px-3 py-2 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium block">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newApptDate}
                      onChange={(e) => setNewApptDate(e.target.value)}
                      className="w-full bg-[#F6F1EA] text-[#1D1612] px-3 py-2 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium block">
                      Time Slot
                    </label>
                    <select
                      value={newApptTimeSlot}
                      onChange={(e) => setNewApptTimeSlot(e.target.value)}
                      className="w-full bg-[#F6F1EA] text-[#1D1612] px-3 py-2 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43]"
                    >
                      {(config.booking.timeSlots || ['10:30 AM', '02:00 PM', '05:00 PM']).map(
                        (slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor="staff-pasted-meet-url"
                    className="text-[10px] uppercase tracking-wider text-[#8C6A43] font-medium block"
                  >
                    Paste Generated Google Meet URL *
                  </label>
                  {activeSpace?.meetingUri && pastedMeetUrl !== activeSpace.meetingUri && (
                    <button
                      type="button"
                      onClick={() => setPastedMeetUrl(activeSpace.meetingUri)}
                      className="text-[10px] uppercase tracking-wider text-[#8C6A43] hover:text-[#1D1612] underline underline-offset-2 cursor-pointer"
                    >
                      Use Active Room URL
                    </button>
                  )}
                </div>
                <input
                  id="staff-pasted-meet-url"
                  type="url"
                  required
                  value={pastedMeetUrl}
                  onChange={(e) => setPastedMeetUrl(e.target.value)}
                  placeholder="https://meet.google.com/abc-defg-hij"
                  className="w-full bg-[#EFE6DA] text-[#1D1612] px-3.5 py-2.5 rounded-[6px] border border-[#D8C8B4] focus:outline-none focus:border-[#8C6A43] font-mono text-xs"
                />
                <p className="text-[11px] text-[#6F5F51]">
                  Staff can paste any generated Google Meet link here to store it on the guest’s
                  appointment record.
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] py-3 rounded-[6px] text-xs uppercase tracking-widest font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Link2 className="w-3.5 h-3.5 text-[#D9B98F]" />
                <span>Save Meet URL to Appointment</span>
              </button>
            </form>
          </div>

          {/* Client / User Access View: Saved Google Meet Appointment Links */}
          <div className="lg:col-span-6 bg-[#F6F1EA] border border-[#D8C8B4] rounded-[14px] p-6 sm:p-8 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#D8C8B4]/70 pb-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.22em] text-[#8C6A43] font-medium block">
                  Client Access
                </span>
                <h3 className="font-serif text-2xl font-light text-[#1D1612]">
                  Appointment Video Links
                </h3>
              </div>
              <CalendarCheck className="w-5 h-5 text-[#8C6A43]" />
            </div>

            {appointmentsWithMeet.length === 0 ? (
              <div className="bg-[#EFE6DA]/60 border border-dashed border-[#D8C8B4] rounded-[10px] p-6 text-center space-y-2">
                <p className="text-xs text-[#1D1612] font-medium">
                  No Google Meet links attached to appointments yet
                </p>
                <p className="text-[11px] text-[#6F5F51]">
                  Once a staff member saves a Google Meet URL on the left, the user can access
                  their consultation link here and inside the booking confirmation panel.
                </p>
              </div>
            ) : (
              <ul className="space-y-3 text-xs">
                {appointmentsWithMeet.map((appt) => (
                  <li
                    key={appt.id}
                    className="bg-[#EFE6DA] border border-[#D8C8B4] rounded-[10px] p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          {appt.bookingRef && (
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#F6F1EA] border border-[#D8C8B4] text-[#8C6A43] tabular-nums">
                              {appt.bookingRef}
                            </span>
                          )}
                          <span className="font-medium text-[#1D1612]">
                            {appt.customerName || 'Guest Appointment'}
                          </span>
                        </div>
                        <p className="text-[#1D1612] truncate">
                          {appt.services.join(', ')}
                          {appt.meetStylist ? ` · with ${appt.meetStylist}` : ''}
                        </p>
                        <p className="text-[11px] text-[#6F5F51] font-mono tabular-nums">
                          {[appt.date || 'Scheduled Date', appt.timeSlot].filter(Boolean).join(' • ')}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveAppointmentMeetLink(appt.id)}
                        className="text-[#6F5F51] hover:text-[#8E2A2A] p-1 transition-colors cursor-pointer shrink-0"
                        title="Remove Meet link from appointment"
                        aria-label="Remove Meet link from appointment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#D8C8B4]/70">
                      <span className="font-mono text-[11px] text-[#6F5F51] break-all">
                        {appt.meetUrl}
                      </span>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyAppointmentUrl(appt.id, appt.meetUrl!)}
                          className="inline-flex items-center gap-1 bg-[#F6F1EA] hover:bg-white text-[#1D1612] border border-[#D8C8B4] px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-medium cursor-pointer"
                        >
                          {copiedApptId === appt.id ? (
                            <>
                              <Check className="w-3 h-3 text-[#8C6A43]" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3 text-[#8C6A43]" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                        <a
                          href={appt.meetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-[#1D1612] hover:bg-[#8C6A43] text-[#F6F1EA] px-3.5 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-medium transition-colors"
                        >
                          <span>Join Meet</span>
                          <ExternalLink className="w-3 h-3 text-[#D9B98F]" />
                        </a>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Explicit Confirmation Modal for Mutating Google Meet Operations */}
      {pendingMutation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1D1612]/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="meet-confirm-title"
        >
          <div className="bg-[#F6F1EA] border border-[#D8C8B4] rounded-[12px] max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#8C6A43]/15 text-[#8C6A43] flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4
                  id="meet-confirm-title"
                  className="font-serif text-2xl font-light text-[#1D1612]"
                >
                  {pendingMutation.type === 'update_settings'
                    ? 'Update Google Meet Settings?'
                    : 'End Active Conference?'}
                </h4>
                <p className="text-xs text-[#6F5F51] leading-relaxed">
                  {pendingMutation.type === 'update_settings' ? (
                    <>
                      You are about to modify live Google Meet policies for room{' '}
                      <span className="font-mono font-medium text-[#1D1612]">
                        {pendingMutation.meetingCode}
                      </span>
                      .
                    </>
                  ) : (
                    <>
                      This will immediately disconnect all current participants and end the active
                      consultation in room{' '}
                      <span className="font-mono font-medium text-[#1D1612]">
                        {pendingMutation.meetingCode}
                      </span>
                      .
                    </>
                  )}
                </p>
              </div>
            </div>

            {pendingMutation.type === 'update_settings' && (
              <div className="bg-[#EFE6DA] border border-[#D8C8B4] rounded-[8px] p-3.5 text-xs space-y-2">
                <div className="flex justify-between gap-2">
                  <span className="text-[#6F5F51]">Access Type</span>
                  <span className="font-mono text-[#1D1612]">
                    {pendingMutation.previousAccessType || 'DEFAULT'} →{' '}
                    <strong>{pendingMutation.nextAccessType}</strong>
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-[#6F5F51]">Entry Point Access</span>
                  <span className="font-mono text-[#1D1612]">
                    {pendingMutation.previousEntryPointAccess || 'DEFAULT'} →{' '}
                    <strong>{pendingMutation.nextEntryPointAccess}</strong>
                  </span>
                </div>
                <p className="text-[11px] text-[#6F5F51] pt-1 border-t border-[#D8C8B4]/70">
                  {ACCESS_TYPE_LABELS[pendingMutation.nextAccessType]} •{' '}
                  {ENTRY_POINT_LABELS[pendingMutation.nextEntryPointAccess]}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPendingMutation(null)}
                disabled={isMutating}
                className="px-4 py-2 rounded-full text-xs uppercase tracking-wider border border-[#D8C8B4] text-[#6F5F51] hover:text-[#1D1612] hover:border-[#8C6A43] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeConfirmedMutation}
                disabled={isMutating}
                className={`px-5 py-2 rounded-full text-xs uppercase tracking-wider font-medium text-[#F6F1EA] transition-colors cursor-pointer disabled:opacity-60 ${
                  pendingMutation.type === 'end_conference'
                    ? 'bg-[#8E2A2A] hover:bg-[#6E1F1F]'
                    : 'bg-[#1D1612] hover:bg-[#8C6A43]'
                }`}
              >
                {isMutating
                  ? 'Applying…'
                  : pendingMutation.type === 'end_conference'
                    ? 'Confirm End Call'
                    : 'Confirm Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
