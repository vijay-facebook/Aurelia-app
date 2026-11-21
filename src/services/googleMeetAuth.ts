import { getApp, getApps, initializeApp } from 'firebase/app';
import {
  Auth,
  GoogleAuthProvider,
  User,
  browserPopupRedirectResolver,
  browserSessionPersistence,
  getAuth,
  inMemoryPersistence,
  initializeAuth,
  onAuthStateChanged,
  signInWithPopup,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const MEET_SCOPES = [
  'https://www.googleapis.com/auth/meetings.space.created',
  'https://www.googleapis.com/auth/meetings.space.readonly',
  'https://www.googleapis.com/auth/meetings.space.settings',
] as const;

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: [browserSessionPersistence, inMemoryPersistence],
    popupRedirectResolver: browserPopupRedirectResolver,
  });
} catch {
  // Already initialized during HMR — reuse existing instance
  auth = getAuth(app);
}

const provider = new GoogleAuthProvider();
MEET_SCOPES.forEach((scope) => provider.addScope(scope));

let isSigningIn = false;
// Store the Google OAuth access token strictly in memory (never localStorage/sessionStorage).
let cachedAccessToken: string | null = null;

export const initMeetAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user && cachedAccessToken) {
      onAuthSuccess?.(user, cachedAccessToken);
    } else if (!isSigningIn) {
      cachedAccessToken = null;
      onAuthFailure?.();
    }
  });
};

export const googleSignInForMeet = async (): Promise<{ user: User; accessToken: string }> => {
  isSigningIn = true;
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to obtain Google Meet OAuth access token.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getMeetAccessToken = (): string | null => cachedAccessToken;

export const logoutMeetAuth = async (): Promise<void> => {
  cachedAccessToken = null;
  await auth.signOut();
};

export type MeetAccessType = 'ACCESS_TYPE_UNSPECIFIED' | 'OPEN' | 'TRUSTED' | 'RESTRICTED';
export type MeetEntryPointAccess = 'ENTRY_POINT_ACCESS_UNSPECIFIED' | 'ALL' | 'CREATOR_APP_ONLY';

export interface MeetSpaceResponse {
  name: string;
  meetingUri: string;
  meetingCode: string;
  config?: {
    accessType?: MeetAccessType;
    entryPointAccess?: MeetEntryPointAccess;
  };
}

export interface ConferenceRecord {
  name: string;
  startTime?: string;
  endTime?: string;
  space?: string;
}

async function meetApiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getMeetAccessToken();
  if (!token) {
    throw new Error('AUTH_REQUIRED');
  }

  const res = await fetch(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      data?.error?.message || data?.error || `Google Meet request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

export function createMeetSpace(config?: {
  accessType?: MeetAccessType;
  entryPointAccess?: MeetEntryPointAccess;
}): Promise<MeetSpaceResponse> {
  return meetApiRequest<MeetSpaceResponse>('/api/meet/spaces', {
    method: 'POST',
    body: JSON.stringify(config ? { config } : {}),
  });
}

export function getMeetSpace(spaceIdOrCode: string): Promise<MeetSpaceResponse> {
  const cleanId = encodeURIComponent(spaceIdOrCode.replace(/^spaces\//, '').trim());
  return meetApiRequest<MeetSpaceResponse>(`/api/meet/spaces/${cleanId}`, {
    method: 'GET',
  });
}

export function updateMeetSpaceSettings(
  spaceName: string,
  config: {
    accessType: MeetAccessType;
    entryPointAccess: MeetEntryPointAccess;
  }
): Promise<MeetSpaceResponse> {
  const cleanId = encodeURIComponent(spaceName.replace(/^spaces\//, '').trim());
  return meetApiRequest<MeetSpaceResponse>(`/api/meet/spaces/${cleanId}`, {
    method: 'PATCH',
    body: JSON.stringify({ config }),
  });
}

export function endActiveMeetConference(spaceName: string): Promise<Record<string, unknown>> {
  const cleanId = encodeURIComponent(spaceName.replace(/^spaces\//, '').trim());
  return meetApiRequest<Record<string, unknown>>(`/api/meet/spaces/${cleanId}/end`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
}

export async function listConferenceRecords(): Promise<ConferenceRecord[]> {
  const res = await meetApiRequest<{ conferenceRecords?: ConferenceRecord[] }>(
    '/api/meet/conferenceRecords',
    { method: 'GET' }
  );
  return Array.isArray(res.conferenceRecords) ? res.conferenceRecords : [];
}
