"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatBotProps {
  context?: {
    candidatesCount?: number
    jobOffer?: string
    searchMode?: 'simple' | 'multi'
    topCandidates?: Array<{
      name: string
      matchScore: number
      title: string
    }>
    filters?: any
  }
}

export default function ChatBot({ context }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Bonjour ! Je suis votre assistant IA. Comment puis-je vous aider avec vos recherches de candidats ?',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({
            role: m.role,
            content: m.content
          })).concat([{ role: 'user', content: input }]),
          context
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la communication avec le chatbot')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chatbot error:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: '❌ Désolé, une erreur s\'est produite. Veuillez réessayer.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const suggestedQuestions = [
    "Explique-moi les résultats",
    "Qui est le meilleur candidat ?",
    "Comment améliorer ma recherche ?",
    "Compare les 3 premiers profils"
  ]

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 shadow-lg hover:shadow-xl transition-all duration-300 z-50 group"
          size="icon"
        >
          <MessageCircle className="w-6 h-6 text-gray-900 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
          </span>
        </Button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] bg-gray-900 border-gray-700 shadow-2xl z-50 flex flex-col">
          <CardHeader className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 flex-shrink-0 rounded-t-lg">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Assistant IA
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="text-gray-900 hover:bg-yellow-600/20 h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {context?.candidatesCount !== undefined && context.candidatesCount > 0 && (
              <p className="text-xs text-gray-800 mt-1">
                📊 {context.candidatesCount} candidat(s) en cours d'analyse
              </p>
            )}
          </CardHeader>

          <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto mb-4 space-y-3 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-800">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-yellow-500 text-gray-900'
                        : 'bg-gray-800 text-white border border-gray-700'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-800 text-white border border-gray-700 rounded-lg p-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions */}
            {messages.length === 1 && !isLoading && (
              <div className="mb-3 flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInput(question)}
                    className="text-xs bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Posez votre question..."
                disabled={isLoading}
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 disabled:opacity-50"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 disabled:opacity-50"
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
