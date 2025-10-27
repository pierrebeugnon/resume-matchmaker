"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Mail,
  Phone,
  Award,
  Download,
  Share2,
} from "lucide-react"

interface ResumeDetailDialogProps {
  resume: any  // Using any to avoid type conflicts
  getMatchBadgeStyle: (score: number) => string
  shareProfile: (resume: any) => void
  showMatchingInfo?: boolean  // Par défaut true pour compatibilité
}

export function ResumeDetailDialog({ 
  resume, 
  getMatchBadgeStyle, 
  shareProfile,
  showMatchingInfo = true
}: ResumeDetailDialogProps) {
  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 text-white border-gray-700">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-3 text-white text-2xl">
          <span>{resume.name}</span>
          {showMatchingInfo && resume.matchScore !== undefined && (
            <Badge className={getMatchBadgeStyle(resume.matchScore)}>
              {resume.matchScore}% correspondance
            </Badge>
          )}
        </DialogTitle>
        <DialogDescription className="text-gray-400 text-base">
          {resume.title} • {resume.location}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {showMatchingInfo && resume.reasoning && (
          <div className="p-5 bg-gradient-to-r from-blue-900/60 to-purple-900/60 border-2 border-blue-400 rounded-lg shadow-lg">
            <h4 className="font-bold text-lg text-white mb-3 flex items-center gap-2">
              🤖 Analyse IA - Évaluation Détaillée
            </h4>
            <p className="text-white leading-relaxed font-medium">{resume.reasoning}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-sm text-gray-300 bg-gray-800 p-3 rounded-lg border border-gray-700">
            <Mail className="w-4 h-4 text-blue-400" />
            <span>{resume.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-300 bg-gray-800 p-3 rounded-lg border border-gray-700">
            <Phone className="w-4 h-4 text-green-400" />
            <span>{resume.phone}</span>
          </div>
        </div>

        {resume.tace !== undefined && (
          <div className="p-4 bg-gray-800 border border-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-white">📊 Taux d'Activité (TACE)</span>
              </div>
              <Badge className={`text-sm ${
                resume.tace >= 90 ? 'bg-green-600 text-white' :
                resume.tace >= 1 ? 'bg-yellow-600 text-white' :
                'bg-red-600 text-white'
              }`}>
                {resume.tace}%
              </Badge>
            </div>
          </div>
        )}

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h4 className="font-semibold mb-2 text-white text-lg">Résumé Professionnel</h4>
          <p className="text-gray-300 leading-relaxed">{resume.summary}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h4 className="font-semibold mb-2 text-white">Expérience</h4>
            <p className="text-gray-300">{resume.experience}</p>
          </div>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h4 className="font-semibold mb-2 text-white">Formation</h4>
            <p className="text-gray-300">
              {Array.isArray(resume.education) 
                ? resume.education.join(', ') 
                : resume.education}
            </p>
          </div>
        </div>

        {resume.previousRoles && resume.previousRoles.length > 0 && (
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h4 className="font-semibold mb-3 text-white">Postes Précédents</h4>
            <ul className="space-y-2">
              {resume.previousRoles.map((role: string, index: number) => (
                <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">•</span>
                  <span>{role}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {resume.keyAchievements && resume.keyAchievements.length > 0 && (
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h4 className="font-semibold mb-3 text-white">Réalisations Clés</h4>
            <ul className="space-y-2">
              {resume.keyAchievements.map((achievement: string, index: number) => (
                <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">✓</span>
                  <span>{achievement}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showMatchingInfo && resume.matchingSkills && resume.matchingSkills.length > 0 && (
          <div className="bg-gray-800 p-4 rounded-lg border border-green-600/50">
            <h4 className="font-semibold mb-3 text-white">
              ✓ Compétences Correspondantes ({resume.matchingSkills.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {resume.matchingSkills.map((skill: string) => (
                <Badge key={skill} className="bg-green-600/20 text-green-400 border border-green-600 hover:bg-green-600/30">
                  ✓ {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {showMatchingInfo && resume.missingSkills && resume.missingSkills.length > 0 && (
          <div className="bg-gray-800 p-4 rounded-lg border border-red-600/50">
            <h4 className="font-semibold mb-2 text-white">
              ✗ Compétences Manquantes ({resume.missingSkills.length})
            </h4>
            <p className="text-sm text-gray-400 mb-3">
              Compétences requises dans l'appel d'offres non présentes dans ce CV :
            </p>
            <div className="flex flex-wrap gap-2">
              {resume.missingSkills.map((skill: string) => (
                <Badge key={skill} className="bg-red-600/20 text-red-400 border border-red-600 hover:bg-red-600/30">
                  ✗ {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h4 className="font-semibold mb-3 text-white">Compétences Techniques</h4>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill: string) => (
              <Badge key={skill} className="bg-gray-700 text-gray-200 border border-gray-600 hover:bg-gray-600">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {resume.sectors && resume.sectors.length > 0 && (
          <div className="bg-gray-800 p-4 rounded-lg border border-purple-600/50">
            <h4 className="font-semibold mb-2 text-white">
              🏢 Secteurs d'Activité ({resume.sectors.length})
            </h4>
            <p className="text-sm text-gray-400 mb-3">
              Secteurs dans lesquels ce candidat a travaillé :
            </p>
            <div className="flex flex-wrap gap-2">
              {resume.sectors.map((sector: string) => (
                <Badge key={sector} className="bg-purple-600/20 text-purple-400 border border-purple-600 hover:bg-purple-600/30">
                  {sector}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {resume.languages && resume.languages.length > 0 && (
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <h4 className="font-semibold mb-3 text-white">Langues</h4>
            <div className="flex flex-wrap gap-2">
              {resume.languages.map((lang: string) => (
                <Badge key={lang} className="bg-blue-600/20 text-blue-400 border border-blue-600">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {resume.certifications && resume.certifications.length > 0 && (
          <div className="bg-gray-800 p-4 rounded-lg border border-yellow-600/50">
            <h4 className="font-semibold mb-3 text-white">Certifications</h4>
            <div className="flex flex-wrap gap-2">
              {resume.certifications.map((cert: string) => (
                <Badge key={cert} className="bg-yellow-600/20 text-yellow-400 border border-yellow-600 hover:bg-yellow-600/30">
                  <Award className="w-3 h-3 mr-1" />
                  {cert}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Analyse IA Enrichie - Uniquement pour le matching */}
        {showMatchingInfo && (
          <div className="p-6 bg-gradient-to-br from-purple-900/40 to-blue-900/40 border-2 border-purple-500 rounded-lg">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              Analyse IA Enrichie
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Prédiction de réussite */}
              <div className="p-4 bg-gray-800 rounded-lg border border-purple-600/50 shadow-lg">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  📈 Prédiction de Réussite
                </h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {resume.successPrediction || "Forte probabilité de réussite dans le poste basée sur l'expérience et les compétences."}
                </p>
              </div>

              {/* 2. Formations recommandées */}
              <div className="p-4 bg-gray-800 rounded-lg border border-blue-600/50 shadow-lg">
                <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                  📚 Formations Recommandées
                </h4>
                {resume.trainingRecommendations && resume.trainingRecommendations.length > 0 ? (
                  <ul className="space-y-2">
                    {resume.trainingRecommendations.map((training: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{training}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Aucune recommandation</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t border-gray-700">
          <div className="space-x-2">
            <Button onClick={() => console.log("Sending email to", resume.email)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Mail className="w-4 h-4 mr-2" />
              Contacter
            </Button>
            <Button onClick={() => shareProfile(resume)} className="bg-purple-600 hover:bg-purple-700 text-white">
              <Share2 className="w-4 h-4 mr-2" />
              Partager
            </Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <Download className="w-4 h-4 mr-2" />
              Télécharger CV
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  )
}
