package com.example.silema.data.supabase

import android.content.Context
import com.example.silema.BuildConfig
import io.github.jan.supabase.SupabaseClient
import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.GoTrue
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.realtime.Realtime

object SupabaseClient {

    private lateinit var client: SupabaseClient

    fun initialize(context: Context) {
        client = createSupabaseClient(
            supabaseUrl = BuildConfig.SUPABASE_URL,
            supabaseKey = BuildConfig.SUPABASE_ANON_KEY
        ) {
            install(GoTrue)
            install(Postgrest)
            install(Realtime)
        }
    }

    val clientInstance: SupabaseClient
        get() = client

    val goTrue
        get() = client.auth

    val postgrest
        get() = client.postgrest
}
