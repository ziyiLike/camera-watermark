import {Platform, PermissionsAndroid, Alert} from 'react-native';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';

export const requestPermissions = async (): Promise<boolean> => {
  if (Platform.OS === 'android') {
    try {
      // 请求相机权限
      const cameraGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: '相机权限',
          message: '应用需要访问相机以拍照',
          buttonNeutral: '稍后询问',
          buttonNegative: '拒绝',
          buttonPositive: '允许',
        },
      );

      // 请求位置权限
      const locationGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: '位置权限',
          message: '应用需要访问位置以添加位置水印',
          buttonNeutral: '稍后询问',
          buttonNegative: '拒绝',
          buttonPositive: '允许',
        },
      );

      // 请求存储权限（Android 10+）
      let storageGranted = PermissionsAndroid.RESULTS.GRANTED;
      if (Platform.Version >= 29) {
        storageGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: '存储权限',
            message: '应用需要访问存储以保存照片',
            buttonNeutral: '稍后询问',
            buttonNegative: '拒绝',
            buttonPositive: '允许',
          },
        );
      }

      return (
        cameraGranted === PermissionsAndroid.RESULTS.GRANTED &&
        locationGranted === PermissionsAndroid.RESULTS.GRANTED &&
        (storageGranted === PermissionsAndroid.RESULTS.GRANTED ||
          Platform.Version >= 29) // Android 10+ 不需要存储权限
      );
    } catch (err) {
      console.warn('权限请求失败:', err);
      return false;
    }
  }

  // iOS 权限处理
  if (Platform.OS === 'ios') {
    const cameraStatus = await request(PERMISSIONS.IOS.CAMERA);
    const locationStatus = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

    return (
      cameraStatus === RESULTS.GRANTED && locationStatus === RESULTS.GRANTED
    );
  }

  return false;
};

