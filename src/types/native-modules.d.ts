import {NativeModules} from 'react-native';

interface WatermarkModuleInterface {
  addWatermark(imagePath: string, watermarkText: string): Promise<string>;
}

interface GeocoderModuleInterface {
  getAddressFromLocation(latitude: number, longitude: number): Promise<string>;
}

interface ImageShareModuleInterface {
  shareImage(imagePath: string): Promise<boolean>;
}

declare module 'react-native' {
  interface NativeModulesStatic {
    WatermarkModule: WatermarkModuleInterface;
    GeocoderModule: GeocoderModuleInterface;
    ImageShareModule: ImageShareModuleInterface;
  }
}
