import { LibraryGame, GameLibraryState, GameLibraryExport } from '@/types/game-library-types';

// Storage keys
const GAME_LIBRARY_KEY = 'shenanigames-game-library';
const GAME_LIBRARY_VERSION_KEY = 'shenanigames-game-library-version';
const CURRENT_VERSION = '1.1.0';

// Check if we're running in the browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Save the game library state to localStorage
 */
export const saveGameLibrary = (state: GameLibraryState): void => {
  if (!isBrowser) return;

  try {
    const serializedState = JSON.stringify({
      ...state,
      lastModified: new Date()
    });
    localStorage.setItem(GAME_LIBRARY_KEY, serializedState);
    localStorage.setItem(GAME_LIBRARY_VERSION_KEY, CURRENT_VERSION);
  } catch (error) {
    console.error('Error saving game library to localStorage:', error);
  }
};

/**
 * Load the game library state from localStorage
 */
export const loadGameLibrary = (): GameLibraryState | null => {
  if (!isBrowser) return null;

  try {
    const serializedState = localStorage.getItem(GAME_LIBRARY_KEY);
    if (!serializedState) {
      return null;
    }
    
    const state = JSON.parse(serializedState) as GameLibraryState;
    
    // Convert date strings back to Date objects
    state.lastModified = new Date(state.lastModified);
    
    // Convert game dateAdded strings back to Date objects
    Object.values(state.games).forEach(game => {
      game.dateAdded = new Date(game.dateAdded);
    });
    
    // Rebuild gameList from games object to ensure consistency
    state.gameList = Object.values(state.games).sort((a, b) => a.title.localeCompare(b.title));
    state.totalGames = state.gameList.length;
    
    return state;
  } catch (error) {
    console.error('Error loading game library from localStorage:', error);
    return null;
  }
};

/**
 * Add a single game to the library
 */
export const saveGameToLibrary = (game: LibraryGame): void => {
  if (!isBrowser) return;

  const currentState = loadGameLibrary() || createEmptyGameLibrary();
  currentState.games[game.id] = game;
  currentState.gameList = Object.values(currentState.games).sort((a, b) => a.title.localeCompare(b.title));
  currentState.totalGames = currentState.gameList.length;
  
  saveGameLibrary(currentState);
};

/**
 * Remove a game from the library
 */
export const removeGameFromLibrary = (gameId: string): void => {
  if (!isBrowser) return;

  const currentState = loadGameLibrary();
  if (!currentState || !currentState.games[gameId]) return;

  delete currentState.games[gameId];
  currentState.gameList = Object.values(currentState.games).sort((a, b) => a.title.localeCompare(b.title));
  currentState.totalGames = currentState.gameList.length;
  
  saveGameLibrary(currentState);
};

/**
 * Create an empty game library state
 */
export const createEmptyGameLibrary = (): GameLibraryState => {
  return {
    games: {},
    gameList: [],
    totalGames: 0,
    lastModified: new Date()
  };
};

/**
 * Import games from an array and add them to the library
 */
export const importGamesToLibrary = (games: LibraryGame[], overwriteExisting = false): number => {
  if (!isBrowser) return 0;

  const currentState = loadGameLibrary() || createEmptyGameLibrary();
  let importedCount = 0;
  
  // Create a set of existing game titles for efficient duplicate checking
  const existingTitles = new Set(
    Object.values(currentState.games).map(game => game.title.toLowerCase().trim())
  );
  
  games.forEach(game => {
    // Check if game already exists by ID
    if (currentState.games[game.id] && !overwriteExisting) {
      return; // Skip existing games if not overwriting
    }
    
    // Check if game already exists by title (case-insensitive)
    const gameTitle = game.title.toLowerCase().trim();
    if (existingTitles.has(gameTitle) && !overwriteExisting) {
      return; // Skip games with duplicate titles if not overwriting
    }
    
    currentState.games[game.id] = {
      ...game,
      dateAdded: currentState.games[game.id]?.dateAdded || new Date() // Preserve original date if updating
    };
    
    // Add the new title to our set to prevent duplicates within the import batch
    existingTitles.add(gameTitle);
    
    importedCount++;
  });
  
  // Rebuild derived state
  currentState.gameList = Object.values(currentState.games).sort((a, b) => a.title.localeCompare(b.title));
  currentState.totalGames = currentState.gameList.length;
  
  saveGameLibrary(currentState);
  return importedCount;
};

/**
 * Export the game library to a JSON object
 */
export const exportGameLibrary = (): GameLibraryExport | null => {
  const state = loadGameLibrary();
  if (!state) return null;

  return {
    version: CURRENT_VERSION,
    exportedAt: new Date(),
    library: state
  };
};

/**
 * Import a game library from a JSON object
 */
export const importGameLibrary = (exportData: GameLibraryExport, overwriteExisting = false): boolean => {
  try {
    const importedGames = Object.values(exportData.library.games);
    importGamesToLibrary(importedGames, overwriteExisting);
    return true;
  } catch (error) {
    console.error('Error importing game library:', error);
    return false;
  }
};

/**
 * Clear all games from the library
 */
export const clearGameLibrary = (): void => {
  if (!isBrowser) return;
  
  try {
    localStorage.removeItem(GAME_LIBRARY_KEY);
    localStorage.removeItem(GAME_LIBRARY_VERSION_KEY);
  } catch (error) {
    console.error('Error clearing game library:', error);
  }
};

/**
 * Get storage statistics for the game library
 */
export const getGameLibraryStorageStats = (): { totalGames: number; storageSize: number } => {
  if (!isBrowser) return { totalGames: 0, storageSize: 0 };

  try {
    const serializedState = localStorage.getItem(GAME_LIBRARY_KEY);
    const storageSize = serializedState ? serializedState.length : 0;
    
    const state = loadGameLibrary();
    const totalGames = state ? state.totalGames : 0;
    
    return { totalGames, storageSize };
  } catch (error) {
    console.error('Error getting game library storage stats:', error);
    return { totalGames: 0, storageSize: 0 };
  }
};

/**
 * Bootstrap function for game library system
 */
export const bootstrapGameLibrary = (): void => {
  if (!isBrowser) return;

  try {
    const storedVersion = localStorage.getItem(GAME_LIBRARY_VERSION_KEY);
    
    // If this is a version update, handle migration
    if (storedVersion !== CURRENT_VERSION) {
      console.log(`Game Library version changed from ${storedVersion || 'none'} to ${CURRENT_VERSION}.`);
      
      // Clear existing library to force reinitialize with new default games
      clearGameLibrary();
      
      localStorage.setItem(GAME_LIBRARY_VERSION_KEY, CURRENT_VERSION);
      console.log('Game Library cleared and will be reinitialized with new default games.');
    }
  } catch (error) {
    console.error('Error during game library bootstrap:', error);
  }
};
