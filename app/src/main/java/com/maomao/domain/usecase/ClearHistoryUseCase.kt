package com.maomao.domain.usecase

import com.maomao.domain.repository.ComicRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class ClearHistoryUseCase @javax.inject.Inject constructor(
    private val repository: ComicRepository
) {
    operator fun invoke() = withContext(Dispatchers.IO) {
        repository.clearHistory()
    }
}