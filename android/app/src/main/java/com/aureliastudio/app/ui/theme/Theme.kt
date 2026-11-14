package com.aureliastudio.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

val AureliaParchment = Color(0xFFF6F1EA)
val AureliaLinen = Color(0xFFEFE6DA)
val AureliaInk = Color(0xFF1D1612)
val AureliaBronze = Color(0xFF8C6A43)
val AureliaGold = Color(0xFFD9B98F)
val AureliaHairline = Color(0xFFD8C8B4)
val AureliaMuted = Color(0xFF6F5F51)

private val AureliaColorScheme = lightColorScheme(
    primary = AureliaInk,
    onPrimary = AureliaParchment,
    secondary = AureliaBronze,
    onSecondary = AureliaParchment,
    tertiary = AureliaGold,
    background = AureliaParchment,
    onBackground = AureliaInk,
    surface = AureliaLinen,
    onSurface = AureliaInk,
    surfaceVariant = Color(0xFFE3D7C7),
    onSurfaceVariant = AureliaMuted,
    outline = AureliaHairline
)

private val AureliaTypography = Typography(
    headlineLarge = TextStyle(
        fontFamily = FontFamily.Serif,
        fontWeight = FontWeight.Light,
        fontSize = 32.sp,
        lineHeight = 38.sp
    ),
    headlineMedium = TextStyle(
        fontFamily = FontFamily.Serif,
        fontWeight = FontWeight.Normal,
        fontSize = 24.sp,
        lineHeight = 30.sp
    ),
    titleMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.SemiBold,
        fontSize = 16.sp,
        lineHeight = 22.sp
    ),
    bodyMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 20.sp
    ),
    labelMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Medium,
        fontSize = 12.sp,
        letterSpacing = 0.8.sp
    )
)

@Composable
fun AureliaTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = AureliaColorScheme,
        typography = AureliaTypography,
        content = content
    )
}
