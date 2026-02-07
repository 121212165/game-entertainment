# 死了么APP - 常见问题FAQ

## 文档说明

本文档收集了在开发、部署、使用"死了么"APP过程中最常见的疑问和解决方案。

---

## 📱 项目相关

### Q1: "死了么"是什么意思？

**答：**
"死了么"是一款真实存在的产品（2026年初在AppStore付费榜第一），名字虽然有些特殊，但寓意深刻：

- **功能层面**：每日签到APP，如果长期未签到会通知紧急联系人
- **社会层面**：关注独居者的安全问题
- **产品层面**：展示简单想法也能创造价值

我们复刻这个项目是为了学习AI编程模式，产品名称保持了原样。

### Q2: 这个项目适合用于生产环境吗？

**答：**
当前版本是**学习/演示版本**，如果要用于生产环境，需要：

**必须添加：**
```
✅ 输入验证（防止恶意输入）
✅ 错误处理（网络异常、服务器错误）
✅ 加密存储（敏感数据加密）
✅ 日志系统（问题追踪）
✅ 性能优化（减少请求次数）
✅ 安全加固（代码混淆、防逆向）
```

**建议改进：**
```
✅ 添加用户反馈机制
✅ 支持多设备同步
✅ 添加推送通知
✅ 优化UI/UX
✅ 添加数据统计
✅ 支持国际化
```

### Q3: 项目完全免费吗？

**答：**
当前技术栈的成本：

```
Supabase免费版：
✅ 500MB数据库存储
✅ 1GB文件存储
✅ 50MB Edge Functions带宽/月
✅ 2个Edge Functions
✅ 无限API请求

对于个人使用或小规模应用，完全免费！

超出限额后：
- Pro版：$25/月起
- 需要评估是否值得付费
```

---

## 🛠️ 技术选型

### Q4: 为什么选择Kotlin而不是Java？

**答：**

| 对比项 | Kotlin | Java |
|--------|--------|------|
| **简洁性** | ✅ 代码量减少30% | ❌ 冗长的样板代码 |
| **空安全** | ✅ 编译时检查 | ❌ 运行时NullPointerException |
| **协程** | ✅ 原生支持，简单易用 | ❌ 需要RxJava或回调 |
| **扩展函数** | ✅ 增强代码可读性 | ❌ 不支持 |
| **数据类** | ✅ 自动生成equals/hashCode | ❌ 需要手动编写或用Lombok |
| **AI友好度** | ✅ 更现代，训练数据多 | ⚠️ 较老，模式复杂 |

**关键优势：**
```
Kotlin的数据类非常适合AI生成：
@Serializable
data class User(
    val id: String? = null,
    val name: String
)
→ AI不容易出错

Java的Bean需要更多代码：
public class User {
    private String id;
    private String name;
    // getter, setter, equals, hashCode...
→ 容易遗漏，AI容易出错
```

### Q5: 为什么选择Jetpack Compose而不是XML布局？

**答：**

| 对比项 | Jetpack Compose | XML布局 |
|--------|-----------------|---------|
| **声明式** | ✅ 状态驱动UI | ❌ 命令式findViewById |
| **代码量** | ✅ 减少50% | ❌ 大量XML + 适配器 |
| **预览** | ✅ 实时预览 | ⚠️ 需要运行 |
| **AI友好** | ✅ 纯Kotlin，易生成 | ⚠️ 混合语言，复杂 |
| **类型安全** | ✅ 编译时检查 | ❌ 运行时错误 |
| **动画** | ✅ 简单API | ❌ 复杂的XML属性 |

**实际对比：**

```kotlin
// Compose版本（50行）
@Composable
fun CheckInButton(onClick: () -> Unit, checkedIn: Boolean) {
    Button(
        onClick = onClick,
        enabled = !checkedIn,
        modifier = Modifier.fillMaxWidth()
    ) {
        Text(if (checkedIn) "已签到" else "签到")
    }
}

// XML版本（100+行）
// 需要XML布局 + Activity/Fragment + findViewById + 适配器...
→ AI生成XML更容易出错
```

