/**
 * Keyboard Shortcuts Hook for Power-User Navigation
 *
 * Provides global keyboard shortcuts for quick navigation and common actions.
 * Use '?' to show the shortcuts help modal.
 */

import { useEffect, useCallback, useState, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// Default keyboard shortcuts configuration
const DEFAULT_SHORTCUTS = {
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

  // Quick actions
  '/': { action: 'focus', target: 'search', description: 'Focus search' },
  'n': { action: 'callback', id: 'new', description: 'New item (context-sensitive)' },
  'r': { action: 'callback', id: 'refresh', description: 'Refresh current view' },
  'Escape': { action: 'callback', id: 'escape', description: 'Close modal / Cancel' },

  // Help
  '?': { action: 'callback', id: 'showHelp', description: 'Show keyboard shortcuts' },

  // Selection / List navigation (when in a list context)
  'j': { action: 'callback', id: 'nextItem', description: 'Next item in list' },
  'k': { action: 'callback', id: 'prevItem', description: 'Previous item in list' },
  'Enter': { action: 'callback', id: 'selectItem', description: 'Select/Open item' },

  // Bulk actions
  'x': { action: 'callback', id: 'toggleSelect', description: 'Toggle item selection' },
  'Ctrl+a': { action: 'callback', id: 'selectAll', description: 'Select all' },

  // Data actions
  'Ctrl+s': { action: 'callback', id: 'save', description: 'Save' },
  'Ctrl+e': { action: 'callback', id: 'export', description: 'Export' },
};

// Context for sharing keyboard shortcuts state
const KeyboardShortcutsContext = createContext(null);

/**
 * Parse a key combination string into a normalized form
 */
function normalizeKey(key) {
  return key
    .toLowerCase()
    .replace('ctrl+', 'control+')
    .replace('cmd+', 'meta+')
    .replace('opt+', 'alt+');
}

/**
 * Check if the current key event matches a shortcut
 */
function matchesShortcut(event, shortcut) {
  const keys = normalizeKey(shortcut).split('+');
  const mainKey = keys[keys.length - 1];
  const modifiers = keys.slice(0, -1);

  const hasCtrl = modifiers.includes('control');
  const hasAlt = modifiers.includes('alt');
  const hasShift = modifiers.includes('shift');
  const hasMeta = modifiers.includes('meta');

  if (event.ctrlKey !== hasCtrl) return false;
  if (event.altKey !== hasAlt) return false;
  if (event.shiftKey !== hasShift) return false;
  if (event.metaKey !== hasMeta) return false;

  return event.key.toLowerCase() === mainKey;
}

/**
 * Main keyboard shortcuts hook
 */
export function useKeyboardShortcuts(callbacks = {}) {
  const navigate = useNavigate();
  const [keySequence, setKeySequence] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [shortcuts] = useState(DEFAULT_SHORTCUTS);

  // Clear key sequence after timeout
  useEffect(() => {
    if (keySequence) {
      const timer = setTimeout(() => setKeySequence(''), 1000);
      return () => clearTimeout(timer);
    }
  }, [keySequence]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event) => {
    // Ignore if user is typing in an input
    const tagName = event.target.tagName.toLowerCase();
    const isEditable = event.target.isContentEditable;
    const isInput = ['input', 'textarea', 'select'].includes(tagName);

    // Allow some shortcuts even in inputs
    const allowedInInput = ['Escape', '?'];
    if (isInput || isEditable) {
      if (!allowedInInput.includes(event.key)) {
        return;
      }
    }

    // Build current key representation
    let currentKey = event.key;
    if (currentKey === ' ') currentKey = 'Space';

    // Check for modifier keys alone
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(currentKey)) {
      return;
    }

    // Handle key sequences (e.g., "g d" for go to dashboard)
    const newSequence = keySequence ? `${keySequence} ${currentKey}` : currentKey;

    // Check if we have a matching shortcut
    const matchingShortcut = Object.keys(shortcuts).find(shortcut => {
      // Direct match
      if (matchesShortcut(event, shortcut)) return true;
      // Sequence match
      if (normalizeKey(shortcut) === normalizeKey(newSequence)) return true;
      return false;
    });

    if (matchingShortcut) {
      const shortcutConfig = shortcuts[matchingShortcut];

      switch (shortcutConfig.action) {
        case 'navigate':
          event.preventDefault();
          navigate(shortcutConfig.path);
          setKeySequence('');
          break;

        case 'focus':
          event.preventDefault();
          const searchInput = document.querySelector('[data-shortcut-target="search"]');
          if (searchInput) {
            searchInput.focus();
          }
          setKeySequence('');
          break;

        case 'callback':
          if (shortcutConfig.id === 'showHelp') {
            event.preventDefault();
            setShowHelp(prev => !prev);
          } else if (callbacks[shortcutConfig.id]) {
            event.preventDefault();
            callbacks[shortcutConfig.id](event);
          }
          setKeySequence('');
          break;

        default:
          break;
      }
    } else {
      // Check if this could be the start of a sequence
      const couldBeSequence = Object.keys(shortcuts).some(s =>
        normalizeKey(s).startsWith(normalizeKey(newSequence))
      );

      if (couldBeSequence) {
        setKeySequence(newSequence);
      } else {
        setKeySequence('');
      }
    }
  }, [navigate, keySequence, shortcuts, callbacks]);

  // Register global keyboard listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    shortcuts,
    showHelp,
    setShowHelp,
    keySequence,
  };
}

/**
 * Provider component for keyboard shortcuts
 */
export function KeyboardShortcutsProvider({ children }) {
  const [showHelp, setShowHelp] = useState(false);
  const [callbacks, setCallbacks] = useState({});

  const registerCallback = useCallback((id, callback) => {
    setCallbacks(prev => ({ ...prev, [id]: callback }));
  }, []);

  const unregisterCallback = useCallback((id) => {
    setCallbacks(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }, []);

  const value = {
    showHelp,
    setShowHelp,
    callbacks,
    registerCallback,
    unregisterCallback,
    shortcuts: DEFAULT_SHORTCUTS,
  };

  return (
    <KeyboardShortcutsContext.Provider value={value}>
      {children}
    </KeyboardShortcutsContext.Provider>
  );
}

/**
 * Hook to access keyboard shortcuts context
 */
export function useKeyboardShortcutsContext() {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcutsContext must be used within KeyboardShortcutsProvider');
  }
  return context;
}

/**
 * Hook to register a callback for a specific shortcut
 */
export function useShortcutCallback(id, callback, deps = []) {
  const { registerCallback, unregisterCallback } = useKeyboardShortcutsContext();

  useEffect(() => {
    registerCallback(id, callback);
    return () => unregisterCallback(id);
  }, [id, registerCallback, unregisterCallback, ...deps]);
}

export default useKeyboardShortcuts;
