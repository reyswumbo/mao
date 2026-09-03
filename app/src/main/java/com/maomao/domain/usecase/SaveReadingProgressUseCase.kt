package com.maomao.domain.usecase

import com.maomao.data.source.local.ProgressEntity
import com.maomao.domain.repository.ComicRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class SaveReadingProgressUseCase @javax.inject.Inject constructor(
    private val repository: ComicRepository
) {
    operator fun invoke(progress: ProgressEntity) = withContext(Dispatchers.IO) {
        repository.saveReadingProgress(progress)
    }
}