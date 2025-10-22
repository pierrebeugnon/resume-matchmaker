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
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white text-black">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-3 text-black">
          <span>{resume.name}</span>
          {showMatchingInfo && resume.matchScore !== undefined && (
            <Badge className={getMatchBadgeStyle(resume.matchScore)}>
              {resume.matchScore}% correspondance
            </Badge>
          )}
        </DialogTitle>
        <DialogDescription className="text-gray-600">
          {resume.title} • {resume.location}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {showMatchingInfo && resume.reasoning && (
          <div className="p-4 bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-400 rounded-lg">
            <h4 className="font-bold text-lg text-black mb-3">Analyse IA - Évaluation Détaillée</h4>
            <p className="text-black leading-relaxed font-medium">{resume.reasoning}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 text-sm text-black">
            <Mail className="w-4 h-4" />
            <span>{resume.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-black">
            <Phone className="w-4 h-4" />
            <span>{resume.phone}</span>
          </div>
        </div>

        {resume.tace !== undefined && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-semibold text-black">📊 Taux d'Activité (TACE)</span>
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

        <div>
          <h4 className="font-semibold mb-2 text-black">Résumé Professionnel</h4>
          <p className="text-black">{resume.summary}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2 text-black">Expérience</h4>
            <p className="text-black">{resume.experience}</p>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-black">Formation</h4>
            <p className="text-black">
              {Array.isArray(resume.education) 
                ? resume.education.join(', ') 
                : resume.education}
            </p>
          </div>
        </div>

        {resume.previousRoles && resume.previousRoles.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 text-black">Postes Précédents</h4>
            <ul className="list-disc list-inside space-y-1">
              {resume.previousRoles.map((role: string, index: number) => (
                <li key={index} className="text-black text-sm">
                  {role}
                </li>
              ))}
            </ul>
          </div>
        )}

        {resume.keyAchievements && resume.keyAchievements.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 text-black">Réalisations Clés</h4>
            <ul className="list-disc list-inside space-y-1">
              {resume.keyAchievements.map((achievement: string, index: number) => (
                <li key={index} className="text-black text-sm">
                  {achievement}
                </li>
              ))}
            </ul>
          </div>
        )}

        {showMatchingInfo && resume.matchingSkills && resume.matchingSkills.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 text-black">
              ✓ Compétences Correspondantes ({resume.matchingSkills.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {resume.matchingSkills.map((skill: string) => (
                <Badge key={skill} variant="outline" className="text-black border-green-600 bg-green-50">
                  ✓ {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {showMatchingInfo && resume.missingSkills && resume.missingSkills.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 text-black">
              ✗ Compétences Manquantes ({resume.missingSkills.length})
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              Compétences requises dans l'appel d'offres non présentes dans ce CV :
            </p>
            <div className="flex flex-wrap gap-2">
              {resume.missingSkills.map((skill: string) => (
                <Badge key={skill} variant="outline" className="text-black border-red-600 bg-red-50">
                  ✗ {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="font-semibold mb-2 text-black">Compétences Techniques</h4>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill: string) => (
              <Badge key={skill} variant="outline" className="text-black border-gray-300">
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        {resume.sectors && resume.sectors.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 text-black">
              🏢 Secteurs d'Activité
            </h4>
            <p className="text-sm text-gray-600 mb-2">
              Secteurs dans lesquels ce candidat a travaillé :
            </p>
            <div className="flex flex-wrap gap-2">
              {resume.sectors.map((sector: string) => (
                <Badge key={sector} variant="outline" className="text-black border-purple-600 bg-purple-50">
                  {sector}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {resume.languages && resume.languages.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 text-black">Langues</h4>
            <div className="flex flex-wrap gap-2">
              {resume.languages.map((lang: string) => (
                <Badge key={lang} variant="secondary" className="text-black">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {resume.certifications && resume.certifications.length > 0 && (
          <div>
            <h4 className="font-semibold mb-2 text-black">Certifications</h4>
            <div className="flex flex-wrap gap-2">
              {resume.certifications.map((cert: string) => (
                <Badge key={cert} variant="default" className="text-white">
                  <Award className="w-3 h-3 mr-1" />
                  {cert}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Analyse IA Enrichie - Uniquement pour le matching */}
        {showMatchingInfo && (
          <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300 rounded-lg">
            <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🧠</span>
              Analyse IA Enrichie
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. Score de compatibilité culturelle */}
              <div className="p-4 bg-white rounded-lg border border-purple-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-black flex items-center gap-2">
                    🏯 Compatibilité Culturelle
                  </h4>
                  {resume.culturalFitScore !== undefined && (
                    <Badge className={`${
                      resume.culturalFitScore >= 80 ? 'bg-green-600' :
                      resume.culturalFitScore >= 60 ? 'bg-yellow-600' : 'bg-orange-600'
                    } text-white text-lg px-3 py-1`}>
                      {resume.culturalFitScore}%
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-700">
                  {resume.culturalFitScore !== undefined ? (
                    resume.culturalFitScore >= 80 ? 
                      "Excellente adéquation avec la culture d'entreprise. Le candidat partage les valeurs de collaboration et d'innovation." :
                    resume.culturalFitScore >= 60 ?
                      "Bonne compatibilité culturelle. Quelques ajustements possibles dans le style de travail." :
                      "Compatibilité modérée. Des différences culturelles à discuter en entretien."
                  ) : "Non évalué"}
                </p>
              </div>

              {/* 2. Prédiction de réussite */}
              <div className="p-4 bg-white rounded-lg border border-purple-200 shadow-sm">
                <h4 className="font-semibold text-black mb-3 flex items-center gap-2">
                  📈 Prédiction de Réussite
                </h4>
                <p className="text-sm text-gray-700">
                  {resume.successPrediction || "Forte probabilité de réussite dans le poste basée sur l'expérience et les compétences."}
                </p>
              </div>

              {/* 3. Formations recommandées */}
              <div className="p-4 bg-white rounded-lg border border-purple-200 shadow-sm">
                <h4 className="font-semibold text-black mb-3 flex items-center gap-2">
                  📚 Formations Recommandées
                </h4>
                {resume.trainingRecommendations && resume.trainingRecommendations.length > 0 ? (
                  <ul className="space-y-2">
                    {resume.trainingRecommendations.map((training: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{training}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Aucune recommandation</p>
                )}
              </div>

              {/* 4. Sujets d'entretien */}
              <div className="p-4 bg-white rounded-lg border border-purple-200 shadow-sm">
                <h4 className="font-semibold text-black mb-3 flex items-center gap-2">
                  💬 Sujets d'Entretien
                </h4>
                {resume.interviewTopics && resume.interviewTopics.length > 0 ? (
                  <ul className="space-y-2">
                    {resume.interviewTopics.map((topic: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span>{topic}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">Aucun sujet</p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="space-x-2">
            <Button onClick={() => console.log("Sending email to", resume.email)}>
              <Mail className="w-4 h-4 mr-2" />
              Contacter
            </Button>
            <Button variant="outline" onClick={() => shareProfile(resume)}>
              <Share2 className="w-4 h-4 mr-2" />
              Partager
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Télécharger CV
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  )
}
