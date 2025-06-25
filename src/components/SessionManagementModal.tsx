import React, { useState } from 'react';
import { X, Plus, Trash2, Copy, Settings, Users } from 'lucide-react';
import { useSessionManager } from '@/store/session-manager';
import { useGameCollections } from '@/store/game-collection-store';
import { SessionMetadata } from '@/types/session-types';

interface SessionManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SessionManagementModal: React.FC<SessionManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { 
    sessionList, 
    currentSessionId, 
    createSession, 
    deleteSessionById, 
    setCurrentSession,
    duplicateSession 
  } = useSessionManager();
  const { playerList } = useGameCollections();
  
  const [newSessionName, setNewSessionName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (!isOpen) return null;

  const handleCreateSession = () => {
    if (!newSessionName.trim()) return;

    const sessionId = createSession({ name: newSessionName.trim() });
    if (sessionId) {
      setCurrentSession(sessionId);
      setNewSessionName('');
      setSelectedTemplate('');
      setShowCreateForm(false);
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
          { name: 'Chris', icon: '🦁' },
          { name: 'Jourdan', icon: '🐼' },
          { name: 'Felipe', icon: '🐻' },
          { name: 'Matthew', icon: '🦊' },
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
          'Chris': [5, 12],    // Last Light, Dune War for Arakis
          'Jourdan': [0, 7],   // Bloodstones, Realm of Reckoning
          'Felipe': [4, 11],   // The Magnificent, Great Western Trail
          'Matthew': [1, 8],   // SETI, Stupor Mundi
          'Paul': [6, 13],     // Oath, The White Castle
          'Cam': [2, 9]        // Dune, Brass: Birmingham
        }
      }
    });
    if (sessionId) {
      setCurrentSession(sessionId);
      setNewSessionName('');
      setSelectedTemplate('');
      setShowCreateForm(false);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    if (sessionList.length <= 1) {
      alert('Cannot delete the last session');
      return;
    }
    
    if (confirm('Are you sure you want to delete this session?')) {
      deleteSessionById(sessionId);
    }
  };

  const handleDuplicateSession = (session: SessionMetadata) => {
    const newName = `${session.name} (Copy)`;
    const newSessionId = duplicateSession(session.id, newName);
    if (newSessionId) {
      setCurrentSession(newSessionId);
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSession(sessionId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[120] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-800">Session Management</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Create New Session */}
          <div className="mb-6">
            {!showCreateForm ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus size={16} />
                New Session
              </button>
            ) : (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium mb-3">Create New Session</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Session name"
                    value={newSessionName}
                    onChange={(e) => setNewSessionName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateSession()}
                  />
                  
                  {/* Template selection */}
                  <div className="p-4 bg-gray-50 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Templates</h4>
                    <button
                      onClick={() => {
                        handleCreateFromFullTemplate();
                      }}
                      className="w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      🎲 Create Ellijay Edition Template
                      <span className="block text-xs text-gray-500 mt-1">
                        Pre-configured with 7 players and all original games & picks
                      </span>
                    </button>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateSession}
                      disabled={!newSessionName.trim()}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewSessionName('');
                        setSelectedTemplate('');
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sessions List */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-800">Existing Sessions</h3>
            {sessionList.map((session) => (
              <div
                key={session.id}
                className={`border rounded-lg p-4 ${
                  session.id === currentSessionId
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-800">{session.name}</h4>
                      {session.id === currentSessionId && (
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        Session data
                      </div>
                      <div className="flex items-center gap-1">
                        <Settings size={14} />
                        {new Date(session.lastModified).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {session.id !== currentSessionId && (
                      <button
                        onClick={() => handleSessionSelect(session.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Select
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDuplicateSession(session)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Duplicate session"
                    >
                      <Copy size={16} />
                    </button>
                    
                    {sessionList.length > 1 && (
                      <button
                        onClick={() => handleDeleteSession(session.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete session"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
