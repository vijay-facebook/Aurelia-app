package com.aureliastudio.app.notifications

import android.content.Intent
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow

data class AppointmentReminderNotification(
    val id: String,
    val title: String,
    val message: String,
    val appointmentId: String? = null,
    val appointmentDate: String? = null,
    val timeSlot: String? = null,
    val serviceName: String? = null,
    val meetUrl: String? = null,
    val receivedAtMillis: Long = System.currentTimeMillis()
)

/**
 * Shared in-process coordinator bridging Firebase Cloud Messaging payloads from
 * [AureliaMessagingService] and notification tap Intents to [com.aureliastudio.app.MainActivity].
 */
object AppointmentReminderCenter {

    const val ACTION_APPOINTMENT_REMINDER = "com.aureliastudio.app.ACTION_APPOINTMENT_REMINDER"

    const val EXTRA_REMINDER_ID = "extra_reminder_id"
    const val EXTRA_TITLE = "extra_reminder_title"
    const val EXTRA_BODY = "extra_reminder_body"
    const val EXTRA_APPOINTMENT_ID = "extra_appointment_id"
    const val EXTRA_APPOINTMENT_DATE = "extra_appointment_date"
    const val EXTRA_TIME_SLOT = "extra_time_slot"
    const val EXTRA_SERVICE_NAME = "extra_service_name"
    const val EXTRA_MEET_URL = "extra_meet_url"

    private val _activeReminder = MutableStateFlow<AppointmentReminderNotification?>(null)
    val activeReminder: StateFlow<AppointmentReminderNotification?> = _activeReminder.asStateFlow()

    private val _reminderEvents = MutableSharedFlow<AppointmentReminderNotification>(extraBufferCapacity = 16)
    val reminderEvents: SharedFlow<AppointmentReminderNotification> = _reminderEvents.asSharedFlow()

    fun publishReminder(reminder: AppointmentReminderNotification) {
        _activeReminder.value = reminder
        _reminderEvents.tryEmit(reminder)
    }

    fun dismissActiveReminder() {
        _activeReminder.value = null
    }

    fun fromRemoteMessage(
        remoteMessage: RemoteMessage,
        defaultTitle: String
    ): AppointmentReminderNotification {
        val data = remoteMessage.data
        val title = remoteMessage.notification?.title
            ?: data["title"]
            ?: "$defaultTitle · Appointment Reminder"
        val message = remoteMessage.notification?.body
            ?: data["body"]
            ?: data["message"]
            ?: "Your upcoming studio appointment is scheduled soon."

        return AppointmentReminderNotification(
            id = remoteMessage.messageId ?: "rem-${System.currentTimeMillis()}",
            title = title,
            message = message,
            appointmentId = data["appointment_id"] ?: data["booking_id"],
            appointmentDate = data["appointment_date"] ?: data["date"],
            timeSlot = data["time_slot"],
            serviceName = data["service_name"] ?: data["service"],
            meetUrl = data["meet_url"]
        )
    }

    fun attachExtras(intent: Intent, reminder: AppointmentReminderNotification): Intent {
        return intent.apply {
            putExtra(EXTRA_REMINDER_ID, reminder.id)
            putExtra(EXTRA_TITLE, reminder.title)
            putExtra(EXTRA_BODY, reminder.message)
            putExtra(EXTRA_APPOINTMENT_ID, reminder.appointmentId)
            putExtra(EXTRA_APPOINTMENT_DATE, reminder.appointmentDate)
            putExtra(EXTRA_TIME_SLOT, reminder.timeSlot)
            putExtra(EXTRA_SERVICE_NAME, reminder.serviceName)
            putExtra(EXTRA_MEET_URL, reminder.meetUrl)
        }
    }

    fun fromIntent(intent: Intent?): AppointmentReminderNotification? {
        if (intent == null) return null
        val title = intent.getStringExtra(EXTRA_TITLE)
            ?: intent.getStringExtra("title")
        val body = intent.getStringExtra(EXTRA_BODY)
            ?: intent.getStringExtra("body")
            ?: intent.getStringExtra("message")

        val appointmentId = intent.getStringExtra(EXTRA_APPOINTMENT_ID)
            ?: intent.getStringExtra("appointment_id")
            ?: intent.getStringExtra("booking_id")

        if (title.isNullOrBlank() && body.isNullOrBlank() && appointmentId.isNullOrBlank()) {
            return null
        }

        return AppointmentReminderNotification(
            id = intent.getStringExtra(EXTRA_REMINDER_ID) ?: "rem-${System.currentTimeMillis()}",
            title = title ?: "Appointment Reminder",
            message = body ?: "Tap to view your upcoming studio appointment.",
            appointmentId = appointmentId,
            appointmentDate = intent.getStringExtra(EXTRA_APPOINTMENT_DATE)
                ?: intent.getStringExtra("appointment_date"),
            timeSlot = intent.getStringExtra(EXTRA_TIME_SLOT)
                ?: intent.getStringExtra("time_slot"),
            serviceName = intent.getStringExtra(EXTRA_SERVICE_NAME)
                ?: intent.getStringExtra("service_name"),
            meetUrl = intent.getStringExtra(EXTRA_MEET_URL)
                ?: intent.getStringExtra("meet_url")
        )
    }
}
