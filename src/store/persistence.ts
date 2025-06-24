import { SessionState } from '@/types/types';

// Storage key for the game state
const STORAGE_KEY = 'shenanigames-state';

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
