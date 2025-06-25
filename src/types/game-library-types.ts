/**
 * Game Library type definitions
 * The Game Library is a centralized collection of games that spans across sessions
 */

import { Game } from './types';

/**
 * Extended game information for the library
 */
export interface LibraryGame extends Game {
  id: string;
  title: string;
  maxPlayers: number;
  link?: string;
  image?: string;
  // Additional library-specific fields
  dateAdded: Date;
  tags?: string[];
  description?: string;
  minPlayers?: number;
  playingTime?: string; // e.g., "60-90 minutes"
  complexity?: number; // 1-5 scale
  category?: string;
  designer?: string;
  publisher?: string;
  yearPublished?: number;
  isActive: boolean; // Whether the game is available for selection
}

/**
 * Game Library state
 */
export interface GameLibraryState {
  games: Record<string, LibraryGame>;
  gameList: LibraryGame[]; // Cached sorted list for performance
  totalGames: number;
  lastModified: Date;
}

/**
 * CSV import mapping for games
 */
export interface GameCSVMapping {
  title: string;
  maxPlayers: string;
  minPlayers?: string;
  link?: string;
  image?: string;
  tags?: string;
  description?: string;
  playingTime?: string;
  complexity?: string;
  category?: string;
  designer?: string;
  publisher?: string;
  yearPublished?: string;
}

/**
 * CSV import options
 */
export interface CSVImportOptions {
  skipFirstRow: boolean;
  mapping: GameCSVMapping;
  tagSeparator: string; // e.g., "," or ";"
  overwriteExisting: boolean;
}

/**
 * Game Library export format
 */
export interface GameLibraryExport {
  version: string;
  exportedAt: Date;
  library: GameLibraryState;
}

/**
 * Game filter options
 */
export interface GameFilter {
  search?: string;
  category?: string;
  tags?: string[];
  minPlayers?: number;
  maxPlayers?: number;
  complexity?: number[];
  isActive?: boolean;
}

/**
 * Game sort options
 */
export type GameSortBy = 'title' | 'dateAdded' | 'maxPlayers' | 'complexity' | 'yearPublished';
export type GameSortOrder = 'asc' | 'desc';

export interface GameSort {
  by: GameSortBy;
  order: GameSortOrder;
}

/**
 * Game Library statistics
 */
export interface GameLibraryStats {
  totalGames: number;
  activeGames: number;
  inactiveGames: number;
  categoryCounts: Record<string, number>;
  tagCounts: Record<string, number>;
  complexityDistribution: Record<number, number>;
  playerCountDistribution: Record<number, number>;
}
