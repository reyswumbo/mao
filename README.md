# MaoMao - 现代原生 Android 漫画阅读器

> 一个基于 Jetpack Compose 和 Material 3 构建的轻量级、现代化、原生 Android 漫画阅读应用。

## 📱 项目介绍

MaoMao 是一个专为移动端设计的现代原生 Android 漫画阅读器，旨在提供流畅、舒适、沉浸式的漫画阅读体验。应用采用 Kotlin + Jetpack Compose + Material 3 技术栈，遵循现代 Android 开发最佳实践。

### 核心特性

- 🎨 **现代原生 UI/UX** - 基于 Jetpack Compose 和 Material 3，支持深色模式
- 📖 **优化的漫画阅读器** - 垂直滚动、平滑图片加载、章节导航、阅读进度保存
- 🔖 **个人阅读体验** - 收藏、阅读历史、阅读进度、继续阅读
- 🔍 **搜索与发现** - 漫画搜索、分类浏览、热门推荐
- 💾 **本地数据存储** - 所有用户数据本地存储，无需账号
- 🌐 **可扩展架构** - 源独立架构，支持未来添加更多漫画源
- ⚡ **高性能轻量** - 启动快、内存占用少、APK 体积小
- 🇮🇩 **全印尼语界面** - 所有用户界面均为印尼语

## 🌐 数据来源

当前版本集成以下漫画源：

- **BacaKomik** - https://bacakomik.my/

应用使用网页抓取技术获取漫画数据，仅提取阅读体验所需的内容和数据。

## 🏗️ 项目架构

```
app/src/main/java/com/maomao/
├── data/                    # 数据层
│   ├── model/               # 数据模型
│   ├── source/              # 数据源
│   │   ├── bacakomik/       # BacaKomik 实现
│   │   └── local/           # 本地存储
│   └── repository/          # 仓库实现
├── domain/                  # 领域层
│   ├── model/               # 领域模型
│   ├── repository/          # 仓库接口
│   └── usecase/             # 用例
├── presentation/            # 表现层
│   ├── home/                # 首页
│   ├── search/              # 搜索
│   ├── detail/              # 详情
│   ├── reader/              # 阅读器
│   ├── favorite/            # 收藏
│   ├── history/             # 历史
│   ├── settings/            # 设置
│   ├── common/              # 通用组件
│   └── main/                # 主入口
├── di/                      # 依赖注入
├── util/                    # 工具类
└── theme/                   # 主题
```

### 架构模式

- **Clean Architecture** - 分层架构，关注点分离
- **MVVM** - ViewModel + StateFlow + Compose
- **Repository Pattern** - 数据源抽象
- **Use Case Pattern** - 业务逻辑封装
- **Hilt** - 依赖注入

## 🛠️ 使用技术

### 核心框架
- **Kotlin** - 主要开发语言
- **Jetpack Compose** - 声明式 UI 框架
- **Material 3** - 设计系统
- **Navigation Compose** - 导航

### 网络与数据
- **OkHttp** - HTTP 客户端
- **Jsoup** - HTML 解析/网页抓取
- **Kotlinx Serialization** - JSON 序列化
- **Room Database** - 本地数据库
- **DataStore Preferences** - 设置存储

### 图片加载
- **Coil** - 协程图片加载库

### 构建工具
- **Gradle (Kotlin DSL)** - 构建系统
- **KSP** - Kotlin Symbol Processing
- **R8/ProGuard** - 代码混淆优化

### CI/CD
- **GitHub Actions** - 自动化构建测试

## 🚀 安装方法

