package com.camerawatermark

import android.content.Intent
import android.net.Uri
import androidx.core.content.FileProvider
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import java.io.File

class ImageShareModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "ImageShareModule"
    }

    @ReactMethod
    fun shareImage(imagePath: String, promise: Promise) {
        try {
            val file = File(imagePath.replace("file://", ""))
            if (!file.exists()) {
                promise.reject("ERROR", "图片文件不存在")
                return
            }

            // 使用 FileProvider 生成 content URI
            val uri: Uri = FileProvider.getUriForFile(
                reactApplicationContext,
                "${reactApplicationContext.packageName}.fileprovider",
                file
            )

            val shareIntent = Intent().apply {
                action = Intent.ACTION_SEND
                putExtra(Intent.EXTRA_STREAM, uri)
                type = "image/jpeg"
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }

            val chooser = Intent.createChooser(shareIntent, "分享照片")
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(chooser)

            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERROR", "分享失败: ${e.message}", e)
        }
    }
}

