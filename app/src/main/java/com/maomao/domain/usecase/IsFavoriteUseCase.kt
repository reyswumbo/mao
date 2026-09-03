package com.maomao.domain.usecase

import com.maomao.domain.repository.ComicRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class IsFavoriteUseCase @javax.inject.Inject constructor(
    private val repository: ComicRepository
) {
    operator fun invoke(comicId: String): Boolean = withContext(Dispatchers.IO) {
        repository.isFavorite(comicId)
    }
}