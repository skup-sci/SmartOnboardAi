import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AnalyticsService } from '../services/analyticsService';
import { AnalyticsData, UserSource, UserInteraction } from '../types';
import WebContainer from '../components/WebContainer';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants';
import Button from '../components/Button';
import { Animated, Dimensions } from 'react-native';
import { useAppContext } from '../hooks/useAppContext';

const AnalyticsScreen = () => {
  const navigation = useNavigation();
  const { userEngagement } = useAppContext();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'engagement' | 'interactions'>('users');
  
  // Animation values
  const headerAnim = new Animated.Value(0);
  const chartsAnim = new Animated.Value(0);
  
  const analyticsService = new AnalyticsService();
  
  useEffect(() => {
    loadAnalyticsData();
    
    // Run entry animations
    Animated.sequence([
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(chartsAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const data = await analyticsService.getAnalyticsData();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetAnalytics = async () => {
    await analyticsService.resetAnalytics();
    loadAnalyticsData();
  };
  
  // Get the highest count to normalize charts
  const getMaxUserCount = () => {
    if (!analyticsData) return 1;
    
    return Math.max(
      ...Object.values(analyticsData.sourceCounts),
      1 // Ensure we don't divide by zero
    );
  };
  
  const getMaxEngagement = (type: 'views' | 'clicks' | 'timeSpent') => {
    if (!analyticsData) return 1;
    
    const values = Object.values(analyticsData.engagementBySource).map(
      (data) => data[type]
    );
    
    return Math.max(...values, 1); // Ensure we don't divide by zero
  };
  
  // Format source names for display
  const formatSourceName = (source: string) => {
    return source.charAt(0).toUpperCase() + source.slice(1);
  };
  
  // Get color for a source
  const getSourceColor = (source: UserSource) => {
    return COLORS.sourceColors[source] || COLORS.gray;
  };
  
  // Get interaction type color
  const getInteractionColor = (type: UserInteraction) => {
    const colors = {
      view: '#4CAF50',    // Green
      like: '#E91E63',    // Pink
      share: '#2196F3',   // Blue
      save: '#FF9800',    // Orange
      comment: '#9C27B0'  // Purple
    };
    
    return colors[type] || COLORS.gray;
  };
  
  // Get interaction icon
  const getInteractionIcon = (type: UserInteraction) => {
    const icons = {
      view: '👁️',
      like: '❤️',
      share: '📤',
      save: '🔖',
      comment: '💬'
    };
    
    return icons[type] || '⚪';
  };
  
  // Calculate screen width for circular gauge
  const screenWidth = Dimensions.get('window').width;
  const gaugeSize = screenWidth * 0.6;
  return (
    <WebContainer style={styles.container}>
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Source Analytics</Text>
        <Text style={styles.headerSubtitle}>
          Understand user behavior from different sources
        </Text>
      </Animated.View>
      
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'users' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('users')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'users' && styles.activeTabText,
            ]}
          >
            Sources
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'engagement' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('engagement')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'engagement' && styles.activeTabText,
            ]}
          >
            Engagement
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'interactions' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('interactions')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'interactions' && styles.activeTabText,
            ]}
          >
            Score
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {isLoading && !analyticsData ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading analytics data...</Text>
          </View>
        ) : (
          <Animated.View
            style={[
              {
                opacity: chartsAnim,
                transform: [
                  {
                    translateY: chartsAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {activeTab === 'users' && analyticsData && (
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>User Distribution by Source</Text>
                
                {Object.entries(analyticsData.sourceCounts).map(([source, count]) => (
                  <View key={source} style={styles.chartItemContainer}>
                    <Text style={styles.chartLabel}>{formatSourceName(source)}</Text>
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.bar,
                          {
                            width: `${(count / getMaxUserCount()) * 100}%`,
                            backgroundColor: getSourceColor(source as UserSource),
                          },
                        ]}
                      />
                      <Text style={styles.barValue}>{count}</Text>
                    </View>
                  </View>
                ))}
                
                <View style={styles.summaryContainer}>
                  <Text style={styles.summaryTitle}>Total Users:</Text>
                  <Text style={styles.summaryValue}>
                    {Object.values(analyticsData.sourceCounts).reduce(
                      (sum, count) => sum + count,
                      0
                    )}
                  </Text>
                </View>
              </View>
            )}
            
            {activeTab === 'engagement' && analyticsData && (
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Content Views by Source</Text>
                
                {Object.entries(analyticsData.engagementBySource).map(([source, data]) => (
                  <View key={source} style={styles.chartItemContainer}>
                    <Text style={styles.chartLabel}>{formatSourceName(source)}</Text>
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.bar,
                          {
                            width: `${(data.views / getMaxEngagement('views')) * 100}%`,
                            backgroundColor: getSourceColor(source as UserSource),
                          },
                        ]}
                      />
                      <Text style={styles.barValue}>{data.views}</Text>
                    </View>
                  </View>
                ))}
                
                <Text style={[styles.chartTitle, { marginTop: SPACING.xl }]}>
                  Content Clicks by Source
                </Text>
                
                {Object.entries(analyticsData.engagementBySource).map(([source, data]) => (
                  <View key={source} style={styles.chartItemContainer}>
                    <Text style={styles.chartLabel}>{formatSourceName(source)}</Text>
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.bar,
                          {
                            width: `${(data.clicks / getMaxEngagement('clicks')) * 100}%`,
                            backgroundColor: getSourceColor(source as UserSource),
                          },
                        ]}
                      />
                      <Text style={styles.barValue}>{data.clicks}</Text>
                    </View>
                  </View>
                ))}
                
                <Text style={[styles.chartTitle, { marginTop: SPACING.xl }]}>
                  Average Time Spent (seconds)
                </Text>
                
                {Object.entries(analyticsData.engagementBySource).map(([source, data]) => {
                  const avgTimeSpent = data.views > 0
                    ? Math.round(data.timeSpent / data.views)
                    : 0;
                    
                  return (
                    <View key={source} style={styles.chartItemContainer}>
                      <Text style={styles.chartLabel}>{formatSourceName(source)}</Text>
                      <View style={styles.barContainer}>
                        <View
                          style={[
                            styles.bar,
                            {
                              width: `${(avgTimeSpent / 60) * 100}%`, // Normalize to 60 seconds
                              backgroundColor: getSourceColor(source as UserSource),
                            },
                          ]}
                        />
                        <Text style={styles.barValue}>{avgTimeSpent}s</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
            
            {activeTab === 'interactions' && (
              <View>
                {/* Overall Engagement Score */}
                <View style={styles.chartContainer}>
                  <Text style={styles.chartTitle}>Overall Engagement Score</Text>
                  
                  <View style={styles.gaugeContainer}>
                    <View style={[
                      styles.gauge, 
                      { width: gaugeSize, height: gaugeSize/2 }
                    ]}>
                      <View style={styles.gaugeBackground} />
                      <View style={[
                        styles.gaugeFill,
                        { width: `${userEngagement.overall}%` }
                      ]} />
                      <View style={styles.gaugeValueContainer}>
                        <Text style={styles.gaugeValue}>{userEngagement.overall}</Text>
                        <Text style={styles.gaugeLabel}>Score</Text>
                      </View>
                    </View>
                  </View>
                  
                  <Text style={[styles.chartTitle, { marginTop: SPACING.xl }]}>
                    Engagement Score by Source
                  </Text>
                  
                  {Object.entries(userEngagement.bySource).map(([source, score]) => (
                    <View key={source} style={styles.chartItemContainer}>
                      <Text style={styles.chartLabel}>{formatSourceName(source)}</Text>
                      <View style={styles.barContainer}>
                        <View
                          style={[
                            styles.bar,
                            {
                              width: `${score}%`,
                              backgroundColor: getSourceColor(source as UserSource),
                            },
                          ]}
                        />
                        <Text style={styles.barValue}>{score}</Text>
                      </View>
                    </View>
                  ))}
                </View>
                
                {/* Interaction Types */}
                <View style={styles.chartContainer}>
                  <Text style={styles.chartTitle}>Interaction Distribution</Text>
                  
                  <View style={styles.interactionTypesContainer}>
                    {['view', 'like', 'share', 'save', 'comment'].map((type) => (
                      <View key={type} style={styles.interactionTypeItem}>
                        <View style={[
                          styles.interactionIcon,
                          { backgroundColor: getInteractionColor(type as UserInteraction) }
                        ]}>
                          <Text style={styles.interactionIconText}>
                            {getInteractionIcon(type as UserInteraction)}
                          </Text>
                        </View>
                        <Text style={styles.interactionTypeLabel}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}s
                        </Text>
                        {/* In a real app, we would show actual counts here */}
                        <Text style={styles.interactionTypeCount}>
                          {Math.floor(Math.random() * 50) + 1}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            )}
            
            <Button
              title="Reset Analytics Data"
              variant="outline"
              onPress={resetAnalytics}
              style={styles.resetButton}
            />
          </Animated.View>        )}
      </ScrollView>
    </WebContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: SPACING.xs,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: SPACING.xs,
    marginHorizontal: SPACING.lg,
    marginTop: -SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.sm,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.white,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  loadingText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray,
  },
  chartContainer: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  chartTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: SPACING.md,
  },
  chartItemContainer: {
    marginBottom: SPACING.md,
  },
  chartLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.darkGray,
    marginBottom: SPACING.xs,
  },
  barContainer: {
    height: 24,
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  bar: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    minWidth: 30,
  },
  barValue: {
    position: 'absolute',
    right: SPACING.sm,
    top: 0,
    lineHeight: 24,
    color: COLORS.darkGray,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    paddingTop: SPACING.md,
    marginTop: SPACING.md,
  },
  summaryTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  summaryValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  resetButton: {
    marginVertical: SPACING.lg,
  },
  // New styles for engagement score visualization
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.lg,
  },
  gauge: {
    position: 'relative',
    overflow: 'hidden',
    borderBottomLeftRadius: 300,
    borderBottomRightRadius: 300,
  },
  gaugeBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.lightGray,
    borderBottomLeftRadius: 300,
    borderBottomRightRadius: 300,
  },
  gaugeFill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 300,
    borderBottomRightRadius: 0,
    left: 0,
  },
  gaugeValueContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  gaugeValue: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.darkGray,
  },
  gaugeLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray,
  },
  interactionTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  interactionTypeItem: {
    width: '48%',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  interactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  interactionIconText: {
    fontSize: 20,
  },
  interactionTypeLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.darkGray,
    marginTop: SPACING.xs,
  },
  interactionTypeCount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
});

export default AnalyticsScreen;
