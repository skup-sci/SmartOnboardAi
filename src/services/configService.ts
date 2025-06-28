import WebCompatibleStorage from './webCompatibleStorage';
import { GEMINI_API_KEY } from '@env';

/**
 * ConfigService - Manages secure access to API keys and configuration
 */
export class ConfigService {
  private static readonly GEMINI_API_KEY_STORAGE_KEY = 'gemini_api_key';

  /**
   * Initialize the configuration service
   * This should be called during app startup
   */
  static async initialize(): Promise<void> {
    try {
      // Check if we already have an API key stored
      const storedApiKey = await this.getGeminiApiKey();
      
      if (!storedApiKey && GEMINI_API_KEY) {
        // Store the API key from environment variables securely
        await this.setGeminiApiKey(GEMINI_API_KEY);
      }
    } catch (error) {
      console.error('Error initializing ConfigService:', error);
    }
  }
  /**
   * Get the Gemini API key from secure storage
   * Falls back to environment variable if secure storage fails
   */  static async getGeminiApiKey(): Promise<string | null> {
    try {
      // First try to get from secure storage
      const storedKey = await WebCompatibleStorage.getItem(this.GEMINI_API_KEY_STORAGE_KEY);
      if (storedKey) {
        return storedKey;
      }
      
      // Fall back to environment variable if storage is empty
      if (GEMINI_API_KEY) {
        // Try to save it for next time
        this.setGeminiApiKey(GEMINI_API_KEY).catch(err => 
          console.warn('Failed to store API key from environment:', err)
        );
        return GEMINI_API_KEY;
      }
      
      console.warn('No Gemini API key available in secure storage or environment');
      return null;
    } catch (error) {
      console.error('Error retrieving Gemini API key from secure storage:', error);
      
      // Fall back to environment variable on storage access error
      if (GEMINI_API_KEY) {
        console.log('Using Gemini API key from environment variables as fallback');
        return GEMINI_API_KEY;
      }
      
      return null;
    }
  }
  /**
   * Set the Gemini API key in secure storage
   */
  private static async setGeminiApiKey(apiKey: string): Promise<void> {
    try {
      await WebCompatibleStorage.setItem(this.GEMINI_API_KEY_STORAGE_KEY, apiKey);
    } catch (error) {
      console.error('Error storing Gemini API key:', error);
    }
  }
  
  /**
   * Update the Gemini API key
   * This can be used from settings to change the API key
   */
  static async updateGeminiApiKey(apiKey: string): Promise<boolean> {
    try {
      if (!apiKey || apiKey.trim().length < 10) {
        console.error('Invalid API key format');
        return false;
      }
      
      await this.setGeminiApiKey(apiKey);
      return true;
    } catch (error) {
      console.error('Error updating Gemini API key:', error);
      return false;
    }
  }
  
  /**
   * Validate a Gemini API key format
   * Note: This only checks the format, not if the key actually works
   */
  static validateGeminiApiKeyFormat(apiKey: string): boolean {
    // Basic validation - API keys are typically at least 10 chars and don't contain spaces
    return Boolean(apiKey && apiKey.trim().length >= 10 && !apiKey.includes(' '));
  }

  /**
   * Validates that the provided API key has the proper format
   * This does not check if the key actually works with the API
   * @param apiKey The API key to validate
   * @returns True if the key appears valid, false otherwise
   */
  static validateApiKey(apiKey: string | null): boolean {
    if (!apiKey) return false;
    
    // Check that it has minimum length (typical Gemini API keys are long)
    if (apiKey.length < 30) return false;
    
    // Check that it contains only valid characters
    const validKeyRegex = /^[A-Za-z0-9_-]+$/;
    return validKeyRegex.test(apiKey);
  }

  /**
   * Gets a status report for API configuration
   * @returns Object with status information
   */
  static async getApiStatus(): Promise<{ 
    hasApiKey: boolean; 
    keyValid: boolean;
    keySource: 'storage' | 'environment' | 'none';
  }> {
    try {
      // Check secure storage first
      const storedKey = await WebCompatibleStorage.getItem(this.GEMINI_API_KEY_STORAGE_KEY);
      
      if (storedKey && this.validateApiKey(storedKey)) {
        return {
          hasApiKey: true,
          keyValid: true,
          keySource: 'storage'
        };
      }
      
      // Check environment variable
      if (GEMINI_API_KEY && this.validateApiKey(GEMINI_API_KEY)) {
        return {
          hasApiKey: true,
          keyValid: true,
          keySource: 'environment'
        };
      }
      
      // Determine if we have an invalid key or no key
      if (storedKey || GEMINI_API_KEY) {
        return {
          hasApiKey: true,
          keyValid: false,
          keySource: storedKey ? 'storage' : 'environment'
        };
      }
      
      // No key at all
      return {
        hasApiKey: false,
        keyValid: false,
        keySource: 'none'
      };
    } catch (error) {
      console.error('Error checking API key status:', error);
      return {
        hasApiKey: false,
        keyValid: false,
        keySource: 'none'
      };
    }
  }

  /**
   * Clear all stored configuration values
   * Useful for logout or reset scenarios
   */
  static async clearAll(): Promise<void> {
    try {
      await WebCompatibleStorage.removeItem(this.GEMINI_API_KEY_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing configuration:', error);
    }
  }
}
