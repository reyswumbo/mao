package com.maomao.presentation.detail

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.maomao.data.model.Chapter
import com.maomao.data.model.Comic
import com.maomao.data.model.ComicDetail
import com.maomao.data.model.SourceResult
import com.maomao.domain.usecase.GetComicDetailUseCase
import com.maomao.domain.usecase.IsFavoriteUseCase
import com.maomao.domain.usecase.ToggleFavoriteUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class DetailViewModel @Inject constructor(
    private val getComicDetailUseCase: GetComicDetailUseCase,
    private val isFavoriteUseCase: IsFavoriteUseCase,
    private val toggleFavoriteUseCase: ToggleFavoriteUseCase
) : ViewModel() {

    var comicDetail by mutableStateOf<ComicDetail?>(null)
        private set
    var loading by mutableStateOf(false)
        private set
    var error by mutableStateOf<String?>(null)
        private set
    var isFavorite by mutableStateOf(false)
        private set

    fun loadComicDetail(url: String) {
        if (loading) return
        loading = true
        error = null
        
        viewModelScope.launch {
            val result = getComicDetailUseCase(url)
            result.onSuccess {
                comicDetail = it
                isFavorite = isFavoriteUseCase(it.comic.id)
                loading = false
            }.onError {
                error = it.message
                loading = false
            }
        }
    }

    fun toggleFavorite() {
        comicDetail?.let { detail ->
            viewModelScope.launch {
                toggleFavoriteUseCase(detail.comic)
                isFavorite = !isFavorite
            }
        }
    }

    fun retry(url: String) {
        loadComicDetail(url)
    }
}