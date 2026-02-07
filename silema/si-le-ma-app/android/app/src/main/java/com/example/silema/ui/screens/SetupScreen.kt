package com.example.silema.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.silema.ui.viewmodel.SetupViewModel
import com.example.silema.ui.viewmodel.SetupUiState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SetupScreen(
    viewModel: SetupViewModel,
    onSetupComplete: () -> Unit
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()
    val userName by viewModel.userName.collectAsState()
    val emergencyEmail by viewModel.emergencyEmail.collectAsState()

    LaunchedEffect(uiState) {
        if (uiState is SetupUiState.Success) {
            onSetupComplete()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("死了么 - 初始设置") }
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
            Text(
                text = "🔔 死了么",
                style = MaterialTheme.typography.headlineLarge,
                fontSize = 48.sp
            )

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "每日签到，安全无忧",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )

            Spacer(modifier = Modifier.height(48.dp))

            // 用户名输入
            OutlinedTextField(
                value = userName,
                onValueChange = viewModel::onNameChange,
                label = { Text("你的名字") },
                placeholder = { Text("请输入你的名字") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                enabled = uiState !is SetupUiState.Loading
            )

            Spacer(modifier = Modifier.height(16.dp))

            // 紧急联系人邮箱输入
            OutlinedTextField(
                value = emergencyEmail,
                onValueChange = viewModel::onEmailChange,
                label = { Text("紧急联系人邮箱") },
                placeholder = { Text("请输入紧急联系人的邮箱") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                enabled = uiState !is SetupUiState.Loading
            )

            Spacer(modifier = Modifier.height(32.dp))

            // 提交按钮
            Button(
                onClick = { viewModel.setupUser(context) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                enabled = userName.isNotBlank() &&
                          emergencyEmail.isNotBlank() &&
                          uiState !is SetupUiState.Loading,
                shape = RoundedCornerShape(12.dp)
            ) {
                if (uiState is SetupUiState.Loading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                } else {
                    Text("开始使用", fontSize = 18.sp)
                }
            }

            // 错误提示
            if (uiState is SetupUiState.Error) {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = (uiState as SetupUiState.Error).message,
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodyMedium
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.secondaryContainer
                )
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "ℹ️ 使用说明",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSecondaryContainer
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "• 每天需要签到一次\n• 如果连续2天未签到，我们会自动发送邮件通知您的紧急联系人\n• 请确保紧急联系人邮箱正确",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSecondaryContainer
                    )
                }
            }
        }
    }
}
