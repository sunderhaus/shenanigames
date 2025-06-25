import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { 
  LibraryGame, 
  GameLibraryState, 
  GameFilter, 
  GameSort, 
  GameLibraryStats,
  CSVImportOptions 
} from '@/types/game-library-types';
import { 
  saveGameLibrary, 
  loadGameLibrary, 
  saveGameToLibrary, 
  removeGameFromLibrary, 
  createEmptyGameLibrary,
  importGamesToLibrary,
  exportGameLibrary,
  importGameLibrary,
  clearGameLibrary,
  bootstrapGameLibrary 
} from './game-library-persistence';

// Helper function to create a game from basic information
const createLibraryGame = (gameData: Partial<LibraryGame>): LibraryGame => {
  const now = new Date();
  return {
    id: gameData.id || uuidv4(),
    title: gameData.title || 'Untitled Game',
    maxPlayers: gameData.maxPlayers || 4,
    minPlayers: gameData.minPlayers || 1,
    link: gameData.link,
    image: gameData.image,
    dateAdded: gameData.dateAdded || now,
    tags: gameData.tags || [],
    description: gameData.description,
    playingTime: gameData.playingTime,
    complexity: gameData.complexity,
    category: gameData.category,
    designer: gameData.designer,
    publisher: gameData.publisher,
    yearPublished: gameData.yearPublished,
    isActive: gameData.isActive !== undefined ? gameData.isActive : true
  };
};

// Helper function to parse CSV data
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
};

// Load initial state
const loadInitialGameLibrary = (): GameLibraryState => {
  bootstrapGameLibrary();
  
  const savedLibrary = loadGameLibrary();
  if (savedLibrary) {
    return savedLibrary;
  }
  
  // Create initial library with some sample games
  const sampleGames: LibraryGame[] = [
    createLibraryGame({
      title: 'Bloodstones',
      maxPlayers: 4,
      minPlayers: 2,
      link: 'https://boardgamegeek.com/boardgame/284587/bloodstones',
      image: 'https://cf.geekdo-images.com/HV14OnnJ8csHISjCVoYmig__imagepagezoom/img/N6ldKubcFgbA_iYfb_HrwV2Iapg=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic7014527.jpg',
      category: 'Strategy',
      complexity: 3,
      playingTime: '60-90 minutes'
    }),
    createLibraryGame({
      title: 'SETI',
      maxPlayers: 4,
      minPlayers: 1,
      link: 'https://boardgamegeek.com/boardgame/418059/seti-search-for-extraterrestrial-intelligence',
      image: 'https://cf.geekdo-images.com/_BUXOVRDU9g_eRwgpR5ZZw__imagepagezoom/img/Scz5h4qbJT88nUjCeTt5LI_rlyE=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic8160466.jpg',
      category: 'Strategy',
      complexity: 3,
      playingTime: '60-120 minutes'
    }),
    createLibraryGame({
      title: 'Dune',
      maxPlayers: 6,
      minPlayers: 2,
      link: 'https://boardgamegeek.com/boardgame/283355/dune',
      image: 'https://cf.geekdo-images.com/2fgPg6Be--w97zoycObUgg__imagepagezoom/img/xaHCXAm16YrluAkOLF6ATbKDYHg=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic4815198.jpg',
      category: 'Strategy',
      complexity: 4,
      playingTime: '120-180 minutes'
    }),
    createLibraryGame({
      title: 'Kemet',
      maxPlayers: 5,
      minPlayers: 2,
      link: 'https://boardgamegeek.com/boardgame/297562/kemet-blood-and-sand',
      image: 'https://cf.geekdo-images.com/IU-az-0jlIpoUxDHCCclNw__imagepagezoom/img/JUuxRLpu0aOMPWbSMxNj4KuT0eA=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic6230640.jpg',
      category: 'Strategy',
      complexity: 3,
      playingTime: '90-120 minutes'
    })
  ];
  
  const initialState: GameLibraryState = {
    games: {},
    gameList: sampleGames,
    totalGames: sampleGames.length,
    lastModified: new Date()
  };
  
  // Convert gameList to games object
  sampleGames.forEach(game => {
    initialState.games[game.id] = game;
  });
  
  // Save the initial state
  saveGameLibrary(initialState);
  
  return initialState;
};

