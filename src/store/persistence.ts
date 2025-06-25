import { SessionState } from '@/types/types';

// Storage key for the game state
const STORAGE_KEY = 'shenanigames-state';
// Storage key for the app version/bootstrap flag
const VERSION_KEY = 'shenanigames-version';
// Current app version - increment this when you want to clear localStorage
const CURRENT_VERSION = '0.0.1';

// Check if we're running in the browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Save the current state to localStorage
 * @param state The current application state
 */
export const saveState = (state: SessionState): void => {
  if (!isBrowser) return;

  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (error) {
    console.error('Error saving state to localStorage:', error);
  }
};

/**
 * Load the state from localStorage
 * @returns The saved state or null if no state is saved
 */
export const loadState = (): SessionState | null => {
  if (!isBrowser) return null;

  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (!serializedState) {
      return null;
    }
    return JSON.parse(serializedState);
  } catch (error) {
    console.error('Error loading state from localStorage:', error);
    return null;
  }
};

/**
 * Clear the saved state from localStorage
 */
export const clearState = (): void => {
  if (!isBrowser) return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing state from localStorage:', error);
  }
};

/**
 * Check if there's saved state in localStorage
 * @returns True if there's saved state, false otherwise
 */
export const hasSavedState = (): boolean => {
  if (!isBrowser) return false;

  try {
    return localStorage.getItem(STORAGE_KEY) !== null;
  } catch (error) {
    console.error('Error checking for saved state in localStorage:', error);
    return false;
  }
};

/**
 * Bootstrap function to handle localStorage version management
 * This should be called once when the app initializes
 * It will clear localStorage if the version has changed
 */
export const bootstrap = (): void => {
  if (!isBrowser) return;

  try {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    
    // If no version is stored, or if the version has changed, clear all data
    if (storedVersion !== CURRENT_VERSION) {
      console.log(`App version changed from ${storedVersion || 'none'} to ${CURRENT_VERSION}. Clearing localStorage...`);
      
      // Clear all shenanigames-related data
      localStorage.removeItem(STORAGE_KEY);
      
      // Set the new version
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      
      console.log('localStorage cleared and version updated.');
    } else {
      console.log(`App version ${CURRENT_VERSION} matches stored version. Keeping existing data.`);
    }
  } catch (error) {
    console.error('Error during bootstrap:', error);
  }
};

/**
 * Get the current app version
 * @returns The current app version
 */
export const getCurrentVersion = (): string => {
  return CURRENT_VERSION;
};

/**
 * Get the stored version from localStorage
 * @returns The stored version or null if not found
 */
export const getStoredVersion = (): string | null => {
  if (!isBrowser) return null;
  
  try {
    return localStorage.getItem(VERSION_KEY);
  } catch (error) {
    console.error('Error getting stored version:', error);
    return null;
  }
};

/**
 * Force clear all localStorage data (useful for development/testing)
 */
export const forceReset = (): void => {
  if (!isBrowser) return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(VERSION_KEY);
    console.log('Forced reset: All localStorage data cleared.');
  } catch (error) {
    console.error('Error during force reset:', error);
  }
};
