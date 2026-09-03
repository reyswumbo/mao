package com.maomao.presentation.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.clickable
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Switch
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
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.compose.NavController
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.FileDownload

@Composable
fun SettingsScreen(
    navController: NavController,
    viewModel: SettingsViewModel = hiltViewModel()
) {
    val themeMode by viewModel.themeMode.collectAsStateWithLifecycle()
    val readerBackground by viewModel.readerBackground.collectAsStateWithLifecycle()
    val readerScrollMode by viewModel.readerScrollMode.collectAsStateWithLifecycle()
    val autoLoadImages by viewModel.autoLoadImages.collectAsStateWithLifecycle()

    var showClearCacheDialog by remember { mutableStateOf(false) }
    var showClearDataDialog by remember { mutableStateOf(false) }
    var showThemeDialog by remember { mutableStateOf(false) }
    var showBackgroundDialog by remember { mutableStateOf(false) }
    var showScrollDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(text = stringResource(R.string.settings_title), fontSize = 20.sp) },
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
            // Theme Section
            SettingsSection(title = stringResource(R.string.settings_theme)) {
                SettingsItem(
                    title = "Mode Tema",
                    subtitle = when (themeMode) {
                        0 -> stringResource(R.string.settings_theme_system)
                        1 -> stringResource(R.string.settings_theme_light)
                        2 -> stringResource(R.string.settings_theme_dark)
                        else -> ""
                    },
                    onClick = { showThemeDialog = true }
                )
            }

            // Reader Settings Section
            SettingsSection(title = "Pengaturan Pembaca") {
                SettingsItem(
                    title = stringResource(R.string.settings_reader_background),
                    subtitle = when (readerBackground) {
                        0 -> stringResource(R.string.reader_bg_white)
                        1 -> stringResource(R.string.reader_bg_black)
                        2 -> stringResource(R.string.reader_bg_gray)
                        3 -> stringResource(R.string.reader_bg_sepia)
                        else -> ""
                    },
                    onClick = { showBackgroundDialog = true }
                )
                SettingsItem(
                    title = stringResource(R.string.reader_scroll_mode),
                    subtitle = when (readerScrollMode) {
                        0 -> stringResource(R.string.reader_vertical_scroll)
                        1 -> stringResource(R.string.reader_horizontal_scroll)
                        else -> ""
                    },
                    onClick = { showScrollDialog = true }
                )
                SettingsItem(
                    title = "Muat Gambar Otomatis",
                    subtitle = if (autoLoadImages) "Aktif" else "Nonaktif",
                    trailing = {
                        Switch(
                            checked = autoLoadImages,
                            onCheckedChange = { viewModel.setAutoLoadImages(it) }
                        )
                    }
                )
            }

            // Data Section
            SettingsSection(title = stringResource(R.string.settings_data)) {
                SettingsItem(
                    title = stringResource(R.string.settings_clear_cache),
                    subtitle = stringResource(R.string.settings_clear_cache_desc),
                    trailing = {
                        IconButton(onClick = { showClearCacheDialog = true }) {
                            androidx.compose.material3.Icon(
                                imageVector = Icons.Default.Delete,
                                contentDescription = "Bersihkan cache"
                            )
                        }
                    }
                )
                SettingsItem(
                    title = stringResource(R.string.settings_export_data),
                    subtitle = "Ekspor favorit, riwayat, dan progress baca",
                    onClick = { /* Export data */ }
                )
                SettingsItem(
                    title = stringResource(R.string.settings_import_data),
                    subtitle = "Impor data dari file backup",
                    onClick = { /* Import data */ }
                )
            }

            // About Section
            SettingsSection(title = stringResource(R.string.settings_about)) {
                SettingsItem(
                    title = stringResource(R.string.app_name),
                    subtitle = stringResource(R.string.settings_version, "1.0.0")
                )
                SettingsItem(
                    title = stringResource(R.string.settings_source),
                    subtitle = stringResource(R.string.settings_source_desc),
                    onClick = { /* Open source in browser */ }
                )
            }

            // Danger Zone
            SettingsSection(title = "Zona Bahaya") {
                SettingsItem(
                    title = "Hapus Semua Data",
                    subtitle = "Hapus favorit, riwayat, progress, dan pengaturan",
                    titleColor = androidx.compose.material3.MaterialTheme.colorScheme.error,
                    onClick = { showClearDataDialog = true }
                )
            }
        }
    }

    // Dialogs
    if (showThemeDialog) {
        AlertDialog(
            onDismissRequest = { showThemeDialog = false },
            title = { Text(text = stringResource(R.string.settings_theme)) },
            text = { Text(text = "Pilih mode tema aplikasi") },
            confirmButton = {
                Button(onClick = { showThemeDialog = false }) {
                    Text(text = stringResource(R.string.ok))
                }
            },
            dismissButton = {
                Button(onClick = { showThemeDialog = false }) {
                    Text(text = stringResource(R.string.cancel))
                }
            }
        )
    }

    if (showBackgroundDialog) {
        AlertDialog(
            onDismissRequest = { showBackgroundDialog = false },
            title = { Text(text = stringResource(R.string.settings_reader_background)) },
            text = { Text(text = "Pilih warna latar belakang pembaca") },
            confirmButton = {
                Button(onClick = { showBackgroundDialog = false }) {
                    Text(text = stringResource(R.string.ok))
                }
            },
            dismissButton = {
                Button(onClick = { showBackgroundDialog = false }) {
                    Text(text = stringResource(R.string.cancel))
                }
            }
        )
    }

    if (showScrollDialog) {
        AlertDialog(
            onDismissRequest = { showScrollDialog = false },
            title = { Text(text = stringResource(R.string.reader_scroll_mode)) },
            text = { Text(text = "Pilih mode scroll pembaca") },
            confirmButton = {
                Button(onClick = { showScrollDialog = false }) {
                    Text(text = stringResource(R.string.ok))
                }
            },
            dismissButton = {
                Button(onClick = { showScrollDialog = false }) {
                    Text(text = stringResource(R.string.cancel))
                }
            }
        )
    }

    if (showClearCacheDialog) {
        AlertDialog(
            onDismissRequest = { showClearCacheDialog = false },
            title = { Text(text = stringResource(R.string.settings_clear_cache)) },
            text = { Text(text = "Yakin ingin membersihkan cache gambar?") },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.clearCache()
                        showClearCacheDialog = false
                    },
                    colors = androidx.compose.material3.ButtonDefaults.buttonColors(
                        containerColor = androidx.compose.material3.MaterialTheme.colorScheme.error
                    )
                ) {
                    Text(text = stringResource(R.string.delete))
                }
            },
            dismissButton = {
                Button(onClick = { showClearCacheDialog = false }) {
                    Text(text = stringResource(R.string.cancel))
                }
            }
        )
    }

    if (showClearDataDialog) {
        AlertDialog(
            onDismissRequest = { showClearDataDialog = false },
            title = { Text(text = "Hapus Semua Data") },
            text = { Text(text = "Tindakan ini tidak dapat dibatalkan. Semua favorit, riwayat, progress baca, dan pengaturan akan dihapus permanen.") },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.clearAllData()
                        showClearDataDialog = false
                    },
                    colors = androidx.compose.material3.ButtonDefaults.buttonColors(
                        containerColor = androidx.compose.material3.MaterialTheme.colorScheme.error
                    )
                ) {
                    Text(text = stringResource(R.string.delete))
                }
            },
            dismissButton = {
                Button(onClick = { showClearDataDialog = false }) {
                    Text(text = stringResource(R.string.cancel))
                }
            }
        )
    }
}

