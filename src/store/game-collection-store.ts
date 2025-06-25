import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  GameCollectionState, 
  CollectionItem, 
  CollectionPlayer, 
  CollectionStats,
  GameAvailability,
  SessionAvailability,
  CollectionImportResult,
  CollectionCSVMapping,
  CollectionImportOptions
} from '@/types/game-collection-types';
import { 
  saveGameCollections,
  loadGameCollections,
  saveCollectionItem,
  removeCollectionItem,
  saveCollectionPlayer,
  removeCollectionPlayer,
  createEmptyCollections,
  exportCollections,
  importCollections,
  clearCollections,
  bootstrapCollections
} from './game-collection-persistence';

// Helper function to create a new collection item
const createCollectionItem = (data: Partial<CollectionItem>): CollectionItem => {
  return {
    id: uuidv4(),
    gameId: '',
    playerId: '',
    condition: 'good',
    dateAcquired: new Date(),
    ...data
  };
};

// Helper function to create a new collection player
const createCollectionPlayer = (data: Partial<CollectionPlayer>): CollectionPlayer => {
  return {
    id: uuidv4(),
    name: '',
    icon: '🎮',
    isActive: true,
    ...data
  };
};

// Default collection data for Ellijay template
const createDefaultCollections = (): GameCollectionState => {
  const players: Record<string, CollectionPlayer> = {
    'jonny': { id: 'jonny', name: 'Jonny', icon: '🐯', isActive: true },
    'jourdan': { id: 'jourdan', name: 'Jourdan', icon: '🐼', isActive: true },
    'chris': { id: 'chris', name: 'Chris', icon: '🦁', isActive: true },
    'matthew': { id: 'matthew', name: 'Matthew', icon: '🦊', isActive: true },
    'felipe': { id: 'felipe', name: 'Felipe', icon: '🐻', isActive: true },
    'paul': { id: 'paul', name: 'Paul', icon: '🦉', isActive: true },
    'cam': { id: 'cam', name: 'Cam', icon: '🐺', isActive: true }
  };

  // Start with no items - users will add them via the UI and they'll reference actual game IDs
  const items: Record<string, CollectionItem> = {};

  const playerList = Object.values(players).sort((a, b) => a.name.localeCompare(b.name));
  const itemList = Object.values(items).sort((a, b) => a.id.localeCompare(b.id));

  return {
    players,
    playerList,
    items,
    itemList,
    totalItems: itemList.length,
    lastModified: new Date()
  };
};

// Load initial collection state
const loadInitialCollections = (): GameCollectionState => {
  // Bootstrap the collection system (this will clear old data if version changed)
  bootstrapCollections();
  
  // After bootstrap, check if we have valid data
  const savedState = loadGameCollections();
  if (savedState) {
    // Verify the data doesn't have broken game references
    // If all items have empty or invalid gameIds, clear and start fresh
    const hasValidItems = Object.values(savedState.items).some(item => 
      item.gameId && item.gameId.length > 10 // UUIDs are longer than 10 chars
    );
    
    if (Object.keys(savedState.items).length > 0 && !hasValidItems) {
      console.log('Found collection items with invalid game IDs, clearing data...');
      clearCollections();
      // Fall through to create fresh state
    } else {
      return savedState;
    }
  }

  // Create default collection data if no saved data exists or data was cleared
  const defaultState = createDefaultCollections();
  saveGameCollections(defaultState);
  return defaultState;
};

const initialState = loadInitialCollections();

// Game Collection Store
interface GameCollectionStore extends GameCollectionState {
  // Core operations
  addCollectionItem: (item: Partial<CollectionItem>) => string;
  updateCollectionItem: (itemId: string, updates: Partial<CollectionItem>) => void;
  deleteCollectionItem: (itemId: string) => void;
  
  // Player management
  addPlayer: (player: Partial<CollectionPlayer>) => string;
  updatePlayer: (playerId: string, updates: Partial<CollectionPlayer>) => void;
  deletePlayer: (playerId: string) => void;
  
  // Collection queries
  getPlayerItems: (playerId: string) => CollectionItem[];
  getGameItems: (gameId: string) => CollectionItem[];
  getGameOwners: (gameId: string) => CollectionPlayer[];
  isGameOwned: (gameId: string, playerId?: string) => boolean;
  
  // Session availability
  getSessionAvailability: (sessionPlayerIds: string[]) => SessionAvailability;
  getAvailableGamesForSession: (sessionPlayerIds: string[]) => GameAvailability[];
  
  // Statistics
  getStats: () => CollectionStats;
  
  // Import/Export
  exportToCSV: () => string;
  exportToJSON: () => string | null;
  importFromCSV: (csvData: string, mapping: CollectionCSVMapping, options: CollectionImportOptions) => CollectionImportResult;
  importFromJSON: (jsonData: string, overwrite?: boolean) => boolean;
  
  // Utility functions
  refreshCollections: () => void;
  clearAllCollections: () => void;
  syncPlayersWithSession: (sessionPlayers: { id: string; name: string; icon: string }[]) => void;
}

