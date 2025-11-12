"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FileDown } from "lucide-react"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface ComparisonModalProps {
  selectedResumes: any[]
  hiddenRadars: Set<string>
  onLegendClick: (data: any) => void
  onExportPDF: () => void
  onClose: () => void
  onFinishComparison: () => void
  getMatchBadgeStyle: (score: number) => string
  getMatchCategory: (score: number) => string
  prepareRadarData: () => any[]
  calculateDynamicScore: (resume: any) => number
}

export function ComparisonModal({
  selectedResumes,
  hiddenRadars,
  onLegendClick,
  onExportPDF,
  onClose,
  onFinishComparison,
  getMatchBadgeStyle,
  getMatchCategory,
  prepareRadarData,
  calculateDynamicScore,
}: ComparisonModalProps) {
  const radarData = prepareRadarData()

  return (
    <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-gray-700">
      <DialogHeader>
        <div className="flex items-start justify-between">
          <div>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              ⚖️ Comparaison des Profils
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Analyse comparative de {selectedResumes.length} candidats sélectionnés
            </DialogDescription>
          </div>
          <Button
            onClick={onExportPDF}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export Rapport
          </Button>
        </div>
      </DialogHeader>

      {/* Radar Chart - Skills Comparison */}
      {radarData.length > 0 && (
        <div className="my-6 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 border-2 border-blue-500/30 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            📊 Comparaison des Compétences
          </h3>
          <p className="text-gray-400 text-sm mb-2">
            Graphique radar montrant la couverture des compétences requises par l'appel d'offres
          </p>
          <p className="text-blue-400 text-xs mb-4 italic">
            💡 Cliquez sur un nom dans la légende pour afficher/masquer son radar
          </p>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#4b5563" />
              <PolarAngleAxis 
                dataKey="skill" 
                tick={{ fill: '#e5e7eb', fontSize: 12 }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]}
                tick={{ fill: '#9ca3af' }}
              />
              {selectedResumes.map((resume, index) => {
                const colors = [
                  { stroke: '#3b82f6', fill: '#3b82f6', fillOpacity: 0.3 }, // blue
                  { stroke: '#10b981', fill: '#10b981', fillOpacity: 0.3 }, // green
                  { stroke: '#f59e0b', fill: '#f59e0b', fillOpacity: 0.3 }, // orange
                  { stroke: '#8b5cf6', fill: '#8b5cf6', fillOpacity: 0.3 }, // purple
                ]
                const color = colors[index % colors.length]
                const isHidden = hiddenRadars.has(resume.name)
                
                return (
                  <Radar
                    key={resume.id}
                    name={resume.name}
                    dataKey={resume.name}
                    stroke={color.stroke}
                    fill={color.fill}
                    fillOpacity={color.fillOpacity}
                    strokeWidth={2}
                    hide={isHidden}
                  />
                )
              })}
              <Legend 
                wrapperStyle={{ paddingTop: '20px', cursor: 'pointer' }}
                iconType="circle"
                onClick={onLegendClick}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left p-4 bg-gray-800 sticky left-0 z-10 min-w-[200px]">
                <span className="text-gray-400 font-semibold">Critères</span>
              </th>
              {selectedResumes.map((resume) => (
                <th key={resume.id} className="text-center p-4 bg-gray-800 min-w-[250px]">
                  <div>
                    <p className="font-bold text-white">{resume.name}</p>
                    <Badge className={`mt-2 ${getMatchBadgeStyle(calculateDynamicScore(resume))}`}>
                      {calculateDynamicScore(resume)}% match
                    </Badge>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Score de correspondance */}
            <tr className="border-b border-gray-700 hover:bg-gray-800/50">
              <td className="p-4 font-semibold text-gray-300 bg-gray-900/50 sticky left-0 z-10">
                Score de Correspondance
              </td>
              {selectedResumes.map((resume) => (
                <td key={resume.id} className="text-center p-4">
                  <div className="text-3xl font-bold" style={{color: resume.matchScore >= 80 ? '#10b981' : resume.matchScore >= 70 ? '#3b82f6' : '#f59e0b'}}>
                    {resume.matchScore}%
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{getMatchCategory(resume.matchScore)}</p>
                </td>
              ))}
            </tr>

            {/* Poste */}
            <tr className="border-b border-gray-700 hover:bg-gray-800/50">
              <td className="p-4 font-semibold text-gray-300 bg-gray-900/50 sticky left-0 z-10">
                Poste Actuel
              </td>
              {selectedResumes.map((resume) => (
                <td key={resume.id} className="text-center p-4">
                  <p className="text-white font-medium">{resume.title}</p>
                  <Badge variant="outline" className="mt-2 text-xs text-gray-400">
                    {resume.grade}
                  </Badge>
                </td>
              ))}
            </tr>

            {/* Expérience */}
            <tr className="border-b border-gray-700 hover:bg-gray-800/50">
              <td className="p-4 font-semibold text-gray-300 bg-gray-900/50 sticky left-0 z-10">
                Années d'Expérience
              </td>
              {selectedResumes.map((resume) => (
                <td key={resume.id} className="text-center p-4">
                  <p className="text-2xl font-bold text-blue-400">{resume.experience}</p>
                </td>
              ))}
            </tr>

            {/* Secteurs */}
            {selectedResumes.some(r => r.sectors && r.sectors.length > 0) && (
              <tr className="border-b border-gray-700 hover:bg-gray-800/50">
                <td className="p-4 font-semibold text-gray-300 bg-gray-900/50 sticky left-0 z-10">
                  Secteurs d'Activité
                </td>
                {selectedResumes.map((resume) => (
                  <td key={resume.id} className="text-center p-4">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {resume.sectors && resume.sectors.length > 0 ? (
                        resume.sectors.map((sector: string) => (
                          <Badge key={sector} variant="outline" className="text-xs bg-purple-900/30 text-purple-300 border-purple-500">
                            {sector}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-gray-500 text-sm">Non spécifié</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            )}

            {/* Compétences correspondantes */}
            <tr className="border-b border-gray-700 hover:bg-gray-800/50">
              <td className="p-4 font-semibold text-gray-300 bg-gray-900/50 sticky left-0 z-10">
                Compétences Correspondantes
              </td>
              {selectedResumes.map((resume) => (
                <td key={resume.id} className="text-center p-4">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {resume.matchingSkills && resume.matchingSkills.length > 0 ? (
                      <>
                        {resume.matchingSkills.slice(0, 5).map((skill: string) => (
                          <Badge key={skill} className="text-xs bg-green-900/50 text-green-300 border-green-500">
                            ✓ {skill}
                          </Badge>
                        ))}
                        {resume.matchingSkills.length > 5 && (
                          <Badge variant="outline" className="text-xs text-gray-400">
                            +{resume.matchingSkills.length - 5}
                          </Badge>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-500 text-sm">Aucune</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-green-400 mt-2">
                    {resume.matchingSkills?.length || 0} compétences
                  </p>
                </td>
              ))}
            </tr>

            {/* Compétences manquantes */}
            <tr className="border-b border-gray-700 hover:bg-gray-800/50">
              <td className="p-4 font-semibold text-gray-300 bg-gray-900/50 sticky left-0 z-10">
                Compétences Manquantes
              </td>
              {selectedResumes.map((resume) => (
                <td key={resume.id} className="text-center p-4">
                  <div className="flex flex-wrap gap-1 justify-center">
                    {resume.missingSkills && resume.missingSkills.length > 0 ? (
                      <>
                        {resume.missingSkills.slice(0, 4).map((skill: string) => (
                          <Badge key={skill} className="text-xs bg-red-900/50 text-red-300 border-red-500">
                            ✗ {skill}
                          </Badge>
                        ))}
                        {resume.missingSkills.length > 4 && (
                          <Badge variant="outline" className="text-xs text-gray-400">
                            +{resume.missingSkills.length - 4}
                          </Badge>
                        )}
                      </>
                    ) : (
                      <span className="text-green-500 text-sm">Aucune !</span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-red-400 mt-2">
                    {resume.missingSkills?.length || 0} compétences
                  </p>
                </td>
              ))}
            </tr>

            {/* Raisonnement IA */}
            <tr className="border-b border-gray-700 hover:bg-gray-800/50">
              <td className="p-4 font-semibold text-gray-300 bg-gray-900/50 sticky left-0 z-10">
                Analyse IA
              </td>
              {selectedResumes.map((resume) => (
                <td key={resume.id} className="p-4">
                  {resume.reasoning ? (
                    <p className="text-sm text-gray-300 leading-relaxed text-left">
                      {resume.reasoning}
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm text-center">Non disponible</p>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          onClick={onClose}
          className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 font-semibold"
        >
          Fermer
        </Button>
        <Button
          onClick={onFinishComparison}
          className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-black font-semibold shadow-lg"
        >
          Terminer la Comparaison
        </Button>
      </div>
    </DialogContent>
  )
}
