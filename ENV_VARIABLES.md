# 🔑 Variables d'Environnement pour Vercel

## Configuration pour le Déploiement

Lors du déploiement sur Vercel, vous devez configurer ces variables dans :
**Settings → Environment Variables**

---

## Option 1 : Hugging Face (GRATUIT - Recommandé pour la démo)

```env
LLM_PROVIDER=huggingface
HUGGINGFACE_API_KEY=hf_votre_clé_ici
```

### Obtenir votre clé Hugging Face :
1. Créez un compte sur https://huggingface.co (gratuit)
2. Allez sur https://huggingface.co/settings/tokens
3. Cliquez sur "New token"
4. Donnez-lui un nom (ex: "resume-matcher")
5. Sélectionnez le type "Read"
6. Copiez le token (commence par `hf_`)

**Quota gratuit :** ~1000 requêtes/jour (largement suffisant pour une démo)

---

## Option 2 : Mode Mock (Sans IA)

```env
LLM_PROVIDER=mock
```

**Avantages :**
- ✅ Aucune clé API nécessaire
- ✅ Fonctionne immédiatement
- ✅ Bon pour tester l'interface

**Inconvénients :**
- ❌ Pas d'analyse IA réelle
- ❌ Scores basés sur un algorithme simple

---

## Option 3 : OpenAI (Payant)

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-votre_clé_ici
```

**Coût :** ~$0.002 par requête (GPT-4)

---

## Option 4 : Groq (GRATUIT - Très rapide)

```env
LLM_PROVIDER=groq
GROQ_API_KEY=votre_clé_ici
```

### Obtenir votre clé Groq :
1. Créez un compte sur https://console.groq.com (gratuit)
2. Allez dans API Keys
3. Créez une nouvelle clé
4. Copiez la clé

**Avantage :** Très rapide (inference en quelques secondes)

---

## Variables Optionnelles

### Pour Hugging Face :
```env
HF_MODEL=mistralai/Mistral-7B-Instruct-v0.2
```

Modèles disponibles :
- `mistralai/Mistral-7B-Instruct-v0.2` (recommandé)
- `meta-llama/Meta-Llama-3-8B-Instruct` (haute qualité)
- `google/gemma-2b-it` (le plus rapide)
- `HuggingFaceH4/zephyr-7b-beta` (excellent raisonnement)

### Pour Ollama (local uniquement) :
```env
LLM_PROVIDER=ollama
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

⚠️ **Note :** Ollama ne fonctionne pas sur Vercel (nécessite un serveur local)

---

## 📋 Checklist Déploiement

- [ ] Variable `LLM_PROVIDER` configurée
- [ ] Clé API ajoutée (si nécessaire)
- [ ] Variables ajoutées dans Vercel (pas dans le code !)
- [ ] Application testée après déploiement

---

## 🔒 Sécurité

✅ **À FAIRE :**
- Ajouter les clés dans Vercel (interface web)
- Garder les clés secrètes
- Ne JAMAIS commiter `.env.local` dans Git

❌ **À NE PAS FAIRE :**
- Hardcoder les clés dans le code
- Partager les clés publiquement
- Commiter les fichiers `.env*` dans Git

---

## 🎯 Recommandation pour Votre Présentation

**Pour une démo demain, utilisez Hugging Face :**

1. Inscription : 2 minutes
2. Obtention de la clé : 30 secondes
3. Configuration dans Vercel : 1 minute
4. **Total : ~4 minutes**

```env
LLM_PROVIDER=huggingface
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxx
```

✅ Gratuit, rapide, et fonctionne parfaitement pour une démo !

---

## 💡 Tips

- Testez d'abord avec `LLM_PROVIDER=mock` pour vérifier que tout fonctionne
- Ajoutez ensuite la clé Hugging Face pour activer l'IA
- Gardez une copie de vos variables d'environnement dans un endroit sûr
