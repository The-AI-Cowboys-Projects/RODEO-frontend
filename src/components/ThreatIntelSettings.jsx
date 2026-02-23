import React, { useState } from 'react'

export default function ThreatIntelSettings() {
  const [feeds, setFeeds] = useState([
    { id: 1, name: 'AlienVault OTX', enabled: true, apiKey: '' },
    { id: 2, name: 'VirusTotal', enabled: false, apiKey: '' },
    { id: 3, name: 'AbuseIPDB', enabled: false, apiKey: '' },
  ])

  const toggleFeed = (id) => {
    setFeeds(feeds.map(feed =>
      feed.id === id ? { ...feed, enabled: !feed.enabled } : feed
    ))
  }

  const updateApiKey = (id, key) => {
    setFeeds(feeds.map(feed =>
      feed.id === id ? { ...feed, apiKey: key } : feed
    ))
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Threat Intelligence Feeds</h3>
        <p className="mt-1 text-sm text-gray-500">
          Configure external threat intelligence sources for enhanced detection.
        </p>
      </div>

      <div className="space-y-4">
        {feeds.map((feed) => (
          <div key={feed.id} className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={feed.enabled}
                  onChange={() => toggleFeed(feed.id)}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300"
                />
                <span className="ml-3 font-medium text-gray-900">{feed.name}</span>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                feed.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {feed.enabled ? 'Active' : 'Inactive'}
              </span>
            </div>
            {feed.enabled && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700">API Key</label>
                <input
                  type="password"
                  value={feed.apiKey}
                  onChange={(e) => updateApiKey(feed.id, e.target.value)}
                  placeholder="Enter API key..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-sm"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-4 border-t">
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
          Save Threat Intel Settings
        </button>
      </div>
    </div>
  )
}
