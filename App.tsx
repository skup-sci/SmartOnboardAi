import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text } from 'react-native';
import * as Linking from 'expo-linking';
import { AppProvider } from './src/contexts/AppContext';
import AppNavigator from './src/navigation/AppNavigator';
import Loading from './src/components/Loading';
import { detectUserSource } from './src/utils/sourceDetection';
import { ConfigService } from './src/services/configService';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Configure deep linking
    const prefix = Linking.createURL('/');
    const linking = {
      prefixes: [prefix, 'smartonboardai://'],
      config: {
        screens: {
          Main: {
            screens: {
              Home: 'home',
              Discover: 'discover',
              Profile: 'profile',
            },
          },
          ContentDetail: {
            path: 'content/:contentId',
            parse: {
              contentId: (contentId: string) => contentId,
            },
          },
          Onboarding: 'onboarding',
          Settings: 'settings',
          Analytics: 'analytics',
        },
      },
    };

    // Initialize ConfigService to securely handle API keys
    const initApp = async () => {
      try {
        await ConfigService.initialize();
        console.log('ConfigService initialized successfully');
      } catch (error) {
        console.error('Error initializing ConfigService:', error);
      } finally {
        // Initialize app after configuration is complete
        setIsReady(true);
      }
    };

    // Add a short delay for better UX
    setTimeout(() => {
      initApp();
    }, 1000);
    
    return () => {
      // Cleanup if needed
    };
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <Loading message="Initializing SmartOnboardAI..." />
      </View>
    );
  }

  return (
    <AppProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
});
