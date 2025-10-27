import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import type { MatchingRequest, MatchingResponse, CandidateCV, MatchingResult } from '@/lib/types'

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Groq model configuration
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

export async function POST(request: NextRequest) {
  try {
    const body: MatchingRequest = await request.json()
    
    console.log(`📥 API reçoit ${body.cv_list?.length || 0} CVs à analyser`)
    console.log(`📝 Poste: ${body.job_offer?.title}`)
    console.log(`🎯 Description (premiers 100 car): ${body.job_offer?.description?.substring(0, 100)}...`)
    
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
      
      // Traiter par batch de 5 CVs maximum pour éviter les limites de tokens
      const BATCH_SIZE = 5
      const batches: CandidateCV[][] = []
      
      for (let i = 0; i < body.cv_list.length; i += BATCH_SIZE) {
        batches.push(body.cv_list.slice(i, i + BATCH_SIZE))
      }
      
      console.log(`📦 Traitement en ${batches.length} batch(s) de max ${BATCH_SIZE} CVs`)
      
      // Traiter chaque batch
      const allResults: MatchingResult[] = []
      const batchSummaries: string[] = []
      
      for (let i = 0; i < batches.length; i++) {
        console.log(`   Batch ${i + 1}/${batches.length}: ${batches[i].length} CVs...`)
        
        const batchBody: MatchingRequest = {
          ...body,
          cv_list: batches[i]
        }
        
        const batchResult = await matchWithGroq(batchBody)
        allResults.push(...batchResult.results)
        if (batchResult.summary) {
          batchSummaries.push(batchResult.summary)
        }
      }
      
      // Dédupliquer les résultats (au cas où un candidat apparaît dans plusieurs batchs)
      const uniqueResults = new Map<string, MatchingResult>()
      allResults.forEach(result => {
        // Garder le meilleur score si duplicata
        const existing = uniqueResults.get(result.candidate_name)
        if (!existing || result.relevance_score > existing.relevance_score) {
          uniqueResults.set(result.candidate_name, result)
        }
      })
      
      const dedupedResults = Array.from(uniqueResults.values())
      
      // Générer un résumé qualitatif global
      const excellentCandidates = dedupedResults.filter(r => r.relevance_score >= 80)
      const goodCandidates = dedupedResults.filter(r => r.relevance_score >= 60 && r.relevance_score < 80)
      const moderateCandidates = dedupedResults.filter(r => r.relevance_score >= 40 && r.relevance_score < 60)
      
      let globalSummary = ''
      
      if (excellentCandidates.length > 0) {
        const topNames = excellentCandidates.slice(0, 3).map(c => c.candidate_name).join(', ')
        globalSummary += `🌟 Excellentes correspondances : ${excellentCandidates.length} candidat(s) avec un score supérieur à 80%. Les profils les plus pertinents sont ${topNames}. `
      }
      
      if (goodCandidates.length > 0) {
        globalSummary += `✅ Bonnes correspondances : ${goodCandidates.length} candidat(s) avec un score entre 60% et 80%, présentant des compétences solides avec quelques formations à prévoir. `
      }
      
      if (moderateCandidates.length > 0) {
        globalSummary += `⚠️ Correspondances modérées : ${moderateCandidates.length} candidat(s) avec un score entre 40% et 60%, nécessitant un accompagnement plus important. `
      }
      
      // Ajouter une analyse des compétences les plus demandées vs trouvées
      const allMatchingSkills = dedupedResults.flatMap(r => r.matching_skills || [])
      const skillCounts = allMatchingSkills.reduce((acc, skill) => {
        acc[skill] = (acc[skill] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const topSkills = Object.entries(skillCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([skill]) => skill)
      
      if (topSkills.length > 0) {
        globalSummary += `\n\n🔑 Compétences les plus représentées dans le pool : ${topSkills.join(', ')}.`
      }
      
      matchingResult = {
        results: dedupedResults,
        summary: globalSummary || `${dedupedResults.length} candidats analysés avec succès`
      }
      
      console.log(`✅ Total: ${allResults.length} résultats bruts → ${dedupedResults.length} candidats uniques analysés`)
      if (allResults.length > dedupedResults.length) {
        console.warn(`⚠️ ${allResults.length - dedupedResults.length} duplications détectées et supprimées`)
      }
      
      // Identifier les candidats manquants
      if (dedupedResults.length < body.cv_list.length) {
        console.warn(`\n⚠️ ${body.cv_list.length - dedupedResults.length} candidat(s) manquant(s) après traitement complet:`)
        body.cv_list.forEach(cv => {
          const found = dedupedResults.find(r => r.candidate_name === cv.name)
          if (!found) {
            console.warn(`   ❌ ${cv.name} (${cv.job_title}) - NON ANALYSÉ`)
          }
        })
      } else {
        console.log(`✅ Tous les ${body.cv_list.length} candidats ont été analysés avec succès!`)
      }
      
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
  const systemPrompt = getSystemPrompt(body.weights)
  const userPrompt = buildLLMPrompt(body)
  
  // Use Groq chat completion API
  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `${userPrompt}\n\nRappel : Retourne UNIQUEMENT du JSON valide dans le format exact spécifié, sans autre texte. Toutes les explications en français.` }
    ],
    max_tokens: 4000, // Augmenté pour traiter jusqu'à 10 CVs par batch
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
    
    // LOG DÉTAILLÉ pour debug
    console.log(`\n📊 API a reçu ${body.cv_list.length} CVs`)
    console.log(`✅ IA a retourné ${matchingResult.results.length} résultats\n`)
    console.log('=== MATCHING RESULTS DEBUG ===')
    matchingResult.results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.candidate_name}:`)
      console.log(`   Score: ${result.relevance_score}%`)
      console.log(`   Reasoning: ${result.reasoning}`)
      console.log(`   Matching skills: ${result.matching_skills?.join(', ') || 'none'}`)
      console.log(`   Missing skills: ${result.missing_skills?.join(', ') || 'none'}`)
    })
    console.log('=== END DEBUG ===\n')
    
    // Si l'IA n'a pas retourné tous les candidats
    if (matchingResult.results.length < body.cv_list.length) {
      console.warn(`⚠️ ATTENTION: L'IA n'a retourné que ${matchingResult.results.length}/${body.cv_list.length} candidats !`)
      console.warn(`   Candidats manquants dans la réponse de l'IA:`)
      body.cv_list.forEach(cv => {
        const found = matchingResult.results.find(r => r.candidate_name === cv.name)
        if (!found) {
          console.warn(`   - ${cv.name} (${cv.job_title})`)
        }
      })
    }
    
    return matchingResult
  } catch (parseError) {
    console.error('Failed to parse Groq response:', responseText)
    console.error('Parse error:', parseError)
    throw new Error('Invalid JSON response from Groq')
  }
}

