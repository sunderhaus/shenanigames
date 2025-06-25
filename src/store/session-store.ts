import { create } from 'zustand';
import { SessionState, Game } from '@/types/types';
import { useSessionManager } from './session-manager';

// This store provides the same interface as the old store but works with sessions
interface SessionGameStore extends SessionState {
  // Action to place a game on a table
  placeGame: (gameId: string, tableId: string, playerId: string) => void;

  // Action to join a game at a table
  joinGame: (tableId: string, playerId: string) => void;

  // Action to pass a turn
  passTurn: () => void;

  // Helper to advance to the next player's turn
  advanceTurn: () => void;

  // Helper to check if a round is complete
  isRoundComplete: () => boolean;

  // Helper to create a new round
  createNewRound: () => void;

  // Helper to update the current round's table states
  updateRoundTableStates: () => void;

  // Action to update the turn order
  updateTurnOrder: (newTurnOrder: string[]) => void;

  // Action to reset the current round to its initial state
  resetRound: () => void;

  // Action to view a specific round by index
  viewRound: (roundIndex: number) => void;

  // Action to view the previous round
  viewPreviousRound: () => void;

  // Action to view the next round
  viewNextRound: () => void;

  // Action to return to the current active round
  returnToCurrentRound: () => void;

  // Session management actions
  loadCurrentSession: () => void;
  hasActiveSession: () => boolean;
  
  // Player management actions
  addPlayer: (name: string, icon?: string) => string | null;
  removePlayer: (playerId: string) => boolean;
  updatePlayer: (playerId: string, updates: { name?: string; icon?: string }) => boolean;
  updatePlayerPicks: (playerId: string, picks: string[]) => boolean;
}

// Get the current session state or return a default empty state
const getCurrentSessionState = (): SessionState => {
  const sessionManager = useSessionManager.getState();
  const currentSession = sessionManager.getCurrentSession();
  
  if (currentSession) {
    return currentSession.state;
  }
  
  // Return a minimal empty state if no session is active
  return {
    players: [],
    availableGames: [],
    allGames: [],
    tables: [],
    rounds: [],
    currentRoundIndex: 0,
    viewingRoundIndex: 0,
    isViewingHistory: false,
    turnOrder: [],
    currentPlayerTurnIndex: 0,
    draftingComplete: false
  };
};

// Save the current state back to the session manager
const saveCurrentSessionState = (state: SessionState) => {
  const sessionManager = useSessionManager.getState();
  sessionManager.updateCurrentSessionState(state);
};

