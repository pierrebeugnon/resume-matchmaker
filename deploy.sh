#!/bin/bash

# 🚀 Script de Déploiement Rapide - Resume Matchmaker
# Ce script initialise Git et prépare votre app pour le déploiement

echo "🎯 TalentMatch - Préparation pour le déploiement..."
echo ""

# Vérifier si Git est installé
if ! command -v git &> /dev/null; then
    echo "❌ Git n'est pas installé. Installez-le depuis https://git-scm.com/"
    exit 1
fi

echo "✅ Git détecté"
echo ""

# Initialiser Git si nécessaire
if [ ! -d ".git" ]; then
    echo "📦 Initialisation du repository Git..."
    git init
    echo "✅ Git initialisé"
else
    echo "✅ Repository Git déjà initialisé"
fi

echo ""

# Vérifier les fichiers ignorés
if [ ! -f ".gitignore" ]; then
    echo "⚠️  Attention : .gitignore manquant"
else
    echo "✅ .gitignore présent"
fi

echo ""

# Ajouter tous les fichiers
echo "📁 Ajout des fichiers au commit..."
git add .

echo ""

# Vérifier le statut
echo "📊 Statut du repository :"
git status --short

echo ""

# Créer le commit
echo "💾 Création du commit..."
git commit -m "Initial commit - Resume Matchmaker ready for deployment" || echo "Pas de changements à commiter"

echo ""
echo "✅ Préparation terminée !"
echo ""
echo "📋 Prochaines étapes :"
echo ""
echo "1️⃣  Créez un nouveau repo sur GitHub : https://github.com/new"
echo ""
echo "2️⃣  Liez votre repo local (remplacez USERNAME et REPO_NAME) :"
echo "    git remote add origin https://github.com/USERNAME/REPO_NAME.git"
echo "    git branch -M main"
echo "    git push -u origin main"
echo ""
echo "3️⃣  Déployez sur Vercel :"
echo "    - Allez sur https://vercel.com"
echo "    - Cliquez sur 'Add New Project'"
echo "    - Sélectionnez votre repo GitHub"
echo "    - Ajoutez vos variables d'environnement"
echo "    - Cliquez sur 'Deploy'"
echo ""
echo "📖 Guide complet disponible dans DEPLOYMENT.md"
echo ""
echo "🎉 Vous êtes prêt pour votre présentation demain !"
