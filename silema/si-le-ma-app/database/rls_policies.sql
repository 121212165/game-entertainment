-- 死了么APP 行级安全策略(RLS)
-- 在执行schema.sql后执行此脚本

-- 启用RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- 用户表策略

-- 策略1: 用户只能查看自己的记录(通过auth_id匹配)
CREATE POLICY "Users can view own data"
    ON users FOR SELECT
    USING (auth_id = auth.uid());

-- 策略2: 用户可以插入自己的记录
CREATE POLICY "Users can insert own data"
    ON users FOR INSERT
    WITH CHECK (auth_id = auth.uid());

-- 策略3: 用户可以更新自己的记录
CREATE POLICY "Users can update own data"
    ON users FOR UPDATE
    USING (auth_id = auth.uid())
    WITH CHECK (auth_id = auth.uid());

-- 策略4: Service Role可以访问所有用户数据(用于Edge Functions)
CREATE POLICY "Service role can access all users"
    ON users FOR ALL
    USING (auth.role() = 'service_role');

-- 签到记录表策略

-- 策略1: 用户只能查看自己的签到记录
CREATE POLICY "Users can view own check-ins"
    ON check_ins FOR SELECT
    USING (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

-- 策略2: 用户可以插入自己的签到记录
CREATE POLICY "Users can insert own check-ins"
    ON check_ins FOR INSERT
    WITH CHECK (
        user_id IN (
            SELECT id FROM users WHERE auth_id = auth.uid()
        )
    );

-- 策略3: Service Role可以访问所有签到记录(用于Edge Functions)
CREATE POLICY "Service role can access all check-ins"
    ON check_ins FOR ALL
    USING (auth.role() = 'service_role');

-- 创建有用的视图

-- 视图1: 用户签到统计视图
CREATE OR REPLACE VIEW user_checkin_stats AS
SELECT
    u.id,
    u.name,
    u.emergency_email,
    u.auth_id,
    COUNT(c.id) as total_check_ins,
    MAX(c.check_in_date) as last_check_in_date,
    CASE
        WHEN MAX(c.check_in_date) = CURRENT_DATE THEN 'checked_in'
        WHEN MAX(c.check_in_date) = CURRENT_DATE - INTERVAL '1 day' THEN 'can_check_in'
        ELSE 'missed'
    END as today_status
FROM users u
LEFT JOIN check_ins c ON u.id = c.user_id
GROUP BY u.id, u.name, u.emergency_email, u.auth_id;

-- 视图2: 未签到用户视图(连续2天未签到)
CREATE OR REPLACE VIEW users_missed_checkins AS
SELECT
    u.id,
    u.name,
    u.emergency_email,
    u.auth_id,
    MAX(c.check_in_date) as last_check_in_date,
    CURRENT_DATE - MAX(c.check_in_date) as days_missed
FROM users u
LEFT JOIN check_ins c ON u.id = c.user_id
GROUP BY u.id, u.name, u.emergency_email, u.auth_id
HAVING CURRENT_DATE - MAX(c.check_in_date) >= 2
   OR MAX(c.check_in_date) IS NULL; -- 从未签到的用户

-- 添加注释
COMMENT ON VIEW user_checkin_stats IS '用户签到统计视图';
COMMENT ON VIEW users_missed_checkins IS '连续2天未签到的用户视图';
