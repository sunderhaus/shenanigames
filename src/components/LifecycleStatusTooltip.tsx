'use client';

import { useState, useEffect, useRef } from 'react';
import { useSessionGameStore } from '@/store/session-store';
import { SessionStage } from '@/types/types';

interface LifecycleStatusTooltipProps {
  isMobile: boolean;
}

export default function LifecycleStatusTooltip({ isMobile }: LifecycleStatusTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  const stage = useSessionGameStore(state => state.stage);
  const canStartFirstRound = useSessionGameStore(state => state.canStartFirstRound);
  const startFirstRound = useSessionGameStore(state => state.startFirstRound);
  const canCreateNextRound = useSessionGameStore(state => state.canCreateNextRound);
  const createNewRound = useSessionGameStore(state => state.createNewRound);
  const players = useSessionGameStore(state => state.players);
  const rounds = useSessionGameStore(state => state.rounds);
  const currentRoundIndex = useSessionGameStore(state => state.currentRoundIndex);

  // Close tooltip when clicking outside (mobile only)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setIsVisible(false);
      }
    };

    if (isVisible && isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isVisible, isMobile]);

  // Handle escape key (mobile only)
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobile) {
        setIsVisible(false);
      }
    };

    if (isVisible && isMobile) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isVisible, isMobile]);

  // Handle actions
  const handleStartFirstRound = () => {
    startFirstRound();
    setIsVisible(false);
  };

  const handleCreateNextRound = () => {
    createNewRound();
    setIsVisible(false);
  };

  // Get status icon and color based on stage
  const getStatusInfo = () => {
    switch (stage) {
      case SessionStage.SETUP:
        const isReady = canStartFirstRound();
        return {
          icon: isReady ? '✅' : '⚙️',
          color: isReady ? 'text-green-600' : 'text-blue-600',
          bgColor: isReady ? 'bg-green-50' : 'bg-blue-50',
          borderColor: isReady ? 'border-green-200' : 'border-blue-200'
        };
      case SessionStage.FIRST_ROUND:
      case SessionStage.SUBSEQUENT_ROUNDS:
        const currentRound = rounds[currentRoundIndex];
        if (currentRound?.completed && canCreateNextRound()) {
          return {
            icon: '🎯',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200'
          };
        } else if (currentRound?.completed && !canCreateNextRound()) {
          return {
            icon: '🏁',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200'
          };
        } else {
          return {
            icon: '🎮',
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200'
          };
        }
      case SessionStage.COMPLETE:
        return {
          icon: '🎉',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        };
      default:
        return {
          icon: '❓',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  // Get content based on stage
  const getContent = () => {
    const currentRound = rounds[currentRoundIndex];
    
    switch (stage) {
      case SessionStage.SETUP:
        return {
          title: 'Session Setup',
          message: 'Complete the following steps to start your first round:',
          details: (
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li className={players.length >= 2 ? 'text-green-700' : ''}>
                Add at least 2 players {players.length >= 2 ? '✓' : `(${players.length}/2)`}
              </li>
              <li className={players.every(p => p.picks.length === 2) ? 'text-green-700' : ''}>
                Each player must select exactly 2 games from the library
                {players.every(p => p.picks.length === 2) ? ' ✓' : 
                 ` (${players.filter(p => p.picks.length === 2).length}/${players.length} complete)`}
              </li>
            </ul>
          ),
          action: canStartFirstRound() ? (
            <button
              onClick={handleStartFirstRound}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              Start First Round
            </button>
          ) : null
        };

      case SessionStage.FIRST_ROUND:
      case SessionStage.SUBSEQUENT_ROUNDS:
        if (currentRound?.completed && canCreateNextRound()) {
          return {
            title: `Round ${currentRoundIndex + 1} Complete!`,
            message: 'All players have made their selections. Ready to start the next round?',
            action: (
              <button
                onClick={handleCreateNextRound}
                className="mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              >
                Start Next Round
              </button>
            )
          };
        } else if (currentRound?.completed && !canCreateNextRound()) {
          return {
            title: `Round ${currentRoundIndex + 1} Complete!`,
            message: 'All player picks have been exhausted. The session is complete!'
          };
        } else {
          return {
            title: `Round ${currentRoundIndex + 1} in Progress`,
            message: 'Players are selecting games and seating. Play will begin once all players are seated at tables with games.'
          };
        }

      case SessionStage.COMPLETE:
        return {
          title: 'Session Complete! 🎉',
          message: 'All rounds have been completed and all player picks have been used. Great gaming session!'
        };

      default:
        return {
          title: 'Unknown Status',
          message: 'Session status unclear.'
        };
    }
  };

  const statusInfo = getStatusInfo();
  const content = getContent();

  return (
    <div className="relative" ref={tooltipRef}>
      {/* Status Indicator Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${statusInfo.color} hover:bg-opacity-20 hover:${statusInfo.bgColor}`}
        aria-label="View session status"
      >
        <span>{statusInfo.icon}</span>
        <span>Status</span>
      </button>

      {/* Mobile Overlay */}
      {isVisible && isMobile && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setIsVisible(false)} />
      )}

      {/* Tooltip/Popout Content */}
      {isVisible && (
        <div className={`
          ${isMobile 
            ? 'fixed top-20 left-4 right-4 z-50 shadow-xl bg-white bg-opacity-95 backdrop-blur-sm' 
            : 'absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-80 z-30 shadow-lg'
          }
          ${!isMobile ? statusInfo.bgColor : ''} border ${statusInfo.borderColor} rounded-lg p-4
        `}>
          {/* Mobile Close Button */}
          {isMobile && (
            <button
              onClick={() => setIsVisible(false)}
              className="absolute top-2 right-2 p-1 rounded-md hover:bg-gray-200 transition-colors"
              aria-label="Close status"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            {content.title}
          </h3>
          
          <p className="text-xs text-gray-700 mb-2">
            {content.message}
          </p>
          
          {content.details && (
            <div className="text-xs text-gray-700">
              {content.details}
            </div>
          )}
          
          {content.action && content.action}

          {/* Desktop Tooltip Arrow */}
          {!isMobile && (
            <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
              <div className={`w-2 h-2 ${statusInfo.bgColor} border-t border-l ${statusInfo.borderColor} transform rotate-45`}></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
