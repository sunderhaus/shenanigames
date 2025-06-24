/**
 * Type definitions for Shenanigames core entities
 */

/**
 * Player entity representing a participant in the session
 */
export interface Player {
  id: string;
  name: string;
  selectionsMade: number;
}

/**
 * Game entity representing a board game available for selection
 */
export interface Game {
  id: string;
  title: string;
  maxPlayers: number;
  link?: string;
  image?: string;
}

/**
 * Table entity representing a virtual space where one game can be played
 */
export interface Table {
  id: string;
  gameId: string | null;
  seatedPlayerIds: string[];
}

/**
 * SessionState representing the main state object for the application
 */
export interface SessionState {
  players: Player[];
  availableGames: Game[];
  tables: Table[];
  turnOrder: string[];
  currentPlayerTurnIndex: number;
  consecutivePasses: number;
  draftingComplete: boolean;
}