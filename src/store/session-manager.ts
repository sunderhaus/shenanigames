import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  Session, 
  SessionMetadata, 
  SessionManagerState, 
  CreateSessionOptions,
  SessionTemplate 
} from '@/types/session-types';
import { SessionState, Player, Game, Table, Round, SessionStage, SessionMode } from '@/types/types';
import { 
  saveSessionManager, 
  loadSessionManager, 
  saveSession, 
  loadSession, 
  deleteSession, 
  getAllSessionMetadata,
  bootstrapSessions 
} from './session-persistence';

// Helper function to create metadata from session state
const createMetadataFromState = (id: string, name: string, state: SessionState, description?: string): SessionMetadata => {
  const now = new Date();
  return {
    id,
    name,
    description,
    createdAt: now,
    lastModified: now,
    playerCount: state.players.length,
    gameCount: state.allGames.length,
    currentRound: state.currentRoundIndex + 1,
    isCompleted: state.draftingComplete
  };
};

// Helper function to create a session from template
const createSessionFromTemplate = (template: SessionTemplate): SessionState => {
  // Create players from template
  const players: Player[] = template.players.map(playerTemplate => ({
    id: uuidv4(),
    name: playerTemplate.name,
    icon: playerTemplate.icon,
    selectionsMade: 0,
    picks: [], // Will be populated later if playerPicks is provided
    actionTakenInCurrentRound: false
  }));

  // Create games from template
  const games: Game[] = template.games.map(gameTemplate => ({
    id: uuidv4(),
    title: gameTemplate.title,
    maxPlayers: gameTemplate.maxPlayers,
    link: gameTemplate.link,
    image: gameTemplate.image
  }));

  // Create tables with Pick Mode (default mode is PICK)
  const tables: Table[] = Array.from({ length: template.tableCount }, (_, index) => ({
    id: `pick-table-${index + 1}`,
    gameId: null,
    seatedPlayerIds: [],
    placedByPlayerId: undefined,
    gameSession: undefined,
    mode: SessionMode.PICK
  }));

  // Assign picks if provided
  if (template.playerPicks) {
    Object.entries(template.playerPicks).forEach(([playerName, gameIndices]) => {
      const player = players.find(p => p.name === playerName);
      if (player && Array.isArray(gameIndices)) {
        player.picks = gameIndices
          .map(index => typeof index === 'number' ? games[index]?.id : undefined)
          .filter(Boolean) as string[];
      }
    });
  }

  // Helper function to get all unique game IDs from players' picks
  const getAllPlayerPicks = (players: Player[]): string[] => {
    const allPicks: string[] = [];
    players.forEach(player => {
      player.picks.forEach(gameId => {
        if (!allPicks.includes(gameId)) {
          allPicks.push(gameId);
        }
      });
    });
    return allPicks;
  };

  // Helper function to create an initial round
  const createInitialRound = (tables: Table[]): Round => {
    return {
      id: uuidv4(),
      tableStates: tables.map(table => ({
        id: table.id,
        gameId: table.gameId,
        seatedPlayerIds: [...table.seatedPlayerIds],
        placedByPlayerId: table.placedByPlayerId
      })),
      completed: false
    };
  };

  return {
    players,
    availableGames: games.filter(game => getAllPlayerPicks(players).includes(game.id)),
    allGames: games,
    tables,
    rounds: [createInitialRound(tables)],
    currentRoundIndex: 0,
    viewingRoundIndex: 0,
    isViewingHistory: false,
    turnOrder: players.map(player => player.id),
    currentPlayerTurnIndex: 0,
    draftingComplete: false,
    stage: SessionStage.SETUP,
    mode: SessionMode.PICK // Default to pick mode
  };
};

// Default session template based on current sample data
const getDefaultTemplate = (): SessionTemplate => ({
  name: 'New Session',
  description: 'A new drafting session',
  players: [
    { name: 'Player 1', icon: '🐯' },
    { name: 'Player 2', icon: '🐼' },
    { name: 'Player 3', icon: '🦁' },
    { name: 'Player 4', icon: '🦊' }
  ],
  games: [
    { title: 'Bloodstones', maxPlayers: 4, link: 'https://boardgamegeek.com/boardgame/284587/bloodstones', image: 'https://cf.geekdo-images.com/HV14OnnJ8csHISjCVoYmig__imagepagezoom/img/N6ldKubcFgbA_iYfb_HrwV2Iapg=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic7014527.jpg'},
    { title: 'SETI', maxPlayers: 4, link: 'https://boardgamegeek.com/boardgame/418059/seti-search-for-extraterrestrial-intelligence', image: 'https://cf.geekdo-images.com/_BUXOVRDU9g_eRwgpR5ZZw__imagepagezoom/img/Scz5h4qbJT88nUjCeTt5LI_rlyE=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic8160466.jpg' },
    { title: 'Dune', maxPlayers: 6, link: 'https://boardgamegeek.com/boardgame/283355/dune', image: 'https://cf.geekdo-images.com/2fgPg6Be--w97zoycObUgg__imagepagezoom/img/xaHCXAm16YrluAkOLF6ATbKDYHg=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic4815198.jpg' },
    { title: 'Kemet', maxPlayers: 5, link: 'https://boardgamegeek.com/boardgame/297562/kemet-blood-and-sand', image: 'https://cf.geekdo-images.com/IU-az-0jlIpoUxDHCCclNw__imagepagezoom/img/JUuxRLpu0aOMPWbSMxNj4KuT0eA=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic6230640.jpg' }
  ],
  tableCount: 3 // Good default for Pick Mode - allows for variety while keeping games manageable
});

