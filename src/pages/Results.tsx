'use client';

import { useState, useEffect } from 'react';
import { useSessionGameStore } from '../store/session-store';
import { GameSession, Player, SessionState } from '../types/types';

export default function Results() {
  const sessions = useSessionGameStore(state => state.rounds); // Assuming useSessionGameStore provides session data
  const players = useSessionGameStore(state => state.players);
  const [selectedSessionIndex, setSelectedSessionIndex] = useState<number>(0);

  const selectedSession = sessions[selectedSessionIndex];
  const allGameSessions = sessions.flatMap(session => session.tableStates.map(state => state.gameSession)).filter(Boolean) as GameSession[];

  const calculateStatistics = (sessions: GameSession[]) => {
    let totalGames = 0;
    let totalDurationMs = 0;
    let longestDurationMs = 0;
    const winnerCounts: Record<string, number> = {};

    sessions.forEach(session => {
      if (session.gameStartedAt && session.gameEndedAt) {
        totalGames += 1;

        const start = new Date(session.gameStartedAt);
        const end = new Date(session.gameEndedAt);
        const duration = end.getTime() - start.getTime();

        totalDurationMs += duration;
        if (duration > longestDurationMs) longestDurationMs = duration;
      }

      if (session.winnerId) {
        if (winnerCounts[session.winnerId]) {
          winnerCounts[session.winnerId] += 1;
        } else {
          winnerCounts[session.winnerId] = 1;
        }
      }
    });

    const averageDurationMs = totalGames > 0 ? totalDurationMs / totalGames : 0;

    // Find all players tied for most wins
    const winCounts = Object.values(winnerCounts);
    const maxWins = winCounts.length > 0 ? Math.max(...winCounts) : 0;
    const playersWithMostWins = maxWins > 0 ? Object.entries(winnerCounts)
      .filter(([_, wins]) => wins === maxWins)
      .map(([playerId, wins]) => ({ playerId, wins }))
      : [];

    return {
      mostWins: playersWithMostWins,
      longestDuration: longestDurationMs,
      averageDuration: averageDurationMs,
    };
  };

  const { mostWins, longestDuration, averageDuration } = calculateStatistics(allGameSessions);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Results</h1>

      {/* Session Picker */}
      <div className="mb-6">
        <label className="block text-lg font-medium mb-2">Select Session:</label>
        <select
          value={selectedSessionIndex}
          onChange={e => setSelectedSessionIndex(parseInt(e.target.value, 10))}
          className="px-3 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {sessions.map((_, index) => (
            <option key={index} value={index}>{`Session ${index + 1}`}</option>
          ))}
        </select>
      </div>

      {/* Summary Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Summary</h2>
        <p><strong>Most Wins:</strong> {mostWins.length > 0 ? 
          mostWins.map(({ playerId }) => 
            players.find(p => p.id === playerId)?.name || 'Unknown'
          ).join(', ') + ` (${mostWins[0].wins})` 
          : 'N/A'}</p>
        <p><strong>Longest Game:</strong> {Math.floor(longestDuration / (1000 * 60))} minutes</p>
        <p><strong>Average Duration:</strong> {Math.floor(averageDuration / (1000 * 60))} minutes</p>
      </div>

      {/* Detailed Game Sessions Information */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Detailed Game Sessions</h2>
        {selectedSession.tableStates.map((tableState, index) => {
          const session = tableState.gameSession;
          if (!session) return null;
          const pickedByPlayer = players.find(p => p.id === tableState.placedByPlayerId);
          const winner = players.find(p => p.id === session.winnerId);
          const startDate = session.gameStartedAt ? new Date(session.gameStartedAt) : null;
          const endDate = session.gameEndedAt ? new Date(session.gameEndedAt) : null;
          const durationMs = startDate && endDate ? endDate.getTime() - startDate.getTime() : 0;

          return (
            <div key={index} className="rounded-lg shadow-lg p-4 mb-4 bg-white">
              <h3 className="text-md font-bold mb-2">Game {index + 1}</h3>
              <p><strong>Picked By:</strong> {pickedByPlayer ? pickedByPlayer.name : 'Unknown'}</p>
              <p><strong>Winner:</strong> {winner ? winner.name : 'N/A'}</p>
              <p><strong>Picked At:</strong> {session.gamePickedAt ? new Date(session.gamePickedAt).toLocaleString() : 'N/A'}</p>
              <p><strong>Duration:</strong> {durationMs > 0 ? `${Math.floor(durationMs / (1000 * 60))}m` : 'N/A'}</p>
              <p><strong>Players:</strong> {tableState.seatedPlayerIds.map(id => players.find(p => p.id === id)?.name).filter(Boolean).join(', ')}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

