'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSessionManager } from '@/store/session-manager';
import { useSessionGameStore } from '@/store/session-store';
import { SessionMetadata } from '@/types/session-types';

const SessionSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSessionName, setNewSessionName] = useState('');

  const {
    sessionList,
    currentSessionId,
    createSession,
    setCurrentSession,
    deleteSessionById,
    duplicateSession,
    refreshSessionList
  } = useSessionManager();

  const { loadCurrentSession } = useSessionGameStore();

  const currentSession = sessionList.find(s => s.id === currentSessionId);

  const handleSessionSelect = (sessionId: string) => {
    if (setCurrentSession(sessionId)) {
      loadCurrentSession();
      setIsOpen(false);
    }
  };

  const handleCreateSession = () => {
    if (newSessionName.trim()) {
      const sessionId = createSession({ name: newSessionName.trim() });
      if (sessionId) {
        loadCurrentSession();
        setShowCreateModal(false);
        setNewSessionName('');
        setIsOpen(false);
      }
    }
  };

  const handleDeleteSession = (sessionId: string, sessionName: string) => {
    if (confirm(`Are you sure you want to delete "${sessionName}"? This action cannot be undone.`)) {
      deleteSessionById(sessionId);
      if (sessionId === currentSessionId) {
        loadCurrentSession();
      }
    }
  };

  const handleDuplicateSession = (sessionId: string, sessionName: string) => {
    const newName = prompt(`Enter a name for the duplicate session:`, `${sessionName} (Copy)`);
    if (newName && newName.trim()) {
      const newSessionId = duplicateSession(sessionId, newName.trim());
      if (newSessionId) {
        handleSessionSelect(newSessionId);
      }
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="relative">
      {/* Session Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Session:</span>
          <span className="text-sm text-gray-900">
            {currentSession ? currentSession.name : 'No Session Selected'}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900">Sessions</h3>
              <button
                onClick={() => {
                  setShowCreateModal(true);
                  setIsOpen(false);
                }}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                New Session
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {sessionList.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">No sessions available</p>
                <button
                  onClick={() => {
                    setShowCreateModal(true);
                    setIsOpen(false);
                  }}
                  className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
                >
                  Create your first session
                </button>
              </div>
            ) : (
              sessionList.map((session) => (
                <div
                  key={session.id}
                  className={`flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                    session.id === currentSessionId ? 'bg-blue-50' : ''
                  }`}
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handleSessionSelect(session.id)}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">
                        {session.name}
                        {session.id === currentSessionId && (
                          <span className="ml-2 text-xs text-blue-600">(Current)</span>
                        )}
                      </h4>
                      <span className="text-xs text-gray-500">
                        Round {session.currentRound}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-4 text-xs text-gray-500">
                      <span>{session.playerCount} players</span>
                      <span>{session.gameCount} games</span>
                      <span>Modified {formatDate(session.lastModified)}</span>
                    </div>
                    {session.description && (
                      <p className="mt-1 text-xs text-gray-600 truncate">
                        {session.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicateSession(session.id, session.name);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 rounded"
                      title="Duplicate session"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.id, session.name);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                      title="Delete session"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  refreshSessionList();
                  setIsOpen(false);
                }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                Refresh Sessions
              </button>
              <Link
                href="/library"
                onClick={() => setIsOpen(false)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                📚 Game Library
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Session</h3>
            
            <div className="mb-4">
              <label htmlFor="sessionName" className="block text-sm font-medium text-gray-700 mb-2">
                Session Name
              </label>
              <input
                id="sessionName"
                type="text"
                value={newSessionName}
                onChange={(e) => setNewSessionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateSession();
                  } else if (e.key === 'Escape') {
                    setShowCreateModal(false);
                    setNewSessionName('');
                  }
                }}
                placeholder="Enter session name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewSessionName('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSession}
                disabled={!newSessionName.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default SessionSelector;
