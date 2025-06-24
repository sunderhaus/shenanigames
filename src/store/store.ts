import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { SessionState, Player, Game, Table } from '@/types/types';
import { loadState, saveState } from './persistence';

// Sample data for initial state based on player-picks.csv
const sampleGames: Game[] = [
  { id: uuidv4(), title: 'Bloodstones', maxPlayers: 4 , link: 'https://boardgamegeek.com/boardgame/284587/bloodstones', image: 'https://cf.geekdo-images.com/HV14OnnJ8csHISjCVoYmig__imagepagezoom/img/N6ldKubcFgbA_iYfb_HrwV2Iapg=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic7014527.jpg'},
  { id: uuidv4(), title: 'SETI', maxPlayers: 4, link: 'https://boardgamegeek.com/boardgame/418059/seti-search-for-extraterrestrial-intelligence', image: 'https://cf.geekdo-images.com/_BUXOVRDU9g_eRwgpR5ZZw__imagepagezoom/img/Scz5h4qbJT88nUjCeTt5LI_rlyE=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic8160466.jpg' },
  { id: uuidv4(), title: 'Dune', maxPlayers: 6, link: 'https://boardgamegeek.com/boardgame/283355/dune', image: 'https://cf.geekdo-images.com/2fgPg6Be--w97zoycObUgg__imagepagezoom/img/xaHCXAm16YrluAkOLF6ATbKDYHg=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic4815198.jpg' },
  { id: uuidv4(), title: 'New Kemet', maxPlayers: 5, link: 'https://boardgamegeek.com/boardgame/297562/kemet-blood-and-sand', image: 'https://cf.geekdo-images.com/IU-az-0jlIpoUxDHCCclNw__imagepagezoom/img/JUuxRLpu0aOMPWbSMxNj4KuT0eA=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic6230640.jpg' },
  { id: uuidv4(), title: 'Champions of Midgard', maxPlayers: 4, link: 'https://boardgamegeek.com/boardgame/172287/champions-of-midgard', image: 'https://cf.geekdo-images.com/VJwOnMF5vwJg2Yaq6ozn3Q__imagepagezoom/img/KTdvwhXefkXRFiOYbl8HVLq9aKk=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic2869714.jpg' },
  { id: uuidv4(), title: 'Last Light', maxPlayers: 8, link: 'https://boardgamegeek.com/boardgame/315727/last-light', image: 'https://cf.geekdo-images.com/zw7xI7gJD6r7zNDR-AbVAQ__imagepagezoom/img/uOxcanSS4PXD8y6rHNO3UxT8eVg=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic6338617.jpg' },
  { id: uuidv4(), title: 'Oath', maxPlayers: 6, link: 'https://boardgamegeek.com/boardgame/291572/oath', image: 'https://cf.geekdo-images.com/gTxav_KKQK1rDg-XuCjCSA__imagepagezoom/img/vZVvtufTceUYyWfvHwOBTRGmXdw=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic5164812.jpg' },
  { id: uuidv4(), title: 'Realm of Reckoning', maxPlayers: 5, link: 'https://boardgamegeek.com/boardgame/446893/realm-of-reckoning', image: 'https://cf.geekdo-images.com/xElMYLyj1pqtCIOhRNzA9w__imagepagezoom/img/JdGJ4hQ1GsNMuYl0AeOh0rRfqJ8=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic8899476.png' },
  { id: uuidv4(), title: 'Stupor Mundi', maxPlayers: 4, link: 'https://boardgamegeek.com/boardgame/392492/stupor-mundi', image: 'https://cf.geekdo-images.com/SJvK-Hq72xOiJ_JsmB1dGA__imagepagezoom/img/lsPEsMAQx4KcaLrYnwwNArS44VM=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic7585104.jpg' },
  { id: uuidv4(), title: 'Brass: Birmingham', maxPlayers: 4, link: 'https://boardgamegeek.com/boardgame/224517/brass-birmingham', image: 'https://cf.geekdo-images.com/x3zxjr-Vw5iU4yDPg70Jgw__imagepagezoom/img/7a0LOL48K-7JNIOSGtcsNsIxkN0=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic3490053.jpg' },
  { id: uuidv4(), title: 'Cyclades Legendary', maxPlayers: 6, link: 'https://boardgamegeek.com/boardgame/380619/cyclades-legendary-edition', image: 'https://cf.geekdo-images.com/g4bC44H7rdrl0KLW7LGV5A__imagepagezoom/img/f0XWPOgK2ZVU_s3dQvc3uZv03Zo=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic7566828.png' },
  { id: uuidv4(), title: 'Pillars of Earth', maxPlayers: 4, link: 'https://boardgamegeek.com/boardgame/24480/the-pillars-of-the-earth', image: 'https://cf.geekdo-images.com/J897fuu-nl83_o90uOakVQ__imagepagezoom/img/mTT1CCkmkkdZEdfSPt4cUlXBo6o=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic3691155.jpg' },
  { id: uuidv4(), title: 'Dune War for Arakis', maxPlayers: 4, link: 'https://boardgamegeek.com/boardgame/367150/dune-war-for-arrakis', image: 'https://cf.geekdo-images.com/b_Uo-x3szhupSWeQdw5bdg__imagepage/img/87_6KXsy1UFOg4HDpiC62JWH68M=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7088918.jpg' },
  { id: uuidv4(), title: 'The White Castle', maxPlayers: 4, link: 'https://boardgamegeek.com/boardgame/371942/the-white-castle', image: 'https://cf.geekdo-images.com/qXT1U-nFh9PE8ujfdmI7dA__imagepagezoom/img/al4q0nFn_fArrNM_cXvz6jIbe8U=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic7754663.jpg' },
];

