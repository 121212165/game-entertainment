package com.example.silema.ui.viewmodel

import android.content.Context
import android.provider.Settings
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.silema.data.repository.UserRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class SetupViewModel : ViewModel() {

    private val userRepository = UserRepository()

    private val _uiState = MutableStateFlow<SetupUiState>(SetupUiState.Idle)
    val uiState: StateFlow<SetupUiState> = _uiState.asStateFlow()

    private val _userName = MutableStateFlow("")
    val userName: StateFlow<String> = _userName.asStateFlow()

    private val _emergencyEmail = MutableStateFlow("")
    val emergencyEmail: StateFlow<String> = _emergencyEmail.asStateFlow()

    fun onNameChange(name: String) {
        _userName.value = name
    }

    fun onEmailChange(email: String) {
        _emergencyEmail.value = email
    }

    fun setupUser(context: Context) {
        viewModelScope.launch {
            _uiState.value = SetupUiState.Loading

            try {
                // 1. 匿名登录
                val loginResult = userRepository.anonymousLogin()
                if (loginResult.isFailure) {
                    _uiState.value = SetupUiState.Error("登录失败: ${loginResult.exceptionOrNull()?.message}")
                    return@launch
                }

                // 2. 获取设备ID
                val deviceId = Settings.Secure.getString(
                    context.contentResolver,
                    Settings.Secure.ANDROID_ID
                )

                // 3. 创建用户
                val name = _userName.value
                val email = _emergencyEmail.value

                val createResult = userRepository.createUser(name, email, deviceId)
                if (createResult.isFailure) {
                    _uiState.value = SetupUiState.Error("创建用户失败: ${createResult.exceptionOrNull()?.message}")
                    return@launch
                }

                _uiState.value = SetupUiState.Success

            } catch (e: Exception) {
                _uiState.value = SetupUiState.Error("设置失败: ${e.message}")
            }
        }
    }
}

sealed class SetupUiState {
    object Idle : SetupUiState()
    object Loading : SetupUiState()
    object Success : SetupUiState()
    data class Error(val message: String) : SetupUiState()
}
