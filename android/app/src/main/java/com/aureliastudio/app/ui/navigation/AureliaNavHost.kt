package com.aureliastudio.app.ui.navigation

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.VideoCall
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.aureliastudio.app.notifications.AppointmentReminderNotification
import com.aureliastudio.app.telemetry.ConsentTelemetryManager
import com.aureliastudio.app.ui.screens.AuthScreen
import com.aureliastudio.app.ui.screens.BookingScreen
import com.aureliastudio.app.ui.screens.HomeScreen
import com.aureliastudio.app.ui.screens.ProfileScreen
import com.aureliastudio.app.ui.viewmodel.AuthViewModel
import com.aureliastudio.app.ui.viewmodel.BookingViewModel
import com.aureliastudio.app.ui.viewmodel.HomeViewModel
import com.aureliastudio.app.ui.viewmodel.ProfileViewModel
import io.github.jan.supabase.auth.status.SessionStatus

sealed class StudioRoute(val route: String, val label: String) {
    data object Auth : StudioRoute("auth", "Sign In")
    data object Home : StudioRoute("home", "Studio")
    data object Booking : StudioRoute("booking", "Book")
    data object Profile : StudioRoute("profile", "Profile")
}

@Composable
fun AureliaNavHost(
    authViewModel: AuthViewModel,
    homeViewModel: HomeViewModel,
    bookingViewModel: BookingViewModel,
    profileViewModel: ProfileViewModel,
    telemetry: ConsentTelemetryManager,
    activeReminder: AppointmentReminderNotification? = null,
    onDismissReminder: () -> Unit = {}
) {
    val navController = rememberNavController()
    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = backStackEntry?.destination?.route
    val sessionStatus by authViewModel.sessionStatus.collectAsState()
    val consentState by telemetry.consentState.collectAsState()
    val homeState by homeViewModel.uiState.collectAsState()
    val uriHandler = LocalUriHandler.current

    LaunchedEffect(sessionStatus) {
        if (sessionStatus is SessionStatus.Authenticated && currentRoute == StudioRoute.Auth.route) {
            navController.navigate(StudioRoute.Home.route) {
                popUpTo(StudioRoute.Auth.route) { inclusive = true }
            }
        }
    }

    LaunchedEffect(currentRoute) {
        currentRoute?.let(telemetry::logScreenView)
    }

    if (!consentState.hasAnsweredPrompt) {
        AlertDialog(
            onDismissRequest = {},
            title = { Text("Diagnostics & Analytics Consent") },
            text = {
                Text(
                    "Allow optional anonymized crash diagnostics and usage analytics to help improve booking reliability? You can change this anytime in Profile."
                )
            },
            confirmButton = {
                TextButton(
                    onClick = { telemetry.updateConsent(crashReportingEnabled = true, analyticsEnabled = true) }
                ) {
                    Text("Allow")
                }
            },
            dismissButton = {
                TextButton(
                    onClick = { telemetry.updateConsent(crashReportingEnabled = false, analyticsEnabled = false) }
                ) {
                    Text("Decline")
                }
            }
        )
    }

    if (activeReminder != null) {
        AlertDialog(
            onDismissRequest = onDismissReminder,
            icon = {
                Icon(
                    imageVector = Icons.Default.NotificationsActive,
                    contentDescription = "Appointment Reminder",
                    tint = MaterialTheme.colorScheme.primary
                )
            },
            title = {
                Text(
                    text = activeReminder.title,
                    style = MaterialTheme.typography.titleLarge
                )
            },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = activeReminder.message,
                        style = MaterialTheme.typography.bodyMedium
                    )

                    val hasScheduleDetails = !activeReminder.serviceName.isNullOrBlank() ||
                        !activeReminder.appointmentDate.isNullOrBlank() ||
                        !activeReminder.timeSlot.isNullOrBlank()

                    if (hasScheduleDetails) {
                        Surface(
                            color = MaterialTheme.colorScheme.surfaceVariant,
                            shape = MaterialTheme.shapes.medium,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(
                                modifier = Modifier.padding(12.dp),
                                verticalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                activeReminder.serviceName?.takeIf { it.isNotBlank() }?.let { service ->
                                    Text(
                                        text = service,
                                        style = MaterialTheme.typography.labelLarge,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                }
                                val scheduleText = listOfNotNull(
                                    activeReminder.appointmentDate?.takeIf { it.isNotBlank() },
                                    activeReminder.timeSlot?.takeIf { it.isNotBlank() }
                                ).joinToString(" • ")
                                if (scheduleText.isNotBlank()) {
                                    Text(
                                        text = scheduleText,
                                        style = MaterialTheme.typography.bodySmall,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                    }

                    activeReminder.meetUrl?.takeIf { it.isNotBlank() }?.let { meetUrl ->
                        Spacer(modifier = Modifier.height(4.dp))
                        OutlinedButton(
                            onClick = {
                                runCatching { uriHandler.openUri(meetUrl) }
                            },
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(Icons.Default.VideoCall, contentDescription = null)
                                Text("Join Google Meet Consultation")
                            }
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        onDismissReminder()
                        bookingViewModel.refreshLoyaltyAndBookings()
                        navController.navigate(StudioRoute.Booking.route) {
                            launchSingleTop = true
                        }
                    }
                ) {
                    Text("View Bookings")
                }
            },
            dismissButton = {
                TextButton(onClick = onDismissReminder) {
                    Text("Dismiss")
                }
            }
        )
    }

    val topDestinations = listOf(StudioRoute.Home, StudioRoute.Booking, StudioRoute.Profile)
    val showBottomBar = currentRoute != StudioRoute.Auth.route

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar {
                    topDestinations.forEach { dest ->
                        val icon = when (dest) {
                            StudioRoute.Home -> Icons.Default.Home
                            StudioRoute.Booking -> Icons.Default.CalendarMonth
                            else -> Icons.Default.Person
                        }
                        NavigationBarItem(
                            selected = currentRoute == dest.route,
                            onClick = {
                                navController.navigate(dest.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = { Icon(icon, contentDescription = dest.label) },
                            label = { Text(dest.label) }
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = StudioRoute.Auth.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(StudioRoute.Auth.route) {
                AuthScreen(
                    viewModel = authViewModel,
                    onAuthenticated = {
                        navController.navigate(StudioRoute.Home.route) {
                            popUpTo(StudioRoute.Auth.route) { inclusive = true }
                        }
                    }
                )
            }
            composable(StudioRoute.Home.route) {
                HomeScreen(
                    viewModel = homeViewModel,
                    onBookService = { serviceId ->
                        bookingViewModel.setPreselectedService(serviceId)
                        navController.navigate(StudioRoute.Booking.route)
                    }
                )
            }
            composable(StudioRoute.Booking.route) {
                BookingScreen(
                    bookingViewModel = bookingViewModel,
                    availableServices = homeState.services
                )
            }
            composable(StudioRoute.Profile.route) {
                ProfileScreen(
                    profileViewModel = profileViewModel,
                    onSignOut = {
                        authViewModel.signOut()
                        navController.navigate(StudioRoute.Auth.route) {
                            popUpTo(0) { inclusive = true }
                        }
                    }
                )
            }
        }
    }
}
