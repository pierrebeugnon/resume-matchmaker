import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

// Initialize Groq client (same pattern as match/route.ts)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Groq model configuration (same as other routes)
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

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

interface AnalysisResponse {
  is_multiple: boolean
  total_profiles_needed: number
  confidence: number
  reasoning: string
  profiles: DetectedProfile[]
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.tender_text || body.tender_text.trim() === '') {
      return NextResponse.json(
        { error: 'tender_text is required' },
        { status: 400 }
      )
    }

    let analysisResult: AnalysisResponse

    try {
      console.log(`Using Groq model: ${GROQ_MODEL} pour analyser l'AO`)
      analysisResult = await analyzeWithGroq(body.tender_text)
    } catch (groqError) {
      console.error('Erreur Groq:', groqError)
      return NextResponse.json(
        { error: 'Erreur lors de l\'analyse. Vérifiez votre configuration Groq.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(analysisResult)
  } catch (error) {
    console.error('Error in analyze-tender API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function analyzeWithGroq(tenderText: string): Promise<AnalysisResponse> {
  const systemPrompt = `Tu es un expert RH spécialisé en staffing IT et analyse d'appels d'offres.

Ta mission : Analyser un appel d'offres (AO) ou une description de mission et identifier TOUS les profils/rôles nécessaires.

MÉTHODOLOGIE D'ANALYSE :

1. DÉTECTER SI MONO-PROFIL OU MULTI-PROFILS :
   
   Indicateurs MULTI-PROFILS :
   - Plusieurs rôles/titres de postes mentionnés explicitement
   - Énumérations de profils (ex: "1. Architecte, 2. Développeur")
   - Mots-clés : "équipe de X personnes", "profils variés", "constitution d'équipe"
   - Compétences incompatibles pour une seule personne (ex: "Architecture AWS + Développement COBOL mainframe")
   - Volumétrie importante impliquant plusieurs ressources (ex: "50To de données à migrer")
   
   Indicateurs MONO-PROFIL :
   - Vocabulaire au singulier cohérent ("Le candidat", "Votre mission")
   - Un seul job title clair
   - Compétences cohérentes pour une personne

2. EXTRACTION DES PROFILS :
   - Si profils explicitement cités → les extraire directement
   - Si seulement mission/tâches décrites → DÉDUIRE les profils nécessaires depuis les tâches
   
3. POUR CHAQUE PROFIL IDENTIFIER :
   - Titre du poste
   - Description des responsabilités
   - Compétences techniques REQUISES
   - Compétences BONUS (nice to have)
   - Niveau d'expérience minimum estimé
   - Nombre de personnes nécessaires (1 ou plus selon volumétrie)

4. DÉDUCTION INTELLIGENTE :
   Exemples de tâches → profils :
   - "Conception architecture cloud" → Architecte Cloud
   - "Développement APIs REST" → Développeur Backend
   - "Migration 50To données" → 2+ Data Engineers (volumétrie)
   - "Pipeline CI/CD" → DevOps Engineer
   - "Conformité RGPD" → Security/Compliance Engineer
   - "Coordination stakeholders" → Chef de Projet/PO
   - "Formation équipes" → Formateur Technique

Format de sortie STRICT (JSON uniquement) :
{
  "is_multiple": true/false,
  "total_profiles_needed": number,
  "confidence": 0-100,
  "reasoning": "Explication courte de la détection en français",
  "profiles": [
    {
      "id": "profile-1",
      "title": "Titre exact du poste",
      "description": "Description courte des responsabilités",
      "required_skills": ["Compétence1", "Compétence2"],
      "nice_to_have": ["CompétenceBonus1"],
      "min_experience": 5,
      "responsibilities": ["Responsabilité 1", "Responsabilité 2"],
      "estimated_count": 1
    }
  ]
}

RÈGLES IMPORTANTES :
- Si UN SEUL profil détecté → is_multiple = false, total_profiles_needed = 1
- Si PLUSIEURS profils détectés → is_multiple = true, total_profiles_needed = X
- Confidence élevé (90-100) si indicateurs clairs, moyen (60-89) si déduction, faible (<60) si ambigu
- Toujours en français
- Retourne UNIQUEMENT du JSON valide, pas de texte avant/après`

  const userPrompt = `Analyse cet appel d'offres et identifie tous les profils nécessaires :

${tenderText}

Détermine :
1. S'agit-il d'un seul profil ou de plusieurs profils distincts ?
2. Quels sont les profils nécessaires (soit explicitement cités, soit déduits des tâches) ?
3. Pour chaque profil : titre, compétences requises, compétences bonus, expérience, responsabilités

Réponds UNIQUEMENT avec du JSON au format spécifié.`

  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    max_tokens: 2500,
    temperature: 0.3,
  })
  
  let responseText = response.choices[0]?.message?.content || ''
  responseText = responseText.trim()
  
  // Try to extract JSON from the response (same pattern as match/route.ts)
  const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (codeBlockMatch) {
    responseText = codeBlockMatch[1].trim()
  } else {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      responseText = jsonMatch[0]
    }
  }
  
  try {
    const analysisResult: AnalysisResponse = JSON.parse(responseText)
    
    // Validate the response structure
    if (!analysisResult.profiles || !Array.isArray(analysisResult.profiles)) {
      throw new Error('Invalid response structure')
    }
    
    // Generate IDs if not present
    analysisResult.profiles = analysisResult.profiles.map((profile, index) => ({
      ...profile,
      id: profile.id || `profile-${index + 1}`
    }))
    
    return analysisResult
  } catch (parseError) {
    console.error('Failed to parse Groq response:', responseText)
    console.error('Parse error:', parseError)
    throw new Error('Invalid JSON response from Groq')
  }
}
