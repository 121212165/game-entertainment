package com.example.silema.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.silema.data.model.UserCheckInStats
import com.example.silema.data.repository.UserRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class CheckInViewModel : ViewModel() {

    private val userRepository = UserRepository()

    private val _uiState = MutableStateFlow<CheckInUiState>(CheckInUiState.Loading)
    val uiState: StateFlow<CheckInUiState> = _uiState.asStateFlow()

    private val _hasCheckedInToday = MutableStateFlow<Boolean?>(null)
    val hasCheckedInToday: StateFlow<Boolean?> = _hasCheckedInToday.asStateFlow()

    private val _userStats = MutableStateFlow<UserCheckInStats?>(null)
    val userStats: StateFlow<UserCheckInStats?> = _userStats.asStateFlow()

    init {
        loadUserStats()
    }

    private fun loadUserStats() {
        viewModelScope.launch {
            try {
                val statsResult = userRepository.getUserStats()
                if (statsResult.isSuccess) {
                    val stats = statsResult.getOrNull()
                    _userStats.value = stats
                    _hasCheckedInToday.value = stats?.today_status == "checked_in"
                    _uiState.value = CheckInUiState.Success
                } else {
                    _uiState.value = CheckInUiState.Error("加载用户信息失败")
                }
            } catch (e: Exception) {
                _uiState.value = CheckInUiState.Error(e.message ?: "加载失败")
            }
        }
    }

    fun checkIn() {
        viewModelScope.launch {
            _uiState.value = CheckInUiState.Loading

            try {
                val userId = _userStats.value?.id
                if (userId == null) {
                    _uiState.value = CheckInUiState.Error("用户信息不存在")
                    return@launch
                }

                val result = userRepository.checkIn(userId)
                if (result.isSuccess) {
                    _hasCheckedInToday.value = true
                    _uiState.value = CheckInUiState.CheckedIn
                    // 重新加载统计信息
                    loadUserStats()
                } else {
                    _uiState.value = CheckInUiState.Error("签到失败: ${result.exceptionOrNull()?.message}")
                }
            } catch (e: Exception) {
                _uiState.value = CheckInUiState.Error(e.message ?: "签到失败")
            }
        }
    }
}

sealed class CheckInUiState {
    object Loading : CheckInUiState()
    object Success : CheckInUiState()
    object CheckedIn : CheckInUiState()
    data class Error(val message: String) : CheckInUiState()
}