// Load initial session manager state
const loadInitialSessionManager = (): SessionManagerState => {
  try {
    // Bootstrap the session system
    bootstrapSessions();
    
    const savedManager = loadSessionManager();
    if (savedManager) {
      // Refresh session list from storage - this will clean up any corrupted sessions
      const sessionList = getAllSessionMetadata();
      
      // Validate that the current session still exists and is valid
      let currentSessionId = savedManager.currentSessionId;
      if (currentSessionId) {
        const currentSession = loadSession(currentSessionId);
        if (!currentSession) {
          console.warn(`Current session ${currentSessionId} no longer exists or is corrupted, clearing it`);
          currentSessionId = null;
        }
      }
      
      return {
        sessions: savedManager.sessions || {},
        currentSessionId,
        sessionList
      };
    }
  } catch (error) {
    console.error('Error loading initial session manager state:', error);
    // Clear potentially corrupted data and start fresh
    try {
      localStorage.removeItem('shenanigames-session-manager');
    } catch (clearError) {
      console.error('Error clearing corrupted session manager data:', clearError);
    }
  }

  // No existing data or error occurred, start fresh
  return {
    sessions: {},
    currentSessionId: null,
    sessionList: []
  };
};

// Session Manager Store
interface SessionManagerStore extends SessionManagerState {
  // Core session management
  createSession: (options?: CreateSessionOptions) => string;
  loadSessionById: (sessionId: string) => Session | null;
  deleteSessionById: (sessionId: string) => void;
  duplicateSession: (sessionId: string, newName?: string) => string | null;
  
  // Current session management
  setCurrentSession: (sessionId: string) => boolean;
  getCurrentSession: () => Session | null;
  updateCurrentSessionState: (newState: SessionState) => void;
  
  // Session metadata management
  updateSessionMetadata: (sessionId: string, updates: Partial<Omit<SessionMetadata, 'id' | 'createdAt'>>) => void;
  refreshSessionList: () => void;
  
  // Utility functions
  exportSessionById: (sessionId: string) => string | null;
  importSessionFromJson: (jsonData: string, newName?: string) => string | null;
}

