package com.example.silema

import android.app.Application
import com.example.silema.data.supabase.SupabaseClient

class SiLeMaApp : Application() {
    override fun onCreate() {
        super.onCreate()
        // 初始化Supabase客户端
        SupabaseClient.initialize(this)
    }
}
