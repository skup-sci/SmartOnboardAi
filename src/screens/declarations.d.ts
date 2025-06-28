// Add TypeScript declarations for all screen components
declare module '../screens/HomeScreen' {
  import React from 'react';
  const HomeScreen: React.FC;
  export default HomeScreen;
}

declare module '../screens/DiscoverScreen' {
  import React from 'react';
  const DiscoverScreen: React.FC;
  export default DiscoverScreen;
}

declare module '../screens/ProfileScreen' {
  import React from 'react';
  const ProfileScreen: React.FC;
  export default ProfileScreen;
}

declare module '../screens/OnboardingScreen' {
  import React from 'react';
  const OnboardingScreen: React.FC;
  export default OnboardingScreen;
}

declare module '../screens/ContentDetailScreen' {
  import React from 'react';
  const ContentDetailScreen: React.FC;
  export default ContentDetailScreen;
}

declare module '../screens/SettingsScreen' {
  import React from 'react';
  const SettingsScreen: React.FC;
  export default SettingsScreen;
}

declare module '../screens/AnalyticsScreen' {
  import React from 'react';
  const AnalyticsScreen: React.FC;
  export default AnalyticsScreen;
}

declare module '../hooks/useAppContext' {
  export const useAppContext: () => any;
}
