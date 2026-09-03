package com.maomao.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Comic(
    val id: String,
    val title: String,
    val coverUrl: String,
    val url: String,
    val rating: Float = 0f,
    val status: String = "",
    val type: String = "",
    val genres: List<String> = emptyList(),
    val author: String = "",
    val artist: String = "",
    val synopsis: String = "",
    val latestChapter: String = "",
    val latestChapterUrl: String = "",
    val updatedAt: String = ""
) {
    companion object {
        fun createPlaceholder(id: String, title: String): Comic {
            return Comic(
                id = id,
                title = title,
                coverUrl = "",
                url = ""
            )
        }
    }
}

@Serializable
data class ComicDetail(
    val comic: Comic,
    val chapters: List<Chapter> = emptyList()
)

@Serializable
data class Chapter(
    val id: String,
    val title: String,
    val number: String,
    val url: String,
    val releasedAt: String = "",
    val images: List<String> = emptyList()
) {
    val displayTitle: String
        get() = if (title.isNotBlank()) title else "Chapter $number"
}

@Serializable
data class ChapterImages(
    val images: List<String> = emptyList(),
    val prevChapterUrl: String = "",
    val nextChapterUrl: String = ""
)

@Serializable
data class SearchResult(
    val comics: List<Comic> = emptyList(),
    val hasNextPage: Boolean = false,
    val nextPageUrl: String = ""
)

@Serializable
data class HomeData(
    val popular: List<Comic> = emptyList(),
    val latest: List<Comic> = emptyList(),
    val ongoing: List<Comic> = emptyList(),
    val completed: List<Comic> = emptyList()
)

sealed interface SourceResult<out T> {
    data class Success<out T>(val data: T) : SourceResult<T>
    data class Error(val message: String, val throwable: Throwable? = null) : SourceResult<Nothing>
    object Loading : SourceResult<Nothing>
}