"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ResumeDetailDialog } from "@/components/ResumeDetailDialog"
import { ComparisonModal } from "@/components/ComparisonModal"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
import {
  Upload,
  Search,
  Filter,
  Award,
  FileText,
  Database,
  CheckCircle,
  Eye,
  Download,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
  Info,
  Loader2,
  Copy,
  Share2,
  FileSpreadsheet,
  FileDown,
  Star,
  XCircle,
  Briefcase,
  RotateCcw,
  BarChart3,
  TrendingUp,
  Activity,
  Clock,
  Users,
  Calendar,
  Zap,
  X,
  Sparkles,
  Target,
  Layers,
  HelpCircle,
  Code,
  GraduationCap,
  Building,
  Lightbulb,
  Settings,
} from "lucide-react"
import { 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ScatterChart,
  Scatter,
  Cell,
  LabelList
} from "recharts"
import type { MatchingRequest, MatchingResponse, CandidateCV, JobOffer } from "@/lib/types"
import type { CandidateCV as LoadedCV } from "@/lib/loadCVs"

interface Resume {
  id: string
  name: string
  title: string
  grade: string
  location: string
  experience: string
  skills: string[]
  languages: string[]
  certifications: string[]
  matchScore: number
  availability: string
  summary: string
  email: string
  phone: string
  education: string
  previousRoles: string[]
  keyAchievements: string[]
  reasoning?: string
  matchingSkills?: string[]
  missingSkills?: string[]
  sectors?: string[]
  tace?: number  // Taux d'Activité (en %)
  // Analyse IA enrichie
  culturalFitScore?: number
  trainingRecommendations?: string[]
  successPrediction?: string
  interviewTopics?: string[]
}

interface SearchHistoryEntry {
  id: string
  timestamp: number
  searchMode: "simple" | "multi"
  tenderText: string
  selectedTemplate: string | null
  resultsCount: number
  topMatches: Array<{
    name: string
    score: number
    title: string
  }>
  filters: {
    location: string
    availability: string
    minExperience: string
    sectors: string[]
    skills: string[]
    certifications: string[]
  }
  profilesCount?: number
}

