import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Share,
  Platform,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import { launchCamera, ImagePickerResponse } from 'react-native-image-picker';
import GetLocation from 'react-native-get-location';
import { saveImageWithWatermark } from '../utils/watermarkUtils';
import { requestPermissions } from '../utils/permissions';
import { NativeModules } from 'react-native';

const { ImageShareModule } = NativeModules;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CameraScreen = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleTakePhoto = async () => {
    try {
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) {
        Alert.alert('权限被拒绝', '需要相机和位置权限才能使用此功能');
        return;
      }

      setIsProcessing(true);

      let location = null;
      try {
        location = await GetLocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
        });
      } catch (error) {
        console.warn('获取位置失败:', error);
      }

      launchCamera(
        {
          mediaType: 'photo',
          quality: 1,
          saveToPhotos: false,
        },
        async (response: ImagePickerResponse) => {
          if (response.didCancel || response.errorCode) {
            setIsProcessing(false);
            if (response.errorCode) {
              Alert.alert('错误', '拍照失败: ' + response.errorMessage);
            }
            return;
          }

          if (response.assets && response.assets[0]) {
            const imageUri = response.assets[0].uri;
            if (imageUri) {
              try {
                const processedImageUri = await saveImageWithWatermark(imageUri, location);
                setPreviewImage(processedImageUri);
              } catch (error) {
                console.error('保存图片失败:', error);
                Alert.alert('错误', '保存图片失败: ' + (error as Error).message);
              }
            }
          }
          setIsProcessing(false);
        },
      );
    } catch (error) {
      setIsProcessing(false);
      console.error('拍照失败:', error);
      Alert.alert('错误', '拍照失败: ' + (error as Error).message);
    }
  };

  const handleShare = async () => {
    if (!previewImage) {
      Alert.alert('提示', '没有可分享的图片');
      return;
    }

    try {
      if (Platform.OS === 'android' && ImageShareModule && ImageShareModule.shareImage) {
        const imagePath = previewImage.replace('file://', '');
        await ImageShareModule.shareImage(imagePath);
      } else {
        const shareOptions: any = {
          title: '分享照片',
          url: previewImage,
        };
        await Share.share(shareOptions);
      }
    } catch (error) {
      Alert.alert('错误', '分享失败: ' + (error as Error).message);
    }
  };

  const handleTakeNewPhoto = () => {
    setPreviewImage(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" translucent={false} />

      {/* 顶部品牌区域 - 精简优雅 */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.appName}>水印相机</Text>
          <Text style={styles.tagline}>记录每一刻的真实</Text>
        </View>
      </View>

      {/* 主要内容区域 */}
      <View style={styles.content}>
        {previewImage ? (
          <View style={styles.previewWrapper}>
            <View style={styles.previewContainer}>
              <Image
                source={{ uri: previewImage }}
                style={styles.previewImage}
                resizeMode="contain"
              />
              <View style={styles.previewOverlay}>
                <View style={styles.successBadge}>
                  <View style={styles.successIcon}>
                    <Text style={styles.checkmark}>✓</Text>
                  </View>
                  <Text style={styles.successText}>已保存</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.heroSection}>
            <View style={styles.heroCard}>
              <View style={styles.illustrationContainer}>
                <View style={styles.illustrationCircle}>
                  <View style={styles.illustrationInner}>
                    <Text style={styles.illustrationIcon}>📷</Text>
                  </View>
                  <View style={styles.illustrationRing} />
                </View>
              </View>

              <View style={styles.heroTextContainer}>
                <Text style={styles.heroTitle}>开始创作</Text>
                <Text style={styles.heroDescription}>
                  拍摄照片，自动添加时间和位置水印
                </Text>
              </View>

              <View style={styles.featuresContainer}>
                <View style={styles.featureCard}>
                  <View style={styles.featureIconWrapper}>
                    <Text style={styles.featureIcon}>🕐</Text>
                  </View>
                  <Text style={styles.featureTitle}>自动时间</Text>
                  <Text style={styles.featureDesc}>精确记录</Text>
                </View>
                <View style={styles.featureCard}>
                  <View style={styles.featureIconWrapper}>
                    <Text style={styles.featureIcon}>📍</Text>
                  </View>
                  <Text style={styles.featureTitle}>自动位置</Text>
                  <Text style={styles.featureDesc}>详细地址</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* 底部操作区域 */}
      <View style={styles.footer}>
        {previewImage ? (
          <View style={styles.actionGroup}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.secondaryBtn]}
              onPress={handleTakeNewPhoto}
              activeOpacity={0.7}>
              <Text style={styles.secondaryBtnText}>重新拍摄</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.primaryBtn]}
              onPress={handleShare}
              activeOpacity={0.7}>
              <Text style={styles.primaryBtnText}>分享照片</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.captureSection}>
            <TouchableOpacity
              style={[styles.captureBtn, isProcessing && styles.captureBtnDisabled]}
              onPress={handleTakePhoto}
              disabled={isProcessing}
              activeOpacity={0.85}>
              <View style={styles.captureBtnContent}>
                {isProcessing ? (
                  <ActivityIndicator size="large" color="#6366f1" />
                ) : (
                  <Text style={styles.captureIcon}>📸</Text>
                )}
              </View>
            </TouchableOpacity>
            {isProcessing && (
              <View style={styles.processingContainer}>
                <Text style={styles.processingText}>正在处理...</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafbfc',
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 16 : 50,
    paddingBottom: 20,
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerContent: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '400',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  heroSection: {
    flex: 1,
    justifyContent: 'center',
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  illustrationContainer: {
    marginBottom: 32,
    position: 'relative',
  },
  illustrationCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  illustrationInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: '#e0e7ff',
    top: -10,
    left: -10,
  },
  illustrationIcon: {
    fontSize: 52,
  },
  heroTextContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  heroDescription: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  featuresContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    gap: 16,
  },
  featureCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fafbfc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  featureIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: '#9ca3af',
  },
  previewWrapper: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  successBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  successIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkmark: {
    color: '#6366f1',
    fontSize: 12,
    fontWeight: 'bold',
  },
  successText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'android' ? 24 : 40,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  primaryBtn: {
    backgroundColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
  },
  primaryBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  secondaryBtnText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  captureSection: {
    alignItems: 'center',
  },
  captureBtn: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  captureBtnContent: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureIcon: {
    fontSize: 36,
  },
  captureBtnDisabled: {
    backgroundColor: '#d1d5db',
    shadowOpacity: 0,
  },
  processingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  processingText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default CameraScreen;

