package com.aureliastudio.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aureliastudio.app.data.model.RecommendationItem
import com.aureliastudio.app.data.model.ServiceItem
import com.aureliastudio.app.data.model.StaffMember
import com.aureliastudio.app.data.repository.SalonRepository
import com.aureliastudio.app.telemetry.ConsentTelemetryManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class HomeUiState(
    val isLoading: Boolean = true,
    val services: List<ServiceItem> = emptyList(),
    val staff: List<StaffMember> = emptyList(),
    val recommendations: List<RecommendationItem> = emptyList(),
    val selectedCategory: String = "all",
    val errorMessage: String? = null
)

class HomeViewModel(
    private val salonRepository: SalonRepository = SalonRepository(),
    private val telemetry: ConsentTelemetryManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    init {
        loadStudioFeed()
    }

    fun selectCategory(category: String) {
        _uiState.update { it.copy(selectedCategory = category) }
    }

    fun loadStudioFeed() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }

            val servicesResult = salonRepository.fetchServices()
            val staffResult = salonRepository.fetchStaff()
            val recsResult = salonRepository.fetchAiRecommendations(listOf("hair", "skin", "spa"))

            servicesResult.onFailure { telemetry.recordNonFatalError(it) }

            _uiState.update {
                it.copy(
                    isLoading = false,
                    services = servicesResult.getOrDefault(emptyList()),
                    staff = staffResult.getOrDefault(emptyList()),
                    recommendations = recsResult.getOrDefault(emptyList()),
                    errorMessage = servicesResult.exceptionOrNull()?.localizedMessage
                )
            }
        }
    }
}
