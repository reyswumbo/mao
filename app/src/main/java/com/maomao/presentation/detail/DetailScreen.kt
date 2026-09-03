package com.maomao.presentation.detail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.platform.LocalContext
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.compose.NavController
import coil3.compose.AsyncImage
import coil3.compose.rememberAsyncImagePainter
import coil3.request.ImageRequest
import com.maomao.data.model.Chapter
import com.maomao.presentation.common.ComicListItem
import com.maomao.presentation.common.ErrorView
import com.maomao.presentation.common.LoadingIndicator
import com.maomao.presentation.common.SectionHeader
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.outlined.FavoriteBorder

@Composable
fun DetailScreen(
    navController: NavController,
    comicUrl: String,
    viewModel: DetailViewModel = hiltViewModel()
) {
    val comicDetail by viewModel.comicDetail.collectAsStateWithLifecycle()
    val loading by viewModel.loading.collectAsStateWithLifecycle()
    val error by viewModel.error.collectAsStateWithLifecycle()
    val isFavorite by viewModel.isFavorite.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { 
                    if (comicDetail != null) {
                        Text(text = comicDetail.comic.title, maxLines = 1, overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis)
                    }
                },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        androidx.compose.material3.Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Kembali"
                        )
                    }
                },
                actions = {
                    comicDetail?.let { detail ->
                        IconButton(
                            onClick = { viewModel.toggleFavorite() },
                            modifier = Modifier.padding(end = 8.dp)
                        ) {
                            androidx.compose.material3.Icon(
                                imageVector = if (isFavorite) Icons.Filled.Favorite else Icons.Outlined.FavoriteBorder,
                                contentDescription = if (isFavorite) "Hapus dari favorit" else "Tambah ke favorit",
                                tint = if (isFavorite) androidx.compose.material3.MaterialTheme.colorScheme.error else androidx.compose.material3.MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                },
                colors = TopAppBarDefaults.mediumTopAppBarColors(
                    containerColor = androidx.compose.material3.MaterialTheme.colorScheme.surfaceContainerLow
                )
            )
        }
    ) { padding ->
        if (loading && comicDetail == null) {
            LoadingIndicator(modifier = Modifier.fillMaxSize().padding(padding).padding(top = 100.dp))
        } else if (error != null && comicDetail == null) {
            ErrorView(
                modifier = Modifier.fillMaxSize().padding(padding).padding(top = 100.dp),
                message = error!!,
                onRetry = { viewModel.retry(comicUrl) }
            )
        } else {
            comicDetail?.let { detail ->
                DetailContent(
                    comicDetail = detail,
                    navController = navController,
                    paddingValues = padding
                )
            }
        }
    }
}

