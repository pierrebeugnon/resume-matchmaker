"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Code, Briefcase, GraduationCap, Building, RotateCcw, Check } from "lucide-react"
import { ScoreBreakdown, type ScoreBreakdownData, type WeightConfig } from "./ScoreBreakdown"

// Utilise le type Resume complet de page.tsx - pas besoin de le redéfinir
type Resume = any // Simplifié pour éviter les conflits de types

interface ScoreSimulatorProps {
  isOpen: boolean
  onClose: () => void
  resume: Resume
  originalWeights: WeightConfig
  simulatedWeights: WeightConfig
  onWeightsChange: (weights: WeightConfig) => void
  calculateDynamicScore: (resume: Resume) => number
}

export function ScoreSimulator({ 
  isOpen,
  onClose,
  resume, 
  originalWeights, 
  simulatedWeights: externalSimulatedWeights,
  onWeightsChange,
  calculateDynamicScore
}: ScoreSimulatorProps) {
  const [simulatedWeights, setSimulatedWeights] = useState<WeightConfig>(externalSimulatedWeights)
  
  // Presets de pondération - harmonisés avec page.tsx
  const presets = {
    standard: { technicalSkills: 40, experience: 30, training: 20, context: 10 },
    equilibre: { technicalSkills: 25, experience: 25, training: 25, context: 25 },
    competences: { technicalSkills: 60, experience: 20, training: 15, context: 5 },
    experience: { technicalSkills: 20, experience: 60, training: 10, context: 10 },
    formations: { technicalSkills: 20, experience: 20, training: 50, context: 10 },
    sectorielle: { technicalSkills: 20, experience: 20, training: 10, context: 50 }
  }
  
  // Détecter le preset actif
  const getActivePreset = () => {
    for (const [key, preset] of Object.entries(presets)) {
      if (
        preset.technicalSkills === simulatedWeights.technicalSkills &&
        preset.experience === simulatedWeights.experience &&
        preset.training === simulatedWeights.training &&
        preset.context === simulatedWeights.context
      ) {
        return key
      }
    }
    return 'personnalise'
  }
  
  const activePreset = getActivePreset()
  
  // Calculer le score simulé
  const calculateSimulatedScore = (weights: WeightConfig, breakdown: ScoreBreakdownData): number => {
    const weightedScore = 
      (breakdown.technicalSkills * weights.technicalSkills / 100) +
      (breakdown.experience * weights.experience / 100) +
      (breakdown.training * weights.training / 100) +
      (breakdown.context * weights.context / 100)
    
    return Math.round(weightedScore)
  }

  const breakdown = resume?.scoreBreakdown || {
    technicalSkills: 70,
    experience: 80,
    training: 60,
    context: 75
  }
  
  // Si pas de resume, ne rien afficher
  if (!resume || !isOpen) {
    return null
  }

  // CORRECTION : Calculer originalScore avec originalWeights (pas resume.matchScore qui peut être obsolète)
  const originalScore = calculateSimulatedScore(originalWeights, breakdown)
  const simulatedScore = calculateSimulatedScore(simulatedWeights, breakdown)
  const scoreDiff = simulatedScore - originalScore
  const totalWeight = simulatedWeights.technicalSkills + simulatedWeights.experience + 
                      simulatedWeights.training + simulatedWeights.context
  const isValidTotal = totalWeight === 100
  
  // Détecter si les pondérations ont changé
  const hasChanges = 
    simulatedWeights.technicalSkills !== originalWeights.technicalSkills ||
    simulatedWeights.experience !== originalWeights.experience ||
    simulatedWeights.training !== originalWeights.training ||
    simulatedWeights.context !== originalWeights.context

  const weightItems = [
    {
      key: "technicalSkills" as keyof WeightConfig,
      label: "Compétences Techniques",
      icon: Code,
      color: "blue",
      description: "Langages de programmation, frameworks, outils techniques et technologies maîtrisées"
    },
    {
      key: "experience" as keyof WeightConfig,
      label: "Expérience",
      icon: Briefcase,
      color: "purple",
      description: "Années d'expérience professionnelle, rôles précédents et expertise métier"
    },
    {
      key: "training" as keyof WeightConfig,
      label: "Formations",
      icon: GraduationCap,
      color: "green",
      description: "Diplômes, certifications professionnelles et formations continues"
    },
    {
      key: "context" as keyof WeightConfig,
      label: "Contexte",
      icon: Building,
      color: "yellow",
      description: "Secteur d'activité, taille d'entreprise et contexte professionnel similaire"
    }
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { text: string; bg: string }> = {
      blue: { text: "text-blue-400", bg: "bg-blue-500" },
      purple: { text: "text-purple-400", bg: "bg-purple-500" },
      green: { text: "text-green-400", bg: "bg-green-500" },
      yellow: { text: "text-yellow-400", bg: "bg-yellow-500" },
    }
    return colors[color] || colors.blue
  }

  const handleWeightChange = (key: keyof WeightConfig, value: number) => {
    const newWeights = {
      ...simulatedWeights,
      [key]: value
    }
    setSimulatedWeights(newWeights)
    onWeightsChange(newWeights)
  }

  const handleReset = () => {
    setSimulatedWeights(originalWeights)
  }

  const handleAutoBalance = () => {
    // Équilibrer automatiquement pour atteindre 100%
    const remaining = 100 - totalWeight
    if (remaining !== 0) {
      const adjustment = remaining / 4
      setSimulatedWeights({
        technicalSkills: Math.max(0, Math.min(100, simulatedWeights.technicalSkills + adjustment)),
        experience: Math.max(0, Math.min(100, simulatedWeights.experience + adjustment)),
        training: Math.max(0, Math.min(100, simulatedWeights.training + adjustment)),
        context: Math.max(0, Math.min(100, simulatedWeights.context + adjustment))
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header avec nom du candidat */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            ⚡ Simulateur de Score
          </h2>
          <p className="text-gray-400 mt-1">
            {resume.name} - {resume.title}
          </p>
        </div>
      </div>

      {/* Bandeau explicatif */}
      <Card className="bg-blue-900/20 border-blue-500/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">ℹ️</div>
            <div className="text-sm text-gray-300">
              <p className="font-semibold text-white mb-1">Comment ça marche ?</p>
              <p className="mb-2">
                Le <strong>score du candidat</strong> (barre de progression) est fixe et représente sa performance sur chaque critère.
              </p>
              <p>
                Le <strong>poids</strong> (badge vert) détermine l'importance de chaque critère. Ajustez-les pour voir l'impact sur le score final.
              </p>
              <div className="mt-2 p-2 bg-gray-900/50 rounded font-mono text-xs">
                Score Final = (Tech {breakdown.technicalSkills}% × Poids) + (Exp {breakdown.experience}% × Poids) + (Form {breakdown.training}% × Poids) + (Ctx {breakdown.context}% × Poids)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparaison Before/After */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Original */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
            📊 Score Actuel
          </h3>
          <ScoreBreakdown
            breakdown={breakdown}
            weights={originalWeights}
          />
        </div>

        {/* Score Simulé */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
            ⚡ Score Simulé
            {scoreDiff !== 0 && (
              <Badge className={scoreDiff > 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
                {scoreDiff > 0 ? '+' : ''}{scoreDiff}%
              </Badge>
            )}
          </h3>
          <ScoreBreakdown
            breakdown={breakdown}
            weights={simulatedWeights}
            showComparison={true}
            originalScore={originalScore}
            isSimulation={true}
          />
        </div>
      </div>

      {/* Presets de pondération */}
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  🎯 Suggestions de Pondération
                </h3>
                <p className="text-sm text-gray-400">
                  Choisissez un preset ou ajustez manuellement les sliders ci-dessous
                </p>
              </div>
              {/* Indicateur du preset actif */}
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-900/30 border border-blue-500/50 rounded-lg">
                <div className="text-xs text-gray-400">Actuellement :</div>
                <div className="text-sm font-semibold text-blue-400">
                  {activePreset === 'standard' && '✨ Standard'}
                  {activePreset === 'equilibre' && '⚖️ Équilibré'}
                  {activePreset === 'competences' && '💻 Compétences'}
                  {activePreset === 'experience' && '👔 Expérience'}
                  {activePreset === 'formations' && '🎓 Formations'}
                  {activePreset === 'sectorielle' && '🏢 Sectorielle'}
                  {activePreset === 'personnalise' && '✨ Personnalisée'}
                </div>
                <div className="text-xs font-mono text-blue-300">
                  {simulatedWeights.technicalSkills}/{simulatedWeights.experience}/{simulatedWeights.training}/{simulatedWeights.context}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setSimulatedWeights(presets.standard)}
                      variant="outline"
                      className={`h-auto ${activePreset === 'standard' 
                        ? 'bg-yellow-500/20 border-yellow-500 text-white ring-2 ring-yellow-500/50' 
                        : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-yellow-500'
                      } hover:bg-gray-700 hover:text-white transition-all`}
                    >
                      <div className="flex flex-col items-center gap-1 py-2 px-1">
                        <div className="text-2xl">✨</div>
                        <div className="text-xs font-semibold whitespace-nowrap">Standard</div>
                        <div className="text-[10px] text-gray-400 font-mono">40/30/20/10</div>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 border-gray-600 max-w-xs">
                    <p className="font-semibold mb-1">✨ Standard</p>
                    <p className="text-xs text-gray-300">Configuration par défaut. Équilibre pratique privilégiant légèrement les compétences et l'expérience.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setSimulatedWeights(presets.equilibre)}
                      variant="outline"
                      className={`h-auto ${activePreset === 'equilibre' 
                        ? 'bg-gray-500/20 border-gray-500 text-white ring-2 ring-gray-500/50' 
                        : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-gray-500'
                      } hover:bg-gray-700 hover:text-white transition-all`}
                    >
                      <div className="flex flex-col items-center gap-1 py-2 px-1">
                        <div className="text-2xl">⚖️</div>
                        <div className="text-xs font-semibold whitespace-nowrap">Équilibré</div>
                        <div className="text-[10px] text-gray-400 font-mono">25/25/25/25</div>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 border-gray-600 max-w-xs">
                    <p className="font-semibold mb-1">⚖️ Équilibré</p>
                    <p className="text-xs text-gray-300">Tous les critères ont la même importance. Idéal pour des missions généralistes.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setSimulatedWeights(presets.competences)}
                      variant="outline"
                      className={`h-auto ${activePreset === 'competences' 
                        ? 'bg-blue-500/20 border-blue-500 text-white ring-2 ring-blue-500/50' 
                        : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-blue-500'
                      } hover:bg-gray-700 hover:text-white transition-all`}
                    >
                      <div className="flex flex-col items-center gap-1 py-2 px-1">
                        <div className="text-2xl">💻</div>
                        <div className="text-xs font-semibold whitespace-nowrap">Compétences</div>
                        <div className="text-[10px] text-gray-400 font-mono">60/20/15/5</div>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 border-gray-600 max-w-xs">
                    <p className="font-semibold mb-1">💻 Focus Compétences</p>
                    <p className="text-xs text-gray-300">Priorise les compétences techniques. Idéal pour missions très techniques ou projets spécialisés.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setSimulatedWeights(presets.experience)}
                      variant="outline"
                      className={`h-auto ${activePreset === 'experience' 
                        ? 'bg-purple-500/20 border-purple-500 text-white ring-2 ring-purple-500/50' 
                        : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-purple-500'
                      } hover:bg-gray-700 hover:text-white transition-all`}
                    >
                      <div className="flex flex-col items-center gap-1 py-2 px-1">
                        <div className="text-2xl">👔</div>
                        <div className="text-xs font-semibold whitespace-nowrap">Expérience</div>
                        <div className="text-[10px] text-gray-400 font-mono">20/60/10/10</div>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 border-gray-600 max-w-xs">
                    <p className="font-semibold mb-1">👔 Focus Expérience</p>
                    <p className="text-xs text-gray-300">Valorise l'expérience professionnelle. Parfait pour postes seniors, leads ou rôles de management.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setSimulatedWeights(presets.formations)}
                      variant="outline"
                      className={`h-auto ${activePreset === 'formations' 
                        ? 'bg-green-500/20 border-green-500 text-white ring-2 ring-green-500/50' 
                        : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-green-500'
                      } hover:bg-gray-700 hover:text-white transition-all`}
                    >
                      <div className="flex flex-col items-center gap-1 py-2 px-1">
                        <div className="text-2xl">🎓</div>
                        <div className="text-xs font-semibold whitespace-nowrap">Formations</div>
                        <div className="text-[10px] text-gray-400 font-mono">20/20/50/10</div>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 border-gray-600 max-w-xs">
                    <p className="font-semibold mb-1">🎓 Focus Formations</p>
                    <p className="text-xs text-gray-300">Met l'accent sur les certifications et diplômes. Utile quand des certifications spécifiques sont requises.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={() => setSimulatedWeights(presets.sectorielle)}
                      variant="outline"
                      className={`h-auto ${activePreset === 'sectorielle' 
                        ? 'bg-orange-500/20 border-orange-500 text-white ring-2 ring-orange-500/50' 
                        : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-orange-500'
                      } hover:bg-gray-700 hover:text-white transition-all`}
                    >
                      <div className="flex flex-col items-center gap-1 py-2 px-1">
                        <div className="text-2xl">🏢</div>
                        <div className="text-xs font-semibold whitespace-nowrap">Sectorielle</div>
                        <div className="text-[10px] text-gray-400 font-mono">20/20/10/50</div>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-800 border-gray-600 max-w-xs">
                    <p className="font-semibold mb-1">🏢 Focus Sectorielle</p>
                    <p className="text-xs text-gray-300">Privilégie l'expérience dans le secteur. Essentiel pour domaines réglementés (finance, santé, défense).</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {activePreset === 'personnalise' && (
              <div className="flex items-center gap-2 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                <div className="text-purple-400 text-xl">✨</div>
                <div className="text-sm text-purple-300">
                  <span className="font-semibold">Pondération personnalisée</span> - Vous avez modifié les valeurs manuellement
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contrôles de pondération manuels */}
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                🎚️ Ajustement Manuel
              </h3>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={isValidTotal 
                    ? "text-green-400 border-green-600" 
                    : "text-orange-400 border-orange-600"
                  }
                >
                  Total: {totalWeight}%
                </Badge>
                {!isValidTotal && (
                  <Button
                    onClick={handleAutoBalance}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    Auto-équilibrer
                  </Button>
                )}
              </div>
            </div>

            {weightItems.map((item) => {
              const Icon = item.icon
              const colors = getColorClasses(item.color)
              const value = simulatedWeights[item.key]
              const scoreContribution = resume.scoreBreakdown 
                ? (resume.scoreBreakdown[item.key] * value / 100) 
                : 0
              
              return (
                <div key={item.key} className="space-y-3 p-4 rounded-lg bg-gray-800/30 border border-gray-700/50 hover:border-gray-600/50 transition-all">
                  {/* Header avec icône agrandie et info */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg ${colors.bg}/20 border border-${item.color}-500/30`}>
                        <Icon className={`w-5 h-5 ${colors.text}`} />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-white block">{item.label}</span>
                        <span className="text-xs text-gray-400">
                          {resume.scoreBreakdown ? `Score: ${resume.scoreBreakdown[item.key]}%` : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-2xl font-bold ${colors.text} block`}>
                        {value}%
                      </span>
                      <span className="text-xs text-gray-400">
                        ≈ {scoreContribution.toFixed(1)} pts
                      </span>
                    </div>
                  </div>
                  
                  {/* Barre de visualisation du poids */}
                  <div className="relative h-2 bg-gray-700/50 rounded-full overflow-hidden">
                    <div 
                      className={`absolute left-0 top-0 h-full ${colors.bg} transition-all duration-300 ease-out`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  
                  {/* Slider */}
                  <Slider
                    value={[value]}
                    onValueChange={(values) => handleWeightChange(item.key, values[0])}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Min: 0%</span>
                    <span className="text-gray-500">Max: 100%</span>
                  </div>
                  
                  {/* Description avec badge de contribution */}
                  <div className="flex items-start gap-2 pt-1">
                    <Badge variant="outline" className={`${colors.text} border-${item.color}-500/30 text-xs shrink-0`}>
                      {((scoreContribution / simulatedScore) * 100).toFixed(1)}% du total
                    </Badge>
                    <p className="text-xs text-gray-400 italic leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Insights de la simulation */}
      {scoreDiff !== 0 && (
        <Card className="bg-blue-900/20 border-blue-500/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💡</div>
              <div>
                <h4 className="font-semibold text-white mb-1">
                  {scoreDiff > 0 ? "Score amélioré !" : "Score diminué"}
                </h4>
                <p className="text-sm text-gray-300">
                  {scoreDiff > 0 
                    ? `Avec ces pondérations, le score augmente de ${Math.abs(scoreDiff)}%. Cette configuration valorise davantage les points forts du candidat.`
                    : `Avec ces pondérations, le score diminue de ${Math.abs(scoreDiff)}%. Cette configuration met en évidence les faiblesses du candidat.`
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <Button
          onClick={handleReset}
          variant="outline"
          className="text-gray-400 border-gray-600 bg-gray-800/50 hover:bg-gray-700 hover:border-gray-500"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Réinitialiser
        </Button>
        
        <div className="flex items-center gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            className="text-gray-400 border-gray-600 bg-gray-800/50 hover:bg-gray-700 hover:border-gray-500"
          >
            Annuler
          </Button>
          <Button
            onClick={() => {
              if (hasChanges) {
                onWeightsChange(simulatedWeights)
              }
              onClose()
            }}
            disabled={!isValidTotal}
            className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
          >
            <Check className="w-4 h-4 mr-2" />
            {!isValidTotal 
              ? "Total doit être 100%"
              : hasChanges
              ? "Valider et Appliquer"
              : "Valider"
            }
          </Button>
        </div>
      </div>
    </div>
  )
}
