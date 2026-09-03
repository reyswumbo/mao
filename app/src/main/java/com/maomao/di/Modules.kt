package com.maomao.di

import com.maomao.data.model.SourceResult
import com.maomao.data.repository.ComicRepositoryImpl
import com.maomao.data.source.bacakomik.BacaKomikScraperImpl
import com.maomao.data.source.bacakomik.BacaKomikSource
import com.maomao.data.source.local.MaoMaoDatabase
import com.maomao.domain.repository.ComicRepository
import com.maomao.domain.usecase.*
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.android.scopes.ActivityRetainedScoped
import dagger.hilt.android.scopes.ViewModelScoped
import dagger.hilt.install.InstallIn
import dagger.hilt.components.SingletonComponent
import dagger.hilt.components.ViewModelComponent
import dagger.hilt.components.ActivityRetainedComponent
import dagger.Module
import dagger.Provides
import dagger.hilt.EntryPoint
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Inject
import javax.inject.Singleton
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import java.util.concurrent.TimeUnit

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        return OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideBacaKomikSource(okHttpClient: OkHttpClient): BacaKomikSource {
        return BacaKomikScraperImpl(okHttpClient)
    }
}

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: android.content.Context): MaoMaoDatabase {
        return MaoMaoDatabase.getInstance(context)
    }

    @Provides
    @Singleton
    fun providePreferencesDataStore(@ApplicationContext context: android.content.Context): androidx.datastore.preferences.PreferencesDataStore {
        return androidx.datastore.preferences.PreferencesDataStoreFactory.create(
            scope = context,
            name = "maomao_preferences"
        )
    }
}

@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {

    @Provides
    @Singleton
    fun provideComicRepository(
        bacaKomikSource: BacaKomikSource,
        database: MaoMaoDatabase
    ): ComicRepository {
        return ComicRepositoryImpl(bacaKomikSource, database)
    }
}

@Module
@InstallIn(ViewModelComponent::class)
object UseCaseModule {

    @Provides
    @ViewModelScoped
    fun provideGetHomeDataUseCase(repository: ComicRepository): GetHomeDataUseCase {
        return GetHomeDataUseCase(repository)
    }

    @Provides
    @ViewModelScoped
    fun provideGetComicDetailUseCase(repository: ComicRepository): GetComicDetailUseCase {
        return GetComicDetailUseCase(repository)
    }

    @Provides
    @ViewModelScoped
    fun provideGetChapterImagesUseCase(repository: ComicRepository): GetChapterImagesUseCase {
        return GetChapterImagesUseCase(repository)
    }

    @Provides
    @ViewModelScoped
    fun provideSearchComicsUseCase(repository: ComicRepository): SearchComicsUseCase {
        return SearchComicsUseCase(repository)
    }

    @Provides
    @ViewModelScoped
    fun provideGetComicsByCategoryUseCase(repository: ComicRepository): GetComicsByCategoryUseCase {
        return GetComicsByCategoryUseCase(repository)
    }

    @Provides
    @ViewModelScoped
    fun provideGetFavoritesUseCase(repository: ComicRepository): GetFavoritesUseCase {
        return GetFavoritesUseCase(repository)
    }

    @Provides
    @ViewModelScoped
    fun provideIsFavoriteUseCase(repository: ComicRepository): IsFavoriteUseCase {
        return IsFavoriteUseCase(repository)
    }

    @Provides
    @ViewModelScoped
    fun provideToggleFavoriteUseCase(repository: ComicRepository): ToggleFavoriteUseCase {
        return ToggleFavoriteUseCase(repository)
    }

    @Provides
    @ViewModelScoped
    fun provideGetReadingHistoryUseCase(repository: ComicRepository): GetReadingHistoryUseCase {
        return GetReadingHistoryUseCase(repository)
    }

    @Provides
    @ViewModelScoped
    fun provideAddToHistoryUseCase(repository: ComicRepository): AddToHistoryUseCase {
        return AddToHistoryUseCase(repository)
    }

    @Provides
    @ViewModelScoped
    fun provideClearHistoryUseCase(repository: ComicRepository): ClearHistoryUseCase {
        return ClearHistoryUseCase(repository)
    }

    @Provides
    @ViewModelScoped
    fun provideRemoveFromHistoryUseCase(repository: ComicRepository): RemoveFromHistoryUseCase {
        return RemoveFromHistoryUseCase(repository)
    }

    @Provides
    @ViewModelScoped
    fun provideGetReadingProgressUseCase(repository: ComicRepository): GetReadingProgressUseCase {
        return GetReadingProgressUseCase(repository)
    }

    @Provides
    @ViewModelScoped
    fun provideSaveReadingProgressUseCase(repository: ComicRepository): SaveReadingProgressUseCase {
        return SaveReadingProgressUseCase(repository)
    }

    @Provides
    @ViewModelScoped
    fun provideDeleteReadingProgressUseCase(repository: ComicRepository): DeleteReadingProgressUseCase {
        return DeleteReadingProgressUseCase(repository)
    }
}