import { Platform, Dimensions } from 'react-native';

export const getResponsiveValue = (mobile: number, tablet: number, desktop: number) => {
  if (Platform.OS !== 'web') return mobile;
  
  const { width } = Dimensions.get('window');
  if (width >= 1200) return desktop;
  if (width >= 768) return tablet;
  return mobile;
};

export const getResponsiveLayout = () => {
  if (Platform.OS !== 'web') return { columns: 1, gap: 16 };
  
  const { width } = Dimensions.get('window');
  if (width >= 1200) return { columns: 3, gap: 24 }; // Desktop: 3 columns
  if (width >= 768) return { columns: 2, gap: 20 };  // Tablet: 2 columns
  return { columns: 1, gap: 16 }; // Mobile: 1 column
};

export const getWebMaxWidth = (screenType: 'content' | 'full' | 'narrow' = 'content') => {
  if (Platform.OS !== 'web') return '100%';
  
  switch (screenType) {
    case 'narrow': return 600;
    case 'content': return 1200;
    case 'full': return '100%';
    default: return 1200;
  }
};

export const getWebPadding = () => {
  if (Platform.OS !== 'web') return 0;
  
  const { width } = Dimensions.get('window');
  if (width >= 1200) return 40; // Desktop padding
  if (width >= 768) return 24;  // Tablet padding
  return 16; // Mobile padding
};
