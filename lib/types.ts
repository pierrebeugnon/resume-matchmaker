// Types for the LLM matching system

export interface JobOffer {
  title: string
  description: string
  required_skills: string[]
  min_experience: number
}

export interface CandidateCV {
  name: string
  job_title: string
  skills: string[]
  years_experience: number
  sectors?: string[]
}

export interface MatchingResult {
  candidate_name: string
  relevance_score: number
  reasoning: string
  matching_skills: string[]
  missing_skills: string[]
  sectors?: string[]
}

export interface MatchingResponse {
  results: MatchingResult[]
  summary: string
}

export interface MatchingWeights {
  technicalSkills: number
  experience: number
  training: number
  context: number
}

export interface MatchingRequest {
  job_offer: JobOffer
  cv_list: CandidateCV[]
  weights?: MatchingWeights
}
