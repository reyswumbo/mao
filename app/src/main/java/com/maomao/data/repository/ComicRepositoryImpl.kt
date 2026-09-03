package com.maomao.data.repository

import com.maomao.data.model.Chapter
import com.maomao.data.model.ChapterImages
import com.maomao.data.model.Comic
import com.maomao.data.model.ComicDetail
import com.maomao.data.model.HomeData
import com.maomao.data.model.SearchResult
import com.maomao.data.model.SourceResult
import com.maomao.data.source.bacakomik.BacaKomikSource
import com.maomao.data.source.local.FavoriteEntity
import com.maomao.data.source.local.HistoryEntity
import com.maomao.data.source.local.MaoMaoDatabase
import com.maomao.data.source.local.ProgressEntity
import com.maomao.domain.repository.ComicRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asLiveData
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext

class ComicRepositoryImpl(
    private val bacaKomikSource: BacaKomikSource,
    private val database: MaoMaoDatabase
) : ComicRepository {

    private val _favoritesFlow = MutableStateFlow<List<Comic>>(emptyList())
    val favoritesFlow = _favoritesFlow
        .distinctUntilChanged()
        .asLiveData()

    override suspend fun getHomeData(): SourceResult<HomeData> {
        return bacaKomikSource.getHomeData()
    }

    override suspend fun getComicDetail(url: String): SourceResult<ComicDetail> {
        return bacaKomikSource.getComicDetail(url)
    }

    override suspend fun getChapterImages(url: String): SourceResult<ChapterImages> {
        return bacaKomikSource.getChapterImages(url)
    }

    override suspend fun searchComics(query: String, page: Int = 1): SourceResult<SearchResult> {
        return bacaKomikSource.searchComics(query, page)
    }

    override suspend fun getComicsByCategory(category: String, page: Int = 1): SourceResult<SearchResult> {
        return bacaKomikSource.getComicsByCategory(category, page)
    }

    override suspend fun getFavorites(): List<Comic> {
        return withContext(Dispatchers.IO) {
            database.favoriteDao().getAllFavoritesSuspend().map { it.toComic() }
        }
    }

    override suspend fun isFavorite(comicId: String): Boolean {
        return withContext(Dispatchers.IO) {
            database.favoriteDao().isFavorite(comicId)
        }
    }

    override suspend fun addToFavorites(comic: Comic) {
        withContext(Dispatchers.IO) {
            database.favoriteDao().insert(FavoriteEntity.fromComic(comic))
            refreshFavorites()
        }
    }

    override suspend fun removeFromFavorites(comicId: String) {
        withContext(Dispatchers.IO) {
            database.favoriteDao().deleteById(comicId)
            refreshFavorites()
        }
    }

    override suspend fun toggleFavorite(comic: Comic) {
        if (isFavorite(comic.id)) {
            removeFromFavorites(comic.id)
        } else {
            addToFavorites(comic)
        }
    }

    override suspend fun getReadingHistory(): List<HistoryEntity> {
        return withContext(Dispatchers.IO) {
            database.historyDao().getRecentHistorySuspend()
        }
    }

    override suspend fun addToHistory(history: HistoryEntity) {
        withContext(Dispatchers.IO) {
            database.historyDao().insert(history)
        }
    }

    override suspend fun clearHistory() {
        withContext(Dispatchers.IO) {
            database.historyDao().clearAll()
        }
    }

    override suspend fun removeFromHistory(historyId: String) {
        withContext(Dispatchers.IO) {
            database.historyDao().deleteById(historyId)
        }
    }

    override suspend fun getReadingProgress(chapterUrl: String): ProgressEntity? {
        return withContext(Dispatchers.IO) {
            database.progressDao().getProgress(chapterUrl)
        }
    }

    override suspend fun saveReadingProgress(progress: ProgressEntity) {
        withContext(Dispatchers.IO) {
            database.progressDao().insert(progress)
        }
    }

    override suspend fun deleteReadingProgress(chapterUrl: String) {
        withContext(Dispatchers.IO) {
            database.progressDao().deleteProgress(chapterUrl)
        }
    }

    private fun refreshFavorites() {
        val favorites = database.favoriteDao().getAllFavoritesSuspend().map { it.toComic() }
        _favoritesFlow.value = favorites
    }
}