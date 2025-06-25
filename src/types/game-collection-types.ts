/**
 * Game collection management type definitions
 */

/**
 * Represents a single item in a player's game collection
 */
export interface CollectionItem {
  id: string;
  gameId: string; // Reference to the game in the library
  playerId: string; // Reference to the player who owns it
  condition?: 'mint' | 'good' | 'fair' | 'poor';
  notes?: string;
  dateAcquired?: Date;
}

/**
 * Player information for collection tracking
 */
export interface CollectionPlayer {
  id: string;
  name: string;
  icon: string;
  isActive: boolean; // Whether the player is still active/available
}

/**
 * Game collection state
 */
export interface GameCollectionState {
  players: Record<string, CollectionPlayer>;
  playerList: CollectionPlayer[];
  items: Record<string, CollectionItem>;
  itemList: CollectionItem[];
  totalItems: number;
  lastModified: Date;
}

/**
 * Collection statistics
 */
export interface CollectionStats {
  totalPlayers: number;
  activePlayers: number;
  totalItems: number;
  uniqueGamesInCollections: number;
  averageItemsPerPlayer: number;
  topCollectors: Array<{
    playerId: string;
    playerName: string;
    gameCount: number;
  }>;
  gameDistribution: Record<string, number>; // gameId -> number of items
}

/**
 * Game availability info for sessions
 */
export interface GameAvailability {
  gameId: string;
  isAvailable: boolean;
  totalItems: number;
  collectors: Array<{
    playerId: string;
    playerName: string;
    itemCount: number;
  }>;
}

/**
 * Session availability context
 */
export interface SessionAvailability {
  sessionPlayers: string[]; // Player IDs in the current session
  availableGames: Record<string, GameAvailability>;
  unavailableGames: string[]; // Game IDs that no session player has in their collection
}

/**
 * Import/export formats
 */
export interface CollectionExport {
  version: string;
  exportedAt: Date;
  collections: GameCollectionState;
}

export interface CollectionImportResult {
  success: boolean;
  imported: number;
  errors: string[];
}

/**
 * CSV mapping for import
 */
export interface CollectionCSVMapping {
  playerName?: string;
  gameTitle?: string;
  condition?: string;
  notes?: string;
  dateAcquired?: string;
}

/**
 * Import options
 */
export interface CollectionImportOptions {
  overwriteExisting: boolean;
  createMissingPlayers: boolean;
  createMissingGames: boolean;
  defaultCondition: 'mint' | 'good' | 'fair' | 'poor';
}
