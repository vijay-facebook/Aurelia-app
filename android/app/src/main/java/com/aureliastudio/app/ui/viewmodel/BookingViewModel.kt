package com.aureliastudio.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aureliastudio.app.data.model.BookingRecord
import com.aureliastudio.app.data.model.LoyaltySummary
import com.aureliastudio.app.data.model.ProtectedBookingRequest
import com.aureliastudio.app.data.repository.SalonRepository
import com.aureliastudio.app.telemetry.ConsentTelemetryManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class BookingUiState(
    val selectedServiceIds: Set<String> = emptySet(),
    val appointmentDate: String = "2026-11-18",
    val timeSlot: String = "11:30 AM",
    val redeemLoyaltyReward: Boolean = false,
    val loyalty: LoyaltySummary = LoyaltySummary(),
    val pastBookings: List<BookingRecord> = emptyList(),
    val confirmedBooking: BookingRecord? = null,
    val isSubmitting: Boolean = false,
    val errorMessage: String? = null
)

class BookingViewModel(
    private val salonRepository: SalonRepository = SalonRepository(),
    private val telemetry: ConsentTelemetryManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(BookingUiState())
    val uiState: StateFlow<BookingUiState> = _uiState.asStateFlow()

    init {
        refreshLoyaltyAndBookings()
    }

    fun toggleService(serviceId: String) {
        _uiState.update { state ->
            val updated = if (serviceId in state.selectedServiceIds) {
                state.selectedServiceIds - serviceId
            } else {
                state.selectedServiceIds + serviceId
            }
            state.copy(selectedServiceIds = updated, errorMessage = null)
        }
    }

    fun setPreselectedService(serviceId: String) {
        if (serviceId.isBlank()) return
        _uiState.update { it.copy(selectedServiceIds = it.selectedServiceIds + serviceId, confirmedBooking = null) }
    }

    fun onDateChange(date: String) = _uiState.update { it.copy(appointmentDate = date) }

    fun onTimeSlotChange(slot: String) = _uiState.update { it.copy(timeSlot = slot) }

    fun toggleRedeemReward(enabled: Boolean) = _uiState.update { it.copy(redeemLoyaltyReward = enabled) }

    fun resetConfirmation() = _uiState.update { it.copy(confirmedBooking = null, errorMessage = null) }

    fun refreshLoyaltyAndBookings() {
        viewModelScope.launch {
            val loyalty = salonRepository.fetchLoyaltySummary().getOrDefault(LoyaltySummary())
            val bookings = salonRepository.fetchUserBookings().getOrDefault(emptyList())
            _uiState.update { it.copy(loyalty = loyalty, pastBookings = bookings) }
        }
    }

    fun confirmBooking() {
        val state = _uiState.value
        if (state.selectedServiceIds.isEmpty()) {
            _uiState.update { it.copy(errorMessage = "Select at least one service.") }
            return
        }

        viewModelScope.launch {
            _uiState.update { it.copy(isSubmitting = true, errorMessage = null) }
            val result = salonRepository.submitProtectedBooking(
                ProtectedBookingRequest(
                    serviceIds = state.selectedServiceIds.toList(),
                    appointmentDate = state.appointmentDate,
                    timeSlot = state.timeSlot,
                    redeemLoyaltyReward = state.redeemLoyaltyReward && state.loyalty.rewardUnlocked
                )
            )

            result.onSuccess { response ->
                _uiState.update {
                    it.copy(
                        isSubmitting = false,
                        confirmedBooking = response.booking,
                        loyalty = response.loyalty,
                        pastBookings = listOf(response.booking) + it.pastBookings,
                        redeemLoyaltyReward = false
                    )
                }
            }.onFailure { err ->
                telemetry.recordNonFatalError(err)
                _uiState.update {
                    it.copy(
                        isSubmitting = false,
                        errorMessage = err.localizedMessage ?: "Unable to confirm appointment."
                    )
                }
            }
        }
    }
}
