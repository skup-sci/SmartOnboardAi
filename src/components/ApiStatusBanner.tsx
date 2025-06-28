// ApiStatusBanner.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants';
import { GeminiService } from '../services/geminiService';

const ApiStatusBanner = () => {
  const [quotaIssue, setQuotaIssue] = useState(false);
  const [authIssue, setAuthIssue] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);
  const bannerAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    // Check for API issues using the static methods
    const checkStatus = () => {
      const hasQuotaIssue = GeminiService.isLikelyHavingQuotaIssues();
      const hasAuthIssue = GeminiService.hasRecentAuthenticationError();
      const authMessage = GeminiService.getAuthenticationErrorMessage();
      
      const shouldShowBanner = hasQuotaIssue || hasAuthIssue;
      const currentlyShowing = quotaIssue || authIssue;
      
      if (shouldShowBanner && !currentlyShowing) {
        setQuotaIssue(hasQuotaIssue);
        setAuthIssue(hasAuthIssue);
        setAuthErrorMessage(authMessage);
        
        // Show the banner with animation
        Animated.timing(bannerAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else if (!shouldShowBanner && currentlyShowing) {
        // Hide the banner
        Animated.timing(bannerAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setQuotaIssue(false);
          setAuthIssue(false);
          setAuthErrorMessage(null);
        });
      } else if (shouldShowBanner) {
        // Update the state even if banner is already showing
        setQuotaIssue(hasQuotaIssue);
        setAuthIssue(hasAuthIssue);
        setAuthErrorMessage(authMessage);
      }
    };
    
    // Check status initially with a delay to let initialization complete
    const initialCheck = setTimeout(checkStatus, 5000);
    
    // And check again every 30 seconds
    const interval = setInterval(checkStatus, 30000);
      return () => {
      clearTimeout(initialCheck);
      clearInterval(interval);
    };
  }, [quotaIssue, authIssue]);
  
  // Don't render anything if no issues
  if (!quotaIssue && !authIssue) return null;

  // Determine banner content based on error type
  let bannerText = '';
  let bannerStyle = styles.quotaBanner;

  if (authIssue) {
    bannerText = 'API Authentication Failed: Please check your Gemini API key in Settings. Visit https://makersuite.google.com/app/apikey to get your key.';
    bannerStyle = styles.authBanner;
  } else if (quotaIssue) {
    bannerText = 'AI personalization limited due to quota constraints. Using fallback recommendations.';
    bannerStyle = styles.quotaBanner;
  }
  
  return (
    <Animated.View 
      style={[
        styles.apiBanner,
        bannerStyle,
        {
          opacity: bannerAnim,
          transform: [{ translateY: bannerAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [-30, 0],
          })}]
        }
      ]}
    >      <Text style={[
        styles.apiBannerText,
        authIssue ? styles.authBannerText : styles.quotaBannerText
      ]}>
        {bannerText}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  apiBanner: {
    borderWidth: 1,
    padding: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  quotaBanner: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEEBA',
  },
  authBanner: {
    backgroundColor: '#F8D7DA',
    borderColor: '#F5C6CB',
  },  apiBannerText: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
    flexShrink: 1,
  },
  quotaBannerText: {
    color: '#856404',
  },
  authBannerText: {
    color: '#721c24',
  },
});

export default ApiStatusBanner;
