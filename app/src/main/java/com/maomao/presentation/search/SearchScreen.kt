package com.maomao.presentation.search

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SearchBar
import androidx.compose.material3.SearchBarDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.compose.NavController
import com.maomao.data.model.Comic
import com.maomao.presentation.common.ComicGridItem
import com.maomao.presentation.common.EmptyView
import com.maomao.presentation.common.ErrorView
import com.maomao.presentation.common.LoadingIndicator
import com.maomao.presentation.common.SectionHeader
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.ArrowBack

@Composable
fun SearchScreen(
    navController: NavController,
    viewModel: SearchViewModel = hiltViewModel()
) {
    val comics by viewModel.comics.collectAsStateWithLifecycle()
    val loading by viewModel.loading.collectAsStateWithLifecycle()
    val loadingMore by viewModel.loadingMore.collectAsStateWithLifecycle()
    val error by viewModel.error.collectAsStateWithLifecycle()
    val hasNextPage by viewModel.hasNextPage.collectAsStateWithLifecycle()
    val currentQuery by viewModel.currentQuery.collectAsStateWithLifecycle()

    var query by remember { mutableStateOf("") }
    val keyboardController = LocalSoftwareKeyboardController.current

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    OutlinedTextField(
                        value = query,
                        onValueChange = { query = it },
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(start = 8.dp, end = 8.dp),
                        placeholder = { Text(text = stringResource(R.string.search_hint)) },
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Text,
                            imeAction = ImeAction.Search
                        ),
                        keyboardActions = androidx.compose.foundation.text.KeyboardActions(
                            onSearch = {
                                keyboardController?.hide()
                                viewModel.search(query)
                            }
                        ),
                        visualTransformation = VisualTransformation.None,
                        singleLine = true,
                        leadingIcon = {
                            IconButton(onClick = { /* Clear */ }) {
                                androidx.compose.material3.Icon(
                                    imageVector = Icons.Default.Search,
                                    contentDescription = null
                                )
                            }
                        },
                        trailingIcon = {
                            if (query.isNotBlank()) {
                                IconButton(onClick = { query = "" }) {
                                    androidx.compose.material3.Icon(
                                        imageVector = Icons.Default.Close,
                                        contentDescription = "Hapus pencarian"
                                    )
                                }
                            }
                        }
                    )
                },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        androidx.compose.material3.Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Kembali"
                        )
                    }
                },
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
            if (currentQuery.isBlank()) {
                EmptyView(
                    modifier = Modifier.fillMaxSize(),
                    message = "Cari komik favorit Anda",
                    icon = Icons.Default.Search
                )
            } else if (loading && comics.isEmpty()) {
                LoadingIndicator(modifier = Modifier.fillMaxSize().padding(top = 100.dp))
            } else if (error != null && comics.isEmpty()) {
                ErrorView(
                    modifier = Modifier.fillMaxSize().padding(top = 100.dp),
                    message = error!!,
                    onRetry = { viewModel.search(query) }
                )
            } else {
                SearchResults(
                    comics = comics,
                    loadingMore = loadingMore,
                    hasNextPage = hasNextPage,
                    navController = navController,
                    onLoadMore = { viewModel.loadMore() },
                    paddingValues = padding
                )
            }
        }
    }
}

@Composable
fun SearchResults(
    comics: List<Comic>,
    loadingMore: Boolean,
    hasNextPage: Boolean,
    navController: NavController,
    onLoadMore: () -> Unit,
    paddingValues: androidx.compose.foundation.layout.PaddingValues
) {
    Column {
        SectionHeader(
            title = "Hasil Pencarian (${comics.size})",
            modifier = paddingValues.calculateWindowInsets().copy().let { padding ->
                Modifier.padding(padding).padding(horizontal = 16.dp, vertical = 8.dp)
            }
        )
        LazyVerticalGrid(
            cells = GridCells.Fixed(3),
            contentPadding = paddingValues,
            verticalArrangement = Arrangement.spacedBy(12.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            items(comics) { comic ->
                ComicGridItem(
                    comic = comic,
                    onClick = { navController.navigate("detail/${comic.url}") }
                )
            }
            if (loadingMore) {
                item(span = { GridCells.Fixed(3) }) {
                    LoadingIndicator(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 24.dp),
                        message = "Memuat lebih banyak..."
                    )
                }
            }
        }
    }
}