import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, UserSource } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import HeaderBanner from '../components/HeaderBanner';
import Card from '../components/Card';
import SourceSelector from '../components/SourceSelector';
import WebContainer from '../components/WebContainer';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants';
import Button from '../components/Button';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user, source, content, welcomeMessage, setUserSource, trackContentView } = useAppContext();
  const handleContentPress = (contentId: string) => {
    trackContentView(contentId);
    navigation.getParent()?.navigate('ContentDetail', { contentId });
  };

  const handleSourceChange = (newSource: typeof source) => {
    setUserSource(newSource);
  };

  const handleAnalyticsPress = () => {
    navigation.getParent()?.navigate('Analytics');
  };
  return (
    <WebContainer style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <HeaderBanner message={welcomeMessage} source={source} />
        
        <View style={styles.content}>
          <SourceSelector selectedSource={source} onSourceChange={handleSourceChange} />
          
          <Text style={styles.sectionTitle}>Recommended For You</Text>
          
          {content.slice(0, 2).map((item) => (
            <Card
              key={item.id}
              item={item}
              userSource={source}
              onPress={() => handleContentPress(item.id)}
              showSourceRelevance={true}
            />
          ))}
          
          <TouchableOpacity
            style={styles.analyticsBanner}
            onPress={handleAnalyticsPress}
          >
            <Text style={styles.analyticsBannerText}>View Source Analytics Dashboard</Text>
          </TouchableOpacity>
          
          <Text style={styles.sectionTitle}>More Content</Text>
          
          {content.slice(2).map((item) => (
            <Card
              key={item.id}
              item={item}
              userSource={source}
              onPress={() => handleContentPress(item.id)}
            />
          ))}
            <Button
            title="Explore More"
            onPress={() => navigation.navigate('Main', { screen: 'Discover' })}
            style={styles.exploreButton}          />
        </View>
      </ScrollView>
    </WebContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
    marginTop: SPACING.lg,
  },
  analyticsBanner: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.lg,
    backgroundColor: COLORS.secondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  analyticsBannerText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  exploreButton: {
    marginHorizontal: SPACING.lg,
    marginVertical: SPACING.lg,
  },
});

export default HomeScreen;
