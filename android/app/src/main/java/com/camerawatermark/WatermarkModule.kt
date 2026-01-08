package com.camerawatermark

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
import android.graphics.Typeface
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import java.io.File
import java.io.FileOutputStream
import kotlin.math.max
import kotlin.math.min

class WatermarkModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "WatermarkModule"
    }

    @ReactMethod
    fun addWatermark(imagePath: String, watermarkText: String, promise: Promise) {
        try {
            // 读取原始图片
            val bitmap = BitmapFactory.decodeFile(imagePath)
            if (bitmap == null) {
                promise.reject("ERROR", "无法读取图片文件")
                return
            }

            // 创建新的bitmap用于绘制水印
            val watermarkedBitmap = bitmap.copy(Bitmap.Config.ARGB_8888, true)
            val canvas = Canvas(watermarkedBitmap)

            // 根据图片尺寸调整基础大小
            val baseSize = min(watermarkedBitmap.width / 1080f, watermarkedBitmap.height / 1920f)
            val scaledTextSize = 72f * max(baseSize, 1f) // 基础字体大小，根据图片尺寸缩放，最小不小于72

            // 设置文本样式
            val textPaint = Paint().apply {
                color = android.graphics.Color.WHITE
                textSize = scaledTextSize
                typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                isAntiAlias = true
                // 添加阴影效果，增强可读性
                setShadowLayer(10f, 5f, 5f, android.graphics.Color.BLACK)
            }

            // 设置背景样式
            val bgPaint = Paint().apply {
                color = android.graphics.Color.argb(220, 0, 0, 0) // 半透明黑色背景
                isAntiAlias = true
            }

            // 设置边框样式
            val borderPaint = Paint().apply {
                color = android.graphics.Color.argb(150, 255, 255, 255) // 半透明白色边框
                style = Paint.Style.STROKE
                strokeWidth = 2f * baseSize
                isAntiAlias = true
            }

            // 分割文本行
            val initialLines = watermarkText.split("\n")
            val wrappedLines = mutableListOf<String>()

            val maxAllowedWidth = watermarkedBitmap.width * 0.85f - (30f * baseSize * 2) // 限制最大宽度为图片宽度的85%，并减去内边距

            initialLines.forEach { line ->
                if (textPaint.measureText(line) <= maxAllowedWidth) {
                    wrappedLines.add(line)
                } else {
                    // 智能换行
                    var currentLine = StringBuilder()
                    val words = line.split("(?<=\\S)(?=\\S)".toRegex()) // 按字符分割，保留中文连续性
                    for (word in words) {
                        if (textPaint.measureText(currentLine.toString() + word) <= maxAllowedWidth) {
                            currentLine.append(word)
                        } else {
                            if (currentLine.isNotEmpty()) {
                                wrappedLines.add(currentLine.toString())
                            }
                            currentLine = StringBuilder(word)
                        }
                    }
                    if (currentLine.isNotEmpty()) {
                        wrappedLines.add(currentLine.toString())
                    }
                }
            }

            // 计算文本宽度和高度
            val padding = 30f * baseSize
            val lineSpacing = 12f * baseSize
            val cornerRadius = 20f * baseSize
            
            var maxWidth = 0f
            val lineHeights = mutableListOf<Float>()
            
            wrappedLines.forEach { line ->
                val bounds = android.graphics.Rect()
                textPaint.getTextBounds(line, 0, line.length, bounds)
                val width = textPaint.measureText(line)
                lineHeights.add(bounds.height().toFloat())
                maxWidth = max(maxWidth, width)
            }
            
            val totalTextHeight = lineHeights.sum() + (wrappedLines.size - 1) * lineSpacing
            val totalHeight = totalTextHeight + padding * 2
            val actualMaxWidth = maxWidth + padding * 2

            val left = padding
            val bottom = watermarkedBitmap.height - padding
            val top = bottom - totalHeight
            val right = left + actualMaxWidth
            
            // 绘制圆角背景
            val bgRect = RectF(left, top, right, bottom)
            canvas.drawRoundRect(bgRect, cornerRadius, cornerRadius, bgPaint)
            // 绘制边框
            canvas.drawRoundRect(bgRect, cornerRadius, cornerRadius, borderPaint)
            
            // 绘制文本
            var currentY = top + padding + lineHeights[0] // 初始Y坐标
            wrappedLines.forEachIndexed { index, line ->
                canvas.drawText(line, left + padding, currentY, textPaint)
                if (index < wrappedLines.size - 1) {
                    currentY += lineHeights[index] + lineSpacing
                }
            }

            // 保存处理后的图片
            val outputFile = File(imagePath)
            val outputStream = FileOutputStream(outputFile)
            watermarkedBitmap.compress(Bitmap.CompressFormat.JPEG, 100, outputStream)
            outputStream.flush()
            outputStream.close()

            // 回收bitmap
            bitmap.recycle()
            watermarkedBitmap.recycle()

            promise.resolve(imagePath)
        } catch (e: Exception) {
            promise.reject("ERROR", "添加水印失败: ${e.message}", e)
        }
    }
}
