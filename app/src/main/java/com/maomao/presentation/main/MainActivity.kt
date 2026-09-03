package com.maomao.presentation.main

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationDrawer
import androidx.compose.material3.NavigationDrawerItem
import androidx.compose.material3.NavigationDrawerDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.rememberDrawerState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltNavController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.navArgument
import com.maomao.di.Modules
import com.maomao.presentation.detail.DetailScreen
import com.maomao.presentation.favorite.FavoritesScreen
import com.maomao.presentation.history.HistoryScreen
import com.maomao.presentation.home.HomeScreen
import com.maomao.presentation.reader.ReaderScreen
import com.maomao.presentation.search.SearchScreen
import com.maomao.presentation.settings.SettingsScreen
import dagger.hilt.android.AndroidEntryPoint
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Menu

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    private val navController by hiltNavController()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            com.maomao.MaoMaoTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = androidx.compose.material3.MaterialTheme.colorScheme.background
                ) {
                    MainScreen(navController = navController)
                }
            }
        }
    }
}

@Composable
fun MainScreen(navController: androidx.navigation.NavController) {
    var drawerOpen by remember { mutableStateOf(false) }
    var selectedDestination by remember { mutableStateOf(0) }

    val destinations = listOf(
        NavigationDestination("home", stringResource(R.string.nav_bacakomik), Icons.Default.Home),
        NavigationDestination("search", "Pencarian", Icons.Default.Search),
        NavigationDestination("favorite", stringResource(R.string.nav_favorit), Icons.Default.Favorite),
        NavigationDestination("history", stringResource(R.string.nav_riwayat), Icons.Default.History),
        NavigationDestination("settings", stringResource(R.string.nav_pengaturan), Icons.Default.Settings)
    )

    Scaffold(
        drawerGesturesEnabled = true,
        drawerContent = {
            NavigationDrawer(
                modifier = Modifier.fillMaxSize(),
                drawerState = rememberDrawerState(initialValue = false),
                onDrawerClosed = { drawerOpen = false },
                onDrawerOpened = { drawerOpen = true }
            ) {
                Column(modifier = Modifier.fillMaxSize()) {
                    androidx.compose.foundation.layout.Spacer(modifier = Modifier.padding(top = 48.dp))
                    Text(
                        text = stringResource(R.string.app_name),
                        fontSize = 24.sp,
                        fontWeight = androidx.compose.ui.text.font.FontWeight.Bold,
                        modifier = Modifier.padding(16.dp)
                    )
                    androidx.compose.foundation.layout.Spacer(modifier = Modifier.padding(vertical = 16.dp))
                    androidx.compose.foundation.layout.Column(
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        destinations.forEachIndexed { index, destination ->
                            NavigationDrawerItem(
                                label = { Text(text = destination.label) },
                                selected = selectedDestination == index,
                                icon = {
                                    androidx.compose.material3.Icon(
                                        imageVector = destination.icon,
                                        contentDescription = null
                                    )
                                },
                                onClick = {
                                    selectedDestination = index
                                    navController.navigate(destination.route) {
                                        popUpTo(navController.graph.findStartDestination().id) {
                                            saveState = true
                                        }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                    drawerOpen = false
                                },
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }
                }
            }
        }
    ) { padding ->
        Column(modifier = Modifier.fillMaxSize()) {
            // Top App Bar
            androidx.compose.material3.TopAppBar(
                modifier = Modifier.padding(padding),
                title = { Text(text = destinations[selectedDestination].label) },
                navigationIcon = {
                    androidx.compose.material3.IconButton(onClick = { drawerOpen = true }) {
                        androidx.compose.material3.Icon(
                            imageVector = Icons.Default.Menu,
                            contentDescription = "Menu"
                        )
                    }
                },
                colors = androidx.compose.material3.TopAppBarDefaults.mediumTopAppBarColors(
                    containerColor = androidx.compose.material3.MaterialTheme.colorScheme.surfaceContainerLow
                )
            )

            // Navigation Host
            NavHost(navController, startDestination = "home") {
                composable("home") {
                    HomeScreen(navController = navController)
                }
                composable(
                    route = "search",
                    arguments = listOf(navArgument("query") { defaultValue = "" })
                ) {
                    SearchScreen(navController = navController)
                }
                composable(
                    route = "detail/{comicUrl}",
                    arguments = listOf(navArgument("comicUrl") { defaultValue = "" })
                ) { backStackEntry ->
                    val comicUrl = backStackEntry.getString()?.getString("comicUrl") ?: ""
                    DetailScreen(navController = navController, comicUrl = comicUrl)
                }
                composable(
                    route = "reader/{chapterUrl}",
                    arguments = listOf(navArgument("chapterUrl") { defaultValue = "" })
                ) { backStackEntry ->
                    val chapterUrl = backStackEntry.getString()?.getString("chapterUrl") ?: ""
                    ReaderScreen(navController = navController, chapterUrl = chapterUrl)
                }
                composable("favorite") {
                    FavoritesScreen(navController = navController)
                }
                composable("history") {
                    HistoryScreen(navController = navController)
                }
                composable("settings") {
                    SettingsScreen(navController = navController)
                }
            }
        }
    }
}

data class NavigationDestination(
    val route: String,
    val label: String,
    val icon: ImageVector
)