### Q6: 为什么选择Supabase而不是Firebase？

**答：**

| 对比项 | Supabase | Firebase |
|--------|----------|----------|
| **数据库** | ✅ PostgreSQL | ⚠️ NoSQL（查询复杂） |
| **SQL支持** | ✅ 完整SQL | ❌ 只能通过SDK |
| **关系查询** | ✅ 原生JOIN | ❌ 需要多次查询 |
| **迁移** | ✅ SQL脚本 | ⚠️ 复杂的JSON规则 |
| **开源** | ✅ 可自部署 | ❌ 完全封闭 |
| **AI友好** | ✅ SQL是声明式 | ⚠️ NoSQL需要推理 |
| **价格** | ✅ 免费额度更大 | ⚠️ 免费额度小 |

**AI编程的关键优势：**

```sql
-- Supabase（SQL）- AI擅长
SELECT * FROM users
WHERE auth_id = auth.uid()
→ 声明式，AI容易理解

-- Firebase（NoSQL）- AI容易出错
db.collection("users")
  .where("auth_id", "==", auth.uid())
  .get()
→ 需要记住API，容易混淆
```

### Q7: 为什么使用匿名认证而不是传统注册登录？

**答：**

**用户体验角度：**

```
传统注册登录流程：
1. 打开APP
2. 点击注册
3. 输入邮箱
4. 设置密码
5. 验证邮箱
6. 登录
→ 流程太长，60%用户在步骤3流失

匿名认证流程：
1. 打开APP
2. 自动完成"注册"
3. 直接使用
→ 零流失，体验极佳
```

**技术实现角度：**

```
传统方式需要：
✅ 注册接口
✅ 登录接口
✅ 密码加密
✅ Token管理
✅ Session管理
✅ 找回密码
✅ 邮箱验证
→ 2000+行代码

匿名认证只需要：
✅ 调用signInAnonymously()
✅ 自动管理session
→ 1行代码
```

**权衡：**
- ⚠️ 用户换设备 = 新用户（可以后续升级为正式账号）
- ✅ 开发效率提升100倍
- ✅ 用户体验提升10倍

---

## 💻 开发相关

### Q8: 如何修改APP的名称和图标？

**答：**

**修改名称：**

```
文件：android/app/src/main/res/values/strings.xml

<resources>
    <string name="app_name">你的APP名称</string>
</resources>
```

**修改图标：**

```
1. 准备图标文件：
   - ic_launcher.png (前景，512x512)
   - ic_launcher_round.png (圆形)

2. 替换文件：
   android/app/src/main/res/mipmap-xxx/
   - ic_launcher.png
   - ic_launcher_round.png

3. 重新编译
```

**或者使用Android Studio的Image Asset Studio：**
```
右键res文件夹 → New → Image Asset
→ 自动生成所有尺寸
```

### Q9: 如何添加新的数据字段？

**答：**

**示例：添加用户电话字段**

**步骤1：修改数据库**
```sql
-- 在Supabase SQL Editor执行
ALTER TABLE users ADD COLUMN phone VARCHAR(20);
```

**步骤2：修改数据模型**
```kotlin
// User.kt
@Serializable
data class User(
    val id: String? = null,
    val name: String,
    val emergency_email: String,
    val phone: String? = null,  // 新增
    val device_id: String? = null,
    val created_at: String? = null
)
```

**步骤3：修改UI**
```kotlin
// SetupScreen.kt 添加输入框
OutlinedTextField(
    value = phone,
    onValueChange = viewModel::onPhoneChange,
    label = { Text("电话号码（可选）") },
    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone)
)
```

**步骤4：修改ViewModel**
```kotlin
// SetupViewModel.kt
fun createUser(...) {
    val user = User(
        ...,
        phone = _phone.value  // 新增
    )
}
```

### Q10: 如何添加新的界面？

**答：**

**示例：添加历史记录页面**

