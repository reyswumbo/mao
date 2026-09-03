package com.maomao.domain.repository

import com.maomao.data.model.Chapter
import com.maomao.data.model.ChapterImages
import com.maomao.data.model.Comic
import com.maomao.data.model.ComicDetail
import com.maomao.data.model.HomeData
import com.maomao.data.model.SearchResult
import com.maomao.data.model.SourceResult
import com.maomao.data.source.local.HistoryEntity
import com.maomao.data.source.local.ProgressEntity

interface ComicRepository {
    suspend fun getHomeData(): SourceResult<HomeData>
    suspend fun getComicDetail(url: String): SourceResult<ComicDetail>
    suspend fun getChapterImages(url: String): SourceResult<ChapterImages>
    suspend fun searchComics(query: String, page: Int): SourceResult<SearchResult>
    suspend fun getComicsByCategory(category: String, page: Int): SourceResult<SearchResult>

    suspend fun getFavorites(): List<Comic>
    suspend fun isFavorite(comicId: String): Boolean
    suspend fun addToFavorites(comic: Comic)
    suspend fun removeFromFavorites(comicId: String)
    suspend fun toggleFavorite(comic: Comic)

    suspend fun getReadingHistory(): List<HistoryEntity>
    suspend fun addToHistory(history: HistoryEntity)
    suspend fun clearHistory()
    suspend fun removeFromHistory(historyId: String)

    suspend fun getReadingProgress(chapterUrl: String): ProgressEntity?
    suspend fun saveReadingProgress(progress: ProgressEntity)
    suspend fun deleteReadingProgress(chapterUrl: String)
}