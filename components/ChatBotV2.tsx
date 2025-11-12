"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  MessageCircle, 
  X, 
  Send, 
  Loader2, 
  Sparkles, 
  ChevronDown,
  Lightbulb,
  TrendingUp,
  Users,
  Filter
} from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Candidate {
  id: string
  name: string
  title: string
  matchScore: number
  breakdown?: {
    technicalSkills: number
    experience: number
    training: number
    context: number
  }
  skills: string[]
  missingSkills: string[]
  yearsOfExperience: number
  certifications: string[]
  sectors: string[]
  reasoning?: string
  availability?: string
  tace?: number
}

interface ChatBotV2Props {
  context?: {
    candidatesCount?: number
    jobTitle?: string
    jobDescription?: string
    searchMode?: 'simple' | 'multi'
    weights?: {
      technicalSkills: number
      experience: number
      training: number
      context: number
    }
    activePreset?: string
    candidates?: Candidate[]
    filters?: any
  }
}

export default function ChatBotV2({ context }: ChatBotV2Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  // Message d'accueil intelligent basé sur le contexte avec RECOMMANDATIONS PROACTIVES
  const getWelcomeMessage = (): string => {
    if (!context || !context.candidates || context.candidates.length === 0) {
      return '👋 Bonjour ! Je suis votre assistant placement de consultants IA. Lancez un matching pour que je puisse vous aider à identifier les meilleurs profils pour votre mission.'
    }

    const count = context.candidatesCount || 0
    const topCandidate = context.candidates[0]
    const avgScore = Math.round(
      context.candidates.reduce((sum, c) => sum + c.matchScore, 0) / context.candidates.length
    )

    let message = `🎯 **Analyse Proactive de vos ${count} consultant${count > 1 ? 's' : ''}**\n\n`
    
    // === RECOMMANDATIONS PROACTIVES ===
    
    // 1. Meilleur profil avec breakdown
    if (topCandidate) {
      message += `✅ **Top 1: ${topCandidate.name}** (${topCandidate.matchScore}%)\n`
      if (topCandidate.breakdown) {
        const strengths = []
        const weaknesses = []
        if (topCandidate.breakdown.technicalSkills >= 80) strengths.push('Tech')
        else if (topCandidate.breakdown.technicalSkills < 70) weaknesses.push('Tech')
        if (topCandidate.breakdown.experience >= 85) strengths.push('Exp')
        if (topCandidate.breakdown.training >= 85) strengths.push('Form')
        
        if (strengths.length > 0) message += `   💪 Forces: ${strengths.join(', ')}\n`
        if (weaknesses.length > 0) message += `   ⚠️  Gaps: ${weaknesses.join(', ')}\n`
      }
      message += `\n`
    }

    // 2. Distribution des scores
    const excellentCandidates = context.candidates.filter(c => c.matchScore >= 85).length
    const goodCandidates = context.candidates.filter(c => c.matchScore >= 70 && c.matchScore < 85).length
    const mediumCandidates = context.candidates.filter(c => c.matchScore >= 50 && c.matchScore < 70).length

    message += `📊 **Distribution:**\n`
    if (excellentCandidates > 0) {
      message += `   🌟 ${excellentCandidates} excellent${excellentCandidates > 1 ? 's' : ''} (≥85%)\n`
    }
    if (goodCandidates > 0) {
      message += `   ✨ ${goodCandidates} bon${goodCandidates > 1 ? 's' : ''} (70-84%)\n`
    }
    if (mediumCandidates > 0) {
      message += `   📈 ${mediumCandidates} potentiel${mediumCandidates > 1 ? 's' : ''} (50-69%)\n`
    }
    message += `   📉 Moyenne: ${avgScore}%\n\n`

    // 3. Gaps de compétences communs
    const allMissingSkills: string[] = []
    context.candidates.forEach(c => {
      if (c.missingSkills) {
        allMissingSkills.push(...c.missingSkills)
      }
    })
    const skillCounts = allMissingSkills.reduce((acc, skill) => {
      acc[skill] = (acc[skill] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    const topMissingSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([skill, count]) => `${skill} (${count})`)

    if (topMissingSkills.length > 0) {
      message += `🔍 **Gaps fréquents:** ${topMissingSkills.join(', ')}\n\n`
    }

    // 4. Recommandation de pondérations
    message += `⚖️  **Config actuelle:** ${context.activePreset || 'Personnalisé'}\n`
    if (avgScore < 75 && context.activePreset !== 'Expérience') {
      message += `💡 **Suggestion:** Essayez le preset "Expérience" pour valoriser les seniors\n\n`
    } else if (excellentCandidates >= 3) {
      message += `✅ **Bonne config:** ${excellentCandidates} excellents profils identifiés\n\n`
    } else {
      message += `\n`
    }

    // 5. Action recommandée
    if (excellentCandidates >= 1) {
      message += `🎯 **Action:** Comparez les ${Math.min(excellentCandidates, 3)} meilleurs pour proposition client`
    } else if (goodCandidates >= 3) {
      message += `🎯 **Action:** Analysez les profils 70-84% pour identifier le potentiel`
    } else {
      message += `🎯 **Action:** Élargissez vos critères de mission ou ajustez les pondérations`
    }
    
    return message
  }

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: getWelcomeMessage(),
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

    // Créer un message assistant vide qui sera rempli progressivement
    const assistantMessage: Message = {
      role: 'assistant',
      content: '',
      timestamp: new Date()
    }
    setMessages(prev => [...prev, assistantMessage])

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

      // Lire le stream SSE
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('Impossible de lire le stream')
      }

      let accumulatedContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim() !== '')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              if (data.content) {
                accumulatedContent += data.content
                
                // Mettre à jour le dernier message en temps réel
                setMessages(prev => {
                  const newMessages = [...prev]
                  newMessages[newMessages.length - 1] = {
                    ...newMessages[newMessages.length - 1],
                    content: accumulatedContent
                  }
                  return newMessages
                })
              }
            } catch (e) {
              console.error('Parse error:', e)
            }
          }
        }
      }
    } catch (error) {
      console.error('Chatbot error:', error)
      
      // Remplacer le message vide par un message d'erreur
      setMessages(prev => {
        const newMessages = [...prev]
        newMessages[newMessages.length - 1] = {
          role: 'assistant',
          content: '❌ Désolé, une erreur s\'est produite. Veuillez réessayer.',
          timestamp: new Date()
        }
        return newMessages
      })
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

  const handleOpen = () => {
    setIsOpen(true)
    setIsAnimating(true)
  }

  const handleClose = () => {
    setIsAnimating(false)
    // Attendre la fin de l'animation avant de fermer complètement
    setTimeout(() => {
      setIsOpen(false)
    }, 300) // Durée de la transition
  }

  // Quick actions DÉCISIONNELLES avancées basées sur les résultats (Phase 2 + Phase 3)
  const getQuickActions = () => {
    if (!context || !context.candidates || context.candidates.length === 0) {
      return [
        {
          icon: Lightbulb,
          label: "Comment ça marche ?",
          question: "Comment fonctionne le système de matching ?"
        },
        {
          icon: TrendingUp,
          label: "Configurer les pondérations",
          question: "Comment ajuster les pondérations pour mes besoins ?"
        }
      ]
    }

    const topCandidate = context.candidates[0]
    const hasExcellent = context.candidates.some(c => c.matchScore >= 85)
    const top3 = context.candidates.slice(0, 3)
    const avgScore = Math.round(
      context.candidates.reduce((sum, c) => sum + c.matchScore, 0) / context.candidates.length
    )
    
    // Phase 2 Actions (Base)
    const phase2Actions = [
      {
        icon: Users,
        label: "🔥 Comparaison Intelligente",
        question: `Fais une comparaison détaillée de ${top3.map(c => `${c.name} (${c.matchScore}%)`).join(', ')} en tableau avec forces/faiblesses et recommandation finale pour la mission`
      },
      {
        icon: TrendingUp,
        label: "🎲 Simuler Pondérations",
        question: `Simule l'impact des 3 presets (Compétences 60/20/15/5, Expérience 20/60/10/10, Standard 40/30/20/10) sur mes top 5 consultants. Affiche avant/après et recommande le meilleur preset pour cette mission`
      },
      {
        icon: Filter,
        label: "📋 Générer Proposition Client",
        question: hasExcellent 
          ? `Crée une shortlist de 5 consultants à proposer au client avec justifications détaillées, ordre de priorité et points de vente clés`
          : `Analyse mes meilleurs consultants et recommande une shortlist de 3-5 profils à proposer avec plan de montée en compétence si nécessaire`
      },
      {
        icon: Lightbulb,
        label: "🔍 Insights & Patterns",
        question: `Analyse les patterns dans mes ${context.candidates.length} consultants : compétences manquantes les plus fréquentes, profils atypiques intéressants, biais potentiels dans ma sélection, et recommandations stratégiques`
      }
    ]

    // Phase 3 Actions (Avancées)
    const phase3Actions = [
      {
        icon: Filter,
        label: "⚠️ Détection de Biais",
        question: `Analyse statistique approfondie des biais dans ma sélection : biais d'expérience (seniors vs juniors), biais de certifications vs pratique, biais sectoriels/technologiques. Propose des corrections concrètes avec exemples chiffrés.`
      },
      {
        icon: Lightbulb,
        label: "📝 Ajuster Critères Mission",
        question: avgScore < 75 
          ? `Mon score moyen est ${avgScore}%. Analyse les critères de l'appel d'offre et suggère des ajustements : compétences à assouplir, critères à ajuster, pondérations à recalibrer. Fournis des exemples avant/après.`
          : `Analyse les critères de matching et suggère des ajustements pour identifier encore plus de consultants qualifiés. Identifie les compétences trop restrictives.`
      },
      {
        icon: TrendingUp,
        label: "🔮 Prédire Disponibilités",
        question: `Analyse la disponibilité réelle de mes top 5 consultants : TACE actuel, fin de mission estimée, probabilité de placement, risques de prolongation mission actuelle. Classe-les par disponibilité effective avec timeline réaliste.`
      },
      {
        icon: Users,
        label: "📊 Visualiser Distribution",
        question: `Crée des visualisations textuelles de mes consultants : histogramme de distribution des scores, graphique de compétences par catégorie, timeline de disponibilité, matrice forces/faiblesses. Utilise des graphiques ASCII.`
      }
    ]

    // Combine Phase 2 + Phase 3 (4 actions chacune = 8 total, on affiche 4 par défaut)
    // Alterner entre Phase 2 et Phase 3 selon le contexte
    return [...phase2Actions.slice(0, 2), ...phase3Actions.slice(0, 2)]
  }

  const quickActions = getQuickActions()

  return (
    <>
      {/* Floating Action Button - Modern Style */}
      {!isOpen && (
        <div className="fixed bottom-8 right-8 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Button
            onClick={handleOpen}
            className="h-16 px-6 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 group border-2 border-white/20"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
              </div>
              <span className="font-semibold text-white text-sm">Assistant IA</span>
            </div>
          </Button>
        </div>
      )}

      {/* Backdrop avec fade */}
      {isOpen && (
        <div 
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300 cursor-pointer hover:bg-black/70 ${
            isAnimating ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={handleClose}
          aria-label="Fermer le chatbot"
        />
      )}

      {/* Slide-in Chat Panel - Premium Design */}
      {isOpen && (
        <div 
          className={`fixed inset-y-0 right-0 z-50 w-[500px] bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 shadow-2xl border-l border-gray-800 flex flex-col transition-all duration-300 ease-out ${
            isAnimating ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
          }`}
        >
          {/* Header - Glassmorphism Style */}
          <div className="flex-shrink-0 bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-xl border-b border-white/10">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Assistant Recrutement</h2>
                    <p className="text-xs text-gray-400">Propulsé par Llama 3.3</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="text-gray-400 hover:text-white hover:bg-white/10 h-9 w-9 rounded-lg animate-in fade-in slide-in-from-bottom-2 duration-500"
                  >
                    <ChevronDown className={`w-4 h-4 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="text-gray-400 hover:text-white hover:bg-white/10 h-9 w-9 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Context Info Cards */}
              {context?.candidatesCount !== undefined && context.candidatesCount > 0 && !isMinimized && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Candidats</p>
                    <p className="text-xl font-bold text-white">{context.candidatesCount}</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-3 border border-white/10">
                    <p className="text-xs text-gray-400 mb-1">Mode</p>
                    <p className="text-sm font-semibold text-purple-400">
                      {context.searchMode === 'multi' ? 'Multi-profil' : 'Simple'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Messages Area */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div
                      className={`max-w-[85%] ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-sm'
                          : 'bg-white/5 text-gray-100 rounded-2xl rounded-tl-sm border border-white/10 backdrop-blur-sm'
                      } px-4 py-3 shadow-lg`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-2 ${message.role === 'user' ? 'text-indigo-200' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                      <span className="text-sm text-gray-400 animate-pulse">L'IA réfléchit...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Actions - Dynamic based on conversation */}
              {!isLoading && (
                <div className="flex-shrink-0 px-6 pb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <p className="text-xs text-gray-400 mb-3 font-semibold uppercase tracking-wide">
                    {messages.length === 1 ? 'Actions Rapides' : 'Suggestions de Suivi'}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {(() => {
                      // Get context-aware actions based on last assistant message
                      const lastAssistantMessage = [...messages].reverse().find(m => m.role === 'assistant')?.content.toLowerCase() || ''
                      
                      let contextActions = quickActions // Default actions
                      
                      // If conversation has started, show follow-up actions
                      if (messages.length > 1) {
                        if (lastAssistantMessage.includes('comparaison') || lastAssistantMessage.includes('tableau')) {
                          // After comparison
                          contextActions = [
                            {
                              icon: Filter,
                              label: "📋 Proposition Client",
                              question: "Crée une shortlist de 5 consultants à proposer au client avec justifications et points de vente clés"
                            },
                            {
                              icon: TrendingUp,
                              label: "🎲 Simuler Pondérations",
                              question: "Simule l'impact de différents presets sur le classement des consultants"
                            },
                            {
                              icon: Lightbulb,
                              label: "💡 Détails Top 1",
                              question: context?.candidates?.[0] ? `Analyse détaillée de ${context.candidates[0].name} : forces, faiblesses, fit avec la mission` : "Analyse détaillée du meilleur consultant"
                            },
                            {
                              icon: Users,
                              label: "🔍 Profils Alternatifs",
                              question: "Identifie 2-3 profils alternatifs intéressants en dehors du top 3"
                            }
                          ]
                        } else if (lastAssistantMessage.includes('simulation') || lastAssistantMessage.includes('preset')) {
                          // After simulation
                          contextActions = [
                            {
                              icon: TrendingUp,
                              label: "✅ Impact Complet",
                              question: "Montre l'impact du changement de preset sur TOUS les consultants"
                            },
                            {
                              icon: Filter,
                              label: "📊 Autre Simulation",
                              question: "Simule d'autres presets (Formations, Sectorielle, Équilibré)"
                            },
                            {
                              icon: Users,
                              label: "🎯 Recommandation",
                              question: "Quel preset recommandes-tu pour cette mission et pourquoi ?"
                            },
                            {
                              icon: Lightbulb,
                              label: "📋 Shortlist Optimisée",
                              question: "Génère une shortlist avec le meilleur preset identifié"
                            }
                          ]
                        } else if (lastAssistantMessage.includes('shortlist') || lastAssistantMessage.includes('proposition')) {
                          // After shortlist
                          contextActions = [
                            {
                              icon: Lightbulb,
                              label: "📄 Points de Vente",
                              question: "Prépare les arguments clés pour présenter le top consultant au client"
                            },
                            {
                              icon: TrendingUp,
                              label: "📅 Timeline Placement",
                              question: "Propose une timeline de placement détaillée de la proposition à la signature"
                            },
                            {
                              icon: Users,
                              label: "🔄 Consultants Backup",
                              question: "Identifie des consultants de backup si le top 3 n'est pas retenu"
                            },
                            {
                              icon: Filter,
                              label: "🎯 Argumentaire Client",
                              question: "Crée un argumentaire pour chaque consultant de la shortlist"
                            }
                          ]
                        } else if (lastAssistantMessage.includes('pattern') || lastAssistantMessage.includes('insight') || lastAssistantMessage.includes('biais')) {
                          // After insights
                          contextActions = [
                            {
                              icon: Lightbulb,
                              label: "🎯 Plan d'Action",
                              question: "Crée un plan d'action concret pour corriger les biais détectés"
                            },
                            {
                              icon: TrendingUp,
                              label: "📚 Formation Interne",
                              question: "Programme de formation pour combler les gaps de compétences fréquents"
                            },
                            {
                              icon: Filter,
                              label: "🔄 Relancer Matching",
                              question: "Recommande de nouveaux critères pour élargir le vivier"
                            },
                            {
                              icon: Users,
                              label: "📋 Shortlist Finale",
                              question: "Malgré les insights, génère la shortlist des meilleurs profils actuels"
                            }
                          ]
                        } else if (lastAssistantMessage.includes('reformul') || lastAssistantMessage.includes('critères') || lastAssistantMessage.includes('mission')) {
                          // After ajustement critères
                          contextActions = [
                            {
                              icon: TrendingUp,
                              label: "🔄 Relancer Matching",
                              question: "Avec les critères ajustés, relance un matching pour voir l'impact"
                            },
                            {
                              icon: Filter,
                              label: "⚖️ Ajuster Pondérations",
                              question: "Quelles pondérations utiliser avec les nouveaux critères ?"
                            },
                            {
                              icon: Users,
                              label: "📊 Nouveaux Consultants",
                              question: "Quels consultants émergeraient avec les critères ajustés ?"
                            },
                            {
                              icon: Lightbulb,
                              label: "📋 Proposition Actuelle",
                              question: "Génère une proposition avec les consultants actuels en attendant le nouveau matching"
                            }
                          ]
                        } else if (lastAssistantMessage.includes('disponibilit') || lastAssistantMessage.includes('tace') || lastAssistantMessage.includes('mission')) {
                          // After prédiction disponibilité
                          contextActions = [
                            {
                              icon: TrendingUp,
                              label: "📅 Timeline Placement",
                              question: "Crée une timeline de placement basée sur les disponibilités réelles"
                            },
                            {
                              icon: Users,
                              label: "🎯 Prioriser Disponibles",
                              question: "Classe les consultants par disponibilité immédiate (TACE faible)"
                            },
                            {
                              icon: Filter,
                              label: "🎯 Stratégie Proposition",
                              question: "Stratégie de proposition selon disponibilité et risque de prolongation mission actuelle"
                            },
                            {
                              icon: Lightbulb,
                              label: "📋 Proposition par Timing",
                              question: "Shortlist optimisée par timing : qui proposer maintenant vs dans 1 mois"
                            }
                          ]
                        } else if (lastAssistantMessage.includes('visualis') || lastAssistantMessage.includes('graphique') || lastAssistantMessage.includes('histogramme')) {
                          // After visualisations
                          contextActions = [
                            {
                              icon: TrendingUp,
                              label: "📊 Autre Visualisation",
                              question: "Crée d'autres visualisations : timeline, matrice, radar chart en ASCII"
                            },
                            {
                              icon: Users,
                              label: "🔍 Interpréter Données",
                              question: "Interprète ces visualisations : que révèlent-elles sur mon pool ?"
                            },
                            {
                              icon: Filter,
                              label: "📋 Actions Concrètes",
                              question: "Basé sur ces visualisations, quelles actions concrètes recommandes-tu ?"
                            },
                            {
                              icon: Lightbulb,
                              label: "🎯 Shortlist Optimale",
                              question: "Génère la shortlist optimale selon les patterns visualisés"
                            }
                          ]
                        } else {
                          // Generic follow-up actions (mix Phase 2 + Phase 3)
                          contextActions = [
                            {
                              icon: Users,
                              label: "🔥 Comparer Top 3",
                              question: "Compare les 3 meilleurs consultants en tableau détaillé"
                            },
                            {
                              icon: Filter,
                              label: "⚠️ Détecter Biais",
                              question: "Analyse statistique des biais dans ma sélection avec corrections"
                            },
                            {
                              icon: TrendingUp,
                              label: "🔮 Prédire Disponibilités",
                              question: "Analyse la disponibilité réelle de mes top consultants avec timeline"
                            },
                            {
                              icon: Lightbulb,
                              label: "📝 Ajuster Critères",
                              question: "Suggère des ajustements des critères de l'appel d'offre avec exemples"
                            }
                          ]
                        }
                      }
                      
                      return contextActions.map((action, index) => (
                        <button
                          key={index}
                          onClick={() => setInput(action.question)}
                          className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all group text-left hover:scale-105 hover:shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <action.icon className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform flex-shrink-0" />
                          <span className="text-xs text-gray-300 group-hover:text-white font-medium">{action.label}</span>
                        </button>
                      ))
                    })()}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="flex-shrink-0 p-6 bg-gradient-to-t from-gray-950 to-transparent border-t border-white/5">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Posez votre question..."
                      disabled={isLoading}
                      className="w-full bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 transition-all"
                    />
                  </div>
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white disabled:opacity-50 h-12 w-12 rounded-xl shadow-lg transition-all hover:scale-110 hover:shadow-purple-500/50 active:scale-95"
                    size="icon"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Appuyez sur <kbd className="px-1.5 py-0.5 bg-white/10 rounded">Entrée</kbd> pour envoyer
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