**步骤1：创建Screen**
```kotlin
// HistoryScreen.kt
@Composable
fun HistoryScreen(viewModel: HistoryViewModel) {
    val history by viewModel.history.collectAsState()

    LazyColumn {
        items(history) { item ->
            HistoryItem(item)
        }
    }
}
```

**步骤2：创建ViewModel**
```kotlin
// HistoryViewModel.kt
class HistoryViewModel : ViewModel() {
    private val _history = MutableStateFlow<List<CheckIn>>(emptyList())
    val history: StateFlow<List<CheckIn>> = _history

    init {
        loadHistory()
    }

    private fun loadHistory() {
        viewModelScope.launch {
            // 加载历史记录
        }
    }
}
```

**步骤3：添加导航**
```kotlin
// Navigation.kt
sealed class Screen(val route: String) {
    object Setup : Screen("setup")
    object CheckIn : Screen("checkin")
    object History : Screen("history")  // 新增
}

NavHost(...) {
    ...
    composable(Screen.History.route) {
        HistoryScreen(viewModel = hvm)
    }
}
```

**步骤4：添加入口**
```kotlin
// CheckInScreen.kt 添加按钮
Button(onClick = { navController.navigate(Screen.History.route) }) {
    Text("查看历史")
}
```

### Q11: 如何调试网络请求？

**答：**

**方法1：查看Android Studio Logcat**
```kotlin
// 在Repository中添加日志
Log.d("Supabase", "Request: $request")
Log.d("Supabase", "Response: $response")
```

**方法2：使用OkHttp拦截器**
```kotlin
// SupabaseClient.kt
val client = createSupabaseClient(...) {
    install(Realtime) {
        // 添加日志
        logger = { message -> Log.d("Realtime", message) }
    }
}
```

**方法3：查看Supabase Dashboard**
```
Dashboard → Database → Logs
可以看到所有SQL查询记录
```

**方法4：使用网络抓包工具**
```
Charles Proxy / Fiddler
→ 查看HTTP请求详情
```

---

## 🌐 Supabase相关

### Q12: Supabase免费版够用吗？

**答：**

对于个人项目或小规模MVP：

```
✅ 免费版限额：
- 500MB数据库
- 1GB文件存储
- 50MB Edge Functions带宽/月
- 2个Edge Functions
- 无限API请求

实际使用（死了么APP）：
- 数据库：每个用户约1KB
  → 可支持50万用户
- API请求：每天签到2次
  → 无限请求完全够用
- Edge Functions：每天执行1次
  → 50MB带宽足够

结论：个人使用完全免费！
```

### Q13: 如何备份Supabase数据？

**答：**

**方法1：使用Supabase Dashboard**
```
Database → Backups → Download
→ 手动下载备份
```

**方法2：使用Supabase CLI**
```bash
# 备份数据库
supabase db dump -f backup.sql

# 恢复数据库
supabase db reset -f backup.sql
```

**方法3：使用psql命令**
```bash
pg_dump -h db.xxx.supabase.co -U postgres -d postgres > backup.sql
```

**建议：定期备份**
```
# 添加到cron job
0 2 * * * /path/to/backup-script.sh
→ 每天凌晨2点自动备份
```

### Q14: RLS策略会影响性能吗？

**答：**

**影响分析：**

```
❌ 没有RLS：
SELECT * FROM users
→ 扫描全表

✅ 有RLS：
SELECT * FROM users
WHERE auth_id = 'xxx'
→ PostgreSQL会优化查询
→ 性能损失<5%

关键优化：
1. 在auth_id字段上建索引
2. RLS策略使用索引字段
3. 避免复杂的RLS逻辑
```

**实际测试：**

```sql
-- 添加索引
CREATE INDEX idx_users_auth_id ON users(auth_id);

-- 查看执行计划
EXPLAIN ANALYZE
SELECT * FROM users WHERE auth_id = auth.uid();
→ 应该看到Index Scan，而不是Seq Scan
```

### Q15: 如何保护API密钥？

**答：**

**重要概念：**

```
anon key（公开）：
✅ 可以在客户端使用
✅ 有RLS保护
✅ 泄露不危险

service_role key（私密）：
❌ 不能在客户端使用
❌ 绕过RLS，可以访问所有数据
❌ 泄露非常危险
```

