import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserSource, ContentItem, User } from '../types';
import { ConfigService } from './configService';

// This will be initialized properly in the constructor

// Import directly at the top to ensure TypeScript knows about it
import { Platform } from 'react-native';
let NetInfo: any;

// Conditionally import NetInfo in React Native environment
if (Platform.OS !== 'web') {
  try {
    // Use require instead of import to avoid issues with web bundling
    NetInfo = require('@react-native-community/netinfo');
  } catch (e) {
    console.warn('NetInfo package is not available:', e);
  }
}

export class GeminiService {
  private model: any;
  private initialized: boolean = false;
  private initializationAttempted: boolean = false;
  private retryCount: number = 0;
  private maxRetries: number = 3;
  private netInfoUnsubscribe: (() => void) | null = null;
  
  constructor() {
    // Initialize with a small delay to avoid blocking app startup
    setTimeout(() => this.initializeModel(), 500);
    
    // Set up network connectivity monitoring using React Native's approach
    this.setupNetworkMonitoring();
  }
  
  private setupNetworkMonitoring() {
    // Only set up monitoring in native platforms, not in web
    if (Platform.OS === 'web' || !NetInfo) {
      console.log('Network monitoring not available in this environment');
      return;
    }
    
    try {
      // Subscribe to network state updates
      // Import NetInfoState type only if NetInfo is available
      type NetInfoState = {
        type: string;
        isConnected: boolean | null;
        isInternetReachable: boolean | null;
        details?: any;
      };

      this.netInfoUnsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
        // Check if we've regained network connectivity
        if (state.isConnected && state.isInternetReachable) {
          console.log('Network connection restored - reinitializing Gemini');
          this.initialized = false;
          this.initializationAttempted = false;
          this.retryCount = 0;
          this.initializeModel();
        }
      });    } catch (error) {
      console.warn('Failed to set up network monitoring:', error);
    }
  }
    private async initializeModel() {
    // Prevent multiple initialization attempts in parallel
    if (this.initializationAttempted && this.retryCount >= this.maxRetries) {
      return;
    }
    
    this.initializationAttempted = true;
    
    try {
      // Check API configuration status first
      const status = await ConfigService.getApiStatus();
      
      if (!status.hasApiKey) {
        console.error('No Gemini API key available. Please add your API key in Settings.');
        return;
      }
      
      if (!status.keyValid) {
        console.error('Invalid Gemini API key format. Please check your API key in Settings.');
        return;
      }
      
      const apiKey = await ConfigService.getGeminiApiKey();
      if (!apiKey) {
        console.error('Failed to retrieve Gemini API key');
        return;
      }      // List of models to try, in order of preference
      // Updated model names based on latest Google AI API
      const modelsToTry = [
        // Current available models in Gemini API
        'gemini-1.5-flash',    // Fastest, most cost-effective
        'gemini-1.5-pro',      // More capable but higher cost
        'gemini-1.0-pro',      // Legacy fallback
        
        // Alternative naming conventions
        'models/gemini-1.5-flash',
        'models/gemini-1.5-pro', 
        'models/gemini-1.0-pro',
        
        // Legacy names (likely to fail but kept as fallback)
        'gemini-pro',
        'models/gemini-pro',
      ];
      
      const genAI = new GoogleGenerativeAI(apiKey);
        // Add a small delay between model initialization attempts to reduce load
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        // First, just try to get a valid model without making any API calls to avoid quota issues
      // This is the safest approach since it doesn't consume any quota
      for (const modelName of modelsToTry) {
        try {
          console.log(`Just initializing model without testing: ${modelName}`);
          
          // Create the model but don't test it with an API call
          this.model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 512, // Reduced to minimize token usage
            },
          });
          
          // If we get here without error, the model is at least recognized by the API
          this.initialized = true;
          console.log(`Successfully initialized Gemini model: ${modelName} (initial setup)`);
          
          // Instead of making an API call, assume model is valid if initialization worked
          // We'll discover any issues when actually making calls later
          return;
        } catch (error) {
          // Only log if it's not a model not found error (these are expected)
          const errorMsg = String(error);
          if (!errorMsg.includes('not found')) {
            console.warn(`Failed to initialize model ${modelName} (non-critical):`, errorMsg);
          }
        }
      }
      
      // If we couldn't initialize any model without testing, try again with testing
      console.log('Could not initialize models without testing, will attempt with minimal testing');
        // Only check ONE model with an absolutely minimal test to minimize API calls
      // We'll use this approach as a last resort to verify the API is working
      const minimalTestModels = ['gemini-pro', 'text-bison'];
      
      for (const modelName of minimalTestModels) {
        try {
          // Wait a bit longer between attempts to avoid rate limits
          await delay(2000);
          
          console.log(`Trying minimal test with model: ${modelName}`);
          
          // Use minimal settings to reduce quota usage
          this.model = genAI.getGenerativeModel({ 
            model: modelName,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 10, // Absolute minimum to just test connectivity
            },
          });
          
          // Extremely minimal test prompt with minimal token usage
          const testResult = await this.model.generateContent({
            contents: [{ role: 'user', parts: [{ text: 'Test?' }] }],
          });
          
          // If we get here without error, the API is working
          this.initialized = true;
          console.log(`Successfully tested Gemini API with model: ${modelName}`);
          break;        } catch (modelError: any) {
          const errorMsg = (modelError instanceof Error) ? modelError.message : String(modelError);
            // Special handling for authentication/permission errors
          if (errorMsg.includes('403') || errorMsg.includes('PERMISSION_DENIED') || 
              errorMsg.includes('unregistered callers') || errorMsg.includes('API Key') ||
              errorMsg.includes('UNAUTHENTICATED') || errorMsg.includes('invalid_api_key')) {
            console.error(`Authentication error for model ${modelName}: Invalid or missing API key`);
            console.error('API Error:', errorMsg);
            console.error('Please check your Gemini API key in the Settings screen');
            console.error('Visit https://makersuite.google.com/app/apikey to get your API key');
            
            // Mark as permanently failed for API key issues
            this.initialized = false;
            this.initializationAttempted = true;
            this.retryCount = this.maxRetries; // Stop retrying for auth errors
            (this as any)._permanentlyFailed = true;
            (this as any)._authenticationFailed = true;
            (this as any)._authErrorMessage = `Authentication Failed: ${errorMsg}`;
            
            // Record this as an auth issue with a specific message
            GeminiService.recordAuthenticationError(errorMsg);
            return; // Exit the loop since API key is the issue
          }
          
          // Special handling for quota errors
          if (errorMsg.includes('quota') || errorMsg.includes('429') || errorMsg.includes('rate limit')) {
            console.warn(`Rate limit or quota issue detected for model ${modelName}. Will try alternative models after longer delay.`);
            await delay(3000); // Wait longer for quota errors
          } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
            console.warn(`Model ${modelName} not found. Will try alternative models.`);
          } else {
            console.warn(`Error testing model ${modelName}: ${errorMsg}`);
          }
        }
      }      if (!this.initialized) {
        console.error('All Gemini model initialization attempts failed');
        this.retryCount++;
        
        // If we're hitting quota issues, we need to be very conservative with retries
        if (this.retryCount < this.maxRetries) {
          // Much larger backoff times when dealing with quota issues
          // Start with 10 seconds and increase exponentially
          const backoffTime = Math.min(10000 * Math.pow(2, this.retryCount), 120000);
          console.log(`Will retry initialization (attempt ${this.retryCount + 1}/${this.maxRetries}) after ${backoffTime/1000} seconds`);
          
          setTimeout(() => {
            this.initializationAttempted = false;
            this.initializeModel();
          }, backoffTime);
        } else {
          // After max retries, mark as permanently failed and log the issue
          console.warn(`Maximum retries (${this.maxRetries}) reached. Gemini API will not be available.`);
          console.warn('The app will continue to function using fallback methods instead of AI.');
          
          // Record the quota issue for UI display
          GeminiService.recordQuotaIssue();
          
          // Just set a flag that we can check to show a UI notification
          (this as any)._permanentlyFailed = true;
          
          // Set up a very long-delay retry in case the quota resets later (30 minutes)
          // This is enough time for daily quota limits to potentially reset
          setTimeout(() => {
            console.log('Attempting final initialization after extended timeout period (quota may have reset)');
            this.initializationAttempted = false;
            this.retryCount = 0;
            this.initializeModel();
          }, 30 * 60 * 1000); // Try again after 30 minutes
        }
      }
    } catch (error) {
      console.error('Failed to initialize Gemini service:', error);
      this.retryCount++;
      
      if (this.retryCount < this.maxRetries) {
        // Use exponential backoff for retries
        const backoffTime = Math.min(1000 * Math.pow(2, this.retryCount), 30000);
        console.log(`Will retry initialization (attempt ${this.retryCount + 1}/${this.maxRetries}) after ${backoffTime/1000} seconds`);
        
        setTimeout(() => {
          this.initializationAttempted = false;
          this.initializeModel();
        }, backoffTime);
      }
    }
  }
  /**
   * Analyze content to determine relevance for different sources
   */  async analyzeContentRelevance(content: Partial<ContentItem>): Promise<Record<UserSource, number>> {
    if (!this.initialized) {
      await this.initializeModel();
      if (!this.initialized) {
        return {
          instagram: 50,
          referral: 50,
          blog: 50,
          direct: 50,
          unknown: 50
        };
      }
    }
    
    try {
      const parts = [{
        text: `
          Analyze this content and rate its relevance (0-100) for users coming from different sources:
          
          Title: ${content.title}
          Description: ${content.description}
          Tags: ${content.tags?.join(', ')}
          
          Return ratings for Instagram, referral, blog, and direct traffic sources in JSON format:
          {
            "instagram": [rating 0-100],
            "referral": [rating 0-100],
            "blog": [rating 0-100],
            "direct": [rating 0-100],
            "unknown": [rating 0-100]
          }
        `
      }];
      
      const generationConfig = {
        temperature: 0.2, // Lower temperature for more consistent/predictable outputs
        maxOutputTokens: 256, // Limit output size since we just need a JSON object
      };
      
      // Create request with timeout
      const result = await Promise.race([
        this.model.generateContent({
          contents: [{ role: 'user', parts }],
          generationConfig,
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out')), 10000)
        )
      ]) as any;
      
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Ensure all required sources have values
        const defaultValues = {
          instagram: 50,
          referral: 50,
          blog: 50,
          direct: 50,
          unknown: 50
        };
        
        return { ...defaultValues, ...parsed };
      }
      
      throw new Error('Failed to parse AI response');
    } catch (error) {
      console.error('Error analyzing content with Gemini:', error);
      
      // Retry model initialization on error
      if (!this.initialized || (error instanceof Error && 
          (error.message.includes('not initialized') || error.message.includes('model')))) {
        this.initialized = false;
        this.initializationAttempted = false;
        setTimeout(() => this.initializeModel(), 1000);
      }
      
      // Return default values
      return {
        instagram: 50,
        referral: 50,
        blog: 50,
        direct: 50,
        unknown: 50
      };
    }
  }
  /**
   * Generate personalized recommendations based on user source and preferences
   */
  async generateRecommendations(user: User, availableContent: ContentItem[]): Promise<ContentItem[]> {
    if (!this.initialized) {
      await this.initializeModel();
      if (!this.initialized) {
        // Fallback sorting if AI is not available
        return [...availableContent].sort((a, b) => {
          const aRelevance = a.sourceRelevance[user.source] || 0;
          const bRelevance = b.sourceRelevance[user.source] || 0;
          return bRelevance - aRelevance;
        });
      }
    }
    
    try {
      // For demo purposes, we'll just return sorted content
      // In a real implementation, we would use Gemini to analyze and recommend content
      
      // Simple sorting by source relevance as a fallback
      return [...availableContent].sort((a, b) => {
        const aRelevance = a.sourceRelevance[user.source] || 0;
        const bRelevance = b.sourceRelevance[user.source] || 0;
        return bRelevance - aRelevance;
      });
    } catch (error) {
      console.error('Error generating recommendations with Gemini:', error);
      return availableContent;
    }
  }  /**
   * Generate a personalized welcome message based on user source
   */  async generateWelcomeMessage(source: UserSource): Promise<string> {
    // Define default messages to fall back on immediately
    const defaultMessages = {
      instagram: 'Welcome from Instagram! Check out our visual experience.',
      referral: 'Thanks for joining through a referral! Here\'s what your friends love.',
      blog: 'Welcome, blog reader! Dive deeper into our content.',
      direct: 'Welcome to SmartOnboardAI! Discover personalized content.',
      unknown: 'Welcome! Let\'s personalize your experience.',
    };
    
    // If not initialized, try initializing but with a short timeout
    if (!this.initialized) {
      try {
        const initPromise = this.initializeModel();
        
        // Only wait up to 1 second for initialization to avoid delaying the welcome message
        await Promise.race([
          initPromise,
          new Promise(resolve => setTimeout(resolve, 1000))
        ]);
        
        // If still not initialized after the timeout, return default right away
        if (!this.initialized) {
          console.log('Using default welcome message (model not initialized)');
          return defaultMessages[source] || defaultMessages.unknown;
        }
      } catch (error) {
        console.warn('Error during initialization for welcome message:', error);
        return defaultMessages[source] || defaultMessages.unknown;
      }
    }
    
    try {
      // Define default messages to fall back on
      const defaultMessages = {
        instagram: 'Welcome from Instagram! Check out our visual experience.',
        referral: 'Thanks for joining through a referral! Here\'s what your friends love.',
        blog: 'Welcome, blog reader! Dive deeper into our content.',
        direct: 'Welcome to SmartOnboardAI! Discover personalized content.',
        unknown: 'Welcome! Let\'s personalize your experience.',
      };
      
      const parts = [{
        text: `
          Generate a short, friendly welcome message for a user coming from ${source}.
          The message should be personalized to this source but keep it under 100 characters.
          Don't include quotes in your response.
        `
      }];
      
      const generationConfig = {
        temperature: 0.7,
        maxOutputTokens: 128,
      };
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5-second timeout
      
      try {
        const result = await this.model.generateContent({
          contents: [{ role: 'user', parts }],
          generationConfig,
        }, { abortSignal: controller.signal });
        
        clearTimeout(timeoutId);
        const response = await result.response;
        return response.text().replace(/["']/g, '').trim();
      } catch (innerError) {
        clearTimeout(timeoutId);
        // If there's a timeout or API error, use default messages
        if (innerError instanceof Error && 
            (innerError.name === 'AbortError' || innerError.message.includes('timeout'))) {
          console.warn('Welcome message generation timed out, using default');
          return defaultMessages[source] || defaultMessages.unknown;
        }
        throw innerError; // Re-throw for the outer catch
      }
    } catch (error) {
      console.error('Error generating welcome message:', error);
      
      // Retry model initialization on certain errors
      if (error instanceof Error && 
          (error.message.includes('not initialized') || 
           error.message.includes('model') ||
           error.message.includes('429') || 
           error.message.includes('quota'))) {
        this.initialized = false;
        this.initializationAttempted = false;
        setTimeout(() => this.initializeModel(), 1000);
      }
      
      // Return a default welcome message
      const defaultMessages = {
        instagram: 'Welcome from Instagram! Check out our visual experience.',
        referral: 'Thanks for joining through a referral! Here\'s what your friends love.',
        blog: 'Welcome, blog reader! Dive deeper into our content.',
        direct: 'Welcome to SmartOnboardAI! Discover personalized content.',
        unknown: 'Welcome! Let\'s personalize your experience.',
      };
      
      return defaultMessages[source] || `Welcome to SmartOnboardAI!`;
    }
  }
  /**
   * Analyze user behavior to predict interests
   */  async predictUserInterests(viewedContent: ContentItem[]): Promise<string[]> {
    if (viewedContent.length === 0) return [];
    
    if (!this.initialized) {
      await this.initializeModel();
      if (!this.initialized) {
        // Return amalgamated tags if AI is not available
        const allTags = viewedContent.flatMap(item => item.tags);
        const uniqueTags = [...new Set(allTags)];
        return uniqueTags.slice(0, 5);
      }
    }
    
    // Create fallback interests from tags
    const extractFallbackInterests = (): string[] => {
      const allTags = viewedContent.flatMap(item => item.tags);
      const tagCounts = allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      // Sort tags by frequency
      return Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .map(([tag]) => tag)
        .slice(0, 5);
    };
    
    try {
      // Limit content summary if there are many items
      const contentSummary = viewedContent
        .slice(0, 10) // Limit to 10 items to avoid token limits
        .map(item => `Title: ${item.title}\nTags: ${item.tags.join(', ')}`)
        .join('\n\n');
      
      const parts = [{
        text: `
          Based on the following content viewed by a user, predict their top 5 interest areas.
          Return just the list of interests as a JSON array of strings.
          
          Content viewed:
          ${contentSummary}
        `
      }];
      
      const generationConfig = {
        temperature: 0.3,
        maxOutputTokens: 256,
      };
      
      // Set up a promise with timeout
      const resultPromise = Promise.race([
        this.model.generateContent({
          contents: [{ role: 'user', parts }],
          generationConfig,
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Request timed out')), 7000)
        )
      ]) as Promise<any>;
      
      const result = await resultPromise;
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON array from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.slice(0, 5); // Ensure we only return max 5 interests
          }
        } catch (parseError) {
          console.warn('Failed to parse JSON interests:', parseError);
        }
      }
      
      // Fallback to extracting comma-separated values
      const interestsFromText = text
        .split(',')
        .map((interest: string) => interest.trim().replace(/["'[\]]/g, ''))
        .filter(Boolean)
        .slice(0, 5);
      
      if (interestsFromText.length > 0) {
        return interestsFromText;
      }
      
      // If all else fails, return interests from tags
      return extractFallbackInterests();
    } catch (error) {
      console.error('Error predicting user interests:', error);
      
      // Retry model initialization on certain errors
      if (error instanceof Error && 
          (error.message.includes('not initialized') || 
           error.message.includes('model') ||
           error.message.includes('429') || 
           error.message.includes('quota'))) {
        this.initialized = false;
        this.initializationAttempted = false;
        setTimeout(() => this.initializeModel(), 1000);
      }
      
      return extractFallbackInterests();
    }
  }

  /**
   * Generate personalized content suggestions based on user behavior and source
   */
  async generatePersonalizedSuggestions(
    user: User,
    viewedContent: ContentItem[],
    availableContent: ContentItem[]
  ): Promise<ContentItem[]> {
    if (!this.initialized) {
      await this.initializeModel();
      if (!this.initialized) {
        // Fall back to basic sorting if AI is unavailable
        return this.generateRecommendations(user, availableContent);
      }
    }
    
    try {
      // If the user has no viewing history, use basic recommendations
      if (!viewedContent.length) {
        return this.generateRecommendations(user, availableContent);
      }

      // Predict interests based on viewed content
      const interests = await this.predictUserInterests(viewedContent);
      
      // Score available content based on interests and source
      const scoredContent = availableContent.map(content => {
        // Base score from source relevance
        let score = content.sourceRelevance[user.source] || 50;
        
        // Boost score based on matching interests
        const interestBoost = content.tags.reduce((boost, tag) => {
          const matchingInterests = interests.filter(interest => 
            interest.toLowerCase().includes(tag.toLowerCase()) ||
            tag.toLowerCase().includes(interest.toLowerCase())
          );
          return boost + (matchingInterests.length * 10);
        }, 0);
        
        return { content, score: score + interestBoost };
      });
      
      // Sort by score and return content
      return scoredContent
        .sort((a, b) => b.score - a.score)
        .map(item => item.content);
    } catch (error) {
      console.error('Error generating personalized suggestions:', error);
      return this.generateRecommendations(user, availableContent);
    }
  }

  /**
   * Generate a personalized content exploration path based on user's source and interests
   */  async generateExplorationPath(user: User, availableContent: ContentItem[]): Promise<ContentItem[]> {
    if (!this.initialized) {
      await this.initializeModel();
      if (!this.initialized) {
        return availableContent.slice(0, 3);
      }
    }

    try {
      // If user has preferences with interests, use them
      const userInterests = user.preferences?.interests || [];
      
      if (userInterests.length === 0) {
        // Without interests, just return source-relevant content
        const recommendations = await this.generateRecommendations(user, availableContent);
        return recommendations.slice(0, 3);
      }
      
      // Limit the number of content items to avoid token limits
      const limitedContent = availableContent.slice(0, 15);
      
      const interestsText = userInterests.join(', ');
      const sourceText = user.source;
      
      // Prepare a simplified version of content to reduce tokens
      const contentSummary = limitedContent.map(item => ({
        id: item.id,
        title: item.title,
        tags: item.tags.join(', '),
        relevance: item.sourceRelevance[user.source] || 0
      }));
      
      const parts = [{
        text: `
          I need to create an exploration path (a sequence of 3 content pieces) for a user with:
          - Source: ${sourceText}
          - Interests: ${interestsText}
          
          The goal is to gradually expand their knowledge from familiar to new topics.
          
          From the following content options, select the 3 pieces that would form the best
          exploration path, starting with something familiar and gradually introducing new concepts.
          
          Return only the IDs in a JSON array like this: ["id1", "id2", "id3"]
          
          Content options:
          ${JSON.stringify(contentSummary)}
        `
      }];
      
      const generationConfig = {
        temperature: 0.5,
        maxOutputTokens: 256,
      };
      
      // Set timeout for this operation
      const resultPromise = Promise.race([
        this.model.generateContent({
          contents: [{ role: 'user', parts }],
          generationConfig,
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Exploration path generation timed out')), 8000)
        )
      ]) as Promise<any>;
      
      const result = await resultPromise;
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON array from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const selectedIds = JSON.parse(jsonMatch[0]);
          
          // Map IDs back to content items and preserve the AI's ordering
          const explorationPath = selectedIds
            .map((id: string) => availableContent.find(item => item.id === id))
            .filter(Boolean);
            
          // If we didn't get enough items, supplement with regular recommendations
          if (explorationPath.length < 3) {
            const remainingRecommendations = await this.generateRecommendations(user, 
              availableContent.filter(item => !explorationPath.some((p: ContentItem) => p.id === item.id))
            );
            
            return [...explorationPath, ...remainingRecommendations].slice(0, 3);
          }
          
          return explorationPath;
        } catch (parseError) {
          console.warn('Failed to parse exploration path JSON:', parseError);
          throw new Error('Invalid exploration path response');
        }
      }
      
      // Fallback to regular recommendations if no valid JSON
      throw new Error('No valid JSON array found in response');
    } catch (error) {
      console.error('Error generating exploration path:', error);
      
      // Retry model initialization on specific errors
      if (error instanceof Error && 
          (error.message.includes('not initialized') || 
           error.message.includes('model') ||
           error.message.includes('429') || 
           error.message.includes('quota'))) {
        this.initialized = false;
        this.initializationAttempted = false;
        setTimeout(() => this.initializeModel(), 1000);
      }
      
      // Use fallback recommendation method
      const fallbackRecommendations = await this.generateRecommendations(user, availableContent);
      return fallbackRecommendations.slice(0, 3);
    }
  }

  /**
   * Generate personalized content summary tailored to the user's source and preferences
   */  async generatePersonalizedSummary(content: ContentItem, userSource: UserSource): Promise<string> {
    if (!this.initialized) {
      await this.initializeModel();
      if (!this.initialized) {
        return content.description;
      }
    }
    
    try {
      const parts = [{
        text: `
          Create a personalized summary of the following content for a user coming from ${userSource}.
          
          Title: ${content.title}
          Description: ${content.description}
          Tags: ${content.tags.join(', ')}
          
          The summary should:
          - Be around 2-3 sentences
          - Highlight aspects most relevant to ${userSource} users
          - Use a tone appropriate for ${userSource} (e.g., visual focus for Instagram, detailed for blog)
          - Not use quotation marks in the output
        `
      }];
      
      const generationConfig = {
        temperature: 0.7,
        maxOutputTokens: 200,
      };
      
      // Add a timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      
      try {
        const result = await this.model.generateContent({
          contents: [{ role: 'user', parts }],
          generationConfig,
        }, { abortSignal: controller.signal });
        
        clearTimeout(timeoutId);
        const response = await result.response;
        return response.text().replace(/["']/g, '').trim();
      } catch (abortError) {
        clearTimeout(timeoutId);
        if (abortError instanceof Error && abortError.name === 'AbortError') {
          console.warn('Summary generation timed out, using original description');
          return content.description;
        }
        throw abortError; // Re-throw for the outer catch
      }
    } catch (error) {
      console.error('Error generating personalized summary:', error);
      
      // Retry model initialization on certain errors
      if (error instanceof Error && 
          (error.message.includes('not initialized') || 
           error.message.includes('model') ||
           error.message.includes('429') || 
           error.message.includes('quota'))) {
        this.initialized = false;
        this.initializationAttempted = false;
        setTimeout(() => this.initializeModel(), 1000);
      }
      
      return content.description;
    }
  }
  // Clean up resources, particularly event listeners
  public cleanup() {
    // Clean up the NetInfo event listener if it exists
    if (this.netInfoUnsubscribe) {
      try {
        this.netInfoUnsubscribe();
        console.log('NetInfo event listener unsubscribed');
        this.netInfoUnsubscribe = null;
      } catch (error) {
        console.warn('Error unsubscribing from NetInfo:', error);
      }
    }
  }

  /**
   * Check if API is experiencing quota issues
   * UI components can use this to show appropriate messaging
   */
  public isExperiencingQuotaIssues(): boolean {
    return (this as any)._permanentlyFailed === true || 
           (this.retryCount >= this.maxRetries);
  }
  
  /**
   * Get current API status for UI display
   */
  public getApiStatus(): { 
    available: boolean; 
    initialized: boolean;
    quotaIssues: boolean;
    initializationAttempted: boolean;
  } {
    return {
      available: this.initialized,
      initialized: this.initialized,
      quotaIssues: this.isExperiencingQuotaIssues(),
      initializationAttempted: this.initializationAttempted
    };
  }

  /**
   * Static method to check if the API is likely experiencing quota issues
   * This can be called without an instance for UI components
   */
  static isLikelyHavingQuotaIssues(): boolean {
    // Check for persistent storage indication of quota issues
    try {
      // Create a way to check quota issues across app restarts
      const quotaIssueKey = 'gemini_quota_issue';
      
      // In a real implementation, we'd use AsyncStorage or another persistent store
      // For now we'll use a simple static variable
      if ((GeminiService as any)._lastQuotaIssueTime) {
        const lastIssueTime = (GeminiService as any)._lastQuotaIssueTime;
        const now = Date.now();
        
        // If we've seen a quota issue in the last hour, report it
        const ONE_HOUR = 60 * 60 * 1000;
        if (now - lastIssueTime < ONE_HOUR) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error checking quota issue status:', error);
      return false;
    }
  }
    /**
   * Record that we're experiencing quota issues
   * This will be accessible across all instances
   */
  static recordQuotaIssue(): void {
    (GeminiService as any)._lastQuotaIssueTime = Date.now();
  }

  /**
   * Record authentication/API key errors
   * This will be accessible across all instances
   */
  static recordAuthenticationError(errorMessage: string): void {
    (GeminiService as any)._lastAuthErrorTime = Date.now();
    (GeminiService as any)._authErrorMessage = errorMessage;
    (GeminiService as any)._hasAuthenticationError = true;
  }

  /**
   * Check if there are recent authentication errors
   */
  static hasRecentAuthenticationError(): boolean {
    const lastError = (GeminiService as any)._lastAuthErrorTime;
    if (!lastError) return false;
    
    // Consider auth errors recent for 24 hours
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    return lastError > twentyFourHoursAgo;
  }

  /**
   * Get the last authentication error message
   */
  static getAuthenticationErrorMessage(): string | null {
    return (GeminiService as any)._authErrorMessage || null;
  }

  /**
   * Clear authentication error status (for when user updates API key)
   */
  static clearAuthenticationError(): void {
    (GeminiService as any)._lastAuthErrorTime = null;
    (GeminiService as any)._authErrorMessage = null;
    (GeminiService as any)._hasAuthenticationError = false;
  }
}
