'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSessionManager } from '../../store/session-manager';
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
}

export default function Results() {
  const { sessionList, currentSessionId, loadSessionById } = useSessionManager();
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(currentSessionId);
  const [selectedSession, setSelectedSession] = useState<{ metadata: any; state: any } | null>(null);

  // Update selected session when current session changes
  useEffect(() => {
    if (currentSessionId && !selectedSessionId) {
      setSelectedSessionId(currentSessionId);
    }
  }, [currentSessionId, selectedSessionId]);

  // Load the actual session data when selectedSessionId changes
  useEffect(() => {
    if (selectedSessionId) {
      const session = loadSessionById(selectedSessionId);
      setSelectedSession(session);
    } else {
      setSelectedSession(null);
    }
  }, [selectedSessionId, loadSessionById]);

  // Extract all game sessions with context
  const allGameSessions: GameSessionWithContext[] = useMemo(() => {
    if (!selectedSession) return [];

    const sessions: GameSessionWithContext[] = [];
    
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
            placedByPlayerId: tableState.placedByPlayerId
          });
        }
      });
    });
    
    return sessions;
  }, [selectedSession]);

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!selectedSession || allGameSessions.length === 0) {
      return {
        totalGames: 0,
        gamesWithDuration: 0,
        mostWins: { playerId: '', count: 0, playerName: 'N/A' },
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

    // Find all players tied for most wins
    const winCounts = Object.values(winnerCounts);
    const maxWins = winCounts.length > 0 ? Math.max(...winCounts) : 0;
    const playersWithMostWins = maxWins > 0 ? Object.entries(winnerCounts)
      .filter(([_, wins]) => wins === maxWins)
      .map(([playerId, wins]) => ({ playerId, wins }))
      : [];

    const mostWinsPlayerNames = playersWithMostWins
      .map(({ playerId }) => {
        const player = selectedSession.state.players.find((p: Player) => p.id === playerId);
        return player ? `${player.icon} ${player.name}` : 'Unknown';
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
  }, [selectedSession, allGameSessions]);

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

  // Get player name helper
  const getPlayerName = (playerId: string): string => {
    const player = selectedSession?.state.players.find((p: Player) => p.id === playerId);
    return player ? `${player.icon} ${player.name}` : 'Unknown Player';
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
                  {selectedSession 
                    ? `Analysis for "${selectedSession.metadata.name}"`
                    : 'Select a session to view results'
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
          <label className="block text-lg font-medium mb-3">Select Session:</label>
          <select
            value={selectedSessionId || ''}
            onChange={e => setSelectedSessionId(e.target.value || null)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">-- Select a session --</option>
            {sessionList.map(session => (
              <option key={session.id} value={session.id}>
                {session.name} ({new Date(session.lastModified).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>

        {selectedSession && (
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
                            <span className="text-sm text-gray-500 ml-2">(Round {session.roundIndex + 1})</span>
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
