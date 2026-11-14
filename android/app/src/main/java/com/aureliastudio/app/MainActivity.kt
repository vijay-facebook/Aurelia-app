package com.aureliastudio.app

import android.Manifest
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.aureliastudio.app.data.repository.PushNotificationRepository
import com.aureliastudio.app.notifications.AppointmentReminderCenter
import com.aureliastudio.app.notifications.AppointmentReminderNotification
import com.aureliastudio.app.notifications.AureliaMessagingService
import com.aureliastudio.app.telemetry.ConsentTelemetryManager
import com.aureliastudio.app.ui.navigation.AureliaNavHost
import com.aureliastudio.app.ui.theme.AureliaTheme
import com.aureliastudio.app.ui.viewmodel.AuthViewModel
import com.aureliastudio.app.ui.viewmodel.BookingViewModel
import com.aureliastudio.app.ui.viewmodel.HomeViewModel
import com.aureliastudio.app.ui.viewmodel.ProfileViewModel
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    private val pushRepository by lazy { PushNotificationRepository() }
    private var bookingViewModelRef: BookingViewModel? = null
    private var isReceiverRegistered = false

    private val requestNotificationPermission =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            if (granted) {
                AureliaMessagingService.ensureNotificationChannel(this)
                initializeFirebaseMessagingListener((application as AureliaApplication).telemetryManager)
            }
        }

    /**
     * Foreground Firebase Cloud Messaging listener registered on MainActivity to receive
     * appointment reminder broadcasts dispatched by [AureliaMessagingService].
     */
    private val fcmAppointmentReminderReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            val reminder = AppointmentReminderCenter.fromIntent(intent) ?: return
            onAppointmentReminderReceived(reminder)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        AureliaMessagingService.ensureNotificationChannel(this)
        requestPostNotificationsIfNeeded()

        val app = application as AureliaApplication
        initializeFirebaseMessagingListener(app.telemetryManager)
        handleNotificationIntent(intent)

        val factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T = when (modelClass) {
                AuthViewModel::class.java -> AuthViewModel(telemetry = app.telemetryManager) as T
                HomeViewModel::class.java -> HomeViewModel(telemetry = app.telemetryManager) as T
                BookingViewModel::class.java -> BookingViewModel(telemetry = app.telemetryManager) as T
                ProfileViewModel::class.java -> ProfileViewModel(telemetry = app.telemetryManager) as T
                else -> error("Unknown ViewModel class: ${modelClass.name}")
            }
        }

        setContent {
            AureliaTheme {
                val authVm: AuthViewModel = viewModel(factory = factory)
                val homeVm: HomeViewModel = viewModel(factory = factory)
                val bookingVm: BookingViewModel = viewModel(factory = factory)
                val profileVm: ProfileViewModel = viewModel(factory = factory)
                bookingViewModelRef = bookingVm

                val activeReminder by AppointmentReminderCenter.activeReminder.collectAsState()

                AureliaNavHost(
                    authViewModel = authVm,
                    homeViewModel = homeVm,
                    bookingViewModel = bookingVm,
                    profileViewModel = profileVm,
                    telemetry = app.telemetryManager,
                    activeReminder = activeReminder,
                    onDismissReminder = { AppointmentReminderCenter.dismissActiveReminder() }
                )
            }
        }
    }

    override fun onStart() {
        super.onStart()
        registerFcmReminderListener()
    }

    override fun onStop() {
        unregisterFcmReminderListener()
        super.onStop()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        handleNotificationIntent(intent)
    }

    private fun registerFcmReminderListener() {
        if (isReceiverRegistered) return
        val filter = IntentFilter(AppointmentReminderCenter.ACTION_APPOINTMENT_REMINDER)
        ContextCompat.registerReceiver(
            this,
            fcmAppointmentReminderReceiver,
            filter,
            ContextCompat.RECEIVER_NOT_EXPORTED
        )
        isReceiverRegistered = true
    }

    private fun unregisterFcmReminderListener() {
        if (!isReceiverRegistered) return
        runCatching { unregisterReceiver(fcmAppointmentReminderReceiver) }
        isReceiverRegistered = false
    }

    private fun initializeFirebaseMessagingListener(telemetry: ConsentTelemetryManager) {
        runCatching {
            val messaging = FirebaseMessaging.getInstance()

            // Retrieve the current FCM token and sync it with Supabase device_tokens.
            messaging.token.addOnCompleteListener { task ->
                if (!task.isSuccessful) {
                    task.exception?.let(telemetry::recordNonFatalError)
                    return@addOnCompleteListener
                }
                val token = task.result
                if (!token.isNullOrBlank()) {
                    lifecycleScope.launch(Dispatchers.IO) {
                        pushRepository.registerDeviceToken(token)
                    }
                }
            }

            // Subscribe to broadcast appointment reminder notifications topic.
            messaging.subscribeToTopic("appointment_reminders")
        }.onFailure { err ->
            telemetry.recordNonFatalError(err)
        }
    }

    private fun handleNotificationIntent(launchIntent: Intent?) {
        val reminder = AppointmentReminderCenter.fromIntent(launchIntent) ?: return
        onAppointmentReminderReceived(reminder)
    }

    private fun onAppointmentReminderReceived(reminder: AppointmentReminderNotification) {
        AppointmentReminderCenter.publishReminder(reminder)
        bookingViewModelRef?.refreshLoyaltyAndBookings()
    }

    private fun requestPostNotificationsIfNeeded() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            val granted = ContextCompat.checkSelfPermission(
                this,
                Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED
            if (!granted) {
                requestNotificationPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }
}
