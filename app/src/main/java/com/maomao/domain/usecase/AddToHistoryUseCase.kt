package com.maomao.domain.usecase

import com.maomao.data.source.local.HistoryEntity
import com.maomao.domain.repository.ComicRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class AddToHistoryUseCase @javax.inject.Inject constructor(
    private val repository: ComicRepository
) {
    operator fun invoke(history: HistoryEntity) = withContext(Dispatchers.IO) {
        repository.addToHistory(history)
    }
}