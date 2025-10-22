# 🚀 Quick Start Guide - TalentMatch with Ollama

Get up and running with AI-powered resume matching in 5 minutes!

## Prerequisites

- Node.js installed
- Terminal/Command line access
- 8GB+ RAM recommended

## Step-by-Step Setup

### 1️⃣ Install Ollama

Choose your operating system:

**macOS:**
```bash
brew install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

**Windows:**
- Download from https://ollama.ai/download
- Run the installer

### 2️⃣ Start Ollama Service

Open a terminal and run:
```bash
ollama serve
```

**Important:** Keep this terminal window open!

### 3️⃣ Download AI Model

Open a **NEW terminal** (keep the first one running) and run:
```bash
ollama pull llama3.2
```

Wait for the download to complete (~2GB).

### 4️⃣ Configure the Application

In your project directory, create a file named `.env.local`:

```env
USE_OLLAMA=true
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

**Quick create command (macOS/Linux):**
```bash
cat > .env.local << 'EOF'
USE_OLLAMA=true
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2
EOF
```

### 5️⃣ Start the Application

```bash
npm run dev
```

### 6️⃣ Open in Browser

Visit: **http://localhost:3000**

## 🎮 Using the Application

1. **Optional:** Enter a job description in "Appel d'Offres"
   - Example: "Looking for React, TypeScript, AWS developer"

2. **Click** "Démarrer le Matching"

3. **Watch** the AI analyze candidates

4. **Review** results with:
   - AI-generated relevance scores
   - Detailed reasoning
   - Matching/missing skills
   - Summary insights

## ✅ Verify It's Working

You should see in your terminal:
```
Using Ollama model: llama3.2
```

If you see "Using mock matching algorithm", check your `.env.local` file.

## 🔧 Troubleshooting

### Problem: "Ollama is not running"
**Fix:** Run `ollama serve` in a terminal

### Problem: "Model not found"
**Fix:** Run `ollama pull llama3.2`

### Problem: Server won't start
**Fix:** 
```bash
# Kill any existing process
killall node
# Try again
npm run dev
```

### Problem: Changes not working
**Fix:** Restart the dev server (Ctrl+C, then `npm run dev`)

## 🎯 What's Next?

### Try Different Models
```bash
# Faster model (1GB)
ollama pull llama3.2:1b

# Better quality (5GB)
ollama pull llama3.1

# Alternative (4GB)
ollama pull mistral
```

Then update `.env.local`:
```env
OLLAMA_MODEL=llama3.2:1b
```

### Customize Matching
- Edit `app/api/match/route.ts` to change AI behavior
- Modify `app/page.tsx` to adjust UI
- See full docs in `OLLAMA_SETUP.md`

## 📚 Full Documentation

- **OLLAMA_SETUP.md** - Complete Ollama guide
- **ENV_SETUP.md** - All configuration options
- **README.md** - Full project documentation
- **README_MATCHING.md** - System architecture

## 💡 Tips

1. **First run is slower** - Ollama needs to load the model
2. **Keep Ollama running** - Don't close the `ollama serve` terminal
3. **Test without AI first** - Set `USE_OLLAMA=false` to use mock algorithm
4. **Check console logs** - Useful for debugging

## 🎉 Success!

If you can see AI-generated reasoning and scores, you're all set!

The AI will analyze:
- Job title match
- Required skills vs candidate skills
- Years of experience
- Overall fit

And provide detailed explanations for each candidate.

## 🆘 Still Having Issues?

1. Check that Ollama is running: `curl http://localhost:11434/api/tags`
2. Verify model is downloaded: `ollama list`
3. Restart everything:
   ```bash
   # Stop dev server (Ctrl+C)
   # Stop Ollama (Ctrl+C in that terminal)
   # Start Ollama: ollama serve
   # Start dev server: npm run dev
   ```

4. Check the detailed guides in the documentation files

---

**Ready to match some resumes? Let's go! 🚀**
