package com.maomao.data.source.bacakomik

import com.maomao.data.model.Chapter
import com.maomao.data.model.ChapterImages
import com.maomao.data.model.Comic
import com.maomao.data.model.ComicDetail
import com.maomao.data.model.HomeData
import com.maomao.data.model.SearchResult
import com.maomao.data.model.SourceResult
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import org.jsoup.Jsoup
import org.jsoup.nodes.Document
import org.jsoup.select.Elements
import java.net.URLEncoder
import java.util.concurrent.TimeUnit

interface BacaKomikSource {
    suspend fun getHomeData(): SourceResult<HomeData>
    suspend fun getComicDetail(url: String): SourceResult<ComicDetail>
    suspend fun getChapterImages(url: String): SourceResult<ChapterImages>
    suspend fun searchComics(query: String, page: Int = 1): SourceResult<SearchResult>
    suspend fun getComicsByCategory(category: String, page: Int = 1): SourceResult<SearchResult>
}

class BacaKomikScraperImpl(
    private val okHttpClient: OkHttpClient
) : BacaKomikSource {

    private val baseUrl = "https://bacakomik.my"
    private val userAgent = "Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36"

    override suspend fun getHomeData(): SourceResult<HomeData> = withContext(Dispatchers.IO) {
        try {
            val doc = fetchDocument("$baseUrl/")
            
            val popular = parseComicList(doc, ".bacalist .bsx")?.take(10) ?: emptyList()
            val latest = parseComicList(doc, ".bacalist .bsx")?.take(10) ?: emptyList()
            val ongoing = parseComicList(doc, ".bacalist .bsx")?.take(10) ?: emptyList()
            val completed = parseComicList(doc, ".bacalist .bsx")?.take(10) ?: emptyList()

            SourceResult.Success(HomeData(
                popular = popular,
                latest = latest,
                ongoing = ongoing,
                completed = completed
            ))
        } catch (e: Exception) {
            SourceResult.Error("Gagal memuat beranda: ${e.message}", e)
        }
    }

    override suspend fun getComicDetail(url: String): SourceResult<ComicDetail> = withContext(Dispatchers.IO) {
        try {
            val doc = fetchDocument(url)
            
            val coverUrl = doc.selectFirst(".infox .thumb img")?.attr("src") ?: ""
            val title = doc.selectFirst(".infox .entry-title")?.text() ?: ""
            val rating = doc.selectFirst(".infox .numscore")?.text()?.toFloatOrNull() ?: 0f
            
            val infoItems = doc.select(".infox .spe .speitem")
            var status = ""
            var type = ""
            var author = ""
            var artist = ""
            var genres = mutableListOf<String>()
            
            for (item in infoItems) {
                val label = item.selectFirst("b")?.text()?.lowercase() ?: ""
                val value = item.ownText().trim()
                when {
                    label.contains("status") -> status = value
                    label.contains("type") -> type = value
                    label.contains("author") -> author = value
                    label.contains("artist") -> artist = value
                    label.contains("genre") -> genres = item.select("a").map { it.text() }
                }
            }
            
            val synopsis = doc.selectFirst(".infox .sinopc .entry-content")?.text() ?: ""
            
            val chapters = parseChapterList(doc)
            
            val latestChapter = chapters.firstOrNull()?.title ?: ""
            val latestChapterUrl = chapters.firstOrNull()?.url ?: ""
            
            val comic = Comic(
                id = extractIdFromUrl(url),
                title = title,
                coverUrl = coverUrl,
                url = url,
                rating = rating,
                status = status,
                type = type,
                genres = genres,
                author = author,
                artist = artist,
                synopsis = synopsis,
                latestChapter = latestChapter,
                latestChapterUrl = latestChapterUrl
            )
            
            SourceResult.Success(ComicDetail(comic = comic, chapters = chapters))
        } catch (e: Exception) {
            SourceResult.Error("Gagal memuat detail komik: ${e.message}", e)
        }
    }

    override suspend fun getChapterImages(url: String): SourceResult<ChapterImages> = withContext(Dispatchers.IO) {
        try {
            val doc = fetchDocument(url)
            
            val images = doc.select("#chapter_img img").map { it.attr("src") }.filter { it.isNotBlank() }
            
            val prevUrl = doc.selectFirst(".navi-prev a")?.attr("href") ?: ""
            val nextUrl = doc.selectFirst(".navi-next a")?.attr("href") ?: ""
            
            SourceResult.Success(ChapterImages(
                images = images,
                prevChapterUrl = if (prevUrl.startsWith("http")) prevUrl else baseUrl + prevUrl,
                nextChapterUrl = if (nextUrl.startsWith("http")) nextUrl else baseUrl + nextUrl
            ))
        } catch (e: Exception) {
            SourceResult.Error("Gagal memuat gambar chapter: ${e.message}", e)
        }
    }

    override suspend fun searchComics(query: String, page: Int = 1): SourceResult<SearchResult> = withContext(Dispatchers.IO) {
        try {
            val encodedQuery = URLEncoder.encode(query, "UTF-8")
            val url = "$baseUrl/?s=$encodedQuery&page=$page"
            val doc = fetchDocument(url)
            
            val comics = parseComicList(doc, ".bacalist .bsx") ?: emptyList()
            val hasNext = doc.selectFirst(".pagination .next") != null
            val nextPageUrl = if (hasNext) "$baseUrl/?s=$encodedQuery&page=${page + 1}" else ""
            
            SourceResult.Success(SearchResult(
                comics = comics,
                hasNextPage = hasNext,
                nextPageUrl = nextPageUrl
            ))
        } catch (e: Exception) {
            SourceResult.Error("Gagal mencari komik: ${e.message}", e)
        }
    }

    override suspend fun getComicsByCategory(category: String, page: Int = 1): SourceResult<SearchResult> = withContext(Dispatchers.IO) {
        try {
            val url = "$baseUrl/genre/$category/page/$page/"
            val doc = fetchDocument(url)
            
            val comics = parseComicList(doc, ".bacalist .bsx") ?: emptyList()
            val hasNext = doc.selectFirst(".pagination .next") != null
            val nextPageUrl = if (hasNext) "$baseUrl/genre/$category/page/${page + 1}/" else ""
            
            SourceResult.Success(SearchResult(
                comics = comics,
                hasNextPage = hasNext,
                nextPageUrl = nextPageUrl
            ))
        } catch (e: Exception) {
            SourceResult.Error("Gagal memuat kategori: ${e.message}", e)
        }
    }

    private suspend fun fetchDocument(url: String): Document {
        val request = okhttp3.Request.Builder()
            .url(url)
            .header("User-Agent", userAgent)
            .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
            .build()
        
        val response = okHttpClient.newCall(request).execute()
        if (!response.isSuccessful) {
            throw Exception("HTTP ${response.code}")
        }
        val body = response.body?.string() ?: throw Exception("Empty response")
        return Jsoup.parse(body, url)
    }

    private fun parseComicList(doc: Document, selector: String): List<Comic>? {
        return doc.select(selector).mapNotNull { element ->
            val link = element.selectFirst("a")?.attr("href") ?: return@mapNotNull null
            val title = element.selectFirst(".tt h3")?.text() 
                ?: element.selectFirst(".info .title")?.text() 
                ?: element.selectFirst("img")?.attr("alt") 
                ?: return@mapNotNull null
            val coverUrl = element.selectFirst("img")?.attr("src") ?: ""
            val rating = element.selectFirst(".numscore")?.text()?.toFloatOrNull() ?: 0f
            
            Comic(
                id = extractIdFromUrl(link),
                title = title,
                coverUrl = coverUrl,
                url = if (link.startsWith("http")) link else baseUrl + link,
                rating = rating
            )
        }
    }

    private fun parseChapterList(doc: Document): List<Chapter> {
        return doc.select(".chlist .eplister li, .chlist .clstyle li").mapNotNull { element ->
            val link = element.selectFirst("a")?.attr("href") ?: return@mapNotNull null
            val title = element.selectFirst(".epl-title, .chl-title, .chapternum")?.text() 
                ?: element.selectFirst("a")?.attr("title") 
                ?: return@mapNotNull null
            val chapterNum = element.selectFirst(".chapternum, .chl-num")?.text() 
                ?: extractChapterNumber(title)
            val releasedAt = element.selectFirst(".epl-date, .chl-date")?.text() ?: ""
            
            Chapter(
                id = extractIdFromUrl(link),
                title = title,
                number = chapterNum,
                url = if (link.startsWith("http")) link else baseUrl + link,
                releasedAt = releasedAt
            )
        }.reversed()
    }

    private fun extractIdFromUrl(url: String): String {
        return url.substringAfterLast("/").replace(".html", "").replace("/", "")
    }

    private fun extractChapterNumber(title: String): String {
        val regex = """Chapter\s+(\d+\.?\d*)""".toRegex()
        return regex.find(title)?.groupValues?.get(1) ?: title
    }
}

class BacaKomikApiImpl(
    private val okHttpClient: OkHttpClient
) : BacaKomikSource {

    private val baseUrl = "https://bacakomik.my"

    override suspend fun getHomeData(): SourceResult<HomeData> = SourceResult.Error("API not implemented")
    override suspend fun getComicDetail(url: String): SourceResult<ComicDetail> = SourceResult.Error("API not implemented")
    override suspend fun getChapterImages(url: String): SourceResult<ChapterImages> = SourceResult.Error("API not implemented")
    override suspend fun searchComics(query: String, page: Int = 1): SourceResult<SearchResult> = SourceResult.Error("API not implemented")
    override suspend fun getComicsByCategory(category: String, page: Int = 1): SourceResult<SearchResult> = SourceResult.Error("API not implemented")
}