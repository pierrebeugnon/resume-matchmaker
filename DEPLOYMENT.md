# 🚀 Guide de Déploiement sur Vercel

## Déploiement Rapide pour Présentation (5-10 minutes)

### Prérequis
- Compte GitHub gratuit
- Compte Vercel gratuit
- Clé API Hugging Face (si vous utilisez l'IA)

---

## 📋 Étape par Étape

### 1️⃣ Initialiser Git (30 secondes)

Dans le terminal, à la racine du projet :

```bash
git init
git add .
git commit -m "Initial commit - Resume Matchmaker App"
```

### 2️⃣ Créer un Repo GitHub (2 minutes)

1. Allez sur https://github.com/new
2. Créez un nouveau repository (nom: `resume-matchmaker` ou autre)
3. Laissez-le **public** ou **privé** (les deux fonctionnent)
4. **NE PAS** initialiser avec README/gitignore (déjà présents)
5. Copiez les commandes Git proposées :

```bash
git remote add origin https://github.com/VOTRE-USERNAME/resume-matchmaker.git
git branch -M main
git push -u origin main
```

### 3️⃣ Déployer sur Vercel (3 minutes)

#### Option A : Via le site web (plus facile)
1. Allez sur https://vercel.com
2. Connectez-vous avec GitHub
3. Cliquez sur **"Add New Project"**
4. Sélectionnez votre repo `resume-matchmaker`
5. Vercel détecte automatiquement Next.js ✅
6. **Configurez les variables d'environnement** (voir ci-dessous)
7. Cliquez sur **"Deploy"**

#### Option B : Via CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

### 4️⃣ Configurer les Variables d'Environnement

Dans Vercel, allez dans **Settings → Environment Variables** et ajoutez :

#### Si vous utilisez Hugging Face (Recommandé) :
```
LLM_PROVIDER=huggingface
HUGGINGFACE_API_KEY=hf_votre_clé_ici
```

#### Si vous utilisez le mode Mock (sans IA) :
```
LLM_PROVIDER=mock
```

#### Si vous utilisez OpenAI :
```
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-votre_clé_ici
```

### 5️⃣ Tester l'Application

Une fois déployé, Vercel vous donnera une URL type :
```
https://resume-matchmaker-xxx.vercel.app
```

✅ Testez immédiatement l'application !

---

## 🔑 Obtenir les Clés API (si nécessaire)

### Hugging Face (GRATUIT - Recommandé)
1. Créez un compte sur https://huggingface.co
2. Allez sur https://huggingface.co/settings/tokens
3. Créez un nouveau token (permission "Read")
4. Copiez le token (commence par `hf_`)

### Mode Mock (GRATUIT - Sans IA)
Aucune clé nécessaire ! L'app utilise un algorithme simple.

---

## 📱 Accès pour la Présentation

Après le déploiement, vous aurez :

- **URL publique** : Partageable avec n'importe qui
- **Pas de limite de temps** : L'app reste en ligne gratuitement
- **Mises à jour automatiques** : Chaque `git push` redéploie
- **HTTPS gratuit** : Sécurisé par défaut

---

## 🎯 Checklist Avant la Présentation

- [ ] Application déployée et accessible
- [ ] Testé le matching avec plusieurs exemples
- [ ] Vérifié que l'IA répond (si activée)
- [ ] URL raccourcie/notée (ex: via bit.ly)
- [ ] Testé sur mobile/tablette si nécessaire
- [ ] Préparé 2-3 exemples de job descriptions

---

## 🆘 Problèmes Courants

### "Build failed" sur Vercel
➡️ Vérifiez que `package.json` est correct
➡️ Vercel utilise `npm run build` automatiquement

### "API not responding"
➡️ Vérifiez les variables d'environnement
➡️ Essayez avec `LLM_PROVIDER=mock` d'abord

### "Module not found"
➡️ Commitez `package-lock.json`
➡️ Vercel installera automatiquement les dépendances

---

## 🎨 Personnalisation URL (Optionnel)

Dans Vercel → Settings → Domains :
- Ajoutez un domaine personnalisé (si vous en avez)
- Ou changez le sous-domaine Vercel

---

## 📊 Alternatives à Vercel

### Option 2 : Netlify (également gratuit)
- Similaire à Vercel
- https://app.netlify.com/drop
- Glisser-déposer le dossier `.next` après `npm run build`

### Option 3 : Railway (gratuit avec limites)
- Support pour bases de données si besoin
- https://railway.app

### Option 4 : Render (gratuit avec sleep)
- L'app "s'endort" après 15 min d'inactivité
- Premier chargement peut être lent

---

## 💡 Tips pour la Présentation

1. **Ouvrez l'app 5 min avant** (pour éviter le cold start)
2. **Ayez une démo locale en backup** (`npm run dev`)
3. **Préparez quelques job descriptions** en avance
4. **Testez avec/sans IA** pour montrer les deux modes
5. **Notez l'URL** sur un post-it/papier

---

## 🔄 Mettre à Jour l'App Après Déploiement

```bash
# Faites vos modifications
git add .
git commit -m "Description des changements"
git push origin main
# Vercel redéploie automatiquement ! 🎉
```

---

## ✅ Résumé

**Temps total estimé : 10 minutes**

1. `git init` + `git commit` (30s)
2. Créer repo GitHub (2 min)
3. Connecter à Vercel (3 min)
4. Configurer variables env (2 min)
5. Tester l'URL (2 min)

**Vous êtes prêt pour votre présentation ! 🎉**

---

## 📞 Support

Si vous rencontrez des problèmes :
- Documentation Vercel : https://vercel.com/docs
- Vérifiez les logs de déploiement dans Vercel
- Testez localement avec `npm run dev` d'abord
