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

  const handleCreateFromFullTemplate = () => {
    const sessionId = createSession({
      name: 'Ellijay Edition Template',
      template: {
        name: 'Ellijay Edition Template',
        description: 'Full game set with players and picks from the original Ellijay edition',
        players: [
          { name: 'Jonny', icon: '🐯' },
          { name: 'Jourdan', icon: '🐼' },
          { name: 'Chris', icon: '🦁' },
          { name: 'Matthew', icon: '🦊' },
          { name: 'Felipe', icon: '🐻' },
          { name: 'Paul', icon: '🦉' },
          { name: 'Cam', icon: '🐺' }
        ],
        games: [
          { title: 'Bloodstones', maxPlayers: 4, link: 'https://boardgamegeek.com/boardgame/284587/bloodstones', image: 'https://cf.geekdo-images.com/HV14OnnJ8csHISjCVoYmig__imagepagezoom/img/N6ldKubcFgbA_iYfb_HrwV2Iapg=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic7014527.jpg'},
          { title: 'SETI', maxPlayers: 4, link: 'https://boardgamegeek.com/boardgame/418059/seti-search-for-extraterrestrial-intelligence', image: 'https://cf.geekdo-images.com/_BUXOVRDU9g_eRwgpR5ZZw__imagepagezoom/img/Scz5h4qbJT88nUjCeTt5LI_rlyE=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic8160466.jpg' },
          { title: 'Dune', maxPlayers: 6, link: 'https://boardgamegeek.com/boardgame/283355/dune', image: 'https://cf.geekdo-images.com/2fgPg6Be--w97zoycObUgg__imagepagezoom/img/xaHCXAm16YrluAkOLF6ATbKDYHg=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic4815198.jpg' },
          { title: 'Kemet', maxPlayers: 5, link: 'https://boardgamegeek.com/boardgame/297562/kemet-blood-and-sand', image: 'https://cf.geekdo-images.com/IU-az-0jlIpoUxDHCCclNw__imagepagezoom/img/JUuxRLpu0aOMPWbSMxNj4KuT0eA=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic6230640.jpg' },
          { title: 'The Magnificent', maxPlayers: 4, link: 'https://boardgamegeek.com/boardgame/283863/the-magnificent', image: 'https://cf.geekdo-images.com/6pci74DWc7U7XuwkfpEu2Q__imagepagezoom/img/mMhV7GS5YfNRDjQ2reRjsIm6_vY=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic4871117.jpg' },
          { title: 'Last Light', maxPlayers: 8, link: 'https://boardgamegeek.com/boardgame/315727/last-light', image: 'https://cf.geekdo-images.com/zw7xI7gJD6r7zNDR-AbVAQ__imagepagezoom/img/uOxcanSS4PXD8y6rHNO3UxT8eVg=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic6338617.jpg' },
          { title: 'Oath', maxPlayers: 6, link: 'https://boardgamegeek.com/boardgame/291572/oath', image: 'https://cf.geekdo-images.com/gTxav_KKQK1rDg-XuCjCSA__imagepagezoom/img/vZVvtufTceUYyWfvHwOBTRGmXdw=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic5164812.jpg' },
          { title: 'Realm of Reckoning', maxPlayers: 5, link: 'https://boardgamegeek.com/boardgame/446893/realm-of-reckoning', image: 'https://cf.geekdo-images.com/xElMYLyj1pqtCIOhRNzA9w__imagepagezoom/img/JdGJ4hQ1GsNMuYl0AeOh0rRfqJ8=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic8899476.png' },
          { title: 'Stupor Mundi', maxPlayers: 4, link: 'https://boardgamegeek.com/boardgame/392492/stupor-mundi', image: 'https://cf.geekdo-images.com/SJvK-Hq72xOiJ_JsmB1dGA__imagepagezoom/img/lsPEsMAQx4KcaLrYnwwNArS44VM=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic7585104.jpg' },
          { title: 'Brass: Birmingham', maxPlayers: 4, link: 'https://boardgamegeek.com/boardgame/224517/brass-birmingham', image: 'https://cf.geekdo-images.com/x3zxjr-Vw5iU4yDPg70Jgw__imagepagezoom/img/7a0LOL48K-7JNIOSGtcsNsIxkN0=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic3490053.jpg' },
          { title: 'Cyclades Legendary', maxPlayers: 6, link: 'https://boardgamegeek.com/boardgame/380619/cyclades-legendary-edition', image: 'https://cf.geekdo-images.com/g4bC44H7rdrl0KLW7LGV5A__imagepagezoom/img/f0XWPOgK2ZVU_s3dQvc3uZv03Zo=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic7566828.png' },
          { title: 'Great Western Trail', maxPlayers: 4, link: 'https://boardgamegeek.com/boardgame/193738/great-western-trail', image: 'https://cf.geekdo-images.com/u1l0gH7sb_vnvDvoO_QHqA__imagepagezoom/img/cJyIiNTccBaE7UjYIsP2c-nkssE=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic4887376.jpg' },
          { title: 'Dune War for Arakis', maxPlayers: 4, link: 'https://boardgamegeek.com/boardgame/367150/dune-war-for-arrakis', image: 'https://cf.geekdo-images.com/b_Uo-x3szhupSWeQdw5bdg__imagepage/img/87_6KXsy1UFOg4HDpiC62JWH68M=/fit-in/900x600/filters:no_upscale():strip_icc()/pic7088918.jpg' },
          { title: 'The White Castle', maxPlayers: 4, link: 'https://boardgamegeek.com/boardgame/371942/the-white-castle', image: 'https://cf.geekdo-images.com/qXT1U-nFh9PE8ujfdmI7dA__imagepagezoom/img/al4q0nFn_fArrNM_cXvz6jIbe8U=/fit-in/1200x900/filters:no_upscale():strip_icc()/pic7754663.jpg' }
        ],
        tableCount: 2,
        // Player picks based on original store.ts lines 28-35
        playerPicks: {
          'Jonny': [3, 10],    // Kemet, Cyclades Legendary
          'Jourdan': [0, 7],   // Bloodstones, Realm of Reckoning
          'Chris': [5, 12],    // Last Light, Dune War for Arakis
          'Matthew': [1, 8],   // SETI, Stupor Mundi
          'Felipe': [4, 11],   // The Magnificent, Great Western Trail
          'Paul': [6, 13],     // Oath, The White Castle
          'Cam': [2, 9]        // Dune, Brass: Birmingham
        }
      }
    });
    if (sessionId) {
      loadCurrentSession();
      setShowCreateModal(false);
      setNewSessionName('');
      setIsOpen(false);
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

            <div className="mb-4 p-4 bg-gray-50 rounded-md">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Templates</h4>
              <button
                onClick={handleCreateFromFullTemplate}
                className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                🎲 Create Ellijay Edition Template
                <span className="block text-xs text-gray-500 mt-1">
                  Pre-configured with 7 players and all original games & picks
                </span>
              </button>
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
