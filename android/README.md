# Aurelia Studio — Native Android Application

## Architecture & Stack
- **UI**: Kotlin, Jetpack Compose, Material 3, Navigation Compose
- **State & Concurrency**: MVVM (`AuthViewModel`, `HomeViewModel`, `BookingViewModel`, `ProfileViewModel`), Kotlin Coroutines, `StateFlow`
- **Data Layer**: Repository pattern (`AuthRepository`, `SalonRepository`, `MediaStorageRepository`, `PushNotificationRepository`)
- **Backend & Auth**:
  - Supabase Authentication (`auth-kt`)
  - Supabase Postgrest (`postgrest-kt`) with Row-Level Security (`supabase/schema.sql`)
  - Supabase Storage (`storage-kt`) for private profile photos (`profile-photos`) and permitted client documents (`permitted-documents`)
  - Trusted server-side Edge Function (`supabase/functions/protected-booking-ops/index.ts`) for protected booking creation, loyalty point crediting, contactless UPI QR payloads, and recommendations
- **Push Notifications**: Firebase Cloud Messaging (`AureliaMessagingService`) syncing Android device tokens to Supabase `device_tokens`
- **Consent-Gated Telemetry**: `ConsentTelemetryManager` (DataStore-backed opt-in before enabling Crashlytics or Analytics)

## Setup Instructions (Android Studio)
1. Open the `android/` directory in Android Studio Ladybug (or newer) with JDK 17.
2. Create a Supabase project, run `android/supabase/schema.sql` in the SQL Editor, and deploy `android/supabase/functions/protected-booking-ops`.
3. Update `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `android/app/build.gradle.kts`.
4. Add your `google-services.json` into `android/app/` and uncomment the `google-services` and `firebase-crashlytics` plugins in `android/app/build.gradle.kts` to enable FCM push notifications, Crashlytics, and Analytics.
5. Sync Gradle and run on an Android 8.0+ (API 26+) device or emulator.
