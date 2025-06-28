// Source types for different user origins
export type UserSource = 'instagram' | 'referral' | 'blog' | 'direct' | 'unknown';

// User interaction types
export type UserInteraction = 'view' | 'like' | 'share' | 'save' | 'comment';

// User interaction record
export interface InteractionRecord {
  contentId: string;
  type: UserInteraction;
  timestamp: string;
  durationMs?: number;
}

// User data structure
export interface User {
  id: string;
  source: UserSource;
  preferences?: UserPreferences;
}

// User preferences
export interface UserPreferences {
  theme?: string;
  interests?: string[];
  viewedContent?: string[];
  interactions?: InteractionRecord[];
  lastExplorationPath?: string[];
}

// Content item structure
export interface ContentItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  sourceRelevance: {
    [key in UserSource]?: number;  // Relevance score for different sources (0-100)
  };
  tags: string[];
}

// Analytics data structure
export interface AnalyticsData {
  sourceCounts: {
    [key in UserSource]: number;
  };
  engagementBySource: {
    [key in UserSource]: {
      views: number;
      clicks: number;
      timeSpent: number;
    };
  };
}

// Navigation types
export type RootStackParamList = {
  Main: { screen?: keyof MainTabParamList };
  Onboarding: { source?: UserSource };
  ContentDetail: { contentId: string };
  Settings: undefined;
  Analytics: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Discover: undefined;
  Profile: undefined;
};
