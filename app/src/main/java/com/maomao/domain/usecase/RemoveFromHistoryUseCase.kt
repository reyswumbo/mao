package com.maomao.domain.usecase

import com.maomao.domain.repository.ComicRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class RemoveFromHistoryUseCase @javax.inject.Inject constructor(
    private val repository: ComicRepository
) {
    operator fun invoke(historyId: String) = withContext(Dispatchers.IO) {
        repository.removeFromHistory(historyId)
    }
}