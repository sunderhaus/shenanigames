'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSessionManager } from '../../store/session-manager';
import { useGameCollections } from '../../store/game-collection-store';
import { GameSession, Player, Game, Round, SessionState } from '../../types/types';
import HamburgerMenu from '../../components/HamburgerMenu';
import Link from 'next/link';

interface GameSessionWithContext extends GameSession {
  tableId: string;
  gameId: string | null;
  gameName: string;
  roundIndex: number;
  seatedPlayerIds: string[];
  placedByPlayerId?: string;
  sessionName?: string;
  sessionType?: string;
}

export default function Results() {
  const { sessionList, currentSessionId, loadSessionById } = useSessionManager();
  const { playerList } = useGameCollections();
  const [selectedSessionIds, setSelectedSessionIds] = useState<string[]>([]);
  const [selectedSessions, setSelectedSessions] = useState<{ metadata: any; state: any }[]>([]);

  // Update selected sessions when current session changes and no sessions are selected
  useEffect(() => {
    if (currentSessionId && selectedSessionIds.length === 0) {
      setSelectedSessionIds([currentSessionId]);
    }
  }, [currentSessionId, selectedSessionIds.length]);

  // Load the actual session data when selectedSessionIds changes
  useEffect(() => {
    const sessions = selectedSessionIds
      .map(id => loadSessionById(id))
      .filter(Boolean) as { metadata: any; state: any }[];
    setSelectedSessions(sessions);
  }, [selectedSessionIds, loadSessionById]);

  // Handle session selection toggle
  const toggleSessionSelection = (sessionId: string) => {
    setSelectedSessionIds(prev => 
      prev.includes(sessionId)
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  // Clear all selections
  const clearAllSelections = () => {
    setSelectedSessionIds([]);
  };

  // Select all sessions
  const selectAllSessions = () => {
    setSelectedSessionIds(sessionList.map(s => s.id));
  };

  // Extract all game sessions with context from multiple sessions
  const allGameSessions: GameSessionWithContext[] = useMemo(() => {
    if (selectedSessions.length === 0) return [];

    const sessions: GameSessionWithContext[] = [];
    
    selectedSessions.forEach((selectedSession) => {
      selectedSession.state.rounds.forEach((round: Round, roundIndex: number) => {
        round.tableStates.forEach((tableState: any) => {
          if (tableState.gameSession && tableState.gameId) {
            const game = selectedSession.state.allGames.find((g: Game) => g.id === tableState.gameId);
            sessions.push({
              ...tableState.gameSession,
              tableId: tableState.id,
              gameId: tableState.gameId,
              gameName: game?.title || 'Unknown Game',
              roundIndex,
              seatedPlayerIds: tableState.seatedPlayerIds,
              placedByPlayerId: tableState.placedByPlayerId,
              sessionName: selectedSession.metadata.name, // Add session name for context
              sessionType: selectedSession.metadata.sessionType // Add session type for conditional rendering
            });
          }
        });
      });
    });
    
    return sessions;
  }, [selectedSessions]);

  // Calculate statistics across all selected sessions
  const statistics = useMemo(() => {
    if (selectedSessions.length === 0 || allGameSessions.length === 0) {
      return {
        totalGames: 0,
        gamesWithDuration: 0,
        mostWins: { count: 0, playerNames: 'N/A' },
        longestDuration: 0,
        averageDuration: 0,
        winnerCounts: {} as Record<string, number>
      };
    }

    let totalDurationMs = 0;
    let gamesWithDuration = 0;
    let longestDurationMs = 0;
    const winnerCounts: Record<string, number> = {};

    allGameSessions.forEach(session => {
      // Count wins
      if (session.winnerId) {
        winnerCounts[session.winnerId] = (winnerCounts[session.winnerId] || 0) + 1;
      }

      // Calculate durations
      if (session.gameStartedAt && session.gameEndedAt) {
        const startDate = session.gameStartedAt instanceof Date 
          ? session.gameStartedAt 
          : new Date(session.gameStartedAt);
        const endDate = session.gameEndedAt instanceof Date 
          ? session.gameEndedAt 
          : new Date(session.gameEndedAt);
        
        const duration = endDate.getTime() - startDate.getTime();
        
        if (duration > 0) {
          totalDurationMs += duration;
          gamesWithDuration++;
          if (duration > longestDurationMs) {
            longestDurationMs = duration;
          }
        }
      }
    });

    // Find all players tied for most wins (need to look across all selected sessions for player names)
    const winCounts = Object.values(winnerCounts);
    const maxWins = winCounts.length > 0 ? Math.max(...winCounts) : 0;
    const playersWithMostWins = maxWins > 0 ? Object.entries(winnerCounts)
      .filter(([_, wins]) => wins === maxWins)
      .map(([playerId, wins]) => ({ playerId, wins }))
      : [];

    const mostWinsPlayerNames = playersWithMostWins
      .map(({ playerId }) => {
        // Look for player in any of the selected sessions
        for (const session of selectedSessions) {
          const player = session.state.players.find((p: Player) => p.id === playerId);
          if (player) {
            return `${player.icon} ${player.name}`;
          }
        }
        
        // If not found in session data, check Player Collections (for freeform sessions)
        const collectionPlayer = playerList.find(p => p.id === playerId);
        if (collectionPlayer) {
          return `${collectionPlayer.icon} ${collectionPlayer.name}`;
        }
        
        return 'Unknown';
      })
      .join(', ');

    const averageDurationMs = gamesWithDuration > 0 ? totalDurationMs / gamesWithDuration : 0;

    return {
      totalGames: allGameSessions.length,
      gamesWithDuration,
      mostWins: {
        count: maxWins,
        playerNames: mostWinsPlayerNames || 'N/A'
      },
      longestDuration: longestDurationMs,
      averageDuration: averageDurationMs,
      winnerCounts
    };
  }, [selectedSessions, allGameSessions]);

  // Format duration helper
  const formatDuration = (durationMs: number): string => {
    if (durationMs <= 0) return 'N/A';
    
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  // Get player name helper - looks across all selected sessions and Player Collections
  const getPlayerName = (playerId: string): string => {
    // First, check in selected session data
    for (const session of selectedSessions) {
      const player = session.state.players.find((p: Player) => p.id === playerId);
      if (player) {
        return `${player.icon} ${player.name}`;
      }
    }
    
    // If not found in session data, check Player Collections (for freeform sessions)
    const collectionPlayer = playerList.find(p => p.id === playerId);
    if (collectionPlayer) {
      return `${collectionPlayer.icon} ${collectionPlayer.name}`;
    }
    
    return `Unknown Player (${playerId})`;
  };

  // Get game session duration
  const getSessionDuration = (session: GameSessionWithContext): string => {
    if (!session.gameStartedAt || !session.gameEndedAt) return 'N/A';
    
    const startDate = session.gameStartedAt instanceof Date 
      ? session.gameStartedAt 
      : new Date(session.gameStartedAt);
    const endDate = session.gameEndedAt instanceof Date 
      ? session.gameEndedAt 
      : new Date(session.gameEndedAt);
    
    const duration = endDate.getTime() - startDate.getTime();
    return formatDuration(duration);
  };

  return (
    <div className="min-h-screen p-4 bg-gray-100">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="mb-4 flex items-center">
            <div className="w-16 flex justify-start">
              <HamburgerMenu />
            </div>
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold">Shenanigames</h1>
              <p className="text-sm text-gray-600">Results</p>
            </div>
            <div className="w-16"></div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Results</h1>
                <p className="text-gray-600">
                  {selectedSessions.length === 0
                    ? 'Select sessions to view aggregated results'
                    : selectedSessions.length === 1
                    ? `Analysis for "${selectedSessions[0].metadata.name}"`
                    : `Aggregated analysis across ${selectedSessions.length} sessions`
                  }
                </p>
              </div>
            </div>

            {/* Navigation breadcrumb */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <nav className="text-sm text-gray-500">
                <Link href="/" className="hover:text-gray-700">Tables</Link>
                <span className="mx-2">•</span>
                <Link href="/library" className="hover:text-gray-700">Game Library</Link>
                <span className="mx-2">•</span>
                <Link href="/collections" className="hover:text-gray-700">Collections</Link>
                <span className="mx-2">•</span>
                <span className="text-gray-900 font-medium">Results</span>
              </nav>
            </div>
          </div>
        </div>
        {/* Session Picker */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-lg font-medium">Select Sessions:</label>
            <div className="flex gap-2">
              <button
                onClick={selectAllSessions}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                Select All
              </button>
              <button
                onClick={clearAllSelections}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Clear All
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 mb-3">
            {selectedSessionIds.length === 0 
              ? 'No sessions selected' 
              : `${selectedSessionIds.length} session${selectedSessionIds.length === 1 ? '' : 's'} selected`
            }
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-3">
            {sessionList.map(session => (
              <div
                key={session.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedSessionIds.includes(session.id)
                    ? 'bg-blue-50 border-blue-300 text-blue-900'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
                onClick={() => toggleSessionSelection(session.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{session.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(session.lastModified).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded ${
                        session.sessionType && session.sessionType.toUpperCase() === 'FREEFORM'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {session.sessionType && session.sessionType.toUpperCase() === 'FREEFORM' ? '🎲' : '🎯'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {session.playerCount} players
                      </span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-2">
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                      selectedSessionIds.includes(session.id)
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedSessionIds.includes(session.id) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedSessions.length > 0 && (
          <>
            {/* Summary Statistics */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Summary Statistics</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{statistics.totalGames}</div>
                  <div className="text-gray-600">Total Games</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{statistics.mostWins.playerNames}</div>
                  <div className="text-gray-600">Most Wins ({statistics.mostWins.count})</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{formatDuration(statistics.longestDuration)}</div>
                  <div className="text-gray-600">Longest Game</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{formatDuration(statistics.averageDuration)}</div>
                  <div className="text-gray-600">Average Duration</div>
                </div>
              </div>
            </div>

            {/* Win Counts Table */}
            {Object.keys(statistics.winnerCounts).length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-2xl font-bold mb-4">Win Counts by Player</h2>
                <div className="overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-semibold">Player</th>
                        <th className="text-left py-3 px-4 font-semibold">Wins</th>
                        <th className="text-left py-3 px-4 font-semibold">Win Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(statistics.winnerCounts)
                        .sort(([,a], [,b]) => b - a)
                        .map(([playerId, wins]) => {
                          const gamesPlayed = allGameSessions.filter(session => 
                            session.seatedPlayerIds.includes(playerId)
                          ).length;
                          const winRate = gamesPlayed > 0 ? ((wins / gamesPlayed) * 100).toFixed(1) : '0.0';
                          
                          return (
                            <tr key={playerId} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">{getPlayerName(playerId)}</td>
                              <td className="py-3 px-4">{wins}</td>
                              <td className="py-3 px-4">{winRate}%</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Detailed Game Sessions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold mb-4">Detailed Game Sessions</h2>
              {allGameSessions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No game sessions found in this session.</p>
              ) : (
                <div className="space-y-4">
                  {allGameSessions.map((session, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {session.gameName}
                            {/* Only show round info for PICKS sessions */}
                            {session.sessionType && 
                             session.sessionType.toUpperCase() !== 'FREEFORM' && (
                              <span className="text-sm text-gray-500 ml-2">(Round {session.roundIndex + 1})</span>
                            )}
                            {selectedSessions.length > 1 && session.sessionName && (
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded ml-2">
                                {session.sessionName}
                              </span>
                            )}
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-700">Picked by:</span>
                              <div className="text-gray-600">
                                {session.placedByPlayerId 
                                  ? getPlayerName(session.placedByPlayerId)
                                  : 'Unknown'
                                }
                              </div>
                            </div>
                            
                            <div>
                              <span className="font-medium text-gray-700">Winner:</span>
                              <div className="text-gray-600">
                                {session.winnerId 
                                  ? `🏆 ${getPlayerName(session.winnerId)}`
                                  : 'No winner recorded'
                                }
                              </div>
                            </div>
                            
                            <div>
                              <span className="font-medium text-gray-700">Duration:</span>
                              <div className="text-gray-600">{getSessionDuration(session)}</div>
                            </div>
                            
                            <div>
                              <span className="font-medium text-gray-700">Picked at:</span>
                              <div className="text-gray-600">
                                {session.gamePickedAt 
                                  ? (() => {
                                      const pickDate = session.gamePickedAt instanceof Date 
                                        ? session.gamePickedAt 
                                        : new Date(session.gamePickedAt);
                                      return pickDate.toLocaleDateString() + ' ' + 
                                             pickDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                    })()
                                  : 'Unknown'
                                }
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <span className="font-medium text-gray-700">Players:</span>
                            <div className="text-gray-600 mt-1">
                              {session.seatedPlayerIds.map(playerId => getPlayerName(playerId)).join(', ')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