// Game Library Store
interface GameLibraryStore extends GameLibraryState {
  // Filtering and sorting
  filteredGames: LibraryGame[];
  currentFilter: GameFilter;
  currentSort: GameSort;
  
  // CRUD operations
  addGame: (gameData: Partial<LibraryGame>) => string;
  updateGame: (gameId: string, updates: Partial<LibraryGame>) => boolean;
  deleteGame: (gameId: string) => boolean;
  toggleGameActive: (gameId: string) => boolean;
  
  // Filtering and sorting
  setFilter: (filter: GameFilter) => void;
  setSort: (sort: GameSort) => void;
  clearFilters: () => void;
  applyFilters: (games: LibraryGame[], filter: GameFilter) => LibraryGame[];
  
  // CSV import/export
  importFromCSV: (csvData: string, options: CSVImportOptions) => { success: boolean; imported: number; errors: string[] };
  exportToCSV: () => string;
  exportToJSON: () => string | null;
  importFromJSON: (jsonData: string, overwrite?: boolean) => boolean;
  
  // Statistics
  getStats: () => GameLibraryStats;
  
  // Utility functions
  refreshLibrary: () => void;
  clearLibrary: () => void;
  
  // Get games for session use
  getActiveGames: () => LibraryGame[];
  getGameById: (gameId: string) => LibraryGame | undefined;
}