// Create players based on player-picks.csv
const samplePlayers: Player[] = [
  { id: uuidv4(), name: 'Matthew', selectionsMade: 0, picks: [sampleGames[1].id, sampleGames[8].id], actionTakenInCurrentRound: false },
  { id: uuidv4(), name: 'Jourdan', selectionsMade: 0, picks: [sampleGames[0].id, sampleGames[7].id], actionTakenInCurrentRound: false },
  { id: uuidv4(), name: 'Chris', selectionsMade: 0, picks: [sampleGames[5].id, sampleGames[12].id], actionTakenInCurrentRound: false },
  { id: uuidv4(), name: 'Jonny', selectionsMade: 0, picks: [sampleGames[3].id, sampleGames[10].id], actionTakenInCurrentRound: false },
  { id: uuidv4(), name: 'Felipe', selectionsMade: 0, picks: [sampleGames[4].id, sampleGames[11].id], actionTakenInCurrentRound: false },
  { id: uuidv4(), name: 'Paul', selectionsMade: 0, picks: [sampleGames[6].id, sampleGames[13].id], actionTakenInCurrentRound: false },
  { id: uuidv4(), name: 'Cam', selectionsMade: 0, picks: [sampleGames[2].id, sampleGames[9].id], actionTakenInCurrentRound: false },
];

const sampleTables: Table[] = [
  { id: 'table-1', gameId: null, seatedPlayerIds: [], placedByPlayerId: undefined },
  { id: 'table-2', gameId: null, seatedPlayerIds: [], placedByPlayerId: undefined }
];

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

