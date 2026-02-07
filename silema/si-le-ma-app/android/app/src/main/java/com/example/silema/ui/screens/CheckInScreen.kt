package com.example.silema.ui.screens

import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.silema.ui.theme.SuccessColor
import com.example.silema.ui.viewmodel.CheckInUiState

@Composable
fun CheckInScreen(
    viewModel: com.example.silema.ui.viewmodel.CheckInViewModel
) {
    val uiState by viewModel.uiState.collectAsState()
    val hasCheckedInToday by viewModel.hasCheckedInToday.collectAsState()
    val userStats by viewModel.userStats.collectAsState()

    var showSuccessAnimation by remember { mutableStateOf(false) }
    val scale by animateFloatAsState(
        targetValue = if (showSuccessAnimation) 1.2f else 1f,
        animationSpec = spring(
            dampingRatio = Spring.DampingRatioMediumBouncy,
            stiffness = Spring.StiffnessLow
        ),
        label = "scale"
    )

    LaunchedEffect(uiState) {
        if (uiState is CheckInUiState.CheckedIn) {
            showSuccessAnimation = true
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("死了么") }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // 用户名显示
            userStats?.name?.let { name ->
                Text(
                    text = "你好，$name",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(48.dp))

            // 签到状态卡片
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .animateContentSize(),
                colors = CardDefaults.cardColors(
                    containerColor = if (hasCheckedInToday == true)
                        SuccessColor.copy(alpha = 0.1f)
                    else
                        MaterialTheme.colorScheme.surfaceVariant
                )
            ) {
                Column(
                    modifier = Modifier.padding(32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    if (uiState is CheckInUiState.Loading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(64.dp),
                            color = MaterialTheme.colorScheme.primary
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "签到中...",
                            style = MaterialTheme.typography.titleLarge
                        )
                    } else if (hasCheckedInToday == true) {
                        Text(
                            text = "✓",
                            fontSize = 80.sp,
                            modifier = Modifier.scale(scale)
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "今日已签到",
                            style = MaterialTheme.typography.headlineLarge,
                            fontWeight = FontWeight.Bold,
                            color = SuccessColor
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "明天再来哦",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    } else {
                        Text(
                            text = "👆",
                            fontSize = 80.sp
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "点击下方按钮签到",
                            style = MaterialTheme.typography.titleLarge
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // 签到按钮
            Button(
                onClick = { viewModel.checkIn() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(80.dp)
                    .animateContentSize(),
                enabled = hasCheckedInToday != true && uiState !is CheckInUiState.Loading,
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (hasCheckedInToday == true)
                        SuccessColor
                    else
                        MaterialTheme.colorScheme.primary
                )
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = if (hasCheckedInToday == true) "已签到" else "今日签到",
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold
                    )
                    if (hasCheckedInToday != true) {
                        Text(
                            text = "点击完成签到",
                            fontSize = 14.sp,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }
                }
            }

            // 错误提示
            if (uiState is CheckInUiState.Error) {
                Spacer(modifier = Modifier.height(16.dp))
                Card(
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer
                    )
                ) {
                    Text(
                        text = (uiState as CheckInUiState.Error).message,
                        modifier = Modifier.padding(16.dp),
                        color = MaterialTheme.colorScheme.onErrorContainer
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // 统计信息
            userStats?.let { stats ->
                Card(
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp)
                    ) {
                        Text(
                            text = "📊 签到统计",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        StatRow("累计签到", "${stats.total_check_ins} 天")
                        Spacer(modifier = Modifier.height(8.dp))
                        stats.last_check_in_date?.let { lastDate ->
                            StatRow("上次签到", formatDate(lastDate))
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        StatRow(
                            "紧急联系人",
                            stats.emergency_email
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun StatRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.Bold
        )
    }
}

fun formatDate(dateString: String): String {
    return try {
        val date = kotlinx.datetime.LocalDate.parse(dateString)
        "${date.year}-${date.monthNumber}-${date.dayOfMonth}"
    } catch (e: Exception) {
        dateString
    }
}
