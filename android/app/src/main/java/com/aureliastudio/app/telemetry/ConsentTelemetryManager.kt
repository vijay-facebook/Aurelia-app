package com.aureliastudio.app.telemetry

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.preferencesDataStore
import com.google.firebase.analytics.FirebaseAnalytics
import com.google.firebase.crashlytics.FirebaseCrashlytics
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

private val Context.consentDataStore by preferencesDataStore(name = "telemetry_consent")

data class TelemetryConsentState(
    val hasAnsweredPrompt: Boolean = false,
    val crashReportingEnabled: Boolean = false,
    val analyticsEnabled: Boolean = false
)

/**
 * Enforces explicit opt-in consent before initializing or enabling crash reporting
 * and behavioral analytics collection.
 */
class ConsentTelemetryManager(private val context: Context) {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    private object Keys {
        val HAS_ANSWERED = booleanPreferencesKey("has_answered_consent")
        val CRASH_OPT_IN = booleanPreferencesKey("crash_reporting_opt_in")
        val ANALYTICS_OPT_IN = booleanPreferencesKey("analytics_opt_in")
    }

    val consentState: StateFlow<TelemetryConsentState> = context.consentDataStore.data
        .map { prefs ->
            TelemetryConsentState(
                hasAnsweredPrompt = prefs[Keys.HAS_ANSWERED] ?: false,
                crashReportingEnabled = prefs[Keys.CRASH_OPT_IN] ?: false,
                analyticsEnabled = prefs[Keys.ANALYTICS_OPT_IN] ?: false
            )
        }
        .stateIn(
            scope = scope,
            started = SharingStarted.Eagerly,
            initialValue = TelemetryConsentState()
        )

    fun applyStoredConsent() {
        scope.launch {
            val state = consentState.value
            applySdkCollectionFlags(
                crashEnabled = state.crashReportingEnabled,
                analyticsEnabled = state.analyticsEnabled
            )
        }
    }

    fun updateConsent(crashReportingEnabled: Boolean, analyticsEnabled: Boolean) {
        scope.launch {
            context.consentDataStore.edit { prefs ->
                prefs[Keys.HAS_ANSWERED] = true
                prefs[Keys.CRASH_OPT_IN] = crashReportingEnabled
                prefs[Keys.ANALYTICS_OPT_IN] = analyticsEnabled
            }
            applySdkCollectionFlags(crashReportingEnabled, analyticsEnabled)
        }
    }

    fun logScreenView(screenName: String) {
        if (!consentState.value.analyticsEnabled) return
        runCatching {
            FirebaseAnalytics.getInstance(context).logEvent(
                FirebaseAnalytics.Event.SCREEN_VIEW,
                android.os.Bundle().apply {
                    putString(FirebaseAnalytics.Param.SCREEN_NAME, screenName)
                }
            )
        }
    }

    fun recordNonFatalError(throwable: Throwable) {
        if (!consentState.value.crashReportingEnabled) return
        runCatching {
            FirebaseCrashlytics.getInstance().recordException(throwable)
        }
    }

    private fun applySdkCollectionFlags(crashEnabled: Boolean, analyticsEnabled: Boolean) {
        runCatching {
            FirebaseCrashlytics.getInstance().setCrashlyticsCollectionEnabled(crashEnabled)
        }
        runCatching {
            FirebaseAnalytics.getInstance(context).setAnalyticsCollectionEnabled(analyticsEnabled)
        }
    }
}
