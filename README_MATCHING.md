# Resume Matchmaker - LLM Integration

An AI-powered resume matching system that analyzes job offers and candidate CVs to provide intelligent matching recommendations.

## 🎯 Features

- **AI-Powered Matching**: Uses LLM to analyze job requirements against candidate profiles
- **Smart Scoring**: Relevance scores (0-100) based on skills, experience, and job title match
- **Detailed Reasoning**: AI-generated explanations for each match score
- **Skill Analysis**: Visual display of matching and missing skills
- **Summary Insights**: Overview of top candidates and recommendations

## 🏗️ Architecture

### Frontend (`/app/page.tsx`)
- React component with job offer input and candidate display
- Calls the matching API when user clicks "Start Matching"
- Displays AI-generated results with visual indicators

### Backend API (`/app/api/match/route.ts`)
- Next.js API route that processes matching requests
- Integrates with LLM (OpenAI, Anthropic, etc.)
- Returns structured JSON with scores and reasoning

### Type Definitions (`/lib/types.ts`)
- TypeScript interfaces for type-safe API communication
- Ensures consistent data structure across frontend and backend

## 📋 Data Flow

```
User Input (Job Offer) 
    ↓
Frontend extracts: title, description, skills, min_experience
    ↓
API Request to /api/match
    ↓
LLM Analysis (with system prompt)
    ↓
Structured JSON Response
    ↓
Frontend displays results with:
    - Relevance scores
    - AI reasoning
    - Matching/missing skills
    - Summary insights
```

## 🔧 Current Implementation

The system currently uses a **mock matching algorithm** that:
- Calculates skill overlap ratios
- Evaluates experience requirements
- Generates basic reasoning

This allows the app to work immediately without LLM API keys.

## 🚀 Integrating with Real LLM

See `LLM_INTEGRATION.md` for detailed instructions on integrating with:
- OpenAI GPT-4
- Anthropic Claude
- Other LLM providers

## 📊 Example Usage

### Input Job Offer:
```
Title: Data Analyst Supply Chain
Description: Looking for a Data Analyst specialized in supply chain analytics
Required Skills: SQL, Tableau, Supply Chain, Python
Min Experience: 3 years
```

### Output:
```json
{
  "results": [
    {
      "candidate_name": "Alice Martin",
      "relevance_score": 85,
      "reasoning": "Strong match with 3/4 required skills...",
      "matching_skills": ["SQL", "Python", "Supply Chain"],
      "missing_skills": ["Tableau"]
    }
  ],
  "summary": "Found 8 candidates. Top match: Alice Martin (85%)..."
}
```

## 🎨 UI Features

- **Match Score Badges**: Color-coded (green/blue/yellow/red) based on score
- **AI Reasoning Section**: Shows LLM's explanation for each candidate
- **Skill Indicators**: 
  - ✓ Green badges for matching skills
  - ✗ Red badges for missing skills
- **Summary Panel**: Blue panel with overall analysis insights

## 🔐 Security Notes

- API keys should be stored in `.env.local` (not committed to git)
- The API route runs server-side only, protecting API keys
- Input validation prevents malformed requests

## 📝 Customization

### Adjust Matching Criteria
Edit the system prompt in `/app/api/match/route.ts`:
```typescript
function getSystemPrompt(): string {
  return `Your custom matching criteria...`
}
```

### Modify Scoring Weights
In the mock implementation, adjust:
```typescript
const relevanceScore = Math.round(
  (skillMatchRatio * 0.5 +      // 50% weight on skills
   experienceMatch * 0.3 +       // 30% weight on experience
   titleMatch * 0.2) * 100       // 20% weight on title
)
```

### Add More Matching Factors
Extend the `JobOffer` and `CandidateCV` types in `/lib/types.ts`:
```typescript
export interface JobOffer {
  title: string
  description: string
  required_skills: string[]
  min_experience: number
  location?: string           // Add location matching
  certifications?: string[]   // Add certification requirements
}
```

## 🧪 Testing

1. Start the development server:
```bash
npm run dev
```

2. Open http://localhost:3000

3. Test scenarios:
   - **Empty job offer**: Tests default matching
   - **Specific skills**: Enter "React, TypeScript, Node.js"
   - **Experience filter**: Set minimum experience in filters
   - **Custom description**: Full job description with requirements

## 📦 Dependencies

- Next.js 15.2.4
- React 19
- TypeScript 5
- Tailwind CSS
- shadcn/ui components

## 🔄 Future Enhancements

- [ ] Real-time streaming of LLM responses
- [ ] PDF CV upload and parsing
- [ ] Batch processing for multiple job offers
- [ ] Export results to CSV/PDF
- [ ] Candidate ranking history
- [ ] A/B testing different prompts
- [ ] Multi-language support
- [ ] Integration with ATS systems

## 📚 Related Files

- `LLM_INTEGRATION.md` - Detailed LLM integration guide
- `/app/api/match/route.ts` - API endpoint implementation
- `/lib/types.ts` - TypeScript type definitions
- `/app/page.tsx` - Main UI component