@Composable
fun DetailContent(
    comicDetail: com.maomao.data.model.ComicDetail,
    navController: NavController,
    paddingValues: androidx.compose.foundation.layout.PaddingValues
) {
    val comic = comicDetail.comic
    val chapters = comicDetail.chapters

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(padding)
            .verticalScroll(rememberScrollState())
    ) {
        // Comic Header
        Row(
            modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
            horizontalArrangement = Arrangement.Start,
            verticalAlignment = Alignment.Top
        ) {
            // Cover Image
            Box(
                modifier = Modifier
                    .width(120.dp)
                    .height(170.dp)
                    .clip(true)
            ) {
                AsyncImage(
                    model = ImageRequest.Builder(LocalContext.current)
                        .data(comic.coverUrl)
                        .crossfade(true)
                        .build(),
                    contentDescription = comic.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize(),
                    placeholder = rememberAsyncImagePainter(
                        ImageRequest.Builder(LocalContext.current)
                            .data(R.drawable.placeholder_comic)
                            .crossfade(true)
                            .build()
                    ),
                    error = rememberAsyncImagePainter(
                        ImageRequest.Builder(LocalContext.current)
                            .data(R.drawable.placeholder_comic_error)
                            .crossfade(true)
                            .build()
                    )
                )
            }
            
            androidx.compose.foundation.layout.Spacer(modifier = Modifier.padding(start = 16.dp))
            
            // Info Column
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = comic.title,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 3,
                    overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis
                )
                
                if (comic.rating > 0) {
                    Row(
                        horizontalArrangement = Arrangement.Start,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        androidx.compose.material3.Icon(
                            imageVector = Icons.Default.Star,
                            contentDescription = null,
                            tint = androidx.compose.material3.MaterialTheme.colorScheme.primary,
                            modifier = Modifier.size(18.dp)
                        )
                        Text(
                            text = "%.1f".format(comic.rating),
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Medium
                        )
                        if (comic.status.isNotBlank()) {
                            Text(
                                text = " • ${comic.status}",
                                fontSize = 14.sp,
                                color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
                
                if (comic.genres.isNotEmpty()) {
                    androidx.compose.foundation.layout.Spacer(modifier = Modifier.padding(top = 4.dp))
                    androidx.compose.foundation.layout.Row(
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        comic.genres.take(4).forEach { genre ->
                            androidx.compose.material3.Chip(
                                onClick = { /* Filter by genre */ },
                                modifier = Modifier.padding(bottom = 4.dp)
                            ) {
                                Text(text = genre, fontSize = 11.sp)
                            }
                        }
                        if (comic.genres.size > 4) {
                            androidx.compose.material3.Chip(
                                onClick = { /* Show all genres */ },
                                modifier = Modifier.padding(bottom = 4.dp)
                            ) {
                                Text(text = "+${comic.genres.size - 4} lainnya", fontSize = 11.sp)
                            }
                        }
                    }
                }
                
                if (comic.author.isNotBlank() || comic.artist.isNotBlank()) {
                    androidx.compose.foundation.layout.Row(
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        if (comic.author.isNotBlank()) {
                            Text(
                                text = "Penulis: ${comic.author}",
                                fontSize = 12.sp,
                                color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        if (comic.artist.isNotBlank()) {
                            Text(
                                text = "Artist: ${comic.artist}",
                                fontSize = 12.sp,
                                color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
                
                // Read Now Button
                androidx.compose.foundation.layout.Spacer(modifier = Modifier.padding(top = 8.dp))
                Button(
                    onClick = {
                        val firstChapter = chapters.firstOrNull()
                        firstChapter?.let { chapter ->
                            navController.navigate("reader/${chapter.url}")
                        }
                    },
                    modifier = Modifier.fillMaxWidth(),
                    colors = androidx.compose.material3.ButtonDefaults.buttonColors(
                        containerColor = androidx.compose.material3.MaterialTheme.colorScheme.primary,
                        contentColor = androidx.compose.material3.MaterialTheme.colorScheme.onPrimary
                    )
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        androidx.compose.material3.Icon(
                            imageVector = Icons.Default.PlayArrow,
                            contentDescription = null,
                            modifier = Modifier.padding(end = 8.dp)
                        )
                        Text(
                            text = stringResource(R.string.detail_read_now),
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        }
        
        // Synopsis
        if (comic.synopsis.isNotBlank()) {
            androidx.compose.foundation.layout.Spacer(modifier = Modifier.padding(top = 16.dp))
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = androidx.compose.material3.MaterialTheme.colorScheme.surfaceContainerHighest
                )
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = stringResource(R.string.detail_synopsis),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                    androidx.compose.foundation.layout.Spacer(modifier = Modifier.padding(top = 8.dp))
                    Text(
                        text = comic.synopsis,
                        fontSize = 14.sp,
                        color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
        
        // Chapter List
        if (chapters.isNotEmpty()) {
            androidx.compose.foundation.layout.Spacer(modifier = Modifier.padding(top = 16.dp))
            SectionHeader(title = stringResource(R.string.detail_chapters))
            
            LazyColumn(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                items(chapters) { chapter ->
                    ChapterListItem(
                        chapter = chapter,
                        onClick = { navController.navigate("reader/${chapter.url}") }
                    )
                }
            }
        }
    }
}

@Composable
fun ChapterListItem(
    chapter: Chapter,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 4.dp)
            .clip(true),
        onClick = onClick,
        shape = androidx.compose.material3.Shapes.medium
    ) {
        androidx.compose.foundation.layout.Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = chapter.displayTitle,
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium,
                maxLines = 1,
                overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis
            )
            if (chapter.releasedAt.isNotBlank()) {
                Text(
                    text = chapter.releasedAt,
                    fontSize = 12.sp,
                    color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            androidx.compose.material3.Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = null,
                tint = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}