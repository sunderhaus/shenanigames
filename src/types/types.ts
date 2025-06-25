/**
 * Type definitions for Shenanigames core entities
 */

/**
 * Player entity representing a participant in the session
 */
export interface Player {
  id: string;
  name: string;
  icon: string; // Unique icon for the player token
  selectionsMade: number;
  picks: string[]; // Array of game IDs the player has preselected
  actionTakenInCurrentRound: boolean; // Tracks if player has taken an action in the current round
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
  placedByPlayerId?: string; // ID of the player who placed the game
}

/**
 * TableState representing the state of a table at a specific point in time
 */
export interface TableState {
  id: string;
  gameId: string | null;
  seatedPlayerIds: string[];
  placedByPlayerId?: string; // ID of the player who placed the game
}

/**
 * Round representing a set of table states
 */
export interface Round {
  id: string;
  tableStates: TableState[];
  completed: boolean;
}

/**
 * Session lifecycle stages
 */
export enum SessionStage {
  SETUP = 'setup',           // Players being added and picks being selected
  FIRST_ROUND = 'first_round', // First round of drafting
  SUBSEQUENT_ROUNDS = 'subsequent_rounds', // Additional rounds
  COMPLETE = 'complete'       // All picks exhausted, session complete
}

/**
 * SessionState representing the main state object for the application
 */
export interface SessionState {
  players: Player[];
  availableGames: Game[];
  allGames: Game[];  // Store all games for lookup purposes
  tables: Table[];
  rounds: Round[];
  currentRoundIndex: number;
  viewingRoundIndex: number;  // Index of the round currently being viewed (may differ from currentRoundIndex when viewing history)
  isViewingHistory: boolean;  // Flag to indicate if user is viewing a historical round
  turnOrder: string[];
  currentPlayerTurnIndex: number;
  draftingComplete: boolean;
  stage: SessionStage;        // Current stage of the session lifecycle
}
