package com.maomao.domain.usecase

import com.maomao.data.model.Comic
import com.maomao.domain.repository.ComicRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class GetFavoritesUseCase @javax.inject.Inject constructor(
    private val repository: ComicRepository
) {
    operator fun invoke(): List<Comic> = withContext(Dispatchers.IO) {
        repository.getFavorites()
    }
}