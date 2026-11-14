package com.aureliastudio.app

import android.app.Application
import com.aureliastudio.app.notifications.AureliaMessagingService
import com.aureliastudio.app.telemetry.ConsentTelemetryManager

class AureliaApplication : Application() {
    lateinit var telemetryManager: ConsentTelemetryManager
        private set

    override fun onCreate() {
        super.onCreate()
        telemetryManager = ConsentTelemetryManager(this).apply {
            applyStoredConsent()
        }
        AureliaMessagingService.ensureNotificationChannel(this)
    }
}