export const useGameCollections = create<GameCollectionStore>((set, get) => ({
  ...initialState,

  // Add a new collection item
  addCollectionItem: (itemData: Partial<CollectionItem>) => {
    const item = createCollectionItem(itemData);
    saveCollectionItem(item);
    
    set(state => {
      const newItems = { ...state.items, [item.id]: item };
      const newItemList = Object.values(newItems).sort((a, b) => a.id.localeCompare(b.id));
      
      return {
        ...state,
        items: newItems,
        itemList: newItemList,
        totalItems: newItemList.length,
        lastModified: new Date()
      };
    });
    
    return item.id;
  },

  // Update an existing collection item
  updateCollectionItem: (itemId: string, updates: Partial<CollectionItem>) => {
    const state = get();
    const existingItem = state.items[itemId];
    if (!existingItem) return;

    const updatedItem = { ...existingItem, ...updates };
    saveCollectionItem(updatedItem);
    
    set(state => {
      const newItems = { ...state.items, [itemId]: updatedItem };
      const newItemList = Object.values(newItems).sort((a, b) => a.id.localeCompare(b.id));
      
      return {
        ...state,
        items: newItems,
        itemList: newItemList,
        lastModified: new Date()
      };
    });
  },

  // Delete a collection item
  deleteCollectionItem: (itemId: string) => {
    removeCollectionItem(itemId);
    
    set(state => {
      const newItems = { ...state.items };
      delete newItems[itemId];
      const newItemList = Object.values(newItems).sort((a, b) => a.id.localeCompare(b.id));
      
      return {
        ...state,
        items: newItems,
        itemList: newItemList,
        totalItems: newItemList.length,
        lastModified: new Date()
      };
    });
  },

  // Add a new player
  addPlayer: (playerData: Partial<CollectionPlayer>) => {
    const player = createCollectionPlayer(playerData);
    saveCollectionPlayer(player);
    
    set(state => {
      const newPlayers = { ...state.players, [player.id]: player };
      const newPlayerList = Object.values(newPlayers).sort((a, b) => a.name.localeCompare(b.name));
      
      return {
        ...state,
        players: newPlayers,
        playerList: newPlayerList,
        lastModified: new Date()
      };
    });
    
    return player.id;
  },

  // Update an existing player
  updatePlayer: (playerId: string, updates: Partial<CollectionPlayer>) => {
    const state = get();
    const existingPlayer = state.players[playerId];
    if (!existingPlayer) return;

    const updatedPlayer = { ...existingPlayer, ...updates };
    saveCollectionPlayer(updatedPlayer);
    
    set(state => {
      const newPlayers = { ...state.players, [playerId]: updatedPlayer };
      const newPlayerList = Object.values(newPlayers).sort((a, b) => a.name.localeCompare(b.name));
      
      return {
        ...state,
        players: newPlayers,
        playerList: newPlayerList,
        lastModified: new Date()
      };
    });
  },

  // Delete a player and all their items
  deletePlayer: (playerId: string) => {
    removeCollectionPlayer(playerId);
    
    set(state => {
      const newPlayers = { ...state.players };
      delete newPlayers[playerId];
      
      const newItems = { ...state.items };
      Object.keys(newItems).forEach(itemId => {
        if (newItems[itemId].playerId === playerId) {
          delete newItems[itemId];
        }
      });
      
      const newPlayerList = Object.values(newPlayers).sort((a, b) => a.name.localeCompare(b.name));
      const newItemList = Object.values(newItems).sort((a, b) => a.id.localeCompare(b.id));
      
      return {
        ...state,
        players: newPlayers,
        playerList: newPlayerList,
        items: newItems,
        itemList: newItemList,
        totalItems: newItemList.length,
        lastModified: new Date()
      };
    });
  },

  // Get all items owned by a player
  getPlayerItems: (playerId: string) => {
    const state = get();
    return state.itemList.filter(item => item.playerId === playerId);
  },

  // Get all items of a specific game
  getGameItems: (gameId: string) => {
    const state = get();
    return state.itemList.filter(item => item.gameId === gameId);
  },

  // Get all players who own a specific game
  getGameOwners: (gameId: string) => {
    const state = get();
    const ownerIds = new Set(
      state.itemList
        .filter(item => item.gameId === gameId)
        .map(item => item.playerId)
    );
    
    return Array.from(ownerIds)
      .map(playerId => state.players[playerId])
      .filter(Boolean);
  },

  // Check if a game is owned (optionally by a specific player)
  isGameOwned: (gameId: string, playerId?: string) => {
    const state = get();
    return state.itemList.some(item => 
      item.gameId === gameId && (!playerId || item.playerId === playerId)
    );
  },

  // Get session availability for all games
  getSessionAvailability: (sessionPlayerIds: string[]) => {
    const state = get();
    
    // Get all unique game IDs from items
    const allGameIds = new Set(state.itemList.map(item => item.gameId));
    
    const availableGames: Record<string, GameAvailability> = {};
    const unavailableGames: string[] = [];
    
    Array.from(allGameIds).forEach(gameId => {
      const items = state.itemList.filter(item => item.gameId === gameId);
      const sessionItems = items.filter(item => sessionPlayerIds.includes(item.playerId));
      
      if (sessionItems.length > 0) {
        // Game is available - count items per player
        const ownerCounts: Record<string, number> = {};
        sessionItems.forEach(item => {
          ownerCounts[item.playerId] = (ownerCounts[item.playerId] || 0) + 1;
        });
        
        const collectors = Object.entries(ownerCounts).map(([playerId, itemCount]) => ({
          playerId,
          playerName: state.players[playerId]?.name || 'Unknown Player',
          itemCount
        }));
        
        availableGames[gameId] = {
          gameId,
          isAvailable: true,
          totalItems: sessionItems.length,
          collectors
        };
      } else {
        // Game is not available
        unavailableGames.push(gameId);
      }
    });
    
    return {
      sessionPlayers: sessionPlayerIds,
      availableGames,
      unavailableGames
    };
  },

  // Get only available games for a session
  getAvailableGamesForSession: (sessionPlayerIds: string[]) => {
    const availability = get().getSessionAvailability(sessionPlayerIds);
    return Object.values(availability.availableGames);
  },

  // Get collection statistics
  getStats: () => {
    const state = get();
    
    const stats: CollectionStats = {
      totalPlayers: state.playerList.length,
      activePlayers: state.playerList.filter(p => p.isActive).length,
      totalItems: state.totalItems,
      uniqueGamesInCollections: new Set(state.itemList.map(c => c.gameId)).size,
      averageItemsPerPlayer: state.playerList.length > 0 ? state.totalItems / state.playerList.length : 0,
      topCollectors: [],
      gameDistribution: {}
    };
    
    // Calculate player item counts
    const playerCounts: Record<string, number> = {};
    state.itemList.forEach(item => {
      playerCounts[item.playerId] = (playerCounts[item.playerId] || 0) + 1;
    });
    
    // Top collectors
    stats.topCollectors = Object.entries(playerCounts)
      .map(([playerId, gameCount]) => ({
        playerId,
        playerName: state.players[playerId]?.name || 'Unknown Player',
        gameCount
      }))
      .sort((a, b) => b.gameCount - a.gameCount)
      .slice(0, 10);
    
    // Game distribution
    state.itemList.forEach(item => {
      stats.gameDistribution[item.gameId] = (stats.gameDistribution[item.gameId] || 0) + 1;
    });
    
    return stats;
  },

  // Export to CSV
  exportToCSV: () => {
    const state = get();
    const headers = ['Player Name', 'Game Title', 'Condition', 'Notes', 'Date Acquired'];
    
    const rows = state.itemList.map(item => {
      const player = state.players[item.playerId];
      return [
        `"${player?.name || 'Unknown Player'}"`,
        `"${item.gameId}"`, // Will need to resolve to game title
        `"${item.condition || 'good'}"`,
        `"${item.notes || ''}"`,
        `"${item.dateAcquired ? item.dateAcquired.toISOString().split('T')[0] : ''}"`
      ];
    });
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  },

  // Export to JSON
  exportToJSON: () => {
    const exportData = exportCollections();
    return exportData ? JSON.stringify(exportData, null, 2) : null;
  },

  // Import from CSV
  importFromCSV: (csvData: string, mapping: CollectionCSVMapping, options: CollectionImportOptions) => {
    // This would need to be implemented based on the specific CSV format
    // For now, return a placeholder
    return {
      success: false,
      imported: 0,
      errors: ['CSV import not yet implemented']
    };
  },

  // Import from JSON
  importFromJSON: (jsonData: string, overwrite = false) => {
    try {
      const exportData = JSON.parse(jsonData);
      const success = importCollections(exportData, overwrite);
      if (success) {
        get().refreshCollections();
      }
      return success;
    } catch (error) {
      console.error('Error importing JSON:', error);
      return false;
    }
  },

  // Refresh collections from localStorage
  refreshCollections: () => {
    const freshState = loadGameCollections();
    if (freshState) {
      set(freshState);
    }
  },

  // Clear all collection data
  clearAllCollections: () => {
    clearCollections();
    set(createEmptyCollections());
  },

  // Sync players with session players
  syncPlayersWithSession: (sessionPlayers: { id: string; name: string; icon: string }[]) => {
    const state = get();
    let updated = false;
    
    sessionPlayers.forEach(sessionPlayer => {
      if (!state.players[sessionPlayer.id]) {
        // Add new player from session
        const player = createCollectionPlayer({
          id: sessionPlayer.id,
          name: sessionPlayer.name,
          icon: sessionPlayer.icon,
          isActive: true
        });
        saveCollectionPlayer(player);
        updated = true;
      }
    });
    
    if (updated) {
      get().refreshCollections();
    }
  }
}));
