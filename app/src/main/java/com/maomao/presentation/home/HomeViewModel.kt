package com.maomao.presentation.home

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.observableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.maomao.data.model.HomeData
import com.maomao.data.model.SourceResult
import com.maomao.domain.usecase.GetHomeDataUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val getHomeDataUseCase: GetHomeDataUseCase
) : ViewModel() {

    var homeData by mutableStateOf<HomeData?>(null)
        private set
    var loading by mutableStateOf(false)
        private set
    var error by mutableStateOf<String?>(null)
        private set

    fun loadHomeData() {
        if (loading) return
        loading = true
        error = null
        
        viewModelScope.launch {
            val result = getHomeDataUseCase()
            result.onSuccess {
                homeData = it
                loading = false
            }.onError {
                error = it.message
                loading = false
            }
        }
    }

    fun retry() {
        loadHomeData()
    }
}