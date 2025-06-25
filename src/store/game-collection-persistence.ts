import { GameCollectionState, CollectionItem, CollectionPlayer, CollectionExport } from '@/types/game-collection-types';

// Storage keys
const GAME_COLLECTION_KEY = 'shenanigames-game-collections';
const GAME_COLLECTION_VERSION_KEY = 'shenanigames-game-collections-version';
const CURRENT_VERSION = '1.2.0';

// Check if we're running in the browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Save the game collection state to localStorage
 */
export const saveGameCollections = (state: GameCollectionState): void => {
  if (!isBrowser) return;

  try {
    const serializedState = JSON.stringify({
      ...state,
      lastModified: new Date()
    });
    localStorage.setItem(GAME_COLLECTION_KEY, serializedState);
    localStorage.setItem(GAME_COLLECTION_VERSION_KEY, CURRENT_VERSION);
  } catch (error) {
    console.error('Error saving game ownership to localStorage:', error);
  }
};

/**
 * Load the game collection state from localStorage
 */
export const loadGameCollections = (): GameCollectionState | null => {
  if (!isBrowser) return null;

  try {
    const serializedState = localStorage.getItem(GAME_COLLECTION_KEY);
    if (!serializedState) {
      return null;
    }
    
    const state = JSON.parse(serializedState) as GameCollectionState;
    
    // Convert date strings back to Date objects
    state.lastModified = new Date(state.lastModified);
    
    // Convert item dateAcquired strings back to Date objects
    Object.values(state.items).forEach(item => {
      if (item.dateAcquired) {
        item.dateAcquired = new Date(item.dateAcquired);
      }
    });
    
    // Rebuild derived lists to ensure consistency
    state.playerList = Object.values(state.players).sort((a, b) => a.name.localeCompare(b.name));
    state.itemList = Object.values(state.items).sort((a, b) => a.id.localeCompare(b.id));
    state.totalItems = state.itemList.length;
    
    return state;
  } catch (error) {
    console.error('Error loading game collections from localStorage:', error);
    return null;
  }
};

/**
 * Add a single collection item
 */
export const saveCollectionItem = (item: CollectionItem): void => {
  if (!isBrowser) return;

  const currentState = loadGameCollections() || createEmptyCollections();
  currentState.items[item.id] = item;
  currentState.itemList = Object.values(currentState.items).sort((a, b) => a.id.localeCompare(b.id));
  currentState.totalItems = currentState.itemList.length;
  
  saveGameCollections(currentState);
};

/**
 * Remove a collection item
 */
export const removeCollectionItem = (itemId: string): void => {
  if (!isBrowser) return;

  const currentState = loadGameCollections();
  if (!currentState || !currentState.items[itemId]) return;

  delete currentState.items[itemId];
  currentState.itemList = Object.values(currentState.items).sort((a, b) => a.id.localeCompare(b.id));
  currentState.totalItems = currentState.itemList.length;
  
  saveGameCollections(currentState);
};

/**
 * Add or update a collection player
 */
export const saveCollectionPlayer = (player: CollectionPlayer): void => {
  if (!isBrowser) return;

  const currentState = loadGameCollections() || createEmptyCollections();
  currentState.players[player.id] = player;
  currentState.playerList = Object.values(currentState.players).sort((a, b) => a.name.localeCompare(b.name));
  
  saveGameCollections(currentState);
};

/**
 * Remove a player and all their collection items
 */
export const removeCollectionPlayer = (playerId: string): void => {
  if (!isBrowser) return;

  const currentState = loadGameCollections();
  if (!currentState || !currentState.players[playerId]) return;

  // Remove the player
  delete currentState.players[playerId];
  
  // Remove all items owned by this player
  Object.keys(currentState.items).forEach(itemId => {
    if (currentState.items[itemId].playerId === playerId) {
      delete currentState.items[itemId];
    }
  });
  
  // Rebuild derived state
  currentState.playerList = Object.values(currentState.players).sort((a, b) => a.name.localeCompare(b.name));
  currentState.itemList = Object.values(currentState.items).sort((a, b) => a.id.localeCompare(b.id));
  currentState.totalItems = currentState.itemList.length;
  
  saveGameCollections(currentState);
};

/**
 * Create an empty collection state
 */
export const createEmptyCollections = (): GameCollectionState => {
  return {
    players: {},
    playerList: [],
    items: {},
    itemList: [],
    totalItems: 0,
    lastModified: new Date()
  };
};

/**
 * Import collection items from an array
 */
export const importCollectionItems = (items: CollectionItem[], overwriteExisting = false): number => {
  if (!isBrowser) return 0;

  const currentState = loadGameCollections() || createEmptyCollections();
  let importedCount = 0;
  
  items.forEach(item => {
    // Check if item already exists
    if (currentState.items[item.id] && !overwriteExisting) {
      return; // Skip existing items if not overwriting
    }
    
    currentState.items[item.id] = {
      ...item,
      dateAcquired: currentState.items[item.id]?.dateAcquired || new Date() // Preserve original date if updating
    };
    importedCount++;
  });
  
  // Rebuild derived state
  currentState.itemList = Object.values(currentState.items).sort((a, b) => a.id.localeCompare(b.id));
  currentState.totalItems = currentState.itemList.length;
  
  saveGameCollections(currentState);
  return importedCount;
};

/**
 * Export the collection data to a JSON object
 */
export const exportCollections = (): CollectionExport | null => {
  const state = loadGameCollections();
  if (!state) return null;

  return {
    version: CURRENT_VERSION,
    exportedAt: new Date(),
    collections: state
  };
};

/**
 * Import collection data from a JSON object
 */
export const importCollections = (exportData: CollectionExport, overwriteExisting = false): boolean => {
  try {
    const importedItems = Object.values(exportData.collections.items);
    const importedPlayers = Object.values(exportData.collections.players);
    
    // First import players
    const currentState = loadGameCollections() || createEmptyCollections();
    importedPlayers.forEach(player => {
      if (!currentState.players[player.id] || overwriteExisting) {
        currentState.players[player.id] = player;
      }
    });
    
    // Then import items
    importCollectionItems(importedItems, overwriteExisting);
    
    return true;
  } catch (error) {
    console.error('Error importing collections:', error);
    return false;
  }
};

/**
 * Clear all collection data
 */
export const clearCollections = (): void => {
  if (!isBrowser) return;
  
  try {
    localStorage.removeItem(GAME_COLLECTION_KEY);
    localStorage.removeItem(GAME_COLLECTION_VERSION_KEY);
  } catch (error) {
    console.error('Error clearing collections:', error);
  }
};

/**
 * Bootstrap function for collection system
 */
export const bootstrapCollections = (): void => {
  if (!isBrowser) return;

  try {
    const storedVersion = localStorage.getItem(GAME_COLLECTION_VERSION_KEY);
    
    // If this is a version update, handle migration
    if (storedVersion !== CURRENT_VERSION) {
      console.log(`Game Collections version changed from ${storedVersion || 'none'} to ${CURRENT_VERSION}.`);
      
      // For version 1.1.0, clear ALL old data since game IDs have changed format
      // This includes versions 1.0.0 and any existing data
      if (!storedVersion || storedVersion !== CURRENT_VERSION) {
        console.log('Clearing all collection data due to game ID format changes.');
        clearCollections();
      }
      
      localStorage.setItem(GAME_COLLECTION_VERSION_KEY, CURRENT_VERSION);
      console.log('Game Collections bootstrapped successfully.');
    }
  } catch (error) {
    console.error('Error during collections bootstrap:', error);
  }
};
