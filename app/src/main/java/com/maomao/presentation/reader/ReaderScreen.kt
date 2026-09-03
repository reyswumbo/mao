package com.maomao.presentation.reader

import android.os.Build
import android.view.View
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Slider
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.unit.px
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.compose.NavController
import coil3.compose.AsyncImage
import coil3.compose.rememberAsyncImagePainter
import coil3.request.ImageRequest
import com.maomao.data.model.Chapter
import com.maomao.data.source.local.ProgressEntity
import com.maomao.presentation.common.LoadingIndicator
import com.maomao.util.SystemUiController
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@Composable
fun ReaderScreen(
    navController: NavController,
    chapterUrl: String,
    viewModel: ReaderViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val systemUiController = rememberSystemUiController()
    
    val chapterImages by viewModel.chapterImages.collectAsStateWithLifecycle()
    val loading by viewModel.loading.collectAsStateWithLifecycle()
    val error by viewModel.error.collectAsStateWithLifecycle()
    val currentImageIndex by viewModel.currentImageIndex.collectAsStateWithLifecycle()
    val scrollPosition by viewModel.scrollPosition.collectAsStateWithLifecycle()
    val totalHeight by viewModel.totalHeight.collectAsStateWithLifecycle()

    var showControls by remember { mutableStateOf(true) }
    var showChapterList by remember { mutableStateOf(false) }
    var showSettings by remember { mutableStateOf(false) }
    var isFullscreen by remember { mutableStateOf(true) }

    // System UI handling
    DisposableEffect(Unit) {
        systemUiController.setSystemBarsColor(
            color = androidx.compose.material3.MaterialTheme.colorScheme.background,
            darkIcons = androidx.compose.material3.MaterialTheme.colorScheme.isLight
        )
        systemUiController.setNavigationBarsColor(
            color = androidx.compose.material3.MaterialTheme.colorScheme.background,
            darkIcons = androidx.compose.material3.MaterialTheme.colorScheme.isLight
        )
        onDispose {
            systemUiController.setSystemBarsColor(
                color = androidx.compose.material3.MaterialTheme.colorScheme.background,
                darkIcons = androidx.compose.material3.MaterialTheme.colorScheme.isLight
            )
        }
    }

    // Auto-hide controls
    LaunchedEffect(showControls) {
        if (showControls) {
            kotlinx.coroutines.delay(3000)
            showControls = false
        }
    }

    // Save progress periodically
    LaunchedEffect(chapterImages, currentImageIndex, scrollPosition) {
        if (chapterImages != null) {
            kotlinx.coroutines.delay(2000)
            viewModel.saveProgress(chapterUrl, "", "")
        }
    }

    Scaffold(
        topBar = if (showControls) {
            {
                ReaderTopBar(
                    title = chapterImages?.images?.getOrNull(currentImageIndex)?.let { "Halaman ${currentImageIndex + 1}" } ?: "",
                    onBackClick = { navController.popBackStack() },
                    onChapterListClick = { showChapterList = true },
                    onSettingsClick = { showSettings = true },
                    onFullscreenClick = { isFullscreen = !isFullscreen }
                )
            }
        } else null,
        bottomBar = if (showControls && chapterImages != null) {
            {
                ReaderBottomBar(
                    currentPage = currentImageIndex + 1,
                    totalPages = chapterImages.images.size,
                    onPrevChapterClick = { viewModel.goToPrevChapter() },
                    onNextChapterClick = { viewModel.goToNextChapter() },
                    hasPrev = chapterImages.prevChapterUrl.isNotBlank(),
                    hasNext = chapterImages.nextChapterUrl.isNotBlank()
                )
            }
        } else null,
        modifier = Modifier
            .fillMaxSize()
            .background(readerBackgroundColor())
            .onGloballyPositioned { layout ->
                viewModel.setScrollPosition(layout.size.height, layout.size.height)
            }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .onClick { showControls = !showControls }
        ) {
            if (loading && chapterImages == null) {
                LoadingIndicator(modifier = Modifier.fillMaxSize())
            } else if (error != null && chapterImages == null) {
                com.maomao.presentation.common.ErrorView(
                    modifier = Modifier.fillMaxSize(),
                    message = error!!,
                    onRetry = { viewModel.retry(chapterUrl) }
                )
            } else {
                chapterImages?.let { images ->
                    ReaderContent(
                        images = images.images,
                        currentIndex = currentImageIndex,
                        onIndexChange = { viewModel.setCurrentImageIndex(it) },
                        onScrollChange = { position, height -> viewModel.setScrollPosition(position, height) },
                        autoLoadImages = true
                    )
                }
            }

            // Chapter List Dialog
            if (showChapterList) {
                ChapterListDialog(
                    chapters = emptyList(), // Would need to pass chapters from detail
                    currentChapterUrl = chapterUrl,
                    onChapterClick = { url ->
                        showChapterList = false
                        navController.navigate("reader/$url")
                    },
                    onDismiss = { showChapterList = false }
                )
            }

            // Settings Dialog
            if (showSettings) {
                ReaderSettingsDialog(
                    onDismiss = { showSettings = false }
                )
            }
        }
    }
}

