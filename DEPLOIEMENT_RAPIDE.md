# ⚡ Déploiement Express - 10 Minutes

Pour votre présentation demain, voici le processus le plus rapide :

## 🎯 Méthode Recommandée : Vercel (100% Gratuit)

### Étape 1 : Préparez Git (2 minutes)

```bash
# Exécutez ce script automatique
./deploy.sh
```

Ou manuellement :
```bash
git init
git add .
git commit -m "Initial commit"
```

### Étape 2 : GitHub (2 minutes)

1. Allez sur https://github.com/new
2. Créez un repo (nom : `resume-matchmaker`)
3. Laissez-le public ou privé
4. **N'ajoutez rien** (pas de README/gitignore)
5. Exécutez les commandes proposées :

```bash
git remote add origin https://github.com/VOTRE_USERNAME/resume-matchmaker.git
git branch -M main
git push -u origin main
```

### Étape 3 : Vercel (5 minutes)

1. **Connexion** : https://vercel.com → Sign up with GitHub
2. **Import** : Cliquez "Add New Project"
3. **Sélection** : Choisissez votre repo `resume-matchmaker`
4. **Config Auto** : Vercel détecte Next.js automatiquement ✅
5. **Variables** : Ajoutez dans "Environment Variables" :

**Option Rapide (Sans IA - pour tester l'interface) :**
```
LLM_PROVIDER = mock
```

**Option Complète (Avec IA - pour la vraie démo) :**
```
LLM_PROVIDER = huggingface
HUGGINGFACE_API_KEY = hf_votre_clé_ici
```

6. **Deploy** : Cliquez sur "Deploy" et attendez 2-3 minutes

### Étape 4 : Obtenez la Clé Hugging Face (3 minutes - Optionnel)

Si vous voulez activer l'IA :

1. https://huggingface.co → Sign Up (gratuit)
2. https://huggingface.co/settings/tokens
3. "New token" → Nom: "resume-matcher" → Type: "Read"
4. Copiez le token (commence par `hf_`)
5. Collez-le dans Vercel → Settings → Environment Variables
6. Redéployez (Deployments → trois points → Redeploy)

---

## ✅ C'est Fait !

Vous aurez une URL type :
```
https://resume-matchmaker-xxx.vercel.app
```

**Testez immédiatement :**
1. Ouvrez l'URL
2. Cliquez "Démarrer le Matching"
3. Vérifiez que ça fonctionne

---

## 🎬 Pour Votre Présentation

### Avant la Présentation :
- [ ] Ouvrez l'URL 5 minutes avant (évite le cold start)
- [ ] Notez l'URL sur un papier/post-it
- [ ] Préparez 2-3 exemples de job descriptions
- [ ] Testez sur mobile si vous présentez sur tablette/mobile

### Pendant la Présentation :
1. Montrez l'interface
2. Entrez une job description (ex: "React, TypeScript, 3+ ans")
3. Lancez le matching
4. Expliquez les résultats (scores, raisonnement IA)
5. Montrez les détails des candidats

### Exemples de Job Descriptions :
```
Développeur Full Stack avec React, Node.js, TypeScript, 3+ ans d'expérience
```
```
Data Analyst avec SQL, Python, Tableau, maîtrise de l'anglais
```
```
Chef de Projet IT avec expérience Agile/Scrum, management d'équipe
```

---

## 🆘 Si Ça Ne Marche Pas

### L'app ne se lance pas sur Vercel ?
➡️ Vérifiez les logs : Vercel → Deployments → View Function Logs

### "Module not found" ?
➡️ Assurez-vous que `package-lock.json` est commité

### L'IA ne répond pas ?
➡️ Vérifiez les variables d'environnement
➡️ Essayez d'abord avec `LLM_PROVIDER=mock`

### Besoin de modifier quelque chose ?
```bash
# Faites vos modifications
git add .
git commit -m "Fix pour la présentation"
git push origin main
# Vercel redéploie automatiquement en 2-3 minutes
```

---

## 📱 Alternative Ultra-Rapide : Partage d'Écran Local

Si le déploiement ne fonctionne pas à temps :

```bash
npm run dev
# Partagez votre écran depuis http://localhost:3000
```

Utilisez ngrok pour exposer temporairement :
```bash
npx ngrok http 3000
# Donne une URL publique temporaire
```

---

## 💾 Backup Plan

1. **Plan A** : App déployée sur Vercel (meilleur)
2. **Plan B** : App locale + partage d'écran
3. **Plan C** : Screenshots/vidéo de l'app en action

---

## 🎉 Récapitulatif

| Temps | Action |
|-------|--------|
| 2 min | Git init + commit |
| 2 min | Créer repo GitHub |
| 1 min | Push vers GitHub |
| 5 min | Déploiement Vercel |
| 3 min | Config Hugging Face (optionnel) |
| **13 min** | **TOTAL** |

**Votre app sera accessible 24/7 gratuitement !** 🚀

---

## 📞 Ressources

- **Guide détaillé** : `DEPLOYMENT.md`
- **Variables d'env** : `ENV_VARIABLES.md`
- **Documentation Vercel** : https://vercel.com/docs
- **Support Hugging Face** : https://huggingface.co/docs

Bonne présentation ! 🎯
