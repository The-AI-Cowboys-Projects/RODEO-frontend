import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import {
  SparklesIcon,
  PaperAirplaneIcon,
  LightBulbIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

export default function AICopilot({ sessionId, analysisResults }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your AI analysis co-pilot. I can help you understand this malware sample. Ask me anything!",
      timestamp: new Date().toISOString()
    }
  ])
  const [input, setInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(true)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Query mutation
  const queryMutation = useMutation({
    mutationFn: async (question) => {
      const response = await fetch(`/api/sandbox/copilot/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          question: question,
          analysis_results: analysisResults
        })
      })

      if (!response.ok) throw new Error('Query failed')
      return response.json()
    },
    onSuccess: (data) => {
      // Add assistant response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer,
        timestamp: new Date().toISOString()
      }])
    },
    onError: (error) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date().toISOString(),
        error: true
      }])
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!input.trim()) return

    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    }])

    // Send query
    queryMutation.mutate(input)

    // Clear input
    setInput('')
    setShowSuggestions(false)
  }

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion)
    inputRef.current?.focus()
  }

  const suggestions = [
    "What is the threat level?",
    "What does this malware do?",
    "What IOCs were found?",
    "Is this ransomware?",
    "What should I do next?",
    "What MITRE techniques were used?"
  ]

  const insights = analysisResults?.ai_analysis?.insights || []
  const triage = analysisResults?.ai_analysis?.triage || {}
  const recommendations = analysisResults?.ai_analysis?.recommendations || []

  return (
    <div className="h-full flex flex-col bg-slate-800/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50 bg-gradient-to-r from-purple-900/20 to-pink-900/20">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <SparklesIcon className="w-8 h-8 text-purple-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-800 animate-pulse"></div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">AI Co-Pilot</h2>
            <p className="text-xs text-gray-400">Augmented analysis assistant</p>
          </div>
        </div>

        {triage.decision && (
          <div className={`px-3 py-1 rounded-lg text-sm font-semibold ${
            triage.decision === 'immediate_action' ? 'bg-red-900/30 text-red-400 border border-red-500/50' :
            triage.decision === 'urgent_review' ? 'bg-orange-900/30 text-orange-400 border border-orange-500/50' :
            triage.decision === 'standard_review' ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/50' :
            'bg-blue-900/30 text-blue-400 border border-blue-500/50'
          }`}>
            {triage.priority}
          </div>
        )}
      </div>

      {/* Insights Panel (Collapsible) */}
      {insights.length > 0 && (
        <div className="px-6 py-4 border-b border-slate-700/50 bg-slate-900/30">
          <div className="flex items-center space-x-2 mb-3">
            <LightBulbIcon className="w-5 h-5 text-yellow-400" />
            <h3 className="text-sm font-semibold text-white uppercase tracking-wide">
              Key Insights ({insights.length})
            </h3>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {insights.slice(0, 3).map((insight, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border ${
                  insight.severity === 'critical' ? 'bg-red-900/10 border-red-500/30' :
                  insight.severity === 'high' ? 'bg-orange-900/10 border-orange-500/30' :
                  'bg-yellow-900/10 border-yellow-500/30'
                }`}
              >
                <div className="flex items-start space-x-2">
                  <ExclamationTriangleIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                    insight.severity === 'critical' ? 'text-red-400' :
                    insight.severity === 'high' ? 'text-orange-400' :
                    'text-yellow-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{insight.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {insights.length > 3 && (
            <button className="text-xs text-purple-400 hover:text-purple-300 mt-2">
              View all {insights.length} insights →
            </button>
          )}
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-purple-600 text-white'
                  : message.error
                  ? 'bg-red-900/20 border border-red-500/50 text-red-300'
                  : 'bg-slate-900/50 border border-slate-700/50 text-white'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center space-x-2 mb-2">
                  <SparklesIcon className="w-4 h-4 text-purple-400" />
                  <span className="text-xs text-gray-400">AI Co-Pilot</span>
                </div>
              )}

              <div
                className="prose prose-sm prose-invert max-w-none"
                dangerouslySetInnerHTML={{
                  __html: formatMessage(message.content)
                }}
              />

              <div className={`text-xs mt-2 ${
                message.role === 'user' ? 'text-purple-200' : 'text-gray-500'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {queryMutation.isPending && (
          <div className="flex justify-start">
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-lg px-4 py-3">
              <div className="flex items-center space-x-2">
                <ArrowPathIcon className="w-4 h-4 text-purple-400 animate-spin" />
                <span className="text-sm text-gray-400">Analyzing...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {showSuggestions && messages.length === 1 && (
        <div className="px-6 py-3 border-t border-slate-700/50 bg-slate-900/30">
          <p className="text-xs text-gray-400 mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs px-3 py-1.5 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-full text-gray-300 hover:text-white transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-slate-700/50 bg-slate-900/30">
        <div className="flex items-center space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything about this analysis..."
            disabled={queryMutation.isPending}
            className="flex-1 bg-slate-800/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 disabled:opacity-50 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || queryMutation.isPending}
            className="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors flex items-center space-x-2"
          >
            {queryMutation.isPending ? (
              <ArrowPathIcon className="w-5 h-5 animate-spin" />
            ) : (
              <PaperAirplaneIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          💡 Tip: Ask about threat level, malware behavior, IOCs, or recommendations
        </p>
      </form>
    </div>
  )
}

// Helper function to format markdown-like messages
function formatMessage(content) {
  // Convert **bold** to <strong>
  let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong class="text-purple-400">$1</strong>')

  // Convert line breaks
  formatted = formatted.replace(/\n/g, '<br />')

  // Convert bullet points
  formatted = formatted.replace(/^- (.*?)$/gm, '<li class="ml-4">$1</li>')

  return formatted
}
