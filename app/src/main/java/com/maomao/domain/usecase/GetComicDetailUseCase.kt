package com.maomao.domain.usecase

import com.maomao.data.model.ComicDetail
import com.maomao.data.model.SourceResult
import com.maomao.domain.repository.ComicRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class GetComicDetailUseCase @javax.inject.Inject constructor(
    private val repository: ComicRepository
) {
    operator fun invoke(url: String): SourceResult<ComicDetail> = withContext(Dispatchers.IO) {
        repository.getComicDetail(url)
    }
}