// App theme colors
export const COLORS = {
  primary: '#4361EE',
  secondary: '#3A0CA3',
  accent: '#F72585',
  background: '#F8F9FA',
  white: '#FFFFFF',
  lightGray: '#E9ECEF',
  gray: '#6C757D',
  darkGray: '#343A40',
  black: '#212529',
  success: '#4CC9F0',
  error: '#FF5252',
  warning: '#FFC107',
  info: '#4361EE',
  lightPrimary: '#D6DFFF',
  
  // Source-specific colors
  sourceColors: {
    instagram: '#E1306C',
    referral: '#4CC9F0',
    blog: '#7209B7',
    direct: '#F72585',
    unknown: '#6C757D'
  }
};

// Font sizes
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

// Border radius
export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  circle: 999,
};

// Animation durations
export const ANIMATION = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// Mock data
export const MOCK_CONTENT = [
  {
    id: '1',
    title: 'Understanding AI-Driven Content Personalization',
    description: 'Learn how AI can transform your content experience by adapting to user preferences and behavior.',
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
    sourceRelevance: {
      blog: 90,
      referral: 70,
      instagram: 60,
      direct: 50,
    },
    tags: ['ai', 'personalization', 'content', 'technology'],
  },
  {
    id: '2',
    title: 'The Visual Guide to Modern UX Design',
    description: 'Explore the principles and practices that make modern user experiences intuitive and engaging.',
    imageUrl: 'https://images.unsplash.com/photo-1618788372246-79faff717f5b',
    sourceRelevance: {
      instagram: 95,
      blog: 80,
      referral: 60,
      direct: 70,
    },
    tags: ['design', 'ux', 'visual', 'interface'],
  },
  {
    id: '3',
    title: 'Building Connections Through Technology',
    description: 'How digital platforms are reshaping the way we connect, communicate, and collaborate.',
    imageUrl: 'https://images.unsplash.com/photo-1638136264464-2711f0078d1e',
    sourceRelevance: {
      referral: 95,
      blog: 65,
      direct: 70,
      instagram: 50,
    },
    tags: ['community', 'connections', 'digital', 'social'],
  },
  {
    id: '4',
    title: 'The Future of Smart Interfaces',
    description: 'From voice commands to gestures, discover how the next generation of interfaces will transform user experience.',
    imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
    sourceRelevance: {
      direct: 90,
      blog: 85,
      instagram: 70,
      referral: 60,
    },
    tags: ['interfaces', 'future', 'technology', 'smart'],
  },
  {
    id: '5',
    title: 'Data-Driven Design Decisions',
    description: 'How to use analytics and user data to improve your product design process.',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
    sourceRelevance: {
      blog: 95,
      direct: 80,
      referral: 85,
      instagram: 50,
    },
    tags: ['data', 'design', 'analytics', 'process'],
  },
];

// Sample user sources and related welcome messages
export const SOURCE_MESSAGES = {
  instagram: 'Welcome from Instagram! Check out our visual experience.',
  referral: 'Thanks for joining through a referral! Here\'s what your friends love.',
  blog: 'Welcome, blog reader! Dive deeper into our content.',
  direct: 'Welcome to SmartOnboardAI! Discover personalized content.',
  unknown: 'Welcome! Let\'s personalize your experience.',
};

// Deep linking prefixes
export const DEEP_LINK_PREFIX = 'smartonboardai://';
