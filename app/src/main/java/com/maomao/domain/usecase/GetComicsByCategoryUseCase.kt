package com.maomao.domain.usecase

import com.maomao.data.model.SearchResult
import com.maomao.data.model.SourceResult
import com.maomao.domain.repository.ComicRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class GetComicsByCategoryUseCase @javax.inject.Inject constructor(
    private val repository: ComicRepository
) {
    operator fun invoke(category: String, page: Int = 1): SourceResult<SearchResult> = withContext(Dispatchers.IO) {
        repository.getComicsByCategory(category, page)
    }
}