export default function ResumeMatchmaker() {
  const [tenderText, setTenderText] = useState("")
  const [enrichedText, setEnrichedText] = useState<string>("")
  const [uploadedFileName, setUploadedFileName] = useState<string>("")
  const [isImproving, setIsImproving] = useState(false)
  const [isMatching, setIsMatching] = useState(false)
  const [hasResults, setHasResults] = useState(false)
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null)
  const [matchingProgress, setMatchingProgress] = useState(0)
  const [matchingStep, setMatchingStep] = useState("")
  const [isLoadingCVs, setIsLoadingCVs] = useState(true)
  const [filters, setFilters] = useState({
    location: "",
    availability: "",
    minExperience: "",
    sectors: [] as string[],
    skills: [] as string[],
    certifications: [] as string[],
  })
  const [realCVs, setRealCVs] = useState<LoadedCV[]>([])
  const [resumes, setResumes] = useState<Resume[]>([])
  const [matchedResumes, setMatchedResumes] = useState<Resume[]>([])
  const [matchingSummary, setMatchingSummary] = useState<string>("")
  const [showInformation, setShowInformation] = useState(false)
  const [expandedSection, setExpandedSection] = useState<"tender" | "filters" | null>("tender")
  const [compareMode, setCompareMode] = useState(false)
  const [selectedForCompare, setSelectedForCompare] = useState<Set<string>>(new Set())
  const [showCompareModal, setShowCompareModal] = useState(false)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [showMultiProfileWarning, setShowMultiProfileWarning] = useState(false)
  const [viewMode, setViewMode] = useState<"dashboard" | "matching" | "overview">("dashboard")
  const [searchMode, setSearchMode] = useState<"simple" | "multi">("simple")
  const [showModeChangeDialog, setShowModeChangeDialog] = useState(false)
  const [pendingMode, setPendingMode] = useState<"simple" | "multi" | null>(null)
  const [showHistoryPanel, setShowHistoryPanel] = useState(false)
  const [searchHistory, setSearchHistory] = useState<SearchHistoryEntry[]>([])
  const [showMatchingInfoDialog, setShowMatchingInfoDialog] = useState(false)
  const [showInfoButtonAnimation, setShowInfoButtonAnimation] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [currentPageMulti, setCurrentPageMulti] = useState<{[key: string]: number}>({})
  const [showWeightsDialog, setShowWeightsDialog] = useState(false)
  const [matchingWeights, setMatchingWeights] = useState({
    technicalSkills: 40,
    experience: 30,
    training: 20,
    context: 10
  })
  
  // Désactiver l'animation du bouton info après 10 secondes
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInfoButtonAnimation(false)
    }, 10000) // 10 secondes
    
    return () => clearTimeout(timer)
  }, [])
  
  // Liste des templates multi-profils
  const multiProfileTemplates = [
    "Migration Cloud Data",
    "Plateforme IA Générative", 
    "Data Lakehouse Moderne",
    "MLOps Platform",
    "Data Science & Analytics BI",
    "Real-time Data Platform"
  ]

  // Multi-profile detection system
  interface DetectedProfile {
    id: string
    title: string
    description: string
    required_skills: string[]
    nice_to_have: string[]
    min_experience: number
    responsibilities: string[]
    estimated_count: number
  }

  const [isAnalyzingTender, setIsAnalyzingTender] = useState(false)
  const [detectedProfiles, setDetectedProfiles] = useState<DetectedProfile[]>([])
  const [isMultiProfile, setIsMultiProfile] = useState(false)
  const [showProfileValidation, setShowProfileValidation] = useState(false)
  const [selectedProfiles, setSelectedProfiles] = useState<Set<string>>(new Set())
  const [profileResults, setProfileResults] = useState<Record<string, Resume[]>>({})
  const [profileSummaries, setProfileSummaries] = useState<Record<string, string>>({})
  const [activeProfileTab, setActiveProfileTab] = useState<string | null>(null)

  // Favorites system with localStorage
  const [favorites, setFavorites] = useState<string[]>([])

  // Load favorites from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('resume-matchmaker-favorites')
    if (saved) {
      try {
        setFavorites(JSON.parse(saved))
      } catch (e) {
        console.error('Error loading favorites:', e)
      }
    }
  }, [])

  // Load search history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('resume-matchmaker-history')
    if (saved) {
      try {
        const history = JSON.parse(saved)
        setSearchHistory(history)
      } catch (e) {
        console.error('Error loading history:', e)
      }
    }
  }, [])

  // Save favorites to localStorage
  const saveFavorites = (newFavorites: string[]) => {
    setFavorites(newFavorites)
    localStorage.setItem('resume-matchmaker-favorites', JSON.stringify(newFavorites))
  }

  // Save search to history
  const saveSearchToHistory = () => {
    const historyEntry: SearchHistoryEntry = {
      id: `search-${Date.now()}`,
      timestamp: Date.now(),
      searchMode: searchMode,
      tenderText: tenderText,
      selectedTemplate: selectedTemplate,
      resultsCount: matchedResumes.length,
      topMatches: matchedResumes.slice(0, 3).map(r => ({
        name: r.name,
        score: r.matchScore,
        title: r.title
      })),
      filters: filters,
      profilesCount: searchMode === "multi" ? detectedProfiles.length : undefined
    }

    const updatedHistory = [historyEntry, ...searchHistory].slice(0, 20) // Keep last 20 searches
    setSearchHistory(updatedHistory)
    localStorage.setItem('resume-matchmaker-history', JSON.stringify(updatedHistory))
  }

  // Restore search from history
  const restoreSearchFromHistory = (entry: SearchHistoryEntry) => {
    setTenderText(entry.tenderText)
    setSelectedTemplate(entry.selectedTemplate)
    setSearchMode(entry.searchMode)
    setFilters(entry.filters)
    
    // Reset multi-profile state as we don't store complete profile data
    setDetectedProfiles([])
    setIsMultiProfile(false)
    setShowProfileValidation(false)
    
    setShowHistoryPanel(false)
    toast.success("Recherche restaurée", {
      description: "Cliquez sur 'Démarrer le Matching' pour relancer la recherche"
    })
  }

  // Delete history entry
  const deleteHistoryEntry = (entryId: string) => {
    const updatedHistory = searchHistory.filter(h => h.id !== entryId)
    setSearchHistory(updatedHistory)
    localStorage.setItem('resume-matchmaker-history', JSON.stringify(updatedHistory))
    toast.success("Entrée supprimée de l'historique")
  }

  // Clear all history
  const clearAllHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('resume-matchmaker-history')
    toast.success("Historique effacé")
  }

  // Toggle favorite with animation
  const toggleFavorite = (resumeId: string) => {
    const newFavorites = favorites.includes(resumeId)
      ? favorites.filter(id => id !== resumeId)
      : [...favorites, resumeId]
    
    saveFavorites(newFavorites)
    
    // Animate the button
    const button = document.querySelector(`[data-favorite-id="${resumeId}"]`)
    if (button) {
      button.classList.add('animate-bounce')
      setTimeout(() => button.classList.remove('animate-bounce'), 500)
    }
    
    toast.success(
      newFavorites.includes(resumeId) ? '⭐ Ajouté aux favoris' : 'Retiré des favoris',
      { duration: 2000 }
    )
  }

  // Export & Share functions
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copié !`, { description: text })
  }

  const exportToCSV = () => {
    const csvData = [
      ["Nom", "Poste", "Score", "Expérience", "Email", "Téléphone", "Localisation", "Disponibilité"],
      ...getFilteredAndSortedResumes().map(r => [
        r.name,
        r.title,
        r.matchScore + "%",
        r.experience,
        r.email,
        r.phone,
        r.location,
        r.availability
      ])
    ]
    
    const csvContent = csvData.map(row => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `candidats_matches_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Export CSV réussi !", { description: `${getFilteredAndSortedResumes().length} candidats exportés` })
  }

  const exportToExcel = () => {
    // For Excel, we'll use CSV with Excel-friendly format
    const excelData = [
      ["Nom", "Poste", "Score (%)", "Expérience", "Email", "Téléphone", "Localisation", "Disponibilité", "Compétences correspondantes", "Compétences manquantes"],
      ...getFilteredAndSortedResumes().map(r => [
        r.name,
        r.title,
        r.matchScore.toString(),
        r.experience,
        r.email,
        r.phone,
        r.location,
        r.availability,
        r.matchingSkills?.join("; ") || "",
        r.missingSkills?.join("; ") || ""
      ])
    ]
    
    const csvContent = "\uFEFF" + excelData.map(row => row.map(cell => `"${cell}"`).join(";")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `candidats_matches_${new Date().toISOString().split('T')[0]}.xlsx.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Export Excel réussi !", { description: `${getFilteredAndSortedResumes().length} candidats exportés` })
  }

  const shareProfile = (resume: Resume) => {
    const profileText = `
🎯 Profil Candidat - ${resume.name}

📊 Score de correspondance: ${resume.matchScore}%
💼 Poste: ${resume.title}
⏱️ Expérience: ${resume.experience}
📍 Localisation: ${resume.location}

📧 Email: ${resume.email}
📞 Téléphone: ${resume.phone}

✅ Compétences correspondantes (${resume.matchingSkills?.length || 0}):
${resume.matchingSkills?.slice(0, 5).map(s => `  • ${s}`).join('\n') || 'N/A'}

${resume.missingSkills && resume.missingSkills.length > 0 ? `⚠️ Compétences à développer (${resume.missingSkills.length}):\n${resume.missingSkills.slice(0, 3).map(s => `  • ${s}`).join('\n')}` : ''}
    `.trim()
    
    navigator.clipboard.writeText(profileText)
    toast.success("Profil copié !", { description: "Vous pouvez maintenant le partager" })
  }

  const exportComparisonToPDF = () => {
    const selectedResumes = getSelectedResumes()
    
    // Create text report
    let report = `
═══════════════════════════════════════════════════════════
    RAPPORT DE COMPARAISON DES CANDIDATS
═══════════════════════════════════════════════════════════

Date: ${new Date().toLocaleDateString('fr-FR')}
Nombre de candidats comparés: ${selectedResumes.length}

${selectedResumes.map((resume, index) => `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CANDIDAT ${index + 1}: ${resume.name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 SCORE DE CORRESPONDANCE: ${resume.matchScore}%
💼 Poste: ${resume.title}
⏱️ Expérience: ${resume.experience}
📍 Localisation: ${resume.location}
📧 Email: ${resume.email}
📞 Téléphone: ${resume.phone}

✅ COMPÉTENCES CORRESPONDANTES (${resume.matchingSkills?.length || 0}):
${resume.matchingSkills?.map(s => `   • ${s}`).join('\n') || '   Aucune'}

${resume.missingSkills && resume.missingSkills.length > 0 ? `⚠️ COMPÉTENCES À DÉVELOPPER (${resume.missingSkills.length}):\n${resume.missingSkills.map(s => `   • ${s}`).join('\n')}` : '✓ Toutes les compétences requises sont présentes'}

${resume.culturalFitScore ? `🏯 COMPATIBILITÉ CULTURELLE: ${resume.culturalFitScore}%` : ''}

${resume.successPrediction ? `📈 PRÉDICTION DE RÉUSSITE:\n   ${resume.successPrediction}` : ''}

${resume.trainingRecommendations && resume.trainingRecommendations.length > 0 ? `🎓 FORMATIONS RECOMMANDÉES:\n${resume.trainingRecommendations.map(t => `   • ${t}`).join('\n')}` : ''}

${resume.interviewTopics && resume.interviewTopics.length > 0 ? `💬 POINTS D'ATTENTION EN ENTRETIEN:\n${resume.interviewTopics.map(t => `   • ${t}`).join('\n')}` : ''}

${resume.reasoning ? `\n🤖 ANALYSE IA:\n${resume.reasoning}\n` : ''}
`).join('\n')}

═══════════════════════════════════════════════════════════
    COMPARAISON SYNTHÉTIQUE
═══════════════════════════════════════════════════════════

${selectedResumes.map((r, i) => `${i + 1}. ${r.name} - Score: ${r.matchScore}% - ${r.experience} exp.`).join('\n')}

═══════════════════════════════════════════════════════════
Note: Ce rapport a été généré automatiquement par l'IA.
Pour les graphiques, consultez l'interface web.
═══════════════════════════════════════════════════════════
    `.trim()
    
    // Download as text file (simulating PDF for now)
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `rapport_comparaison_${new Date().toISOString().split('T')[0]}.txt`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success("Rapport exporté !", { 
      description: `Comparaison de ${selectedResumes.length} candidats téléchargée` 
    })
  }

  // Analytics data preparation functions
  const prepareScoreDistributionData = () => {
    const ranges = [
      { range: "0-50%", min: 0, max: 50, count: 0 },
      { range: "50-60%", min: 50, max: 60, count: 0 },
      { range: "60-70%", min: 60, max: 70, count: 0 },
      { range: "70-80%", min: 70, max: 80, count: 0 },
      { range: "80-90%", min: 80, max: 90, count: 0 },
      { range: "90-100%", min: 90, max: 100, count: 0 },
    ]
    
    getFilteredAndSortedResumes().forEach(resume => {
      const score = resume.matchScore
      const range = ranges.find(r => score >= r.min && score < r.max)
      if (range) range.count++
    })
    
    return ranges.filter(r => r.count > 0)
  }

  const prepareExperienceVsScoreData = () => {
    return getFilteredAndSortedResumes().map(resume => {
      const expYears = parseInt(resume.experience.split(" ")[0]) || 0
      return {
        name: resume.name,
        experience: expYears,
        score: resume.matchScore,
        color: resume.matchScore >= 80 ? "#10b981" : resume.matchScore >= 70 ? "#f59e0b" : "#ef4444"
      }
    })
  }

  const prepareExperienceTimelineData = () => {
    return getFilteredAndSortedResumes().slice(0, 8).map(resume => {
      const expYears = parseInt(resume.experience.split(" ")[0]) || 0
      return {
        name: resume.name.split(" ")[0], // First name only
        years: expYears,
        score: resume.matchScore
      }
    }).sort((a, b) => b.years - a.years)
  }

  const [hiddenRadars, setHiddenRadars] = useState<Set<string>>(new Set())
  
  // Fonction pour calculer le TACE basé sur la disponibilité
  const calculateTACE = (availability: string): number => {
    const availabilityLower = availability.toLowerCase()
    const isOnMission = !availabilityLower.includes('immédiat') && !availabilityLower.includes('disponible')
    return isOnMission ? 100 : 0
  }
  
  // Filters and sorting state
  const [resultFilters, setResultFilters] = useState({
    minScore: 0,
    sector: "",
    searchSkill: "",
    minTace: 0
  })
  const [sortBy, setSortBy] = useState<"score" | "experience" | "name">("score")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Réinitialiser la page lors du changement de résultats ou de filtres
  useEffect(() => {
    setCurrentPage(1)
  }, [matchedResumes.length, resultFilters, sortBy, sortOrder, showFavoritesOnly])
  
  // Scroll vers le haut quand on change de page
  useEffect(() => {
    if (currentPage > 1) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [currentPage])
  
  // Réinitialiser la page lors du changement de profil actif
  useEffect(() => {
    setCurrentPage(1)
  }, [activeProfileTab])

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      (filters.location && filters.location !== "any") ||
      (filters.availability && filters.availability !== "any") ||
      (filters.minExperience && filters.minExperience !== "any") ||
      filters.sectors.length > 0 ||
      filters.skills.length > 0 ||
      filters.certifications.length > 0
    )
  }

  // Handle search mode change with confirmation if needed
  const handleSearchModeChange = (newMode: "simple" | "multi") => {
    // If there's already text entered and user is changing mode, show confirmation dialog
    if (tenderText.trim() && searchMode !== newMode) {
      setPendingMode(newMode)
      setShowModeChangeDialog(true)
    } else {
      // No text or same mode, just change directly
      setSearchMode(newMode)
    }
  }

  // Confirm mode change and optionally clear text
  const confirmModeChange = (clearText: boolean) => {
    if (pendingMode) {
      setSearchMode(pendingMode)
      if (clearText) {
        setTenderText("")
        setSelectedTemplate(null)
      }
      setPendingMode(null)
      setShowModeChangeDialog(false)
    }
  }

  // Cancel mode change
  const cancelModeChange = () => {
    setPendingMode(null)
    setShowModeChangeDialog(false)
  }

  // Reset all states to start fresh
  const handleReset = () => {
    // Reset tender and matching
    setTenderText("")
    setEnrichedText("")
    setUploadedFileName("")
    setHasResults(false)
    setSelectedResume(null)
    setMatchingProgress(0)
    setMatchingStep("")
    setSelectedTemplate(null)
    setSearchMode("simple")
    
    // Reset filters
    setFilters({
      location: "",
      availability: "",
      minExperience: "",
      sectors: [],
      skills: [],
      certifications: [],
    })
    
    // Reset result filters and sorting
    setResultFilters({
      minScore: 0,
      sector: "",
      searchSkill: "",
      minTace: 0
    })
    setSortBy("score")
    setSortOrder("desc")
    
    // Reset multi-profile states
    setDetectedProfiles([])
    setIsMultiProfile(false)
    setShowProfileValidation(false)
    setSelectedProfiles(new Set())
    setProfileResults({})
    setProfileSummaries({})
    setActiveProfileTab(null)
    
    // Reset compare and analytics
    setCompareMode(false)
    setSelectedForCompare(new Set())
    setShowCompareModal(false)
    setShowAnalytics(false)
    setShowFavoritesOnly(false)
    setHiddenRadars(new Set())
    
    // Reset expanded sections
    setExpandedSection(null)
    
    // Reset matching summary
    setMatchingSummary("")
    setMatchedResumes([])
    
    toast.success("Application réinitialisée", {
      description: "Vous pouvez commencer une nouvelle analyse"
    })
  }

  // Helper function to extract sectors from experiences
  const extractSectorsFromExperiences = (experiences: any[]): string[] => {
    const sectorKeywords: { [key: string]: string } = {
      'banque': 'Banque',
      'bancaire': 'Banque',
      'bank': 'Banque',
      'assurance': 'Assurance',
      'insurance': 'Assurance',
      'réassurance': 'Réassurance',
      'finance': 'Finance',
      'financial': 'Finance',
      'startup': 'Startup',
      'retail': 'Retail',
      'e-commerce': 'E-commerce',
      'santé': 'Santé',
      'health': 'Santé',
      'pharma': 'Pharmaceutique',
      'telecom': 'Télécommunications',
      'energie': 'Énergie',
      'transport': 'Transport',
      'logistique': 'Logistique',
      'industrie': 'Industrie',
      'consulting': 'Conseil',
      'conseil': 'Conseil',
      'public': 'Secteur Public',
      'gouvernement': 'Secteur Public',
    }
    
    const foundSectors = new Set<string>()
    
    experiences.forEach(exp => {
      const text = `${exp.title || ''} ${exp.description || ''}`.toLowerCase()
      Object.entries(sectorKeywords).forEach(([keyword, sector]) => {
        if (text.includes(keyword)) {
          foundSectors.add(sector)
        }
      })
    })
    
    return Array.from(foundSectors)
  }

  // Load real CVs on component mount
  useEffect(() => {
    const loadCVs = async () => {
      setIsLoadingCVs(true)
      try {
        const response = await fetch('/api/cvs')
        if (response.ok) {
          const cvs: LoadedCV[] = await response.json()
          setRealCVs(cvs)
          
          // Transform to Resume format
          const transformedResumes: Resume[] = cvs.map((cv, index) => {
            // Extract sectors from experiences
            const sectors = extractSectorsFromExperiences(cv.experiences || [])
            
            // Generate initial AI enriched data
            const yearsExp = cv.years_experience
            const culturalFitScore = 65 + Math.floor(Math.random() * 30) // 65-95%
            
            return {
              id: (index + 1).toString(),
              name: cv.name,
              title: cv.job_title,
              grade: cv.years_experience >= 8 ? "Senior Manager" : cv.years_experience >= 5 ? "Manager" : "Senior",
              location: "France",
              experience: `${cv.years_experience} ans`,
              skills: cv.skills,
              languages: [],
              certifications: [
                ...(cv.formations_certifications?.certifications || []),
                ...(cv.formations_certifications?.formations || []),
                ...(cv.formations_certifications?.formations_terminees || []),
                ...(cv.formations_certifications?.formations_en_cours || [])
              ],
              matchScore: 0,
              availability: "Disponible",
              summary: cv.description || "",
              email: cv.email || "",
              phone: cv.phone || "",
              education: cv.formation || "",
              previousRoles: cv.experiences?.map(exp => exp.title) || [],
              keyAchievements: [],
              sectors: sectors,
              tace: 0, // Sera calculé après avec calculateTACE
              // Analyse IA enrichie (sera mise à jour après le matching)
              culturalFitScore: culturalFitScore,
              trainingRecommendations: [],
              successPrediction: yearsExp >= 8 ? 
                "Profil senior avec expérience éprouvée. Forte probabilité de réussite dans des missions de management." :
                "Profil prometteur avec un bon potentiel d'évolution dans le domaine.",
              interviewTopics: []
            }
          })
          
          // Calculer le TACE pour chaque profil basé sur la disponibilité
          const resumesWithTACE = transformedResumes.map(resume => ({
            ...resume,
            tace: calculateTACE(resume.availability)
          }))
          
          setResumes(resumesWithTACE)
          setMatchedResumes(resumesWithTACE)
          console.log(`${transformedResumes.length} CVs chargés avec succès`)
        }
      } catch (error) {
        console.error('Error loading CVs:', error)
        // Fallback to empty array
        setResumes([])
        setMatchedResumes([])
      } finally {
        setIsLoadingCVs(false)
      }
    }
    
    loadCVs()
  }, [])

  // Handle file upload for job offer
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setTenderText(text)
        setUploadedFileName(file.name)
      }
      reader.readAsText(file)
    }
  }

  // Analyze tender to detect single or multiple profiles
  const handleAnalyzeTender = async () => {
    if (!tenderText || tenderText.trim() === "") {
      toast.warning("Description manquante", {
        description: "Veuillez d'abord entrer une description de poste"
      })
      return
    }

    setIsAnalyzingTender(true)
    toast.loading("Analyse de l'appel d'offres...", {
      id: "analyze-toast",
      description: "Détection automatique des profils recherchés"
    })

    try {
      const response = await fetch('/api/analyze-tender', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tender_text: tenderText })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de l\'analyse')
      }

      const data = await response.json()
      
      setIsMultiProfile(data.is_multiple)
      setDetectedProfiles(data.profiles)
      
      // Select all profiles by default
      const allProfileIds = new Set<string>(data.profiles.map((p: DetectedProfile) => p.id))
      setSelectedProfiles(allProfileIds)
      
      // Si un seul profil détecté, proposer le matching simple
      if (!data.is_multiple || data.profiles.length === 1) {
        toast.success("1 profil détecté !", {
          id: "analyze-toast",
          description: "💡 Conseil : Passez en 'Recrutement Individuel' pour un matching plus rapide",
          duration: 5000
        })
        
        // Afficher quand même la validation mais avec un message informatif
        setShowProfileValidation(true)
      } else {
        setShowProfileValidation(true)
        
        toast.success("Analyse terminée !", {
          id: "analyze-toast",
          description: `${data.profiles.length} profils détectés dans l'appel d'offres`
        })
      }
    } catch (error) {
      console.error('Error analyzing tender:', error)
      toast.error("Erreur d'analyse", {
        id: "analyze-toast",
        description: "Impossible d'analyser l'appel d'offres. Réessayez."
      })
    } finally {
      setIsAnalyzingTender(false)
    }
  }

  // Handle matching for selected profiles
  const handleStartMatchingAllProfiles = async () => {
    const selectedProfilesList = detectedProfiles.filter(p => selectedProfiles.has(p.id))
    
    if (selectedProfilesList.length === 0) {
      toast.error("Aucun profil sélectionné")
      return
    }

    setShowProfileValidation(false)
    setIsMatching(true)
    setHasResults(false)
    setMatchingProgress(0)
    
    const results: Record<string, Resume[]> = {}
    const summaries: Record<string, string> = {}
    let totalProgress = 0
    const progressPerProfile = 100 / selectedProfilesList.length

    try {
      for (let i = 0; i < selectedProfilesList.length; i++) {
        const profile = selectedProfilesList[i]
        
        setMatchingStep(`Matching profil ${i + 1}/${selectedProfilesList.length}: ${profile.title}`)
        
        // Prepare job offer for this specific profile
        const jobOffer = {
          title: profile.title,
          description: profile.description,
          required_skills: profile.required_skills,
          min_experience: profile.min_experience
        }

        // Call matching API (reusing existing /api/match)
        const response = await fetch('/api/match', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            job_offer: jobOffer,
            cv_list: realCVs.map(cv => ({
              name: cv.name,
              job_title: cv.job_title,
              skills: cv.skills,
              years_experience: cv.years_experience,
              sectors: cv.sectors || []
            })),
            weights: matchingWeights
          })
        })

        if (!response.ok) {
          throw new Error(`Erreur matching pour ${profile.title}`)
        }

        const data = await response.json()
        
        // Store summary for this profile
        summaries[profile.id] = data.summary || ""
        
        // Transform and store results for this profile
        const profileResumes = data.results.map((result: any) => {
          const cvData = realCVs.find(cv => cv.name === result.candidate_name)
          return {
            id: `${profile.id}-${result.candidate_name.replace(/\s+/g, '-')}`,
            name: result.candidate_name,
            title: cvData?.job_title || "Non spécifié",
            matchScore: result.relevance_score,
            experience: cvData ? `${cvData.years_experience} ans` : "Non spécifié",
            location: "Non spécifié",
            email: cvData?.email || "contact@example.com",
            phone: cvData?.phone || "+33 X XX XX XX XX",
            availability: "À discuter",
            matchingSkills: result.matching_skills || [],
            missingSkills: result.missing_skills || [],
            reasoning: result.reasoning,
            summary: cvData?.description || "",
            skills: cvData?.skills || [],
            education: cvData?.formation ? [cvData.formation] : [],
            languages: [],
            certifications: [],
            technicalSkills: cvData?.skills || [],
            sectors: result.sectors || cvData?.sectors || [],
            grade: "Non spécifié",
            culturalFitScore: Math.round(result.relevance_score * 0.9),
            successPrediction: `Probabilité de succès estimée à ${result.relevance_score}% pour le rôle de ${profile.title}`,
            trainingRecommendations: result.missing_skills?.slice(0, 3).map((s: string) => `Formation ${s}`) || [],
            interviewTopics: [`Expérience en ${profile.title}`, ...result.matching_skills?.slice(0, 2) || []]
          }
        })

        results[profile.id] = profileResumes.sort((a: Resume, b: Resume) => b.matchScore - a.matchScore)
        
        totalProgress += progressPerProfile
        setMatchingProgress(totalProgress)
      }

      // Store all results and summaries
      setProfileResults(results)
      setProfileSummaries(summaries)
      setHasResults(true)
      setIsMatching(false)
      
      // Save search to history after successful multi-profile matching
      saveSearchToHistory()
      
      // Set first profile as active tab
      if (selectedProfilesList.length > 0) {
        setActiveProfileTab(selectedProfilesList[0].id)
      }
      
      toast.success("Matching terminé !", {
        description: `${selectedProfilesList.length} profil(s) matché(s) avec succès`
      })
    } catch (error) {
      console.error('Error in multi-profile matching:', error)
      setIsMatching(false)
      toast.error("Erreur lors du matching", {
        description: "Une erreur est survenue. Réessayez."
      })
    }
  }

  // Handle enriching job offer with AI
  const handleImproveJobOffer = async () => {
    if (!tenderText || tenderText.trim() === "") {
      toast.warning("Description manquante", {
        description: "Veuillez d'abord entrer une description de poste"
      })
      return
    }

    setIsImproving(true)
    toast.loading("Enrichissement en cours...", {
      id: "improve-toast",
      description: "L'IA analyse et structure votre description"
    })
    
    try {
      const response = await fetch('/api/improve-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ job_description: tenderText })
      })

      if (!response.ok) {
        throw new Error('Failed to improve job description')
      }

      const data = await response.json()
      // Stocker la version enrichie séparément
      setEnrichedText(data.improved_description)
      toast.success("Description enrichie avec succès !", {
        id: "improve-toast",
        description: "La version enrichie est disponible ci-dessous"
      })
    } catch (error) {
      console.error('Error improving job offer:', error)
      toast.error("Erreur lors de l'enrichissement", {
        id: "improve-toast",
        description: "Impossible d'enrichir la description. Réessayez."
      })
    } finally {
      setIsImproving(false)
    }
  }

  const handleStartMatching = async () => {
    // Validate that we have job offer content
    if (!tenderText || tenderText.trim() === "") {
      toast.warning("Description manquante", {
        description: "Veuillez entrer une description de poste"
      })
      return
    }

    // Vérifier si un template multi-profils est sélectionné
    if (selectedTemplate && multiProfileTemplates.includes(selectedTemplate)) {
      setShowMultiProfileWarning(true)
      return
    }

    setIsMatching(true)
    setMatchingProgress(0)
    setHasResults(false)
    setSelectedTemplate(null) // Reset selected template when starting matching

    try {
      // Step 1: Initialization
      setMatchingStep("Initialisation du moteur de matching IA...")
      setMatchingProgress(10)
      await new Promise(resolve => setTimeout(resolve, 500))

      // Step 2: Parsing job offer
      setMatchingStep("Analyse de l'appel d'offres...")
      setMatchingProgress(25)
      await new Promise(resolve => setTimeout(resolve, 500))

      // Prepare job offer from tender text
      // L'IA analysera directement le texte brut pour extraire TOUTES les compétences et exigences
      const jobOffer: JobOffer = {
        title: extractJobTitle(tenderText),
        description: tenderText,
        required_skills: [], // L'IA extraira les compétences elle-même du texte
        min_experience: filters.minExperience ? parseInt(filters.minExperience) : 0
      }

      // Filter resumes based on selected criteria
      let filteredResumes = [...resumes]
      
      // Apply sector filter
      if (filters.sectors.length > 0) {
        filteredResumes = filteredResumes.filter(resume =>
          resume.sectors?.some(sector => filters.sectors.includes(sector))
        )
      }
      
      // Apply skills filter
      if (filters.skills.length > 0) {
        filteredResumes = filteredResumes.filter(resume =>
          filters.skills.some(skill => resume.skills?.includes(skill))
        )
      }
      
      // Apply certifications filter (ALL selected certifications must be present)
      if (filters.certifications.length > 0) {
        filteredResumes = filteredResumes.filter(resume => {
          if (!resume.certifications || resume.certifications.length === 0) {
            return false // No certifications at all
          }
          // Check if resume has ALL selected certifications
          return filters.certifications.every(selectedCert => 
            resume.certifications.some(resumeCert => {
              // Normalize both strings for comparison
              const normalizedResumeCert = resumeCert.toLowerCase().trim()
              const normalizedSelectedCert = selectedCert.toLowerCase().trim()
              // Exact match
              return normalizedResumeCert === normalizedSelectedCert
            })
          )
        })
      }
      
      // Apply location filter
      if (filters.location && filters.location !== "any") {
        filteredResumes = filteredResumes.filter(resume =>
          resume.location?.toLowerCase().includes(filters.location.toLowerCase())
        )
      }
      
      // Apply availability filter
      if (filters.availability && filters.availability !== "any") {
        filteredResumes = filteredResumes.filter(resume =>
          resume.availability?.toLowerCase().includes(filters.availability.toLowerCase().replace('-', ' '))
        )
      }
      
      // Apply experience filter
      if (filters.minExperience && filters.minExperience !== "any") {
        const minExp = parseInt(filters.minExperience)
        filteredResumes = filteredResumes.filter(resume => {
          const resumeExp = parseInt(resume.experience.split(" ")[0])
          return resumeExp >= minExp
        })
      }
      
      // Prepare CV list from filtered resumes
      const cvList: CandidateCV[] = filteredResumes.map(resume => ({
        name: resume.name,
        job_title: resume.title,
        skills: resume.skills,
        years_experience: parseInt(resume.experience.split(" ")[0]),
        sectors: resume.sectors
      }))

      // Step 3: Scanning database
      console.log(`📊 Filtrage: ${resumes.length} CVs total → ${cvList.length} CVs après filtres`)
      console.log(`📋 Filtres actifs:`, {
        sectors: filters.sectors,
        skills: filters.skills,
        certifications: filters.certifications,
        location: filters.location,
        availability: filters.availability,
        minExperience: filters.minExperience
      })
      
      // Vérifier qu'il reste des CVs à analyser
      if (cvList.length === 0) {
        setIsMatching(false)
        toast.error("Aucun candidat à analyser", {
          description: "Les filtres appliqués ont éliminé tous les candidats. Veuillez ajuster vos critères de filtrage."
        })
        return
      }
      
      setMatchingStep(`Scan de la base de données (${cvList.length} CVs)...`)
      setMatchingProgress(40)
      await new Promise(resolve => setTimeout(resolve, 500))

      const requestBody: MatchingRequest = {
        job_offer: jobOffer,
        cv_list: cvList,
        weights: matchingWeights
      }

      // Step 4: AI Matching
      setMatchingStep("Calcul des scores de compatibilité par IA...")
      setMatchingProgress(55)
      
      // Call the matching API
      const response = await fetch('/api/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error('Matching API failed')
      }

      setMatchingProgress(75)
      const matchingResult: MatchingResponse = await response.json()

      // Step 5: Processing results
      setMatchingStep("Classement des candidats...")
      setMatchingProgress(85)
      await new Promise(resolve => setTimeout(resolve, 300))

      // Update resumes with matching results (only filtered ones)
      const updatedResumes = filteredResumes.map(resume => {
        const match = matchingResult.results.find(r => r.candidate_name === resume.name)
        if (match) {
          // Generate enriched AI analysis based on matching results
          const score = match.relevance_score
          const missingCount = match.missing_skills?.length || 0
          
          // 1. Cultural fit score (corrélé au match score mais avec variation)
          const culturalFit = Math.min(95, Math.max(60, score + (Math.random() * 10 - 5)))
          
          // 2. Training recommendations based on missing skills
          const trainings: string[] = []
          if (missingCount > 0) {
            match.missing_skills?.slice(0, 3).forEach(skill => {
              if (skill.toLowerCase().includes('python') || skill.toLowerCase().includes('java')) {
                trainings.push(`Formation ${skill} : Certification professionnelle (3-6 mois)`)
              } else if (skill.toLowerCase().includes('cloud') || skill.toLowerCase().includes('aws') || skill.toLowerCase().includes('azure')) {
                trainings.push(`Certification Cloud ${skill} : Programme accéléré (2-3 mois)`)
              } else if (skill.toLowerCase().includes('agile') || skill.toLowerCase().includes('scrum')) {
                trainings.push(`Certification ${skill} Master : Formation intensive (1-2 mois)`)
              } else {
                trainings.push(`Formation ${skill} : Cours spécialisé recommandé`)
              }
            })
          }
          
          // 3. Success prediction based on score and experience
          let successPrediction = ""
          if (score >= 90) {
            successPrediction = "Très forte probabilité de réussite. Profil parfaitement aligné avec les exigences. Le candidat possède toutes les compétences clés et une expérience pertinente."
          } else if (score >= 80) {
            successPrediction = "Forte probabilité de réussite. Excellent profil avec quelques compétences mineures à développer. L'expérience du candidat compense les gaps identifiés."
          } else if (score >= 70) {
            successPrediction = "Bonne probabilité de réussite avec accompagnement. Le candidat possède les fondamentaux et pourra monter en compétence rapidement avec les formations appropriées."
          } else {
            successPrediction = "Probabilité modérée. Des formations significatives seront nécessaires pour combler les écarts de compétences. Évaluer la motivation et la capacité d'apprentissage."
          }
          
          // 4. Interview topics based on gaps and score
          const interviewTopics: string[] = []
          if (missingCount > 0) {
            interviewTopics.push(`Discuter de l'expérience avec les technologies manquantes : ${match.missing_skills?.slice(0, 2).join(', ')}`)
            interviewTopics.push(`Évaluer la capacité d'apprentissage et la motivation pour se former sur les gaps identifiés`)
          }
          if (score < 85) {
            interviewTopics.push(`Approfondir les projets passés pour valider l'alignement avec les responsabilités du poste`)
          }
          interviewTopics.push(`Vérifier l'adéquation culturelle et la capacité à s'intégrer dans l'équipe`)
          if (resume.experience.includes("ans") && parseInt(resume.experience) < 5) {
            interviewTopics.push(`Évaluer l'autonomie et la capacité à gérer des projets complexes`)
          }
          
          return {
            ...resume,
            matchScore: match.relevance_score,
            reasoning: match.reasoning,
            matchingSkills: match.matching_skills,
            missingSkills: match.missing_skills,
            sectors: match.sectors || resume.sectors,
            // Enriched AI analysis
            culturalFitScore: Math.round(culturalFit),
            trainingRecommendations: trainings,
            successPrediction: successPrediction,
            interviewTopics: interviewTopics
          }
        }
        return resume
      })

      // Sort by match score
      updatedResumes.sort((a, b) => b.matchScore - a.matchScore)

      setMatchedResumes(updatedResumes)
      setMatchingSummary(matchingResult.summary)
      
      // Step 6: Finalization
      setMatchingStep("Finalisation...")
      setMatchingProgress(100)
      await new Promise(resolve => setTimeout(resolve, 300))

      setIsMatching(false)
      setHasResults(true)
      
      // Save search to history after successful matching
      saveSearchToHistory()
      
      toast.success("Matching terminé !", {
        description: `${updatedResumes.length} candidats analysés et classés`
      })
    } catch (error) {
      console.error('Error during matching:', error)
      setIsMatching(false)
      toast.error("Erreur lors du matching", {
        description: "Impossible de terminer l'analyse. Réessayez."
      })
      // Fallback to original resumes
      setMatchedResumes(resumes)
      setHasResults(true)
    }
  }

  // Helper function to extract job title from tender text
  const extractJobTitle = (text: string): string => {
    // Simple extraction - look for common patterns
    const patterns = [
      /(?:poste|position|role)\s*:?\s*([^\n.]+)/i,
      /(?:recherche|looking for|hiring)\s+(?:un|une|a)?\s*([^\n.]+)/i
    ]
    
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) return match[1].trim()
    }
    
    return "Developer"
  }

  // Helper function to extract skills from tender text
  const extractSkills = (text: string): string[] => {
    // Liste étendue de compétences techniques (développement, data, cloud, DevOps)
    const commonSkills = [
      // Langages de programmation
      "JavaScript", "TypeScript", "Python", "Java", "Scala", "Go", "Rust", "C++", "C#", "R", "Julia",
      
      // Frontend
      "React", "Vue.js", "Angular", "Svelte", "Next.js", "Nuxt.js", "CSS", "HTML", "Tailwind",
      
      // Backend
      "Node.js", "Express", "Django", "Flask", "FastAPI", "Spring Boot", "ASP.NET",
      
      // Data Engineering & Analytics
      "Spark", "Kafka", "Airflow", "dbt", "Databricks", "Snowflake", "BigQuery", "Redshift",
      "Pandas", "NumPy", "PySpark", "Hadoop", "Hive", "Presto", "Flink",
      
      // Machine Learning & AI
      "TensorFlow", "PyTorch", "Scikit-learn", "Keras", "MLflow", "Kubeflow",
      
      // Bases de données
      "SQL", "PostgreSQL", "MySQL", "Oracle", "MongoDB", "Cassandra", "Redis", "Elasticsearch",
      "DynamoDB", "CosmosDB", "Neo4j",
      
      // Cloud & Infrastructure
      "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "CloudFormation", "Helm",
      "Lambda", "EC2", "S3", "RDS", "EKS", "ECS", "Azure Functions", "Cloud Functions",
      
      // DevOps & CI/CD
      "Git", "GitHub", "GitLab", "Jenkins", "CircleCI", "GitHub Actions", "ArgoCD", "Ansible",
      "CI/CD", "Prometheus", "Grafana", "DataDog",
      
      // API & Messaging
      "REST", "GraphQL", "gRPC", "RabbitMQ", "SQS", "Pub/Sub", "Event Hubs",
      
      // Concepts & Patterns
      "Microservices", "Serverless", "Data Mesh", "Domain-Driven Design", "ETL", "ELT",
      "Data Pipeline", "Stream Processing", "Batch Processing"
    ]
    
    // Extraire les compétences mentionnées dans le texte
    const foundSkills = commonSkills.filter(skill => 
      text.toLowerCase().includes(skill.toLowerCase())
    )
    
    // Si aucune compétence n'est trouvée explicitement, inférer selon le titre
    if (foundSkills.length === 0) {
      const lowerText = text.toLowerCase()
      
      // Data Engineer - compétences par défaut
      if (lowerText.includes("data engineer") || lowerText.includes("ingénieur data")) {
        return ["Python", "SQL", "Spark", "Kafka", "Airflow", "AWS", "Docker", "dbt"]
      }
      
      // Data Scientist - compétences par défaut
      if (lowerText.includes("data scientist") || lowerText.includes("scientist")) {
        return ["Python", "R", "SQL", "TensorFlow", "PyTorch", "Pandas", "Scikit-learn"]
      }
      
      // DevOps - compétences par défaut
      if (lowerText.includes("devops") || lowerText.includes("sre")) {
        return ["Docker", "Kubernetes", "Terraform", "AWS", "CI/CD", "Git", "Ansible"]
      }
      
      // Full Stack - compétences par défaut
      if (lowerText.includes("full stack") || lowerText.includes("fullstack")) {
        return ["JavaScript", "TypeScript", "React", "Node.js", "SQL", "Docker", "Git"]
      }
      
      // Cloud Engineer - compétences par défaut
      if (lowerText.includes("cloud engineer") || lowerText.includes("cloud architect")) {
        return ["AWS", "Azure", "GCP", "Kubernetes", "Terraform", "Docker", "Python"]
      }
      
      // Par défaut, retourner une liste générique
      return ["Python", "SQL", "JavaScript", "Git", "Docker"]
    }
    
    return foundSkills
  }

  // Compare mode functions
  const toggleCompareMode = () => {
    setCompareMode(!compareMode)
    if (compareMode) {
      setSelectedForCompare(new Set())
    }
  }

  const toggleSelectForCompare = (resumeId: string) => {
    const newSet = new Set(selectedForCompare)
    if (newSet.has(resumeId)) {
      newSet.delete(resumeId)
    } else {
      if (newSet.size < 4) { // Maximum 4 profiles
        newSet.add(resumeId)
      }
    }
    setSelectedForCompare(newSet)
  }

  const openCompareModal = () => {
    if (selectedForCompare.size >= 2) {
      setShowCompareModal(true)
      setHiddenRadars(new Set()) // Reset hidden radars when opening modal
    }
  }

  const getSelectedResumes = () => {
    // Support both standard and multi-profile modes
    if (activeProfileTab && profileResults[activeProfileTab]) {
      // Multi-profile mode: filter from active profile's resumes
      return profileResults[activeProfileTab].filter(r => selectedForCompare.has(r.id))
    }
    // Standard mode: filter from matchedResumes
    return matchedResumes.filter(r => selectedForCompare.has(r.id))
  }

  // Handle radar chart legend click
  const handleLegendClick = (data: any) => {
    const name = data.value
    setHiddenRadars(prev => {
      const newSet = new Set(prev)
      if (newSet.has(name)) {
        newSet.delete(name)
      } else {
        newSet.add(name)
      }
      return newSet
    })
  }

  // Filter and sort resumes (supports both single and multi-profile)
  const getFilteredAndSortedResumes = () => {
    // Determine source: multi-profile active tab or standard matching
    let sourceResumes: Resume[] = []
    
    if (activeProfileTab && profileResults[activeProfileTab]) {
      // Multi-profile mode: get resumes for active profile tab
      sourceResumes = [...profileResults[activeProfileTab]]
    } else {
      // Standard single-profile mode
      sourceResumes = [...matchedResumes]
    }

    let filtered = sourceResumes

    // Filter by favorites
    if (showFavoritesOnly) {
      filtered = filtered.filter(r => favorites.includes(r.id))
    }

    // Apply filters
    if (resultFilters.minScore > 0) {
      filtered = filtered.filter(r => r.matchScore >= resultFilters.minScore)
    }

    if (resultFilters.sector) {
      filtered = filtered.filter(r => 
        r.sectors?.some(s => s.toLowerCase().includes(resultFilters.sector.toLowerCase()))
      )
    }

    if (resultFilters.searchSkill) {
      filtered = filtered.filter(r =>
        r.matchingSkills?.some(s => s.toLowerCase().includes(resultFilters.searchSkill.toLowerCase())) ||
        r.skills?.some(s => s.toLowerCase().includes(resultFilters.searchSkill.toLowerCase()))
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "score":
          comparison = a.matchScore - b.matchScore
          break
        case "experience":
          const expA = parseInt(a.experience.split(" ")[0]) || 0
          const expB = parseInt(b.experience.split(" ")[0]) || 0
          comparison = expA - expB
          break
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }

  // Get all unique sectors from results
  const getAvailableSectors = () => {
    const sectors = new Set<string>()
    matchedResumes.forEach(resume => {
      resume.sectors?.forEach(s => sectors.add(s))
    })
    return Array.from(sectors).sort()
  }

  // Prepare radar chart data for skills comparison
  const prepareRadarData = () => {
    const selectedResumes = getSelectedResumes()
    if (selectedResumes.length === 0) return []

    // Collect all unique skills from all selected resumes
    const allSkills = new Set<string>()
    selectedResumes.forEach(resume => {
      resume.matchingSkills?.forEach(skill => allSkills.add(skill))
      resume.missingSkills?.forEach(skill => allSkills.add(skill))
    })

    // Limit to top 8 skills for readability
    const skillsArray = Array.from(allSkills).slice(0, 8)

    // Create data points for each skill
    return skillsArray.map(skill => {
      const dataPoint: any = { skill }
      
      selectedResumes.forEach(resume => {
        // Value is 100 if skill is matching, 0 if missing or not mentioned
        const hasSkill = resume.matchingSkills?.includes(skill)
        dataPoint[resume.name] = hasSkill ? 100 : 0
      })
      
      return dataPoint
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getMatchBadgeStyle = (score: number) => {
    if (score >= 90) {
      // Excellent match: Green with glow effect
      return "bg-gradient-to-r from-emerald-500 to-green-500 text-white font-semibold shadow-lg shadow-green-500/50 border-2 border-green-400"
    } else if (score >= 80) {
      // Good match: Blue modern
      return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/50 border-2 border-blue-400"
    } else if (score >= 70) {
      // Fair match: Yellow/Orange
      return "bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold shadow-lg shadow-yellow-500/50 border-2 border-yellow-400"
    } else if (score >= 60) {
      // Low match: Orange/Red
      return "bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold shadow-lg shadow-orange-500/50 border-2 border-orange-400"
    } else {
      // Very low match: Dark gray
      return "bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold shadow-lg shadow-gray-600/50 border-2 border-gray-500"
    }
  }

  const getMatchingStatusText = () => {
    return matchingStep || "Préparation..."
  }

  const getMatchCategory = (score: number) => {
    if (score >= 90) return "🎯 Excellent Match"
    if (score >= 80) return "✨ Très Bon Match"
    if (score >= 70) return "👍 Bon Match"
    if (score >= 60) return "⚠️ Match Partiel"
    return "❌ Faible Match"
  }

  const getMatchCategoryStyle = (score: number) => {
    if (score >= 90)
      return "bg-green-900/50 text-green-300 border-green-500 hover:bg-green-900 transition-colors backdrop-blur-sm"
    if (score >= 80) 
      return "bg-blue-900/50 text-blue-300 border-blue-500 hover:bg-blue-900 transition-colors backdrop-blur-sm"
    if (score >= 70)
      return "bg-yellow-900/50 text-yellow-300 border-yellow-500 hover:bg-yellow-900 transition-colors backdrop-blur-sm"
    if (score >= 60)
      return "bg-orange-900/50 text-orange-300 border-orange-500 hover:bg-orange-900 transition-colors backdrop-blur-sm"
    return "bg-gray-800/50 text-gray-300 border-gray-600 hover:bg-gray-800 transition-colors backdrop-blur-sm"
  }

  const getGradeBadgeStyle = (grade: string) => {
    switch (grade) {
      case "Director":
        return "bg-red-100 text-red-800 border-red-200 rounded-sm hover:bg-red-200 transition-colors"
      case "Partner":
        return "bg-purple-100 text-purple-800 border-purple-200 rounded-sm hover:bg-purple-200 transition-colors"
      case "Senior Manager":
        return "bg-indigo-100 text-indigo-800 border-indigo-200 rounded-sm hover:bg-indigo-200 transition-colors"
      case "Manager":
        return "bg-blue-100 text-blue-800 border-blue-200 rounded-sm hover:bg-blue-200 transition-colors"
      case "Senior consultant":
        return "bg-green-100 text-green-800 border-green-200 rounded-sm hover:bg-green-200 transition-colors"
      case "Staff/Assistant":
        return "bg-gray-100 text-gray-800 border-gray-200 rounded-sm hover:bg-gray-200 transition-colors"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 rounded-sm hover:bg-gray-200 transition-colors"
    }
  }

  return (
    <div className="min-h-screen bg-gray-800 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b-2 border-yellow-400/30 shadow-2xl sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top bar */}
          <div className="flex justify-between items-center py-5">
            {/* Logo et branding */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 flex items-center justify-center">
                <img src="/logo.png" alt="EY Logo" className="w-12 h-12 object-contain" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-clip-text text-transparent">
                  Resume Matchmaker
                </h1>
                <p className="text-xs text-gray-400 font-medium tracking-wide">
                  Powered by EY • Llama 3.3
                </p>
              </div>
            </div>

            {/* Actions et statut */}
            <div className="flex items-center gap-2">
              {/* Statut de la base de données - Version compacte */}
              {isLoadingCVs ? (
                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span className="text-xs text-gray-300">Chargement...</span>
                </div>
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center space-x-2 px-3 py-2 bg-gray-800/50 rounded-lg border border-green-500/30 cursor-pointer">
                        <div className="relative">
                          <Database className="w-4 h-4 text-green-400" />
                          <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        </div>
                        <span className="text-xs font-semibold text-green-400">{resumes.length} profils</span>
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Base de données active - {resumes.length} profils disponibles</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}

              {/* Toggle Dashboard/Overview/Matching */}
              <div className="flex items-center gap-1 px-1 py-1 bg-gray-800/50 rounded-lg border border-gray-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("dashboard")}
                  className={`${
                    viewMode === "dashboard"
                      ? "bg-yellow-400 text-black hover:bg-yellow-500 hover:text-black"
                      : "text-gray-400 hover:text-white hover:bg-gray-700"
                  } transition-all`}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("overview")}
                  className={`${
                    viewMode === "overview"
                      ? "bg-yellow-400 text-black hover:bg-yellow-500 hover:text-black"
                      : "text-gray-400 hover:text-white hover:bg-gray-700"
                  } transition-all`}
                >
                  <Database className="w-4 h-4 mr-2" />
                  Talent Pool
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("matching")}
                  className={`${
                    viewMode === "matching"
                      ? "bg-yellow-400 text-black hover:bg-yellow-500 hover:text-black"
                      : "text-gray-400 hover:text-white hover:bg-gray-700"
                  } transition-all`}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Matching
                </Button>
              </div>

              {/* Bouton Information */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowInformation(!showInformation)}
                      className="bg-blue-600/20 text-blue-300 border-blue-500/50 hover:bg-blue-600/30 hover:text-blue-200 hover:border-blue-400 px-3"
                    >
                      <Info className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Afficher le guide d'utilisation</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Bouton Historique */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowHistoryPanel(!showHistoryPanel)}
                      className="bg-purple-600/20 text-purple-300 border-purple-500/50 hover:bg-purple-600/30 hover:text-purple-200 hover:border-purple-400 relative px-3"
                    >
                      <Clock className="w-4 h-4" />
                      {searchHistory.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-purple-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                          {searchHistory.length}
                        </span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Historique des recherches ({searchHistory.length})</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          {/* Stats bar (optionnel - visible si résultats) */}
          {hasResults && (
            <div className="border-t border-gray-700/50 py-3">
              <div className="flex items-center justify-center gap-8">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-gray-300">
                    <span className="font-semibold text-white">{matchedResumes.filter(r => r.matchScore >= 80).length}</span> candidats excellents
                  </span>
                </div>
                <div className="w-px h-4 bg-gray-700"></div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">
                    <span className="font-semibold text-white">{matchedResumes.length}</span> profils analysés
                  </span>
                </div>
                <div className="w-px h-4 bg-gray-700"></div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-gray-300">
                    <span className="font-semibold text-white">{favorites.length}</span> favoris
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* How to Use Section */}
      {showInformation && (
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-yellow-400/10 border border-yellow-400/30 rounded-full">
                <Info className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-300 text-sm font-semibold">Guide d'utilisation</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-clip-text text-transparent mb-3">
                Comment utiliser Resume Matchmaker
              </h2>
              <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                Suivez ces <span className="text-yellow-400 font-semibold">4 étapes simples</span> pour trouver les candidats parfaits grâce à l'IA
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden lg:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400/20 via-yellow-400/50 to-yellow-400/20" style={{ width: 'calc(100% - 6rem)', left: '3rem' }}></div>

              {/* Step 1 */}
              <div className="relative group">
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-400/10 h-full">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-400/30 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-gray-900 font-bold text-xl">1</span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="text-white font-semibold text-base mb-2">📝 Dashboard ou Matching</h3>
                    <p className="text-gray-400 text-xs leading-relaxed mb-2">
                      Consultez vos <span className="text-yellow-400 font-semibold">KPIs</span> et statistiques ou passez en mode <span className="text-yellow-400 font-semibold">Matching</span> pour lancer une recherche
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      <BarChart3 className="w-2.5 h-2.5" />
                      <span>Dashboard • Talent Pool • Matching</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative group">
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-400/10 h-full">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-400/30 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-gray-900 font-bold text-xl">2</span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="text-white font-semibold text-base mb-2">✍️ Saisir l'Appel d'Offres</h3>
                    <p className="text-gray-400 text-xs leading-relaxed mb-2">
                      Décrivez le poste ou <span className="text-yellow-400 font-semibold">téléchargez un document</span>. L'IA détecte automatiquement les profils simples ou multi-profils
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      <FileText className="w-2.5 h-2.5" />
                      <span>Texte • Upload • Suggestions</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative group">
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-400/10 h-full">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-400/30 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-gray-900 font-bold text-xl">3</span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="text-white font-semibold text-base mb-2">🎯 Appliquer les Filtres</h3>
                    <p className="text-gray-400 text-xs leading-relaxed mb-2">
                      Affinez avec <span className="text-yellow-400 font-semibold">localisation, disponibilité, expérience</span> et secteurs pour des résultats précis
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      <Filter className="w-2.5 h-2.5" />
                      <span>Filtres optionnels avancés</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="relative group">
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-yellow-400/50 transition-all duration-300 hover:shadow-xl hover:shadow-yellow-400/10 h-full">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-400/30 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-gray-900 font-bold text-xl">4</span>
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                    <h3 className="text-white font-semibold text-base mb-2">🚀 Analyser & Contacter</h3>
                    <p className="text-gray-400 text-xs leading-relaxed mb-2">
                      Explorez les résultats classés par <span className="text-yellow-400 font-semibold">score IA</span>, comparez les profils et contactez les meilleurs candidats
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                      <Award className="w-2.5 h-2.5" />
                      <span>Analytics • Comparaison • Export</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA Bottom */}
            <div className="mt-10 text-center">
              <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-4 bg-yellow-400/5 border border-yellow-400/20 rounded-xl">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-semibold">Prêt à commencer ?</span>
                </div>
                <Button 
                  onClick={() => {
                    setShowInformation(false)
                    setViewMode("matching")
                  }}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold shadow-lg shadow-yellow-400/30"
                >
                  Accéder au Matching
                  <Search className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD VIEW */}
      {viewMode === "dashboard" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* KPI Cards Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* KPI 1: Total CVs */}
            <Card className="bg-gray-900 border-gray-700 hover:border-blue-500/50 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Database className="w-5 h-5 text-blue-400" />
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                    Actif
                  </Badge>
                </div>
                <h3 className="text-gray-400 text-xs font-semibold mb-1 uppercase tracking-wide">Total CVs</h3>
                <p className="text-3xl font-bold text-white mb-2">{resumes.length}</p>
                <div className="flex items-center gap-1.5 text-xs">
                  <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-gray-400">Base complète</span>
                </div>
              </CardContent>
            </Card>

            {/* KPI 2: Favoris */}
            <Card className="bg-gray-900 border-gray-700 hover:border-yellow-500/50 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Star className="w-5 h-5 text-yellow-400" />
                  </div>
                  <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                    {((favorites.length / resumes.length) * 100).toFixed(1)}%
                  </Badge>
                </div>
                <h3 className="text-gray-400 text-xs font-semibold mb-1 uppercase tracking-wide">Profils Favoris</h3>
                <p className="text-3xl font-bold text-white mb-2">{favorites.length}</p>
                <div className="flex items-center gap-1.5 text-xs">
                  <Award className="w-3.5 h-3.5 text-yellow-400" />
                  <span className="text-gray-400">Sélectionnés</span>
                </div>
              </CardContent>
            </Card>

            {/* KPI 3: Matchings Réalisés */}
            <Card className="bg-gray-900 border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Activity className="w-5 h-5 text-purple-400" />
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                    Récent
                  </Badge>
                </div>
                <h3 className="text-gray-400 text-xs font-semibold mb-1 uppercase tracking-wide">Derniers Matchings</h3>
                <p className="text-3xl font-bold text-white mb-2">
                  {hasResults || Object.keys(profileResults).length > 0 ? '1' : '0'}
                </p>
                <div className="flex items-center gap-1.5 text-xs">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-gray-400">Cette session</span>
                </div>
              </CardContent>
            </Card>

            {/* KPI 4: Taux Match Moyen */}
            <Card className="bg-gray-900 border-gray-700 hover:border-green-500/50 transition-all duration-300">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                    {matchedResumes.length > 0 && matchedResumes.filter(r => r.matchScore >= 80).length > 0 ? 'Excellent' : 'En attente'}
                  </Badge>
                </div>
                <h3 className="text-gray-400 text-xs font-semibold mb-1 uppercase tracking-wide">Taux Match Moyen</h3>
                <p className="text-3xl font-bold text-white mb-2">
                  {matchedResumes.length > 0 
                    ? `${Math.round(matchedResumes.reduce((acc, r) => acc + r.matchScore, 0) / matchedResumes.length)}%`
                    : '—'
                  }
                </p>
                <div className="flex items-center gap-1.5 text-xs">
                  <Users className="w-3.5 h-3.5 text-green-400" />
                  <span className="text-gray-400">
                    {matchedResumes.length > 0 ? `${matchedResumes.length} candidats` : 'Aucun matching'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Disponibilité Timeline */}
          <Card className="bg-gray-900 border-gray-700 mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-pink-400" />
                  Disponibilité par Période
                </h3>
                <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">
                  {resumes.filter(r => r.availability.toLowerCase().includes('immédiat')).length} immédiatement
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Mois actuel */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-pink-500/50 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-pink-400" />
                      <h4 className="text-sm font-semibold text-white">Mois actuel</h4>
                    </div>
                    <span className="text-xs text-gray-500">Immédiat</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-2">
                    {resumes.filter(r => r.availability.toLowerCase().includes('immédiat')).length}
                  </p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-pink-500 to-pink-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(resumes.filter(r => r.availability.toLowerCase().includes('immédiat')).length / resumes.length) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    {((resumes.filter(r => r.availability.toLowerCase().includes('immédiat')).length / resumes.length) * 100).toFixed(0)}% de la base
                  </p>
                </div>

                {/* Mois prochain */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-purple-500/50 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <h4 className="text-sm font-semibold text-white">Mois prochain</h4>
                    </div>
                    <span className="text-xs text-gray-500">+1 mois</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-2">
                    {resumes.filter(r => r.availability.toLowerCase().includes('1 mois') || r.availability.toLowerCase().includes('30 jours')).length}
                  </p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(resumes.filter(r => r.availability.toLowerCase().includes('1 mois') || r.availability.toLowerCase().includes('30 jours')).length / resumes.length) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    {((resumes.filter(r => r.availability.toLowerCase().includes('1 mois') || r.availability.toLowerCase().includes('30 jours')).length / resumes.length) * 100).toFixed(0)}% de la base
                  </p>
                </div>

                {/* +2 mois */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-blue-500/50 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <h4 className="text-sm font-semibold text-white">+2 mois</h4>
                    </div>
                    <span className="text-xs text-gray-500">Court terme</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-2">
                    {resumes.filter(r => r.availability.toLowerCase().includes('2 mois') || r.availability.toLowerCase().includes('60 jours')).length}
                  </p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(resumes.filter(r => r.availability.toLowerCase().includes('2 mois') || r.availability.toLowerCase().includes('60 jours')).length / resumes.length) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    {((resumes.filter(r => r.availability.toLowerCase().includes('2 mois') || r.availability.toLowerCase().includes('60 jours')).length / resumes.length) * 100).toFixed(0)}% de la base
                  </p>
                </div>

                {/* +6 mois */}
                <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 hover:border-green-500/50 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <h4 className="text-sm font-semibold text-white">+6 mois</h4>
                    </div>
                    <span className="text-xs text-gray-500">Long terme</span>
                  </div>
                  <p className="text-3xl font-bold text-white mb-2">
                    {resumes.filter(r => r.availability.toLowerCase().includes('6 mois') || r.availability.toLowerCase().includes('fin contrat') || r.availability.toLowerCase().includes('négocier')).length}
                  </p>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(resumes.filter(r => r.availability.toLowerCase().includes('6 mois') || r.availability.toLowerCase().includes('fin contrat') || r.availability.toLowerCase().includes('négocier')).length / resumes.length) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    {((resumes.filter(r => r.availability.toLowerCase().includes('6 mois') || r.availability.toLowerCase().includes('fin contrat') || r.availability.toLowerCase().includes('négocier')).length / resumes.length) * 100).toFixed(0)}% de la base
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left Column - 2 Charts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Top Compétences */}
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-400" />
                    Top 15 des Compétences dans la Base
                  </h3>
                  <ResponsiveContainer width="100%" height={500}>
                    <BarChart 
                      data={Object.entries(
                        resumes.reduce((acc, resume) => {
                          resume.skills.forEach(skill => {
                            acc[skill] = (acc[skill] || 0) + 1
                          })
                          return acc
                        }, {} as Record<string, number>)
                      ).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([skill, count]) => ({ skill, count }))}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 5, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        type="number" 
                        tick={{ fill: '#e5e7eb' }} 
                        allowDecimals={false}
                        domain={[0, 'dataMax']}
                      />
                      <YAxis type="category" dataKey="skill" tick={{ fill: '#e5e7eb', fontSize: 11 }} width={120} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#000' }} labelStyle={{ color: '#000' }} />
                      <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                        {Object.entries(
                          resumes.reduce((acc, resume) => {
                            resume.skills.forEach(skill => {
                              acc[skill] = (acc[skill] || 0) + 1
                            })
                            return acc
                          }, {} as Record<string, number>)
                        ).sort((a, b) => b[1] - a[1]).slice(0, 15).map(([skill, count], index) => (
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16', '#a855f7', '#f43f5e', '#eab308', '#22d3ee', '#fb923c'][index % 15]} />
                        ))}
                        <LabelList dataKey="count" position="right" fill="#fff" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Distribution par expérience */}
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-400" />
                    Distribution par Niveau d'Expérience
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart 
                      data={[
                        { level: 'Junior (0-3 ans)', count: resumes.filter(r => parseInt(r.experience) <= 3).length, fill: '#10b981' },
                        { level: 'Mid (3-6 ans)', count: resumes.filter(r => parseInt(r.experience) > 3 && parseInt(r.experience) <= 6).length, fill: '#3b82f6' },
                        { level: 'Senior (6-10 ans)', count: resumes.filter(r => parseInt(r.experience) > 6 && parseInt(r.experience) <= 10).length, fill: '#8b5cf6' },
                        { level: 'Expert (10+ ans)', count: resumes.filter(r => parseInt(r.experience) > 10).length, fill: '#f59e0b' },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="level" tick={{ fill: '#e5e7eb', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#e5e7eb' }} />
                      <RechartsTooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#000' }} labelStyle={{ color: '#000' }} />
                      <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                        {[
                          { level: 'Junior (0-3 ans)', count: resumes.filter(r => parseInt(r.experience) <= 3).length, fill: '#10b981' },
                          { level: 'Mid (3-6 ans)', count: resumes.filter(r => parseInt(r.experience) > 3 && parseInt(r.experience) <= 6).length, fill: '#3b82f6' },
                          { level: 'Senior (6-10 ans)', count: resumes.filter(r => parseInt(r.experience) > 6 && parseInt(r.experience) <= 10).length, fill: '#8b5cf6' },
                          { level: 'Expert (10+ ans)', count: resumes.filter(r => parseInt(r.experience) > 10).length, fill: '#f59e0b' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                        <LabelList dataKey="count" position="top" fill="#fff" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Activity Feed & Quick Actions */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    ⚡ Actions Rapides
                  </h3>
                  <div className="space-y-3">
                    <Button 
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-600 hover:to-yellow-700 font-semibold"
                      onClick={() => setViewMode("matching")}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Nouveau Matching
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                      onClick={() => {
                        setShowFavoritesOnly(true)
                        setViewMode("matching")
                      }}
                    >
                      <Star className="w-4 h-4 mr-2" />
                      Voir Favoris ({favorites.length})
                    </Button>
                    {hasResults && (
                      <Button 
                        variant="outline" 
                        className="w-full bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                        onClick={() => setViewMode("matching")}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Derniers Résultats
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Top Certifications */}
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    🏆 Top 12 Certifications
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(
                      resumes.reduce((acc, resume) => {
                        // Extract certifications from skills (common certification keywords)
                        const certKeywords = ['AWS', 'Azure', 'GCP', 'Google Cloud', 'Kubernetes', 'Docker', 'Terraform', 'PMP', 'ITIL', 'Scrum', 'SAP', 'Salesforce', 'Oracle', 'Microsoft', 'Cisco', 'CompTIA', 'PRINCE2', 'Six Sigma', 'Agile', 'DevOps', 'TOGAF', 'CISM', 'CISSP']
                        resume.skills.forEach(skill => {
                          certKeywords.forEach(keyword => {
                            if (skill.toLowerCase().includes(keyword.toLowerCase())) {
                              acc[keyword] = (acc[keyword] || 0) + 1
                            }
                          })
                        })
                        return acc
                      }, {} as Record<string, number>)
                    )
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 12)
                    .map(([cert, count], index) => (
                      <div key={cert} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-xs font-bold text-gray-500 w-5">#{index + 1}</span>
                          <span className="text-sm text-white font-medium truncate">{cert}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                              style={{ width: `${(count / resumes.length) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* TACE (Taux d'Activité) */}
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-400" />
                      TACE Global
                    </h3>
                    <Badge className={`${
                      ((resumes.filter(r => !r.availability.toLowerCase().includes('immédiat') && !r.availability.toLowerCase().includes('disponible')).length / resumes.length) * 100) >= 80
                        ? 'bg-green-500/20 text-green-300 border-green-500/30'
                        : ((resumes.filter(r => !r.availability.toLowerCase().includes('immédiat') && !r.availability.toLowerCase().includes('disponible')).length / resumes.length) * 100) >= 60
                        ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                        : 'bg-red-500/20 text-red-300 border-red-500/30'
                    } text-xs font-semibold`}>
                      {((resumes.filter(r => !r.availability.toLowerCase().includes('immédiat') && !r.availability.toLowerCase().includes('disponible')).length / resumes.length) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  
                  {/* Barre de progression globale */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          ((resumes.filter(r => !r.availability.toLowerCase().includes('immédiat') && !r.availability.toLowerCase().includes('disponible')).length / resumes.length) * 100) >= 80
                            ? 'bg-gradient-to-r from-green-500 to-green-400'
                            : ((resumes.filter(r => !r.availability.toLowerCase().includes('immédiat') && !r.availability.toLowerCase().includes('disponible')).length / resumes.length) * 100) >= 60
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                            : 'bg-gradient-to-r from-red-500 to-red-400'
                        }`}
                        style={{ width: `${(resumes.filter(r => !r.availability.toLowerCase().includes('immédiat') && !r.availability.toLowerCase().includes('disponible')).length / resumes.length) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>En mission: {resumes.filter(r => !r.availability.toLowerCase().includes('immédiat') && !r.availability.toLowerCase().includes('disponible')).length}</span>
                      <span>Intercontrat: {resumes.filter(r => r.availability.toLowerCase().includes('immédiat') || r.availability.toLowerCase().includes('disponible')).length}</span>
                    </div>
                  </div>

                  {/* Détail par personne */}
                  <div className="border-t border-gray-700 pt-3">
                    <h4 className="text-xs font-semibold text-gray-400 mb-2">Détail par consultant :</h4>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                      {resumes.slice(0, 20).map((resume, index) => {
                        const isOnMission = !resume.availability.toLowerCase().includes('immédiat') && !resume.availability.toLowerCase().includes('disponible')
                        const tace = isOnMission ? 100 : 0
                        return (
                          <div key={resume.id} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-gray-500 font-mono">#{index + 1}</span>
                              <span className="text-white truncate font-medium">{resume.name}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="w-16 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${
                                    tace === 100 ? 'bg-green-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${tace}%` }}
                                />
                              </div>
                              <Badge className={`${
                                tace === 100 
                                  ? 'bg-green-500/20 text-green-300 border-green-500/30' 
                                  : 'bg-red-500/20 text-red-300 border-red-500/30'
                              } text-xs px-1.5 py-0`}>
                                {tace}%
                              </Badge>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    {resumes.length > 20 && (
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        +{resumes.length - 20} autres consultants...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Stats Info */}
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-4">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    💡 Le saviez-vous ?
                  </h3>
                  <div className="space-y-2 text-xs text-gray-400">
                    <p>• Compétence la plus demandée: <span className="font-semibold text-white">
                      {Object.entries(
                        resumes.reduce((acc, resume) => {
                          resume.skills.forEach(skill => {
                            acc[skill] = (acc[skill] || 0) + 1
                          })
                          return acc
                        }, {} as Record<string, number>)
                      ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                    </span></p>
                    <p>• Expérience moyenne: <span className="font-semibold text-white">
                      {(resumes.reduce((acc, r) => acc + parseInt(r.experience), 0) / resumes.length).toFixed(1)} ans
                    </span></p>
                    <p>• Grade le plus fréquent: <span className="font-semibold text-white">
                      {Object.entries(
                        resumes.reduce((acc, resume) => {
                          acc[resume.grade] = (acc[resume.grade] || 0) + 1
                          return acc
                        }, {} as Record<string, number>)
                      ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'}
                    </span></p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* OVERVIEW VIEW - Banque de CVs */}
      {viewMode === "overview" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
              <Database className="w-8 h-8 text-yellow-400" />
              Talent Pool - Vue d'Ensemble
            </h2>
            <p className="text-gray-400">Exploration détaillée de votre base de talents ({resumes.length} profils)</p>
          </div>

          {/* Filtres */}
          <Card className="bg-gray-900 border-gray-700 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-semibold text-white">Filtrer les profils</h3>
                </div>
                {(resultFilters.minScore > 0 || resultFilters.sector || resultFilters.searchSkill || resultFilters.minTace > 0) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setResultFilters({ minScore: 0, sector: '', searchSkill: '', minTace: 0 })}
                    className="bg-red-600/20 text-red-300 border-red-500/50 hover:bg-red-600/30 text-xs"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Réinitialiser les filtres
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {/* Filtre Grade */}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Grade</label>
                  <select
                    value={resultFilters.sector}
                    onChange={(e) => setResultFilters({ ...resultFilters, sector: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Tous les grades</option>
                    {Array.from(new Set(resumes.map(r => r.grade))).sort().map(grade => (
                      <option key={grade} value={grade}>{grade}</option>
                    ))}
                  </select>
                </div>

                {/* Filtre Expérience */}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Expérience minimum</label>
                  <select
                    value={resultFilters.minScore}
                    onChange={(e) => setResultFilters({ ...resultFilters, minScore: parseInt(e.target.value) })}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="0">Toutes expériences</option>
                    <option value="3">3+ ans</option>
                    <option value="5">5+ ans</option>
                    <option value="7">7+ ans</option>
                    <option value="10">10+ ans</option>
                  </select>
                </div>

                {/* Filtre Disponibilité */}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Disponibilité</label>
                  <select
                    value={resultFilters.searchSkill === 'immédiat' ? 'immediate' : ''}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                    onChange={(e) => {
                      if (e.target.value === 'immediate') {
                        setResultFilters({ ...resultFilters, searchSkill: 'immédiat' })
                      } else {
                        setResultFilters({ ...resultFilters, searchSkill: '' })
                      }
                    }}
                  >
                    <option value="">Toutes</option>
                    <option value="immediate">Immédiat</option>
                  </select>
                </div>

                {/* Recherche Compétence */}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Rechercher compétence</label>
                  <input
                    type="text"
                    value={resultFilters.searchSkill && resultFilters.searchSkill !== 'immédiat' ? resultFilters.searchSkill : ''}
                    placeholder="Ex: Python, AWS..."
                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                    onChange={(e) => setResultFilters({ ...resultFilters, searchSkill: e.target.value })}
                  />
                </div>

                {/* Filtre TACE */}
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">TACE minimum</label>
                  <select
                    value={resultFilters.minTace}
                    onChange={(e) => setResultFilters({ ...resultFilters, minTace: parseInt(e.target.value) })}
                    className="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="0">Tous TACE</option>
                    <option value="70">70%+</option>
                    <option value="80">80%+</option>
                    <option value="90">90%+</option>
                    <option value="95">95%+</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total Profils</p>
                    <p className="text-2xl font-bold text-white">{resumes.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Award className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Compétences Uniques</p>
                    <p className="text-2xl font-bold text-white">
                      {new Set(resumes.flatMap(r => r.skills)).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Briefcase className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Secteurs</p>
                    <p className="text-2xl font-bold text-white">
                      {new Set(resumes.flatMap(r => r.sectors || [])).size}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Exp. Moyenne</p>
                    <p className="text-2xl font-bold text-white">
                      {(resumes.reduce((acc, r) => acc + parseInt(r.experience), 0) / resumes.length).toFixed(1)} ans
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-500/20 rounded-lg">
                    <Zap className="w-5 h-5 text-pink-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Disponibles</p>
                    <p className="text-2xl font-bold text-white">
                      {resumes.filter(r => r.availability.toLowerCase().includes('immédiat')).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Liste des CVs */}
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  Liste Complète des Profils
                </h3>
                <div className="flex items-center gap-3">
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                    {resumes
                      .filter(r => {
                        // Filtre Grade
                        if (resultFilters.sector && r.grade !== resultFilters.sector) return false
                        // Filtre Expérience
                        if (resultFilters.minScore > 0 && parseInt(r.experience) < resultFilters.minScore) return false
                        // Filtre Compétence ou Disponibilité
                        if (resultFilters.searchSkill) {
                          const searchLower = resultFilters.searchSkill.toLowerCase()
                          const hasSkill = r.skills.some(s => s.toLowerCase().includes(searchLower))
                          const hasAvailability = r.availability.toLowerCase().includes(searchLower)
                          if (!hasSkill && !hasAvailability) return false
                        }
                        // Filtre TACE
                        if (resultFilters.minTace > 0 && (!r.tace || r.tace < resultFilters.minTace)) return false
                        return true
                      }).length} profils
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {(() => {
                  const filteredResumes = resumes.filter(r => {
                    // Filtre Grade
                    if (resultFilters.sector && r.grade !== resultFilters.sector) return false
                    // Filtre Expérience
                    if (resultFilters.minScore > 0 && parseInt(r.experience) < resultFilters.minScore) return false
                    // Filtre Compétence ou Disponibilité
                    if (resultFilters.searchSkill) {
                      const searchLower = resultFilters.searchSkill.toLowerCase()
                      const hasSkill = r.skills.some(s => s.toLowerCase().includes(searchLower))
                      const hasAvailability = r.availability.toLowerCase().includes(searchLower)
                      if (!hasSkill && !hasAvailability) return false
                    }
                    // Filtre TACE
                    if (resultFilters.minTace > 0 && (!r.tace || r.tace < resultFilters.minTace)) return false
                    return true
                  })

                  if (filteredResumes.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-16 px-4">
                        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                          <Search className="w-10 h-10 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">Aucun profil trouvé</h3>
                        <p className="text-gray-400 text-center max-w-md mb-4">
                          {resultFilters.searchSkill 
                            ? `Aucun CV ne contient le mot-clé "${resultFilters.searchSkill}"`
                            : "Aucun profil ne correspond aux critères sélectionnés"
                          }
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setResultFilters({ minScore: 0, sector: '', searchSkill: '', minTace: 0 })}
                          className="bg-blue-600 border-blue-500 text-white hover:bg-blue-700"
                        >
                          <X className="w-3 h-3 mr-2" />
                          Réinitialiser les filtres
                        </Button>
                      </div>
                    )
                  }

                  return filteredResumes.map((resume, index) => (
                  <div 
                    key={resume.id} 
                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-blue-500/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs font-bold text-gray-500 bg-gray-700 px-2 py-1 rounded">
                            #{index + 1}
                          </span>
                          <h4 className="text-lg font-semibold text-white">{resume.name}</h4>
                          <Badge className={`text-xs ${getGradeBadgeStyle(resume.grade)}`}>
                            {resume.grade}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{resume.title}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {resume.experience}
                          </span>
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            {resume.availability}
                          </span>
                          {resume.tace !== undefined && (
                            <span className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              <span className={`font-semibold ${
                                resume.tace >= 90 ? 'text-green-400' :
                                resume.tace >= 1 ? 'text-yellow-400' :
                                'text-red-400'
                              }`}>
                                TACE {resume.tace}%
                              </span>
                            </span>
                          )}
                          {(resume.sectors || []).length > 0 && (
                            <span className="flex items-center gap-1">
                              <Briefcase className="w-3 h-3" />
                              {resume.sectors?.[0]}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => toggleFavorite(resume.id)}
                        className="text-xl hover:scale-110 transition-all"
                      >
                        {favorites.includes(resume.id) ? (
                          <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                        ) : (
                          <Star className="w-5 h-5 text-gray-500 hover:text-yellow-500" />
                        )}
                      </button>
                    </div>

                    {/* Compétences */}
                    <div className="mb-2">
                      <p className="text-xs font-semibold text-gray-400 mb-2">Compétences principales :</p>
                      <div className="flex flex-wrap gap-1">
                        {resume.skills.slice(0, 8).map((skill, idx) => (
                          <Badge 
                            key={idx} 
                            className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {resume.skills.length > 8 && (
                          <Badge className="bg-gray-700 text-gray-400 text-xs">
                            +{resume.skills.length - 8} autres
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="bg-blue-600 border-blue-500 text-white hover:bg-blue-700 text-xs"
                            onClick={() => setSelectedResume(resume)}
                          >
                            <Eye className="w-3 h-3 mr-1" />
                            Voir CV
                          </Button>
                        </DialogTrigger>
                        <ResumeDetailDialog
                          resume={resume}
                          getMatchBadgeStyle={getMatchBadgeStyle}
                          shareProfile={shareProfile}
                          showMatchingInfo={false}
                        />
                      </Dialog>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="bg-gray-700 border-gray-600 text-white hover:bg-gray-600 text-xs"
                        onClick={() => {
                          // Navigate to matching with this profile
                          setTenderText(`Recherche profil similaire à:\n\n${resume.title}\n\nCompétences: ${resume.skills.slice(0, 5).join(', ')}`)
                          setViewMode("matching")
                        }}
                      >
                        <Search className="w-3 h-3 mr-1" />
                        Trouver similaires
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="bg-purple-600 border-purple-500 text-white hover:bg-purple-700 text-xs"
                        onClick={() => {
                          navigator.clipboard.writeText(`${resume.name} - ${resume.title}\n\nCompétences: ${resume.skills.join(', ')}\n\nExpérience: ${resume.experience}\nDisponibilité: ${resume.availability}`)
                          toast.success('Profil copié dans le presse-papier')
                        }}
                      >
                        <Share2 className="w-3 h-3 mr-1" />
                        Partager
                      </Button>
                    </div>
                  </div>
                  ))
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* MATCHING VIEW */}
      {viewMode === "matching" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Horizontal Banner - Masqué pendant et après matching */}
          {!isMatching && !hasResults && Object.keys(profileResults).length === 0 && (
        <div className="mb-6">
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
            <div className="flex gap-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              {/* Filters Section */}
              <div className="flex-shrink-0">
                <Button
                  variant="outline"
                  onClick={() => setExpandedSection(expandedSection === "filters" ? null : "filters")}
                  className={hasActiveFilters() 
                    ? "bg-blue-600 border-blue-500 text-white hover:bg-blue-700 whitespace-nowrap" 
                    : "bg-gray-800 border-gray-600 text-white hover:bg-gray-700 whitespace-nowrap"
                  }
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtres
                  {hasActiveFilters() && (
                    <Badge className="ml-2 bg-white text-blue-600 text-xs px-1.5 py-0">
                      {[
                        filters.location && filters.location !== "any" ? 1 : 0,
                        filters.availability && filters.availability !== "any" ? 1 : 0,
                        filters.minExperience && filters.minExperience !== "any" ? 1 : 0,
                        filters.sectors.length,
                        filters.skills.length,
                        filters.certifications.length
                      ].reduce((a, b) => a + b, 0)}
                    </Badge>
                  )}
                  {expandedSection === "filters" ? (
                    <ChevronUp className="w-4 h-4 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-2" />
                  )}
                </Button>
              </div>

              {/* Bouton Pondération */}
              <div className="flex-shrink-0">
                <Button
                  variant="outline"
                  onClick={() => setShowWeightsDialog(true)}
                  className="bg-gray-800 border-gray-600 text-white hover:bg-gray-700 whitespace-nowrap"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Pondération
                  <Badge className="ml-2 bg-yellow-600 text-white text-xs px-1.5 py-0">
                    Personnalisé
                  </Badge>
                </Button>
              </div>

              {/* Bouton Réinitialiser */}
              {(hasResults || Object.keys(profileResults).length > 0 || tenderText || detectedProfiles.length > 0) && (
                <div className="flex-shrink-0">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={handleReset}
                          className="bg-red-600/20 text-red-300 border-red-500/50 hover:bg-red-600/30 hover:text-red-200 hover:border-red-400 whitespace-nowrap"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Réinitialiser
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Réinitialiser l'application</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}

              {/* Quick Actions */}
              <div className="flex-shrink-0 ml-auto">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleStartMatching}
                        disabled={isMatching || (searchMode === "multi" && detectedProfiles.length === 0)}
                        className="bg-yellow-400 hover:bg-yellow-500 text-black whitespace-nowrap font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isMatching ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2" />
                            Matching...
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4 mr-2" />
                            Démarrer le Matching
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent className="bg-gray-800 text-white border-yellow-500 max-w-xs">
                      {searchMode === "multi" && detectedProfiles.length === 0 ? (
                        <>
                          <p className="font-semibold mb-1">⚠️ Appel d'Offres Complexe</p>
                          <p className="text-sm">En mode appel d'offres, vous devez d'abord cliquer sur "Détecter les profils" pour identifier les profils avant de lancer le matching.</p>
                          <p className="text-xs text-yellow-300 mt-2">💡 Ou passez en Recrutement Individuel pour un matching direct</p>
                        </>
                      ) : searchMode === "simple" ? (
                        <>
                          <p className="font-semibold mb-1">Recrutement Individuel</p>
                          <p className="text-sm">Lance directement le matching pour UN SEUL profil avec tous les candidats de la base.</p>
                          <p className="text-xs text-yellow-300 mt-2">💡 Idéal pour : recherche d'un profil spécifique (Data Engineer, Dev, etc.)</p>
                        </>
                      ) : (
                        <>
                          <p className="font-semibold mb-1">Appel d'Offres Complexe Actif</p>
                          <p className="text-sm">Lance un matching pour tous les profils détectés dans l'appel d'offres.</p>
                          <p className="text-xs text-yellow-300 mt-2">💡 {detectedProfiles.length} profil(s) détecté(s)</p>
                        </>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            {/* Expanded Content - Filters only */}
            {expandedSection === "filters" && (
              <div className="mt-4 border-t border-gray-700 pt-4 relative z-40">
                  <div className="space-y-6">
                    {/* Section 1: Localisation & Disponibilité */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                      <div>
                        <Label className="text-white font-semibold flex items-center gap-2">
                          📍 Localisation
                        </Label>
                        <Select
                          value={filters.location}
                          onValueChange={(value) => setFilters({ ...filters, location: value })}
                        >
                          <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Toute localisation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Toute localisation</SelectItem>
                            {Array.from(new Set(resumes.map(r => r.location).filter(Boolean))).sort().map(location => (
                              <SelectItem key={location} value={location.toLowerCase()}>{location}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-white font-semibold flex items-center gap-2">
                          ⏰ Disponibilité
                        </Label>
                        <Select
                          value={filters.availability}
                          onValueChange={(value) => setFilters({ ...filters, availability: value })}
                        >
                          <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Toute disponibilité" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Toute disponibilité</SelectItem>
                            {Array.from(new Set(resumes.map(r => r.availability).filter(Boolean))).sort().map(availability => (
                              <SelectItem key={availability} value={availability.toLowerCase().replace(/\s+/g, '-')}>{availability}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-white font-semibold flex items-center gap-2">
                          💼 Expérience minimum
                        </Label>
                        <Select
                          value={filters.minExperience}
                          onValueChange={(value) => setFilters({ ...filters, minExperience: value })}
                        >
                          <SelectTrigger className="mt-2 bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Toute expérience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Toute expérience</SelectItem>
                            <SelectItem value="0">Junior (0-2 ans)</SelectItem>
                            <SelectItem value="2">2+ ans</SelectItem>
                            <SelectItem value="5">5+ ans</SelectItem>
                            <SelectItem value="8">8+ ans (Senior)</SelectItem>
                            <SelectItem value="10">10+ ans (Expert)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Section 3: Secteurs */}
                    <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                      <Label className="text-white font-semibold flex items-center gap-2 mb-3">
                        🏢 Secteurs d'activité
                      </Label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {filters.sectors.map((sector) => (
                          <Badge key={sector} className="bg-blue-600 text-white px-3 py-1">
                            {sector}
                            <button
                              onClick={() => setFilters({...filters, sectors: filters.sectors.filter(s => s !== sector)})}
                              className="ml-2 hover:text-red-300 font-bold"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                        {isLoadingCVs ? (
                          <p className="text-gray-400 text-sm col-span-full">Chargement des secteurs...</p>
                        ) : Array.from(new Set(resumes.flatMap(r => r.sectors || []))).sort().length === 0 ? (
                          <p className="text-gray-400 text-sm col-span-full">Aucun secteur disponible dans la base</p>
                        ) : (
                          Array.from(new Set(resumes.flatMap(r => r.sectors || []))).sort().map((sector) => (
                          <Button
                            key={sector}
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (filters.sectors.includes(sector)) {
                                setFilters({...filters, sectors: filters.sectors.filter(s => s !== sector)})
                              } else {
                                setFilters({...filters, sectors: [...filters.sectors, sector]})
                              }
                            }}
                            className={filters.sectors.includes(sector) 
                              ? "bg-blue-600 text-white border-blue-500" 
                              : "bg-gray-700 text-gray-300 border-gray-600"
                            }
                          >
                            {sector}
                          </Button>
                        ))
                        )}
                      </div>
                    </div>

                    {/* Section 4: Compétences clés */}
                    <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                      <Label className="text-white font-semibold flex items-center gap-2 mb-3">
                        ⚙️ Compétences clés requises
                      </Label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {filters.skills.map((skill) => (
                          <Badge key={skill} className="bg-purple-600 text-white px-3 py-1">
                            {skill}
                            <button
                              onClick={() => setFilters({...filters, skills: filters.skills.filter(s => s !== skill)})}
                              className="ml-2 hover:text-red-300 font-bold"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {isLoadingCVs ? (
                          <p className="text-gray-400 text-sm col-span-full">Chargement des compétences...</p>
                        ) : Array.from(new Set(resumes.flatMap(r => r.skills || []))).sort().slice(0, 30).length === 0 ? (
                          <p className="text-gray-400 text-sm col-span-full">Aucune compétence disponible dans la base</p>
                        ) : (
                          Array.from(new Set(resumes.flatMap(r => r.skills || []))).sort().slice(0, 30).map((skill) => (
                          <Button
                            key={skill}
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (filters.skills.includes(skill)) {
                                setFilters({...filters, skills: filters.skills.filter(s => s !== skill)})
                              } else {
                                setFilters({...filters, skills: [...filters.skills, skill]})
                              }
                            }}
                            className={`h-auto min-h-[2.5rem] py-2 px-3 whitespace-normal text-left leading-tight ${
                              filters.skills.includes(skill) 
                                ? "bg-purple-600 text-white border-purple-500" 
                                : "bg-gray-700 text-gray-300 border-gray-600"
                            }`}
                          >
                            {skill}
                          </Button>
                        ))
                        )}
                      </div>
                    </div>

                    {/* Section 5: Certifications */}
                    <div className="p-4 bg-gray-800/30 rounded-lg border border-gray-700">
                      <Label className="text-white font-semibold flex items-center gap-2 mb-3">
                        🏆 Certifications
                      </Label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {filters.certifications.map((cert) => (
                          <Badge key={cert} className="bg-green-600 text-white px-3 py-1">
                            {cert}
                            <button
                              onClick={() => setFilters({...filters, certifications: filters.certifications.filter(c => c !== cert)})}
                              className="ml-2 hover:text-red-300 font-bold"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {isLoadingCVs ? (
                          <p className="text-gray-400 text-sm col-span-full">Chargement des certifications...</p>
                        ) : Array.from(new Set(resumes.flatMap(r => r.certifications || []))).sort().slice(0, 30).length === 0 ? (
                          <p className="text-gray-400 text-sm col-span-full">Aucune certification disponible dans la base</p>
                        ) : (
                          Array.from(new Set(resumes.flatMap(r => r.certifications || []))).sort().slice(0, 30).map((cert) => (
                          <Button
                            key={cert}
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (filters.certifications.includes(cert)) {
                                setFilters({...filters, certifications: filters.certifications.filter(c => c !== cert)})
                              } else {
                                setFilters({...filters, certifications: [...filters.certifications, cert]})
                              }
                            }}
                            className={`h-auto min-h-[2.5rem] py-2 px-3 whitespace-normal text-left leading-tight ${
                              filters.certifications.includes(cert) 
                                ? "bg-green-600 text-white border-green-500" 
                                : "bg-gray-700 text-gray-300 border-gray-600"
                            }`}
                          >
                            {cert}
                          </Button>
                        ))
                        )}
                      </div>
                    </div>

                    {/* Bouton réinitialiser & résumé */}
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 rounded-lg border border-gray-600">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-600 text-white px-3 py-1">
                          {[
                            filters.location && filters.location !== "any" ? 1 : 0,
                            filters.availability && filters.availability !== "any" ? 1 : 0,
                            filters.minExperience && filters.minExperience !== "any" ? 1 : 0,
                            filters.sectors.length,
                            filters.skills.length,
                            filters.certifications.length
                          ].reduce((a, b) => a + b, 0)} filtres actifs
                        </Badge>
                        {filters.sectors.length > 0 && (
                          <span className="text-sm text-gray-300">
                            • {filters.sectors.length} secteur(s)
                          </span>
                        )}
                        {filters.skills.length > 0 && (
                          <span className="text-sm text-gray-300">
                            • {filters.skills.length} compétence(s)
                          </span>
                        )}
                        {filters.certifications.length > 0 && (
                          <span className="text-sm text-gray-300">
                            • {filters.certifications.length} certification(s)
                          </span>
                        )}
                      </div>
                      <Button
                        onClick={() => setFilters({
                          location: "",
                          availability: "",
                          minExperience: "",
                          sectors: [],
                          skills: [],
                          certifications: [],
                        })}
                        variant="outline"
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white border-red-500"
                      >
                        🔄 Réinitialiser tous les filtres
                      </Button>
                    </div>
                  </div>
              </div>
            )}

            {/* Contenu Appel d'Offres - Toujours visible */}
            <div className="mt-4 border-t border-gray-700 pt-4 space-y-4">
              {/* Sélection du Mode - Design Cards */}
              <div className="space-y-3">
                <Label className="text-white font-semibold text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  Choisissez votre type de recherche
                </Label>

                {/* Cards sélectionnables */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Card Mode Recrutement Individuel */}
                  <button
                    onClick={() => handleSearchModeChange("simple")}
                    className={`group relative p-5 rounded-xl border-2 transition-all duration-300 text-left ${
                      searchMode === "simple"
                        ? "bg-gradient-to-br from-blue-900/40 via-blue-800/30 to-blue-900/40 border-blue-500 shadow-xl shadow-blue-500/20"
                        : "bg-gray-800/30 border-gray-700 hover:border-gray-600 hover:bg-gray-800/50"
                    }`}
                  >
                    {/* Badge de sélection */}
                    {searchMode === "simple" && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-blue-500 rounded-full p-1">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Icône et titre */}
                    <div className="flex items-start gap-4 mb-3">
                      <div className={`p-3 rounded-lg transition-all duration-300 ${
                        searchMode === "simple"
                          ? "bg-blue-600/30 shadow-lg shadow-blue-500/20"
                          : "bg-gray-700/50 group-hover:bg-gray-700"
                      }`}>
                        <Target className={`w-6 h-6 ${
                          searchMode === "simple" ? "text-blue-400" : "text-gray-400 group-hover:text-gray-300"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-bold text-base mb-1 ${
                          searchMode === "simple" ? "text-white" : "text-gray-300 group-hover:text-white"
                        }`}>
                          Recrutement Individuel
                        </h3>
                        <p className={`text-xs font-medium ${
                          searchMode === "simple" ? "text-blue-300" : "text-gray-500 group-hover:text-gray-400"
                        }`}>
                          Pour un seul poste à pourvoir
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className={`text-xs leading-relaxed mb-3 ${
                      searchMode === "simple" ? "text-gray-300" : "text-gray-500 group-hover:text-gray-400"
                    }`}>
                      Recherchez <span className="font-semibold">un profil précis</span> dans votre base de candidats. 
                      Parfait pour un recrutement standard ou une mission spécifique.
                    </p>

                    {/* Exemples */}
                    <div className="space-y-1.5 mb-3">
                      <div className={`flex items-center gap-2 text-xs ${
                        searchMode === "simple" ? "text-blue-200" : "text-gray-600 group-hover:text-gray-500"
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${
                          searchMode === "simple" ? "bg-blue-400" : "bg-gray-600"
                        }`} />
                        Data Engineer Senior
                      </div>
                      <div className={`flex items-center gap-2 text-xs ${
                        searchMode === "simple" ? "text-blue-200" : "text-gray-600 group-hover:text-gray-500"
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${
                          searchMode === "simple" ? "bg-blue-400" : "bg-gray-600"
                        }`} />
                        Product Manager
                      </div>
                      <div className={`flex items-center gap-2 text-xs ${
                        searchMode === "simple" ? "text-blue-200" : "text-gray-600 group-hover:text-gray-500"
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${
                          searchMode === "simple" ? "bg-blue-400" : "bg-gray-600"
                        }`} />
                        DevOps Engineer
                      </div>
                    </div>

                    {/* Tags caractéristiques */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-medium ${
                        searchMode === "simple"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : "bg-gray-700/50 text-gray-500 border border-gray-700"
                      }`}>
                        <Zap className="w-3 h-3" />
                        Rapide
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-medium ${
                        searchMode === "simple"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : "bg-gray-700/50 text-gray-500 border border-gray-700"
                      }`}>
                        <Target className="w-3 h-3" />
                        Ciblé
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-medium ${
                        searchMode === "simple"
                          ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                          : "bg-gray-700/50 text-gray-500 border border-gray-700"
                      }`}>
                        1 profil
                      </span>
                    </div>
                  </button>

                  {/* Card Mode Appel d'Offres */}
                  <button
                    onClick={() => handleSearchModeChange("multi")}
                    className={`group relative p-5 rounded-xl border-2 transition-all duration-300 text-left ${
                      searchMode === "multi"
                        ? "bg-gradient-to-br from-purple-900/40 via-purple-800/30 to-purple-900/40 border-purple-500 shadow-xl shadow-purple-500/20"
                        : "bg-gray-800/30 border-gray-700 hover:border-gray-600 hover:bg-gray-800/50"
                    }`}
                  >
                    {/* Badge de sélection */}
                    {searchMode === "multi" && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-purple-500 rounded-full p-1">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}

                    {/* Icône et titre */}
                    <div className="flex items-start gap-4 mb-3">
                      <div className={`p-3 rounded-lg transition-all duration-300 ${
                        searchMode === "multi"
                          ? "bg-purple-600/30 shadow-lg shadow-purple-500/20"
                          : "bg-gray-700/50 group-hover:bg-gray-700"
                      }`}>
                        <Layers className={`w-6 h-6 ${
                          searchMode === "multi" ? "text-purple-400" : "text-gray-400 group-hover:text-gray-300"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-bold text-base mb-1 ${
                          searchMode === "multi" ? "text-white" : "text-gray-300 group-hover:text-white"
                        }`}>
                          Appel d'Offres Complexe
                        </h3>
                        <p className={`text-xs font-medium ${
                          searchMode === "multi" ? "text-purple-300" : "text-gray-500 group-hover:text-gray-400"
                        }`}>
                          Pour constituer une équipe complète
                        </p>
                      </div>
                    </div>

                    {/* Description */}
                    <p className={`text-xs leading-relaxed mb-3 ${
                      searchMode === "multi" ? "text-gray-300" : "text-gray-500 group-hover:text-gray-400"
                    }`}>
                      L'IA <span className="font-semibold">détecte automatiquement</span> tous les profils nécessaires 
                      dans votre appel d'offres et effectue un matching séparé pour chacun.
                    </p>

                    {/* Exemples */}
                    <div className="space-y-1.5 mb-3">
                      <div className={`flex items-center gap-2 text-xs ${
                        searchMode === "multi" ? "text-purple-200" : "text-gray-600 group-hover:text-gray-500"
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${
                          searchMode === "multi" ? "bg-purple-400" : "bg-gray-600"
                        }`} />
                        Migration Cloud (Architecte + 2 Engineers)
                      </div>
                      <div className={`flex items-center gap-2 text-xs ${
                        searchMode === "multi" ? "text-purple-200" : "text-gray-600 group-hover:text-gray-500"
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${
                          searchMode === "multi" ? "bg-purple-400" : "bg-gray-600"
                        }`} />
                        Plateforme Data (Lead + Team)
                      </div>
                      <div className={`flex items-center gap-2 text-xs ${
                        searchMode === "multi" ? "text-purple-200" : "text-gray-600 group-hover:text-gray-500"
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${
                          searchMode === "multi" ? "bg-purple-400" : "bg-gray-600"
                        }`} />
                        Projet IA (ML Engineers + Data Scientists)
                      </div>
                    </div>

                    {/* Tags caractéristiques */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-medium ${
                        searchMode === "multi"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "bg-gray-700/50 text-gray-500 border border-gray-700"
                      }`}>
                        <Sparkles className="w-3 h-3" />
                        IA Avancée
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-medium ${
                        searchMode === "multi"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "bg-gray-700/50 text-gray-500 border border-gray-700"
                      }`}>
                        <Users className="w-3 h-3" />
                        Équipe
                      </span>
                      <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-full font-medium ${
                        searchMode === "multi"
                          ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                          : "bg-gray-700/50 text-gray-500 border border-gray-700"
                      }`}>
                        Multi-profils
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-white" htmlFor="tender-text">
                          Description du Poste
                        </Label>
                        {searchMode === "multi" && (
                        <div className="flex gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={handleAnalyzeTender}
                                  disabled={isAnalyzingTender || !tenderText}
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                  type="button"
                                >
                                  {isAnalyzingTender ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                                      Détection...
                                    </>
                                  ) : (
                                    <>
                                      Détecter les profils (Multi)
                                    </>
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-gray-800 text-white border-blue-500 max-w-xs">
                                <p className="font-semibold mb-1">Appel d'Offres Complexe</p>
                                <p className="text-sm">Détecte automatiquement plusieurs profils dans l'appel d'offres et effectue un matching séparé pour chacun.</p>
                                <p className="text-xs text-blue-300 mt-2">💡 Idéal pour : appels d'offres complexes, équipes multiples</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                        )}
                      </div>

                      {/* Quick Templates - Conditional based on search mode */}
                      {searchMode === "multi" && (
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <Label className="text-gray-300 text-sm font-semibold">
                            Suggestions - Appels d'offres (multi-profils) :
                          </Label>
                          <Badge className="bg-purple-600 text-white text-xs">
                            Appel d'Offres
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { 
                              title: "Migration Cloud Data", 
                              template: "Appel d'offres : Migration Data Platform vers le Cloud\n\nContexte : Migration de notre plateforme data on-premise (100To) vers Azure Cloud\n\nProfils recherchés :\n\n1. Architecte Data Cloud (Lead)\n- Azure Synapse, Data Factory, Databricks\n- Architecture data lake/lakehouse\n- Migration de workloads complexes\n- Data governance et sécurité\n- Expérience : 8+ ans\n\n2. Data Engineer Senior (x2)\n- Python, Spark, SQL avancé\n- ETL/ELT migration et optimisation\n- Azure Data Services\n- Data quality et monitoring\n- Expérience : 5+ ans\n\n3. DevOps Data\n- CI/CD pour pipelines data\n- Infrastructure as Code (Terraform)\n- Monitoring et observabilité\n- Expérience : 4+ ans" 
                            },
                            { 
                              title: "Plateforme IA Générative", 
                              template: "Appel d'offres : Plateforme IA Générative Enterprise\n\nContexte : Construction d'une plateforme IA générative interne pour automatiser documentation, support et analyses\n\nProfils recherchés :\n\n1. Architecte IA Générative (Lead)\n- LLM (GPT-4, Claude, Llama 2/3)\n- Architecture RAG et vector databases\n- Fine-tuning et prompt engineering\n- Sécurité et gouvernance IA\n- Expérience : 3+ ans en GenAI\n\n2. ML Engineer GenAI (x2)\n- Python, PyTorch/TensorFlow\n- LangChain, LlamaIndex\n- Vector stores (Pinecone, Weaviate)\n- MLOps et déploiement LLM\n- Expérience : 2+ ans\n\n3. Data Engineer IA\n- Pipelines de données pour IA\n- Data preprocessing pour LLM\n- Gestion de datasets massifs\n- Expérience : 4+ ans" 
                            },
                            { 
                              title: "Data Lakehouse Moderne", 
                              template: "Appel d'offres : Construction Data Lakehouse Enterprise\n\nContexte : Mise en place d'une architecture data lakehouse moderne pour unifier analytics et ML\n\nProfils recherchés :\n\n1. Architecte Data Lakehouse (Lead)\n- Databricks, Delta Lake\n- Architecture medallion (Bronze/Silver/Gold)\n- Data mesh concepts\n- Unity Catalog, governance\n- Expérience : 7+ ans\n\n2. Data Engineer (x3)\n- Python, Spark, SQL\n- DBT, data transformation\n- Streaming (Kafka, Kinesis)\n- Orchestration (Airflow, Dagster)\n- Expérience : 4+ ans\n\n3. Analytics Engineer\n- Modélisation data warehouse\n- DBT advanced\n- Métriques et KPI\n- Expérience : 3+ ans" 
                            },
                            { 
                              title: "MLOps Platform", 
                              template: "Appel d'offres : Plateforme MLOps Enterprise\n\nContexte : Construction d'une plateforme MLOps pour industrialiser le déploiement de modèles ML\n\nProfils recherchés :\n\n1. Architecte MLOps (Lead)\n- MLflow, Kubeflow, SageMaker\n- Model registry et versioning\n- Feature store architecture\n- CI/CD pour ML\n- Expérience : 6+ ans\n\n2. ML Engineer (x2)\n- Python ML stack complet\n- Containerisation (Docker, K8s)\n- Model monitoring et drift\n- A/B testing de modèles\n- Expérience : 4+ ans\n\n3. DevOps ML\n- Kubernetes, Terraform\n- Monitoring (Prometheus, Grafana)\n- Infrastructure ML\n- Expérience : 4+ ans" 
                            },
                            { 
                              title: "Data Science & Analytics BI", 
                              template: "Appel d'offres : Équipe Data Science et Analytics\n\nContexte : Constitution d'une équipe data science pour projets ML et analytics avancés\n\nProfils recherchés :\n\n1. Lead Data Scientist\n- ML/Deep Learning expertise\n- Time series, NLP, Computer Vision\n- Encadrement technique\n- Communication stakeholders\n- Expérience : 6+ ans\n\n2. Data Scientist (x2)\n- Python data science stack\n- ML classique et deep learning\n- Feature engineering\n- Statistiques avancées\n- Expérience : 3+ ans\n\n3. Analytics Engineer / BI\n- SQL expert, DBT\n- Power BI ou Tableau\n- Data modeling\n- Expérience : 4+ ans" 
                            },
                            { 
                              title: "Real-time Data Platform", 
                              template: "Appel d'offres : Plateforme Data Streaming Temps Réel\n\nContexte : Construction d'une plateforme de traitement de données en temps réel pour analytics et ML\n\nProfils recherchés :\n\n1. Architecte Streaming Data\n- Kafka, Flink, Spark Streaming\n- Event-driven architecture\n- CDC (Change Data Capture)\n- Expérience : 7+ ans\n\n2. Data Engineer Streaming (x2)\n- Kafka ecosystem (Connect, Streams)\n- Python/Scala pour streaming\n- Real-time pipelines\n- Expérience : 4+ ans\n\n3. Platform Engineer\n- Kubernetes, observabilité\n- Infrastructure streaming\n- Performance tuning\n- Expérience : 5+ ans" 
                            },
                          ].map((job) => (
                            <Button
                              key={job.title}
                              onClick={() => {
                                setTenderText(job.template)
                                setSelectedTemplate(job.title)
                                // Automatically switch to multi mode for multi-profile templates
                                setSearchMode("multi")
                                if (multiProfileTemplates.includes(job.title)) {
                                  setIsMultiProfile(true)
                                } else {
                                  setIsMultiProfile(false)
                                }
                              }}
                              size="sm"
                              variant="outline"
                              className={selectedTemplate === job.title 
                                ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-500 shadow-lg shadow-purple-500/50" 
                                : "bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                              }
                              type="button"
                            >
                              {selectedTemplate === job.title && <span className="mr-1">✓</span>}
                              {job.title}
                            </Button>
                          ))}
                        </div>
                      </div>
                      )}

                      {searchMode === "simple" && (
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2">
                          <Label className="text-gray-300 text-sm font-semibold">
                            Suggestions - Postes individuels :
                          </Label>
                          <Badge className="bg-blue-600 text-white text-xs">
                            Recrutement Individuel
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { 
                              title: "Data Engineer Senior", 
                              template: "Recherche Data Engineer Senior\n\nMission : Construction data platform et pipelines analytics\n\nCompétences requises :\n- Python avancé, SQL expert, Spark\n- ETL/ELT, orchestration (Airflow, Dagster)\n- Cloud (AWS/Azure/GCP)\n- Data Warehousing (Snowflake/BigQuery/Redshift)\n- Streaming (Kafka, Kinesis)\n- DBT, data modeling, data quality\n- CI/CD pour data pipelines\n\nExpérience : 5+ ans en environnement data moderne\n\nResponsabilités :\n- Design et implémentation de pipelines scalables\n- Optimisation des performances\n- Data quality et monitoring\n- Mentoring d'équipe" 
                            },
                            { 
                              title: "Data Scientist / ML Engineer", 
                              template: "Recherche Data Scientist / ML Engineer\n\nMission : Développement modèles ML et mise en production\n\nCompétences requises :\n- Python (Scikit-learn, Pandas, NumPy)\n- ML/Deep Learning (PyTorch/TensorFlow)\n- MLOps (MLflow, Kubeflow, Weights & Biases)\n- Feature engineering et feature stores\n- Time series, NLP, Computer Vision\n- Cloud ML services (SageMaker, Vertex AI)\n- Model deployment et monitoring\n- A/B testing et experimentation\n\nExpérience : 3-5 ans en ML/IA\n\nResponsabilités :\n- Développement de modèles prédictifs\n- Mise en production et monitoring\n- Analyse d'impact business" 
                            },
                            { 
                              title: "ML Engineer IA Générative", 
                              template: "Recherche ML Engineer IA Générative\n\nMission : Développement et déploiement de solutions GenAI\n\nCompétences requises :\n- LLM (GPT-4, Claude, Llama 2/3)\n- LangChain, LlamaIndex, Semantic Kernel\n- RAG (Retrieval Augmented Generation)\n- Vector databases (Pinecone, Weaviate, ChromaDB)\n- Prompt engineering et fine-tuning\n- Python, API design\n- Monitoring LLM et gestion des coûts\n\nExpérience : 2+ ans en ML, 1+ an en GenAI\n\nResponsabilités :\n- Développement d'applications GenAI\n- Optimisation de prompts et RAG\n- Déploiement et scalabilité\n- Évaluation de modèles" 
                            },
                            { 
                              title: "Architecte Data", 
                              template: "Recherche Architecte Data\n\nMission : Conception architecture data enterprise\n\nCompétences requises :\n- Architecture data lake/lakehouse/warehouse\n- Cloud (AWS/Azure/GCP) - architectures avancées\n- Data mesh et data fabric concepts\n- Data governance, lineage, catalog\n- Sécurité et compliance (RGPD)\n- Technologies Big Data (Spark, Flink)\n- Databricks, Snowflake expertise\n- Modernisation de plateformes legacy\n\nExpérience : 7+ ans dont 3+ ans en architecture\n\nResponsabilités :\n- Design d'architectures scalables\n- Choix technologiques et roadmap\n- Governance et qualité des données\n- Leadership technique" 
                            },
                            { 
                              title: "Lead Data Scientist", 
                              template: "Recherche Lead Data Scientist\n\nMission : Leadership technique et projets ML stratégiques\n\nCompétences requises :\n- ML/Deep Learning expertise approfondie\n- Computer Vision, NLP, Time Series\n- Reinforcement Learning\n- Statistiques avancées et causality\n- MLOps et industrialisation\n- Communication stakeholders et C-level\n- Encadrement d'équipe data science\n- Vision produit et ROI\n\nExpérience : 6+ ans dont 2+ ans de lead\n\nResponsabilités :\n- Définition stratégie ML\n- Pilotage de projets complexes\n- Mentoring et recrutement\n- Evangelisation IA" 
                            },
                            { 
                              title: "Analytics Engineer", 
                              template: "Recherche Analytics Engineer\n\nMission : Transformation data et analytics self-service\n\nCompétences requises :\n- SQL expert (requêtes complexes, optimisation)\n- DBT (data transformation et testing)\n- Data modeling (Kimball, Data Vault)\n- Python pour analytics\n- Data warehouse (Snowflake, BigQuery)\n- BI tools (Tableau, Power BI, Looker)\n- Git, CI/CD pour analytics\n- Métriques et KPI business\n\nExpérience : 3-5 ans en analytics/BI\n\nResponsabilités :\n- Modélisation et transformation data\n- Création de métriques business\n- Documentation et data catalog\n- Enablement des équipes métier" 
                            },
                            { 
                              title: "Data Architect Cloud", 
                              template: "Recherche Data Architect spécialisé Cloud\n\nMission : Architecture cloud-native pour data platform\n\nCompétences requises :\n- AWS (Redshift, S3, Glue, Athena, EMR) ou\n- Azure (Synapse, Data Factory, ADLS) ou\n- GCP (BigQuery, Dataflow, Composer)\n- Serverless architectures\n- Cost optimization et FinOps\n- Infrastructure as Code (Terraform, CloudFormation)\n- Data lake/lakehouse patterns\n- Multi-cloud strategies\n\nExpérience : 6+ ans dont 4+ ans cloud\n\nResponsabilités :\n- Design d'architectures cloud-native\n- Optimisation coûts et performances\n- Migration on-premise vers cloud\n- Best practices et standards" 
                            },
                            { 
                              title: "Consultant Data & IA", 
                              template: "Recherche Consultant Data & IA\n\nMission : Accompagnement transformation data et IA\n\nCompétences requises :\n- Stratégie data et IA (roadmap, use cases)\n- Architecture data moderne\n- Use cases IA : NLP, Computer Vision, ML prédictif, GenAI\n- Data governance et qualité\n- Change management et conduite du changement\n- Communication C-level\n- Expertise sectorielle (finance, retail, industrie)\n- Méthodologies agiles\n\nExpérience : 5+ ans en conseil data/IA\n\nResponsabilités :\n- Définition de stratégies data/IA\n- Identification et priorisation use cases\n- Accompagnement des transformations\n- Formation et montée en compétence" 
                            },
                          ].map((job) => (
                            <Button
                              key={job.title}
                              onClick={() => {
                                setTenderText(job.template)
                                setSelectedTemplate(job.title)
                                // Automatically switch to simple mode for single-profile templates
                                setSearchMode("simple")
                                setIsMultiProfile(false)
                              }}
                              size="sm"
                              variant="outline"
                              className={selectedTemplate === job.title 
                                ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-500 shadow-lg shadow-blue-500/50" 
                                : "bg-gray-700 hover:bg-gray-600 text-white border-gray-600"
                              }
                              type="button"
                            >
                              {selectedTemplate === job.title && <span className="mr-1">✓</span>}
                              {job.title}
                            </Button>
                          ))}
                        </div>
                      </div>
                      )}

                      <div className="relative">
                        <Textarea
                          id="tender-text"
                          placeholder="Entrez les exigences du poste, compétences nécessaires, niveau d'expérience, etc... (Requis)"
                          value={tenderText}
                          onChange={(e) => {
                            setTenderText(e.target.value)
                            // Reset selected template if user manually edits the text
                            if (selectedTemplate) {
                              setSelectedTemplate(null)
                            }
                          }}
                          className="min-h-[200px] bg-gray-700 border-gray-600 text-white pb-12"
                          required
                        />
                        
                        {/* Enrichir button positioned at bottom right of textarea */}
                        <div className="absolute bottom-2 right-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={handleImproveJobOffer}
                                  disabled={isImproving || !tenderText}
                                  size="sm"
                                  className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
                                  type="button"
                                >
                                  {isImproving ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                                      Enrichissement...
                                    </>
                                  ) : (
                                    <>
                                      <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                      Enrichir la description
                                    </>
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="bg-gray-800 text-white border-purple-500 max-w-xs">
                                <p className="font-semibold mb-1">Enrichissement IA</p>
                                <p className="text-sm">Structure et complète votre description avec des détails techniques, compétences et responsabilités.</p>
                                <p className="text-xs text-purple-300 mt-2">💡 Idéal pour : descriptions basiques à étoffer</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </div>

                    {/* Version enrichie par l'IA */}
                    {enrichedText && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-purple-400 font-semibold flex items-center gap-2">
                            <span className="text-xl">✨</span>
                            Version Enrichie par l'IA
                          </Label>
                          <Button
                            onClick={() => setTenderText(enrichedText)}
                            size="sm"
                            variant="outline"
                            className="bg-purple-600/20 border-purple-500 text-purple-300 hover:bg-purple-600/40"
                            type="button"
                          >
                            Utiliser cette version
                          </Button>
                        </div>
                        <div className="bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-blue-900/40 border-2 border-purple-500/50 rounded-lg p-6 shadow-lg shadow-purple-500/20">
                          <div className="text-white whitespace-pre-wrap font-mono text-sm leading-relaxed">
                            {enrichedText}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-white mb-2">Ou téléchargez un document d'appel d'offres</p>
                      <div className="flex justify-center flex-col items-center gap-2">
                        <input
                          type="file"
                          id="file-upload"
                          accept=".txt,.doc,.docx,.pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-yellow-400 text-black border-yellow-400 hover:bg-yellow-500 hover:text-black"
                          onClick={() => document.getElementById('file-upload')?.click()}
                          type="button"
                        >
                          Choisir un Fichier
                        </Button>
                        {uploadedFileName && (
                          <p className="text-sm text-green-400">✓ {uploadedFileName}</p>
                        )}
                      </div>
                    </div>
              </div>
            </div>
          </div>
          )}

          {/* Results Section - Now Full Width */}
          <div className="pt-2 pb-8">

          {isMatching && (
            <div className="space-y-4">
              {/* Enhanced Loading Card */}
              <Card className="bg-gray-900 border-gray-700 overflow-hidden">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    {/* Animated Icon */}
                    <div className="relative w-16 h-16 mx-auto mb-4">
                      <div className="absolute inset-0 rounded-full bg-blue-600/20 animate-ping" />
                      <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center animate-pulse">
                        <Database className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-white mb-2">Analyse des CV en cours</h3>
                    <p className="text-blue-400 font-medium mb-1">{getMatchingStatusText()}</p>
                    <p className="text-sm text-gray-400">Veuillez patienter pendant que l'IA analyse les profils...</p>
                  </div>

                  {/* Enhanced Progress Bar */}
                  <div className="space-y-3">
                    <div className="relative">
                      <Progress value={Math.min(matchingProgress, 100)} className="h-3 bg-gray-800" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-white drop-shadow-lg">
                          {Math.round(matchingProgress)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Démarrage</span>
                      <span>Analyse IA</span>
                      <span>Finalisation</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Skeleton Loaders for Results Preview */}
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="bg-gray-900 border-gray-700 animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="h-6 bg-gray-800 rounded w-48" />
                            <div className="h-6 bg-gray-800 rounded w-24" />
                          </div>
                          <div className="h-4 bg-gray-800 rounded w-32" />
                          <div className="flex gap-2">
                            <div className="h-6 bg-gray-800 rounded w-20" />
                            <div className="h-6 bg-gray-800 rounded w-20" />
                            <div className="h-6 bg-gray-800 rounded w-20" />
                          </div>
                        </div>
                        <div className="h-8 bg-gray-800 rounded w-32" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Multi-Profile Results with Tabs */}
          {hasResults && Object.keys(profileResults).length > 0 && (
            <div className="space-y-4">
              {/* Multi-Profile Results Header with Tabs */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Résultats du Matching Multi-Profils</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{Object.keys(profileResults).length} profil(s)</Badge>
                      <Badge className="bg-blue-600 text-white">
                        {Object.values(profileResults).reduce((acc, curr) => acc + curr.length, 0)} candidats au total
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Bouton Information sur le Matching */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowMatchingInfoDialog(true)}
                          className={`relative h-9 w-9 p-0 rounded-full bg-gradient-to-br from-yellow-500/30 to-yellow-600/30 hover:from-yellow-500/50 hover:to-yellow-600/50 text-yellow-400 border-2 border-yellow-400/70 hover:border-yellow-400 shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/60 transition-all duration-300 hover:scale-110 ${showInfoButtonAnimation ? 'animate-pulse hover:animate-none' : ''}`}
                        >
                          <HelpCircle className="w-5 h-5" />
                          {/* Cercle d'animation */}
                          {showInfoButtonAnimation && (
                            <span className="absolute inset-0 rounded-full border-2 border-yellow-400/50 animate-ping" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-yellow-500 text-gray-900 border-yellow-400">
                        <p className="font-semibold">💡 Comment fonctionne le matching ?</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="bg-red-600/20 text-red-300 border-red-500/50 hover:bg-red-600/30 hover:text-red-200 hover:border-red-400 whitespace-nowrap"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>

              {/* Profile Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {detectedProfiles.filter(p => profileResults[p.id]).map((profile) => (
                  <Button
                    key={profile.id}
                    onClick={() => setActiveProfileTab(profile.id)}
                    variant="outline"
                    className={activeProfileTab === profile.id 
                      ? "bg-blue-600 text-white border-blue-500 whitespace-nowrap shadow-lg shadow-blue-500/50" 
                      : "bg-gray-800 text-white border-gray-600 hover:bg-gray-700 whitespace-nowrap"
                    }
                  >
                    {profile.title} ({profileResults[profile.id]?.length || 0})
                  </Button>
                ))}
              </div>

              {/* Active Profile Results (with all existing features) */}
              {activeProfileTab && profileResults[activeProfileTab] && (
                <div className="space-y-4">
                  {/* Profile Info Header */}
                  <Card className="bg-gray-900 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            {detectedProfiles.find(p => p.id === activeProfileTab)?.title}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">
                            {detectedProfiles.find(p => p.id === activeProfileTab)?.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-blue-600 text-white">
                            {profileResults[activeProfileTab].length} candidat(s)
                          </Badge>
                          <Badge variant="secondary">
                            {getFilteredAndSortedResumes().length} résultat(s)
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Reuse existing features bar - same as standard view */}
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Favorites Filter Button */}
                      <Button
                        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                        size="sm"
                        variant="outline"
                        className={showFavoritesOnly 
                          ? "bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-500" 
                          : "bg-gray-800 hover:bg-gray-700 text-white border-gray-600"
                        }
                      >
                        <Star className={`w-4 h-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                        {showFavoritesOnly ? "Tous" : "Favoris"}
                      </Button>
                      
                      {/* Export Button */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="outline" className="bg-green-600 hover:bg-green-700 text-white border-green-500">
                            <Download className="w-4 h-4 mr-2" />
                            Exporter
                            <ChevronDown className="w-4 h-4 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={exportToCSV}>
                            <FileDown className="w-4 h-4 mr-2" />
                            Export CSV
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={exportToExcel}>
                            <FileSpreadsheet className="w-4 h-4 mr-2" />
                            Export Excel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Compare Mode */}
                      <Button
                        onClick={toggleCompareMode}
                        size="sm"
                        className={compareMode 
                          ? "bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-black font-semibold shadow-lg shadow-yellow-500/50 border-0" 
                          : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 font-semibold"
                        }
                      >
                        {compareMode ? (
                          <><span className="mr-1">✓</span> Mode Comparaison Actif</>
                        ) : (
                          <><span className="mr-1">⚖️</span> Comparer</>
                        )}
                      </Button>

                      {/* Analytics */}
                      <Button
                        onClick={() => setShowAnalytics(!showAnalytics)}
                        size="sm"
                        variant="outline"
                        className={showAnalytics 
                          ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-500" 
                          : "bg-gray-800 hover:bg-gray-700 text-white border-gray-600"
                        }
                      >
                        <Award className="w-4 h-4 mr-2" />
                        {showAnalytics ? "Masquer" : "Afficher"} Stats
                      </Button>
                    </div>

                    {compareMode && selectedForCompare.size >= 2 && (
                      <Button
                        onClick={openCompareModal}
                        size="sm"
                        className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-black font-semibold shadow-lg shadow-yellow-500/50 border-0 animate-pulse"
                      >
                        <span className="mr-2">⚖️</span>
                        Comparer {selectedForCompare.size} candidats
                      </Button>
                    )}
                  </div>

                  {/* Analytics (reuses existing component) */}
                  {showAnalytics && (
                    <Card className="bg-gray-900 border-gray-700 mb-4">
                      <CardContent className="p-6">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                          📊 Statistiques - {detectedProfiles.find(p => p.id === activeProfileTab)?.title}
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* 1. Score Distribution */}
                          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                              📊 Distribution des Scores
                            </h4>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={prepareScoreDistributionData()}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="range" tick={{ fill: '#e5e7eb', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#e5e7eb', fontSize: 12 }} />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#000' }} labelStyle={{ color: '#000' }} />
                                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                                  {prepareScoreDistributionData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.min >= 80 ? '#10b981' : entry.min >= 60 ? '#f59e0b' : '#ef4444'} />
                                  ))}
                                  <LabelList dataKey="count" position="top" fill="#fff" />
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                            <p className="text-sm text-gray-400 mt-2 text-center">
                              Répartition des candidats par tranche de score
                            </p>
                          </div>

                          {/* 2. Experience vs Score */}
                          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                              💼 Expérience vs Score
                            </h4>
                            <ResponsiveContainer width="100%" height={300}>
                              <ScatterChart>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis dataKey="experience" name="Expérience" unit=" ans" tick={{ fill: '#e5e7eb' }} />
                                <YAxis dataKey="score" name="Score" unit="%" tick={{ fill: '#e5e7eb' }} />
                                <RechartsTooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#000' }} labelStyle={{ color: '#000' }} />
                                <Scatter name="Candidats" data={prepareExperienceVsScoreData()} fill="#8b5cf6">
                                  {prepareExperienceVsScoreData().map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Scatter>
                              </ScatterChart>
                            </ResponsiveContainer>
                            <p className="text-sm text-gray-400 mt-2 text-center">
                              Corrélation entre l'expérience et le score de matching
                            </p>
                          </div>

                          {/* 3. Timeline des Expériences */}
                          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                              ⏱️ Timeline des Expériences
                            </h4>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart 
                                data={prepareExperienceTimelineData()} 
                                layout="vertical"
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis 
                                  type="number" 
                                  tick={{ fill: '#e5e7eb', fontSize: 12 }}
                                  label={{ value: 'Années d\'expérience', position: 'insideBottom', offset: -5, fill: '#9ca3af' }}
                                />
                                <YAxis 
                                  type="category" 
                                  dataKey="name" 
                                  tick={{ fill: '#e5e7eb', fontSize: 11 }}
                                  width={100}
                                />
                                <RechartsTooltip 
                                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', color: '#000' }}
                                  labelStyle={{ color: '#000' }}
                                  formatter={(value: number) => [`${value} ans`, 'Expérience']}
                                />
                                <Bar dataKey="years" radius={[0, 8, 8, 0]}>
                                  {prepareExperienceTimelineData().map((entry, index) => (
                                    <Cell 
                                      key={`cell-${index}`} 
                                      fill={entry.years >= 8 ? '#8b5cf6' : entry.years >= 5 ? '#3b82f6' : '#10b981'} 
                                    />
                                  ))}
                                  <LabelList dataKey="years" position="right" fill="#fff" formatter={(value: number) => `${value} ans`} />
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                            <p className="text-sm text-gray-400 mt-2 text-center">
                              Top candidats classés par années d'expérience
                            </p>
                          </div>

                          {/* 4. Matrice des Compétences */}
                          <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                            <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                              🎯 Matrice des Compétences (Top 5)
                            </h4>
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-700">
                                    <th className="text-left text-gray-400 p-2">Compétence</th>
                                    {getFilteredAndSortedResumes().slice(0, 5).map((resume, idx) => (
                                      <th key={idx} className="text-center text-gray-400 p-2 text-xs">
                                        {resume.name.split(' ')[0]}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {Array.from(new Set(
                                    getFilteredAndSortedResumes()
                                      .slice(0, 5)
                                      .flatMap(r => [...(r.matchingSkills || []), ...(r.missingSkills || [])])
                                  )).slice(0, 12).map((skill, skillIdx) => (
                                    <tr key={skillIdx} className="border-b border-gray-700/50">
                                      <td className="text-white p-2 font-medium">{skill}</td>
                                      {getFilteredAndSortedResumes().slice(0, 5).map((resume, resumeIdx) => {
                                        const hasSkill = resume.matchingSkills?.includes(skill)
                                        const missingSkill = resume.missingSkills?.includes(skill)
                                        return (
                                          <td key={resumeIdx} className="text-center p-2">
                                            {hasSkill ? (
                                              <span className="text-2xl text-green-500">✓</span>
                                            ) : missingSkill ? (
                                              <span className="text-2xl text-red-500">✗</span>
                                            ) : (
                                              <span className="text-gray-600">−</span>
                                            )}
                                          </td>
                                        )
                                      })}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            <p className="text-sm text-gray-400 mt-2 text-center">
                              ✓ = Compétence présente | ✗ = Compétence manquante
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* AI Summary for this profile */}
                  {profileSummaries[activeProfileTab] && (
                    <div className="mb-4 p-5 bg-gradient-to-r from-blue-900/60 to-purple-900/60 border-2 border-blue-400 rounded-lg shadow-lg">
                      <h3 className="text-lg font-bold text-white mb-3">Analyse IA - Vue d'Ensemble</h3>
                      <p className="text-base text-white leading-relaxed font-medium">{profileSummaries[activeProfileTab]}</p>
                    </div>
                  )}

                  {/* Filters & Sorting (Same as standard mode) */}
                  <Card className="bg-gray-900 border-gray-700 mb-4">
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-4">
                        {/* First Row: Filters */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-semibold text-gray-300">Filtres :</span>
                          </div>
                          
                          {/* Score Filter */}
                          <div className="flex items-center gap-2">
                            <Label htmlFor="score-filter-multi" className="text-sm text-gray-400">Score min:</Label>
                            <Select
                              value={resultFilters.minScore.toString()}
                              onValueChange={(value) => setResultFilters({...resultFilters, minScore: parseInt(value)})}
                            >
                              <SelectTrigger id="score-filter-multi" className="w-32 h-9 bg-gray-800 border-gray-600 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">Tous</SelectItem>
                                <SelectItem value="60">60%+</SelectItem>
                                <SelectItem value="70">70%+</SelectItem>
                                <SelectItem value="80">80%+</SelectItem>
                                <SelectItem value="90">90%+</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Sector Filter */}
                          <div className="flex items-center gap-2">
                            <Label htmlFor="sector-filter-multi" className="text-sm text-gray-400">Secteur:</Label>
                            <Select
                              value={resultFilters.sector || "all"}
                              onValueChange={(value) => setResultFilters({...resultFilters, sector: value === "all" ? "" : value})}
                            >
                              <SelectTrigger id="sector-filter-multi" className="w-40 h-9 bg-gray-800 border-gray-600 text-white">
                                <SelectValue placeholder="Tous" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="all">Tous</SelectItem>
                                {getAvailableSectors().map((sector) => (
                                  <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Skill Search */}
                          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                            <Label htmlFor="skill-filter-multi" className="text-sm text-gray-400">Compétence:</Label>
                            <div className="relative flex-1">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                              <input
                                id="skill-filter-multi"
                                type="text"
                                placeholder="Rechercher une compétence..."
                                value={resultFilters.searchSkill}
                                onChange={(e) => setResultFilters({...resultFilters, searchSkill: e.target.value})}
                                className="w-full h-9 pl-10 pr-3 rounded-md bg-gray-800 border border-gray-600 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          {/* Clear Filters */}
                          {(resultFilters.minScore > 0 || resultFilters.sector || resultFilters.searchSkill || resultFilters.minTace > 0) && (
                            <Button
                              onClick={() => setResultFilters({ minScore: 0, sector: "", searchSkill: "", minTace: 0 })}
                              size="sm"
                              variant="outline"
                              className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              Réinitialiser
                            </Button>
                          )}
                        </div>

                        {/* Second Row: Sorting */}
                        <div className="flex items-center gap-3 pt-3 border-t border-gray-700">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-semibold text-gray-300">Trier par :</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => setSortBy("score")}
                              size="sm"
                              variant={sortBy === "score" ? "default" : "outline"}
                              className={sortBy === "score" 
                                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                                : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                              }
                            >
                              Score
                            </Button>
                            <Button
                              onClick={() => setSortBy("experience")}
                              size="sm"
                              variant={sortBy === "experience" ? "default" : "outline"}
                              className={sortBy === "experience" 
                                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                                : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                              }
                            >
                              Expérience
                            </Button>
                            <Button
                              onClick={() => setSortBy("name")}
                              size="sm"
                              variant={sortBy === "name" ? "default" : "outline"}
                              className={sortBy === "name" 
                                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                                : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                              }
                            >
                              Nom
                            </Button>
                          </div>

                          <Button
                            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                            size="sm"
                            variant="outline"
                            className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            {sortOrder === "asc" ? "↑ Croissant" : "↓ Décroissant"}
                          </Button>

                          <div className="ml-auto">
                            <Badge variant="secondary" className="text-sm">
                              {getFilteredAndSortedResumes().length} / {profileResults[activeProfileTab]?.length || 0} résultats
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Candidate Cards (Full Version) */}
                  <div className="space-y-4">
                    {getFilteredAndSortedResumes().map((resume) => (
                      <Card key={resume.id} className={`hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out bg-gray-900 border-gray-700 ${compareMode && selectedForCompare.has(resume.id) ? 'ring-2 ring-yellow-400 shadow-yellow-400/50' : ''}`}>
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            {compareMode && (
                              <div className="mr-4 pt-1">
                                <input
                                  type="checkbox"
                                  checked={selectedForCompare.has(resume.id)}
                                  onChange={() => toggleSelectForCompare(resume.id)}
                                  className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500 cursor-pointer"
                                  disabled={!selectedForCompare.has(resume.id) && selectedForCompare.size >= 4}
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                  <h3 className="text-lg font-semibold text-white">{resume.name}</h3>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Badge className={getMatchBadgeStyle(resume.matchScore)}>
                                          {resume.matchScore}% correspondance
                                        </Badge>
                                      </TooltipTrigger>
                                      <TooltipContent className="bg-gray-800 text-white border-gray-600">
                                        <div className="space-y-1">
                                          <p className="font-semibold">{getMatchCategory(resume.matchScore)}</p>
                                          <p className="text-xs text-gray-300">
                                            {resume.matchScore >= 90 && "Candidat idéal pour le poste"}
                                            {resume.matchScore >= 80 && resume.matchScore < 90 && "Excellent candidat, quelques compétences mineures manquantes"}
                                            {resume.matchScore >= 70 && resume.matchScore < 80 && "Bon candidat avec une formation nécessaire"}
                                            {resume.matchScore >= 60 && resume.matchScore < 70 && "Candidat partiel, gaps importants à combler"}
                                            {resume.matchScore < 60 && "Candidat ne correspondant pas aux critères principaux"}
                                          </p>
                                        </div>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </div>

                                <button
                                  onClick={() => toggleFavorite(resume.id)}
                                  data-favorite-id={resume.id}
                                  className="text-2xl hover:scale-110 transition-all duration-200 ease-in-out"
                                >
                                  {favorites.includes(resume.id) ? (
                                    <Star className="w-6 h-6 fill-yellow-500 text-yellow-500 drop-shadow-lg" />
                                  ) : (
                                    <Star className="w-6 h-6 text-gray-500 hover:text-yellow-500 transition-colors" />
                                  )}
                                </button>
                              </div>

                              <div className="flex items-center space-x-2 mb-3">
                                <p className="text-white">{resume.title}</p>
                                <Badge className={`text-xs ${getGradeBadgeStyle(resume.grade)} border`}>
                                  {resume.grade}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div className="flex items-center space-x-2 text-sm text-white">
                                  <CheckCircle className="w-4 h-4" />
                                  <span>{resume.availability}</span>
                                </div>
                              </div>

                              <div className="space-y-2">
                                {resume.reasoning && (
                                  <div className="mb-4 p-4 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-2 border-blue-500/50 rounded-lg">
                                    <Label className="text-base font-bold text-white mb-2 block">Analyse IA</Label>
                                    <p className="text-sm text-gray-100 leading-relaxed font-medium">{resume.reasoning}</p>
                                  </div>
                                )}

                                <div>
                                  <Label className="text-sm font-medium text-white">Compétences Principales</Label>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {resume.matchingSkills && resume.matchingSkills.length > 0 ? (
                                      resume.matchingSkills.map((skill) => (
                                        <Badge key={skill} variant="outline" className="text-xs text-white bg-green-900 border-green-600">
                                          ✓ {skill}
                                        </Badge>
                                      ))
                                    ) : (
                                      resume.skills.slice(0, 6).map((skill) => (
                                        <Badge key={skill} variant="outline" className="text-xs text-white">
                                          {skill}
                                        </Badge>
                                      ))
                                    )}
                                    {resume.skills.length > 6 && !resume.matchingSkills && (
                                      <Badge variant="outline" className="text-xs text-white">
                                        +{resume.skills.length - 6} autres
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                {resume.missingSkills && resume.missingSkills.length > 0 && (
                                  <div>
                                    <Label className="text-sm font-medium text-white">
                                      Compétences Manquantes ({resume.missingSkills.length})
                                    </Label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {resume.missingSkills.map((skill) => (
                                        <Badge key={skill} variant="outline" className="text-xs text-white bg-red-900 border-red-600">
                                          ✗ {skill}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {resume.sectors && resume.sectors.length > 0 && (
                                  <div>
                                    <Label className="text-sm font-medium text-white">
                                      Secteurs d'Activité ({resume.sectors.length})
                                    </Label>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {resume.sectors.map((sector) => (
                                        <Badge key={sector} variant="outline" className="text-xs text-white bg-purple-900 border-purple-500">
                                          🏢 {sector}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div>
                                  <Label className="text-sm font-medium text-white">Certifications</Label>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {resume.certifications.slice(0, 2).map((cert) => (
                                      <Badge key={cert} variant="secondary" className="text-xs">
                                        <Award className="w-3 h-3 mr-1" />
                                        {cert}
                                      </Badge>
                                    ))}
                                    {resume.certifications.length > 2 && (
                                      <Badge variant="secondary" className="text-xs">
                                        +{resume.certifications.length - 2} autres
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons Column */}
                            <div className="flex flex-col space-y-2 ml-4">
                              <Badge className={`text-xs ${getMatchCategoryStyle(resume.matchScore)} border`}>
                                {getMatchCategory(resume.matchScore)}
                              </Badge>

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    onClick={() => setSelectedResume(resume)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                  >
                                    <Eye className="w-4 h-4 mr-2" />
                                    Voir Détails
                                  </Button>
                                </DialogTrigger>
                                <ResumeDetailDialog
                                  resume={resume}
                                  getMatchBadgeStyle={getMatchBadgeStyle}
                                  shareProfile={shareProfile}
                                />
                              </Dialog>

                              <Button 
                                size="sm"
                                onClick={() => shareProfile(resume)}
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                <Share2 className="w-4 h-4 mr-2" />
                                Partager
                              </Button>
                              
                              <Button 
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700 text-white"
                              >
                                <FileText className="w-4 h-4 mr-2" />
                                View CV
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Standard Single-Profile Results */}
          {hasResults && Object.keys(profileResults).length === 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div>
                    <h2 className="text-xl font-semibold text-white">Résultats du Matching</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{matchedResumes.length} candidats au total</Badge>
                      {favorites.length > 0 && (
                        <Badge className="bg-yellow-600 text-white">
                          ⭐ {favorites.length} favori{favorites.length > 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Bouton Information sur le Matching */}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowMatchingInfoDialog(true)}
                          className={`relative h-9 w-9 p-0 rounded-full bg-gradient-to-br from-yellow-500/30 to-yellow-600/30 hover:from-yellow-500/50 hover:to-yellow-600/50 text-yellow-400 border-2 border-yellow-400/70 hover:border-yellow-400 shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/60 transition-all duration-300 hover:scale-110 ${showInfoButtonAnimation ? 'animate-pulse hover:animate-none' : ''}`}
                        >
                          <HelpCircle className="w-5 h-5" />
                          {/* Cercle d'animation */}
                          {showInfoButtonAnimation && (
                            <span className="absolute inset-0 rounded-full border-2 border-yellow-400/50 animate-ping" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="bg-yellow-500 text-gray-900 border-yellow-400">
                        <p className="font-semibold">💡 Comment fonctionne le matching ?</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="bg-red-600/20 text-red-300 border-red-500/50 hover:bg-red-600/30 hover:text-red-200 hover:border-red-400 whitespace-nowrap"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Réinitialiser
                </Button>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Favorites Filter Button */}
                  <Button
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    size="sm"
                    variant="outline"
                    className={showFavoritesOnly 
                      ? "bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-500" 
                      : "bg-gray-800 hover:bg-gray-700 text-white border-gray-600"
                    }
                  >
                    <Star className={`w-4 h-4 mr-2 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                    {showFavoritesOnly ? "Tous les candidats" : "Favoris uniquement"}
                  </Button>
                  
                  {/* Export Button with Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-green-600 hover:bg-green-700 text-white border-green-500"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Exporter
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={exportToCSV}>
                        <FileDown className="w-4 h-4 mr-2" />
                        Export CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={exportToExcel}>
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Export Excel
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  {/* Compare Button */}
                  <Button
                    onClick={toggleCompareMode}
                    size="sm"
                    className={compareMode 
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-black font-semibold shadow-lg shadow-yellow-500/50 border-0" 
                      : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 font-semibold"
                    }
                  >
                    {compareMode ? (
                      <>
                        <span className="mr-1">✓</span> Mode Comparaison Actif
                      </>
                    ) : (
                      <>
                        <span className="mr-1">⚖️</span> Comparer des Profils
                      </>
                    )}
                  </Button>

                  {/* Analytics Button */}
                  <Button
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    size="sm"
                    variant="outline"
                    className={showAnalytics 
                      ? "bg-purple-600 hover:bg-purple-700 text-white border-purple-500" 
                      : "bg-gray-800 hover:bg-gray-700 text-white border-gray-600"
                    }
                  >
                    <Award className="w-4 h-4 mr-2" />
                    {showAnalytics ? "Masquer" : "Afficher"} Statistiques
                  </Button>
                </div>
              </div>

              {matchingSummary && (
                <div className="mb-4 p-5 bg-gradient-to-r from-blue-900/60 to-purple-900/60 border-2 border-blue-400 rounded-lg shadow-lg">
                  <h3 className="text-lg font-bold text-white mb-3">Analyse IA - Vue d'Ensemble</h3>
                  <p className="text-base text-white leading-relaxed font-medium">{matchingSummary}</p>
                </div>
              )}

              {/* Analytics & Visualizations Section */}
              {showAnalytics && (
                <Card className="bg-gray-900 border-gray-700 mb-4">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      📊 Visualisations & Analyses Statistiques
                    </h3>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* 1. Score Distribution Bar Chart */}
                      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          📊 Distribution des Scores
                        </h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={prepareScoreDistributionData()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                              dataKey="range" 
                              tick={{ fill: '#e5e7eb', fontSize: 12 }}
                            />
                            <YAxis 
                              tick={{ fill: '#e5e7eb', fontSize: 12 }}
                              label={{ value: 'Nombre de candidats', angle: -90, position: 'insideLeft', fill: '#e5e7eb' }}
                            />
                            <RechartsTooltip 
                              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#000' }}
                              labelStyle={{ color: '#000' }}
                            />
                            <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                              {prepareScoreDistributionData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={
                                  entry.min >= 80 ? '#10b981' :
                                  entry.min >= 60 ? '#f59e0b' : '#ef4444'
                                } />
                              ))}
                              <LabelList dataKey="count" position="top" fill="#fff" />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                        <p className="text-sm text-gray-400 mt-2 text-center">
                          Répartition des candidats par tranche de score
                        </p>
                      </div>

                      {/* 2. Experience vs Score Scatter */}
                      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          💼 Expérience vs Score
                        </h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                              dataKey="experience" 
                              name="Expérience" 
                              unit=" ans"
                              tick={{ fill: '#e5e7eb', fontSize: 12 }}
                              label={{ value: 'Années d\'expérience', position: 'insideBottom', offset: -5, fill: '#e5e7eb' }}
                            />
                            <YAxis 
                              dataKey="score" 
                              name="Score" 
                              unit="%"
                              tick={{ fill: '#e5e7eb', fontSize: 12 }}
                              label={{ value: 'Score (%)', angle: -90, position: 'insideLeft', fill: '#e5e7eb' }}
                            />
                            <RechartsTooltip 
                              cursor={{ strokeDasharray: '3 3' }}
                              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#000' }}
                              labelStyle={{ color: '#000' }}
                              formatter={(value: any, name: string) => {
                                if (name === 'Score') return [`${value}%`, 'Score']
                                if (name === 'Expérience') return [`${value} ans`, 'Expérience']
                                return [value, name]
                              }}
                            />
                            <Scatter name="Candidats" data={prepareExperienceVsScoreData()} fill="#8b5cf6">
                              {prepareExperienceVsScoreData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Scatter>
                          </ScatterChart>
                        </ResponsiveContainer>
                        <p className="text-sm text-gray-400 mt-2 text-center">
                          Corrélation entre l'expérience et le score de matching
                        </p>
                      </div>

                      {/* 3. Experience Timeline */}
                      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          ⏱️ Timeline des Expériences
                        </h4>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart 
                            data={prepareExperienceTimelineData()} 
                            layout="vertical"
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                              type="number" 
                              tick={{ fill: '#e5e7eb', fontSize: 12 }}
                              label={{ value: 'Années d\'expérience', position: 'insideBottom', offset: -5, fill: '#e5e7eb' }}
                            />
                            <YAxis 
                              type="category" 
                              dataKey="name" 
                              tick={{ fill: '#e5e7eb', fontSize: 12 }}
                              width={100}
                            />
                            <RechartsTooltip 
                              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#000' }}
                              labelStyle={{ color: '#000' }}
                              formatter={(value: any, name: string) => {
                                if (name === 'years') return [`${value} ans`, 'Expérience']
                                if (name === 'score') return [`${value}%`, 'Score']
                                return [value, name]
                              }}
                            />
                            <Bar dataKey="years" fill="#6366f1" radius={[0, 8, 8, 0]}>
                              {prepareExperienceTimelineData().map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={
                                  entry.score >= 80 ? '#10b981' :
                                  entry.score >= 70 ? '#f59e0b' : '#ef4444'
                                } />
                              ))}
                              <LabelList dataKey="years" position="right" fill="#fff" formatter={(value: number) => `${value} ans`} />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                        <p className="text-sm text-gray-400 mt-2 text-center">
                          Top candidats classés par années d'expérience
                        </p>
                      </div>

                      {/* 4. Skills Matrix - Text-based */}
                      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                        <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                          🎯 Matrice des Compétences (Top 5)
                        </h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-gray-700">
                                <th className="text-left text-gray-400 p-2">Compétence</th>
                                {getFilteredAndSortedResumes().slice(0, 5).map((resume, idx) => (
                                  <th key={idx} className="text-center text-gray-400 p-2 text-xs">
                                    {resume.name.split(' ')[0]}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {Array.from(new Set(
                                getFilteredAndSortedResumes()
                                  .slice(0, 5)
                                  .flatMap(r => [...(r.matchingSkills || []), ...(r.missingSkills || [])])
                              )).slice(0, 12).map((skill, skillIdx) => (
                                <tr key={skillIdx} className="border-b border-gray-700/50">
                                  <td className="text-white p-2 font-medium">{skill}</td>
                                  {getFilteredAndSortedResumes().slice(0, 5).map((resume, resumeIdx) => {
                                    const hasSkill = resume.matchingSkills?.includes(skill)
                                    const missingSkill = resume.missingSkills?.includes(skill)
                                    return (
                                      <td key={resumeIdx} className="text-center p-2">
                                        {hasSkill ? (
                                          <span className="text-2xl text-green-500">✓</span>
                                        ) : missingSkill ? (
                                          <span className="text-2xl text-red-500">✗</span>
                                        ) : (
                                          <span className="text-gray-600">−</span>
                                        )}
                                      </td>
                                    )
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="text-sm text-gray-400 mt-2 text-center">
                          ✓ = Compétence présente | ✗ = Compétence manquante
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Filters and Sorting Section */}
              <Card className="bg-gray-900 border-gray-700 mb-4">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-4">
                    {/* First Row: Filters */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-300">Filtres :</span>
                      </div>
                      
                      {/* Score Filter */}
                      <div className="flex items-center gap-2">
                        <Label htmlFor="score-filter" className="text-sm text-gray-400">Score min:</Label>
                        <Select
                          value={resultFilters.minScore.toString()}
                          onValueChange={(value) => setResultFilters({...resultFilters, minScore: parseInt(value)})}
                        >
                          <SelectTrigger id="score-filter" className="w-32 h-9 bg-gray-800 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Tous</SelectItem>
                            <SelectItem value="60">60%+</SelectItem>
                            <SelectItem value="70">70%+</SelectItem>
                            <SelectItem value="80">80%+</SelectItem>
                            <SelectItem value="90">90%+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Sector Filter */}
                      <div className="flex items-center gap-2">
                        <Label htmlFor="sector-filter" className="text-sm text-gray-400">Secteur:</Label>
                        <Select
                          value={resultFilters.sector || "all"}
                          onValueChange={(value) => setResultFilters({...resultFilters, sector: value === "all" ? "" : value})}
                        >
                          <SelectTrigger id="sector-filter" className="w-40 h-9 bg-gray-800 border-gray-600 text-white">
                            <SelectValue placeholder="Tous" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            {getAvailableSectors().map((sector) => (
                              <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Skill Search */}
                      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                        <Label htmlFor="skill-filter" className="text-sm text-gray-400">Compétence:</Label>
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input
                            id="skill-filter"
                            type="text"
                            placeholder="Rechercher une compétence..."
                            value={resultFilters.searchSkill}
                            onChange={(e) => setResultFilters({...resultFilters, searchSkill: e.target.value})}
                            className="w-full h-9 pl-10 pr-3 rounded-md bg-gray-800 border border-gray-600 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {/* TACE Filter */}
                      <div className="flex items-center gap-2">
                        <Label htmlFor="tace-filter" className="text-sm text-gray-400">TACE min:</Label>
                        <Select
                          value={resultFilters.minTace.toString()}
                          onValueChange={(value) => setResultFilters({...resultFilters, minTace: parseInt(value)})}
                        >
                          <SelectTrigger id="tace-filter" className="w-32 h-9 bg-gray-800 border-gray-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0">Tous</SelectItem>
                            <SelectItem value="70">70%+</SelectItem>
                            <SelectItem value="80">80%+</SelectItem>
                            <SelectItem value="90">90%+</SelectItem>
                            <SelectItem value="95">95%+</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Clear Filters */}
                      {(resultFilters.minScore > 0 || resultFilters.sector || resultFilters.searchSkill || resultFilters.minTace > 0) && (
                        <Button
                          onClick={() => setResultFilters({ minScore: 0, sector: "", searchSkill: "", minTace: 0 })}
                          size="sm"
                          variant="outline"
                          className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                        >
                          Réinitialiser
                        </Button>
                      )}
                    </div>

                    {/* Second Row: Sorting */}
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-700">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-semibold text-gray-300">Trier par :</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => setSortBy("score")}
                          size="sm"
                          variant={sortBy === "score" ? "default" : "outline"}
                          className={sortBy === "score" 
                            ? "bg-blue-600 hover:bg-blue-700 text-white" 
                            : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                          }
                        >
                          Score
                        </Button>
                        <Button
                          onClick={() => setSortBy("experience")}
                          size="sm"
                          variant={sortBy === "experience" ? "default" : "outline"}
                          className={sortBy === "experience" 
                            ? "bg-blue-600 hover:bg-blue-700 text-white" 
                            : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                          }
                        >
                          Expérience
                        </Button>
                        <Button
                          onClick={() => setSortBy("name")}
                          size="sm"
                          variant={sortBy === "name" ? "default" : "outline"}
                          className={sortBy === "name" 
                            ? "bg-blue-600 hover:bg-blue-700 text-white" 
                            : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                          }
                        >
                          Nom
                        </Button>
                      </div>

                      <Button
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                        size="sm"
                        variant="outline"
                        className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        {sortOrder === "asc" ? "↑ Croissant" : "↓ Décroissant"}
                      </Button>

                      <div className="ml-auto">
                        <Badge variant="secondary" className="text-sm">
                          {getFilteredAndSortedResumes().length} / {matchedResumes.length} résultats
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* No results message */}
              {getFilteredAndSortedResumes().length === 0 && (
                <Card className="bg-gray-900 border-gray-700">
                  <CardContent className="p-8 text-center">
                    <Filter className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                    <h3 className="text-lg font-medium mb-2 text-white">Aucun résultat trouvé</h3>
                    <p className="text-gray-400 mb-4">
                      Aucun candidat ne correspond aux filtres sélectionnés.
                    </p>
                    <Button
                      onClick={() => setResultFilters({ minScore: 0, sector: "", searchSkill: "", minTace: 0 })}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Réinitialiser les filtres
                    </Button>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {(() => {
                  const allResults = getFilteredAndSortedResumes()
                  const totalPages = Math.ceil(allResults.length / itemsPerPage)
                  const startIndex = (currentPage - 1) * itemsPerPage
                  const endIndex = startIndex + itemsPerPage
                  const paginatedResults = allResults.slice(startIndex, endIndex)
                  
                  return paginatedResults.map((resume) => (
                  <Card key={resume.id} className={`hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-in-out bg-gray-900 border-gray-700 ${compareMode && selectedForCompare.has(resume.id) ? 'ring-2 ring-yellow-400 shadow-yellow-400/50' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        {compareMode && (
                          <div className="mr-4 pt-1">
                            <input
                              type="checkbox"
                              checked={selectedForCompare.has(resume.id)}
                              onChange={() => toggleSelectForCompare(resume.id)}
                              className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-yellow-500 focus:ring-yellow-500 cursor-pointer"
                              disabled={!selectedForCompare.has(resume.id) && selectedForCompare.size >= 4}
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <h3 className="text-lg font-semibold text-white">{resume.name}</h3>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge className={getMatchBadgeStyle(resume.matchScore)}>
                                      {resume.matchScore}% correspondance
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-gray-800 text-white border-gray-600">
                                    <div className="space-y-1">
                                      <p className="font-semibold">{getMatchCategory(resume.matchScore)}</p>
                                      <p className="text-xs text-gray-300">
                                        {resume.matchScore >= 90 && "Candidat idéal pour le poste"}
                                        {resume.matchScore >= 80 && resume.matchScore < 90 && "Excellent candidat, quelques compétences mineures manquantes"}
                                        {resume.matchScore >= 70 && resume.matchScore < 80 && "Bon candidat avec une formation nécessaire"}
                                        {resume.matchScore >= 60 && resume.matchScore < 70 && "Candidat partiel, gaps importants à combler"}
                                        {resume.matchScore < 60 && "Candidat ne correspondant pas aux critères principaux"}
                                      </p>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>

                            {/* Favorite Button with Animation */}
                            <button
                              onClick={() => toggleFavorite(resume.id)}
                              data-favorite-id={resume.id}
                              className="text-2xl hover:scale-110 transition-all duration-200 ease-in-out"
                            >
                              {favorites.includes(resume.id) ? (
                                <Star className="w-6 h-6 fill-yellow-500 text-yellow-500 drop-shadow-lg" />
                              ) : (
                                <Star className="w-6 h-6 text-gray-500 hover:text-yellow-500 transition-colors" />
                              )}
                            </button>
                          </div>

                          <div className="flex items-center space-x-2 mb-3">
                            <p className="text-white">{resume.title}</p>
                            <Badge className={`text-xs ${getGradeBadgeStyle(resume.grade)} border`}>
                              {resume.grade}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="flex items-center space-x-2 text-sm text-white">
                              <CheckCircle className="w-4 h-4" />
                              <span>{resume.availability}</span>
                            </div>
                            {resume.tace !== undefined && (
                              <div className="flex items-center space-x-2 text-sm">
                                <Activity className="w-4 h-4 text-gray-400" />
                                <span className={`font-semibold ${
                                  resume.tace >= 90 ? 'text-green-400' :
                                  resume.tace >= 1 ? 'text-yellow-400' :
                                  'text-red-400'
                                }`}>
                                  TACE: {resume.tace}%
                                </span>
                              </div>
                            )}
                          </div>

                          <div className="space-y-2">
                            {resume.reasoning && (
                              <div className="mb-4 p-4 bg-gradient-to-r from-blue-900/40 to-purple-900/40 border-2 border-blue-500/50 rounded-lg">
                                <Label className="text-base font-bold text-white mb-2 block">Analyse IA</Label>
                                <p className="text-sm text-gray-100 leading-relaxed font-medium">{resume.reasoning}</p>
                              </div>
                            )}

                            <div>
                              <Label className="text-sm font-medium text-white">Compétences Principales</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {resume.matchingSkills && resume.matchingSkills.length > 0 ? (
                                  resume.matchingSkills.map((skill) => (
                                    <Badge key={skill} variant="outline" className="text-xs text-white bg-green-900 border-green-600">
                                      ✓ {skill}
                                    </Badge>
                                  ))
                                ) : (
                                  resume.skills.slice(0, 6).map((skill) => (
                                    <Badge key={skill} variant="outline" className="text-xs text-white">
                                      {skill}
                                    </Badge>
                                  ))
                                )}
                                {resume.skills.length > 6 && !resume.matchingSkills && (
                                  <Badge variant="outline" className="text-xs text-white">
                                    +{resume.skills.length - 6} autres
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {resume.missingSkills && resume.missingSkills.length > 0 && (
                              <div>
                                <Label className="text-sm font-medium text-white">
                                  Compétences Manquantes ({resume.missingSkills.length})
                                </Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {resume.missingSkills.map((skill) => (
                                    <Badge key={skill} variant="outline" className="text-xs text-white bg-red-900 border-red-600">
                                      ✗ {skill}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {resume.sectors && resume.sectors.length > 0 && (
                              <div>
                                <Label className="text-sm font-medium text-white">
                                  Secteurs d'Activité ({resume.sectors.length})
                                </Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {resume.sectors.map((sector) => (
                                    <Badge key={sector} variant="outline" className="text-xs text-white bg-purple-900 border-purple-500">
                                      🏢 {sector}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div>
                              <Label className="text-sm font-medium text-white">Certifications</Label>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {resume.certifications.slice(0, 2).map((cert) => (
                                  <Badge key={cert} variant="secondary" className="text-xs">
                                    <Award className="w-3 h-3 mr-1" />
                                    {cert}
                                  </Badge>
                                ))}
                                {resume.certifications.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{resume.certifications.length - 2} autres
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col space-y-2 ml-4">
                          <Badge className={`text-xs ${getMatchCategoryStyle(resume.matchScore)} border`}>
                            {getMatchCategory(resume.matchScore)}
                          </Badge>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                size="sm" 
                                onClick={() => setSelectedResume(resume)}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Voir Détails
                              </Button>
                            </DialogTrigger>
                            <ResumeDetailDialog
                              resume={resume}
                              getMatchBadgeStyle={getMatchBadgeStyle}
                              shareProfile={shareProfile}
                            />
                          </Dialog>

                          <Button 
                            size="sm"
                            onClick={() => shareProfile(resume)}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            Partager
                          </Button>
                          
                          <Button 
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View CV
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
                })()}
              </div>

              {/* Pagination Controls */}
              {(() => {
                const allResults = getFilteredAndSortedResumes()
                const totalPages = Math.ceil(allResults.length / itemsPerPage)
                
                if (totalPages <= 1) return null
                
                return (
                  <Card className="bg-gray-900 border-gray-700 mt-6">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        {/* Informations de pagination */}
                        <div className="text-sm text-gray-400">
                          Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, allResults.length)} sur {allResults.length} résultats
                        </div>
                        
                        {/* Contrôles de pagination */}
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            size="sm"
                            variant="outline"
                            className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            « Premier
                          </Button>
                          
                          <Button
                            onClick={() => setCurrentPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            size="sm"
                            variant="outline"
                            className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            ‹ Précédent
                          </Button>
                          
                          {/* Numéros de page */}
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                              let pageNum
                              if (totalPages <= 5) {
                                pageNum = i + 1
                              } else if (currentPage <= 3) {
                                pageNum = i + 1
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i
                              } else {
                                pageNum = currentPage - 2 + i
                              }
                              
                              return (
                                <Button
                                  key={pageNum}
                                  onClick={() => setCurrentPage(pageNum)}
                                  size="sm"
                                  className={currentPage === pageNum
                                    ? "bg-yellow-600 hover:bg-yellow-700 text-white border-0 min-w-[36px]"
                                    : "bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-600 min-w-[36px]"
                                  }
                                >
                                  {pageNum}
                                </Button>
                              )
                            })}
                          </div>
                          
                          <Button
                            onClick={() => setCurrentPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            size="sm"
                            variant="outline"
                            className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Suivant ›
                          </Button>
                          
                          <Button
                            onClick={() => setCurrentPage(totalPages)}
                            disabled={currentPage === totalPages}
                            size="sm"
                            variant="outline"
                            className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Dernier »
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })()}
            </div>
          )}
          </div> 
        </div>
      )}

      {/* Floating Compare Button */}
      {compareMode && selectedForCompare.size >= 2 && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom">
          <Button
            onClick={openCompareModal}
            size="lg"
            className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-black shadow-2xl shadow-yellow-500/50 px-8 py-6 text-lg font-semibold"
          >
            ⚖️ Comparer {selectedForCompare.size} profils
          </Button>
        </div>
      )}

      {/* Comparison Modal */}
      <Dialog open={showCompareModal} onOpenChange={(open) => {
        setShowCompareModal(open)
        if (!open) {
          setHiddenRadars(new Set())
        }
      }}>
        <ComparisonModal
          selectedResumes={getSelectedResumes()}
          hiddenRadars={hiddenRadars}
          onLegendClick={handleLegendClick}
          onExportPDF={exportComparisonToPDF}
          onClose={() => {
            setShowCompareModal(false)
            setHiddenRadars(new Set())
          }}
          onFinishComparison={() => {
            setShowCompareModal(false)
            setCompareMode(false)
            setSelectedForCompare(new Set())
            setHiddenRadars(new Set())
          }}
          getMatchBadgeStyle={getMatchBadgeStyle}
          getMatchCategory={getMatchCategory}
          prepareRadarData={prepareRadarData}
        />
      </Dialog>

      {/* Profile Validation Modal */}
      <Dialog open={showProfileValidation} onOpenChange={setShowProfileValidation}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              {isMultiProfile ? '🎯 Profils Multiples Détectés' : '🎯 Profil Détecté'}
            </DialogTitle>
            <div className="flex items-center justify-between">
              <DialogDescription>
                {isMultiProfile 
                  ? `${detectedProfiles.length} profils différents ont été identifiés dans votre appel d'offres`
                  : 'Un profil a été identifié dans votre appel d\'offres'
                }
              </DialogDescription>
              {detectedProfiles.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (selectedProfiles.size === detectedProfiles.length) {
                      // Deselect all
                      setSelectedProfiles(new Set())
                    } else {
                      // Select all
                      const allIds = new Set<string>(detectedProfiles.map(p => p.id))
                      setSelectedProfiles(allIds)
                    }
                  }}
                  className="text-blue-600 hover:text-blue-700"
                >
                  {selectedProfiles.size === detectedProfiles.length ? '◻ Tout désélectionner' : '☑ Tout sélectionner'}
                </Button>
              )}
            </div>
          </DialogHeader>

          {/* Bandeau informatif pour mono-profil */}
          {(!isMultiProfile || detectedProfiles.length === 1) && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Info className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-yellow-800 mb-1">
                    💡 Conseil : Passez en Recrutement Individuel
                  </h3>
                  <p className="text-sm text-yellow-700">
                    Un seul profil a été détecté. Pour une recherche plus rapide et directe, nous vous recommandons d'utiliser le mode 
                    <span className="font-semibold"> "Recrutement Individuel" </span> 
                    au lieu de l'appel d'offres complexe.
                  </p>
                  <p className="text-xs text-yellow-600 mt-2">
                    L'appel d'offres complexe est optimisé pour constituer des équipes avec plusieurs rôles différents (ex: Architecte + Développeurs + DevOps).
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {detectedProfiles.map((profile, index) => (
              <Card 
                key={profile.id} 
                className={`border-2 transition-all ${
                  selectedProfiles.has(profile.id) 
                    ? 'border-blue-400 bg-blue-50' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    {/* Checkbox */}
                    <div className="flex items-center pt-1">
                      <input
                        type="checkbox"
                        checked={selectedProfiles.has(profile.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedProfiles)
                          if (e.target.checked) {
                            newSelected.add(profile.id)
                          } else {
                            newSelected.delete(profile.id)
                          }
                          setSelectedProfiles(newSelected)
                        }}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>

                    {/* Profile Info */}
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                        <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm">
                          {index + 1}
                        </span>
                        {profile.title}
                        {profile.estimated_count > 1 && (
                          <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                            ×{profile.estimated_count} {profile.estimated_count > 1 ? 'personnes' : 'personne'}
                          </Badge>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{profile.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {/* Required Skills */}
                    <div>
                      <Label className="font-semibold text-black mb-2 block">
                        ✅ Compétences Requises ({profile.required_skills.length})
                      </Label>
                      <div className="flex flex-wrap gap-1">
                        {profile.required_skills.map((skill, idx) => (
                          <Badge key={idx} className="bg-green-100 text-green-800 border-green-300">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Nice to Have */}
                    <div>
                      <Label className="font-semibold text-black mb-2 block">
                        💡 Compétences Bonus ({profile.nice_to_have.length})
                      </Label>
                      <div className="flex flex-wrap gap-1">
                        {profile.nice_to_have.map((skill, idx) => (
                          <Badge key={idx} className="bg-blue-100 text-blue-800 border-blue-300">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Responsibilities */}
                    {profile.responsibilities && profile.responsibilities.length > 0 && (
                      <div className="col-span-2">
                        <Label className="font-semibold text-black mb-2 block">
                          📋 Responsabilités
                        </Label>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                          {profile.responsibilities.map((resp, idx) => (
                            <li key={idx}>{resp}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Experience */}
                    <div>
                      <Label className="font-semibold text-black mb-2 block">
                        ⏱️ Expérience Minimum
                      </Label>
                      <Badge className="bg-purple-100 text-purple-800 border-purple-300">
                        {profile.min_experience} {profile.min_experience > 1 ? 'ans' : 'an'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setShowProfileValidation(false)}
              >
                Annuler
              </Button>
              <span className="text-sm text-gray-600">
                {selectedProfiles.size} profil{selectedProfiles.size > 1 ? 's' : ''} sélectionné{selectedProfiles.size > 1 ? 's' : ''}
              </span>
            </div>
            <Button
              onClick={() => {
                if (selectedProfiles.size === 0) {
                  toast.warning("Aucun profil sélectionné", {
                    description: "Veuillez sélectionner au moins un profil à matcher"
                  })
                  return
                }
                handleStartMatchingAllProfiles()
              }}
              disabled={selectedProfiles.size === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white disabled:opacity-50"
            >
              🚀 Lancer le Matching ({selectedProfiles.size})
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal d'avertissement multi-profils */}
      <Dialog open={showMultiProfileWarning} onOpenChange={setShowMultiProfileWarning}>
        <DialogContent className="max-w-2xl bg-white text-black">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-blue-900">
              <Info className="w-6 h-6 text-blue-600" />
              Template Multi-Profils Détecté
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Vous avez sélectionné un template d'appel d'offres multi-profils
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Message principal */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">
                    💡 Conseil : Utilisez l'Appel d'Offres Complexe
                  </h3>
                  <p className="text-sm text-blue-800">
                    Le template "<span className="font-semibold">{selectedTemplate}</span>" contient plusieurs profils distincts. 
                    Pour une analyse optimale, nous vous recommandons d'utiliser le bouton 
                    <span className="font-semibold"> "Détecter les profils (Multi)" </span> 
                    qui analysera et matcha chaque profil séparément.
                  </p>
                </div>
              </div>
            </div>

            {/* Comparaison des approches */}
            <div className="grid grid-cols-2 gap-4">
              {/* Option recommandée */}
              <div className="border-2 border-green-500 bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-900">Recommandé : Appel d'Offres Complexe</h4>
                </div>
                <ul className="space-y-2 text-sm text-green-800">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Détection automatique de tous les profils</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Matching séparé pour chaque rôle</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-0.5">✓</span>
                    <span>Résultats organisés par profil</span>
                  </li>
                </ul>
              </div>

              {/* Option alternative */}
              <div className="border-2 border-yellow-500 bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-yellow-600" />
                  <h4 className="font-semibold text-yellow-900">Recrutement Individuel</h4>
                </div>
                <ul className="space-y-2 text-sm text-yellow-800">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-0.5">•</span>
                    <span>Traite tous les profils comme un seul</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-0.5">•</span>
                    <span>Résultats moins précis</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-600 mt-0.5">•</span>
                    <span>Mélange les candidats de différents rôles</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowMultiProfileWarning(false)
                }}
                className="text-gray-700"
              >
                Annuler
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowMultiProfileWarning(false)
                    // Continuer en recrutement individuel
                    setSelectedTemplate(null)
                    handleStartMatching()
                  }}
                  className="bg-yellow-50 border-yellow-500 text-yellow-700 hover:bg-yellow-100"
                >
                  Continuer en Recrutement Individuel
                </Button>
                <Button
                  onClick={() => {
                    setShowMultiProfileWarning(false)
                    // Lancer la détection multi-profils
                    handleAnalyzeTender()
                  }}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
                >
                  Détecter les profils (Recommandé)
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmation de Changement de Mode */}
      <Dialog open={showModeChangeDialog} onOpenChange={setShowModeChangeDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Info className="w-5 h-5 text-yellow-500" />
              Changer de type de recherche ?
            </DialogTitle>
            <DialogDescription className="text-gray-400 mt-2">
              Vous avez déjà saisi une description. Que souhaitez-vous faire ?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* Preview du mode cible */}
            <div className={`p-4 rounded-lg border ${
              pendingMode === "simple" 
                ? "bg-blue-900/20 border-blue-700/50" 
                : "bg-purple-900/20 border-purple-700/50"
            }`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-md ${
                  pendingMode === "simple" ? "bg-blue-600/20" : "bg-purple-600/20"
                }`}>
                  {pendingMode === "simple" ? (
                    <Target className="w-5 h-5 text-blue-400" />
                  ) : (
                    <Layers className="w-5 h-5 text-purple-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-semibold mb-1">
                    {pendingMode === "simple" ? "Recrutement Individuel" : "Appel d'Offres Complexe"}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {pendingMode === "simple" 
                      ? "Pour un seul poste à pourvoir" 
                      : "Pour constituer une équipe complète"}
                  </p>
                </div>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-2">
              <p className="text-sm text-gray-300 font-medium">Choisissez une option :</p>
              
              <Button
                onClick={() => confirmModeChange(false)}
                className="w-full justify-start bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
                variant="outline"
              >
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                <div className="text-left">
                  <div className="font-semibold text-sm">Conserver le texte</div>
                  <div className="text-xs text-gray-400">Changer uniquement le mode de recherche</div>
                </div>
              </Button>

              <Button
                onClick={() => confirmModeChange(true)}
                className="w-full justify-start bg-gray-800 hover:bg-gray-700 text-white border border-gray-600"
                variant="outline"
              >
                <RotateCcw className="w-4 h-4 mr-2 text-orange-500" />
                <div className="text-left">
                  <div className="font-semibold text-sm">Effacer et recommencer</div>
                  <div className="text-xs text-gray-400">Supprimer le texte et changer de mode</div>
                </div>
              </Button>

              <Button
                onClick={cancelModeChange}
                className="w-full justify-center bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600"
                variant="outline"
              >
                <X className="w-4 h-4 mr-2" />
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Panneau d'Historique */}
      <Dialog open={showHistoryPanel} onOpenChange={setShowHistoryPanel}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Clock className="w-6 h-6 text-purple-500" />
                Historique des recherches
              </DialogTitle>
              {searchHistory.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllHistory}
                  className="bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/30 hover:border-red-500/50 transition-all"
                >
                  <X className="w-4 h-4 mr-2" />
                  Tout effacer
                </Button>
              )}
            </div>
            <DialogDescription className="text-gray-400 mt-2">
              Consultez et restaurez vos recherches précédentes
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-3">
            {searchHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="w-16 h-16 text-gray-700 mb-4" />
                <p className="text-gray-400 text-lg mb-2">Aucun historique</p>
                <p className="text-gray-500 text-sm">
                  Vos recherches seront sauvegardées automatiquement après chaque matching
                </p>
              </div>
            ) : (
              searchHistory.map((entry) => (
                <Card key={entry.id} className="bg-gray-800/50 border-gray-700 hover:border-purple-500/50 transition-all">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icône et date */}
                      <div className="flex flex-col items-center gap-2 min-w-[80px]">
                        <div className={`p-3 rounded-lg ${
                          entry.searchMode === "simple" 
                            ? "bg-blue-600/20 text-blue-400" 
                            : "bg-purple-600/20 text-purple-400"
                        }`}>
                          {entry.searchMode === "simple" ? (
                            <Target className="w-5 h-5" />
                          ) : (
                            <Layers className="w-5 h-5" />
                          )}
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-400">
                            {new Date(entry.timestamp).toLocaleDateString('fr-FR', { 
                              day: '2-digit', 
                              month: 'short' 
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(entry.timestamp).toLocaleTimeString('fr-FR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={
                              entry.searchMode === "simple" 
                                ? "bg-blue-600 text-white" 
                                : "bg-purple-600 text-white"
                            }>
                              {entry.searchMode === "simple" ? "Recrutement Individuel" : "Appel d'Offres Complexe"}
                            </Badge>
                            {entry.selectedTemplate && (
                              <Badge variant="outline" className="text-gray-400 border-gray-600">
                                {entry.selectedTemplate}
                              </Badge>
                            )}
                            {entry.profilesCount && (
                              <Badge variant="outline" className="text-purple-400 border-purple-600">
                                {entry.profilesCount} profil{entry.profilesCount > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Description tronquée */}
                        <p className="text-sm text-gray-300 mb-3 line-clamp-2">
                          {entry.tenderText.substring(0, 150)}
                          {entry.tenderText.length > 150 && "..."}
                        </p>

                        {/* Résultats */}
                        <div className="flex items-center gap-4 text-xs text-gray-400 mb-3">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{entry.resultsCount} candidat{entry.resultsCount > 1 ? 's' : ''}</span>
                          </div>
                          {entry.topMatches.length > 0 && (
                            <div className="flex items-center gap-1">
                              <Award className="w-3 h-3 text-yellow-400" />
                              <span>Top: {entry.topMatches[0].score}%</span>
                            </div>
                          )}
                        </div>

                        {/* Top matches */}
                        {entry.topMatches.length > 0 && (
                          <div className="bg-gray-900/50 rounded p-2 mb-3">
                            <p className="text-xs text-gray-500 mb-1">Meilleurs matchs :</p>
                            <div className="space-y-1">
                              {entry.topMatches.map((match, idx) => (
                                <div key={idx} className="flex items-center justify-between text-xs">
                                  <span className="text-gray-300 truncate">
                                    {idx + 1}. {match.name}
                                  </span>
                                  <div className="flex items-center gap-2 ml-2">
                                    <span className="text-gray-500 text-[10px]">{match.title}</span>
                                    <Badge className="bg-green-600/20 text-green-400 text-[10px] px-1.5 py-0">
                                      {match.score}%
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Filtres actifs */}
                        {(entry.filters.location || entry.filters.availability || entry.filters.minExperience || 
                          entry.filters.sectors.length > 0 || entry.filters.skills.length > 0) && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs text-gray-500">Filtres:</span>
                            {entry.filters.location && (
                              <Badge variant="outline" className="text-xs text-gray-400 border-gray-700">
                                📍 {entry.filters.location}
                              </Badge>
                            )}
                            {entry.filters.minExperience && (
                              <Badge variant="outline" className="text-xs text-gray-400 border-gray-700">
                                ⏱️ {entry.filters.minExperience}+ ans
                              </Badge>
                            )}
                            {entry.filters.sectors.length > 0 && (
                              <Badge variant="outline" className="text-xs text-gray-400 border-gray-700">
                                🏢 {entry.filters.sectors.length} secteur{entry.filters.sectors.length > 1 ? 's' : ''}
                              </Badge>
                            )}
                            {entry.filters.skills.length > 0 && (
                              <Badge variant="outline" className="text-xs text-gray-400 border-gray-700">
                                💡 {entry.filters.skills.length} compétence{entry.filters.skills.length > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() => restoreSearchFromHistory(entry)}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <RotateCcw className="w-4 h-4 mr-2" />
                          Restaurer
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteHistoryEntry(entry.id)}
                          className="bg-gray-700/30 text-gray-400 hover:bg-red-500/20 hover:text-red-400 border border-gray-600/30 hover:border-red-500/50 transition-all"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog d'Information sur le Matching */}
      <Dialog open={showMatchingInfoDialog} onOpenChange={setShowMatchingInfoDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Info className="w-7 h-7 text-blue-500" />
              Comment fonctionne le Matching IA ?
            </DialogTitle>
            <DialogDescription className="text-gray-400 mt-2">
              Découvrez notre méthodologie d'analyse et de calcul des scores de correspondance
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            {/* Section 1: Vue d'ensemble */}
            <Card className="bg-gray-800/50 border-gray-700 overflow-hidden">
              <CardContent className="p-0">
                {/* Header avec icône */}
                <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6 border-b border-yellow-400/30">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg border border-yellow-400/30">
                      <Sparkles className="w-6 h-6 text-yellow-400" />
                    </div>
                    🎯 Vue d'Ensemble
                  </h3>
                </div>
                
                {/* Contenu principal */}
                <div className="p-6 space-y-5">
                  {/* Technologie principale */}
                  <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-900/80 to-gray-800/80 rounded-lg border border-yellow-400/20">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
                        <Zap className="w-8 h-8 text-gray-900" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Propulsé par</p>
                      <h4 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                        Llama 3.3
                      </h4>
                      <p className="text-xs text-gray-500">via Groq - IA de dernière génération</p>
                    </div>
                  </div>

                  {/* Caractéristiques clés */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-4 bg-gray-900/50 rounded-lg border border-gray-600">
                      <Target className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-white">Analyse Sémantique</p>
                      <p className="text-xs text-gray-500 mt-1">Compréhension profonde</p>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-900/50 rounded-lg border border-gray-600">
                      <CheckCircle className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-white">Matching Précis</p>
                      <p className="text-xs text-gray-500 mt-1">Algorithme optimisé</p>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-900/50 rounded-lg border border-gray-600">
                      <BarChart3 className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-white">Score 0-100%</p>
                      <p className="text-xs text-gray-500 mt-1">Évaluation claire</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-300 leading-relaxed text-center">
                    Notre IA analyse en profondeur chaque CV et le compare intelligemment à votre appel d'offres 
                    pour générer un <span className="text-yellow-400 font-semibold">score de correspondance précis et explicable</span>.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Processus d'analyse */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6" />
                  ⚙️ Processus d'Analyse
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Extraction & Parsing</h4>
                      <p className="text-sm text-gray-400">
                        Le CV est analysé pour extraire les compétences techniques, certifications, expérience, formations et secteurs d'activité.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">2</div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Analyse Sémantique de l'Appel d'Offres</h4>
                      <p className="text-sm text-gray-400">
                        L'IA identifie les compétences requises, le niveau d'expérience attendu et le contexte métier de votre recherche.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">3</div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Matching Multi-Critères</h4>
                      <p className="text-sm text-gray-400">
                        Comparaison intelligente entre le profil du candidat et les exigences du poste sur plusieurs dimensions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-600 text-white flex items-center justify-center font-bold">4</div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">Génération du Score & Recommandations</h4>
                      <p className="text-sm text-gray-400">
                        Calcul du score final avec identification des compétences correspondantes, manquantes et recommandations de formations.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Critères de matching */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6" />
                  📊 Critères de Matching
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-900/50 rounded-lg border border-green-500/30">
                    <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      Compétences Techniques (40%)
                    </h4>
                    <p className="text-sm text-gray-400">
                      Correspondance exacte et sémantique des technologies, frameworks et outils. 
                      L'IA reconnaît les synonymes (ex: "JS" = "JavaScript").
                    </p>
                  </div>

                  <div className="p-4 bg-gray-900/50 rounded-lg border border-blue-500/30">
                    <h4 className="font-semibold text-blue-400 mb-2 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Expérience (25%)
                    </h4>
                    <p className="text-sm text-gray-400">
                      Années d'expérience, niveau de séniorité et pertinence des postes précédents 
                      par rapport au rôle recherché.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-900/50 rounded-lg border border-purple-500/30">
                    <h4 className="font-semibold text-purple-400 mb-2 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Formations & Certifications (20%)
                    </h4>
                    <p className="text-sm text-gray-400">
                      Diplômes, certifications professionnelles et formations continues alignées 
                      avec les prérequis du poste.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-900/50 rounded-lg border border-yellow-500/30">
                    <h4 className="font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Contexte & Secteur (15%)
                    </h4>
                    <p className="text-sm text-gray-400">
                      Expérience dans des secteurs similaires, taille d'entreprise et contexte 
                      métier (startup, corporate, consulting, etc.).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Interprétation des scores */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-purple-400 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  🎓 Guide d'Interprétation des Scores
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-900/30 to-green-900/30 rounded-lg border-l-4 border-green-500">
                    <Badge className="bg-green-600 text-white text-lg px-3 py-1">90-100%</Badge>
                    <div>
                      <p className="font-semibold text-green-400">🌟 Excellent Match</p>
                      <p className="text-xs text-gray-400">Profil parfaitement aligné. Toutes les compétences clés sont présentes. Recommandé pour entretien immédiat.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-lg border-l-4 border-blue-500">
                    <Badge className="bg-blue-600 text-white text-lg px-3 py-1">80-89%</Badge>
                    <div>
                      <p className="font-semibold text-blue-400">✅ Très Bon Match</p>
                      <p className="text-xs text-gray-400">Compétences principales présentes avec quelques gaps mineurs. L'expérience compense. Très bon candidat.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg border-l-4 border-yellow-500">
                    <Badge className="bg-yellow-600 text-white text-lg px-3 py-1">70-79%</Badge>
                    <div>
                      <p className="font-semibold text-yellow-400">🔶 Bon Potentiel</p>
                      <p className="text-xs text-gray-400">Fondamentaux solides avec formations nécessaires. Peut monter en compétence rapidement.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-lg border-l-4 border-orange-500">
                    <Badge className="bg-orange-600 text-white text-lg px-3 py-1">&lt;70%</Badge>
                    <div>
                      <p className="font-semibold text-orange-400">⚠️ Gaps Significatifs</p>
                      <p className="text-xs text-gray-400">Plusieurs compétences clés manquantes. Formations importantes requises. À évaluer avec précaution.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 5: Avantages */}
            <Card className="bg-gray-800/50 border-gray-700 overflow-hidden">
              <CardContent className="p-0">
                {/* Header avec icône */}
                <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-6 border-b border-yellow-400/30">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg border border-yellow-400/30">
                      <Lightbulb className="w-6 h-6 text-yellow-400" />
                    </div>
                    💡 Avantages de notre IA
                  </h3>
                </div>
                
                {/* Contenu principal */}
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Avantage 1 */}
                    <div className="group relative p-5 bg-gray-900/50 rounded-xl border border-gray-600 hover:border-yellow-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center border border-yellow-400/30 group-hover:scale-110 transition-transform group-hover:bg-yellow-500/20">
                            <CheckCircle className="w-6 h-6 text-yellow-400" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-base mb-2">Analyse Contextuelle</h4>
                          <p className="text-sm text-gray-400 leading-relaxed">
                            Comprend le contexte au-delà des mots-clés exacts pour une évaluation plus précise
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Avantage 2 */}
                    <div className="group relative p-5 bg-gray-900/50 rounded-xl border border-gray-600 hover:border-yellow-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center border border-yellow-400/30 group-hover:scale-110 transition-transform group-hover:bg-yellow-500/20">
                            <Target className="w-6 h-6 text-yellow-400" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-base mb-2">Matching Sémantique</h4>
                          <p className="text-sm text-gray-400 leading-relaxed">
                            Reconnaît les équivalences et synonymes entre les compétences
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Avantage 3 */}
                    <div className="group relative p-5 bg-gray-900/50 rounded-xl border border-gray-600 hover:border-yellow-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center border border-yellow-400/30 group-hover:scale-110 transition-transform group-hover:bg-yellow-500/20">
                            <Sparkles className="w-6 h-6 text-yellow-400" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-base mb-2">Recommandations Actionnables</h4>
                          <p className="text-sm text-gray-400 leading-relaxed">
                            Formations précises et ciblées pour combler les gaps identifiés
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Avantage 4 */}
                    <div className="group relative p-5 bg-gray-900/50 rounded-xl border border-gray-600 hover:border-yellow-400/60 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center border border-yellow-400/30 group-hover:scale-110 transition-transform group-hover:bg-yellow-500/20">
                            <Info className="w-6 h-6 text-yellow-400" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-base mb-2">Raisonnement Explicable</h4>
                          <p className="text-sm text-gray-400 leading-relaxed">
                            Justification claire et transparente de chaque score calculé
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end mt-6 pt-4 border-t border-gray-700">
            <Button onClick={() => setShowMatchingInfoDialog(false)} className="bg-blue-600 hover:bg-blue-700">
              J'ai compris
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Configuration des Pondérations */}
      <Dialog open={showWeightsDialog} onOpenChange={setShowWeightsDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Settings className="w-7 h-7 text-yellow-500" />
              Personnaliser la Pondération
            </DialogTitle>
            <DialogDescription className="text-gray-400 mt-2">
              Ajustez l'importance de chaque critère dans le calcul du score de correspondance
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-6 pr-2">
            {/* Explication */}
            <div className="p-4 bg-blue-900/30 border border-blue-500/50 rounded-lg">
              <p className="text-sm text-gray-300">
                <strong className="text-blue-400">Note :</strong> Les pondérations doivent totaliser 100%. 
                Ajustez les curseurs pour définir l'importance relative de chaque critère.
              </p>
            </div>

            {/* Total Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Total :</span>
                <span className={`font-bold ${
                  matchingWeights.technicalSkills + matchingWeights.experience + matchingWeights.training + matchingWeights.context === 100
                    ? 'text-green-400'
                    : 'text-orange-400'
                }`}>
                  {matchingWeights.technicalSkills + matchingWeights.experience + matchingWeights.training + matchingWeights.context}%
                </span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    matchingWeights.technicalSkills + matchingWeights.experience + matchingWeights.training + matchingWeights.context === 100
                      ? 'bg-green-500'
                      : 'bg-orange-500'
                  }`}
                  style={{ 
                    width: `${Math.min(matchingWeights.technicalSkills + matchingWeights.experience + matchingWeights.training + matchingWeights.context, 100)}%` 
                  }}
                />
              </div>
            </div>

            {/* Compétences Techniques */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-blue-400" />
                  <span className="font-semibold text-white">Compétences Techniques</span>
                </div>
                <span className="text-lg font-bold text-blue-400">{matchingWeights.technicalSkills}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={matchingWeights.technicalSkills}
                onChange={(e) => setMatchingWeights({...matchingWeights, technicalSkills: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <p className="text-xs text-gray-400">
                Technologies, langages, frameworks, outils maîtrisés
              </p>
            </div>

            {/* Expérience */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-400" />
                  <span className="font-semibold text-white">Expérience Professionnelle</span>
                </div>
                <span className="text-lg font-bold text-purple-400">{matchingWeights.experience}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={matchingWeights.experience}
                onChange={(e) => setMatchingWeights({...matchingWeights, experience: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <p className="text-xs text-gray-400">
                Années d'expérience, projets similaires, rôles occupés
              </p>
            </div>

            {/* Formations & Certifications */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-green-400" />
                  <span className="font-semibold text-white">Formations & Certifications</span>
                </div>
                <span className="text-lg font-bold text-green-400">{matchingWeights.training}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={matchingWeights.training}
                onChange={(e) => setMatchingWeights({...matchingWeights, training: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
              <p className="text-xs text-gray-400">
                Diplômes, certifications professionnelles, formations continues
              </p>
            </div>

            {/* Contexte & Secteur */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-yellow-400" />
                  <span className="font-semibold text-white">Contexte & Secteur</span>
                </div>
                <span className="text-lg font-bold text-yellow-400">{matchingWeights.context}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={matchingWeights.context}
                onChange={(e) => setMatchingWeights({...matchingWeights, context: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
              <p className="text-xs text-gray-400">
                Secteur d'activité, taille des projets, environnement métier
              </p>
            </div>

            {/* Presets rapides */}
            <div className="pt-4 border-t border-gray-700">
              <p className="text-sm font-semibold text-gray-300 mb-3">Presets rapides :</p>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setMatchingWeights({ technicalSkills: 40, experience: 30, training: 20, context: 10 })}
                  variant="outline"
                  size="sm"
                  className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-yellow-500"
                >
                  ⚖️ Équilibré (défaut)
                </Button>
                <Button
                  onClick={() => setMatchingWeights({ technicalSkills: 60, experience: 20, training: 15, context: 5 })}
                  variant="outline"
                  size="sm"
                  className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-blue-500"
                >
                  💻 Focus Technique
                </Button>
                <Button
                  onClick={() => setMatchingWeights({ technicalSkills: 25, experience: 50, training: 15, context: 10 })}
                  variant="outline"
                  size="sm"
                  className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-purple-500"
                >
                  📊 Focus Expérience
                </Button>
                <Button
                  onClick={() => setMatchingWeights({ technicalSkills: 30, experience: 25, training: 35, context: 10 })}
                  variant="outline"
                  size="sm"
                  className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-green-500"
                >
                  🎓 Focus Formation
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
            <Button 
              onClick={() => setMatchingWeights({ technicalSkills: 40, experience: 30, training: 20, context: 10 })} 
              variant="outline"
              className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Réinitialiser
            </Button>
            <Button 
              onClick={() => setShowWeightsDialog(false)} 
              disabled={matchingWeights.technicalSkills + matchingWeights.experience + matchingWeights.training + matchingWeights.context !== 100}
              className="bg-yellow-600 hover:bg-yellow-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {matchingWeights.technicalSkills + matchingWeights.experience + matchingWeights.training + matchingWeights.context === 100
                ? '✓ Appliquer les Pondérations'
                : '⚠️ Total doit être 100%'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-t border-gray-700 mt-16">
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Colonne 1 : À propos */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Resume Matchmaker</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Plateforme IA de matching intelligent entre profils candidats et appels d'offres. 
                Optimisez vos recrutements avec l'intelligence artificielle.
              </p>
            </div>

            {/* Colonne 2 : Fonctionnalités */}
            <div>
              <h3 className="text-white font-semibold mb-4">Fonctionnalités</h3>
              <ul className="space-y-2">
                <li className="text-gray-400 text-sm hover:text-white transition-colors cursor-pointer">
                  Recrutement Individuel
                </li>
                <li className="text-gray-400 text-sm hover:text-white transition-colors cursor-pointer">
                  Appel d'Offres Complexe
                </li>
                <li className="text-gray-400 text-sm hover:text-white transition-colors cursor-pointer">
                  Analyse IA Enrichie
                </li>
                <li className="text-gray-400 text-sm hover:text-white transition-colors cursor-pointer">
                  Comparaison de Profils
                </li>
              </ul>
            </div>

            {/* Colonne 3 : Technologies */}
            <div>
              <h3 className="text-white font-semibold mb-4">Technologies</h3>
              <ul className="space-y-2">
                <li className="text-gray-400 text-sm">
                  Next.js 14 & React
                </li>
                <li className="text-gray-400 text-sm">
                  Llama 3.3 AI
                </li>
                <li className="text-gray-400 text-sm">
                  TypeScript & Tailwind CSS
                </li>
                <li className="text-gray-400 text-sm">
                  Shadcn UI Components
                </li>
              </ul>
            </div>

            {/* Colonne 4 : Contact & Info */}
            <div>
              <h3 className="text-white font-semibold mb-4">Informations</h3>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Version : 1.0.0</p>
                <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
                <div className="flex items-center gap-3 mt-4">
                  <a 
                    href="https://github.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                  <a 
                    href="https://linkedin.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-700 mt-8 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Resume Matchmaker by EY. Propulsé par l'IA (Llama 3.3). Tous droits réservés.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Conçu pour optimiser le recrutement IT avec l'intelligence artificielle
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
