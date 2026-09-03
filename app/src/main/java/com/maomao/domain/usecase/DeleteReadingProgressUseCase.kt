package com.maomao.domain.usecase

import com.maomao.domain.repository.ComicRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class DeleteReadingProgressUseCase @javax.inject.Inject constructor(
    private val repository: ComicRepository
) {
    operator fun invoke(chapterUrl: String) = withContext(Dispatchers.IO) {
        repository.deleteReadingProgress(chapterUrl)
    }
}