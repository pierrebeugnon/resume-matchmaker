# 🎯 TalentMatch - AI Resume Matching System

An intelligent resume matching application powered by **Hugging Face AI** that analyzes job offers and candidate CVs to provide AI-driven recommendations with detailed reasoning - no local installation required!

![Next.js](https://img.shields.io/badge/Next.js-15.2-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Hugging Face](https://img.shields.io/badge/🤗_Hugging_Face-Cloud_AI-yellow)

## ✨ Features

- 🤖 **Cloud AI** - Powered by Hugging Face (no local installation!)
- 🆓 **Free Tier** - Generous free quota for testing
- 📊 **Smart Scoring** - AI-generated relevance scores (0-100) for each candidate
- 💡 **Detailed Reasoning** - Understand why each candidate matches or doesn't match
- ✓ **Skill Analysis** - Visual display of matching and missing skills
- 📈 **Summary Insights** - Overview of top candidates with recommendations
- 🎨 **Modern UI** - Beautiful, responsive interface built with Tailwind CSS
- 🔄 **Flexible** - Multiple LLM providers supported

## 🚀 Quick Start (3 Steps!)

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Get Hugging Face API Key
1. Go to https://huggingface.co/settings/tokens
2. Create a new token (read permission)
3. Copy your token (starts with `hf_`)

### 3. Configure & Run
Create `.env.local`:
```env
LLM_PROVIDER=huggingface
HUGGINGFACE_API_KEY=hf_your_api_key_here
```

Start the app:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 📖 Documentation

- **[HUGGINGFACE_SETUP.md](./HUGGINGFACE_SETUP.md)** - Complete Hugging Face setup guide (Recommended) ⭐
- **[OLLAMA_SETUP.md](./OLLAMA_SETUP.md)** - Local LLM with Ollama (alternative)
- **[ENV_SETUP.md](./ENV_SETUP.md)** - Environment variables configuration
- **[README_MATCHING.md](./README_MATCHING.md)** - System architecture and data flow
- **[LLM_INTEGRATION.md](./LLM_INTEGRATION.md)** - Alternative LLM integrations (OpenAI, Anthropic)
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical implementation details

## 🎮 How to Use

1. **Enter Job Requirements** (Optional)
   - Click "Appel d'Offres" 
   - Paste job description or list required skills
   - Example: "Looking for React, TypeScript, Node.js developer with 3+ years experience"

2. **Apply Filters** (Optional)
   - Location preferences
   - Minimum experience
   - Language requirements
   - Availability

3. **Start Matching**
   - Click "Démarrer le Matching"
   - Watch AI analyze 8 candidates
   - Review results with scores and reasoning

4. **Review Results**
   - View relevance scores (0-100)
   - Read AI reasoning for each candidate
   - See matching skills (✓ green) and missing skills (✗ red)
   - Check summary insights
   - View detailed candidate profiles

## 🏗️ Architecture

```
Frontend (React/Next.js)
    ↓
API Route (/api/match)
    ↓
Hugging Face API (Cloud LLM)
    ↓
Structured JSON Response
    ↓
UI with Scores & Reasoning
```

### Tech Stack
- **Framework**: Next.js 15.2 (App Router)
- **UI**: React 19, Tailwind CSS, shadcn/ui
- **Language**: TypeScript 5
- **AI**: Hugging Face Inference API
- **Models**: Mistral, Llama, Gemma, Zephyr

## 🔧 Configuration Options

### Using Hugging Face (Recommended)
```env
LLM_PROVIDER=huggingface
HUGGINGFACE_API_KEY=hf_your_key_here
HF_MODEL=mistralai/Mistral-7B-Instruct-v0.2
```

### Using Mock Algorithm (No AI)
```env
LLM_PROVIDER=mock
# or simply don't create .env.local
```

### Using Ollama (Local)
```env
LLM_PROVIDER=ollama
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2
```
See [OLLAMA_SETUP.md](./OLLAMA_SETUP.md) for local setup

## 📊 Available Models (Hugging Face)

| Model | Speed | Quality | Best For |
|-------|-------|---------|----------|
| `mistralai/Mistral-7B-Instruct-v0.2` | ⚡⚡ | ⭐⭐⭐⭐ | **Recommended** - Best balance |
| `meta-llama/Meta-Llama-3-8B-Instruct` | ⚡⚡ | ⭐⭐⭐⭐ | Excellent quality |
| `google/gemma-2b-it` | ⚡⚡⚡ | ⭐⭐⭐ | Fastest |
| `HuggingFaceH4/zephyr-7b-beta` | ⚡⚡ | ⭐⭐⭐⭐ | Great reasoning |

Change model in `.env.local`:
```env
HF_MODEL=google/gemma-2b-it
```

## 🎯 Example Output

### Input
```
Job: "Data Analyst with SQL, Python, Tableau"
Min Experience: 3 years
```

### AI Output
```json
{
  "results": [
    {
      "candidate_name": "Julien Bernard",
      "relevance_score": 85,
      "reasoning": "Strong match with SQL, Python, and Tableau. 6 years experience exceeds requirement. Data Analytics title matches perfectly.",
      "matching_skills": ["SQL", "Python", "Tableau"],
      "missing_skills": []
    }
  ],
  "summary": "Found 8 candidates. Top match: Julien Bernard (85%). Strong candidates available for immediate hire."
}
```

## 🛠️ Development

### Project Structure
```
resume-matchmaker/
├── app/
│   ├── api/match/route.ts    # AI matching API
│   ├── page.tsx               # Main UI component
│   └── layout.tsx             # App layout
├── lib/
│   └── types.ts               # TypeScript interfaces
├── components/
│   └── ui/                    # shadcn/ui components
├── .env.local                 # Configuration (create this)
└── package.json
```

### Key Files
- **`app/api/match/route.ts`** - Ollama integration logic
- **`app/page.tsx`** - Frontend with AI results display
- **`lib/types.ts`** - Type definitions for matching system

### Running Tests
```bash
# Test without AI (uses mock algorithm)
USE_OLLAMA=false npm run dev

# Test with Ollama
USE_OLLAMA=true npm run dev
```

## 🔒 Privacy & Security

### With Hugging Face (Cloud)
- ✅ API key stored locally in `.env.local`
- ✅ Requests go through Hugging Face's secure API
- ✅ Read [Hugging Face Privacy Policy](https://huggingface.co/privacy)
- ✅ Never commit `.env.local` to Git (already in `.gitignore`)

### With Ollama (Local - Maximum Privacy)
- ✅ 100% Local - All AI processing on your machine
- ✅ No API Keys - No external API calls
- ✅ Works offline after model download
- See [OLLAMA_SETUP.md](./OLLAMA_SETUP.md) for local setup

## 🚀 Deployment

### Recommended: Hugging Face (Cloud)
Perfect for production deployment on Vercel, Netlify, etc.:
1. Set `LLM_PROVIDER=huggingface` in environment variables
2. Add `HUGGINGFACE_API_KEY` to your hosting platform
3. Deploy as normal Next.js app
4. No server requirements - fully cloud-based!

### Alternative: Local with Ollama
- Requires dedicated server with Ollama installed
- Point `OLLAMA_HOST` to your server
- Ensure adequate CPU/RAM/GPU resources
- See [OLLAMA_SETUP.md](./OLLAMA_SETUP.md)

### Alternative: OpenAI/Anthropic
- See [LLM_INTEGRATION.md](./LLM_INTEGRATION.md) for setup
- Commercial APIs with excellent quality
- Pay-per-use pricing

## 📝 Customization

### Change Matching Criteria
Edit the system prompt in `app/api/match/route.ts`:
```typescript
function getSystemPrompt(): string {
  return `Your custom matching criteria...`
}
```

### Adjust AI Temperature
```typescript
options: {
  temperature: 0.3,  // Lower = more consistent, Higher = more creative
}
```

### Add More Job Fields
Extend types in `lib/types.ts`:
```typescript
export interface JobOffer {
  title: string
  description: string
  required_skills: string[]
  min_experience: number
  location?: string          // Add this
  salary_range?: string      // Add this
}
```

## 🐛 Troubleshooting

### "Ollama is not running"
```bash
ollama serve
```

### "Model not found"
```bash
ollama pull llama3.2
```

### Slow responses?
Use a smaller model:
```env
OLLAMA_MODEL=llama3.2:1b
```

### TypeScript errors?
```bash
npm install --legacy-peer-deps
```

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- [ ] PDF CV upload and parsing
- [ ] Batch processing for multiple jobs
- [ ] Export results to CSV/PDF
- [ ] Streaming responses from Ollama
- [ ] More LLM provider integrations
- [ ] Advanced filtering options

## 📄 License

MIT License - Feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- **Ollama** - For making local LLM deployment easy
- **shadcn/ui** - For beautiful UI components
- **Next.js** - For the amazing framework

## 📧 Support

- Create an issue for bugs or feature requests
- Check `OLLAMA_SETUP.md` for detailed setup help
- See `LLM_INTEGRATION.md` for alternative LLM options

---

**Built with ❤️ using Next.js, React, TypeScript, and Ollama**
