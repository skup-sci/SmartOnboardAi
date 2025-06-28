import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAppContext } from '../hooks/useAppContext';
import WebContainer from '../components/WebContainer';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants';
import Button from '../components/Button';
import { UserService } from '../services/userService';

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, source } = useAppContext();
  
  const [interests, setInterests] = useState<string[]>([]);
  const [viewedContent, setViewedContent] = useState<string[]>([]);
  const userService = new UserService();
  
  useEffect(() => {
    loadUserData();
  }, [user]);
  
  const loadUserData = async () => {
    // Load user data from service
    const userData = await userService.getUserData();
    if (userData && userData.preferences) {
      setInterests(userData.preferences.interests || []);
      setViewedContent(userData.preferences.viewedContent || []);
    }
  };
  
  // Convert the source to a displayable title
  const getSourceDisplay = (src: string) => {
    return src.charAt(0).toUpperCase() + src.slice(1);
  };
    return (
    <WebContainer style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Profile</Text>
        <View style={[styles.sourceTag, { backgroundColor: COLORS.sourceColors[source] }]}>
          <Text style={styles.sourceTagText}>{getSourceDisplay(source)} User</Text>
        </View>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Interests</Text>
          <View style={styles.interestContainer}>
            {interests.length > 0 ? (
              interests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>
                No interests detected yet. View more content to help us understand your preferences.
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content History</Text>
          <Text style={styles.statsText}>
            You've viewed {viewedContent.length} items
          </Text>
            {viewedContent.length > 0 && (
            <Button
              title="View Analytics"
              onPress={() => navigation.getParent()?.navigate('Analytics')}
              style={styles.analyticsButton}
            />
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personalization Options</Text>
          
          <TouchableOpacity style={styles.optionItem}>
            <Text style={styles.optionTitle}>Content Preferences</Text>
            <Text style={styles.optionDescription}>
              Manage what types of content you want to see
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.optionItem}>
            <Text style={styles.optionTitle}>Theme Settings</Text>
            <Text style={styles.optionDescription}>
              Choose light or dark mode for the app
            </Text>
          </TouchableOpacity>
            <TouchableOpacity 
            style={styles.optionItem}
            onPress={() => navigation.getParent()?.navigate('Settings')}
          >
            <Text style={styles.optionTitle}>App Settings</Text>
            <Text style={styles.optionDescription}>
              Configure app behavior and notifications
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About SmartOnboardAI</Text>
          <Text style={styles.aboutText}>
            SmartOnboardAI personalizes content based on where users come from,
            creating unique experiences for different traffic sources. This
            demo app showcases intelligent source detection, content adaptation,
            and how it can improve user engagement.
          </Text>        </View>
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
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.sm,
  },
  sourceTag: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.circle,
  },
  sourceTagText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: SPACING.md,
  },
  interestContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  interestTag: {
    backgroundColor: COLORS.secondary,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    marginRight: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  interestText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.white,
  },
  statsText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray,
    marginBottom: SPACING.md,
  },
  analyticsButton: {
    marginTop: SPACING.sm,
  },
  optionItem: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  optionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.darkGray,
    marginBottom: SPACING.xs,
  },
  optionDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
  },
  aboutText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.darkGray,
    lineHeight: 22,
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray,
    fontStyle: 'italic',
  },
});

export default ProfileScreen;
