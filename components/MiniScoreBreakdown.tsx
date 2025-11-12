"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Code, Briefcase, GraduationCap, Building } from "lucide-react"

interface MiniScoreBreakdownProps {
  breakdown?: {
    technicalSkills: number
    experience: number
    training: number
    context: number
  }
}

export function MiniScoreBreakdown({ breakdown }: MiniScoreBreakdownProps) {
  if (!breakdown) return null

  const items = [
    { 
      key: "technicalSkills", 
      label: "Compétences", 
      shortLabel: "Tech",
      icon: Code, 
      color: "bg-blue-500",
      borderColor: "border-blue-500/30",
      textColor: "text-blue-400", 
      score: breakdown.technicalSkills 
    },
    { 
      key: "experience", 
      label: "Expérience", 
      shortLabel: "Exp",
      icon: Briefcase, 
      color: "bg-purple-500",
      borderColor: "border-purple-500/30",
      textColor: "text-purple-400", 
      score: breakdown.experience 
    },
    { 
      key: "training", 
      label: "Formations", 
      shortLabel: "Form",
      icon: GraduationCap, 
      color: "bg-green-500",
      borderColor: "border-green-500/30",
      textColor: "text-green-400", 
      score: breakdown.training 
    },
    { 
      key: "context", 
      label: "Contexte", 
      shortLabel: "Ctx",
      icon: Building, 
      color: "bg-yellow-500",
      borderColor: "border-yellow-500/30",
      textColor: "text-yellow-400", 
      score: breakdown.context 
    },
  ]

  // Progress circulaires (compact pour header)
  return (
      <div className="flex items-center gap-2">
        {items.map((item) => {
          const Icon = item.icon
          const circumference = 2 * Math.PI * 14 // rayon 14 (réduit)
          const dashOffset = circumference - (item.score / 100) * circumference
          
          return (
            <TooltipProvider key={item.key}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative flex items-center gap-1 cursor-help group">
                    {/* SVG Circle Progress (plus compact) */}
                    <div className="relative w-8 h-8">
                      <svg className="transform -rotate-90 w-8 h-8">
                        {/* Background circle */}
                        <circle
                          cx="16"
                          cy="16"
                          r="14"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          fill="none"
                          className="text-gray-700"
                        />
                        {/* Progress circle */}
                        <circle
                          cx="16"
                          cy="16"
                          r="14"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          fill="none"
                          strokeDasharray={circumference}
                          strokeDashoffset={dashOffset}
                          className={item.textColor}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                        />
                      </svg>
                      
                      {/* Icon au centre */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon className="w-3.5 h-3.5 text-gray-300" />
                      </div>
                    </div>
                    
                    {/* Score à côté du cercle */}
                    <div className={`text-[10px] font-bold ${item.textColor} whitespace-nowrap`}>
                      {item.score}%
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 border-gray-600">
                  <p className="font-semibold">{item.label}: {item.score}%</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>
    )
}
