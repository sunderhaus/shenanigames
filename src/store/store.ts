import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { SessionState, Player, Game, Table } from '@/types/types';

// Sample data for initial state based on player-picks.csv
const sampleGames: Game[] = [
  { id: uuidv4(), title: 'Bloodstones', maxPlayers: 4 , link: 'https://boardgamegeek.com/boardgame/284587/bloodstones', image: 'https://cf.geekdo-images.com/HV14OnnJ8csHISjCVoYmig__imagepagezoom/img/N6ldKubcFgbA_iYfb_HrwV2Iapg=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic7014527.jpg'},
  { id: uuidv4(), title: 'SETI', maxPlayers: 4, link: 'https://boardgamegeek.com/boardgame/418059/seti-search-for-extraterrestrial-intelligence', image: 'https://cf.geekdo-images.com/_BUXOVRDU9g_eRwgpR5ZZw__imagepagezoom/img/Scz5h4qbJT88nUjCeTt5LI_rlyE=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic8160466.jpg' },
  { id: uuidv4(), title: 'Dune', maxPlayers: 6, link: 'https://boardgamegeek.com/boardgame/283355/dune', image: 'https://cf.geekdo-images.com/2fgPg6Be--w97zoycObUgg__imagepagezoom/img/xaHCXAm16YrluAkOLF6ATbKDYHg=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic4815198.jpg' },
  { id: uuidv4(), title: 'New Kemet', maxPlayers: 5, link: 'https://boardgamegeek.com/boardgame/297562/kemet-blood-and-sand', image: 'https://boardgamegeek.com/boardgame/297562/kemet-blood-and-sand' },
  { id: uuidv4(), title: 'Champions of Midgard', maxPlayers: 4, link: 'https://boardgamegeek.com/boardgame/172287/champions-of-midgard', image: 'https://cf.geekdo-images.com/VJwOnMF5vwJg2Yaq6ozn3Q__imagepagezoom/img/KTdvwhXefkXRFiOYbl8HVLq9aKk=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic2869714.jpg' },
  { id: uuidv4(), title: 'Last Light', maxPlayers: 8, link: 'https://boardgamegeek.com/boardgame/315727/last-light', image: 'https://cf.geekdo-images.com/zw7xI7gJD6r7zNDR-AbVAQ__imagepagezoom/img/uOxcanSS4PXD8y6rHNO3UxT8eVg=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic6338617.jpg' },
  { id: uuidv4(), title: 'Oath', maxPlayers: 6, link: 'https://boardgamegeek.com/boardgame/291572/oath', image: 'https://cf.geekdo-images.com/gTxav_KKQK1rDg-XuCjCSA__imagepagezoom/img/vZVvtufTceUYyWfvHwOBTRGmXdw=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic5164812.jpg' },
  { id: uuidv4(), title: 'Realm of Reckoning', maxPlayers: 4, link: 'https://boardgamegeek.com/boardgame/446893/realm-of-reckoning', image: 'https://cf.geekdo-images.com/xElMYLyj1pqtCIOhRNzA9w__imagepagezoom/img/JdGJ4hQ1GsNMuYl0AeOh0rRfqJ8=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic8899476.png' },
  { id: uuidv4(), title: 'Stupor Mundi', maxPlayers: 4, link: 'https://boardgamegeek.com/boardgame/392492/stupor-mundi', image: 'https://cf.geekdo-images.com/SJvK-Hq72xOiJ_JsmB1dGA__imagepagezoom/img/lsPEsMAQx4KcaLrYnwwNArS44VM=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic7585104.jpg' },
  { id: uuidv4(), title: 'Brass: Birmingham', maxPlayers: 4, link: 'https://boardgamegeek.com/boardgame/224517/brass-birmingham', image: 'https://cf.geekdo-images.com/x3zxjr-Vw5iU4yDPg70Jgw__imagepagezoom/img/7a0LOL48K-7JNIOSGtcsNsIxkN0=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic3490053.jpg' },
  { id: uuidv4(), title: 'Cyclades Legendary', maxPlayers: 5, link: '', image: '' },
  { id: uuidv4(), title: 'Pillars of Earth', maxPlayers: 4, link: '', image: '' },
  { id: uuidv4(), title: 'Dune War for Arakis', maxPlayers: 2, link: '', image: '' },
  { id: uuidv4(), title: 'The White Castle', maxPlayers: 4, link: '', image: '' },
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
  advanceTurn: () => void;
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
      const game = state.availableGames.find(g => g.id === table.gameId);

      // If game is not in availableGames, use a default maxPlayers value
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
      };
    });
  },

  // Pass a turn
  passTurn: () => {
    // Just advance to the next player's turn without tracking passes
    useGameStore.getState().advanceTurn();
  },

  // Advance to the next player's turn
  advanceTurn: () => {
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
      };
    });
  },
}));
