'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Player } from '../types/types';

// Define the context type
interface AnimationContextType {
  animatePlayerToTable: (player: Player, tableId: string) => Promise<void>;
}

// Create the context with a default value
const AnimationContext = createContext<AnimationContextType>({
  animatePlayerToTable: async () => {},
});

// Hook to use the animation context
export const useAnimation = () => useContext(AnimationContext);

interface AnimationProviderProps {
  children: React.ReactNode;
}

export const AnimationProvider: React.FC<AnimationProviderProps> = ({ children }) => {
  const [animationElements, setAnimationElements] = useState<React.ReactNode[]>([]);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);

  // Create the portal container on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const container = document.createElement('div');
      container.className = 'animation-portal';
      container.style.position = 'fixed';
      container.style.top = '0';
      container.style.left = '0';
      container.style.width = '100%';
      container.style.height = '100%';
      container.style.pointerEvents = 'none';
      container.style.zIndex = '9999';
      document.body.appendChild(container);
      setPortalContainer(container);

      return () => {
        document.body.removeChild(container);
      };
    }
  }, []);

  // Function to animate a player card to a table
  const animatePlayerToTable = async (player: Player, tableId: string): Promise<void> => {
    return new Promise((resolve) => {
      // Find the player element in the footer
      const playerElement = document.querySelector(`[data-player-id="${player.id}"]`);
      // Find the table element
      const tableElement = document.querySelector(`[data-table-id="${tableId}"]`);

      if (!playerElement || !tableElement || !portalContainer) {
        resolve();
        return;
      }

      // Get positions
      const playerRect = playerElement.getBoundingClientRect();
      const tableRect = tableElement.getBoundingClientRect();

      // Create a clone of the player element
      const clone = document.createElement('div');
      clone.className = 'player-clone';
      clone.innerHTML = `
        <div class="player-tile flex justify-between items-center p-2 border rounded-lg border-blue-500 bg-blue-50">
          <div class="flex items-center">
            <div class="player-token mr-2 current-player">
              <span>${player.icon}</span>
            </div>
            <span class="font-medium">${player.name}</span>
          </div>
        </div>
      `;

      // Set initial position and style
      clone.style.position = 'absolute';
      clone.style.top = `${playerRect.top}px`;
      clone.style.left = `${playerRect.left}px`;
      clone.style.width = `${playerRect.width}px`;
      clone.style.height = `${playerRect.height}px`;
      clone.style.transition = 'all 0.5s ease-in-out';
      clone.style.zIndex = '10000';
      clone.style.opacity = '0.9';
      clone.style.transform = 'scale(1)';

      // Add to portal
      portalContainer.appendChild(clone);

      // Force a reflow to ensure the initial position is applied
      void clone.offsetWidth;

      // Animate to table position
      clone.style.top = `${tableRect.top + tableRect.height / 2 - playerRect.height / 2}px`;
      clone.style.left = `${tableRect.left + tableRect.width / 2 - playerRect.width / 2}px`;
      clone.style.transform = 'scale(0.5)';
      clone.style.opacity = '0';

      // Clean up after animation
      setTimeout(() => {
        portalContainer.removeChild(clone);
        resolve();
      }, 500); // Match the transition duration
    });
  };

  return (
    <AnimationContext.Provider value={{ animatePlayerToTable }}>
      {children}
      {portalContainer && createPortal(animationElements, portalContainer)}
    </AnimationContext.Provider>
  );
};

export default AnimationProvider;