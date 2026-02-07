// Edge Function: 检查未签到用户
// 每天定时执行，找出连续2天未签到的用户并发送通知

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 获取环境变量
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 创建Service Role客户端(绕过RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 获取当前日期
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const twoDaysAgo = new Date(today)
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2)

    console.log(`开始检查未签到用户 - ${today.toISOString()}`)

    // 查询连续2天未签到的用户
    const { data: usersToNotify, error: fetchError } = await supabase
      .from('users')
      .select('id, name, emergency_email')
      .lt('id', (
        // 子查询：获取最近2天签到过的用户ID
        supabase
          .from('check_ins')
          .select('user_id')
          .gte('check_in_date', twoDaysAgo.toISOString().split('T')[0])
      ))

    // 使用视图查询更简单
    const { data: missedUsers, error: viewError } = await supabase
      .from('users_missed_checkins')
      .select('*')
      .gte('days_missed', 2)

    if (viewError) {
      console.error('查询未签到用户失败:', viewError)
      throw viewError
    }

    console.log(`找到 ${missedUsers?.length || 0} 个需要通知的用户`)

    // 对每个未签到的用户触发邮件发送
    const notifications = missedUsers?.map(async (user: any) => {
      try {
        // 调用邮件发送Edge Function
        const { error: emailError } = await supabase.functions.invoke('send-notification-email', {
          body: {
            userName: user.name,
            emergencyEmail: user.emergency_email,
            lastCheckInDate: user.last_check_in_date,
            daysMissed: user.days_missed
          }
        })

        if (emailError) {
          console.error(`发送邮件给 ${user.emergency_email} 失败:`, emailError)
          return { success: false, email: user.emergency_email, error: emailError }
        }

        console.log(`✅ 已发送提醒邮件到: ${user.emergency_email}`)
        return { success: true, email: user.emergency_email }

      } catch (err) {
        console.error(`处理用户 ${user.id} 时出错:`, err)
        return { success: false, email: user.emergency_email, error: err }
      }
    }) || []

    const results = await Promise.all(notifications)

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    return new Response(
      JSON.stringify({
        success: true,
        message: `检查完成。成功发送 ${successCount} 封邮件，失败 ${failureCount} 封`,
        results
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('执行检查任务时出错:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
