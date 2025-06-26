'use client';

import React, { useState } from 'react';
import { SessionType } from '@/types/session-types';
import { useSessionManager } from '@/store/session-manager';
import { useSessionGameStore } from '@/store/session-store';

interface SessionTypeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Called when session is successfully created
  onCancel?: () => void;  // Called when user cancels
}

type SessionCreationMode = 'template' | 'custom-picks' | 'freeform';

const SessionTypeSelector: React.FC<SessionTypeSelectorProps> = ({ isOpen, onClose, onSuccess, onCancel }) => {
  const [selectedMode, setSelectedMode] = useState<SessionCreationMode>('template');
  const [sessionName, setSessionName] = useState('');
  const [description, setDescription] = useState('');

  const { createSession } = useSessionManager();
  const { loadCurrentSession } = useSessionGameStore();

  const handleCreateSession = () => {
    if (selectedMode === 'template') {
      handleCreateFromTemplate();
      return;
    }
    
    if (sessionName.trim()) {
      const sessionType = selectedMode === 'freeform' ? SessionType.FREEFORM : SessionType.PICKS;
      const sessionId = createSession({
        name: sessionName.trim(),
        description: description.trim() || undefined,
        sessionType: sessionType
      });
      if (sessionId) {
        loadCurrentSession();
        // Reset form
        setSessionName('');
        setDescription('');
        setSelectedMode('template');
        // Call success callback if provided, otherwise just close
        if (onSuccess) {
          onSuccess();
        } else {
          onClose();
        }
      }
    }
  };

  const handleCreateFromTemplate = () => {
    const sessionId = createSession({
      template: {
        name: 'Ellijay Edition Template',
        description: 'Full game set with players and picks from the original Ellijay edition',
        sessionType: SessionType.PICKS,
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
        playerPicks: {
          'Jonny': [3, 10],
          'Chris': [5, 12],
          'Jourdan': [0, 7],
          'Felipe': [4, 11],
          'Matthew': [1, 8],
          'Paul': [6, 13],
          'Cam': [2, 9]
        }
      }
    });
    if (sessionId) {
      loadCurrentSession();
      // Call success callback if provided, otherwise just close
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  const getCreateButtonText = () => {
    switch (selectedMode) {
      case 'template':
        return '🎲 Create Ellijay Edition';
      case 'custom-picks':
        return '🎯 Create Custom Picks Session';
      case 'freeform':
        return '🌵 Create Freeform Session';
    }
  };

  const requiresSessionName = selectedMode !== 'template';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Create New Session</h3>
        
        {/* Session Creation Options */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Choose Session Type</h4>
          <div className="grid grid-cols-1 gap-4">
            
            {/* Template Option - Quick Setup */}
            <div 
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedMode === 'template'
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedMode('template')}
            >
              <div className="flex items-center mb-2">
                <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                  selectedMode === 'template'
                    ? 'border-green-500 bg-green-500' 
                    : 'border-gray-300'
                }`}>
                  {selectedMode === 'template' && (
                    <div className="w-full h-full rounded-full bg-white transform scale-50"></div>
                  )}
                </div>
                <h5 className="font-medium text-gray-900">🎲 Ellijay Edition Template</h5>
                <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Recommended</span>
              </div>
              <p className="text-sm text-gray-600">
                Ready-to-play session with 7 players, 14 games, and pre-configured picks.
              </p>
              <div className="mt-2 text-xs text-gray-500">
                • 7 players with unique icons and names
                • 14 classic games with BGG links
                • Pre-assigned picks for each player
                • 2 tables ready for drafting
                • Start playing immediately
              </div>
            </div>

            {/* Two-column grid for the other options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Custom Picks Mode */}
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedMode === 'custom-picks'
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedMode('custom-picks')}
              >
                <div className="flex items-center mb-2">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    selectedMode === 'custom-picks'
                      ? 'border-blue-500 bg-blue-500' 
                      : 'border-gray-300'
                  }`}>
                    {selectedMode === 'custom-picks' && (
                      <div className="w-full h-full rounded-full bg-white transform scale-50"></div>
                    )}
                  </div>
                  <h5 className="font-medium text-gray-900">🎯 Custom Picks</h5>
                </div>
                <p className="text-sm text-gray-600">
                  Set up your own picks-based session with custom players and games.
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  • Add your own players
                  • Choose games from library
                  • Players pick 2 games each
                  • Traditional structured draft
                </div>
              </div>

              {/* Freeform Mode */}
              <div 
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedMode === 'freeform'
                    ? 'border-purple-500 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedMode('freeform')}
              >
                <div className="flex items-center mb-2">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    selectedMode === 'freeform'
                      ? 'border-purple-500 bg-purple-500' 
                      : 'border-gray-300'
                  }`}>
                    {selectedMode === 'freeform' && (
                      <div className="w-full h-full rounded-full bg-white transform scale-50"></div>
                    )}
                  </div>
                  <h5 className="font-medium text-gray-900">🌵 Freeform Draft</h5>
                </div>
                <p className="text-sm text-gray-600">
                  Open drafting where players can place any game from the library.
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  • No pre-selection required
                  • Access to full game library
                  • Flexible and spontaneous
                  • Great for casual sessions
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Session Details - Only show if not using template */}
        {requiresSessionName && (
          <div className="space-y-4 mb-6">
            <div>
              <label htmlFor="sessionName" className="block text-sm font-medium text-gray-700 mb-2">
                Session Name *
              </label>
              <input
                id="sessionName"
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Enter session name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="sessionDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Description (optional)
              </label>
              <textarea
                id="sessionDescription"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter a brief description..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Template Info - Show when template is selected */}
        {selectedMode === 'template' && (
          <div className="mb-6 p-4 bg-green-50 rounded-md border border-green-200">
            <h4 className="text-sm font-medium text-green-800 mb-2">📋 What's Included:</h4>
            <div className="text-sm text-green-700 space-y-1">
              <div>• <strong>7 Players:</strong> Jonny 🐯, Chris 🦁, Jourdan 🐼, Felipe 🐻, Matthew 🦊, Paul 🦉, Cam 🐺</div>
              <div>• <strong>14 Games:</strong> Bloodstones, SETI, Dune, Kemet, and 10 more classics</div>
              <div>• <strong>Pre-configured Picks:</strong> Each player has 2 games already selected</div>
              <div>• <strong>Ready to Play:</strong> No additional setup required</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => {
              // Call cancel callback if provided, otherwise just close
              if (onCancel) {
                onCancel();
              } else {
                onClose();
              }
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateSession}
            disabled={requiresSessionName && !sessionName.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {getCreateButtonText()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTypeSelector;
