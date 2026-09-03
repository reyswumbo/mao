package com.maomao.presentation.favorite

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.compose.NavController
import com.maomao.presentation.common.ComicGridItem
import com.maomao.presentation.common.EmptyView
import com.maomao.presentation.common.LoadingIndicator
import com.maomao.presentation.common.SectionHeader
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite

@Composable
fun FavoritesScreen(
    navController: NavController,
    viewModel: FavoritesViewModel = hiltViewModel()
) {
    val favorites by viewModel.favorites.collectAsStateWithLifecycle()
    val loading by viewModel.loading.collectAsStateWithLifecycle()
    val error by viewModel.error.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = stringResource(R.string.favorite_title), fontSize = 20.sp) },
                colors = TopAppBarDefaults.mediumTopAppBarColors(
                    containerColor = androidx.compose.material3.MaterialTheme.colorScheme.surfaceContainerLow
                )
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            if (loading && favorites.isEmpty()) {
                LoadingIndicator(modifier = Modifier.fillMaxSize().padding(top = 100.dp))
            } else if (error != null) {
                com.maomao.presentation.common.ErrorView(
                    modifier = Modifier.fillMaxSize().padding(top = 100.dp),
                    message = error!!,
                    onRetry = { viewModel.loadFavorites() }
                )
            } else if (favorites.isEmpty()) {
                EmptyView(
                    modifier = Modifier.fillMaxSize(),
                    message = stringResource(R.string.favorite_empty),
                    icon = Icons.Default.Favorite,
                    actionText = "Jelajahi Komik",
                    onAction = { navController.navigate("home") }
                )
            } else {
                Column {
                    SectionHeader(
                        title = "Favorit Saya (${favorites.size})",
                        modifier = Modifier.padding(padding).padding(horizontal = 16.dp, vertical = 8.dp)
                    )
                    LazyVerticalGrid(
                        cells = GridCells.Fixed(3),
                        contentPadding = padding,
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(favorites) { comic ->
                            ComicGridItem(
                                comic = comic,
                                onClick = { navController.navigate("detail/${comic.url}") }
                            )
                        }
                    }
                }
            }
        }
    }
}