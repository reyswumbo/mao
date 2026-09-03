package com.maomao.domain.usecase

import com.maomao.data.model.HomeData
import com.maomao.data.model.SourceResult
import com.maomao.domain.repository.ComicRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class GetHomeDataUseCase @javax.inject.Inject constructor(
    private val repository: ComicRepository
) {
    operator fun invoke(): SourceResult<HomeData> = withContext(Dispatchers.IO) {
        repository.getHomeData()
    }
}