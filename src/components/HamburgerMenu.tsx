'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import SessionSelector from './SessionSelector';

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-md hover:bg-gray-200 transition-colors"
        aria-label="Menu"
      >
        <div className="w-6 h-6 flex flex-col justify-center space-y-1">
          <div className={`h-0.5 bg-gray-600 transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
          <div className={`h-0.5 bg-gray-600 transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
          <div className={`h-0.5 bg-gray-600 transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
        </div>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Menu Panel */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Menu</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-gray-200 transition-colors"
              aria-label="Close menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menu Content */}
          <div className="space-y-6">
            {/* Navigation */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Navigation</h3>
              <div className="space-y-2">
                <Link
                  href="/"
                  className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h2a2 2 0 012 2v0H8v0z" />
                    </svg>
                    <span>Tables</span>
                  </div>
                </Link>
                <Link
                    href="/library"
                    className="block w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    onClick={() => setIsOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span>Game Library</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Session Management */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Session Management</h3>
              <div>
                <SessionSelector />
              </div>
            </div>

            {/* App Info */}
            <div className="pt-6 border-t border-gray-200">
              <div className="text-center">
                <h4 className="font-bold text-gray-800">Shenanigames</h4>
                <p className="text-sm text-gray-600">Ellijay Edition</p>
                <p className="text-xs text-gray-500 mt-2">© 2025 Shenanigames, LLC</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
