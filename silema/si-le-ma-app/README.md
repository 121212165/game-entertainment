# 死了么 APP - Android版本

一款基于Jetpack Compose + Supabase开发的签到提醒应用。

## 功能概述

- 用户输入姓名和紧急联系人邮箱
- 每日签到功能
- 如果连续2天未签到，自动发送邮件通知紧急联系人

## 技术栈

- **前端**: Kotlin + Jetpack Compose
- **后端**: Supabase (PostgreSQL + Auth + Edge Functions)
- **认证**: Supabase Anonymous Auth
- **数据库**: PostgreSQL with RLS (Row Level Security)
- **定时任务**: Supabase Cron Jobs

## 项目结构

```
si-le-ma-app/
├── database/              # 数据库脚本
│   ├── schema.sql        # 数据表结构
│   └── rls_policies.sql  # 行级安全策略
├── edge-functions/       # Supabase Edge Functions
│   ├── check-missed-check-ins/
│   └── send-notification-email/
├── android/              # Android项目
│   └── app/
└── docs/                # 文档
```

## 快速开始

### 1. 创建Supabase项目

1. 访问 [https://supabase.com](https://supabase.com)
2. 创建新项目
3. 在项目设置中获取API URL和anon key

### 2. 执行数据库脚本

在Supabase Dashboard的SQL Editor中依次执行：
- `database/schema.sql`
- `database/rls_policies.sql`

### 3. 部署Edge Functions

```bash
# 安装Supabase CLI
npm install -g supabase

# 登录并链接项目
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# 部署Edge Functions
supabase functions deploy check-missed-check-ins
supabase functions deploy send-notification-email
```

### 4. 配置Android项目

1. 打开Android Studio
2. 导入`android`目录
3. 在`local.properties`中添加：
```properties
supabase.url=YOUR_SUPABASE_URL
supabase.anon.key=YOUR_SUPABASE_ANON_KEY
```

### 5. 配置Cron Job

在Supabase Dashboard中配置Cron Job：
- 名称: `check-missed-check-ins`
- Cron表达式: `0 1 * * *` (每天UTC 1:00执行)
- 端点: `/functions/v1/check-missed-check-ins`

## 开发进度

- [x] 数据库设计
- [x] Edge Functions开发
- [ ] Android UI实现
- [ ] Supabase集成
- [ ] 测试与优化

## 许可证

MIT License
