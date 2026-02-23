/**
 * Global Keyboard Shortcuts Component
 *
 * Wraps the app to provide global keyboard shortcut functionality.
 * Press '?' to open the shortcuts help modal.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import KeyboardShortcutsModal from './KeyboardShortcutsModal';

// Default keyboard shortcuts configuration
const SHORTCUTS = {
  // Navigation shortcuts (g prefix for "go to")
  'g d': { action: 'navigate', path: '/', description: 'Go to Dashboard' },
  'g s': { action: 'navigate', path: '/samples', description: 'Go to Samples' },
  'g v': { action: 'navigate', path: '/vulnerabilities', description: 'Go to Vulnerabilities' },
  'g p': { action: 'navigate', path: '/patches', description: 'Go to Patches' },
  'g e': { action: 'navigate', path: '/exploits', description: 'Go to Exploits' },
  'g a': { action: 'navigate', path: '/assets', description: 'Go to Assets' },
  'g r': { action: 'navigate', path: '/reports', description: 'Go to Reports' },
  'g t': { action: 'navigate', path: '/triage', description: 'Go to AI Triage' },
  'g l': { action: 'navigate', path: '/logs', description: 'Go to Log Analysis' },
  'g c': { action: 'navigate', path: '/compliance', description: 'Go to Compliance' },
  'g n': { action: 'navigate', path: '/network', description: 'Go to Network' },
  'g u': { action: 'navigate', path: '/users', description: 'Go to User Management' },
  'g h': { action: 'navigate', path: '/threat-hunting', description: 'Go to Threat Hunting' },
  'g i': { action: 'navigate', path: '/settings', description: 'Go to Settings' },
  'g x': { action: 'navigate', path: '/exploits/generator', description: 'Go to Exploit Generator' },
  'g o': { action: 'navigate', path: '/security-arsenal', description: 'Go to Security Arsenal' },
  'g m': { action: 'navigate', path: '/realtime', description: 'Go to Realtime Dashboard' },

  // Quick actions
  '/': { action: 'focus', target: 'search', description: 'Focus search' },
  '?': { action: 'help', description: 'Show keyboard shortcuts' },
};

export default function GlobalKeyboardShortcuts({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showHelp, setShowHelp] = useState(false);
  const [keySequence, setKeySequence] = useState('');
  const [sequenceTimeout, setSequenceTimeout] = useState(null);

  // Clear key sequence after timeout
  useEffect(() => {
    if (keySequence && !sequenceTimeout) {
      const timer = setTimeout(() => {
        setKeySequence('');
        setSequenceTimeout(null);
      }, 800);
      setSequenceTimeout(timer);
    }
    return () => {
      if (sequenceTimeout) {
        clearTimeout(sequenceTimeout);
      }
    };
  }, [keySequence]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event) => {
    // Ignore if user is typing in an input
    const tagName = event.target.tagName.toLowerCase();
    const isEditable = event.target.isContentEditable;
    const isInput = ['input', 'textarea', 'select'].includes(tagName);

    // Handle escape to close modal
    if (event.key === 'Escape') {
      if (showHelp) {
        event.preventDefault();
        setShowHelp(false);
        return;
      }
    }

    // Handle ? for help even in some inputs
    if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
      if (!isInput || event.shiftKey) {
        event.preventDefault();
        setShowHelp(prev => !prev);
        return;
      }
    }

    // Ignore other shortcuts in inputs
    if (isInput || isEditable) {
      return;
    }

    // Build current key
    let currentKey = event.key.toLowerCase();
    if (currentKey === ' ') currentKey = 'space';

    // Ignore modifier keys alone
    if (['control', 'alt', 'shift', 'meta'].includes(currentKey)) {
      return;
    }

    // Build sequence
    const newSequence = keySequence ? `${keySequence} ${currentKey}` : currentKey;

    // Check for matching shortcut
    const matchingShortcut = SHORTCUTS[newSequence];

    if (matchingShortcut) {
      event.preventDefault();

      // Clear sequence
      setKeySequence('');
      if (sequenceTimeout) {
        clearTimeout(sequenceTimeout);
        setSequenceTimeout(null);
      }

      // Execute action
      switch (matchingShortcut.action) {
        case 'navigate':
          if (location.pathname !== matchingShortcut.path) {
            navigate(matchingShortcut.path);
          }
          break;
        case 'focus':
          const searchInput = document.querySelector('[data-shortcut-target="search"], input[type="search"], input[placeholder*="Search"]');
          if (searchInput) {
            searchInput.focus();
          }
          break;
        case 'help':
          setShowHelp(prev => !prev);
          break;
        default:
          break;
      }
    } else {
      // Check if this could be the start of a sequence
      const couldBeSequence = Object.keys(SHORTCUTS).some(s =>
        s.startsWith(newSequence + ' ') || s === newSequence
      );

      if (couldBeSequence) {
        setKeySequence(newSequence);
      } else {
        setKeySequence('');
      }
    }
  }, [navigate, location.pathname, keySequence, sequenceTimeout, showHelp]);

  // Register global keyboard listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      {children}

      {/* Key sequence indicator */}
      {keySequence && (
        <div className="fixed bottom-4 right-4 z-50 px-3 py-2 bg-gray-900/90 text-white rounded-lg shadow-lg border border-gray-700">
          <span className="text-xs text-gray-400 mr-2">Waiting for:</span>
          <kbd className="px-2 py-1 bg-gray-700 rounded text-sm font-mono">{keySequence}</kbd>
        </div>
      )}

      {/* Help modal */}
      <KeyboardShortcutsModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </>
  );
}
