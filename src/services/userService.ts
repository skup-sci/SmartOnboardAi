import WebCompatibleStorage from './webCompatibleStorage';
import { User, UserSource, UserPreferences, ContentItem, UserInteraction, InteractionRecord } from '../types';
import { GeminiService } from './geminiService';
import { MOCK_CONTENT } from '../constants';

// For demo, we'll use this user ID
const USER_ID = 'demo-user';
const USER_DATA_KEY = 'user-data';
const USER_PREFS_KEY = 'user-preferences';
const USER_INTERACTIONS_KEY = 'user-interactions';

export class UserService {
  private geminiService = new GeminiService();
  
  /**
   * Initialize a user with the given source
   */
  async initUser(source: UserSource): Promise<User> {
    try {
      // Check if we already have stored user data
      const existingUserData = await this.getUserData();
      
      if (existingUserData) {
        // Update source if it's different
        if (existingUserData.source !== source) {
          existingUserData.source = source;
          await this.saveUserData(existingUserData);
        }
        return existingUserData;
      }
      
      // Create new user
      const newUser: User = {
        id: USER_ID,
        source: source,
        preferences: {
          theme: 'light',
          interests: [],
          viewedContent: []
        }
      };
      
      await this.saveUserData(newUser);
      return newUser;
    } catch (error) {      console.error('Error initializing user:', error);
      
      // Return a default user as fallback
      return {
        id: USER_ID,
        source: source || 'unknown',
        preferences: {
          theme: 'light',
          interests: [],
          viewedContent: []
        }
      };
    }
  }