function getSystemPrompt(weights?: { technicalSkills: number; experience: number; training: number; context: number }): string {
  // Utiliser les pondérations par défaut si non fournies
  const w = weights || { technicalSkills: 40, experience: 30, training: 20, context: 10 }
  
  return `Tu es un assistant expert en recrutement spécialisé dans le matching sémantique entre des appels d'offres (AO) et des profils de candidats (CVs).
L'objectif est d'aider une application de recrutement à recommander les meilleurs profils de candidats pour une offre d'emploi donnée en utilisant une analyse sémantique approfondie.

Tâche :
Analyser l'offre d'emploi fournie et la liste des CVs candidats pour attribuer à chaque candidat un score de pertinence et une explication courte EN FRANÇAIS.

IMPORTANT - MATCHING SÉMANTIQUE ET RECONNAISSANCE DES ÉQUIVALENCES :
Tu DOIS appliquer une analyse sémantique intelligente qui reconnaît :

1. **Rôles et Titres Équivalents/Connexes** :
   - "Data Engineer" ≈ "Data Architect", "Data Platform Engineer", "Analytics Engineer", "ML Engineer"
   - "DevOps Engineer" ≈ "SRE", "Platform Engineer", "Cloud Engineer", "Infrastructure Engineer"
   - "Full Stack Developer" ≈ "Software Engineer", "Web Developer", "Application Developer"
   - "Product Manager" ≈ "Product Owner", "Technical Product Manager"
   - Etc. (applique le même principe à tous les rôles)

2. **Compétences Techniques Équivalentes** :
   - Technologies de même famille : Python ≈ Java ≈ Go (langages backend)
   - Outils similaires : Terraform ≈ CloudFormation ≈ Pulumi (IaC)
   - Frameworks équivalents : React ≈ Vue ≈ Angular (frontend)
   - Bases de données : PostgreSQL ≈ MySQL ≈ Oracle (SQL), MongoDB ≈ Cassandra (NoSQL)
   - Cloud : AWS ≈ Azure ≈ GCP (compétences cloud transférables)

3. **Domaines et Concepts Connexes** :
   - "Data Mesh", "Domain-Driven Design", "Data Products" → concepts avancés de Data Engineering
   - "Kubernetes", "Docker", "Helm" → orchestration de containers
   - "CI/CD", "Jenkins", "GitLab CI" → DevOps practices
   - "dbt", "Airflow", "Dagster" → data orchestration

4. **Compétences Transférables** :
   - Un "Data Architect" avec dbt, Kafka, Kubernetes possède des compétences TRÈS pertinentes pour Data Engineer
   - Un "Senior Engineer" dans un domaine peut être pertinent pour un rôle similaire dans un autre
   - L'expérience dans des architectures complexes est valorisable

Critères de matching principaux (avec pondération PERSONNALISÉE) :
- **Compétences techniques** (${w.technicalSkills}%) : Matching sémantique des skills, technologies similaires, compétences transférables
- **Expérience professionnelle** (${w.experience}%) : Années d'expérience, projets similaires, rôles connexes
- **Formations & Certifications** (${w.training}%) : Diplômes pertinents, certifications valorisables
- **Contexte & Secteur** (${w.context}%) : Secteurs d'activité pertinents

IMPORTANT : Utilise EXACTEMENT ces pondérations (${w.technicalSkills}%/${w.experience}%/${w.training}%/${w.context}%) pour calculer le score final de chaque candidat.

RÈGLES DE SCORING :
- Ne JAMAIS attribuer 0% à un candidat qui a des compétences ou une expérience pertinentes
- Un score de 0% est UNIQUEMENT pour un profil totalement hors sujet (ex: un comptable pour un poste d'ingénieur logiciel)
- Même sans correspondance exacte du titre, un candidat avec des compétences techniques pertinentes mérite au minimum 40-50%
- Un candidat avec 50%+ des compétences requises et un rôle connexe devrait obtenir 60-80%
- Valoriser les architectures avancées et concepts modernes (Data Mesh, Microservices, Cloud Native, etc.)

Format de sortie attendu (JSON) :
{
  "results": [
    {
      "candidate_name": "Prénom Nom",
      "relevance_score": 0-100,
      "reasoning": "Explication brève du score en français : adéquation du poste, compétences (y compris équivalences sémantiques reconnues), expérience, secteurs.",
      "matching_skills": ["compétence1", "compétence2", "compétence3"],
      "missing_skills": ["compétence4", "compétence5"],
      "sectors": ["Secteur1", "Secteur2"]
    }
  ],
  "summary": "Aperçu court des meilleurs candidats et insights clés en français"
}

Règles supplémentaires :
- Ne jamais inventer de données non trouvées dans les CVs.
- Toujours expliquer EN FRANÇAIS la logique derrière chaque score, en mentionnant les équivalences sémantiques reconnues.
- Prendre en compte les secteurs d'activité dans l'évaluation (bonus si pertinent pour le poste).
- La réponse doit être uniquement du JSON valide (pas de texte en dehors du JSON).
- Toutes les explications (reasoning, summary) doivent être rédigées en français.
- PENSER SÉMANTIQUEMENT : un Data Architect avec dbt, Kafka, Kubernetes est TRÈS pertinent pour Data Engineer !`
}