export const useSessionGameStore = create<SessionGameStore>((set, get) => ({
  ...getCurrentSessionState(),

  // Load current session data
  loadCurrentSession: () => {
    const newState = getCurrentSessionState();
    set(newState);
  },

  // Check if there's an active session
  hasActiveSession: () => {
    const sessionManager = useSessionManager.getState();
    return sessionManager.currentSessionId !== null;
  },

  // Reset the current round to its initial state
  resetRound: () => {
    set(state => {
      // Get the current round
      const currentRound = state.rounds[state.currentRoundIndex];

      // Keep track of games that need to be restored to availableGames
      const gamesToRestore: Game[] = [];

      // Keep track of which games were placed by which players
      const gamesByPlacedPlayer: Record<string, string[]> = {};

      // Identify games on tables and who placed them
      state.tables.forEach(table => {
        if (table.gameId && table.placedByPlayerId) {
          // Find the game in allGames
          const game = state.allGames.find(g => g.id === table.gameId);
          if (game) {
            // Add to games to restore
            gamesToRestore.push(game);

            // Track which player placed this game
            if (!gamesByPlacedPlayer[table.placedByPlayerId]) {
              gamesByPlacedPlayer[table.placedByPlayerId] = [];
            }
            gamesByPlacedPlayer[table.placedByPlayerId].push(table.gameId);
          }
        }
      });

      // Create empty tables (clear games)
      const resetTables = state.tables.map(table => ({
        id: table.id,
        gameId: null,
        seatedPlayerIds: [],
        placedByPlayerId: undefined
      }));

      // Reset all players' actionTakenInCurrentRound to false and restore games to their picks
      const resetPlayers = state.players.map(player => {
        // Get games placed by this player
        const gamesPlacedByPlayer = gamesByPlacedPlayer[player.id] || [];

        // Create a new picks array with the restored games
        const updatedPicks = [...player.picks];

        // Add back any games that were placed by this player
        gamesPlacedByPlayer.forEach(gameId => {
          // Only add if not already in picks
          if (!updatedPicks.includes(gameId)) {
            updatedPicks.push(gameId);
          }
        });

        return {
          ...player,
          picks: updatedPicks,
          selectionsMade: 0, // Reset selections made
          actionTakenInCurrentRound: false
        };
      });

      // Update availableGames to include the restored games
      // First, filter out any duplicates
      const updatedAvailableGames = [...state.availableGames];
      gamesToRestore.forEach(game => {
        // Only add if not already in availableGames
        if (!updatedAvailableGames.some(g => g.id === game.id)) {
          updatedAvailableGames.push(game);
        }
      });

      // Return the updated state
      const newState = {
        ...state,
        tables: resetTables,
        players: resetPlayers,
        availableGames: updatedAvailableGames,
        currentPlayerTurnIndex: 0, // Reset to the first player in the turn order
        viewingRoundIndex: state.currentRoundIndex, // Ensure we're viewing the current round
        isViewingHistory: false // Exit history mode when resetting a round
      };

      // Save to session manager
      saveCurrentSessionState(newState);
      return newState;
    });
  },

  // Helper to check if a round is complete
  isRoundComplete: () => {
    const state = get();
    const currentRound = state.rounds[state.currentRoundIndex];

    // A round is complete when all tables have a game and all players have made their selections for this round
    const allTablesHaveGames = state.tables.every(table => table.gameId !== null);

    // Check if all players have made their selections for this round
    // This is a simplified check - in a real app, you might need more complex logic
    const allPlayersHaveSelected = state.players.every(player => {
      // Check if player has selected a game or joined a table in this round
      return state.tables.some(table => table.seatedPlayerIds.includes(player.id));
    });

    return allTablesHaveGames && allPlayersHaveSelected;
  },

  // Helper to create a new round
  createNewRound: () => {
    set(state => {
      // Mark the current round as completed
      const updatedRounds = [...state.rounds];
      updatedRounds[state.currentRoundIndex] = {
        ...updatedRounds[state.currentRoundIndex],
        completed: true
      };

      // Create a new round with empty tables
      const newRound = {
        id: crypto.randomUUID(),
        tableStates: state.tables.map(table => ({
          id: table.id,
          gameId: null,
          seatedPlayerIds: [],
          placedByPlayerId: undefined
        })),
        completed: false
      };

      // Calculate the new current round index
      const newCurrentRoundIndex = state.currentRoundIndex + 1;

      // Add the new round and increment the current round index
      const newState = {
        ...state,
        rounds: [...updatedRounds, newRound],
        currentRoundIndex: newCurrentRoundIndex,
        viewingRoundIndex: newCurrentRoundIndex, // Update viewingRoundIndex to match currentRoundIndex
        isViewingHistory: false, // Exit history mode when creating a new round
        // Reset tables for the new round
        tables: state.tables.map(table => ({
          ...table,
          gameId: null,
          seatedPlayerIds: [],
          placedByPlayerId: undefined
        })),
        // Reset actionTakenInCurrentRound for all players
        players: state.players.map(player => ({
          ...player,
          actionTakenInCurrentRound: false
        })),
        // Rotate turn order for the new round
        turnOrder: [...state.turnOrder.slice(1), state.turnOrder[0]],
        currentPlayerTurnIndex: 0
      };

      // Save to session manager
      saveCurrentSessionState(newState);
      return newState;
    });
  },

  // Helper to update the current round's table states
  updateRoundTableStates: () => {
    set(state => {
      const updatedRounds = [...state.rounds];
      updatedRounds[state.currentRoundIndex] = {
        ...updatedRounds[state.currentRoundIndex],
        tableStates: state.tables.map(table => ({
          id: table.id,
          gameId: table.gameId,
          seatedPlayerIds: [...table.seatedPlayerIds],
          placedByPlayerId: table.placedByPlayerId
        }))
      };

      const newState = {
        ...state,
        rounds: updatedRounds
      };

      // Save to session manager
      saveCurrentSessionState(newState);
      return newState;
    });
  },

  // Place a game on a table
  placeGame: (gameId: string, tableId: string, playerId: string) => {
    let placeSucceeded = false;
    
    set((state) => {
      // Find the game and table
      // Look in allGames first, which contains all games
      const game = state.allGames.find(g => g.id === gameId);
      const table = state.tables.find(t => t.id === tableId);
      const player = state.players.find(p => p.id === playerId);

      // Check if player has already assigned any of their picks to a table
      const hasAssignedPicks = state.tables.some(t => 
        t.gameId !== null && 
        player?.picks.includes(t.gameId) && 
        t.seatedPlayerIds.includes(player?.id)
      );

      // Check if player is already seated at another table
      const isPlayerSeatedAtAnotherTable = state.tables.some(t => 
        t.id !== tableId && t.seatedPlayerIds.includes(playerId)
      );

      // Check if the game is in the player's picks
      const isInPlayerPicks = player?.picks.includes(gameId);

      // Check if the game was used in a previous round
      const isGameUsedInPreviousRound = state.rounds.slice(0, state.currentRoundIndex).some(round => 
        round.tableStates.some(tableState => tableState.gameId === gameId)
      );

      // Validate the action - if table already has a game, don't proceed
      if (!game || !table || !player || table.gameId !== null || hasAssignedPicks || !isInPlayerPicks || isGameUsedInPreviousRound || isPlayerSeatedAtAnotherTable) {
        return state; // Invalid action, return unchanged state
      }

      // If we reach here, the place operation is valid
      placeSucceeded = true;

      // Update the state
      const updatedTables = state.tables.map(t => 
        t.id === tableId 
          ? { ...t, gameId: gameId, seatedPlayerIds: [...t.seatedPlayerIds, playerId], placedByPlayerId: playerId } 
          : t
      );

      const updatedPlayers = state.players.map(p => 
        p.id === playerId 
          ? { ...p, selectionsMade: p.selectionsMade + 1, actionTakenInCurrentRound: true } 
          : p
      );

      // Check if the game is still in any player's picks that haven't been placed yet
      const isGameStillInPicks = state.players.some(p => {
        // Skip the current player who just placed the game
        if (p.id === playerId) return false;

        // Check if this player has the game in their picks
        if (!p.picks.includes(gameId)) return false;

        // Check if this player has already placed this game
        const hasPlacedThisGame = state.tables.some(t => 
          t.gameId === gameId && t.seatedPlayerIds.includes(p.id)
        );

        // The game is still in picks if the player has it in picks and hasn't placed it
        return !hasPlacedThisGame;
      });

      // Only remove the game from availableGames if it's not in any other player's picks
      const updatedAvailableGames = isGameStillInPicks 
        ? state.availableGames 
        : state.availableGames.filter(g => g.id !== gameId);

      // Update the current round's table states
      const updatedRounds = [...state.rounds];
      updatedRounds[state.currentRoundIndex] = {
        ...updatedRounds[state.currentRoundIndex],
        tableStates: updatedTables.map(table => ({
          id: table.id,
          gameId: table.gameId,
          seatedPlayerIds: [...table.seatedPlayerIds],
          placedByPlayerId: table.placedByPlayerId
        }))
      };

      // Check if the round is complete after this action
      const isRoundComplete = () => {
        // A round is complete when all tables have a game and all players have made their selections for this round
        const allTablesHaveGames = updatedTables.every(table => table.gameId !== null);

        // Check if all players have selected a game or joined a table in this round
        const allPlayersHaveSelected = updatedPlayers.every(player => {
          return updatedTables.some(table => table.seatedPlayerIds.includes(player.id));
        });

        return allTablesHaveGames && allPlayersHaveSelected;
      };

      // If the round is complete, mark it as completed but don't create a new round yet
      // The UI will need to handle transitioning to a new round
      if (isRoundComplete()) {
        updatedRounds[state.currentRoundIndex].completed = true;
      }

      const newState = {
        ...state,
        tables: updatedTables,
        players: updatedPlayers,
        availableGames: updatedAvailableGames,
        rounds: updatedRounds,
        // Don't update currentPlayerTurnIndex here, we'll use advanceTurn instead
        turnOrder: state.turnOrder, // Don't rotate turn order here, only at the end of a round
      };

      // Save to session manager
      saveCurrentSessionState(newState);
      return newState;
    });

    // Only call advanceTurn if the place operation succeeded
    if (placeSucceeded) {
      useSessionGameStore.getState().advanceTurn();
    }

    // Check if the round is complete and we need to create a new round
    const state = useSessionGameStore.getState();
    if (state.rounds[state.currentRoundIndex].completed) {
      // Don't automatically create a new round, let the UI handle it
      // This allows the UI to show the completed round before moving to the next one
    }
  },

  // Join a game at a table
  joinGame: (tableId: string, playerId: string) => {
    let joinSucceeded = false;
    
    set((state) => {
      // Find the table and player
      const table = state.tables.find(t => t.id === tableId);
      const player = state.players.find(p => p.id === playerId);

      // Check if player is already seated at another table
      const isPlayerSeatedAtAnotherTable = state.tables.some(t => 
        t.id !== tableId && t.seatedPlayerIds.includes(playerId)
      );

      // Validate the action - if table is empty (no game), don't proceed
      if (!table || !player || table.gameId === null || 
          table.seatedPlayerIds.includes(playerId) ||
          isPlayerSeatedAtAnotherTable) {
        return state; // Invalid action, return unchanged state
      }

      // Find the game to check max players
      // Look in allGames first, which contains all games
      const game = state.allGames.find(g => g.id === table.gameId);

      // If game is not found (which shouldn't happen), use a default maxPlayers value
      const maxPlayers = game ? game.maxPlayers : 4;

      if (table.seatedPlayerIds.length >= maxPlayers) {
        return state; // Table is full, return unchanged state
      }

      // If we reach here, the join operation is valid
      joinSucceeded = true;

      // Update the state
      const updatedTables = state.tables.map(t => 
        t.id === tableId 
          ? { ...t, seatedPlayerIds: [...t.seatedPlayerIds, playerId] } 
          : t
      );

      const updatedPlayers = state.players.map(p => 
        p.id === playerId 
          ? { ...p, selectionsMade: p.selectionsMade + 1, actionTakenInCurrentRound: true } 
          : p
      );

      // Update the current round's table states
      const updatedRounds = [...state.rounds];
      updatedRounds[state.currentRoundIndex] = {
        ...updatedRounds[state.currentRoundIndex],
        tableStates: updatedTables.map(table => ({
          id: table.id,
          gameId: table.gameId,
          seatedPlayerIds: [...table.seatedPlayerIds],
          placedByPlayerId: table.placedByPlayerId
        }))
      };

      // Check if the round is complete after this action
      const isRoundComplete = () => {
        // A round is complete when all tables have a game and all players have made their selections for this round
        const allTablesHaveGames = updatedTables.every(table => table.gameId !== null);

        // Check if all players have selected a game or joined a table in this round
        const allPlayersHaveSelected = updatedPlayers.every(player => {
          return updatedTables.some(table => table.seatedPlayerIds.includes(player.id));
        });

        return allTablesHaveGames && allPlayersHaveSelected;
      };

      // If the round is complete, mark it as completed but don't create a new round yet
      if (isRoundComplete()) {
        updatedRounds[state.currentRoundIndex].completed = true;
      }

      const newState = {
        ...state,
        tables: updatedTables,
        players: updatedPlayers,
        rounds: updatedRounds,
        // Don't update currentPlayerTurnIndex here, we'll use advanceTurn instead
        turnOrder: state.turnOrder,
      };

      // Save to session manager
      saveCurrentSessionState(newState);
      return newState;
    });

    // Only call advanceTurn if the join operation succeeded
    if (joinSucceeded) {
      useSessionGameStore.getState().advanceTurn();
    }

    // Check if the round is complete and we need to create a new round
    const state = useSessionGameStore.getState();
    if (state.rounds[state.currentRoundIndex].completed) {
      // Don't automatically create a new round, let the UI handle it
      // This allows the UI to show the completed round before moving to the next one
    }
  },

  // Pass a turn
  passTurn: () => {
    // Just advance to the next player's turn without tracking passes
    useSessionGameStore.getState().advanceTurn();
  },

  // Advance to the next player's turn
  advanceTurn: () => {
    set(state => {
      // Start with the next player in the turn order
      let nextIndex = (state.currentPlayerTurnIndex + 1) % state.players.length;
      const startingIndex = nextIndex; // Remember where we started to detect full circle

      // Get the players array and turn order for easier access
      const { players, turnOrder } = state;

      // Check if the next player has already taken an action in this round
      // If they have, keep advancing until we find a player who hasn't
      let nextPlayerId = turnOrder[nextIndex];
      let nextPlayer = players.find(p => p.id === nextPlayerId);

      // Skip players who have already taken actions in this round
      while (nextPlayer && nextPlayer.actionTakenInCurrentRound) {
        // Move to the next player
        nextIndex = (nextIndex + 1) % players.length;

        // If we've gone full circle and back to where we started, all players have taken actions
        if (nextIndex === startingIndex) {
          // We've gone full circle, which means all players with actionTakenInCurrentRound=true
          // have already taken their turns. Now we need to check if any players passed.

          // Find players who passed (actionTakenInCurrentRound is still false)
          const playersWhoPassed = players.filter(p => !p.actionTakenInCurrentRound);

          if (playersWhoPassed.length > 0) {
            // Find the first player in the turn order who passed
            for (let i = 0; i < turnOrder.length; i++) {
              const passedPlayerId = turnOrder[i];
              const passedPlayer = playersWhoPassed.find(p => p.id === passedPlayerId);

              if (passedPlayer) {
                // Found the first player who passed, set them as the next player
                nextIndex = i;
                nextPlayerId = passedPlayerId;
                nextPlayer = passedPlayer;
                break;
              }
            }
          } else {
            // All players have taken actions, the round is effectively complete
            // We'll keep the current player's turn for now, as they'll need to start the next round
            // The UI can handle transitioning to a new round
            break;
          }
        }

        // Get the next player
        nextPlayerId = turnOrder[nextIndex];
        nextPlayer = players.find(p => p.id === nextPlayerId);
      }

      // Check if the current round is complete
      const currentRound = state.rounds[state.currentRoundIndex];
      const isComplete = currentRound.completed;

      // Only rotate turn order if the round is complete and we've gone through all players
      let newTurnOrder = [...state.turnOrder];

      // If we've completed a round AND cycled through all players, we'll handle rotation
      // when creating a new round, not here

      const newState = {
        ...state,
        currentPlayerTurnIndex: nextIndex,
        turnOrder: newTurnOrder,
      };

      // Save to session manager
      saveCurrentSessionState(newState);
      return newState;
    });
  },

  // Update the turn order
  updateTurnOrder: (newTurnOrder: string[]) => {
    set(state => {
      // Validate that the new turn order contains the same players
      if (newTurnOrder.length !== state.turnOrder.length || 
          !newTurnOrder.every(id => state.turnOrder.includes(id))) {
        console.error('Invalid turn order update');
        return state;
      }

      // Keep the same index position, but the player at that position may change
      // Ensure the index is still valid for the new turn order length
      let newCurrentPlayerIndex = Math.min(state.currentPlayerTurnIndex, newTurnOrder.length - 1);
      
      // Check if the player at the current index has already taken an action
      const playerAtCurrentIndex = state.players.find(p => p.id === newTurnOrder[newCurrentPlayerIndex]);
      
      // If the player at the current index has already acted, find the next available player
      if (playerAtCurrentIndex && playerAtCurrentIndex.actionTakenInCurrentRound) {
        const startingIndex = newCurrentPlayerIndex;
        
        // Search for the next player who hasn't taken an action
        do {
          newCurrentPlayerIndex = (newCurrentPlayerIndex + 1) % newTurnOrder.length;
          const nextPlayerId = newTurnOrder[newCurrentPlayerIndex];
          const nextPlayer = state.players.find(p => p.id === nextPlayerId);
          
          // If this player hasn't taken an action, we found our next player
          if (nextPlayer && !nextPlayer.actionTakenInCurrentRound) {
            break;
          }
          
          // If we've gone full circle back to the starting index, all players have acted
          if (newCurrentPlayerIndex === startingIndex) {
            // All players have taken actions, keep the current index
            break;
          }
        } while (true);
      }

      const newState = {
        ...state,
        turnOrder: newTurnOrder,
        currentPlayerTurnIndex: newCurrentPlayerIndex,
      };

      // Save to session manager
      saveCurrentSessionState(newState);
      return newState;
    });

    // After updating the state, check if we need to update the round's completion status
    const state = useSessionGameStore.getState();
    if (!state.rounds[state.currentRoundIndex].completed) {
      // Check if the round is complete now
      const isComplete = useSessionGameStore.getState().isRoundComplete();
      if (isComplete) {
        // Update the round's completion status
        set(state => {
          const updatedRounds = [...state.rounds];
          updatedRounds[state.currentRoundIndex] = {
            ...updatedRounds[state.currentRoundIndex],
            completed: true
          };

          const newState = {
            ...state,
            rounds: updatedRounds
          };

          // Save to session manager
          saveCurrentSessionState(newState);
          return newState;
        });
      }
    }
  },

  // View a specific round by index
  viewRound: (roundIndex: number) => {
    set(state => {
      // Validate the round index
      if (roundIndex < 0 || roundIndex >= state.rounds.length) {
        console.error('Invalid round index');
        return state;
      }

      // If viewing the current round, exit history mode
      if (roundIndex === state.currentRoundIndex) {
        const newState = {
          ...state,
          viewingRoundIndex: roundIndex,
          isViewingHistory: false
        };
        // Save to session manager
        saveCurrentSessionState(newState);
        return newState;
      }

      // Otherwise, enter history mode with the specified round
      const newState = {
        ...state,
        viewingRoundIndex: roundIndex,
        isViewingHistory: true
      };
      // Save to session manager
      saveCurrentSessionState(newState);
      return newState;
    });
  },

  // View the previous round
  viewPreviousRound: () => {
    set(state => {
      const prevIndex = state.viewingRoundIndex - 1;
      if (prevIndex < 0) {
        return state; // No previous round
      }

      const newState = {
        ...state,
        viewingRoundIndex: prevIndex,
        isViewingHistory: prevIndex !== state.currentRoundIndex
      };
      // Save to session manager
      saveCurrentSessionState(newState);
      return newState;
    });
  },

  // View the next round
  viewNextRound: () => {
    set(state => {
      const nextIndex = state.viewingRoundIndex + 1;
      if (nextIndex >= state.rounds.length) {
        return state; // No next round
      }

      const newState = {
        ...state,
        viewingRoundIndex: nextIndex,
        isViewingHistory: nextIndex !== state.currentRoundIndex
      };
      // Save to session manager
      saveCurrentSessionState(newState);
      return newState;
    });
  },

  // Return to the current active round
  returnToCurrentRound: () => {
    set(state => {
      const newState = {
        ...state,
        viewingRoundIndex: state.currentRoundIndex,
        isViewingHistory: false
      };
      // Save to session manager
      saveCurrentSessionState(newState);
      return newState;
    });
  },

  // Add a new player to the session
  addPlayer: (name: string, icon?: string) => {
    if (!name.trim()) {
      console.error('Player name cannot be empty');
      return null;
    }

    let newPlayerId: string | null = null;

    set(state => {
      // Check if a player with this name already exists
      if (state.players.some(p => p.name.toLowerCase() === name.toLowerCase().trim())) {
        console.error('A player with this name already exists');
        return state;
      }

      // Generate a unique ID for the new player
      newPlayerId = crypto.randomUUID();

      // Available icons to choose from if none provided
      const availableIcons = ['🐯', '🐼', '🦁', '🦊', '🐸', '🐱', '🐶', '🐺', '🦝', '🐰', '🐹', '🐭', '🐷', '🐮', '🐵'];
      const usedIcons = state.players.map(p => p.icon);
      const unusedIcons = availableIcons.filter(icon => !usedIcons.includes(icon));
      
      const playerIcon = icon || (unusedIcons.length > 0 ? unusedIcons[0] : availableIcons[Math.floor(Math.random() * availableIcons.length)]);

      // Create the new player
      const newPlayer = {
        id: newPlayerId,
        name: name.trim(),
        icon: playerIcon,
        selectionsMade: 0,
        picks: [], // Start with empty picks - can be assigned later
        actionTakenInCurrentRound: false
      };

      // Add the new player to the players array
      const updatedPlayers = [...state.players, newPlayer];

      // Add the new player to the end of the turn order
      const updatedTurnOrder = [...state.turnOrder, newPlayerId];

      const newState = {
        ...state,
        players: updatedPlayers,
        turnOrder: updatedTurnOrder
      };

      // Save to session manager
      saveCurrentSessionState(newState);
      return newState;
    });

    return newPlayerId;
  },

  // Remove a player from the session
  removePlayer: (playerId: string) => {
    let removeSucceeded = false;

    set(state => {
      // Check if player exists
      const playerIndex = state.players.findIndex(p => p.id === playerId);
      if (playerIndex === -1) {
        console.error('Player not found');
        return state;
      }

      // Check if player is currently seated at any table
      const isPlayerSeated = state.tables.some(table => table.seatedPlayerIds.includes(playerId));
      if (isPlayerSeated) {
        console.error('Cannot remove player who is currently seated at a table');
        return state;
      }

      // Don't allow removing the last player
      if (state.players.length <= 1) {
        console.error('Cannot remove the last player');
        return state;
      }

      removeSucceeded = true;

      // Remove the player from the players array
      const updatedPlayers = state.players.filter(p => p.id !== playerId);

      // Remove the player from the turn order
      const updatedTurnOrder = state.turnOrder.filter(id => id !== playerId);

      // Adjust current player turn index if necessary
      const currentPlayerTurnIndex = state.currentPlayerTurnIndex;
      const removedPlayerTurnIndex = state.turnOrder.findIndex(id => id === playerId);
      
      let newCurrentPlayerTurnIndex = currentPlayerTurnIndex;
      
      if (removedPlayerTurnIndex <= currentPlayerTurnIndex && currentPlayerTurnIndex > 0) {
        // If we removed a player before or at the current player's position, decrement the index
        newCurrentPlayerTurnIndex = currentPlayerTurnIndex - 1;
      } else if (currentPlayerTurnIndex >= updatedTurnOrder.length) {
        // If the current index is now out of bounds, wrap to the beginning
        newCurrentPlayerTurnIndex = 0;
      }

      const newState = {
        ...state,
        players: updatedPlayers,
        turnOrder: updatedTurnOrder,
        currentPlayerTurnIndex: newCurrentPlayerTurnIndex
      };

      // Save to session manager
      saveCurrentSessionState(newState);
      return newState;
    });

    return removeSucceeded;
  },

  // Update player information
  updatePlayer: (playerId: string, updates: { name?: string; icon?: string }) => {
    let updateSucceeded = false;

    set(state => {
      // Check if player exists
      const playerIndex = state.players.findIndex(p => p.id === playerId);
      if (playerIndex === -1) {
        console.error('Player not found');
        return state;
      }

      // If updating name, check for duplicates
      if (updates.name) {
        const trimmedName = updates.name.trim();
        if (!trimmedName) {
          console.error('Player name cannot be empty');
          return state;
        }

        // Check if another player already has this name
        if (state.players.some(p => p.id !== playerId && p.name.toLowerCase() === trimmedName.toLowerCase())) {
          console.error('A player with this name already exists');
          return state;
        }
      }

      updateSucceeded = true;

      // Update the player
      const updatedPlayers = state.players.map(player => {
        if (player.id === playerId) {
          return {
            ...player,
            ...(updates.name && { name: updates.name.trim() }),
            ...(updates.icon && { icon: updates.icon })
          };
        }
        return player;
      });

      const newState = {
        ...state,
        players: updatedPlayers
      };

      // Save to session manager
      saveCurrentSessionState(newState);
      return newState;
    });

    return updateSucceeded;
  },

  // Update player picks from library games
  updatePlayerPicks: (playerId: string, picks: string[]) => {
    let updateSucceeded = false;

    set(state => {
      // Check if player exists
      const playerIndex = state.players.findIndex(p => p.id === playerId);
      if (playerIndex === -1) {
        console.error('Player not found');
        return state;
      }

      // Validate picks (should be exactly 2 game IDs)
      if (picks.length !== 2) {
        console.error('Player must have exactly 2 picks');
        return state;
      }

      updateSucceeded = true;

      // Update the player's picks
      const updatedPlayers = state.players.map(player => {
        if (player.id === playerId) {
          return {
            ...player,
            picks: [...picks]
          };
        }
        return player;
      });

      // Update available games to include games that are in any player's picks
      // We need to get the actual game objects from the library
      const { useGameLibrary } = require('@/store/game-library-store');
      const libraryStore = useGameLibrary.getState();
      
      // Get all unique game IDs from all players' picks
      const allPickIds = new Set<string>();
      updatedPlayers.forEach(player => {
        player.picks.forEach(gameId => allPickIds.add(gameId));
      });
      
      // Convert game IDs to actual game objects from the library
      const availableGamesFromLibrary: Game[] = [];
      const allGamesFromLibrary: Game[] = [];
      
      allPickIds.forEach(gameId => {
        const libraryGame = libraryStore.getGameById(gameId);
        if (libraryGame && libraryGame.isActive) {
          // Convert LibraryGame to Game format
          const game: Game = {
            id: libraryGame.id,
            title: libraryGame.title,
            maxPlayers: libraryGame.maxPlayers,
            link: libraryGame.link,
            image: libraryGame.image
          };
          availableGamesFromLibrary.push(game);
          allGamesFromLibrary.push(game);
        }
      });

      const newState = {
        ...state,
        players: updatedPlayers,
        availableGames: availableGamesFromLibrary,
        allGames: allGamesFromLibrary
      };

      // Save to session manager
      saveCurrentSessionState(newState);
      return newState;
    });

    return updateSucceeded;
  },
}));

// Subscribe to session manager changes and update the game store
useSessionManager.subscribe((sessionManagerState) => {
  // If the current session changed, reload the game store
  const gameStore = useSessionGameStore.getState();
  gameStore.loadCurrentSession();
});