export const useGameLibrary = create<GameLibraryStore>((set, get) => ({
  ...loadInitialGameLibrary(),
  filteredGames: [],
  currentFilter: {},
  currentSort: { by: 'title', order: 'asc' },

  // Add a new game to the library
  addGame: (gameData: Partial<LibraryGame>) => {
    const newGame = createLibraryGame(gameData);
    
    set(state => {
      const newGames = { ...state.games, [newGame.id]: newGame };
      const newGameList = Object.values(newGames).sort((a, b) => {
        const { by, order } = state.currentSort;
        const multiplier = order === 'asc' ? 1 : -1;
        
        switch (by) {
          case 'title':
            return a.title.localeCompare(b.title) * multiplier;
          case 'dateAdded':
            return (a.dateAdded.getTime() - b.dateAdded.getTime()) * multiplier;
          case 'maxPlayers':
            return (a.maxPlayers - b.maxPlayers) * multiplier;
          case 'complexity':
            return ((a.complexity || 0) - (b.complexity || 0)) * multiplier;
          case 'yearPublished':
            return ((a.yearPublished || 0) - (b.yearPublished || 0)) * multiplier;
          default:
            return 0;
        }
      });
      
      const newState = {
        ...state,
        games: newGames,
        gameList: newGameList,
        totalGames: newGameList.length,
        lastModified: new Date()
      };
      
      // Apply current filters
      newState.filteredGames = get().applyFilters(newGameList, state.currentFilter);
      
      saveGameLibrary(newState);
      return newState;
    });
    
    return newGame.id;
  },

  // Update an existing game
  updateGame: (gameId: string, updates: Partial<LibraryGame>) => {
    const state = get();
    const existingGame = state.games[gameId];
    if (!existingGame) return false;
    
    set(currentState => {
      const updatedGame = { ...existingGame, ...updates };
      const newGames = { ...currentState.games, [gameId]: updatedGame };
      const newGameList = Object.values(newGames).sort((a, b) => {
        const { by, order } = currentState.currentSort;
        const multiplier = order === 'asc' ? 1 : -1;
        
        switch (by) {
          case 'title':
            return a.title.localeCompare(b.title) * multiplier;
          case 'dateAdded':
            return (a.dateAdded.getTime() - b.dateAdded.getTime()) * multiplier;
          case 'maxPlayers':
            return (a.maxPlayers - b.maxPlayers) * multiplier;
          case 'complexity':
            return ((a.complexity || 0) - (b.complexity || 0)) * multiplier;
          case 'yearPublished':
            return ((a.yearPublished || 0) - (b.yearPublished || 0)) * multiplier;
          default:
            return 0;
        }
      });
      
      const newState = {
        ...currentState,
        games: newGames,
        gameList: newGameList,
        lastModified: new Date()
      };
      
      // Apply current filters
      newState.filteredGames = get().applyFilters(newGameList, currentState.currentFilter);
      
      saveGameLibrary(newState);
      return newState;
    });
    
    return true;
  },

  // Delete a game from the library
  deleteGame: (gameId: string) => {
    const state = get();
    if (!state.games[gameId]) return false;
    
    set(currentState => {
      const newGames = { ...currentState.games };
      delete newGames[gameId];
      
      const newGameList = Object.values(newGames);
      const newState = {
        ...currentState,
        games: newGames,
        gameList: newGameList,
        totalGames: newGameList.length,
        lastModified: new Date()
      };
      
      // Apply current filters
      newState.filteredGames = get().applyFilters(newGameList, currentState.currentFilter);
      
      saveGameLibrary(newState);
      return newState;
    });
    
    return true;
  },

  // Toggle game active status
  toggleGameActive: (gameId: string) => {
    const state = get();
    const game = state.games[gameId];
    if (!game) return false;
    
    return get().updateGame(gameId, { isActive: !game.isActive });
  },

  // Apply filters to games (helper function)
  applyFilters: (games: LibraryGame[], filter: GameFilter): LibraryGame[] => {
    return games.filter(game => {
      // Search filter
      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        const matchesSearch = 
          game.title.toLowerCase().includes(searchLower) ||
          game.description?.toLowerCase().includes(searchLower) ||
          game.designer?.toLowerCase().includes(searchLower) ||
          game.publisher?.toLowerCase().includes(searchLower) ||
          game.category?.toLowerCase().includes(searchLower) ||
          game.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        
        if (!matchesSearch) return false;
      }
      
      // Category filter
      if (filter.category && game.category !== filter.category) {
        return false;
      }
      
      // Tags filter
      if (filter.tags && filter.tags.length > 0) {
        const hasMatchingTag = filter.tags.some(tag => 
          game.tags?.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }
      
      // Player count filters
      if (filter.minPlayers !== undefined && game.maxPlayers < filter.minPlayers) {
        return false;
      }
      
      if (filter.maxPlayers !== undefined && (game.minPlayers || 1) > filter.maxPlayers) {
        return false;
      }
      
      // Complexity filter
      if (filter.complexity && filter.complexity.length > 0) {
        if (!game.complexity || !filter.complexity.includes(game.complexity)) {
          return false;
        }
      }
      
      // Active filter
      if (filter.isActive !== undefined && game.isActive !== filter.isActive) {
        return false;
      }
      
      return true;
    });
  },

  // Set filter and update filtered games
  setFilter: (filter: GameFilter) => {
    set(state => {
      const newState = {
        ...state,
        currentFilter: filter,
        filteredGames: get().applyFilters(state.gameList, filter)
      };
      return newState;
    });
  },

  // Set sort and update game list
  setSort: (sort: GameSort) => {
    set(state => {
      const sortedGames = [...state.gameList].sort((a, b) => {
        const multiplier = sort.order === 'asc' ? 1 : -1;
        
        switch (sort.by) {
          case 'title':
            return a.title.localeCompare(b.title) * multiplier;
          case 'dateAdded':
            return (a.dateAdded.getTime() - b.dateAdded.getTime()) * multiplier;
          case 'maxPlayers':
            return (a.maxPlayers - b.maxPlayers) * multiplier;
          case 'complexity':
            return ((a.complexity || 0) - (b.complexity || 0)) * multiplier;
          case 'yearPublished':
            return ((a.yearPublished || 0) - (b.yearPublished || 0)) * multiplier;
          default:
            return 0;
        }
      });
      
      const newState = {
        ...state,
        currentSort: sort,
        gameList: sortedGames,
        filteredGames: get().applyFilters(sortedGames, state.currentFilter)
      };
      
      saveGameLibrary(newState);
      return newState;
    });
  },

  // Clear all filters
  clearFilters: () => {
    set(state => ({
      ...state,
      currentFilter: {},
      filteredGames: state.gameList
    }));
  },

  // Import games from CSV
  importFromCSV: (csvData: string, options: CSVImportOptions) => {
    const lines = csvData.split('\n').filter(line => line.trim());
    const errors: string[] = [];
    const games: LibraryGame[] = [];
    
    const startIndex = options.skipFirstRow ? 1 : 0;
    
    for (let i = startIndex; i < lines.length; i++) {
      try {
        const columns = parseCSVLine(lines[i]);
        const mapping = options.mapping;
        
        // Extract basic required fields
        const titleIndex = parseInt(mapping.title);
        const maxPlayersIndex = parseInt(mapping.maxPlayers);
        
        if (isNaN(titleIndex) || isNaN(maxPlayersIndex) || 
            !columns[titleIndex] || !columns[maxPlayersIndex]) {
          errors.push(`Line ${i + 1}: Missing required title or maxPlayers`);
          continue;
        }
        
        const gameData: Partial<LibraryGame> = {
          title: columns[titleIndex].trim(),
          maxPlayers: parseInt(columns[maxPlayersIndex]) || 4
        };
        
        // Extract optional fields
        if (mapping.minPlayers) {
          const minPlayersIndex = parseInt(mapping.minPlayers);
          if (!isNaN(minPlayersIndex) && columns[minPlayersIndex]) {
            gameData.minPlayers = parseInt(columns[minPlayersIndex]) || 1;
          }
        }
        
        if (mapping.link) {
          const linkIndex = parseInt(mapping.link);
          if (!isNaN(linkIndex) && columns[linkIndex]) {
            gameData.link = columns[linkIndex].trim();
          }
        }
        
        if (mapping.image) {
          const imageIndex = parseInt(mapping.image);
          if (!isNaN(imageIndex) && columns[imageIndex]) {
            gameData.image = columns[imageIndex].trim();
          }
        }
        
        if (mapping.description) {
          const descIndex = parseInt(mapping.description);
          if (!isNaN(descIndex) && columns[descIndex]) {
            gameData.description = columns[descIndex].trim();
          }
        }
        
        if (mapping.category) {
          const categoryIndex = parseInt(mapping.category);
          if (!isNaN(categoryIndex) && columns[categoryIndex]) {
            gameData.category = columns[categoryIndex].trim();
          }
        }
        
        if (mapping.tags) {
          const tagsIndex = parseInt(mapping.tags);
          if (!isNaN(tagsIndex) && columns[tagsIndex]) {
            gameData.tags = columns[tagsIndex].split(options.tagSeparator).map(tag => tag.trim());
          }
        }
        
        if (mapping.playingTime) {
          const timeIndex = parseInt(mapping.playingTime);
          if (!isNaN(timeIndex) && columns[timeIndex]) {
            gameData.playingTime = columns[timeIndex].trim();
          }
        }
        
        if (mapping.complexity) {
          const complexityIndex = parseInt(mapping.complexity);
          if (!isNaN(complexityIndex) && columns[complexityIndex]) {
            gameData.complexity = parseInt(columns[complexityIndex]) || undefined;
          }
        }
        
        if (mapping.designer) {
          const designerIndex = parseInt(mapping.designer);
          if (!isNaN(designerIndex) && columns[designerIndex]) {
            gameData.designer = columns[designerIndex].trim();
          }
        }
        
        if (mapping.publisher) {
          const publisherIndex = parseInt(mapping.publisher);
          if (!isNaN(publisherIndex) && columns[publisherIndex]) {
            gameData.publisher = columns[publisherIndex].trim();
          }
        }
        
        if (mapping.yearPublished) {
          const yearIndex = parseInt(mapping.yearPublished);
          if (!isNaN(yearIndex) && columns[yearIndex]) {
            gameData.yearPublished = parseInt(columns[yearIndex]) || undefined;
          }
        }
        
        games.push(createLibraryGame(gameData));
      } catch (error) {
        errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    const imported = importGamesToLibrary(games, options.overwriteExisting);
    
    // Refresh the store
    get().refreshLibrary();
    
    return {
      success: imported > 0,
      imported,
      errors
    };
  },

  // Export games to CSV
  exportToCSV: () => {
    const state = get();
    const headers = ['Title', 'Max Players', 'Min Players', 'Category', 'Complexity', 'Playing Time', 'Designer', 'Publisher', 'Year Published', 'Description', 'Tags', 'Link', 'Image'];
    
    const rows = state.gameList.map(game => [
      `"${game.title}"`,
      game.maxPlayers.toString(),
      (game.minPlayers || 1).toString(),
      `"${game.category || ''}"`,
      (game.complexity || '').toString(),
      `"${game.playingTime || ''}"`,
      `"${game.designer || ''}"`,
      `"${game.publisher || ''}"`,
      (game.yearPublished || '').toString(),
      `"${game.description || ''}"`,
      `"${game.tags?.join(', ') || ''}"`,
      `"${game.link || ''}"`,
      `"${game.image || ''}"`
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  },

  // Export to JSON
  exportToJSON: () => {
    const exportData = exportGameLibrary();
    return exportData ? JSON.stringify(exportData, null, 2) : null;
  },

  // Import from JSON
  importFromJSON: (jsonData: string, overwrite = false) => {
    try {
      const exportData = JSON.parse(jsonData);
      const success = importGameLibrary(exportData, overwrite);
      if (success) {
        get().refreshLibrary();
      }
      return success;
    } catch (error) {
      console.error('Error importing JSON:', error);
      return false;
    }
  },

  // Get library statistics
  getStats: () => {
    const state = get();
    const stats: GameLibraryStats = {
      totalGames: state.totalGames,
      activeGames: state.gameList.filter(g => g.isActive).length,
      inactiveGames: state.gameList.filter(g => !g.isActive).length,
      categoryCounts: {},
      tagCounts: {},
      complexityDistribution: {},
      playerCountDistribution: {}
    };
    
    state.gameList.forEach(game => {
      // Category counts
      if (game.category) {
        stats.categoryCounts[game.category] = (stats.categoryCounts[game.category] || 0) + 1;
      }
      
      // Tag counts
      game.tags?.forEach(tag => {
        stats.tagCounts[tag] = (stats.tagCounts[tag] || 0) + 1;
      });
      
      // Complexity distribution
      if (game.complexity) {
        stats.complexityDistribution[game.complexity] = (stats.complexityDistribution[game.complexity] || 0) + 1;
      }
      
      // Player count distribution
      stats.playerCountDistribution[game.maxPlayers] = (stats.playerCountDistribution[game.maxPlayers] || 0) + 1;
    });
    
    return stats;
  },

  // Refresh library from localStorage
  refreshLibrary: () => {
    const freshState = loadGameLibrary();
    if (freshState) {
      set(state => ({
        ...freshState,
        currentFilter: state.currentFilter,
        currentSort: state.currentSort,
        filteredGames: get().applyFilters(freshState.gameList, state.currentFilter)
      }));
    }
  },

  // Clear entire library
  clearLibrary: () => {
    clearGameLibrary();
    set(createEmptyGameLibrary());
  },

  // Get active games for session use
  getActiveGames: () => {
    return get().gameList.filter(game => game.isActive);
  },

  // Get game by ID
  getGameById: (gameId: string) => {
    return get().games[gameId];
  }
}));

// Initialize filtered games on first load
setTimeout(() => {
  const store = useGameLibrary.getState();
  store.setFilter(store.currentFilter);
}, 0);

// Subscribe to changes and save to localStorage
useGameLibrary.subscribe((state) => {
  saveGameLibrary(state);
});
