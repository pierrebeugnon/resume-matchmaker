# 🤖 Guide Rapide - Tester les 2 Versions du Chatbot

## Version 1 - Design Classique Compact

```
┌─────────────────────────────────────┐
│  ✨ Assistant IA            × ─  │ ← Header Jaune/Or
│  📊 2 candidat(s) en cours          │
├─────────────────────────────────────┤
│                                     │
│  👋 Bonjour ! Je suis votre...     │ ← Message Assistant
│  10:30                              │
│                                     │
│             Qui est le meilleur ? ⚡│ ← Message User
│             10:31                   │
│                                     │
│  [Explique-moi les résultats]      │ ← Questions suggérées
│  [Qui est le meilleur candidat ?]  │
│                                     │
├─────────────────────────────────────┤
│ [Posez votre question...    ] [>]  │ ← Input simple
└─────────────────────────────────────┘
      384px × 600px
```

**Style** : Card flottante, bouton rond en bas-droite
**Couleurs** : Jaune #EAB308 + Gris foncé
**Effet** : Pop-up classique avec pulse

---

## Version 2 - Design Premium Moderne

```
┌──────────────────────────────────────────────┐
│  ✨  Assistant Recrutement        ˅  ×      │ ← Header avec blur
│      Propulsé par Llama 3.3                  │
│  ┌────────────┬────────────┐                 │
│  │ Candidats  │    Mode    │                 │ ← Stats cards
│  │     2      │   Simple   │                 │
│  └────────────┴────────────┘                 │
├──────────────────────────────────────────────┤
│                                              │
│  👋 Bonjour ! Je suis votre assistant...    │ ← Message (glassmorphism)
│  10:30                                       │
│                                              │
│                   Qui est le meilleur ? 💬  │ ← Message gradient
│                   10:31                      │
│                                              │
│  ACTIONS RAPIDES                             │
│  ┌──────────┬──────────┐                    │ ← Quick actions
│  │📈 Analyser│👥 Meilleur│                   │   avec icônes
│  └──────────┴──────────┘                    │
│  ┌──────────┬──────────┐                    │
│  │💡 Conseils│🔍 Comparer│                   │
│  └──────────┴──────────┘                    │
├──────────────────────────────────────────────┤
│ [Posez votre question...           ]  [>]   │ ← Input avec blur
│      Appuyez sur Entrée pour envoyer        │
└──────────────────────────────────────────────┘
           500px × Pleine hauteur
```

**Style** : Slide-in depuis la droite, pleine hauteur
**Couleurs** : Gradient Indigo → Purple → Pink
**Effets** : Glassmorphism, backdrop-blur, gradients avancés

---

## 🔄 Comment Basculer ?

### Étape 1 : Dans `app/page.tsx` ligne 9
**Actuellement :**
```tsx
import ChatBot from "@/components/ChatBot"
// import ChatBotV2 from "@/components/ChatBotV2" // Version 2 - Premium Design
```

**Pour tester V2, inversez :**
```tsx
// import ChatBot from "@/components/ChatBot"
import ChatBotV2 from "@/components/ChatBotV2" // Version 2 - Premium Design
```

### Étape 2 : Ligne 6573, changez le composant
**Actuellement :**
```tsx
<ChatBot context={{...}} />
```

**Pour V2 :**
```tsx
<ChatBotV2 context={{...}} />
```

### Étape 3 : Sauvegardez et testez !

---

## 📊 Tableau Comparatif Rapide

| Feature | V1 Classique | V2 Premium |
|---------|-------------|------------|
| **Taille** | 384×600px | 500×full |
| **Bouton** | 🟡 Rond jaune | 🎨 Rectangle gradient |
| **Position** | Bas-droite overlay | Slide-in droit |
| **Stats** | Texte simple | Cartes visuelles |
| **Actions rapides** | Boutons texte | Icônes + labels |
| **Minimiser** | ❌ | ✅ |
| **Effets** | Standard | Glassmorphism |
| **Message style** | Simple | Gradient bulles |
| **Impression** | Familier | Premium |

---

## 💡 Conseil

**Testez les deux** en conditions réelles :
1. Lancez un matching
2. Ouvrez le chatbot
3. Posez des questions
4. Observez quelle version correspond mieux à votre workflow

**Astuce** : Vous pouvez même proposer les deux à vos utilisateurs et collecter leurs préférences !
