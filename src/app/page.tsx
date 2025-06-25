'use client';

import PlayerInfo from '../components/PlayerInfo';
import TablesArea from '../components/TablesArea';
import DragAndDropProvider from '../components/DragAndDropProvider';
import ActivePlayerFooter from '../components/ActivePlayerFooter';
import HamburgerMenu from '../components/HamburgerMenu';
import PickRequirements from '../components/PickRequirements';
import LifecycleStatusTooltip from '../components/LifecycleStatusTooltip';
import { useState, useEffect } from 'react';
import { useSessionGameStore } from '../store/session-store';
import { useSessionManager } from '../store/session-manager';
import AnimationProvider from '../components/AnimationProvider';

export default function Home() {
  // State to track if we're on a mobile device
  const [isMobile, setIsMobile] = useState(false);

  // Get session state
  const { currentSessionId, createSession } = useSessionManager();
  const { tables, hasActiveSession, loadCurrentSession } = useSessionGameStore();

  // Check if all tables have games
  const allTablesHaveGames = tables.every(table => table.gameId !== null);

  // Initialize session if none exists
  useEffect(() => {
    if (!hasActiveSession()) {
      // Create a default session
      const sessionId = createSession({ name: 'My First Session' });
      if (sessionId) {
        loadCurrentSession();
      }
    } else {
      loadCurrentSession();
    }
  }, []);

  // Check if we're on a mobile device on component mount
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024); // 1024px is the lg breakpoint in Tailwind
    };

    // Check initially
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Apply has-warning-footer class to body when all tables have games
  useEffect(() => {
    if (isMobile && allTablesHaveGames) {
      document.body.classList.add('has-warning-footer');
    } else {
      document.body.classList.remove('has-warning-footer');
    }

    // Clean up
    return () => {
      document.body.classList.remove('has-warning-footer');
    };
  }, [isMobile, allTablesHaveGames]);

  return (
    <AnimationProvider>
      <main className={`min-h-screen p-4 ${isMobile && allTablesHaveGames ? 'pb-56' : 'pb-52'} bg-gray-100`}>
        <div className="container mx-auto">
          <header className="mb-8 sticky top-0 bg-gray-100 z-30 pt-2 pb-4">
            <div className="flex items-center mb-4">
              <div className="w-16 flex justify-start">
                <HamburgerMenu />
              </div>
              <div className="flex-1 text-center">
                <h1 className="text-3xl font-bold">Shenanigames</h1>
              </div>
              <div className="w-16 flex justify-end">
                <LifecycleStatusTooltip isMobile={isMobile} />
              </div>
            </div>
          </header>

          {/* Pick Requirements Warning */}
          <PickRequirements />

          <DragAndDropProvider>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Main content - Tables */}
              <div className={`${isMobile ? `fixed inset-0 pt-20 ${allTablesHaveGames ? 'pb-56' : 'pb-52'} px-4 mt-0` : ''}`}>
                <TablesArea isMobile={isMobile} />
              </div>

              {/* Right sidebar - Players with Remaining Picks (hidden on mobile) */}
              {!isMobile && (
                <div>
                  <PlayerInfo />
                </div>
              )}
            </div>
          </DragAndDropProvider>

          {/* Fixed footer for mobile */}
          {isMobile && <ActivePlayerFooter />}

          <footer className="mt-8 text-center text-gray-500 text-sm pb-16">
            <p>Drag and drop games to tables or players to tables with games to make selections.</p>
            <p className="mt-2">© 2025 Shenanigames, LLC</p>
          </footer>
        </div>
      </main>
    </AnimationProvider>
  );
}
