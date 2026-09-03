package com.maomao.domain.usecase

import com.maomao.data.model.ChapterImages
import com.maomao.data.model.SourceResult
import com.maomao.domain.repository.ComicRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class GetChapterImagesUseCase @javax.inject.Inject constructor(
    private val repository: ComicRepository
) {
    operator fun invoke(url: String): SourceResult<ChapterImages> = withContext(Dispatchers.IO) {
        repository.getChapterImages(url)
    }
}