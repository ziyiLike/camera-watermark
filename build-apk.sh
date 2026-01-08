#!/bin/bash

# 构建APK脚本

echo "开始构建APK..."

# 检查Java版本
JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
if [ "$JAVA_VERSION" -lt 17 ]; then
    echo "⚠️  警告: 需要 Java 17，当前版本: Java $JAVA_VERSION"
    echo "请安装 Java 17 或设置 JAVA_HOME 环境变量"
    exit 1
fi

# 设置代理（如果需要）
if [ -z "$https_proxy" ] && [ -z "$http_proxy" ]; then
    echo "提示: 如果下载依赖较慢，可以设置代理："
    echo "export https_proxy=http://127.0.0.1:7897 http_proxy=http://127.0.0.1:7897 all_proxy=socks5://127.0.0.1:7897"
fi

# 进入android目录
cd android

# 清理之前的构建
echo "清理之前的构建..."
./gradlew clean

# 构建Debug APK（会自动打包 JavaScript bundle）
echo "构建Debug APK（包含 JavaScript bundle）..."
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo "✅ Debug APK构建成功！"
    echo "APK位置: android/app/build/outputs/apk/debug/app-debug.apk"
else
    echo "❌ Debug APK构建失败"
    exit 1
fi

# 询问是否构建Release版本
read -p "是否构建Release APK? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "构建Release APK..."
    ./gradlew assembleRelease
    
    if [ $? -eq 0 ]; then
        echo "✅ Release APK构建成功！"
        echo "APK位置: android/app/build/outputs/apk/release/app-release.apk"
    else
        echo "❌ Release APK构建失败"
        exit 1
    fi
fi

cd ..

echo "构建完成！"

