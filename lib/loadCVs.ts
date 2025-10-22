import fs from 'fs'
import path from 'path'

interface RealCV {
  nom: string
  poste: string
  email?: string
  telephone?: string
  profil: {
    description: string
    formation?: string
  }
  competences: {
    langages?: string[]
    outils?: string[]
    ia_ml?: string[]
    themes?: string[]
    bases_de_donnees?: string[]
    methodologies?: string[]
    langues?: string[]
  }
  experiences_professionnelles: Array<{
    titre: string
    description: string
  }>
  formations_certifications?: {
    certifications?: string[]
    formations?: string[]
    formations_terminees?: string[]
    formations_en_cours?: string[]
  }
}

export interface CandidateCV {
  name: string
  job_title: string
  skills: string[]
  years_experience: number
  sectors?: string[]
  email?: string
  phone?: string
  description?: string
  formation?: string
  experiences?: Array<{
    title: string
    description: string
  }>
  formations_certifications?: {
    certifications?: string[]
    formations?: string[]
    formations_terminees?: string[]
    formations_en_cours?: string[]
  }
}

// Helper function to extract sectors from experience titles
function extractSectorsFromExperiences(experiences: Array<{titre: string, description: string}>): string[] {
  const sectors = new Set<string>()
  
  for (const exp of experiences) {
    // Extract sector from title (before first dash or comma)
    const match = exp.titre.match(/^([^–\-,]+)/)
    if (match) {
      const sector = match[1].trim()
      // Only add if it looks like a real sector (not too long, not a full sentence)
      if (sector.length > 0 && sector.length < 50 && !sector.includes('(')) {
        sectors.add(sector)
      }
    }
  }
  
  return Array.from(sectors)
}

export function loadRealCVs(): CandidateCV[] {
  const cvsDirectory = path.join(process.cwd(), 'CVs')
  
  // Check if directory exists
  if (!fs.existsSync(cvsDirectory)) {
    console.warn('CVs directory not found, using empty array')
    return []
  }

  const files = fs.readdirSync(cvsDirectory)
  const jsonFiles = files.filter(file => file.endsWith('.json'))

  const cvs: CandidateCV[] = []

  for (const file of jsonFiles) {
    try {
      const filePath = path.join(cvsDirectory, file)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const realCV: RealCV = JSON.parse(fileContent)

      // Extract all skills from various competence categories
      const skills: string[] = []
      
      if (realCV.competences.langages) skills.push(...realCV.competences.langages)
      if (realCV.competences.outils) skills.push(...realCV.competences.outils)
      if (realCV.competences.ia_ml) skills.push(...realCV.competences.ia_ml)
      if (realCV.competences.themes) skills.push(...realCV.competences.themes)
      if (realCV.competences.bases_de_donnees) skills.push(...realCV.competences.bases_de_donnees)
      if (realCV.competences.methodologies) skills.push(...realCV.competences.methodologies)

      // Extract sectors from professional experiences
      const sectors = extractSectorsFromExperiences(realCV.experiences_professionnelles)

      // Estimate years of experience from number of professional experiences
      // Average 1.5 years per experience (rough estimate)
      const years_experience = Math.round(realCV.experiences_professionnelles.length * 1.5)

      const transformedCV: CandidateCV = {
        name: realCV.nom,
        job_title: realCV.poste,
        skills: skills,
        years_experience: Math.max(years_experience, 1), // At least 1 year
        sectors: sectors,
        email: realCV.email,
        phone: realCV.telephone,
        description: realCV.profil.description,
        formation: realCV.profil.formation,
        experiences: realCV.experiences_professionnelles.map(exp => ({
          title: exp.titre,
          description: exp.description
        })),
        formations_certifications: realCV.formations_certifications
      }

      cvs.push(transformedCV)
    } catch (error) {
      console.error(`Error loading CV ${file}:`, error)
    }
  }

  return cvs
}
