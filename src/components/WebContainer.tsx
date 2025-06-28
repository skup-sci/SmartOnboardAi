import React from 'react';
import { View, StyleSheet, Platform, Dimensions } from 'react-native';
import { SPACING } from '../constants';
import { getWebMaxWidth, getWebPadding } from '../utils/responsive';

interface WebContainerProps {
  children: React.ReactNode;
  maxWidth?: number | string;
  screenType?: 'content' | 'full' | 'narrow';
  style?: any;
}

const WebContainer: React.FC<WebContainerProps> = ({ 
  children, 
  maxWidth, 
  screenType = 'content',
  style 
}) => {
  const { width } = Dimensions.get('window');
  const responsiveMaxWidth = maxWidth || getWebMaxWidth(screenType);
  const responsivePadding = getWebPadding();
  
  if (Platform.OS !== 'web') {
    return <View style={style}>{children}</View>;
  }  const containerStyle: any = {
    maxWidth: responsiveMaxWidth,
    width: typeof responsiveMaxWidth === 'number' && width > responsiveMaxWidth 
      ? responsiveMaxWidth 
      : '100%',
    paddingHorizontal: responsivePadding,
  };

  return (
    <View style={[styles.webContainer, style]}>
      <View style={[styles.contentContainer, containerStyle]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    alignItems: 'center',
    width: '100%',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    paddingHorizontal: Platform.OS === 'web' ? SPACING.lg : 0,
  },
});

export default WebContainer;
