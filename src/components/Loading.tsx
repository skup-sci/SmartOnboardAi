import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { COLORS, FONT_SIZES, SPACING } from '../constants';

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = 'Loading...' }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(0.8)).current;
  useEffect(() => {
    const useNativeDriver = Platform.OS !== 'web';
    
    // Rotation animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver,
      })
    ).start();

    // Pulsing animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver,        }),
        Animated.timing(scaleValue, {
          toValue: 0.8,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver,
        }),
      ])
    ).start();
  }, []);

  // Interpolate rotation animation
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.loader,
          {
            transform: [{ rotate: spin }, { scale: scaleValue }],
          },
        ]}
      >
        <View style={styles.inner} />
      </Animated.View>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loader: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: COLORS.primary,
    borderTopColor: COLORS.secondary,
    borderRightColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  inner: {
    width: 15,
    height: 15,
    borderRadius: 10,
    backgroundColor: COLORS.accent,
  },
  message: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.darkGray,
    marginTop: SPACING.md,
  },
});

export default Loading;
