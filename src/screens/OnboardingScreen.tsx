import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, TouchableOpacity, Animated, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList, UserSource } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import WebContainer from '../components/WebContainer';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants';
import Button from '../components/Button';

type OnboardingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type OnboardingScreenRouteProp = RouteProp<RootStackParamList, 'Onboarding'>;

interface OnboardingSlide {
  id: string;
  title: string;
  description: string;
  sourceSpecific?: UserSource;
}

const OnboardingScreen = () => {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const route = useRoute<OnboardingScreenRouteProp>();
  const { source: routeSource } = route.params || {};
  const { source, setUserSource } = useAppContext();
  
  // Use source from route params if provided, otherwise use context source
  const currentSource = routeSource || source;
  
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const translateYAnim = new Animated.Value(30);

  const onboardingSlides: OnboardingSlide[] = [
    {
      id: '1',
      title: `Welcome to SmartOnboardAI!`,
      description: `Experience personalized content that adapts to your source. We've detected you came from ${currentSource === 'unknown' ? 'direct access' : currentSource}.`,
    },
    {
      id: '2',
      title: 'Intelligent Source Detection',
      description: 'Our AI automatically detects how you found us and personalizes your experience accordingly.',
    },
    {
      id: '3',
      title: 'Personalized Content',
      description: 'Get content recommendations tailored specifically to your interests and source platform.',
    },
    {
      id: '4',
      title: 'Analytics Dashboard',
      description: 'Track your engagement and see insights about your learning journey.',
    },
  ];
  useEffect(() => {
    const useNativeDriver = Platform.OS !== 'web';
    
    // Animate in on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver,
      }),
    ]).start();
  }, []);

  const handleNext = () => {
    if (activeSlideIndex < onboardingSlides.length - 1) {
      const nextIndex = activeSlideIndex + 1;
      setActiveSlideIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    // Set user source if provided from route
    if (routeSource) {
      setUserSource(routeSource);
    }
    navigation.navigate('Main' as never);
  };

  const handleSourceSelect = (selectedSource: UserSource) => {
    setUserSource(selectedSource);
  };

  const getSourceDisplay = (source: UserSource) => {
    switch (source) {
      case 'instagram': return 'Instagram';
      case 'referral': return 'Referral';
      case 'blog': return 'Blog';
      case 'direct': return 'Direct';
      default: return 'Unknown';
    }
  };

  const { width } = Dimensions.get('window');

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={[styles.slideContainer, { width }]}>
      <View style={styles.slideContent}>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideDescription}>{item.description}</Text>
        
        {activeSlideIndex === 0 && (
          <View style={styles.sourceIndicator}>
            <Text style={styles.sourceIndicatorText}>
              Detected Source: {getSourceDisplay(currentSource)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderPagination = () => (
    <View style={styles.paginationContainer}>
      {onboardingSlides.map((_, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.paginationDot,
            index === activeSlideIndex && styles.activePaginationDot,
          ]}
          onPress={() => {
            setActiveSlideIndex(index);
            flatListRef.current?.scrollToIndex({ index, animated: true });
          }}
        />
      ))}
    </View>
  );

  return (
    <WebContainer style={styles.container}>
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: translateYAnim }],
          },
        ]}
      >
        <FlatList
          ref={flatListRef}
          data={onboardingSlides}
          renderItem={renderSlide}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / width);
            setActiveSlideIndex(index);
          }}
        />
        
        {renderPagination()}
        
        <View style={styles.buttonsContainer}>
          <Button
            title="Skip"
            onPress={handleSkip}
            variant="outline"
            style={styles.skipButton}
          />
          <Button
            title={activeSlideIndex === onboardingSlides.length - 1 ? 'Get Started' : 'Next'}
            onPress={handleNext}
            style={styles.nextButton}
          />
        </View>
      </Animated.View>
    </WebContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
  },
  slideContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  slideTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  slideDescription: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 28,
  },
  sourceIndicator: {
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.md,
  },
  sourceIndicatorText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    fontWeight: 'bold',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: SPACING.lg,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 5,
  },
  activePaginationDot: {
    backgroundColor: COLORS.primary,
    width: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  skipButton: {
    width: '45%',
  },
  nextButton: {
    width: '45%',
  },
});

export default OnboardingScreen;
