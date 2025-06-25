/**
 * Session management type definitions
 */

import { SessionState } from './types';

/**
 * Metadata about a session
 */
export interface SessionMetadata {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  lastModified: Date;
  playerCount: number;
  gameCount: number;
  currentRound: number;
  isCompleted: boolean;
}

/**
 * Full session data including state and metadata
 */
export interface Session {
  metadata: SessionMetadata;
  state: SessionState;
}

/**
 * Session manager state
 */
export interface SessionManagerState {
  sessions: Record<string, Session>;
  currentSessionId: string | null;
  sessionList: SessionMetadata[]; // Cached list for performance
}

/**
 * Template for creating new sessions
 */
export interface SessionTemplate {
  name: string;
  description?: string;
  players: Array<{
    name: string;
    icon: string;
  }>;
  games: Array<{
    title: string;
    maxPlayers: number;
    link?: string;
    image?: string;
  }>;
  tableCount: number;
  playerPicks?: Record<string, string[]>; // playerId -> gameIds
}

/**
 * Session creation options
 */
export interface CreateSessionOptions {
  template?: SessionTemplate;
  name?: string;
  description?: string;
  copyFromSessionId?: string; // Copy structure from existing session
}

/**
 * Session export/import format
 */
export interface SessionExport {
  version: string;
  exportedAt: Date;
  session: Session;
}
