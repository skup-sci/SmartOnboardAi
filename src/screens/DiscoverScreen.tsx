import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ContentItem } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import Card from '../components/Card';
import ApiStatusBanner from '../components/ApiStatusBanner';
import WebContainer from '../components/WebContainer';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS, MOCK_CONTENT } from '../constants';
import { Animated, Easing } from 'react-native';

type DiscoverScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const DiscoverScreen = () => {
  const navigation = useNavigation<DiscoverScreenNavigationProp>();
  const { source, trackContentView } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>(MOCK_CONTENT);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  
  // Animation values
  const searchBarAnim = new Animated.Value(0);
  const listAnim = new Animated.Value(0);
  
  useEffect(() => {
    // Run animations when component mounts
    Animated.sequence([
      Animated.timing(searchBarAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(listAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  useEffect(() => {
    // Filter content based on search query and selected tag
    let filtered = [...MOCK_CONTENT];
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.title.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    if (selectedTag) {
      filtered = filtered.filter(item => item.tags.includes(selectedTag));
    }
    
    setFilteredContent(filtered);
  }, [searchQuery, selectedTag]);
  const handleContentPress = (contentId: string) => {
    trackContentView(contentId);
    // Navigate to the parent stack navigator, then to ContentDetail
    navigation.getParent()?.navigate('ContentDetail', { contentId });
  };
  
  // Extract all unique tags from content
  const allTags = Array.from(
    new Set(MOCK_CONTENT.flatMap(item => item.tags))
  ).sort();
    const handleTagPress = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag);
  };
  // We're now importing the ApiStatusBanner component from '../components/ApiStatusBanner'
  return (
    <WebContainer style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover Content</Text>
        <Text style={styles.headerSubtitle}>
          Find content tailored to your interests
        </Text>
      </View>
      
      <ApiStatusBanner />
      
      <Animated.View
        style={[
          styles.searchContainer,
          {
            opacity: searchBarAnim,
            transform: [
              {
                translateY: searchBarAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <TextInput
          style={styles.searchInput}
          placeholder="Search content..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={COLORS.gray}
        />
      </Animated.View>
      
      <View style={styles.tagsContainer}>
        <FlatList
          data={allTags}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Text
              style={[
                styles.tagItem,
                selectedTag === item && styles.selectedTagItem,
              ]}
              onPress={() => handleTagPress(item)}
            >
              #{item}
            </Text>          )}
          contentContainerStyle={styles.tagsList}
        />
      </View>
      
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: listAnim,
            transform: [
              {
                translateY: listAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },        ]}
      >
        <FlatList
          data={filteredContent}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card
              item={item}
              userSource={source}
              onPress={() => handleContentPress(item.id)}
            />
          )}
          contentContainerStyle={styles.contentList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No content found</Text>
            </View>
          }        />
      </Animated.View>
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
  searchContainer: {
    paddingHorizontal: SPACING.lg,
    marginTop: -SPACING.lg,
  },
  searchInput: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tagsContainer: {
    marginVertical: SPACING.md,
  },
  tagsList: {
    paddingHorizontal: SPACING.lg,
  },
  tagItem: {
    backgroundColor: COLORS.lightGray,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.circle,
    marginRight: SPACING.xs,
    fontSize: FONT_SIZES.sm,
    overflow: 'hidden',
  },
  selectedTagItem: {
    backgroundColor: COLORS.primary,
    color: COLORS.white,
  },
  contentContainer: {
    flex: 1,
  },
  contentList: {
    paddingVertical: SPACING.md,
  },  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.gray,
  },
});

export default DiscoverScreen;
