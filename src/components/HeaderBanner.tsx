import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { UserSource } from '../types';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants';

interface HeaderBannerProps {
  message: string;
  source?: UserSource;
}

const HeaderBanner: React.FC<HeaderBannerProps> = ({ message, source = 'unknown' }) => {
  const animatedOpacity = new Animated.Value(0);
  const animatedTranslateY = new Animated.Value(-20);
  
  useEffect(() => {
    // Reset animation values when message changes
    animatedOpacity.setValue(0);
    animatedTranslateY.setValue(-20);
    
    // Run animations
    Animated.parallel([
      Animated.timing(animatedOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
        easing: Easing.out(Easing.cubic),
      }),
      Animated.timing(animatedTranslateY, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
        easing: Easing.out(Easing.back(1.5)),
      }),
    ]).start();
  }, [message, source]);
  
  // Get header color based on source
  const getBannerColor = () => {
    switch (source) {
      case 'instagram':
        return COLORS.sourceColors.instagram;
      case 'referral':
        return COLORS.sourceColors.referral;
      case 'blog':
        return COLORS.sourceColors.blog;
      case 'direct':
        return COLORS.sourceColors.direct;
      case 'unknown':
      default:
        return COLORS.primary;
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: getBannerColor() }]}>
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: animatedOpacity,
            transform: [{ translateY: animatedTranslateY }],
          },
        ]}
      >
        <Text style={styles.message}>{message}</Text>
        {source !== 'unknown' && (
          <View style={styles.sourceTag}>
            <Text style={styles.sourceText}>{source}</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    width: '100%',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  sourceTag: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.circle,
  },
  sourceText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.darkGray,
    textTransform: 'capitalize',
  },
});

export default HeaderBanner;
