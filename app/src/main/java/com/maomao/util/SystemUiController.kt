package com.maomao.util

import android.app.Activity
import android.os.Build
import android.view.View
import android.view.Window
import android.view.WindowInsetsController
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

class SystemUiController(
    private val view: View,
    private val window: Window
) {
    fun setStatusBarColor(colorInt: Int, darkIcons: Boolean) {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val controller = window.insetsController
            controller?.systemBarsAppearance = if (darkIcons) 
                WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS 
            else 0
            controller?.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            controller?.setSystemBarsColor(colorInt)
        } else {
            window.setStatusBarColor(colorInt)
            window.setNavigationBarColor(colorInt)
        }
    }
    
    fun setNavigationBarColor(colorInt: Int, darkIcons: Boolean) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
            val controller = window.insetsController
            controller?.systemBarsAppearance = if (darkIcons) 
                WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS 
            else 0
            controller?.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            controller?.setSystemBarsColor(colorInt)
        } else {
            window.setNavigationBarColor(colorInt)
        }
    }
}

@Composable
fun rememberSystemUiController(): SystemUiController {
    val view = LocalView.current
    val window = (LocalContext.current as Activity).window
    return SystemUiController(view, window)
}