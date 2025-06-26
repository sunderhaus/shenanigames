import { Session, SessionMetadata, SessionManagerState, SessionExport } from '@/types/session-types';

// Storage keys
const SESSION_MANAGER_KEY = 'shenanigames-session-manager';
const SESSION_PREFIX = 'shenanigames-session-';
const VERSION_KEY = 'shenanigames-version';
const CURRENT_VERSION = '0.0.1'; // Keep consistent with existing version

// Check if we're running in the browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Get the storage key for a specific session
 */
const getSessionKey = (sessionId: string): string => {
  return `${SESSION_PREFIX}${sessionId}`;
};

/**
 * Save the session manager state to localStorage
 */
export const saveSessionManager = (state: SessionManagerState): void => {
  if (!isBrowser) return;

  try {
    const serializedState = JSON.stringify({
      ...state,
      // Don't store the full sessions in the manager, just metadata
      sessions: {}
    });
    localStorage.setItem(SESSION_MANAGER_KEY, serializedState);
  } catch (error) {
    console.error('Error saving session manager to localStorage:', error);
  }
};

/**
 * Load the session manager state from localStorage
 */
export const loadSessionManager = (): SessionManagerState | null => {
  if (!isBrowser) return null;

  try {
    const serializedState = localStorage.getItem(SESSION_MANAGER_KEY);
    if (!serializedState) {
      return null;
    }
    const state = JSON.parse(serializedState) as SessionManagerState;
    
    // Ensure sessions object exists (even if empty)
    state.sessions = {};
    
    return state;
  } catch (error) {
    console.error('Error loading session manager from localStorage:', error);
    return null;
  }
};

/**
 * Save a specific session to localStorage
 */
export const saveSession = (session: Session): void => {
  if (!isBrowser) return;

  try {
    // Update the lastModified timestamp
    const updatedSession = {
      ...session,
      metadata: {
        ...session.metadata,
        lastModified: new Date()
      }
    };

    const serializedSession = JSON.stringify(updatedSession);
    localStorage.setItem(getSessionKey(session.metadata.id), serializedSession);
  } catch (error) {
    console.error('Error saving session to localStorage:', error);
  }
};

/**
 * Load a specific session from localStorage
 */
export const loadSession = (sessionId: string): Session | null => {
  if (!isBrowser) return null;

  try {
    const serializedSession = localStorage.getItem(getSessionKey(sessionId));
    if (!serializedSession) {
      return null;
    }
    
    const session = JSON.parse(serializedSession) as Session;
    
    // Validate session structure
    if (!session || !session.metadata || !session.state) {
      console.warn(`Invalid session structure for session ${sessionId}`);
      return null;
    }
    
    // Validate required metadata fields
    if (!session.metadata.id || !session.metadata.name) {
      console.warn(`Session ${sessionId} missing required metadata fields`);
      return null;
    }
    
    // Convert date strings back to Date objects with fallbacks
    session.metadata.createdAt = session.metadata.createdAt 
      ? new Date(session.metadata.createdAt) 
      : new Date();
    session.metadata.lastModified = session.metadata.lastModified 
      ? new Date(session.metadata.lastModified) 
      : new Date();
    
    return session;
  } catch (error) {
    console.error(`Error loading session ${sessionId} from localStorage:`, error);
    // Remove corrupted session data
    localStorage.removeItem(getSessionKey(sessionId));
    return null;
  }
};

/**
 * Delete a specific session from localStorage
 */
export const deleteSession = (sessionId: string): void => {
  if (!isBrowser) return;

  try {
    localStorage.removeItem(getSessionKey(sessionId));
  } catch (error) {
    console.error('Error deleting session from localStorage:', error);
  }
};

/**
 * Get all session metadata from localStorage
 */
