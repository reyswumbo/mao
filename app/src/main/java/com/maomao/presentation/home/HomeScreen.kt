package com.maomao.presentation.home

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyHorizontalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Scaffold
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.compose.NavController
import com.maomao.data.model.Comic
import com.maomao.presentation.common.ComicGridItem
import com.maomao.presentation.common.ErrorView
import com.maomao.presentation.common.LoadingIndicator
import com.maomao.presentation.common.SectionHeader
import coil3.compose.LocalContext

@Composable
fun HomeScreen(
    navController: NavController,
    viewModel: HomeViewModel = hiltViewModel()
) {
    val homeData by viewModel.homeData.collectAsStateWithLifecycle()
    val loading by viewModel.loading.collectAsStateWithLifecycle()
    val error by viewModel.error.collectAsStateWithLifecycle()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = stringResource(R.string.app_name), fontSize = 20.sp) },
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
                .verticalScroll(rememberScrollState())
        ) {
            if (loading && homeData == null) {
                LoadingIndicator(modifier = Modifier.fillMaxSize().padding(top = 100.dp))
            } else if (error != null && homeData == null) {
                ErrorView(
                    modifier = Modifier.fillMaxSize().padding(top = 100.dp),
                    message = error!!,
                    onRetry = { viewModel.retry() }
                )
            } else {
                homeData?.let { data ->
                    HomeContent(
                        data = data,
                        navController = navController,
                        paddingValues = padding
                    )
                }
            }
        }
    }
}

@Composable
fun HomeContent(
    data: com.maomao.data.model.HomeData,
    navController: NavController,
    paddingValues: PaddingValues
) {
    Column {
        if (data.popular.isNotEmpty()) {
            SectionHeader(
                title = stringResource(R.string.home_popular),
                onSeeAll = { /* Navigate to popular list */ }
            )
            HorizontalComicGrid(
                comics = data.popular,
                navController = navController,
                paddingValues = paddingValues
            )
        }

        if (data.latest.isNotEmpty()) {
            SectionHeader(
                title = stringResource(R.string.home_latest),
                onSeeAll = { /* Navigate to latest list */ }
            )
            HorizontalComicGrid(
                comics = data.latest,
                navController = navController,
                paddingValues = paddingValues
            )
        }

        if (data.ongoing.isNotEmpty()) {
            SectionHeader(
                title = stringResource(R.string.home_ongoing),
                onSeeAll = { /* Navigate to ongoing list */ }
            )
            HorizontalComicGrid(
                comics = data.ongoing,
                navController = navController,
                paddingValues = paddingValues
            )
        }

        if (data.completed.isNotEmpty()) {
            SectionHeader(
                title = stringResource(R.string.home_completed),
                onSeeAll = { /* Navigate to completed list */ }
            )
            HorizontalComicGrid(
                comics = data.completed,
                navController = navController,
                paddingValues = paddingValues
            )
        }
    }
}

@Composable
fun HorizontalComicGrid(
    comics: List<Comic>,
    navController: NavController,
    paddingValues: PaddingValues
) {
    LazyHorizontalGrid(
        cells = GridCells.Fixed(3),
        contentPadding = paddingValues,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        items(comics) { comic ->
            ComicGridItem(
                comic = comic,
                onClick = { navController.navigate("detail/${comic.url}") }
            )
        }
    }
}