**最佳实践：**

```kotlin
// ✅ 正确：local.properties（不提交到git）
supabase.url=https://xxx.supabase.co
supabase.anon.key=eyJ...
→ 添加到.gitignore

// ❌ 错误：硬编码在代码中
const SUPABASE_URL = "https://xxx.supabase.co"
→ 会泄露到GitHub

// ❌ 错误：使用service_role key在客户端
supabase.anon.key=service_role_key_...
→ 非常危险！
```

**验证是否安全：**

```bash
# 检查git历史
git log --all --full-history -- "*anon*"

# 检查是否提交了密钥
git log --all --full-history -p | grep "eyJ"
```

---

## 📧 Edge Functions相关

### Q16: Edge Functions执行超时怎么办？

**答：**

**问题原因：**

```
Supabase Edge Functions限制：
- 免费版：150秒超时
- Pro版：300秒超时

超时常见原因：
1. 邮件发送慢
2. 数据库查询慢
3. 外部API调用慢
4. 数据量大
```

**解决方案：**

```typescript
// 方案1：添加超时处理
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10000); // 10秒

try {
    await resend.emails.send({...}, { signal: controller.signal });
} catch (error) {
    if (error.name === 'AbortError') {
        console.error('请求超时');
    }
}

// 方案2：批量处理
const users = await getUsers();
for (const batch of chunk(users, 10)) {  // 每次处理10个
    await processBatch(batch);
}

// 方案3：异步队列
// 先插入任务到队列，后台慢慢处理
await supabase.from('email_queue').insert({ tasks });
```

### Q17: 如何本地测试Edge Functions？

**答：**

**方法1：使用Supabase CLI**

```bash
# 启动本地开发环境
supabase start

# 本地调用函数
supabase functions deploy check-missed-check-ins --no-verify-jwt
curl -X POST http://localhost:54321/functions/v1/check-missed-check-ins
```

**方法2：使用Deno**

```bash
# 安装Deno
curl -fsSL https://deno.land/x/install/install.sh | sh

# 本地运行
deno run --allow-net index.ts
```

**方法3：在Dashboard中测试**

```
Dashboard → Edge Functions → 选择函数 → Invoke
→ 可以看到实时日志
```

### Q18: Edge Functions如何处理环境变量？

**答：**

**配置环境变量：**

```bash
# 使用CLI
supabase secrets set RESEND_API_KEY=re_xxx

# 或在Dashboard中
Dashboard → Edge Functions → Settings → Env
```

**使用环境变量：**

```typescript
// index.ts
const resendApiKey = Deno.env.get('RESEND_API_KEY');

if (!resendApiKey) {
    throw new Error('RESEND_API_KEY not set');
}
```

**本地开发：**

```bash
# 创建.env文件
RESEND_API_KEY=re_xxx
SUPABASE_URL=http://localhost:54321

# 加载环境变量
supabase functions serve --env-file .env
```

---

## 📱 Android相关

### Q19: 如何处理Android权限？

**答：**

**当前项目需要的权限：**

```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

**如果需要添加其他权限：**

```xml
<!-- 示例：相机权限 -->
<uses-permission android:name="android.permission.CAMERA" />

<!-- 在代码中请求 -->
if (ContextCompat.checkSelfPermission(context, Manifest.permission.CAMERA)
    != PackageManager.PERMISSION_GRANTED) {
    ActivityCompat.requestPermissions(
        activity,
        arrayOf(Manifest.permission.CAMERA),
        REQUEST_CODE
    );
}
```

**注意事项：**

```
Android 6.0+：运行时权限
Android 10+：分区存储
Android 11+：自动授予部分权限
→ 需要适配不同版本
```

### Q20: 应用闪退怎么办？

**答：**

**调试步骤：**

**1. 查看Logcat**
```
Android Studio → Logcat
→ 搜索 "FATAL" 或 "AndroidRuntime"
→ 查看崩溃堆栈
```

**2. 常见崩溃原因：**

```
❌ NullPointerException
→ 检查对象是否为空

