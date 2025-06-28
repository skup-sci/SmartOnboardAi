import * as Linking from 'expo-linking';
import { UserSource } from '../types';

/**
 * Utility to detect the source of the user
 * This is a simplified version - in a real app, this would be more comprehensive
 */
export const detectUserSource = async (): Promise<UserSource> => {
  try {
    // Get the URL that opened the app
    const initialURL = await Linking.getInitialURL();
    
    if (!initialURL) return 'direct';
    
    // Parse the URL to extract source information
    const url = new URL(initialURL);
    
    // Check for UTM parameters or specific paths
    const utmSource = url.searchParams.get('utm_source');
    
    if (utmSource) {
      if (utmSource.includes('instagram')) return 'instagram';
      if (utmSource.includes('referral')) return 'referral';
      if (utmSource.includes('blog')) return 'blog';
    }
    
    // Check for specific paths or domains
    if (url.hostname.includes('instagram')) return 'instagram';
    if (url.pathname.includes('referral') || url.searchParams.has('ref')) return 'referral';
    if (url.hostname.includes('blog') || url.pathname.includes('blog')) return 'blog';
    
    // Default to unknown if we can't determine the source
    return 'unknown';
  } catch (error) {
    console.error('Error detecting user source:', error);
    return 'unknown';
  }
};

/**
 * Get appropriate content based on user source
 * This would typically involve more complex logic or API calls
 */
export const getSourceAdaptedContent = (source: UserSource, allContent: any[]) => {
  // Sort content by relevance to the user's source
  return [...allContent].sort((a, b) => {
    const aRelevance = a.sourceRelevance[source] || 0;
    const bRelevance = b.sourceRelevance[source] || 0;
    return bRelevance - aRelevance;
  });
};

/**
 * Generate a deep link for sharing
 */
export const generateDeepLink = (screen: string, params: Record<string, string> = {}, source: UserSource = 'referral') => {
  let url = `smartonboardai://${screen}`;
  
  // Add parameters
  const urlParams = new URLSearchParams({
    ...params,
    utm_source: source
  });
  
  return `${url}?${urlParams.toString()}`;
};
