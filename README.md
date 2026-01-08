# 相机水印 App

一个React Native应用，可以拍照并自动添加当前时间和位置水印，然后保存到系统相册。

## 功能特性

- 📸 拍照功能
- 🕐 自动添加当前时间水印
- 📍 自动添加当前位置水印
- 💾 自动保存到系统相册

## 环境要求

- Node.js >= 18
- Java 17
- Android SDK（需要 Android SDK Platform 34 和 Build Tools 34.0.0）
- pnpm

### 安装 Android SDK

**方法1：使用 Android Studio（推荐）**
1. 下载并安装 [Android Studio](https://developer.android.com/studio)
2. 打开 Android Studio，进入 Preferences -> Appearance & Behavior -> System Settings -> Android SDK
3. 安装 Android SDK Platform 34 和 Build Tools 34.0.0
4. SDK 默认位置：
   - macOS: `~/Library/Android/sdk`
   - Linux: `~/Android/Sdk`
   - Windows: `C:\Users\YOUR_USERNAME\AppData\Local\Android\Sdk`

**方法2：使用命令行工具**
```bash
# macOS
brew install --cask android-studio

# 或使用命令行工具
brew install android-platform-tools
```

### 配置 Android SDK 路径

创建 `android/local.properties` 文件并设置 SDK 路径：

```properties
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
```

或者设置环境变量：
```bash
export ANDROID_HOME=~/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### 安装 Java 17

如果系统没有 Java 17，可以通过以下方式安装：

**macOS (使用 Homebrew):**
```bash
brew install openjdk@17
```

然后设置 JAVA_HOME：
```bash
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

或者在 `android/gradle.properties` 中设置：
```properties
org.gradle.java.home=/path/to/java17
```

## 安装依赖

```bash
pnpm install
```

## 运行应用

### Android

```bash
# 启动Metro bundler
pnpm start

# 在另一个终端运行Android应用
pnpm android
```

## 打包APK

### Debug APK

构建时会自动打包 JavaScript bundle，APK 可以独立运行，不需要 Metro bundler：

```bash
cd android
./gradlew assembleDebug
```

生成的APK文件位于：`android/app/build/outputs/apk/debug/app-debug.apk`

**注意**：构建过程会自动执行 `bundleDebugJsAndAssets` 任务，将 JavaScript 代码打包到 APK 中。

### Release APK

1. 首先需要配置签名密钥（可选，开发测试可以使用debug签名）

2. 打包Release版本：

```bash
cd android
./gradlew assembleRelease
```

生成的APK文件位于：`android/app/build/outputs/apk/release/app-release.apk`

## 权限说明

应用需要以下权限：
- 相机权限：用于拍照
- 位置权限：用于获取当前位置并添加位置水印
- 存储权限：用于保存照片到系统相册

## 技术栈

- React Native 0.73
- TypeScript
- React Native Image Picker（拍照）
- React Native Get Location（获取位置）
- React Native Camera Roll（保存到相册）
- Android原生模块（添加水印）

## 注意事项

- 首次使用需要授予相机和位置权限
- 位置获取需要GPS信号，在室内可能无法获取准确位置
- Android 10及以上版本不需要存储权限即可保存到相册

