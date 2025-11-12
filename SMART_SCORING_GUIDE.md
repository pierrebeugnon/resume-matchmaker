# 🎯 Guide du Smart Matching Score v2

## 📊 Comprendre les Chiffres

### **Deux Types de Pourcentages**

Il y a **deux types de pourcentages** différents dans le système de scoring :

#### 1️⃣ **Score du Candidat** (Barres de progression)
- **Définition** : Performance du candidat sur chaque critère
- **Fixe** : Ne change jamais pour un candidat donné
- **Exemple** : 
  - Compétences Techniques: **70%** = Le candidat maîtrise 70% des compétences requises
  - Expérience: **80%** = Le candidat a 80% de l'expérience demandée

#### 2️⃣ **Pondération** (Badges verts)
- **Définition** : Importance accordée à chaque critère
- **Variable** : Vous pouvez l'ajuster selon vos besoins
- **Contrainte** : Total doit = 100%
- **Exemple** :
  - Poids Tech: **40%** = Les compétences techniques comptent pour 40% du score final
  - Poids Expérience: **30%** = L'expérience compte pour 30%

---

## 🧮 Formule de Calcul

```
Score Final = (Score Tech × Poids Tech) + (Score Exp × Poids Exp) + (Score Form × Poids Form) + (Score Ctx × Poids Ctx)
```

### Exemple Concret

**Candidat : Lucas Bernard - Data Architect**

Scores du candidat (fixes) :
- Tech: 70%
- Expérience: 80%
- Formations: 60%
- Contexte: 75%

**Pondérations Actuelles (Équilibré 25/25/25/25)** :
```
Score Final = (70% × 25%) + (80% × 25%) + (60% × 25%) + (75% × 25%)
            = 17.5 + 20 + 15 + 18.75
            = 71.25% ≈ 71%
```

**Pondérations Simulation (Tech Focus 75/15/10/0)** :
```
Score Final = (70% × 75%) + (80% × 15%) + (60% × 10%) + (75% × 0%)
            = 52.5 + 12 + 6 + 0
            = 70.5% ≈ 71%
```

---

## ⚙️ Presets de Pondération

### ✨ **Standard** (Par défaut)
```
Tech: 40% | Exp: 30% | Form: 20% | Ctx: 10%
```
✅ Configuration par défaut au démarrage  
✅ Équilibre pratique privilégiant compétences et expérience  
✅ Bon compromis pour la majorité des cas

### ⚖️ **Équilibré**
```
Tech: 25% | Exp: 25% | Form: 25% | Ctx: 25%
```
✅ Pour des missions généralistes  
✅ Quand tous les critères sont strictement égaux

### 💻 **Tech Focus** 
```
Tech: 60% | Exp: 20% | Form: 15% | Ctx: 5%
```
✅ Missions hautement techniques  
✅ Projets nécessitant des compétences pointues

### 👔 **Expérience Focus**
```
Tech: 20% | Exp: 60% | Form: 10% | Ctx: 10%
```
✅ Postes seniors / lead  
✅ Gestion d'équipe importante

### 🏢 **Secteur Focus**
```
Tech: 20% | Exp: 20% | Form: 10% | Ctx: 50%
```
✅ Secteurs très spécialisés (finance, santé, défense)  
✅ Contexte métier critique

---

## 🔍 Simulateur : Mode d'Emploi

### Étape 1️⃣ : Ouvrir le Simulateur
Cliquez sur **"⚡ Simuler Score"** sur n'importe quelle carte de profil.

### Étape 2️⃣ : Comprendre l'Affichage

**Côté Gauche (📊 Score Actuel)** :
- Affiche le score avec les pondérations **actuelles**
- C'est le score "officiel" que vous voyez partout

**Côté Droit (⚡ Score Simulé)** :
- Affiche le score **recalculé** avec vos ajustements
- Le badge rouge/vert montre la différence

