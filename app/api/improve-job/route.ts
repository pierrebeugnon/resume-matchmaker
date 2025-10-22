import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

// Groq model configuration
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.job_description || body.job_description.trim() === '') {
      return NextResponse.json(
        { error: 'job_description is required' },
        { status: 400 }
      )
    }

    let improvedDescription: string

    try {
      console.log(`Using Groq model: ${GROQ_MODEL} pour enrichir la demande`)
      improvedDescription = await improveWithGroq(body.job_description)
    } catch (groqError) {
      console.error('Erreur Groq:', groqError)
      return NextResponse.json(
        { error: 'Erreur lors de l\'enrichissement. Vérifiez votre configuration Groq.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ improved_description: improvedDescription })
  } catch (error) {
    console.error('Error in improve-job API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function improveWithGroq(jobDescription: string): Promise<string> {
  const systemPrompt = `Tu es un expert en rédaction d'appels d'offres techniques et en définition de profils.
Ta tâche est d'enrichir les demandes en développant les aspects techniques sous forme STRUCTURÉE avec des sections et bullet points.

STRUCTURE REQUISE :

1. ORGANISER LE CONTENU EN SECTIONS CLAIRES :
   - Utiliser des titres de sections (## Titre de section)
   - Créer une hiérarchie logique de l'information
   - Sections typiques : Contexte, Compétences techniques requises, Technologies et outils, Expérience requise, Compétences transverses, Méthodologies, Certifications souhaitées

2. UTILISER DES BULLET POINTS :
   - Présenter les informations sous forme de points concis
   - Utiliser le format "- Point" pour les listes
   - Éviter les phrases longues et continues
   - Chaque point doit être clair et direct

3. ENRICHIR LE CONTENU :
   - Développer les compétences techniques mentionnées
   - Ajouter les technologies connexes pertinentes
   - Préciser les niveaux d'expérience attendus
   - Mentionner les soft skills importantes
   - Inclure les méthodologies de travail pertinentes

4. TON PROFESSIONNEL :
   - Rester factuel et précis
   - Utiliser un vocabulaire professionnel
   - Éviter les généralités vagues

IMPORTANT : 
- Structure le texte avec des sections (##) et des bullet points (-)
- Sois concis et direct dans chaque point
- Réponds UNIQUEMENT avec le texte structuré, sans préfixe ni commentaire`

  const userPrompt = `Enrichis et structure cette demande en utilisant des sections claires et des bullet points :

${jobDescription}

Organise le contenu avec :
- Des sections appropriées (## Titre)
- Des bullet points concis (-)
- Une structure hiérarchisée et lisible
- Les compétences techniques détaillées
- Les compétences transverses pertinentes
- Les méthodologies et certifications si applicables

Réponds uniquement avec le texte structuré.`

  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    max_tokens: 1500,
    temperature: 0.7,
  })
  
  let improvedText = response.choices[0]?.message?.content || jobDescription
  improvedText = improvedText.trim()
  
  // Retirer les préfixes courants
  const prefixesToRemove = [
    "Voici le texte enrichi :",
    "Voici la version enrichie :",
    "Texte enrichi :",
    "Voici la description améliorée :",
    "Voici une version améliorée :",
    "Description améliorée :",
    "Voici :",
  ]
  
  for (const prefix of prefixesToRemove) {
    if (improvedText.toLowerCase().startsWith(prefix.toLowerCase())) {
      improvedText = improvedText.substring(prefix.length).trim()
    }
  }
  
  return improvedText
}
