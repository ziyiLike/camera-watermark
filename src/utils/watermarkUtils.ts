import {Platform, NativeModules} from 'react-native';
import RNFS from 'react-native-fs';
import {CameraRoll} from '@react-native-camera-roll/camera-roll';

interface Location {
  latitude: number;
  longitude: number;
}

const {WatermarkModule, GeocoderModule} = NativeModules;

export const saveImageWithWatermark = async (
  imageUri: string,
  location: Location | null,
): Promise<string> => {
  try {
    // 获取当前时间
    const now = new Date();
    const timeString = now.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    // 格式化位置信息 - 使用逆地理编码获取具体地址
    let locationString = '位置: 未获取';
    if (location && GeocoderModule && GeocoderModule.getAddressFromLocation) {
      try {
        // 尝试获取具体地址
        const address = await GeocoderModule.getAddressFromLocation(
          location.latitude,
          location.longitude
        );
        locationString = `位置: ${address}`;
      } catch (error) {
        console.warn('获取地址失败，使用坐标:', error);
        // 如果获取地址失败，使用坐标
        locationString = `位置: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
      }
    } else if (location) {
      // 如果没有 Geocoder 模块，使用坐标
      locationString = `位置: ${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
    }

    // 创建水印文本
    const watermarkText = `${timeString}\n${locationString}`;

    // 生成带时间戳的文件名
    const timestamp = now.getTime();
    const fileName = `watermark_${timestamp}.jpg`;
    const destPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

    // 复制文件到缓存目录
    await RNFS.copyFile(imageUri, destPath);

    // 使用原生模块添加水印
    let finalUri = destPath;
    if (WatermarkModule && WatermarkModule.addWatermark) {
      try {
        finalUri = await WatermarkModule.addWatermark(destPath, watermarkText);
      } catch (error) {
        console.warn('添加水印失败，使用原图:', error);
        // 如果添加水印失败，使用原图
      }
    } else {
      console.warn('水印模块未找到，使用原图');
    }

    // 保存到系统相册
    await CameraRoll.save(finalUri, {type: 'photo'});

    // 返回处理后的图片路径（用于预览和分享）
    // Android 需要使用 file:// URI
    const fileUri = Platform.OS === 'android' 
      ? `file://${finalUri}` 
      : finalUri;
    
    return fileUri;
  } catch (error) {
    console.error('保存图片失败:', error);
    throw error;
  }
};