@Composable
fun SettingsSection(
    title: String,
    content: @Composable () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
    ) {
        Text(
            text = title,
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
            color = androidx.compose.material3.MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(vertical = 8.dp)
        )
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = androidx.compose.material3.MaterialTheme.colorScheme.surfaceContainerHigh
            )
        ) {
            Column {
                content()
            }
        }
    }
}

@Composable
fun SettingsItem(
    title: String,
    subtitle: String? = null,
    titleColor: androidx.compose.ui.graphics.Color = androidx.compose.material3.MaterialTheme.colorScheme.onSurface,
    trailing: @Composable (() -> Unit)? = null,
    onClick: (() -> Unit)? = null
) {
    val modifier = Modifier
        .fillMaxWidth()
        .padding(vertical = 12.dp, horizontal = 16.dp)
    
    if (onClick != null) {
        androidx.compose.material3.Surface(
            modifier = modifier
                .fillMaxWidth()
                .clickable(onClick = onClick)
                .padding(vertical = 12.dp, horizontal = 16.dp),
            onClick = onClick
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = title,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Medium,
                        color = titleColor
                    )
                    subtitle?.let {
                        Text(
                            text = it,
                            fontSize = 12.sp,
                            color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
                trailing?.invoke()
            }
        }
    } else {
        Row(
            modifier = modifier,
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = title,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = titleColor
                )
                subtitle?.let {
                    Text(
                        text = it,
                        fontSize = 12.sp,
                        color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            trailing?.invoke()
        }
    }
}