### Étape 3️⃣ : Ajuster les Pondérations
Utilisez les **sliders** pour modifier chaque poids :
- Le total doit faire **100%** (sinon le bouton "Appliquer" est désactivé)
- Utilisez **"Auto-équilibrer"** si vous dépassez 100%

### Étape 4️⃣ : Observer l'Impact
Le score simulé se recalcule **en temps réel** :
- **+X% (vert)** : Le score augmente → Ce candidat devient plus intéressant
- **-X% (rouge)** : Le score diminue → Ce candidat devient moins pertinent

### Étape 5️⃣ : Appliquer ou Annuler
- **"Appliquer à tous les profils"** : Les nouvelles pondérations s'appliquent globalement
- **"Annuler"** : Ferme sans modification
- **"Réinitialiser"** : Revient aux pondérations d'origine

---

## 🐛 Bugs Corrigés (Version actuelle)

### ✅ Bug #1 : Recalcul automatique
**Avant** : Le score simulé n'était pas recalculé, causant des incohérences  
**Maintenant** : Le score est recalculé automatiquement basé sur `breakdown × weights`

### ✅ Bug #2 : Confusion d'affichage
**Avant** : Pas de distinction claire entre "score candidat" et "pondération"  
**Maintenant** : Labels explicites + tooltips explicatifs

### ✅ Bug #3 : Formule affichée
**Avant** : Pas d'explication de la formule de calcul  
**Maintenant** : Bandeau informatif + formule affichée

---

## 💡 Cas d'Usage

### Scénario 1 : Mission Technique Pointue
```
Client : "Besoin d'un expert Kubernetes avec certifications"
Action : Appliquer preset "Tech Focus" (60/20/15/5)
Résultat : Les candidats certifiés remontent en tête
```

### Scénario 2 : Lead Senior
```
Client : "Je veux un senior avec 10+ ans d'expérience"
Action : Appliquer preset "Expérience Focus" (20/60/10/10)
Résultat : Les profils seniors dominent le classement
```

### Scénario 3 : Finance Réglementée
```
Client : "Expérience bancaire obligatoire"
Action : Appliquer preset "Secteur Focus" (20/20/10/50)
Résultat : Seuls les profils avec expérience bancaire ressortent
```

### Scénario 4 : Personnalisé
```
Client : "Je veux 50% tech, 30% expérience, 20% certifications"
Action : Ajuster manuellement les sliders
Résultat : Pondération sur-mesure appliquée
```

---

## 🎓 Bonnes Pratiques

### ✅ À FAIRE
- **Tester plusieurs configurations** pour voir l'impact
- **Documenter** quelle pondération vous utilisez pour quel type de mission
- **Utiliser le simulateur** avant d'appliquer globalement
- **Privilégier les presets** pour la cohérence

### ❌ À ÉVITER
- Ne pas mettre **tous les poids à 0%** (score = 0)
- Ne pas appliquer **sans simuler** d'abord
- Ne pas oublier que **le total doit = 100%**
- Ne pas confondre **score candidat** et **pondération**

---

## 🔮 Évolutions Futures

### V2.1 (Prévu)
- [ ] Intégration backend pour score breakdown automatique
- [ ] Sauvegarde des presets personnalisés
- [ ] Historique des simulations
- [ ] Export PDF des comparaisons

### V2.2 (En Réflexion)
- [ ] Machine Learning pour suggérer les pondérations optimales
- [ ] A/B Testing de pondérations
- [ ] Scoring multicritères avancé (soft skills, culture fit)

---

## 📞 Support

Pour toute question sur le système de scoring :
1. Consultez ce guide
2. Utilisez le bandeau ℹ️ dans le simulateur
3. Survolez les éléments avec le curseur pour voir les tooltips

---

**Version** : 2.0.0  
**Dernière mise à jour** : 28 Oct 2025  
**Auteur** : Smart Matching Score v2 Team
