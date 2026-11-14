package com.aureliastudio.app.ui.screens

import android.graphics.Bitmap
import android.graphics.Color
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.unit.dp
import com.aureliastudio.app.data.model.ServiceItem
import com.aureliastudio.app.ui.viewmodel.BookingViewModel
import com.google.zxing.BarcodeFormat
import com.google.zxing.qrcode.QRCodeWriter

@Composable
fun BookingScreen(
    bookingViewModel: BookingViewModel,
    availableServices: List<ServiceItem>,
    modifier: Modifier = Modifier
) {
    val state by bookingViewModel.uiState.collectAsState()
    val timeSlots = listOf("10:30 AM", "11:30 AM", "02:30 PM", "04:00 PM", "05:30 PM")

    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Studio Reservations",
                style = MaterialTheme.typography.headlineLarge
            )
        }

        // Loyalty Points Tracker Card
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "LOYALTY POINTS · ${state.loyalty.completedAppointments} VISITS",
                            style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.secondary
                        )
                        Text(
                            text = "${state.loyalty.availablePoints} / ${state.loyalty.thresholdPoints} pts",
                            style = MaterialTheme.typography.titleMedium
                        )
                    }

                    LinearProgressIndicator(
                        progress = { state.loyalty.progressFraction },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                    )

                    Text(
                        text = if (state.loyalty.rewardUnlocked) {
                            "Reward unlocked: ${state.loyalty.rewardLabel}"
                        } else {
                            "${state.loyalty.pointsRemaining} pts away from ${state.loyalty.rewardLabel}"
                        },
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    if (state.loyalty.rewardUnlocked && state.confirmedBooking == null) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Apply reward to this booking", style = MaterialTheme.typography.bodyMedium)
                            Switch(
                                checked = state.redeemLoyaltyReward,
                                onCheckedChange = bookingViewModel::toggleRedeemReward
                            )
                        }
                    }
                }
            }
        }

        val confirmed = state.confirmedBooking
        if (confirmed != null) {
            item {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Text(
                            text = "Booking Confirmed · ${confirmed.bookingRef}",
                            style = MaterialTheme.typography.headlineMedium
                        )
                        Text(
                            text = "${confirmed.appointmentDate} at ${confirmed.timeSlot} · +${confirmed.pointsEarned} Loyalty Pts",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )

                        if (confirmed.paymentUpiUri.isNotBlank()) {
                            val qrBitmap = remember(confirmed.paymentUpiUri) {
                                generateQrBitmap(confirmed.paymentUpiUri, size = 480)
                            }
                            if (qrBitmap != null) {
                                Image(
                                    bitmap = qrBitmap.asImageBitmap(),
                                    contentDescription = "Contactless Shop Payment QR",
                                    modifier = Modifier.size(200.dp)
                                )
                            }
                            Text(
                                text = "Scan with any UPI app for contactless checkout",
                                style = MaterialTheme.typography.labelMedium,
                                color = MaterialTheme.colorScheme.secondary
                            )
                        }

                        OutlinedButton(
                            onClick = bookingViewModel::resetConfirmation,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text("Book Another Session")
                        }
                    }
                }
            }
        } else {
            item {
                Text(
                    text = "Select Services",
                    style = MaterialTheme.typography.titleMedium
                )
            }

            items(availableServices, key = { it.id }) { service ->
                val checked = service.id in state.selectedServiceIds
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.weight(1f)) {
                            Checkbox(
                                checked = checked,
                                onCheckedChange = { bookingViewModel.toggleService(service.id) }
                            )
                            Column {
                                Text(service.title, style = MaterialTheme.typography.titleMedium)
                                Text(
                                    text = "${service.category.uppercase()} · ${service.duration} · ${service.price}",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }
                    }
                }
            }

            item {
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    OutlinedTextField(
                        value = state.appointmentDate,
                        onValueChange = bookingViewModel::onDateChange,
                        label = { Text("Appointment Date (YYYY-MM-DD)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )

                    Text("Time Slot", style = MaterialTheme.typography.titleMedium)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        timeSlots.take(3).forEach { slot ->
                            OutlinedButton(
                                onClick = { bookingViewModel.onTimeSlotChange(slot) },
                                modifier = Modifier.weight(1f)
                            ) {
                                Text(slot, maxLines = 1)
                            }
                        }
                    }

                    if (state.errorMessage != null) {
                        Text(
                            text = state.errorMessage.orEmpty(),
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }

                    Button(
                        onClick = bookingViewModel::confirmBooking,
                        enabled = !state.isSubmitting,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp)
                    ) {
                        if (state.isSubmitting) {
                            CircularProgressIndicator(
                                color = MaterialTheme.colorScheme.onPrimary,
                                strokeWidth = 2.dp
                            )
                        } else {
                            Text("Confirm Appointment & Generate QR")
                        }
                    }
                }
            }
        }
    }
}

private fun generateQrBitmap(content: String, size: Int): Bitmap? = runCatching {
    val matrix = QRCodeWriter().encode(content, BarcodeFormat.QR_CODE, size, size)
    val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.RGB_565)
    for (x in 0 until size) {
        for (y in 0 until size) {
            bitmap.setPixel(x, y, if (matrix[x, y]) Color.rgb(29, 22, 18) else Color.WHITE)
        }
    }
    bitmap
}.getOrNull()