### 从 GitHub Releases 下载
1. 前往 [Releases](https://github.com/your-repo/maomao/releases)
2. 下载最新的 `app-release.aab` 或 `app-debug.apk`
3. 安装到 Android 设备 (Android 7.0+)

### 从源码构建
```bash
# 克隆仓库
git clone https://github.com/your-repo/maomao.git
cd maomao

# 构建 Debug APK
./gradlew assembleDebug

# 构建 Release AAB
./gradlew bundleRelease
```

## 🏃 项目运行方法

### 前置要求
- Android Studio Ladybug (2024.2.1) 或更高版本
- JDK 17
- Android SDK 34
- Android 7.0 (API 24) 或更高版本的设备/模拟器

### 运行步骤
1. 打开 Android Studio
2. 选择 `File > Open` 打开项目根目录
3. 等待 Gradle 同步完成
4. 连接设备或启动模拟器
5. 点击 `Run` (▶️) 或按 `Shift + F10`

## 📦 构建方法

### Debug 构建
```bash
./gradlew assembleDebug
# 输出: app/build/outputs/apk/debug/app-debug.apk
```

### Release 构建
```bash
./gradlew bundleRelease
# 输出: app/build/outputs/bundle/release/app-release.aab
```

### 运行测试
```bash
# 单元测试
./gradlew testDebugUnitTest

# 连接测试 (需连接设备)
./gradlew connectedDebugAndroidTest
```

### 代码检查
```bash
# Lint 检查
./gradlew lintDebug
```

## 🔧 GitHub Actions

项目配置了 GitHub Actions 工作流 (`.github/workflows/build.yml`)，包含：

1. **Build & Test** - 每次推送/PR 自动运行
   - 代码检出
   - JDK 17 环境配置
   - Android SDK 配置
   - Gradle 缓存
   - Debug APK 构建
   - 单元测试运行
   - Lint 检查
   - 构建产物上传

2. **Build Release AAB** - 主分支推送时触发
   - Release AAB 构建
   - 产物上传

3. **Create Release** - 自动创建 GitHub Release
   - 下载构建产物
   - 创建版本标签
   - 发布 Release

## 📊 APK/AAB 信息

| 指标 | 目标值 |
|------|--------|
| Min SDK | 24 (Android 7.0) |
| Target SDK | 34 (Android 14) |
| Compile SDK | 34 |
| 架构 | arm64-v8a, armeabi-v7a |
| 语言 | 印尼语 (应用) / 中文 (文档) |

## 💾 数据存储方式

### Room Database
- **收藏表** - 存储用户收藏的漫画
- **历史表** - 存储阅读历史记录
- **进度表** - 存储阅读进度 (滚动位置、当前图片索引)

### DataStore Preferences
- 主题模式 (跟随系统/浅色/深色)
- 阅读器背景颜色
- 阅读器滚动模式
- 自动加载图片设置

所有数据均存储在设备本地，应用不需要账号系统，不上传任何用户数据。

## 📁 项目结构

```
maomao/
├── .github/
│   └── workflows/
│       └── build.yml          # GitHub Actions 工作流
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/maomao/
│   │   │   │   ├── data/      # 数据层
│   │   │   │   ├── domain/    # 领域层
│   │   │   │   ├── presentation/ # 表现层
│   │   │   │   ├── di/        # 依赖注入
│   │   │   │   ├── theme/     # 主题
│   │   │   │   └── util/      # 工具类
│   │   │   ├── res/           # 资源文件
│   │   │   │   ├── values/    # 字符串、颜色、主题
│   │   │   │   ├── values-night/ # 深色模式资源
│   │   │   │   ├── drawable/  # 图标
│   │   │   │   └── xml/       # 数据提取/备份规则
│   │   │   └── AndroidManifest.xml
│   │   ├── test/              # 单元测试
│   │   └── androidTest/       # 仪器测试
│   ├── build.gradle.kts       # 应用模块构建脚本
│   └── proguard-rules.pro     # 混淆规则
├── gradle/
│   └── wrapper/               # Gradle Wrapper
├── build.gradle.kts           # 根项目构建脚本
├── settings.gradle.kts        # 项目设置
├── gradlew                    # Gradle Wrapper (Linux/Mac)
├── gradlew.bat                # Gradle Wrapper (Windows)
└── README.md                  # 本文件
```

## 🔌 API / 网页抓取 实现

### BacaKomik 实现 (`BacaKomikScraperImpl`)

使用 **Jsoup** 解析 HTML 页面：

1. **首页数据** - 解析热门、最新、连载中、已完结漫画列表
2. **漫画详情** - 提取封面、标题、评分、状态、类型、作者、简介、章节列表
3. **章节图片** - 获取章节所有图片 URL、上一章/下一章链接
4. **搜索** - 关键词搜索，支持分页
5. **分类浏览** - 按类型浏览，支持分页

### 错误处理
- 网络超时处理 (30秒)
- HTTP 错误码处理
- 解析异常捕获
- 用户友好的印尼语错误提示
- 重试机制

### 源抽象
`BacaKomikSource` 接口定义了数据源契约，便于未来添加新数据源：
```kotlin
interface BacaKomikSource {
    suspend fun getHomeData(): SourceResult<HomeData>
    suspend fun getComicDetail(url: String): SourceResult<ComicDetail>
    suspend fun getChapterImages(url: String): SourceResult<ChapterImages>
    suspend fun searchComics(query: String, page: Int = 1): SourceResult<SearchResult>
    suspend fun getComicsByCategory(category: String, page: Int = 1): SourceResult<SearchResult>
}
```

## 🎯 设计原则

1. **原生优先** - 非网页套壳，纯原生 Compose UI
2. **以阅读为中心** - 阅读器体验最优先
3. **轻量级** - 最小依赖、最小体积、最小内存
4. **可扩展** - 源独立架构，易于添加新漫画源
5. **本地化** - 全印尼语界面，符合目标用户习惯
6. **无障碍** - 支持 TalkBack、大字体、高对比度
7. **深色模式** - 完整的浅色/深色/跟随系统支持

## 📄 许可证

本项目仅供学习和挑战参赛使用。

## 📧 联系方式

提交评审邮箱：chal@animexin.dev

---

**MaoMao** - 打造最好的移动端漫画阅读体验 🚀