❌ NetworkOnMainThreadException
→ 网络请求不能在主线程
→ 使用viewModelScope.launch

❌ ClassNotFoundException
→ 检查依赖是否正确添加

❌ SecurityException
→ 检查权限是否申请
```

**3. 添加错误处理：**

```kotlin
// ViewModel
viewModelScope.launch {
    try {
        val result = repository.checkIn()
        _uiState.value = CheckInUiState.Success
    } catch (e: Exception) {
        _uiState.value = CheckInUiState.Error(e.message ?: "未知错误")
        Log.e("CheckIn", "签到失败", e)
    }
}
```

### Q21: 如何生成签名的APK？

**答：**

**步骤1：创建密钥库**

```bash
keytool -genkey -v -keystore silema-release.keystore \
  -alias silema -keyalg RSA -keysize 2048 -validity 10000
```

**步骤2：配置签名**

```kotlin
// app/build.gradle.kts
android {
    signingConfigs {
        create("release") {
            storeFile = file("silema-release.keystore")
            storePassword = "你的密码"
            keyAlias = "silema"
            keyPassword = "你的密码"
        }
    }

    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"))
        }
    }
}
```

**步骤3：生成APK**

```bash
# 使用Android Studio
Build → Generate Signed Bundle/APK → APK → release

# 或使用命令行
./gradlew assembleRelease
```

**步骤4：找到APK**

```
app/build/outputs/apk/release/app-release.apk
```

---

## 🚀 部署相关

### Q22: 如何将应用发布到Google Play？

**答：**

**步骤1：创建开发者账号**

```
1. 访问 https://play.google.com/console
2. 注册开发者账号（$25一次性费用）
3. 支付费用并等待审核
```

**步骤2：准备应用材料**

```
必需：
✅ 签名的APK或AAB
✅ 应用图标（512x512）
✅ 应用截图（至少2张）
✅ 应用描述
✅ 隐私政策URL
✅ 内容评级问卷
```

**步骤3：创建应用**

```
1. Google Play Console → 创建应用
2. 填写应用信息
3. 上传APK/AAB
4. 填写商店列表信息
5. 提交审核
6. 等待审核（通常1-3天）
```

**注意事项：**

```
- 首次审核较严格
- 需要隐私政策（可以免费生成）
- 应用权限需要说明用途
- 不能使用其他应用名称
```

### Q23: 如何更新应用版本？

**答：**

**步骤1：更新版本号**

```kotlin
// app/build.gradle.kts
defaultConfig {
    versionCode = 2  // 递增
    versionName = "1.1.0"  // 任意格式
}
```

**步骤2：生成新APK**

```bash
./gradlew assembleRelease
```

**步骤3：上传到Google Play**

```
Google Play Console → 应用 → 发布管理 →
  → 创建新版本 → 上传APK → 填写更新说明 → 发布
```

**版本号规则：**

```
versionCode：整数，必须递增
  1, 2, 3, 4...

versionName：字符串，显示给用户
  "1.0.0", "1.1.0", "2.0.0"
  通常使用：主版本.次版本.修订号
```

---

## 💡 最佳实践

### Q24: 如何提高代码质量？

**答：**

**1. 遵循Kotlin编码规范**

```kotlin
// ✅ 好的代码
data class User(
    val id: String,
    val name: String
)

// ❌ 避免的代码
class user {  // 应该大写
    var ID: String = ""  // 应该小驼峰
}
```

**2. 添加代码注释**

```kotlin
/**
 * 用户数据仓库
 *
 * 负责用户相关的所有数据操作
 */
class UserRepository {
    /**
     * 创建新用户
     * @param name 用户名
     * @param emergencyEmail 紧急联系人邮箱
     * @return 创建结果
     */
    suspend fun createUser(
        name: String,
        emergencyEmail: String
    ): Result<User>
}
```

**3. 编写单元测试**

```kotlin
@Test
fun `checkIn should return success when valid`() = runTest {
    // Given
    val userId = "test-id"

    // When
    val result = userRepository.checkIn(userId)

    // Then
    assertTrue(result.isSuccess)
}
```

**4. 使用代码检查工具**

```kotlin
// app/build.gradle.kts
plugins {
    id("org.jlleitschuh.gradle.ktlint") version "11.6.0"
}

