# Configuration Groq pour Resume Matchmaker

## 🎯 Obtenir votre clé API Groq (GRATUIT)

1. Allez sur : **https://console.groq.com/**
2. Créez un compte gratuit (pas de carte bancaire requise)
3. Cliquez sur "API Keys" dans le menu
4. Cliquez sur "Create API Key"
5. Donnez-lui un nom (ex: "Resume Matchmaker")
6. Copiez la clé générée

## ⚙️ Configuration

Créez un fichier `.env.local` à la racine du projet avec :

```bash
# Clé API Groq (OBLIGATOIRE - remplacez par votre clé)
GROQ_API_KEY=gsk_votre_cle_api_ici

# Modèle Groq (optionnel, par défaut llama-3.3-70b-versatile)
GROQ_MODEL=llama-3.3-70b-versatile
```

**Note :** L'application utilise uniquement Groq. La clé API est obligatoire pour faire fonctionner l'enrichissement et le matching.

## 📊 Modèles Groq disponibles (tous gratuits)

- **llama-3.3-70b-versatile** ⭐ RECOMMANDÉ
  - Le plus récent et puissant pour l'analyse de CV
  - Excellent en français
  - 8,000 tokens de contexte

- **llama-3.1-8b-instant**
  - Plus rapide mais moins précis
  - Bon pour des tâches simples

- **mixtral-8x7b-32768**
  - Très bon en français
  - 32k tokens de contexte
  - Excellent compromis vitesse/qualité

- **gemma2-9b-it**
  - Rapide et efficace
  - Bon pour des analyses courtes

## 🚀 Limites gratuites Groq

- **14,400 requêtes/jour**
- **30 requêtes/minute** (Llama 3.3 70B)
- **100% gratuit** sans carte bancaire

## ✅ Vérification

Après avoir configuré `.env.local`, redémarrez le serveur :

```bash
npm run dev
```

L'application utilisera automatiquement Groq pour tous les traitements LLM (enrichissement et matching).

## ⚠️ Important

Sans clé API Groq valide, l'application retournera des erreurs. Assurez-vous d'avoir :
1. Créé votre compte Groq (gratuit)
2. Généré votre clé API
3. Ajouté la clé dans `.env.local`
4. Redémarré le serveur de développement
