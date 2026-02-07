-- 死了么APP 数据库表结构
-- 执行此脚本创建users和check_ins表

-- 启用UUID扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- 关联Supabase Auth的用户ID
    name VARCHAR(100) NOT NULL,                               -- 用户姓名
    emergency_email VARCHAR(255) NOT NULL,                     -- 紧急联系人邮箱
    device_id VARCHAR(255),                                    -- 设备唯一标识
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 签到记录表
CREATE TABLE check_ins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL,                               -- 签到日期
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()), -- 签到时间
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, check_in_date)                             -- 防止同一天重复签到
);

-- 创建索引提升查询性能
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX idx_check_ins_date ON check_ins(check_in_date);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 添加注释
COMMENT ON TABLE users IS '用户信息表';
COMMENT ON TABLE check_ins IS '签到记录表';
COMMENT ON COLUMN users.auth_id IS '关联Supabase Auth的用户ID';
COMMENT ON COLUMN users.emergency_email IS '紧急联系人的邮箱地址';
COMMENT ON COLUMN check_ins.check_in_date IS '签到日期(用于判断是否连续未签到)';