// 运行检查
./gradlew ktlintCheck
```

### Q25: 如何优化应用性能？

**答：**

**1. 减少启动时间**

```kotlin
// ❌ 不好：在Application中做耗时操作
class SiLeMaApp : Application() {
    override fun onCreate() {
        super.onCreate()
        // 不要在这里做网络请求！
    }
}

// ✅ 好：延迟初始化
object SupabaseClient {
    val client by lazy { createSupabaseClient(...) }
}
```

**2. 优化列表性能**

```kotlin
// 使用LazyColumn而不是Column
LazyColumn {
    items(users) { user ->
        UserItem(user)
    }
}
→ 只渲染可见项，性能更好
```

**3. 缓存数据**

```kotlin
// 使用DataStore缓存用户信息
val context: Context
val dataStore = context.createDataStore("user_prefs")

val userId = dataStore.data.map { it[USER_ID_KEY] }
→ 减少网络请求
```

**4. 异步加载**

```kotlin
// ❌ 不好：阻塞UI
val user = userRepository.getUser()  // suspend函数
textView.text = user.name

// ✅ 好：异步加载
LaunchedEffect(Unit) {
    val user = userRepository.getUser()
    _userName.value = user.name
}
```

---

## 🎓 学习相关

### Q26: 我没有Android开发经验，能学这个项目吗？

**答：**

**可以，但建议按以下顺序学习：**

```
Week 1：Kotlin基础
- 变量、函数、类
- 空安全、扩展函数
- 协程基础

Week 2：Android基础
- 四大组件（Activity、Service...）
- 生命周期
- 资源管理

Week 3：Jetpack Compose
- Composable函数
- 状态管理
- Navigation

Week 4：本项目
- 跟随代码
- 修改UI
- 添加功能
```

**推荐学习资源：**
```
1. Kotlin官方文档
   https://kotlinlang.org/docs/

2. Android官方教程
   https://developer.android.com/courses

3. Jetpack Compose教程
   https://developer.android.com/jetpack/compose/documentation
```

### Q27: 我没有后端开发经验，Supabase容易学吗？

**答：**

**Supabase非常适合后端新手！**

**学习曲线：**

```
Day 1：理解数据库概念
- 表、字段、类型
- 主键、外键
- SQL基础

Day 2：Supabase基础
- 创建项目
- 使用Table Editor
- 执行SQL查询

Day 3：认证系统
- Anonymous Auth
- Email Auth
- RLS策略

Day 4：Edge Functions
- TypeScript基础
- 创建函数
- 部署

Day 5：完整项目
- 结合Android
- 实践本项目
```

**关键优势：**
```
✅ 不需要搭建服务器
✅ 不需要配置Nginx
✅ 不需要Docker
✅ 不需要运维知识
✅ 有完善的文档
✅ 有丰富的示例
```

### Q28: 如何系统学习AI编程？

**答：**

**推荐学习路径：**

```
阶段1：理解AI能力（1周）
- 阅读本文档
- 阅读AI编程模式文档
- 理解AI擅长和不擅长的

阶段2：实践简单项目（2周）
- 从TODO应用开始
- 使用AI生成代码
- 学习如何提问

阶段3：进阶项目（1个月）
- 完成类似"死了么"的项目
- 学习技术选型
- 理解架构设计

阶段4：形成模式（持续）
- 总结经验
- 提炼模式
- 创建自己的模板库

阶段5：分享传播（持续）
- 写博客
- 录视频
- 参与社区
```

**关键要点：**
```
✅ 从小项目开始
✅ 注重理解而非复制
✅ 持续总结经验
✅ 形成自己的模式
```

---

## 🔍 故障排查

### Q29: 数据库连接失败

**症状：**
```
Error: Failed to connect to database
```

**排查步骤：**

```
1. 检查网络连接
   → 能否访问supabase.com

