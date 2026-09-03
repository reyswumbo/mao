package com.maomao.presentation.reader

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.maomao.data.model.Chapter
import com.maomao.data.model.ChapterImages
import com.maomao.data.model.Comic
import com.maomao.data.model.SourceResult
import com.maomao.data.source.local.ProgressEntity
import com.maomao.domain.usecase.DeleteReadingProgressUseCase
import com.maomao.domain.usecase.GetChapterImagesUseCase
import com.maomao.domain.usecase.GetReadingProgressUseCase
import com.maomao.domain.usecase.SaveReadingProgressUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ReaderViewModel @Inject constructor(
    private val getChapterImagesUseCase: GetChapterImagesUseCase,
    private val getReadingProgressUseCase: GetReadingProgressUseCase,
    private val saveReadingProgressUseCase: SaveReadingProgressUseCase,
    private val deleteReadingProgressUseCase: DeleteReadingProgressUseCase
) : ViewModel() {

    var chapterImages by mutableStateOf<ChapterImages?>(null)
        private set
    var loading by mutableStateOf(false)
        private set
    var error by mutableStateOf<String?>(null)
        private set
    var currentImageIndex by mutableStateOf(0)
        private set
    var scrollPosition by mutableStateOf(0)
        private set
    var totalHeight by mutableStateOf(0)
        private set

    fun loadChapterImages(url: String) {
        if (loading) return
        loading = true
        error = null
        
        viewModelScope.launch {
            val result = getChapterImagesUseCase(url)
            result.onSuccess {
                chapterImages = it
                loadProgress(url)
                loading = false
            }.onError {
                error = it.message
                loading = false
            }
        }
    }

    fun loadProgress(chapterUrl: String) {
        viewModelScope.launch {
            val progress = getReadingProgressUseCase(chapterUrl)
            progress?.let {
                currentImageIndex = it.currentImageIndex
                scrollPosition = it.scrollPosition
                totalHeight = it.totalHeight
            }
        }
    }

    fun saveProgress(chapterUrl: String, comicId: String, chapterId: String) {
        val progress = ProgressEntity(
            chapterUrl = chapterUrl,
            comicId = comicId,
            chapterId = chapterId,
            scrollPosition = scrollPosition,
            totalHeight = totalHeight,
            currentImageIndex = currentImageIndex
        )
        viewModelScope.launch {
            saveReadingProgressUseCase(progress)
        }
    }

    fun deleteProgress(chapterUrl: String) {
        viewModelScope.launch {
            deleteReadingProgressUseCase(chapterUrl)
        }
    }

    fun setCurrentImageIndex(index: Int) {
        currentImageIndex = index
    }

    fun setScrollPosition(position: Int, height: Int) {
        scrollPosition = position
        totalHeight = height
    }

    fun goToNextChapter() {
        chapterImages?.nextChapterUrl?.let { url ->
            if (url.isNotBlank()) {
                loadChapterImages(url)
            }
        }
    }

    fun goToPrevChapter() {
        chapterImages?.prevChapterUrl?.let { url ->
            if (url.isNotBlank()) {
                loadChapterImages(url)
            }
        }
    }

    fun retry(url: String) {
        loadChapterImages(url)
    }
}