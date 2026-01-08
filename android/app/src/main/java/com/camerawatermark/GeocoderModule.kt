package com.camerawatermark

import android.location.Geocoder
import android.location.Address
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import java.util.Locale
import java.util.concurrent.Executors

class GeocoderModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val executor = Executors.newSingleThreadExecutor()

    override fun getName(): String {
        return "GeocoderModule"
    }

    @ReactMethod
    fun getAddressFromLocation(latitude: Double, longitude: Double, promise: Promise) {
        executor.execute {
            try {
                val geocoder = Geocoder(reactApplicationContext, Locale.getDefault())
                
                if (!Geocoder.isPresent()) {
                    promise.reject("ERROR", "Geocoder不可用")
                    return@execute
                }

                val addresses: List<Address>? = try {
                    geocoder.getFromLocation(latitude, longitude, 1)
                } catch (e: Exception) {
                    promise.reject("ERROR", "获取地址失败: ${e.message}", e)
                    return@execute
                }

                if (addresses.isNullOrEmpty()) {
                    promise.reject("ERROR", "未找到地址信息")
                    return@execute
                }

                val addressString = formatAddress(addresses[0])
                promise.resolve(addressString)
            } catch (e: Exception) {
                promise.reject("ERROR", "地址解析失败: ${e.message}", e)
            }
        }
    }

    private fun formatAddress(address: Address): String {
        // 构建地址字符串：省市区街道
        val addressParts = mutableListOf<String>()
        
        // 省
        address.adminArea?.let { 
            if (it.isNotEmpty()) addressParts.add(it)
        }
        // 市
        address.locality?.let { 
            if (it.isNotEmpty() && !addressParts.contains(it)) addressParts.add(it)
        }
        // 区/县
        address.subLocality?.let { 
            if (it.isNotEmpty()) addressParts.add(it)
        }
        // 街道
        address.thoroughfare?.let { 
            if (it.isNotEmpty()) addressParts.add(it)
        }
        // 详细地址（门牌号等）
        address.featureName?.let { 
            if (it.isNotEmpty() && !addressParts.contains(it)) {
                addressParts.add(it)
            }
        }

        return if (addressParts.isNotEmpty()) {
            addressParts.joinToString("")
        } else {
            // 如果没有详细地址，尝试使用完整地址行
            try {
                address.getAddressLine(0) ?: "未知位置"
            } catch (e: Exception) {
                "未知位置"
            }
        }
    }
}

