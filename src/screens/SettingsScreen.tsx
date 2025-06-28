import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, Switch, ScrollView, TouchableOpacity, 
  Alert, TextInput, Modal, ActivityIndicator 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import WebContainer from '../components/WebContainer';
import { COLORS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../constants';
import Button from '../components/Button';
import { useAppContext } from '../hooks/useAppContext';
import { RootStackParamList } from '../types';
import { ConfigService } from '../services/configService';
import { GeminiService } from '../services/geminiService';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SettingsScreen = () => {
  const navigation = useNavigation<SettingsScreenNavigationProp>();
  const { initializeApp } = useAppContext();
  
  // Settings states
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [locationTracking, setLocationTracking] = useState(false);
  const [dataCollection, setDataCollection] = useState(true);
  
  // API key states
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [isApiKeyModalVisible, setIsApiKeyModalVisible] = useState(false);
  const [isApiKeyMasked, setIsApiKeyMasked] = useState(true);
  const [isTestingApiKey, setIsTestingApiKey] = useState(false);
  const [apiKeyTestResult, setApiKeyTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // API status state
  const [apiStatus, setApiStatus] = useState<{
    hasApiKey: boolean;
    keyValid: boolean;
    keySource: 'storage' | 'environment' | 'none';
  }>({
    hasApiKey: false,
    keyValid: false,
    keySource: 'none'
  });
  
  // Load API key and status on component mount
  useEffect(() => {
    const loadApiKeyAndStatus = async () => {
      try {
        const apiKey = await ConfigService.getGeminiApiKey();
        if (apiKey) {
          // Mask the API key for display
          setGeminiApiKey(apiKey);
        }
        
        const status = await ConfigService.getApiStatus();
        setApiStatus(status);
      } catch (error) {
        console.error('Error loading Gemini API key or status:', error);
      }
    };
    
    loadApiKeyAndStatus();
  }, []);

  const handleResetApp = () => {
    Alert.alert(
      'Reset App',
      'This will clear all your data and reset the app to its initial state. Are you sure?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            // Clear all local storage and reinitialize
            ConfigService.clearAll().then(() => {
              initializeApp().then(() => {
                navigation.navigate('Onboarding', { source: 'unknown' });
              });
            });
          },
        },
      ]
    );
  };
  
  const handleApiKeySubmit = async () => {
    if (!geminiApiKey || geminiApiKey.trim().length < 10) {
      Alert.alert('Invalid API Key', 'Please enter a valid Gemini API key');
      return;
    }
    
    setIsTestingApiKey(true);
    setApiKeyTestResult(null);
    
    try {
      // First validate the format
      if (!ConfigService.validateGeminiApiKeyFormat(geminiApiKey)) {
        setApiKeyTestResult({
          success: false,
          message: 'Invalid API key format. Keys are typically at least 10 characters without spaces.'
        });
        setIsTestingApiKey(false);
        return;
      }
      
      // Test if the API key works by creating a temporary GeminiService instance
      const testService = new GeminiService();
      
      // Store the key temporarily
      await ConfigService.updateGeminiApiKey(geminiApiKey);
      
      // Wait for initialization to complete (max 5 seconds)
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500));
          // Access the private initialized property
        if ((testService as any).initialized === true) {
          // Clear any previous authentication errors since API key is working
          GeminiService.clearAuthenticationError();
          
          setApiKeyTestResult({
            success: true,
            message: 'API key verified successfully!'
          });
          break;
        }
        
        // If we've tried initialization multiple times and it's still failing
        if ((testService as any).retryCount >= (testService as any).maxRetries) {
          setApiKeyTestResult({
            success: false,
            message: 'Could not connect to Gemini API with this key. Please check the key and try again.'
          });
          break;
        }
        
        attempts++;
      }
      
      // If we timed out waiting for initialization
      if (attempts >= maxAttempts && !apiKeyTestResult) {
        setApiKeyTestResult({
          success: false,
          message: 'Timed out while testing the API key. Please try again.'
        });
      }
      
      // If successful, reinitialize the app to use the new key
      if (apiKeyTestResult?.success) {
        setTimeout(() => {
          setIsApiKeyModalVisible(false);
          initializeApp();
        }, 1500);
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      setApiKeyTestResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsTestingApiKey(false);
    }
  };
  
  // Helper function to get the API status text
  const getApiStatusText = () => {
    if (!apiStatus.hasApiKey) {
      return "No API key configured. AI features unavailable.";
    }
    
    if (!apiStatus.keyValid) {
      return "Invalid API key format. Please update.";
    }
    
    if (apiStatus.keySource === 'environment') {
      return "Using API key from environment";
    }
    
    return "API key configured";
  };
    return (
    <WebContainer style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Location Tracking</Text>
            <Switch
              value={locationTracking}
              onValueChange={setLocationTracking}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Data Collection</Text>
            <Switch
              value={dataCollection}
              onValueChange={setDataCollection}
              trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
              thumbColor={COLORS.white}
            />
          </View>
          
          <View style={styles.settingDescription}>
            <Text style={styles.settingDescriptionText}>
              Data collection helps us improve your experience by personalizing content
              based on your interests and traffic source.
            </Text>
          </View>
        </View>
          <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI Features</Text>
          
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={() => setIsApiKeyModalVisible(true)}
          >
            <Text style={styles.settingLabel}>Update Gemini API Key</Text>
            <Text style={styles.settingValue}>
              {geminiApiKey ? (isApiKeyMasked ? '••••••••' : geminiApiKey) : 'Not set'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.settingDescription}>
            <Text style={styles.settingDescriptionText}>
              A valid Google Gemini API key is required for personalization features.
              {!geminiApiKey && ' Please add your API key to enable AI functionality.'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.aboutItem}>
            <Text style={styles.aboutItemText}>Version 1.0.0</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.aboutItem}>
            <Text style={styles.aboutItemText}>Terms of Service</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.aboutItem}>
            <Text style={styles.aboutItemText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>
        
        <Button
          title="Reset App"
          variant="outline"
          onPress={handleResetApp}
          style={styles.resetButton}
        />
      </ScrollView>
      
      {/* API Key Modal */}
      <Modal
        visible={isApiKeyModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Gemini API Key</Text>
            
            <Text style={styles.modalDescription}>
              Enter your Google Gemini API key to enable AI-powered personalization.
              Get your API key from the Google AI Studio website.
            </Text>
            
            <TextInput
              style={styles.apiKeyInput}
              value={geminiApiKey}
              onChangeText={setGeminiApiKey}
              placeholder="Enter Gemini API Key"
              placeholderTextColor={COLORS.gray}
              secureTextEntry={isApiKeyMasked}
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <TouchableOpacity 
              style={styles.toggleMaskButton}
              onPress={() => setIsApiKeyMasked(!isApiKeyMasked)}
            >
              <Text style={styles.toggleMaskText}>
                {isApiKeyMasked ? 'Show Key' : 'Hide Key'}
              </Text>
            </TouchableOpacity>
            
            {isTestingApiKey && (
              <View style={styles.testingContainer}>
                <ActivityIndicator color={COLORS.primary} />
                <Text style={styles.testingText}>Testing API key...</Text>
              </View>
            )}
            
            {apiKeyTestResult && (
              <View style={[
                styles.testResultContainer,
                apiKeyTestResult.success ? styles.testSuccess : styles.testError
              ]}>
                <Text style={styles.testResultText}>{apiKeyTestResult.message}</Text>
              </View>
            )}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsApiKeyModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.modalButton, 
                  styles.saveButton,
                  isTestingApiKey && styles.disabledButton
                ]}
                onPress={handleApiKeySubmit}
                disabled={isTestingApiKey}
              >
                <Text style={styles.saveButtonText}>Save & Test</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.darkGray,
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  settingLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.darkGray,
  },
  settingValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    maxWidth: 150,
  },
  settingDescription: {
    padding: SPACING.md,
  },
  settingDescriptionText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    lineHeight: 18,
  },
  aboutItem: {
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  aboutItemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.gray,
  },
  resetButton: {
    marginVertical: SPACING.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.darkGray,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  modalDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray,
    marginBottom: SPACING.lg,
    textAlign: 'center',
    lineHeight: 18,
  },
  apiKeyInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.darkGray,
    marginBottom: SPACING.sm,
  },
  toggleMaskButton: {
    alignSelf: 'flex-end',
    padding: SPACING.sm,
  },
  toggleMaskText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.lightGray,
    marginRight: SPACING.sm,
  },
  cancelButtonText: {
    color: COLORS.darkGray,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    marginLeft: SPACING.sm,
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
  testingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
  },
  testingText: {
    marginLeft: SPACING.sm,
    color: COLORS.darkGray,
    fontSize: FONT_SIZES.sm,
  },
  testResultContainer: {
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    marginTop: SPACING.sm,
  },
  testSuccess: {
    backgroundColor: '#e6f7ea',
  },
  testError: {
    backgroundColor: '#feeae6',
  },
  testResultText: {
    fontSize: FONT_SIZES.sm,
    textAlign: 'center',
  },
});

export default SettingsScreen;
