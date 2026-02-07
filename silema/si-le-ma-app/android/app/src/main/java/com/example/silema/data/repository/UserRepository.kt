package com.example.silema.data.repository

import com.example.silema.data.model.CheckIn
import com.example.silema.data.model.User
import com.example.silema.data.model.UserCheckInStats
import com.example.silema.data.supabase.SupabaseClient
import io.github.jan.supabase.postgrest.from
import kotlinx.datetime.Clock
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import java.util.UUID

class UserRepository {

    private val postgrest = SupabaseClient.postgrest
    private val auth = SupabaseClient.goTrue

    // 匿名登录
    suspend fun anonymousLogin(): Result<String> = try {
        val session = auth.signInAnonymously()
        Result.success(session.user?.id ?: "")
    } catch (e: Exception) {
        Result.failure(e)
    }

    // 创建用户
    suspend fun createUser(name: String, emergencyEmail: String, deviceId: String): Result<User> = try {
        val userId = UUID.randomUUID().toString()
        val authId = auth.currentUser?.id

        val user = User(
            id = userId,
            auth_id = authId,
            name = name,
            emergency_email = emergencyEmail,
            device_id = deviceId
        )

        postgrest.from("users").insert(user)

        Result.success(user)
    } catch (e: Exception) {
        Result.failure(e)
    }

    // 获取当前用户信息
    suspend fun getCurrentUser(): Result<User?> = try {
        val authId = auth.currentUser?.id
        if (authId == null) {
            Result.success(null)
        } else {
            val users = postgrest.from("users").select {
                filter {
                    eq("auth_id", authId)
                }
            }.decodeList<User>()

            Result.success(users.firstOrNull())
        }
    } catch (e: Exception) {
        Result.failure(e)
    }

    // 签到
    suspend fun checkIn(userId: String): Result<CheckIn> = try {
        val today = Clock.System.now()
            .toLocalDateTime(TimeZone.currentSystemDefault())
            .date.toString()

        val checkIn = CheckIn(
            id = UUID.randomUUID().toString(),
            user_id = userId,
            check_in_date = today,
            check_in_time = Clock.System.now().toString()
        )

        postgrest.from("check_ins").insert(checkIn)

        Result.success(checkIn)
    } catch (e: Exception) {
        Result.failure(e)
    }

    // 检查今天是否已签到
    suspend fun hasCheckedInToday(userId: String): Result<Boolean> = try {
        val today = Clock.System.now()
            .toLocalDateTime(TimeZone.currentSystemDefault())
            .date.toString()

        val checkIns = postgrest.from("check_ins").select {
            filter {
                eq("user_id", userId)
                eq("check_in_date", today)
            }
        }.decodeList<CheckIn>()

        Result.success(checkIns.isNotEmpty())
    } catch (e: Exception) {
        Result.failure(e)
    }

    // 获取用户签到统计
    suspend fun getUserStats(): Result<UserCheckInStats?> = try {
        val authId = auth.currentUser?.id
        if (authId == null) {
            Result.success(null)
        } else {
            val statsList = postgrest.from("user_checkin_stats").select {
                filter {
                    eq("auth_id", authId)
                }
            }.decodeList<UserCheckInStats>()

            Result.success(statsList.firstOrNull())
        }
    } catch (e: Exception) {
        Result.failure(e)
    }
}
