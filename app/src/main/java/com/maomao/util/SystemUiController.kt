package com.maomao.util

import android.app.Activity
import android.graphics.Color
import android.os.Build
import android.view.View
import android.view.Window
import android.view.WindowInsetsController
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat
import androidx.core.view.setSystemBarsColor
import com.google.accompanist.systemuicontroller.RememberSystemUiController
import com.google.accompanist.systemuicontroller.SystemUiController
import com.google.accompanist.systemuicontroller.setStatusBarColor
import com.google.accompanist.systemuicontroller.setNavigationBarColor

fun rememberSystemUiController(): SystemUiController {
    val view = LocalView.current
    return RememberSystemUiController(view)
}

fun SystemUiController.setSystemBarsColor(
    color: androidx.compose.ui.graphics.Color,
    darkIcons: Boolean
) {
    val window = (LocalContext.current as Activity).window
    WindowCompat.setDecorFitsSystemWindows(window, false)
    
    val colorInt = color.toArgb()
    
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
        val controller = window.insetsController
        controller?.systemBarsAppearance = if (darkIcons) 
            WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS 
        else 0
        controller?.systemBarsBehavior = WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    }
    
    setStatusBarColor(color = colorInt, darkIcons = darkIcons)
    setNavigationBarColor(color = colorInt, darkIcons = darkIcons)
}