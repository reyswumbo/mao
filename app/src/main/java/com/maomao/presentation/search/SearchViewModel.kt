package com.maomao.presentation.search

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.maomao.data.model.Comic
import com.maomao.data.model.SearchResult
import com.maomao.data.model.SourceResult
import com.maomao.domain.usecase.SearchComicsUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SearchViewModel @Inject constructor(
    private val searchComicsUseCase: SearchComicsUseCase
) : ViewModel() {

    var comics = mutableStateListOf<Comic>()
    var loading by mutableStateOf(false)
        private set
    var loadingMore by mutableStateOf(false)
        private set
    var error by mutableStateOf<String?>(null)
        private set
    var hasNextPage by mutableStateOf(false)
        private set
    var currentPage by mutableStateOf(1)
        private set
    var currentQuery by mutableStateOf("")
        private set

    fun search(query: String) {
        if (loading) return
        currentQuery = query
        currentPage = 1
        comics.clear()
        loading = true
        error = null
        
        viewModelScope.launch {
            val result = searchComicsUseCase(query, 1)
            result.onSuccess {
                comics.addAll(it.comics)
                hasNextPage = it.hasNextPage
                currentPage = 2
                loading = false
            }.onError {
                error = it.message
                loading = false
            }
        }
    }

    fun loadMore() {
        if (loadingMore || !hasNextPage || currentQuery.isBlank()) return
        loadingMore = true
        
        viewModelScope.launch {
            val result = searchComicsUseCase(currentQuery, currentPage)
            result.onSuccess {
                comics.addAll(it.comics)
                hasNextPage = it.hasNextPage
                currentPage++
                loadingMore = false
            }.onError {
                error = it.message
                loadingMore = false
            }
        }
    }

    fun clear() {
        comics.clear()
        currentQuery = ""
        currentPage = 1
        hasNextPage = false
        error = null
    }
}