import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { ContentItem, UserSource } from '../types';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants';

interface CardProps {
  item: ContentItem;
  userSource?: UserSource;
  onPress?: () => void;
  showSourceRelevance?: boolean;
}

const Card: React.FC<CardProps> = ({
  item,
  userSource,
  onPress,
  showSourceRelevance = false,
}) => {
  const relevanceScore = userSource ? item.sourceRelevance[userSource] || 0 : 0;
  const placeholderImage = 'https://via.placeholder.com/400x200/EDEDED/888888?text=SmartOnboardAI';
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <Image
        source={{ uri: item.imageUrl || placeholderImage }}
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        
        <Text style={styles.description} numberOfLines={3}>
          {item.description}
        </Text>
        
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
        
        {showSourceRelevance && userSource && (
          <View style={styles.relevanceContainer}>
            <View style={[styles.relevanceBar, { width: `${relevanceScore}%` }]} />
            <Text style={styles.relevanceText}>
              {relevanceScore}% relevant for {userSource} users
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const { width } = Dimensions.get('window');

// Calculate responsive card width
const getCardWidth = () => {
  if (Platform.OS === 'web') {
    if (width > 1200) return 400; // Large desktop
    if (width > 768) return 350;  // Tablet/small desktop
    return width - SPACING.lg * 2; // Mobile
  }
  return width - SPACING.lg * 2; // Native mobile
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    width: getCardWidth(),
    alignSelf: 'center',
    ...(Platform.OS === 'web' && {
      marginHorizontal: 'auto',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }),
  },
  image: {
    height: 180,
    width: '100%',
  },
  contentContainer: {
    padding: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray,
    marginBottom: SPACING.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING.sm,
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
  relevanceContainer: {
    marginTop: SPACING.sm,
    height: 20,
    backgroundColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.xs,
    overflow: 'hidden',
    position: 'relative',
  },
  relevanceBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  relevanceText: {
    position: 'absolute',
    fontSize: FONT_SIZES.xs,
    color: COLORS.darkGray,
    width: '100%',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default Card;
