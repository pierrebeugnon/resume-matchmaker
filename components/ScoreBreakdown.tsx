"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Code, Briefcase, GraduationCap, Building, TrendingUp, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export interface ScoreBreakdownData {
  technicalSkills: number
  experience: number
  training: number
  context: number
  availability?: number
  culturalFit?: number
}

export interface WeightConfig {
  technicalSkills: number
  experience: number
  training: number
  context: number
}

interface ScoreBreakdownProps {
  breakdown: ScoreBreakdownData
  weights: WeightConfig
  totalScore?: number  // Optionnel car recalculé automatiquement
  showComparison?: boolean
  originalScore?: number
  isSimulation?: boolean
}

export function ScoreBreakdown({
  breakdown,
  weights,
  totalScore: totalScoreProp, // Renommé pour éviter confusion
  showComparison = false,
  originalScore,
  isSimulation = false,
}: ScoreBreakdownProps) {
  const scoreItems = [
    {
      label: "Compétences Techniques",
      icon: Code,
      score: breakdown.technicalSkills,
      weight: weights.technicalSkills,
      color: "blue",
      description: "Maîtrise des technologies et outils requis"
    },
    {
      label: "Expérience",
      icon: Briefcase,
      score: breakdown.experience,
      weight: weights.experience,
      color: "purple",
      description: "Années d'expérience et pertinence des rôles précédents"
    },
    {
      label: "Formations",
      icon: GraduationCap,
      score: breakdown.training,
      weight: weights.training,
      color: "green",
      description: "Diplômes, certifications et formations continues"
    },
    {
      label: "Contexte",
      icon: Building,
      score: breakdown.context,
      weight: weights.context,
      color: "yellow",
      description: "Expérience dans le secteur et contexte similaire"
    },
  ]

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      blue: { bg: "bg-blue-500", text: "text-blue-400", border: "border-blue-500" },
      purple: { bg: "bg-purple-500", text: "text-purple-400", border: "border-purple-500" },
      green: { bg: "bg-green-500", text: "text-green-400", border: "border-green-500" },
      yellow: { bg: "bg-yellow-500", text: "text-yellow-400", border: "border-yellow-500" },
    }
    return colors[color] || colors.blue
  }

  const calculateWeightedScore = (score: number, weight: number) => {
    return (score * weight) / 100
  }

  // CORRECTION : Recalculer le score total basé sur les pondérations actuelles
  const totalScore = Math.round(
    (breakdown.technicalSkills * weights.technicalSkills / 100) +
    (breakdown.experience * weights.experience / 100) +
    (breakdown.training * weights.training / 100) +
    (breakdown.context * weights.context / 100)
  )

  const scoreDiff = originalScore ? totalScore - originalScore : 0
  const scoreDiffAbs = Math.abs(scoreDiff)
  const scoreDiffSign = scoreDiff > 0 ? "+" : ""

  return (
    <Card className={`bg-gray-900 border-gray-700 ${isSimulation ? 'ring-2 ring-yellow-400 shadow-yellow-400/30' : ''}`}>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header avec score total */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                {isSimulation && <span className="text-yellow-400">⚡</span>}
                Breakdown du Score
                {isSimulation && (
                  <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500">
                    Simulation
                  </Badge>
                )}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                Score candidat × Poids = Contribution
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">
                {totalScore}%
              </div>
              <p className="text-xs text-gray-500 mt-0.5">Score final</p>
              {showComparison && originalScore && (
                <div className={`text-sm font-semibold ${
                  scoreDiff > 0 ? 'text-green-400' : scoreDiff < 0 ? 'text-red-400' : 'text-gray-400'
                }`}>
                  {scoreDiff !== 0 && (
                    <>
                      {scoreDiffSign}{scoreDiffAbs.toFixed(1)}%
                      {scoreDiff > 0 ? ' ↑' : ' ↓'}
                    </>
                  )}
                  {scoreDiff === 0 && '= Identique'}
                </div>
              )}
            </div>
          </div>

          {/* Breakdown détaillé */}
          <div className="space-y-4">
            {scoreItems.map((item) => {
              const colors = getColorClasses(item.color)
              const Icon = item.icon
              const weightedScore = calculateWeightedScore(item.score, item.weight)
              const contributionPercent = (weightedScore / totalScore) * 100

              return (
                <div key={item.label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${colors.text}`} />
                      <span className="text-sm font-medium text-white">{item.label}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="w-3 h-3 text-gray-500 cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs">{item.description}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="text-gray-400 cursor-help">
                              Score: {item.score}%
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs font-semibold">Score du candidat</p>
                            <p className="text-xs">Performance sur ce critère</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span className="text-gray-500">×</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className={`${colors.text} ${colors.border} text-xs cursor-help`}>
                              Poids: {item.weight}%
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="text-xs font-semibold">Pondération</p>
                            <p className="text-xs">Importance de ce critère</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span className="text-gray-500">=</span>
                      <span className={`font-semibold ${colors.text} min-w-[60px] text-right`}>
                        {weightedScore.toFixed(1)} pts
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress bar avec contribution */}
                  <div className="relative">
                    <Progress 
                      value={item.score} 
                      className="h-2 bg-gray-800"
                    />
                    <div 
                      className={`absolute top-0 left-0 h-2 ${colors.bg} rounded-full transition-all duration-300`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Contribution: {contributionPercent.toFixed(1)}% du score total</span>
                    <span>{weightedScore.toFixed(1)} / {item.weight} points possibles</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Footer avec insights */}
          <div className="pt-4 border-t border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <p className="text-gray-400">Points forts</p>
                <div className="flex flex-wrap gap-1">
                  {scoreItems
                    .filter(item => item.score >= 80)
                    .map(item => (
                      <Badge key={item.label} variant="outline" className="text-green-400 border-green-600">
                        {item.label}
                      </Badge>
                    ))
                  }
                  {scoreItems.filter(item => item.score >= 80).length === 0 && (
                    <span className="text-gray-500">Aucun</span>
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-gray-400">À améliorer</p>
                <div className="flex flex-wrap gap-1">
                  {scoreItems
                    .filter(item => item.score < 60)
                    .map(item => (
                      <Badge key={item.label} variant="outline" className="text-orange-400 border-orange-600">
                        {item.label}
                      </Badge>
                    ))
                  }
                  {scoreItems.filter(item => item.score < 60).length === 0 && (
                    <span className="text-gray-500">Aucun</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
