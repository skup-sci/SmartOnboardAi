import WebCompatibleStorage from './webCompatibleStorage';
import { AnalyticsData, UserSource, UserInteraction } from '../types';

const ANALYTICS_KEY = 'analytics-data';

export class AnalyticsService {
  /**
   * Track a new user from a specific source
   */
  async trackNewUser(source: UserSource): Promise<void> {
    try {
      const analyticsData = await this.getAnalyticsData();
      
      // Increment user count for this source
      analyticsData.sourceCounts[source] = (analyticsData.sourceCounts[source] || 0) + 1;
      
      await this.saveAnalyticsData(analyticsData);
    } catch (error) {
      console.error('Error tracking new user:', error);
    }
  }
    /**
   * Track content engagement
   */
  async trackEngagement(source: UserSource, type: 'views' | 'clicks' | UserInteraction, timeSpent?: number): Promise<void> {
    try {
      const analyticsData = await this.getAnalyticsData();
      
      // Initialize source if needed
      if (!analyticsData.engagementBySource[source]) {
        analyticsData.engagementBySource[source] = {
          views: 0,
          clicks: 0,
          timeSpent: 0
        };
      }
      
      // Map UserInteraction types to analytics types
      let analyticsType: 'views' | 'clicks';
      if (type === 'view') {
        analyticsType = 'views';
      } else if (type === 'clicks' || type === 'views') {
        analyticsType = type;
      } else {
        // For other interaction types (like, save, share), count as clicks
        analyticsType = 'clicks';
      }
      
      // Update the specific engagement metric
      analyticsData.engagementBySource[source][analyticsType]++;
      
      // Add time spent if provided
      if (timeSpent && (type === 'views' || type === 'view')) {
        analyticsData.engagementBySource[source].timeSpent += timeSpent;
      }
      
      await this.saveAnalyticsData(analyticsData);
    } catch (error) {
      console.error('Error tracking engagement:', error);
    }
  }
  
  /**
   * Get analytics data
   */
  async getAnalyticsData(): Promise<AnalyticsData> {
    try {
      const data = await WebCompatibleStorage.getItem(ANALYTICS_KEY);
      
      if (data) {
        return JSON.parse(data);
      }
      
      // Return default analytics structure if none exists
      return this.getDefaultAnalyticsData();
    } catch (error) {
      console.error('Error getting analytics data:', error);
      return this.getDefaultAnalyticsData();
    }
  }
  
  /**
   * Save analytics data
   */
  private async saveAnalyticsData(data: AnalyticsData): Promise<void> {
    try {
      await WebCompatibleStorage.setItem(ANALYTICS_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving analytics data:', error);
    }
  }
  
  /**
   * Get default analytics data structure
   */
  private getDefaultAnalyticsData(): AnalyticsData {
    return {
      sourceCounts: {
        instagram: 0,
        referral: 0,
        blog: 0,
        direct: 0,
        unknown: 0
      },
      engagementBySource: {
        instagram: { views: 0, clicks: 0, timeSpent: 0 },
        referral: { views: 0, clicks: 0, timeSpent: 0 },
        blog: { views: 0, clicks: 0, timeSpent: 0 },
        direct: { views: 0, clicks: 0, timeSpent: 0 },
        unknown: { views: 0, clicks: 0, timeSpent: 0 }
      }
    };
  }
  
  /**
   * Reset all analytics data
   */
  async resetAnalytics(): Promise<void> {
    try {
      await this.saveAnalyticsData(this.getDefaultAnalyticsData());
    } catch (error) {
      console.error('Error resetting analytics:', error);
    }
  }
}
