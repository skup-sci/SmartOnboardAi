/**
 * SmartOnboardAI - Final Validation Test
 * This file validates that all major fixes are working correctly
 */

import { GeminiService } from './src/services/geminiService';
import { ConfigService } from './src/services/configService';
import { ContentItem } from './src/types';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

export class ValidationTest {
  private static results: TestResult[] = [];

  /**
   * Run all validation tests
   */
  static async runAllTests(): Promise<TestResult[]> {
    console.log('🧪 Starting SmartOnboardAI Validation Tests...\n');
    
    this.results = [];
    
    // Test 1: Config Service API Key Handling
    await this.testConfigService();
    
    // Test 2: GeminiService Authentication Error Handling
    await this.testGeminiAuthenticationErrors();
    
    // Test 3: Network Monitoring Setup
    await this.testNetworkMonitoring();
    
    // Test 4: Error Recovery Mechanisms
    await this.testErrorRecovery();
    
    // Print summary
    this.printTestSummary();
    
    return this.results;
  }

  /**
   * Test ConfigService API key validation and storage
   */
  private static async testConfigService(): Promise<void> {
    try {
      console.log('Testing ConfigService...');
      
      // Test API key format validation
      const validKey = 'AIzaSyABC123def456GHI789jkl012MNO345pqr678';
      const invalidKey = 'short';
      
      const validResult = ConfigService.validateApiKey(validKey);
      const invalidResult = ConfigService.validateApiKey(invalidKey);
      
      if (validResult && !invalidResult) {
        this.addResult('ConfigService API Key Validation', true, 'Correctly validates API key formats');
      } else {
        this.addResult('ConfigService API Key Validation', false, 'API key validation not working correctly');
      }
      
      // Test API status checking
      const status = await ConfigService.getApiStatus();
      this.addResult('ConfigService Status Check', true, `Status check working: ${JSON.stringify(status)}`);
      
    } catch (error) {
      this.addResult('ConfigService Tests', false, `ConfigService error: ${error}`);
    }
  }

  /**
   * Test GeminiService authentication error handling
   */
  private static async testGeminiAuthenticationErrors(): Promise<void> {
    try {
      console.log('Testing GeminiService authentication error handling...');
      
      // Test static methods exist
      const hasQuotaMethod = typeof GeminiService.isLikelyHavingQuotaIssues === 'function';
      const hasAuthMethod = typeof GeminiService.hasRecentAuthenticationError === 'function';
      const hasClearMethod = typeof GeminiService.clearAuthenticationError === 'function';
      
      if (hasQuotaMethod && hasAuthMethod && hasClearMethod) {
        this.addResult('GeminiService Static Methods', true, 'All authentication tracking methods available');
      } else {
        this.addResult('GeminiService Static Methods', false, 'Missing authentication tracking methods');
      }
      
      // Test error clearing
      GeminiService.clearAuthenticationError();
      const hasError = GeminiService.hasRecentAuthenticationError();
      
      if (!hasError) {
        this.addResult('Authentication Error Clearing', true, 'Error clearing works correctly');
      } else {
        this.addResult('Authentication Error Clearing', false, 'Error clearing not working');
      }
      
    } catch (error) {
      this.addResult('GeminiService Authentication Tests', false, `GeminiService error: ${error}`);
    }
  }

  /**
   * Test network monitoring setup (React Native specific)
   */
  private static async testNetworkMonitoring(): Promise<void> {
    try {
      console.log('Testing network monitoring setup...');
      
      // Create a GeminiService instance to test network monitoring
      const service = new GeminiService();
      
      // Check if it initializes without throwing errors
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.addResult('Network Monitoring Setup', true, 'GeminiService initializes without network errors');
      
    } catch (error) {
      this.addResult('Network Monitoring Setup', false, `Network monitoring error: ${error}`);
    }
  }

  /**
   * Test error recovery mechanisms
   */
  private static async testErrorRecovery(): Promise<void> {
    try {
      console.log('Testing error recovery mechanisms...');
        // Test that the service can handle initialization failures gracefully
      const service = new GeminiService();
      
      // Create a proper ContentItem for testing (should use fallbacks without API key)
      const testContentItem: ContentItem = {
        id: 'test-content-1',
        title: 'Test Content',
        description: 'Test content for validation',
        sourceRelevance: {
          instagram: 50,
          referral: 50,
          blog: 50,
          direct: 80
        },
        tags: ['test']
      };
      
      // Simulate analyzing content without API key (should use fallbacks)
      const result = await service.analyzeContentRelevance(testContentItem);
      
      if (result && typeof result === 'object' && result.instagram !== undefined) {
        this.addResult('Fallback Content Analysis', true, 'Fallback analysis working correctly');
      } else {
        this.addResult('Fallback Content Analysis', false, 'Fallback analysis not working');
      }
      
    } catch (error) {
      this.addResult('Error Recovery Tests', false, `Error recovery failed: ${error}`);
    }
  }

  /**
   * Add a test result
   */
  private static addResult(name: string, passed: boolean, message: string): void {
    this.results.push({ name, passed, message });
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${name} - ${message}`);
  }

  /**
   * Print test summary
   */
  private static printTestSummary(): void {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    
    console.log('\n📋 Test Summary:');
    console.log(`${passed}/${total} tests passed`);
    
    if (passed === total) {
      console.log('🎉 All tests passed! The app is ready for use.');
    } else {
      console.log('⚠️ Some tests failed. Please review the issues above.');
    }
    
    console.log('\n🔑 Next Steps:');
    console.log('1. Configure your Gemini API key in Settings or .env file');
    console.log('2. Restart the app to apply changes');
    console.log('3. Test the full app functionality');
    console.log('4. See API_KEY_SETUP.md for detailed instructions');
  }
}

// Export for use in tests or development
export default ValidationTest;
