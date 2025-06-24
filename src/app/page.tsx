'use client';

import PlayersRemainingPicks from '../components/PlayersRemainingPicks';
import PlayerInfo from '../components/PlayerInfo';
import TablesArea from '../components/TablesArea';
import DragAndDropProvider from '../components/DragAndDropProvider';
import ResetStateButton from '../components/ResetStateButton';
import ActivePlayerFooter from '../components/ActivePlayerFooter';
import { useState, useEffect } from 'react';
import { useGameStore } from '../store/store';
import AnimationProvider from '../components/AnimationProvider';

export default function Home() {
  // State to track if we're on a mobile device
  const [isMobile, setIsMobile] = useState(false);

  // Get tables from the store
  const tables = useGameStore(state => state.tables);

  // Check if all tables have games
  const allTablesHaveGames = tables.every(table => table.gameId !== null);

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
      <main className={`min-h-screen p-4 ${isMobile && allTablesHaveGames ? 'pb-64' : 'pb-52'} bg-gray-100`}>
        <div className="container mx-auto">
          <header className="mb-8 sticky top-0 bg-gray-100 z-30 pt-2 pb-4">
            <h1 className="text-3xl font-bold text-center">Shenanigames</h1>
            <p className="text-center text-gray-600">Ellijay Edition</p>
          </header>

          <DragAndDropProvider>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left sidebar - Player's Remaining Picks (hidden on mobile) */}
              {!isMobile && (
                <div className="lg:col-span-3">
                  <PlayersRemainingPicks />
                </div>
              )}

              {/* Main content - Tables */}
              <div className={`${isMobile ? `fixed inset-0 pt-20 ${allTablesHaveGames ? 'pb-64' : 'pb-52'} px-4 mt-0` : 'lg:col-span-6'}`}>
                <TablesArea isMobile={isMobile} />
              </div>

              {/* Right sidebar - Player Info (hidden on mobile) */}
              {!isMobile && (
                <div className="lg:col-span-3">
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
            <div className="mt-4">
              <ResetStateButton />
            </div>
          </footer>
        </div>
      </main>
    </AnimationProvider>
  );
}
