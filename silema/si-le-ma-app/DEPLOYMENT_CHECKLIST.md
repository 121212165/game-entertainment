# 部署检查清单

## ✅ Supabase项目设置
- [ ] 创建Supabase账号
- [ ] 创建新项目 `si-le-ma-app`
- [ ] 获取Project URL和anon key
- [ ] 获取service_role key

## ✅ 数据库配置
- [ ] 执行 `database/schema.sql`
- [ ] 执行 `database/rls_policies.sql`
- [ ] 在Table Editor中验证表已创建
- [ ] 检查users表结构
- [ ] 检查check_ins表结构
- [ ] 验证视图已创建（user_checkin_stats, users_missed_checkins）

## ✅ Edge Functions配置
- [ ] 注册Resend账号并获取API Key
- [ ] 配置环境变量：
  - [ ] RESEND_API_KEY
  - [ ] SUPABASE_URL
  - [ ] SUPABASE_SERVICE_ROLE_KEY
- [ ] 部署 `check-missed-check-ins` 函数
- [ ] 部署 `send-notification-email` 函数
- [ ] 手动测试函数执行
- [ ] 检查函数日志

## ✅ Android项目配置
- [ ] 安装Android Studio
- [ ] 导入项目到Android Studio
- [ ] 创建/编辑 `local.properties`
- [ ] 添加supabase.url到local.properties
- [ ] 添加supabase.anon.key到local.properties
- [ ] Sync Gradle成功
- [ ] 连接测试设备或启动模拟器

## ✅ Android应用测试
- [ ] 首次启动显示设置页面
- [ ] 输入用户名和邮箱
- [ ] 成功创建用户并跳转到签到页面
- [ ] 点击签到按钮成功
- [ ] 显示"今日已签到"状态
- [ ] 关闭并重新打开应用，状态保持
- [ ] 查看Supabase数据库验证数据

## ✅ Cron Job配置
- [ ] 在Supabase Dashboard创建Cron Job
- [ ] 设置正确的Cron表达式
- [ ] 关联到check-missed-check-ins函数
- [ ] 手动测试触发
- [ ] 验证邮件发送成功

## ✅ 完整流程测试
- [ ] 第1天：用户签到
- [ ] 第2天：用户签到
- [ ] 第3天：用户不签到
- [ ] 第4天：用户不签到
- [ ] 第5天：检查紧急联系人是否收到邮件

## 📝 重要信息记录

**Supabase项目信息**
```
Project URL: _________________________________________
Project Ref: _________________________________________
anon key: _________________________________________
service_role key: _________________________________________
```

**Resend信息**
```
API Key: _________________________________________
```

**本地配置**
```
local.properties路径: _________________________________
```

---

## 🚨 部署前最后检查

1. **API密钥安全**
   - [ ] 确认service_role key只存在于服务器端（Edge Functions）
   - [ ] 确认local.properties已加入.gitignore
   - [ ] 不要将任何密钥提交到版本控制

2. **权限设置**
   - [ ] RLS策略已启用
   - [ ] 用户只能访问自己的数据
   - [ ] Service Role可以访问所有数据

3. **时区设置**
   - [ ] Cron Job时间已转换为UTC
   - [ ] 理解UTC与本地时区的差异

4. **邮件配置**
   - [ ] Resend账号已验证发送域名
   - [ ] 测试邮件能正常发送
   - [ ] 检查垃圾邮件文件夹

---

完成后，你就可以开始使用"死了么"APP了！🎉