export const useSessionManager = create<SessionManagerStore>((set, get) => ({
  ...loadInitialSessionManager(),

  // Create a new session
  createSession: (options = {}) => {
    const sessionId = uuidv4();
    let sessionState: SessionState;
    let sessionName = options.name || 'New Session';
    
    if (options.template) {
      sessionState = createSessionFromTemplate(options.template);
      sessionName = options.template.name;
    } else if (options.copyFromSessionId) {
      const sourceSession = loadSession(options.copyFromSessionId);
      if (!sourceSession) {
        console.error('Source session not found for copying');
        return '';
      }
      // Create a deep copy of the state and reset it
      sessionState = {
        ...sourceSession.state,
        rounds: [sourceSession.state.rounds[0]], // Keep only first round
        currentRoundIndex: 0,
        viewingRoundIndex: 0,
        isViewingHistory: false,
        draftingComplete: false,
        stage: SessionStage.SETUP, // Reset to setup stage
        // Reset player states
        players: sourceSession.state.players.map(player => ({
          ...player,
          selectionsMade: 0,
          actionTakenInCurrentRound: false
        })),
        // Reset tables
        tables: sourceSession.state.tables.map(table => ({
          ...table,
          gameId: null,
          seatedPlayerIds: [],
          placedByPlayerId: undefined
        }))
      };
      sessionName = `${sourceSession.metadata.name} (Copy)`;
    } else {
      // Create from default template
      const template = getDefaultTemplate();
      template.name = sessionName;
      if (options.description) {
        template.description = options.description;
      }
      sessionState = createSessionFromTemplate(template);
    }

    const metadata = createMetadataFromState(sessionId, sessionName, sessionState, options.description);
    const session: Session = { metadata, state: sessionState };
    
    // Save the session
    saveSession(session);
    
    // Update manager state
    set(state => {
      const newSessionList = [metadata, ...state.sessionList];
      const newState = {
        ...state,
        currentSessionId: sessionId,
        sessionList: newSessionList
      };
      saveSessionManager(newState);
      return newState;
    });
    
    return sessionId;
  },

  // Load a session by ID
  loadSessionById: (sessionId: string) => {
    return loadSession(sessionId);
  },

  // Delete a session
  deleteSessionById: (sessionId: string) => {
    deleteSession(sessionId);
    
    set(state => {
      const newSessionList = state.sessionList.filter(s => s.id !== sessionId);
      const newCurrentSessionId = state.currentSessionId === sessionId ? null : state.currentSessionId;
      
      const newState = {
        ...state,
        currentSessionId: newCurrentSessionId,
        sessionList: newSessionList
      };
      saveSessionManager(newState);
      return newState;
    });
  },

  // Duplicate a session
  duplicateSession: (sessionId: string, newName?: string) => {
    const sourceSession = loadSession(sessionId);
    if (!sourceSession) return null;
    
    const newSessionId = uuidv4();
    const duplicateName = newName || `${sourceSession.metadata.name} (Copy)`;
    
    const newMetadata = createMetadataFromState(
      newSessionId, 
      duplicateName, 
      sourceSession.state,
      `Copy of ${sourceSession.metadata.name}`
    );
    
    const newSession: Session = {
      metadata: newMetadata,
      state: { ...sourceSession.state }
    };
    
    saveSession(newSession);
    
    set(state => {
      const newSessionList = [newMetadata, ...state.sessionList];
      const newState = {
        ...state,
        sessionList: newSessionList
      };
      saveSessionManager(newState);
      return newState;
    });
    
    return newSessionId;
  },

  // Set current session
  setCurrentSession: (sessionId: string) => {
    const session = loadSession(sessionId);
    if (!session) return false;
    
    set(state => {
      const newState = {
        ...state,
        currentSessionId: sessionId
      };
      saveSessionManager(newState);
      return newState;
    });
    
    return true;
  },

  // Get current session
  getCurrentSession: () => {
    const state = get();
    return state.currentSessionId ? loadSession(state.currentSessionId) : null;
  },

  // Update current session state
  updateCurrentSessionState: (newState: SessionState) => {
    const state = get();
    if (!state.currentSessionId) return;
    
    const currentSession = loadSession(state.currentSessionId);
    if (!currentSession) return;
    
    const updatedMetadata = createMetadataFromState(
      currentSession.metadata.id,
      currentSession.metadata.name,
      newState,
      currentSession.metadata.description
    );
    // Preserve creation date
    updatedMetadata.createdAt = currentSession.metadata.createdAt;
    
    const updatedSession: Session = {
      metadata: updatedMetadata,
      state: newState
    };
    
    saveSession(updatedSession);
    
    // Update session list with new metadata
    set(state => {
      const newSessionList = state.sessionList.map(s => 
        s.id === updatedMetadata.id ? updatedMetadata : s
      );
      return {
        ...state,
        sessionList: newSessionList
      };
    });
  },

  // Update session metadata
  updateSessionMetadata: (sessionId: string, updates: Partial<Omit<SessionMetadata, 'id' | 'createdAt'>>) => {
    const session = loadSession(sessionId);
    if (!session) return;
    
    const updatedMetadata: SessionMetadata = {
      ...session.metadata,
      ...updates,
      lastModified: new Date()
    };
    
    const updatedSession: Session = {
      ...session,
      metadata: updatedMetadata
    };
    
    saveSession(updatedSession);
    
    set(state => {
      const newSessionList = state.sessionList.map(s => 
        s.id === sessionId ? updatedMetadata : s
      );
      const newState = {
        ...state,
        sessionList: newSessionList
      };
      saveSessionManager(newState);
      return newState;
    });
  },

  // Refresh session list from storage
  refreshSessionList: () => {
    const sessionList = getAllSessionMetadata();
    set(state => ({
      ...state,
      sessionList
    }));
  },

  // Export session as JSON
  exportSessionById: (sessionId: string) => {
    const session = loadSession(sessionId);
    if (!session) return null;
    
    try {
      return JSON.stringify({
        version: '0.0.1',
        exportedAt: new Date(),
        session
      }, null, 2);
    } catch (error) {
      console.error('Error exporting session:', error);
      return null;
    }
  },

  // Import session from JSON
  importSessionFromJson: (jsonData: string, newName?: string) => {
    try {
      const exportData = JSON.parse(jsonData);
      const sessionId = uuidv4();
      
      const importedSession: Session = {
        ...exportData.session,
        metadata: {
          ...exportData.session.metadata,
          id: sessionId,
          name: newName || `${exportData.session.metadata.name} (Imported)`,
          createdAt: new Date(),
          lastModified: new Date()
        }
      };
      
      saveSession(importedSession);
      
      set(state => {
        const newSessionList = [importedSession.metadata, ...state.sessionList];
        const newState = {
          ...state,
          sessionList: newSessionList
        };
        saveSessionManager(newState);
        return newState;
      });
      
      return sessionId;
    } catch (error) {
      console.error('Error importing session:', error);
      return null;
    }
  }
}));

// Subscribe to session manager state changes
useSessionManager.subscribe((state) => {
  saveSessionManager(state);
});
