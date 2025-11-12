import { NextRequest, NextResponse } from 'next/server'

const GROQ_API_KEY = process.env.GROQ_API_KEY

interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json()

    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'GROQ_API_KEY non configurée' },
        { status: 500 }
      )
    }

    // Construction du contexte système enrichi
    let systemContext = `Tu es un assistant IA expert en placement de consultants travaillant avec Resume Matchmaker.

🎯 **TON RÔLE - AIDE DÉCISIONNELLE AVANCÉE:**
- Analyser les profils de consultants et scores de matching avec l'appel d'offre
- Comparer les consultants et recommander les meilleurs pour la mission
- Expliquer les scores breakdown (Tech/Exp/Form/Ctx)
- Détecter les gaps de compétences par rapport au cahier des charges
- Optimiser le matching et les pondérations selon la mission
- **NOUVEAU: Générer des recommandations proactives**
- **NOUVEAU: Simuler l'impact de changements de pondérations**
- **NOUVEAU: Créer des shortlists pour proposition client**
- **NOUVEAU: Identifier les patterns et biais**

📋 **FORMAT DE RÉPONSE:**
- Sois concis, structuré (bullet points, emojis)
- Cite les noms des consultants avec leurs scores
- Justifie TOUTES tes recommandations avec des chiffres précis
- Propose des actions concrètes et cliquables
- Pour les comparaisons : tableau structuré avec forces/faiblesses
- Pour les simulations : avant/après avec impact chiffré
- Pour les shortlists : top N consultants à proposer au client

🎲 **CAPACITÉS DÉCISIONNELLES:**
1. **Recommandations proactives:** Suggère des actions sans qu'on te le demande
2. **Comparaisons intelligentes:** Compare automatiquement les meilleurs profils
3. **Simulations:** "Avec preset X, voici les nouveaux scores..."
4. **Shortlists:** "Voici mes 5 consultants à proposer au client avec raisons"

🧠 **INTELLIGENCE AVANCÉE (PHASE 3):**
5. **Détection de biais avancée:** Analyse statistique des patterns de sélection
   - Biais démographiques (âge, expérience)
   - Biais de certifications vs expérience pratique
   - Biais sectoriels ou technologiques
   - Suggestions concrètes pour corriger

6. **Reformulation du cahier des charges:** Suggère des ajustements du matching
   - Compétences requises trop restrictives → assouplir les critères
   - Compétences manquantes fréquentes → identifier les formations à prévoir
   - Pondérations mal calibrées → ajuster selon les exigences client
   - Exemples concrets de recalibrage

7. **Prédictions de disponibilité:** Estime la disponibilité réelle des consultants
   - Analyse du TACE (Taux d'Activité en cours)
   - Disponibilité déclarée vs missions actuelles
   - Délais de fin de mission estimés
   - Probabilité de placement sur la nouvelle mission

8. **Visualisations textuelles:** Crée des graphiques en ASCII/texte
   - Diagrammes de distribution (histogrammes)
   - Graphiques de comparaison (barres)
   - Timelines de disponibilité et placement
   - Matrices de compétences`

    // Ajouter le contexte de matching si disponible
    if (context) {
      // Infos générales
      if (context.candidatesCount !== undefined && context.candidatesCount > 0) {
        systemContext += `\n\n📊 **CONTEXTE ACTUEL:**
- ${context.candidatesCount} consultant(s) analysé(s)
- Mission/Appel d'offre : "${context.jobTitle || 'Non spécifié'}"
- Mode : ${context.searchMode === 'multi' ? 'Multi-profil' : 'Profil unique'}`
      }

      // Pondérations actives
      if (context.weights) {
        systemContext += `\n\n⚖️ **PONDÉRATIONS ACTIVES** (Preset: ${context.activePreset || 'Personnalisé'}):`
        systemContext += `\n- 💻 Compétences Techniques: ${context.weights.technicalSkills}%`
        systemContext += `\n- 👔 Expérience: ${context.weights.experience}%`
        systemContext += `\n- 🎓 Formations: ${context.weights.training}%`
        systemContext += `\n- 🏢 Contexte: ${context.weights.context}%`
      }

      // Détails complets des consultants
      if (context.candidates && context.candidates.length > 0) {
        systemContext += `\n\n👥 **CONSULTANTS DÉTAILLÉS:**\n`
        
        // Top 10 pour ne pas surcharger le prompt
        const topCandidates = context.candidates.slice(0, 10)
        
        topCandidates.forEach((c: any, i: number) => {
          systemContext += `\n${i + 1}. **${c.name}** - ${c.title}`
          systemContext += `\n   📊 Score global: ${c.matchScore}%`
          
          if (c.breakdown) {
            systemContext += `\n   Breakdown: Tech ${c.breakdown.technicalSkills}% | Exp ${c.breakdown.experience}% | Form ${c.breakdown.training}% | Ctx ${c.breakdown.context}%`
          }
          
          if (c.yearsOfExperience) {
            systemContext += `\n   👔 Expérience: ${c.yearsOfExperience} ans`
          }
          
          if (c.skills && c.skills.length > 0) {
            systemContext += `\n   ✅ Compétences: ${c.skills.slice(0, 5).join(', ')}`
          }
          
          if (c.missingSkills && c.missingSkills.length > 0) {
            systemContext += `\n   ❌ Manquantes: ${c.missingSkills.slice(0, 3).join(', ')}`
          }
          
          if (c.certifications && c.certifications.length > 0) {
            systemContext += `\n   🏆 Certifications: ${c.certifications.length}`
          }
          
          if (c.availability) {
            systemContext += `\n   📅 Disponibilité: ${c.availability}`
          }
          
          if (c.tace !== undefined) {
            systemContext += `\n   📊 TACE: ${c.tace}%`
          }
        })
        
        if (context.candidates.length > 10) {
          systemContext += `\n\n... et ${context.candidates.length - 10} autres candidats.`
        }
      }
    }

    // Appel à Groq
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemContext },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 1000,
        stream: true, // Activer le streaming
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Groq API error:', errorText)
      return NextResponse.json(
        { error: 'Erreur lors de l\'appel à l\'API Groq' },
        { status: response.status }
      )
    }

    // Streaming de la réponse
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split('\n').filter(line => line.trim() !== '')

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') continue

                try {
                  const json = JSON.parse(data)
                  const content = json.choices[0]?.delta?.content || ''
                  if (content) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
                  }
                } catch (e) {
                  // Ignorer les erreurs de parsing
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })

  } catch (error) {
    console.error('Erreur chatbot:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement de la requête' },
      { status: 500 }
    )
  }
}
