# Project-specific ProGuard rules
-keep class com.example.silema.data.model.** { *; }
-keep class io.github.jan.supabase.** { *; }
-keep class io.ktor.** { *; }
-dontwarn io.ktor.**
-dontwarn io.github.jan.supabase.**
