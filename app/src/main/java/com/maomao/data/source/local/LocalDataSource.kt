package com.maomao.data.source.local

import androidx.room.*
import com.maomao.data.model.Comic
import kotlinx.serialization.json.Json
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString

@Entity(tableName = "favorites")
data class FavoriteEntity(
    @PrimaryKey val id: String,
    val title: String,
    val coverUrl: String,
    val url: String,
    val rating: Float,
    val status: String,
    val type: String,
    val genresJson: String,
    val author: String,
    val artist: String,
    val synopsis: String,
    val latestChapter: String,
    val latestChapterUrl: String,
    val addedAt: Long = System.currentTimeMillis()
) {
    fun toComic(): Comic {
        val genres = Json.decodeFromString<List<String>>(genresJson)
        return Comic(
            id = id,
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
    }

    companion object {
        fun fromComic(comic: Comic): FavoriteEntity {
            val genresJson = Json.encodeToString(comic.genres)
            return FavoriteEntity(
                id = comic.id,
                title = comic.title,
                coverUrl = comic.coverUrl,
                url = comic.url,
                rating = comic.rating,
                status = comic.status,
                type = comic.type,
                genresJson = genresJson,
                author = comic.author,
                artist = comic.artist,
                synopsis = comic.synopsis,
                latestChapter = comic.latestChapter,
                latestChapterUrl = comic.latestChapterUrl
            )
        }
    }
}

@Entity(tableName = "reading_history")
data class HistoryEntity(
    @PrimaryKey val id: String,
    val comicId: String,
    val comicTitle: String,
    val comicCoverUrl: String,
    val comicUrl: String,
    val chapterId: String,
    val chapterTitle: String,
    val chapterNumber: String,
    val chapterUrl: String,
    val readAt: Long = System.currentTimeMillis(),
    val progress: Float = 0f
)

@Entity(tableName = "reading_progress")
data class ProgressEntity(
    @PrimaryKey val chapterUrl: String,
    val comicId: String,
    val chapterId: String,
    val scrollPosition: Int = 0,
    val totalHeight: Int = 0,
    val currentImageIndex: Int = 0,
    val updatedAt: Long = System.currentTimeMillis()
)

@Dao
interface FavoriteDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(favorite: FavoriteEntity)

    @Delete
    suspend fun delete(favorite: FavoriteEntity)

    @Query("DELETE FROM favorites WHERE id = :id")
    suspend fun deleteById(id: String)

    @Query("SELECT * FROM favorites ORDER BY addedAt DESC")
    fun getAllFavorites(): androidx.lifecycle.LiveData<List<FavoriteEntity>>

    @Query("SELECT * FROM favorites ORDER BY addedAt DESC")
    suspend fun getAllFavoritesSuspend(): List<FavoriteEntity>

    @Query("SELECT EXISTS(SELECT 1 FROM favorites WHERE id = :id)")
    suspend fun isFavorite(id: String): Boolean

    @Query("SELECT COUNT(*) FROM favorites")
    suspend fun getFavoritesCount(): Int
}

@Dao
interface HistoryDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(history: HistoryEntity)

    @Query("DELETE FROM reading_history WHERE id = :id")
    suspend fun deleteById(id: String)

    @Query("DELETE FROM reading_history")
    suspend fun clearAll()

    @Query("SELECT * FROM reading_history ORDER BY readAt DESC LIMIT 100")
    fun getRecentHistory(): androidx.lifecycle.LiveData<List<HistoryEntity>>

    @Query("SELECT * FROM reading_history ORDER BY readAt DESC LIMIT 100")
    suspend fun getRecentHistorySuspend(): List<HistoryEntity>

    @Query("SELECT * FROM reading_history WHERE comicId = :comicId ORDER BY readAt DESC LIMIT 1")
    suspend fun getLatestForComic(comicId: String): HistoryEntity?

    @Query("SELECT COUNT(*) FROM reading_history")
    suspend fun getHistoryCount(): Int
}

@Dao
interface ProgressDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(progress: ProgressEntity)

    @Query("SELECT * FROM reading_progress WHERE chapterUrl = :chapterUrl")
    suspend fun getProgress(chapterUrl: String): ProgressEntity?

    @Query("DELETE FROM reading_progress WHERE chapterUrl = :chapterUrl")
    suspend fun deleteProgress(chapterUrl: String)

    @Query("DELETE FROM reading_progress WHERE comicId = :comicId")
    suspend fun deleteProgressForComic(comicId: String)
}

@Database(
    entities = [FavoriteEntity::class, HistoryEntity::class, ProgressEntity::class],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class MaoMaoDatabase : RoomDatabase() {
    abstract fun favoriteDao(): FavoriteDao
    abstract fun historyDao(): HistoryDao
    abstract fun progressDao(): ProgressDao

    companion object {
        @Volatile private var INSTANCE: MaoMaoDatabase? = null

        fun getInstance(context: android.content.Context): MaoMaoDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    MaoMaoDatabase::class.java,
                    "maomao_database"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}

class Converters {
    @TypeConverter
    fun fromTimestamp(value: Long?): java.util.Date? {
        return value?.let { java.util.Date(it) }
    }

    @TypeConverter
    fun dateToTimestamp(date: java.util.Date?): Long? {
        return date?.time
    }
}

class PreferencesInitializer : androidx.startup.Initializer<androidx.datastore.preferences.PreferencesDataStore> {
    override fun create(context: android.content.Context): androidx.datastore.preferences.PreferencesDataStore {
        return androidx.datastore.preferences.PreferencesDataStoreFactory.create(
            scope = context,
            name = "maomao_preferences"
        )
    }

    override fun dependencies(): List<Class<out androidx.startup.Initializer<*>>> = emptyList()
}