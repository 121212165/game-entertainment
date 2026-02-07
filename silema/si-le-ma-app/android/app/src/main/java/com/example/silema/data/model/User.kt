package com.example.silema.data.model

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: String? = null,
    val auth_id: String? = null,
    val name: String,
    val emergency_email: String,
    val device_id: String? = null,
    val created_at: String? = null,
    val updated_at: String? = null
)

@Serializable
data class CheckIn(
    val id: String? = null,
    val user_id: String,
    val check_in_date: String,
    val check_in_time: String? = null,
    val created_at: String? = null
)

@Serializable
data class UserCheckInStats(
    val id: String,
    val name: String,
    val emergency_email: String,
    val auth_id: String,
    val total_check_ins: Int,
    val last_check_in_date: String? = null,
    val today_status: String
)
