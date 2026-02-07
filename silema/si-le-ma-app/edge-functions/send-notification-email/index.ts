// Edge Function: 发送通知邮件
// 接收用户信息和紧急联系人邮箱，发送提醒邮件

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Resend } from "https://esm.sh/resend@2.0.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// 获取Resend API密钥(需要在Supabase Edge Functions Secrets中配置)
const resendApiKey = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  // 处理CORS预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 验证API密钥
    if (!resendApiKey) {
      throw new Error('未配置RESEND_API_KEY环境变量')
    }

    // 解析请求体
    const { userName, emergencyEmail, lastCheckInDate, daysMissed } = await req.json()

    if (!userName || !emergencyEmail) {
      throw new Error('缺少必要参数: userName 或 emergencyEmail')
    }

    console.log(`准备发送邮件: 用户=${userName}, 收件人=${emergencyEmail}`)

    // 创建Resend客户端
    const resend = new Resend(resendApiKey)

    // 计算最后签到日期的友好显示
    const lastSignInText = lastCheckInDate
      ? new Date(lastCheckInDate).toLocaleDateString('zh-CN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : '从未签到'

    // 发送邮件
    const { data, error } = await resend.emails.send({
      from: '死了么 <noreply@yourdomain.com>', // 替换为你的域名
      to: [emergencyEmail],
      subject: '【重要通知】您的朋友可能需要关注',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
            .btn { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 安全提醒通知</h1>
            </div>
            <div class="content">
              <div class="alert">
                <strong>⚠️ 这是一封自动发送的关怀提醒</strong>
              </div>

              <p>您好：</p>

              <p>您的朋友 <strong>${userName}</strong> 已经连续 <strong>${daysMissed}</strong> 天未在"死了么"APP中签到了。</p>

              <p><strong>最后签到时间：</strong>${lastSignInText}</p>

              <p>这可能意味着：</p>
              <ul>
                <li>📱 手机丢失或损坏</li>
                <li>🏥 发生意外情况</li>
                <li>🌐 网络连接问题</li>
                <li>😴 忘记签到</li>
              </ul>

              <p><strong>建议您：</strong></p>
              <ol>
                <li>📞 尝试联系 ${userName} 确认安全</li>
                <li>🏠 如无法联系，请前往其住处查看</li>
                <li>👨‍⚕️ 如有紧急情况，请及时联系相关部门</li>
              </ol>

              <p style="text-align: center; margin-top: 30px;">
                <a href="https://silema.app" class="btn">了解死了么</a>
              </p>

              <div class="footer">
                <p>此邮件由死了么APP自动发送，请勿回复。</p>
                <p>如果您认为这是一封误发邮件，请忽略。</p>
                <p>发送时间: ${new Date().toLocaleString('zh-CN')}</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    })

    if (error) {
      console.error('发送邮件失败:', error)
      throw error
    }

    console.log(`✅ 邮件发送成功: ${data.id}`)

    return new Response(
      JSON.stringify({
        success: true,
        messageId: data.id,
        message: '邮件发送成功'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('发送邮件时出错:', error)
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
