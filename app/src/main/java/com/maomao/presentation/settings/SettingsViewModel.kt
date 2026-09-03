package com.maomao.presentation.settings

import android.content.Context
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.PreferencesDataStore
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.maomao.data.source.local.MaoMaoDatabase
import com.maomao.domain.usecase.ClearHistoryUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val dataStore: PreferencesDataStore,
    private val database: MaoMaoDatabase,
    private val clearHistoryUseCase: ClearHistoryUseCase
) : ViewModel() {

    companion object {
        val THEME_KEY = intPreferencesKey("theme_mode") // 0 = system, 1 = light, 2 = dark
        val READER_BG_KEY = intPreferencesKey("reader_background") // 0 = white, 1 = black, 2 = gray, 3 = sepia
        val READER_SCROLL_KEY = intPreferencesKey("reader_scroll_mode") // 0 = vertical, 1 = horizontal
        val AUTO_LOAD_IMAGES_KEY = booleanPreferencesKey("auto_load_images")
    }

    var themeMode by mutableStateOf(0)
        private set
    var readerBackground by mutableStateOf(0)
        private set
    var readerScrollMode by mutableStateOf(0)
        private set
    var autoLoadImages by mutableStateOf(true)
        private set

    init {
        loadSettings()
    }

    private fun loadSettings() {
        viewModelScope.launch {
            dataStore.data.map { prefs ->
                themeMode = prefs[THEME_KEY] ?: 0
                readerBackground = prefs[READER_BG_KEY] ?: 0
                readerScrollMode = prefs[READER_SCROLL_KEY] ?: 0
                autoLoadImages = prefs[AUTO_LOAD_IMAGES_KEY] ?: true
            }.collect()
        }
    }

    fun setThemeMode(mode: Int) {
        themeMode = mode
        viewModelScope.launch {
            dataStore.edit { prefs ->
                prefs[THEME_KEY] = mode
            }
        }
    }

    fun setReaderBackground(bg: Int) {
        readerBackground = bg
        viewModelScope.launch {
            dataStore.edit { prefs ->
                prefs[READER_BG_KEY] = bg
            }
        }
    }

    fun setReaderScrollMode(mode: Int) {
        readerScrollMode = mode
        viewModelScope.launch {
            dataStore.edit { prefs ->
                prefs[READER_SCROLL_KEY] = mode
            }
        }
    }

    fun setAutoLoadImages(enabled: Boolean) {
        autoLoadImages = enabled
        viewModelScope.launch {
            dataStore.edit { prefs ->
                prefs[AUTO_LOAD_IMAGES_KEY] = enabled
            }
        }
    }

    fun clearCache() {
        viewModelScope.launch {
            database.progressDao().deleteProgressForComic("")
            // Clear Coil cache would be done via Coil's ImageLoader
        }
    }

    fun clearAllData() {
        viewModelScope.launch {
            clearHistoryUseCase()
            database.favoriteDao().getAllFavoritesSuspend().forEach { fav ->
                database.favoriteDao().deleteById(fav.id)
            }
        }
    }
}