export const getAllSessionMetadata = (): SessionMetadata[] => {
  if (!isBrowser) return [];

  try {
    const sessionMetadata: SessionMetadata[] = [];
    
    // Iterate through all localStorage keys to find session keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(SESSION_PREFIX)) {
        const serializedSession = localStorage.getItem(key);
        if (serializedSession) {
          try {
            const session = JSON.parse(serializedSession) as Session;
            
            // Validate that the session has the required structure
            if (!session || !session.metadata) {
              console.warn(`Invalid session structure in key ${key}, skipping`);
              continue;
            }
            
            // Validate that required metadata fields exist
            if (!session.metadata.id || !session.metadata.name) {
              console.warn(`Session missing required metadata in key ${key}, skipping`);
              continue;
            }
            
            // Convert date strings back to Date objects with fallbacks
            session.metadata.createdAt = session.metadata.createdAt 
              ? new Date(session.metadata.createdAt) 
              : new Date();
            session.metadata.lastModified = session.metadata.lastModified 
              ? new Date(session.metadata.lastModified) 
              : new Date();
            
            sessionMetadata.push(session.metadata);
          } catch (parseError) {
            console.error(`Error parsing session from key ${key}:`, parseError);
            // Optionally remove corrupted session data
            localStorage.removeItem(key);
          }
        }
      }
    }
    
    // Sort by last modified (most recent first)
    return sessionMetadata.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
  } catch (error) {
    console.error('Error getting all session metadata:', error);
    return [];
  }
};

/**
 * Export a session to a JSON object
 */
export const exportSession = (sessionId: string): SessionExport | null => {
  const session = loadSession(sessionId);
  if (!session) return null;

  return {
    version: CURRENT_VERSION,
    exportedAt: new Date(),
    session
  };
};

/**
 * Import a session from a JSON object
 */
export const importSession = (exportData: SessionExport, newSessionId?: string): Session | null => {
  try {
    const session = { ...exportData.session };
    
    // Generate new ID if requested or if one already exists
    if (newSessionId || loadSession(session.metadata.id)) {
      const finalId = newSessionId || `imported-${Date.now()}`;
      session.metadata = {
        ...session.metadata,
        id: finalId,
        name: newSessionId ? session.metadata.name : `${session.metadata.name} (Imported)`,
        createdAt: new Date(),
        lastModified: new Date()
      };
    }
    
    return session;
  } catch (error) {
    console.error('Error importing session:', error);
    return null;
  }
};

/**
 * Bootstrap function for session-based system
 */
export const bootstrapSessions = (): void => {
  if (!isBrowser) return;

  try {
    const storedVersion = localStorage.getItem(VERSION_KEY);
    
    // If this is a version update, handle migration
    if (storedVersion !== CURRENT_VERSION) {
      console.log(`App version changed from ${storedVersion || 'none'} to ${CURRENT_VERSION}.`);
      
      // Check if we have old-style state to migrate
      const oldStateKey = 'shenanigames-state';
      const oldState = localStorage.getItem(oldStateKey);
      
      if (oldState && !storedVersion) {
        console.log('Migrating old state to session-based system...');
        // The migration will be handled by the session manager
        // We'll keep the old state for now and let the session manager decide what to do
      } else if (storedVersion !== CURRENT_VERSION) {
        console.log('Version mismatch, but no migration needed.');
      }
      
      // Set the new version
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      console.log('Session system bootstrapped successfully.');
    }
  } catch (error) {
    console.error('Error during session bootstrap:', error);
  }
};

/**
 * Force clear all session data (useful for development/testing)
 */
export const forceResetSessions = (): void => {
  if (!isBrowser) return;
  
  try {
    // Remove session manager
    localStorage.removeItem(SESSION_MANAGER_KEY);
    
    // Remove all individual sessions
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(SESSION_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Remove version key
    localStorage.removeItem(VERSION_KEY);
    
    console.log('Forced reset: All session data cleared.');
  } catch (error) {
    console.error('Error during force reset:', error);
  }
};

/**
 * Get storage usage statistics
 */
export const getStorageStats = (): { totalSessions: number; totalSize: number } => {
  if (!isBrowser) return { totalSessions: 0, totalSize: 0 };

  try {
    let totalSessions = 0;
    let totalSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(SESSION_PREFIX)) {
        totalSessions++;
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
    }

    return { totalSessions, totalSize };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return { totalSessions: 0, totalSize: 0 };
  }
};
