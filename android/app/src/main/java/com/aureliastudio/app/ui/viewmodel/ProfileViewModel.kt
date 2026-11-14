package com.aureliastudio.app.ui.viewmodel

import android.content.ContentResolver
import android.net.Uri
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aureliastudio.app.data.model.ClientDocument
import com.aureliastudio.app.data.repository.AuthRepository
import com.aureliastudio.app.data.repository.MediaStorageRepository
import com.aureliastudio.app.telemetry.ConsentTelemetryManager
import com.aureliastudio.app.telemetry.TelemetryConsentState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class ProfileUiState(
    val userEmail: String = "",
    val profilePhotoUrl: String = "",
    val documents: List<ClientDocument> = emptyList(),
    val isUploading: Boolean = false,
    val statusMessage: String? = null,
    val errorMessage: String? = null
)

class ProfileViewModel(
    private val authRepository: AuthRepository = AuthRepository(),
    private val mediaRepository: MediaStorageRepository = MediaStorageRepository(),
    private val telemetry: ConsentTelemetryManager
) : ViewModel() {

    val consentState: StateFlow<TelemetryConsentState> = telemetry.consentState

    private val _uiState = MutableStateFlow(
        ProfileUiState(userEmail = authRepository.currentUserEmail().orEmpty())
    )
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()

    init {
        loadDocuments()
    }

    fun loadDocuments() {
        viewModelScope.launch {
            _uiState.update { it.copy(userEmail = authRepository.currentUserEmail().orEmpty()) }
            mediaRepository.listPermittedDocuments()
                .onSuccess { docs -> _uiState.update { it.copy(documents = docs) } }
                .onFailure { err -> telemetry.recordNonFatalError(err) }
        }
    }

    fun uploadProfilePhoto(contentResolver: ContentResolver, uri: Uri) {
        viewModelScope.launch {
            _uiState.update { it.copy(isUploading = true, errorMessage = null, statusMessage = null) }
            mediaRepository.uploadProfilePhoto(contentResolver, uri)
                .onSuccess { signedUrl ->
                    _uiState.update {
                        it.copy(
                            isUploading = false,
                            profilePhotoUrl = signedUrl,
                            statusMessage = "Profile photo updated in Supabase Storage."
                        )
                    }
                }
                .onFailure { err ->
                    telemetry.recordNonFatalError(err)
                    _uiState.update {
                        it.copy(isUploading = false, errorMessage = err.localizedMessage)
                    }
                }
        }
    }

    fun uploadDocument(contentResolver: ContentResolver, uri: Uri) {
        viewModelScope.launch {
            _uiState.update { it.copy(isUploading = true, errorMessage = null, statusMessage = null) }
            mediaRepository.uploadPermittedDocument(contentResolver, uri)
                .onSuccess { doc ->
                    _uiState.update {
                        it.copy(
                            isUploading = false,
                            documents = listOf(doc) + it.documents,
                            statusMessage = "Uploaded ${doc.fileName} to private documents bucket."
                        )
                    }
                }
                .onFailure { err ->
                    telemetry.recordNonFatalError(err)
                    _uiState.update {
                        it.copy(isUploading = false, errorMessage = err.localizedMessage)
                    }
                }
        }
    }

    fun updateTelemetryConsent(crashReporting: Boolean, analytics: Boolean) {
        telemetry.updateConsent(
            crashReportingEnabled = crashReporting,
            analyticsEnabled = analytics
        )
    }
}
