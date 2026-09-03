package com.maomao.presentation.history

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.maomao.data.source.local.HistoryEntity
import com.maomao.domain.usecase.AddToHistoryUseCase
import com.maomao.domain.usecase.ClearHistoryUseCase
import com.maomao.domain.usecase.GetReadingHistoryUseCase
import com.maomao.domain.usecase.RemoveFromHistoryUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class HistoryViewModel @Inject constructor(
    private val getReadingHistoryUseCase: GetReadingHistoryUseCase,
    private val addToHistoryUseCase: AddToHistoryUseCase,
    private val clearHistoryUseCase: ClearHistoryUseCase,
    private val removeFromHistoryUseCase: RemoveFromHistoryUseCase
) : ViewModel() {

    var history = mutableStateListOf<HistoryEntity>()
    var loading by mutableStateOf(false)
        private set
    var error by mutableStateOf<String?>(null)
        private set

    fun loadHistory() {
        if (loading) return
        loading = true
        error = null
        
        viewModelScope.launch {
            try {
                val result = getReadingHistoryUseCase()
                history.clear()
                history.addAll(result)
                loading = false
            } catch (e: Exception) {
                error = e.message
                loading = false
            }
        }
    }

    fun addHistory(historyItem: HistoryEntity) {
        viewModelScope.launch {
            addToHistoryUseCase(historyItem)
            loadHistory()
        }
    }

    fun clearAllHistory() {
        viewModelScope.launch {
            clearHistoryUseCase()
            history.clear()
        }
    }

    fun removeHistory(historyId: String) {
        viewModelScope.launch {
            removeFromHistoryUseCase(historyId)
            loadHistory()
        }
    }
}