import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Share, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ContentItem, UserSource, UserInteraction } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import WebContainer from '../components/WebContainer';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MOCK_CONTENT } from '../constants';
import Button from '../components/Button';
import { generateDeepLink } from '../utils/sourceDetection';
import { Animated } from 'react-native';
import { GeminiService } from '../services/geminiService';
import { UserService } from '../services/userService';

type ContentDetailRouteProp = RouteProp<RootStackParamList, 'ContentDetail'>;
type ContentDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ContentDetailScreen = () => {
  const route = useRoute<ContentDetailRouteProp>();
  const navigation = useNavigation<ContentDetailNavigationProp>();
  const { contentId } = route.params;
  const { source, trackContentView, user } = useAppContext();
  
  const [content, setContent] = useState<ContentItem | null>(null);
  const [scrollY] = useState(new Animated.Value(0));
  const [personalizedSummary, setPersonalizedSummary] = useState<string>('');
  const [relatedContent, setRelatedContent] = useState<ContentItem[]>([]);
  const [explorationPath, setExplorationPath] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewStartTime] = useState<number>(Date.now());
  const [interactionStats, setInteractionStats] = useState<{
    likes: number;
    shares: number;
    saves: number;
  }>({ likes: 0, shares: 0, saves: 0 });
  const [userInteractions, setUserInteractions] = useState<Set<UserInteraction>>(new Set());
  
  // Service instances
  const geminiService = useRef(new GeminiService());
  const userService = useRef(new UserService());
  
  useEffect(() => {
    // Find the content by ID
    const foundContent = MOCK_CONTENT.find(item => item.id === contentId);
    
    if (foundContent) {
      setContent(foundContent);
      // Track that user viewed this content
      trackContentView(contentId);
      // Track more detailed view interaction
      trackInteraction('view');
      
      // Load personalized features
      loadPersonalizedFeatures(foundContent);
    }
    
    // Track view duration when component unmounts
    return () => {
      if (foundContent) {
        const viewDurationMs = Date.now() - viewStartTime;
        userService.current.trackUserInteraction(contentId, 'view', viewDurationMs);
      }
    };
  }, [contentId]);
  
  const loadPersonalizedFeatures = async (contentItem: ContentItem) => {
    setIsLoading(true);
    try {
      // Generate personalized content in parallel
      const [summaryPromise, relatedPromise, pathPromise] = await Promise.all([
        // Generate personalized summary based on user source
        geminiService.current.generatePersonalizedSummary(contentItem, source),
        
        // Get personalized suggestions based on user and content
        user ? geminiService.current.generatePersonalizedSuggestions(
          user,
          user.preferences?.viewedContent?.map(id => 
            MOCK_CONTENT.find(c => c.id === id)
          ).filter(Boolean) as ContentItem[] || [],
          MOCK_CONTENT.filter(c => c.id !== contentId)
        ) : Promise.resolve([]),
        
        // Generate exploration path
        user ? geminiService.current.generateExplorationPath(
          user,
          MOCK_CONTENT.filter(c => c.id !== contentId)
        ) : Promise.resolve([])
      ]);
      
      setPersonalizedSummary(await summaryPromise);
      setRelatedContent((await relatedPromise).slice(0, 3));
      setExplorationPath(await pathPromise);
      
      // Simulate loading interaction stats from backend
      setInteractionStats({
        likes: Math.floor(Math.random() * 100),
        shares: Math.floor(Math.random() * 50),
        saves: Math.floor(Math.random() * 30)
      });
    } catch (error) {
      console.error('Error loading personalized features:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const trackInteraction = async (type: UserInteraction) => {
    if (!content) return;
    
    try {
      await userService.current.trackUserInteraction(contentId, type);
      
      // Update local state to reflect user's interactions
      setUserInteractions(prev => new Set(prev).add(type));
    } catch (error) {
      console.error(`Error tracking ${type}:`, error);
    }
  };
  
  const handleSharePress = async () => {
    if (!content) return;
    
    try {
      const deepLink = generateDeepLink('ContentDetail', { contentId }, source);
      
      await Share.share({
        message: `Check out "${content.title}" on SmartOnboardAI: ${deepLink}`,
        url: deepLink,
      });
      
      trackInteraction('share');
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  const handleLike = () => trackInteraction('like');
  
  const handleSave = () => trackInteraction('save');
  
  const handleContentPress = (id: string) => {
    navigation.push('ContentDetail', { contentId: id });
  };
  
  // Animation calculations for header
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [300, 60],
    extrapolate: 'clamp',
  });
  
  const headerTitleOpacity = scrollY.interpolate({
    inputRange: [50, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  const imageOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.3],
    extrapolate: 'clamp',
  });
  if (!content) {
    return (
      <WebContainer style={styles.container}>
        <Text>Content not found</Text>
      </WebContainer>
    );
  }

  return (
    <WebContainer style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[styles.header, { height: headerHeight }]}>
        <Animated.Image
          source={{ uri: content.imageUrl || 'https://via.placeholder.com/400x200' }}
          style={[styles.headerImage, { opacity: imageOpacity }]}
          resizeMode="cover"
        />
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Animated.Text style={[styles.headerTitle, { opacity: headerTitleOpacity }]}>
          {content.title}
        </Animated.Text>
      </Animated.View>
      
      {/* Content */}
      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.contentContainer}>
          <Text style={styles.title}>{content.title}</Text>
          
          <View style={styles.tagsContainer}>
            {content.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
          
          {/* User Interaction Bar */}
          <View style={styles.interactionBar}>
            <TouchableOpacity
              style={[styles.interactionButton, userInteractions.has('like') ? styles.interactionButtonActive : {}]}
              onPress={handleLike}
            >
              <Text style={styles.interactionIcon}>❤️</Text>
              <Text style={styles.interactionCount}>{interactionStats.likes + (userInteractions.has('like') ? 1 : 0)}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.interactionButton, userInteractions.has('save') ? styles.interactionButtonActive : {}]}
              onPress={handleSave}
            >
              <Text style={styles.interactionIcon}>🔖</Text>
              <Text style={styles.interactionCount}>{interactionStats.saves + (userInteractions.has('save') ? 1 : 0)}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.interactionButton, userInteractions.has('share') ? styles.interactionButtonActive : {}]}
              onPress={handleSharePress}
            >
              <Text style={styles.interactionIcon}>📤</Text>
              <Text style={styles.interactionCount}>{interactionStats.shares + (userInteractions.has('share') ? 1 : 0)}</Text>
            </TouchableOpacity>
          </View>
          
          {/* Personalized Summary */}
          <View style={styles.summaryContainer}>
            <Text style={styles.sectionTitle}>Personalized for {source} users:</Text>
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
            ) : (
              <Text style={styles.summary}>{personalizedSummary}</Text>
            )}
          </View>
          
          <View style={styles.sourceRelevanceContainer}>
            <Text style={styles.sourceRelevanceTitle}>
              Source Relevance:
            </Text>
            
            {Object.entries(content.sourceRelevance).sort(([, a], [, b]) => b - a).map(([src, value]) => (
              <View key={src} style={styles.relevanceItem}>
                <Text style={styles.relevanceSource}>{src}:</Text>
                <View style={styles.relevanceBarContainer}>
                  <View
                    style={[
                      styles.relevanceBar,
                      { width: `${value}%`, backgroundColor: COLORS.sourceColors[src as UserSource] || COLORS.primary },
                    ]}
                  />
                  <Text style={styles.relevanceValue}>{value}%</Text>
                </View>
              </View>
            ))}
          </View>
          
          <Text style={styles.description}>{content.description}</Text>
          
          {/* For demo purposes, adding some mock content */}
          <Text style={styles.paragraph}>
            The world of personalized content is evolving rapidly. As AI technology advances, we're seeing more sophisticated algorithms that can understand user preferences and behavior on a deeper level.
          </Text>
          
          <Text style={styles.paragraph}>
            One of the most interesting aspects of content personalization is understanding how different user sources impact engagement. For example, users coming from social media platforms like Instagram often have different expectations and behaviors compared to those coming through referrals or blog links.
          </Text>
          
          <Text style={styles.paragraph}>
            Our Source-Adaptive Experience platform leverages these differences to create truly personalized experiences that meet users where they are, showing them the most relevant content based on their entry point to the application.
          </Text>
          
          {/* Personalized Exploration Path */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Exploration Path</Text>
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
            ) : (
              <View style={styles.pathContainer}>
                {explorationPath.map((item, index) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.pathItem}
                    onPress={() => handleContentPress(item.id)}
                  >
                    <View style={styles.pathNumber}>
                      <Text style={styles.pathNumberText}>{index + 1}</Text>
                    </View>
                    <View style={styles.pathContent}>
                      <Text style={styles.pathTitle}>{item.title}</Text>
                      <View style={styles.miniTagsContainer}>
                        {item.tags.slice(0, 2).map((tag, tagIndex) => (
                          <Text key={tagIndex} style={styles.miniTag}>#{tag}</Text>
                        ))}
                      </View>
                    </View>
                    {index < explorationPath.length - 1 && (
                      <View style={styles.pathConnector} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          
          {/* Related Content */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} style={styles.loader} />
            ) : (
              <View style={styles.relatedContentContainer}>
                {relatedContent.map(item => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.relatedContentItem}
                    onPress={() => handleContentPress(item.id)}
                  >
                    <Image
                      source={{ uri: item.imageUrl || 'https://via.placeholder.com/100' }}
                      style={styles.relatedContentImage}
                      resizeMode="cover"
                    />
                    <Text style={styles.relatedContentTitle}>{item.title}</Text>
                    <Text style={styles.relevanceScore}>
                      {item.sourceRelevance[source] || 0}% match
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
          
          <Button
            title="Share This Content"
            onPress={handleSharePress}
            style={styles.shareButton}
          />        </View>
      </Animated.ScrollView>
    </WebContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    overflow: 'hidden',
  },
  headerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
  },
  headerTitle: {
    position: 'absolute',
    bottom: 10,
    left: 60,
    right: 60,
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 5,
    borderRadius: BORDER_RADIUS.sm,
  },
  scrollView: {
    flex: 1,
    marginTop: 300, // Same as initial header height
  },
  contentContainer: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray,
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  paragraph: {
    fontSize: FONT_SIZES.md,
    color: COLORS.darkGray,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.md,
  },
  tag: {
    backgroundColor: COLORS.lightGray,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  tagText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.darkGray,
  },
  sourceRelevanceContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
  },
  sourceRelevanceTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  relevanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  relevanceSource: {
    width: 80,
    fontSize: FONT_SIZES.sm,
    color: COLORS.darkGray,
    textTransform: 'capitalize',
  },
  relevanceBarContainer: {
    flex: 1,
    height: 16,
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.xs,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  relevanceBar: {
    height: '100%',
    position: 'absolute',
    left: 0,
  },
  relevanceValue: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.darkGray,
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'center',
  },
  shareButton: {
    marginVertical: SPACING.lg,
  },
  // New styles for advanced personalization features
  interactionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  interactionButton: {
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  interactionButtonActive: {
    backgroundColor: COLORS.lightPrimary,
  },
  interactionIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  interactionCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.darkGray,
  },
  summaryContainer: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  summary: {
    fontSize: FONT_SIZES.md,
    color: COLORS.darkGray,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  section: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: SPACING.md,
  },
  pathContainer: {
    marginVertical: SPACING.md,
  },
  pathItem: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  pathNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  pathNumberText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: FONT_SIZES.sm,
  },
  pathContent: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  pathConnector: {
    position: 'absolute',
    left: 14,
    top: 28,
    width: 2,
    height: 40,
    backgroundColor: COLORS.lightPrimary,
    zIndex: -1,
  },
  pathTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: 4,
  },
  miniTagsContainer: {
    flexDirection: 'row',
  },
  miniTag: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray,
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
    marginRight: SPACING.xs,
    overflow: 'hidden',
  },
  relatedContentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  relatedContentItem: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  relatedContentImage: {
    width: '100%',
    height: 100,
  },
  relatedContentTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    padding: SPACING.sm,
  },
  relevanceScore: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    backgroundColor: COLORS.primary,
    paddingVertical: 2,
    paddingHorizontal: SPACING.sm,
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: BORDER_RADIUS.xs,
  },
  loader: {
    marginVertical: SPACING.md,
  },
});

export default ContentDetailScreen;