  /**
   * Get stored user data
   */
  async getUserData(): Promise<User | null> {
    try {
      const userData = await WebCompatibleStorage.getItem(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }
  
  /**
   * Save user data
   */
  async saveUserData(user: User): Promise<void> {
    try {
      await WebCompatibleStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }
  
  /**
   * Update user preferences
   */
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<void> {
    try {
      const user = await this.getUserData();
      if (!user) return;
      
      user.preferences = {
        ...user.preferences,
        ...preferences
      };
      
      await this.saveUserData(user);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  }
  
  /**
   * Track content viewed by user
   */
  async trackContentViewed(contentId: string): Promise<void> {
    try {
      const user = await this.getUserData();
      if (!user || !user.preferences) return;
      
      // Initialize or update viewed content array
      const viewedContent = user.preferences.viewedContent || [];
      
      // Add content if not already viewed
      if (!viewedContent.includes(contentId)) {
        user.preferences.viewedContent = [...viewedContent, contentId];
        await this.saveUserData(user);
      }
        // If we have enough viewed content, update interests
      if (user.preferences?.viewedContent && user.preferences.viewedContent.length % 3 === 0) {
        await this.updateUserInterests();
      }
    } catch (error) {
      console.error('Error tracking content view:', error);
    }
  }
  
  /**
   * Update user interests based on viewed content
   */
  private async updateUserInterests(): Promise<void> {
    try {
      const user = await this.getUserData();
      if (!user || !user.preferences || !user.preferences.viewedContent) return;
      
      // Get content items that user has viewed
      const viewedContentIds = user.preferences.viewedContent;
      const viewedContent = MOCK_CONTENT.filter(item => 
        viewedContentIds.includes(item.id)
      );
      
      // Use Gemini to predict interests
      if (viewedContent.length > 0) {
        const predictedInterests = await this.geminiService.predictUserInterests(viewedContent);
        
        if (predictedInterests.length > 0) {
          user.preferences.interests = predictedInterests;
          await this.saveUserData(user);
        }
      }
    } catch (error) {
      console.error('Error updating user interests:', error);
    }
  }
  
  /**
   * Get personalized content for user
   */
  async getPersonalizedContent(): Promise<ContentItem[]> {
    try {
      const user = await this.getUserData();
      if (!user) return MOCK_CONTENT;
      
      return this.geminiService.generateRecommendations(user, MOCK_CONTENT);
    } catch (error) {
      console.error('Error getting personalized content:', error);
      return MOCK_CONTENT;
    }
  }

  /**
   * Track user interaction with content (view, like, share, etc.)
   */
  async trackUserInteraction(contentId: string, interactionType: UserInteraction, durationMs?: number): Promise<void> {
    try {
      const user = await this.getUserData();
      if (!user) return;
      
      // Ensure preferences object exists
      if (!user.preferences) {
        user.preferences = { interests: [], viewedContent: [] };
      }
      
      // Initialize interactions in preferences if not present
      if (!user.preferences.interactions) {
        user.preferences.interactions = [];
      }
      
      // Add interaction
      user.preferences.interactions.push({
        contentId,
        type: interactionType,
        timestamp: new Date().toISOString(),
        durationMs: durationMs || 0
      });
      
      // Limit stored interactions to last 50
      if (user.preferences.interactions.length > 50) {
        user.preferences.interactions = user.preferences.interactions.slice(-50);
      }
      
      // If it's a view, also add to viewedContent
      if (interactionType === 'view' && !user.preferences.viewedContent?.includes(contentId)) {
        if (!user.preferences.viewedContent) {
          user.preferences.viewedContent = [];
        }
        user.preferences.viewedContent.push(contentId);
      }
      
      await this.saveUserData(user);
      
      // If we have accumulated enough interactions, update interests
      if (user.preferences.interactions.length % 5 === 0) {
        await this.updateUserInterests();
      }
    } catch (error) {
      console.error('Error tracking user interaction:', error);
    }
  }
  
  /**
   * Calculate user engagement score based on interactions
   */
  async calculateEngagementScore(): Promise<{overall: number, bySource: Record<UserSource, number>}> {
    try {
      const user = await this.getUserData();
      if (!user || !user.preferences?.interactions || user.preferences.interactions.length === 0) {
        return {
          overall: 0,
          bySource: {
            instagram: 0,
            referral: 0,
            blog: 0,
            direct: 0,
            unknown: 0
          }
        };
      }
      
      // Define weights for different interaction types
      const weights = {
        view: 1,
        like: 3,
        share: 5,
        save: 4,
        comment: 4
      };
      
      // Calculate overall score
      const interactions = user.preferences.interactions;
      const totalScore = interactions.reduce((score, interaction) => {
        const weight = weights[interaction.type] || 1;
        // Add more weight for longer view durations
        const durationBonus = interaction.type === 'view' && interaction.durationMs 
          ? Math.min(interaction.durationMs / 10000, 3) // Cap duration bonus at 3
          : 0;
        return score + weight + durationBonus;
      }, 0);
      
      // Normalize to 0-100 scale
      const normalizedScore = Math.min(Math.round((totalScore / (interactions.length * 5)) * 100), 100);
      
      // Calculate score by source using content relevance
      const allContent = MOCK_CONTENT;
      const sourceScores: Record<UserSource, number[]> = {
        instagram: [],
        referral: [],
        blog: [],
        direct: [],
        unknown: []
      };
      
      // Map interactions to content and calculate source-specific scores
      for (const interaction of interactions) {
        const content = allContent.find(c => c.id === interaction.contentId);
        if (content) {
          Object.entries(content.sourceRelevance).forEach(([source, relevance]) => {
            const weight = weights[interaction.type] || 1;
            sourceScores[source as UserSource].push((relevance * weight) / 100);
          });
        }
      }
      
      // Calculate average by source
      const bySource = Object.fromEntries(
        Object.entries(sourceScores).map(([source, scores]) => {
          const average = scores.length > 0 
            ? Math.min(Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100), 100)
            : 0;
          return [source, average];
        })
      ) as Record<UserSource, number>;
      
      return {
        overall: normalizedScore,
        bySource
      };
    } catch (error) {
      console.error('Error calculating engagement score:', error);
      return {
        overall: 0,
        bySource: {
          instagram: 0,
          referral: 0,
          blog: 0,
          direct: 0,
          unknown: 0
        }
      };
    }
  }
}
