import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { SessionState, Player, Game, Table } from '../types/types';

// Sample data for initial state
const samplePlayers: Player[] = [
  { id: uuidv4(), name: 'Player 1', selectionsMade: 0 },
  { id: uuidv4(), name: 'Player 2', selectionsMade: 0 },
  { id: uuidv4(), name: 'Player 3', selectionsMade: 0 },
  { id: uuidv4(), name: 'Player 4', selectionsMade: 0 },
];

const sampleGames: Game[] = [
  { id: uuidv4(), title: 'Catan', maxPlayers: 4, link: 'https://boardgamegeek.com/boardgame/13/catan', image: 'https://cf.geekdo-images.com/W3Bsga_uLP9kO91gZ7H8yw__imagepage/img/M_3Vg1j2HlNgkv7PL2xl2BJE2bw=/fit-in/900x600/filters:no_upscale():strip_icc()/pic2419375.jpg' },
  { id: uuidv4(), title: 'Wingspan', maxPlayers: 5, link: 'https://boardgamegeek.com/boardgame/266192/wingspan', image: 'https://cf.geekdo-images.com/yLZJCVLlIx4c7eJEWUNJ7w__imagepage/img/uIjeoKgHMcRtzRSR4MoUYl3nXxs=/fit-in/900x600/filters:no_upscale():strip_icc()/pic4458123.jpg' },
  { id: uuidv4(), title: 'Ticket to Ride', maxPlayers: 5, link: 'https://boardgamegeek.com/boardgame/9209/ticket-ride', image: 'https://cf.geekdo-images.com/ZWJg0dCdrWHxVnc0eFXK8w__imagepage/img/FcSGmLeIStNfb0l_qKpuHfluMJA=/fit-in/900x600/filters:no_upscale():strip_icc()/pic38668.jpg' },
  { id: uuidv4(), title: 'Pandemic', maxPlayers: 4, link: 'https://boardgamegeek.com/boardgame/30549/pandemic', image: 'https://cf.geekdo-images.com/S3ybV1LAp-8SnHIXLLjVqA__imagepage/img/kIBu-2Ljb_ml5n-W8gJF6VaNz2M=/fit-in/900x600/filters:no_upscale():strip_icc()/pic1534148.jpg' },
  { id: uuidv4(), title: 'Azul', maxPlayers: 4, link: 'https://boardgamegeek.com/boardgame/230802/azul', image: 'https://cf.geekdo-images.com/tz19PfklMdAdjxV9WArraA__imagepage/img/K3OydkMXhwPaEXUYMfRhn1OwQnY=/fit-in/900x600/filters:no_upscale():strip_icc()/pic3718275.jpg' },
];

const sampleTables: Table[] = [
  { id: 'table-1', gameId: null, seatedPlayerIds: [] },
  { id: 'table-2', gameId: null, seatedPlayerIds: [] },
  { id: 'table-3', gameId: null, seatedPlayerIds: [] },
];

// Initial state
const initialState: SessionState = {
  players: samplePlayers,
  availableGames: sampleGames,
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
      
      // Validate the action
      if (!game || !table || !player || table.gameId !== null || player.selectionsMade >= 2) {
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
      
      const updatedAvailableGames = state.availableGames.filter(g => g.id !== gameId);
      
      return {
        ...state,
        tables: updatedTables,
        players: updatedPlayers,
        availableGames: updatedAvailableGames,
      };
    });
    
    // Advance to the next player's turn
    set(state => {
      const { advanceTurn } = state;
      advanceTurn(true);
      return state;
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
      
      return {
        ...state,
        tables: updatedTables,
        players: updatedPlayers,
      };
    });
    
    // Advance to the next player's turn
    set(state => {
      const { advanceTurn } = state;
      advanceTurn(true);
      return state;
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