// Helper function to calculate the number of rounds based on games and tables
const calculateTotalRounds = (games: Game[], tables: Table[]): number => {
  return Math.ceil(games.length / tables.length);
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

// Load state from localStorage or use sample data
const loadInitialState = (): SessionState => {
  const savedState = loadState();

  if (savedState) {
    return savedState;
  }

  // Use sample data if no saved state exists
  return {
    players: samplePlayers,
    // Initialize availableGames with all games that are in players' picks
    availableGames: sampleGames.filter(game => getAllPlayerPicks(samplePlayers).includes(game.id)),
    // Store all games for lookup purposes
    allGames: sampleGames,
    tables: sampleTables,
    rounds: [createInitialRound(sampleTables)],
    currentRoundIndex: 0,
    viewingRoundIndex: 0,
    isViewingHistory: false,
    turnOrder: samplePlayers.map(player => player.id),
    currentPlayerTurnIndex: 0,
    draftingComplete: false,
  };
};

const initialState = loadInitialState();

// Define the store
interface GameStore extends SessionState {
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
}

// Create the store
export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

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
      return {
        ...state,
        tables: resetTables,
        players: resetPlayers,
        availableGames: updatedAvailableGames,
        currentPlayerTurnIndex: 0, // Reset to the first player in the turn order
        viewingRoundIndex: state.currentRoundIndex, // Ensure we're viewing the current round
        isViewingHistory: false // Exit history mode when resetting a round
      };
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
      const newRound: Round = {
        id: uuidv4(),
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
      return {
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

      return {
        ...state,
        rounds: updatedRounds
      };
    });
  },

  // Place a game on a table
  placeGame: (gameId: string, tableId: string, playerId: string) => {
    set((state) => {
      // Find the game and table
      // Look in allGames first, which contains all games
      const game = state.allGames.find(g => g.id === gameId);
      const table = state.tables.find(t => t.id === tableId);
      const player = state.players.find(p => p.id === playerId);

      // Check if player has already assigned any of their picks to a table
      const hasAssignedPicks = state.tables.some(t => 
        t.gameId !== null && 
        player.picks.includes(t.gameId) && 
        t.seatedPlayerIds.includes(player.id)
      );

      // Check if the game is in the player's picks
      const isInPlayerPicks = player.picks.includes(gameId);

      // Check if the game was used in a previous round
      const isGameUsedInPreviousRound = state.rounds.slice(0, state.currentRoundIndex).some(round => 
        round.tableStates.some(tableState => tableState.gameId === gameId)
      );

      // Validate the action
      if (!game || !table || !player || table.gameId !== null || hasAssignedPicks || !isInPlayerPicks || isGameUsedInPreviousRound) {
        return state; // Invalid action, return unchanged state
      }

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

      // Calculate next player turn index
      let nextIndex = (state.currentPlayerTurnIndex + 1) % state.players.length;

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

      return {
        ...state,
        tables: updatedTables,
        players: updatedPlayers,
        availableGames: updatedAvailableGames,
        rounds: updatedRounds,
        currentPlayerTurnIndex: nextIndex,
        // Only rotate turn order if we've completed a round AND cycled through all players
        turnOrder: state.turnOrder, // Don't rotate turn order here, only at the end of a round
      };
    });

    // After updating the state, check if the round is complete and we need to create a new round
    const state = useGameStore.getState();
    if (state.rounds[state.currentRoundIndex].completed) {
      // Don't automatically create a new round, let the UI handle it
      // This allows the UI to show the completed round before moving to the next one
    }
  },

  // Join a game at a table
  joinGame: (tableId: string, playerId: string) => {
    set((state) => {
      // Find the table and player
      const table = state.tables.find(t => t.id === tableId);
      const player = state.players.find(p => p.id === playerId);

      // Validate the action
      if (!table || !player || table.gameId === null || 
          table.seatedPlayerIds.includes(playerId)) {
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

      // Calculate next player turn index
      let nextIndex = (state.currentPlayerTurnIndex + 1) % state.players.length;

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

      return {
        ...state,
        tables: updatedTables,
        players: updatedPlayers,
        rounds: updatedRounds,
        currentPlayerTurnIndex: nextIndex,
        // Don't rotate turn order here, only at the end of a round
        turnOrder: state.turnOrder,
      };
    });

    // After updating the state, check if the round is complete and we need to create a new round
    const state = useGameStore.getState();
    if (state.rounds[state.currentRoundIndex].completed) {
      // Don't automatically create a new round, let the UI handle it
      // This allows the UI to show the completed round before moving to the next one
    }
  },

  // Pass a turn
  passTurn: () => {
    // Just advance to the next player's turn without tracking passes
    useGameStore.getState().advanceTurn();
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
          // All players have taken actions, the round is effectively complete
          // We'll keep the current player's turn for now, as they'll need to start the next round
          // The UI can handle transitioning to a new round
          break;
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

      return {
        ...state,
        currentPlayerTurnIndex: nextIndex,
        turnOrder: newTurnOrder,
      };
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

      // Calculate the new current player turn index
      // Find the current player ID
      const currentPlayerId = state.turnOrder[state.currentPlayerTurnIndex];
      // Find its index in the new turn order
      const newCurrentPlayerIndex = newTurnOrder.findIndex(id => id === currentPlayerId);

      return {
        ...state,
        turnOrder: newTurnOrder,
        currentPlayerTurnIndex: newCurrentPlayerIndex,
      };
    });

    // After updating the state, check if we need to update the round's completion status
    const state = useGameStore.getState();
    if (!state.rounds[state.currentRoundIndex].completed) {
      // Check if the round is complete now
      const isComplete = useGameStore.getState().isRoundComplete();
      if (isComplete) {
        // Update the round's completion status
        set(state => {
          const updatedRounds = [...state.rounds];
          updatedRounds[state.currentRoundIndex] = {
            ...updatedRounds[state.currentRoundIndex],
            completed: true
          };

          return {
            ...state,
            rounds: updatedRounds
          };
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
        return {
          ...state,
          viewingRoundIndex: roundIndex,
          isViewingHistory: false
        };
      }

      // Otherwise, enter history mode with the specified round
      return {
        ...state,
        viewingRoundIndex: roundIndex,
        isViewingHistory: true
      };
    });
  },

  // View the previous round
  viewPreviousRound: () => {
    set(state => {
      const prevIndex = state.viewingRoundIndex - 1;
      if (prevIndex < 0) {
        return state; // No previous round
      }

      return {
        ...state,
        viewingRoundIndex: prevIndex,
        isViewingHistory: prevIndex !== state.currentRoundIndex
      };
    });
  },

  // View the next round
  viewNextRound: () => {
    set(state => {
      const nextIndex = state.viewingRoundIndex + 1;
      if (nextIndex >= state.rounds.length) {
        return state; // No next round
      }

      return {
        ...state,
        viewingRoundIndex: nextIndex,
        isViewingHistory: nextIndex !== state.currentRoundIndex
      };
    });
  },

  // Return to the current active round
  returnToCurrentRound: () => {
    set(state => ({
      ...state,
      viewingRoundIndex: state.currentRoundIndex,
      isViewingHistory: false
    }));
  },
}));

// Subscribe to state changes and save to localStorage
useGameStore.subscribe((state) => {
  saveState(state);
});
