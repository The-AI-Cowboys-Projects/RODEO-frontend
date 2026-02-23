/**
 * Keyboard Shortcuts Help Modal
 *
 * Shows a modal with all available keyboard shortcuts.
 * Press '?' to open, Escape to close.
 */

import React from 'react';
import { XMarkIcon, CommandLineIcon } from '@heroicons/react/24/outline';

const shortcuts = {
  navigation: {
    title: 'Navigation',
    items: [
      { keys: ['g', 'd'], description: 'Go to Dashboard' },
      { keys: ['g', 's'], description: 'Go to Samples' },
      { keys: ['g', 'v'], description: 'Go to Vulnerabilities' },
      { keys: ['g', 'p'], description: 'Go to Patches' },
      { keys: ['g', 'e'], description: 'Go to Exploits' },
      { keys: ['g', 'a'], description: 'Go to Assets' },
      { keys: ['g', 'r'], description: 'Go to Reports' },
      { keys: ['g', 't'], description: 'Go to AI Triage' },
      { keys: ['g', 'l'], description: 'Go to Log Analysis' },
      { keys: ['g', 'c'], description: 'Go to Compliance' },
      { keys: ['g', 'n'], description: 'Go to Network' },
      { keys: ['g', 'u'], description: 'Go to User Management' },
      { keys: ['g', 'h'], description: 'Go to Threat Hunting' },
      { keys: ['g', 'i'], description: 'Go to Settings' },
    ],
  },
  actions: {
    title: 'Quick Actions',
    items: [
      { keys: ['/'], description: 'Focus search' },
      { keys: ['n'], description: 'New item (context-sensitive)' },
      { keys: ['r'], description: 'Refresh current view' },
      { keys: ['Esc'], description: 'Close modal / Cancel' },
    ],
  },
  listNavigation: {
    title: 'List Navigation',
    items: [
      { keys: ['j'], description: 'Next item in list' },
      { keys: ['k'], description: 'Previous item in list' },
      { keys: ['Enter'], description: 'Select/Open item' },
      { keys: ['x'], description: 'Toggle item selection' },
      { keys: ['Ctrl', 'a'], description: 'Select all' },
    ],
  },
  data: {
    title: 'Data Actions',
    items: [
      { keys: ['Ctrl', 's'], description: 'Save' },
      { keys: ['Ctrl', 'e'], description: 'Export' },
    ],
  },
};

function KeyBadge({ children }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 text-xs font-medium
      bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200
      border border-gray-300 dark:border-gray-600 rounded shadow-sm">
      {children}
    </kbd>
  );
}

function ShortcutItem({ keys, description }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-sm text-gray-700 dark:text-gray-300">{description}</span>
      <div className="flex items-center gap-1">
        {keys.map((key, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-gray-400 text-xs mx-0.5">then</span>}
            <KeyBadge>{key}</KeyBadge>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

function ShortcutSection({ title, items }) {
  return (
    <div className="mb-6 last:mb-0">
      <h3 className="text-sm font-semibold text-pink-500 dark:text-pink-400 mb-3 uppercase tracking-wide">
        {title}
      </h3>
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
        {items.map((item, index) => (
          <ShortcutItem key={index} keys={item.keys} description={item.description} />
        ))}
      </div>
    </div>
  );
}

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[80vh] overflow-hidden bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-pink-500/10 to-purple-500/10">
          <div className="flex items-center gap-3">
            <CommandLineIcon className="w-6 h-6 text-pink-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <ShortcutSection title={shortcuts.navigation.title} items={shortcuts.navigation.items} />
            </div>
            <div>
              <ShortcutSection title={shortcuts.actions.title} items={shortcuts.actions.items} />
              <ShortcutSection title={shortcuts.listNavigation.title} items={shortcuts.listNavigation.items} />
              <ShortcutSection title={shortcuts.data.title} items={shortcuts.data.items} />
            </div>
          </div>

          {/* Footer tip */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Press <KeyBadge>?</KeyBadge> to toggle this menu
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