@Composable
fun ReaderContent(
    images: List<String>,
    currentIndex: Int,
    onIndexChange: (Int) -> Unit,
    onScrollChange: (Int, Int) -> Unit,
    autoLoadImages: Boolean
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        verticalArrangement = Arrangement.spacedBy(0.dp),
        contentPadding = androidx.compose.foundation.layout.PaddingValues(0.dp)
    ) {
        items(images, key = { it }) { imageUrl ->
            ReaderImage(
                imageUrl = imageUrl,
                autoLoad = autoLoadImages
            )
        }
    }
}

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun ReaderImage(
    imageUrl: String,
    autoLoad: Boolean
) {
    val context = LocalContext.current
    
    AsyncImage(
        model = ImageRequest.Builder(context)
            .data(imageUrl)
            .crossfade(true)
            .build(),
        contentDescription = "Halaman komik",
        contentScale = ContentScale.FitWidth,
        modifier = Modifier
            .fillMaxWidth()
            .wrapContentHeight(),
        placeholder = rememberAsyncImagePainter(
            ImageRequest.Builder(context)
                .data(R.drawable.placeholder_comic)
                .crossfade(true)
                .build()
        ),
        error = rememberAsyncImagePainter(
            ImageRequest.Builder(context)
                .data(R.drawable.placeholder_comic_error)
                .crossfade(true)
                .build()
        )
    )
}

@Composable
fun ReaderTopBar(
    title: String,
    onBackClick: () -> Unit,
    onChapterListClick: () -> Unit,
    onSettingsClick: () -> Unit,
    onFullscreenClick: () -> Unit
) {
    TopAppBar(
        title = { Text(text = title, maxLines = 1, overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis) },
        navigationIcon = {
            IconButton(onClick = onBackClick) {
                androidx.compose.material3.Icon(
                    imageVector = androidx.compose.material.icons.Icons.Default.ArrowBack,
                    contentDescription = "Kembali"
                )
            }
        },
        actions = {
            IconButton(onClick = onChapterListClick) {
                androidx.compose.material3.Icon(
                    imageVector = androidx.compose.material.icons.Icons.Default.MenuBook,
                    contentDescription = stringResource(R.string.reader_chapter_list)
                )
            }
            IconButton(onClick = onSettingsClick) {
                androidx.compose.material3.Icon(
                    imageVector = androidx.compose.material.icons.Icons.Default.Settings,
                    contentDescription = stringResource(R.string.reader_settings)
                )
            }
            IconButton(onClick = onFullscreenClick) {
                androidx.compose.material3.Icon(
                    imageVector = androidx.compose.material.icons.Icons.Default.Fullscreen,
                    contentDescription = stringResource(R.string.reader_fullscreen)
                )
            }
        },
        colors = TopAppBarDefaults.mediumTopAppBarColors(
            containerColor = androidx.compose.material3.MaterialTheme.colorScheme.surfaceContainerLow.copy(alpha = 0.9f),
            titleContentColor = androidx.compose.material3.MaterialTheme.colorScheme.onSurface
        )
    )
}

