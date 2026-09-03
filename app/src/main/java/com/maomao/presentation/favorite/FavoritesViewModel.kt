package com.maomao.presentation.favorite

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.maomao.data.model.Comic
import com.maomao.domain.usecase.GetFavoritesUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class FavoritesViewModel @Inject constructor(
    private val getFavoritesUseCase: GetFavoritesUseCase
) : ViewModel() {

    var favorites = mutableStateListOf<Comic>()
    var loading by mutableStateOf(false)
        private set
    var error by mutableStateOf<String?>(null)
        private set

    fun loadFavorites() {
        if (loading) return
        loading = true
        error = null
        
        viewModelScope.launch {
            try {
                val result = getFavoritesUseCase()
                favorites.clear()
                favorites.addAll(result)
                loading = false
            } catch (e: Exception) {
                error = e.message
                loading = false
            }
        }
    }
}