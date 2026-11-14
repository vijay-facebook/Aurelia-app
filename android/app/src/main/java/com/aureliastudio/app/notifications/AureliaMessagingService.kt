package com.aureliastudio.app.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.aureliastudio.app.MainActivity
import com.aureliastudio.app.R
import com.aureliastudio.app.data.repository.PushNotificationRepository
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

/**
 * Handles Cloud Messaging push notifications for appointment confirmations,
 * reminders, and studio privilege alerts, syncing device tokens to Supabase
 * and forwarding foreground reminder payloads to [MainActivity].
 */
class AureliaMessagingService : FirebaseMessagingService() {

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val pushRepository by lazy { PushNotificationRepository() }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        serviceScope.launch {
            pushRepository.registerDeviceToken(token)
        }
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        val reminder = AppointmentReminderCenter.fromRemoteMessage(
            remoteMessage = remoteMessage,
            defaultTitle = getString(R.string.app_name)
        )

        showAppointmentNotification(reminder)
        AppointmentReminderCenter.publishReminder(reminder)

        // Dispatch an explicit app-local broadcast so MainActivity's registered listener receives it immediately.
        val broadcastIntent = Intent(AppointmentReminderCenter.ACTION_APPOINTMENT_REMINDER).apply {
            setPackage(packageName)
            AppointmentReminderCenter.attachExtras(this, reminder)
        }
        sendBroadcast(broadcastIntent)
    }

    private fun showAppointmentNotification(reminder: AppointmentReminderNotification) {
        ensureNotificationChannel(this)
        val channelId = getString(R.string.notification_channel_id)

        val launchIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
            AppointmentReminderCenter.attachExtras(this, reminder)
        }

        val contentPendingIntent = PendingIntent.getActivity(
            this,
            reminder.id.hashCode(),
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val detailSummary = listOfNotNull(
            reminder.serviceName,
            listOfNotNull(reminder.appointmentDate, reminder.timeSlot)
                .takeIf { it.isNotEmpty() }
                ?.joinToString(" at ")
        ).joinToString(" • ")

        val bigText = if (detailSummary.isNotBlank()) {
            "${reminder.message}\n$detailSummary"
        } else {
            reminder.message
        }

        val notification = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(reminder.title)
            .setContentText(reminder.message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(bigText))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setContentIntent(contentPendingIntent)
            .setAutoCancel(true)
            .build()

        runCatching {
            NotificationManagerCompat.from(this)
                .notify(reminder.id.hashCode(), notification)
        }
    }

    companion object {
        fun ensureNotificationChannel(context: Context) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val id = context.getString(R.string.notification_channel_id)
                val name = context.getString(R.string.notification_channel_name)
                val channel = NotificationChannel(
                    id,
                    name,
                    NotificationManager.IMPORTANCE_HIGH
                ).apply {
                    description = "Appointment confirmations, reminders, and salon updates"
                    enableVibration(true)
                }
                val manager = context.getSystemService(NotificationManager::class.java)
                manager?.createNotificationChannel(channel)
            }
        }
    }
}