@Composable
fun ReaderBottomBar(
    currentPage: Int,
    totalPages: Int,
    onPrevChapterClick: () -> Unit,
    onNextChapterClick: () -> Unit,
    hasPrev: Boolean,
    hasNext: Boolean
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(16.dp)
            .background(androidx.compose.material3.MaterialTheme.colorScheme.surfaceContainerHigh.copy(alpha = 0.9f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(
                    onClick = onPrevChapterClick,
                    enabled = hasPrev
                ) {
                    androidx.compose.material3.Icon(
                        imageVector = androidx.compose.material.icons.Icons.Default.NavigateBefore,
                        contentDescription = stringResource(R.string.reader_prev_chapter),
                        tint = if (hasPrev) androidx.compose.material3.MaterialTheme.colorScheme.onSurface else androidx.compose.material3.MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f)
                    )
                }
                
                Text(
                    text = "Halaman $currentPage / $totalPages",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium
                )
                
                IconButton(
                    onClick = onNextChapterClick,
                    enabled = hasNext
                ) {
                    androidx.compose.material3.Icon(
                        imageVector = androidx.compose.material.icons.Icons.Default.NavigateNext,
                        contentDescription = stringResource(R.string.reader_next_chapter),
                        tint = if (hasNext) androidx.compose.material3.MaterialTheme.colorScheme.onSurface else androidx.compose.material3.MaterialTheme.colorScheme.onSurface.copy(alpha = 0.38f)
                    )
                }
            }
            
            androidx.compose.foundation.layout.Spacer(modifier = Modifier.padding(top = 8.dp))
            
            Slider(
                value = (currentPage - 1).toFloat() / (totalPages - 1).toFloat(),
                onValueChange = { /* Handle slider change */ },
                enabled = totalPages > 1,
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}

@Composable
fun ChapterListDialog(
    chapters: List<Chapter>,
    currentChapterUrl: String,
    onChapterClick: (String) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(text = stringResource(R.string.reader_chapter_list), fontSize = 18.sp, fontWeight = FontWeight.Bold) },
        text = {
            Column(modifier = Modifier.padding(16.dp).fillMaxWidth()) {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(300.dp)
                ) {
                    items(chapters) { chapter ->
                        androidx.compose.material3.ListItem(
                            headlineContent = {
                                Text(
                                    text = chapter.displayTitle,
                                    fontWeight = if (chapter.url == currentChapterUrl) FontWeight.Bold else FontWeight.Normal,
                                    color = if (chapter.url == currentChapterUrl) androidx.compose.material3.MaterialTheme.colorScheme.primary else androidx.compose.material3.MaterialTheme.colorScheme.onSurface
                                )
                            },
                            onClick = { onChapterClick(chapter.url) }
                        )
                    }
                }
            }
        },
        confirmButton = {
            Button(onClick = onDismiss) {
                Text(text = stringResource(R.string.ok))
            }
        }
    )
}

@Composable
fun ReaderSettingsDialog(
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(text = stringResource(R.string.reader_settings), fontSize = 18.sp, fontWeight = FontWeight.Bold) },
        text = {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(text = "Pengaturan pembaca akan segera hadir", fontSize = 14.sp)
            }
        },
        confirmButton = {
            Button(onClick = onDismiss) {
                Text(text = stringResource(R.string.ok))
            }
        }
    )
}

@Composable
fun readerBackgroundColor(): Color {
    // This would read from settings
    return androidx.compose.material3.MaterialTheme.colorScheme.background
}