package com.maomao.util

import android.app.Activity
import android.os.Build
import android.view.View
import android.view.Window
import android.view.WindowInsetsController
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat
import androidx.core.view.setSystemBarsColor

class SystemUiController(private val view: View) {
    private val window: Window = (LocalContext.current as Activity).window

    fun setSystemBarsColor(color: androidx.compose.ui.graphics.Color, darkIcons: Boolean) {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val colorInt = color.toArgb()
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val controller = window.insetsController
            controller?.systemBarsAppearance = if (darkIcons) 
                WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS 
            else 0
            controller?.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            controller?.setSystemBarsColor(colorInt)
        } else {
            setSystemBarsColor(colorInt, darkIcons)
            setNavigationBarsColor(colorInt, darkIcons)
        }
    }
}

fun rememberSystemUiController(): SystemUiController {
    val view = LocalView.current
    return SystemUiController(view)
}