function buildLLMPrompt(request: MatchingRequest): string {
  return `Analyse l'offre d'emploi suivante et les CVs des candidats :

Offre d'Emploi :
- Titre : ${request.job_offer.title}
- Description complète : ${request.job_offer.description}
- Expérience Minimale : ${request.job_offer.min_experience} ans

IMPORTANT : Tu dois ANALYSER LA DESCRIPTION pour identifier :
1. Les compétences techniques requises (explicites ET implicites)
2. Les compétences fonctionnelles et métiers
3. Les technologies, outils, frameworks, langages pertinents
4. Les concepts et architectures mentionnés

Candidats :
${request.cv_list.map((cv, index) => `
${index + 1}. ${cv.name}
   - Poste : ${cv.job_title}
   - Compétences : ${cv.skills.join(', ')}
   - Années d'Expérience : ${cv.years_experience}
   - Secteurs d'activité : ${cv.sectors && cv.sectors.length > 0 ? cv.sectors.join(', ') : 'Non spécifié'}
`).join('\n')}

INSTRUCTIONS DE MATCHING :
1. Extrais TOUTES les compétences pertinentes de la description du poste (ne te limite pas à une liste prédéfinie)
2. Pour chaque candidat, identifie les compétences qui matchent (y compris équivalences sémantiques)
3. Identifie les compétences manquantes importantes
4. Applique le matching sémantique pour reconnaître les rôles et compétences connexes
5. Calcule un score réaliste basé sur les pondérations fournies

⚠️ CRITIQUE : Tu DOIS retourner EXACTEMENT ${request.cv_list.length} résultats dans le JSON, un pour CHAQUE candidat listé ci-dessus.
N'omets AUCUN candidat, même si le score est 0%. Chaque candidat doit avoir une entrée dans le tableau "results".

N'oublie pas : toutes les explications doivent être EN FRANÇAIS et détailler les équivalences sémantiques reconnues.`
}
