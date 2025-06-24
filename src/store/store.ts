import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { SessionState, Player, Game, Table } from '@/types/types';

// Sample data for initial state based on player-picks.csv
const sampleGames: Game[] = [
  { id: uuidv4(), title: 'Bloodstones', maxPlayers: 4 },
  { id: uuidv4(), title: 'SETI', maxPlayers: 4 },
  { id: uuidv4(), title: 'Dune', maxPlayers: 6 },
  { id: uuidv4(), title: 'New Kemet', maxPlayers: 5 },
  { id: uuidv4(), title: 'Champions of Midgard', maxPlayers: 4 },
  { id: uuidv4(), title: 'Last Light', maxPlayers: 8 },
  { id: uuidv4(), title: 'Oath', maxPlayers: 6 },
  { id: uuidv4(), title: 'Realm of Reckoning', maxPlayers: 4 },
  { id: uuidv4(), title: 'Stupor Mundi', maxPlayers: 4 },
  { id: uuidv4(), title: 'Brass: Birmingham', maxPlayers: 4 },
  { id: uuidv4(), title: 'Cyclades Legendary', maxPlayers: 5 },
  { id: uuidv4(), title: 'Pillars of Earth', maxPlayers: 4 },
  { id: uuidv4(), title: 'Dune War for Arakis', maxPlayers: 2 },
  { id: uuidv4(), title: 'The White Castle', maxPlayers: 4 },
];

// Create players based on player-picks.csv
const samplePlayers: Player[] = [
  { id: uuidv4(), name: 'Jourdan', selectionsMade: 0, picks: [sampleGames[0].id, sampleGames[7].id] },
  { id: uuidv4(), name: 'Matthew', selectionsMade: 0, picks: [sampleGames[1].id, sampleGames[8].id] },
  { id: uuidv4(), name: 'Cam', selectionsMade: 0, picks: [sampleGames[2].id, sampleGames[9].id] },
  { id: uuidv4(), name: 'Jonny', selectionsMade: 0, picks: [sampleGames[3].id, sampleGames[10].id] },
  { id: uuidv4(), name: 'Felipe', selectionsMade: 0, picks: [sampleGames[4].id, sampleGames[11].id] },
  { id: uuidv4(), name: 'Chris', selectionsMade: 0, picks: [sampleGames[5].id, sampleGames[12].id] },
  { id: uuidv4(), name: 'Paul', selectionsMade: 0, picks: [sampleGames[6].id, sampleGames[13].id] },
];

const sampleTables: Table[] = [
  { id: 'table-1', gameId: null, seatedPlayerIds: [] },
  { id: 'table-2', gameId: null, seatedPlayerIds: [] }
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

// Initial state
const initialState: SessionState = {
  players: samplePlayers,
  // Initialize availableGames with all games that are in players' picks
  availableGames: sampleGames.filter(game => getAllPlayerPicks(samplePlayers).includes(game.id)),
  tables: sampleTables,
  turnOrder: samplePlayers.map(player => player.id),
  currentPlayerTurnIndex: 0,
  consecutivePasses: 0,
  draftingComplete: false,
};

// Define the store
interface GameStore extends SessionState {
  // Action to place a game on a table
  placeGame: (gameId: string, tableId: string, playerId: string) => void;

  // Action to join a game at a table
  joinGame: (tableId: string, playerId: string) => void;

  // Action to pass a turn
  passTurn: () => void;

  // Helper to advance to the next player's turn
  advanceTurn: (resetPasses: boolean) => void;
}

// Create the store
export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  // Place a game on a table
  placeGame: (gameId: string, tableId: string, playerId: string) => {
    set((state) => {
      // Find the game and table
      const game = state.availableGames.find(g => g.id === gameId);
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

      // Validate the action
      if (!game || !table || !player || table.gameId !== null || hasAssignedPicks || !isInPlayerPicks) {
        return state; // Invalid action, return unchanged state
      }

      // Update the state
      const updatedTables = state.tables.map(t => 
        t.id === tableId 
          ? { ...t, gameId: gameId, seatedPlayerIds: [...t.seatedPlayerIds, playerId] } 
          : t
      );

      const updatedPlayers = state.players.map(p => 
        p.id === playerId 
          ? { ...p, selectionsMade: p.selectionsMade + 1 } 
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
      let newTurnOrder = [...state.turnOrder];

      // If we've completed a round, rotate the turn order
      if (nextIndex === 0) {
        newTurnOrder = [...state.turnOrder.slice(1), state.turnOrder[0]];
      }

      return {
        ...state,
        tables: updatedTables,
        players: updatedPlayers,
        availableGames: updatedAvailableGames,
        currentPlayerTurnIndex: nextIndex,
        turnOrder: newTurnOrder,
        consecutivePasses: 0, // Reset passes when a game is placed
      };
    });
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
      const game = state.availableGames.find(g => g.id === table.gameId) || 
                  state.tables.find(t => t.gameId === table.gameId && t.id !== tableId)?.gameId;

      if (!game || table.seatedPlayerIds.length >= (typeof game === 'string' ? 4 : game.maxPlayers)) {
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
          ? { ...p, selectionsMade: p.selectionsMade + 1 } 
          : p
      );

      // Calculate next player turn index
      let nextIndex = (state.currentPlayerTurnIndex + 1) % state.players.length;
      let newTurnOrder = [...state.turnOrder];

      // If we've completed a round, rotate the turn order
      if (nextIndex === 0) {
        newTurnOrder = [...state.turnOrder.slice(1), state.turnOrder[0]];
      }

      return {
        ...state,
        tables: updatedTables,
        players: updatedPlayers,
        currentPlayerTurnIndex: nextIndex,
        turnOrder: newTurnOrder,
        consecutivePasses: 0, // Reset passes when a player joins a game
      };
    });
  },

  // Pass a turn
  passTurn: () => {
    set(state => {
      const { advanceTurn } = state;
      advanceTurn(false);
      return {
        ...state,
        consecutivePasses: state.consecutivePasses + 1,
      };
    });

    // Check if drafting is complete
    set(state => {
      if (state.consecutivePasses === state.players.length) {
        return {
          ...state,
          draftingComplete: true,
        };
      }
      return state;
    });
  },

  // Advance to the next player's turn
  advanceTurn: (resetPasses: boolean) => {
    set(state => {
      let nextIndex = (state.currentPlayerTurnIndex + 1) % state.players.length;
      let newTurnOrder = [...state.turnOrder];

      // If we've completed a round, rotate the turn order
      if (nextIndex === 0) {
        newTurnOrder = [...state.turnOrder.slice(1), state.turnOrder[0]];
      }

      return {
        ...state,
        currentPlayerTurnIndex: nextIndex,
        turnOrder: newTurnOrder,
        consecutivePasses: resetPasses ? 0 : state.consecutivePasses,
      };
    });
  },
}));
