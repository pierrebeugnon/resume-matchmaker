import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import type { MatchingRequest, MatchingResponse } from '@/lib/types'

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Groq model configuration
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

export async function POST(request: NextRequest) {
  try {
    const body: MatchingRequest = await request.json()
    
    // Validate input
    if (!body.job_offer || !body.cv_list || body.cv_list.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: job_offer and cv_list are required' },
        { status: 400 }
      )
    }

    let matchingResult: MatchingResponse

    try {
      console.log(`Using Groq model: ${GROQ_MODEL}`)
      matchingResult = await matchWithGroq(body)
    } catch (groqError) {
      console.error('Groq error:', groqError)
      return NextResponse.json(
        { error: 'Erreur lors du matching. Vérifiez votre configuration Groq.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(matchingResult)
  } catch (error) {
    console.error('Error in matching API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function matchWithGroq(body: MatchingRequest): Promise<MatchingResponse> {
  const systemPrompt = getSystemPrompt()
  const userPrompt = buildLLMPrompt(body)
  
  // Use Groq chat completion API
  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `${userPrompt}\n\nRappel : Retourne UNIQUEMENT du JSON valide dans le format exact spécifié, sans autre texte. Toutes les explications en français.` }
    ],
    max_tokens: 2000,
    temperature: 0.3,
  })
  
  // Extract the response text
  let responseText = response.choices[0]?.message?.content || ''
  responseText = responseText.trim()
  
  // Try to extract JSON from the response (in case it's wrapped in markdown code blocks)
  const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
  if (codeBlockMatch) {
    responseText = codeBlockMatch[1].trim()
  } else {
    // Try to extract JSON object directly
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      responseText = jsonMatch[0]
    }
  }
  
  try {
    const matchingResult: MatchingResponse = JSON.parse(responseText)
    
    // Validate the response structure
    if (!matchingResult.results || !Array.isArray(matchingResult.results)) {
      throw new Error('Invalid response structure')
    }
    
    return matchingResult
  } catch (parseError) {
    console.error('Failed to parse Groq response:', responseText)
    console.error('Parse error:', parseError)
    throw new Error('Invalid JSON response from Groq')
  }
}

function getSystemPrompt(): string {
  return `Tu es un assistant spécialisé dans le matching entre des appels d'offres (AO) et des profils de candidats (CVs).
L'objectif est d'aider une application de recrutement à recommander les meilleurs profils de candidats pour une offre d'emploi donnée.

Tâche :
Analyser l'offre d'emploi fournie et la liste des CVs candidats pour attribuer à chaque candidat un score de pertinence et une explication courte EN FRANÇAIS.

Critères de matching principaux :
- Titre du poste recherché dans l'AO
- Compétences techniques et fonctionnelles
- Années d'expérience (pertinence par rapport au poste)
- Secteurs d'activité (expérience dans des secteurs pertinents est un plus)

Format de sortie attendu (JSON) :
{
  "results": [
    {
      "candidate_name": "Prénom Nom",
      "relevance_score": 0-100,
      "reasoning": "Explication brève du score en français : adéquation du poste, compétences, expérience, secteurs.",
      "matching_skills": ["compétence1", "compétence2", "compétence3"],
      "missing_skills": ["compétence4", "compétence5"],
      "sectors": ["Secteur1", "Secteur2"]
    }
  ],
  "summary": "Aperçu court des meilleurs candidats et insights clés en français"
}

Règles supplémentaires :
- Ne jamais inventer de données non trouvées dans les CVs.
- Toujours expliquer EN FRANÇAIS la logique derrière chaque score.
- Prendre en compte les secteurs d'activité dans l'évaluation (bonus si pertinent pour le poste).
- La réponse doit être uniquement du JSON valide (pas de texte en dehors du JSON).
- Toutes les explications (reasoning, summary) doivent être rédigées en français.`
}

function buildLLMPrompt(request: MatchingRequest): string {
  return `Analyse l'offre d'emploi suivante et les CVs des candidats :

Offre d'Emploi :
- Titre : ${request.job_offer.title}
- Description : ${request.job_offer.description}
- Compétences Requises : ${request.job_offer.required_skills.join(', ')}
- Expérience Minimale : ${request.job_offer.min_experience} ans

Candidats :
${request.cv_list.map((cv, index) => `
${index + 1}. ${cv.name}
   - Poste : ${cv.job_title}
   - Compétences : ${cv.skills.join(', ')}
   - Années d'Expérience : ${cv.years_experience}
   - Secteurs d'activité : ${cv.sectors && cv.sectors.length > 0 ? cv.sectors.join(', ') : 'Non spécifié'}
`).join('\n')}

Fournis une analyse de matching au format JSON spécifié. Prends en compte les secteurs d'activité dans ton évaluation. N'oublie pas : toutes les explications doivent être EN FRANÇAIS.`
}