2. 检查URL格式
   → 应该是 https://xxx.supabase.co
   → 不应该有尾部斜杠

3. 检查项目状态
   → Supabase Dashboard
   → 检查项目是否暂停

4. 检查API密钥
   → 是否使用了正确的anon key
   → 是否有多余的空格

5. 查看Supabase状态
   → https://status.supabase.com
   → 检查是否有服务中断
```

### Q30: Edge Function没有触发

**症状：**
```
Cron Job执行但Edge Function没有运行
```

**排查步骤：**

```
1. 检查Cron配置
   → Dashboard → Cron Jobs
   → 检查表达式是否正确

2. 手动触发测试
   → 点击 "Invoke"
   → 查看是否执行

3. 查看日志
   → Dashboard → Edge Functions
   → 选择函数 → Logs
   → 查看错误信息

4. 检查函数代码
   → 确认已部署最新版本
   → 检查语法错误

5. 检查环境变量
   → 确认所有必需的变量已设置
   → 检查变量值是否正确
```

### Q31: 邮件发送失败

**症状：**
```
Edge Function执行但邮件未收到
```

**排查步骤：**

```
1. 检查Resend API Key
   → 是否正确配置
   → 是否已激活

2. 查看Resend Dashboard
   → Logs标签
   → 查看发送状态

3. 检查邮件地址
   → 是否格式正确
   → 是否被标记为垃圾邮件

4. 检查发件域名
   → 是否已验证域名
   → 免费域名容易被拦截

5. 测试发送
   → 使用Resend Dashboard测试发送
   → 确认API可用
```

---

## 📞 获取帮助

### Q32: 遇到问题如何寻求帮助？

**答：**

**步骤1：查看文档**

```
✅ 本FAQ文档
✅ SETUP_GUIDE.md
✅ 代码注释
→ 90%的问题都能找到答案
```

**步骤2：搜索解决方案**

```
搜索技巧：
- "Supabase [问题]"
- "Kotlin [问题]"
- "Jetpack Compose [问题]"
- Stack Overflow
- GitHub Issues
```

**步骤3：查看日志**

```
关键日志位置：
- Android Studio Logcat
- Supabase Dashboard → Logs
- Edge Functions → Logs
→ 日志会告诉你具体错误
```

**步骤4：简化问题**

```
创建最小可复现示例：
1. 删除无关代码
2. 只保留核心逻辑
3. 确认问题可复现
4. 清晰描述问题
```

**步骤5：提问模板**

```
标题：[Supabase] Edge Function执行超时

环境：
- Supabase免费版
- Edge Function: check-missed-check-ins
- 数据量：100个用户

问题描述：
Edge Function在执行150秒后超时

已尝试：
1. 添加了日志
2. 检查了数据库查询（正常）
3. 简化了邮件发送逻辑

期望：如何优化Edge Function性能？
```

---

## 🎉 结语

### FAQ维护

这个FAQ会持续更新，如果你有新的问题或建议，欢迎反馈！

### 学习资源汇总

```
📚 项目文档
├─ 5分钟快速上手指南.md ← 从这里开始
├─ SETUP_GUIDE.md（详细部署）
├─ 死了吗的AI编程模式.md（理论方法）
└─ 死了么AI编程实战对话案例.md（实战记录）

🌐 外部资源
├─ Supabase文档：https://supabase.com/docs
├─ Kotlin文档：https://kotlinlang.org/docs
├─ Android文档：https://developer.android.com
└─ Compose文档：https://developer.android.com/jetpack/compose
```

### 最后的话

> "没有愚蠢的问题，只有不提问的学习者。"

遇到问题不要怕：
1. 查看文档
2. 搜索解决方案
3. 简化问题
4. 寻求帮助

记住：每个专家都是初学者过来的！

**祝你学习顺利！** 🚀

---

**文档版本**：v1.0
**问题数量**：32个
**覆盖范围**：开发、部署、故障排查、学习
**最后更新**：2026年
