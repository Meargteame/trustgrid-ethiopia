export interface TestimonialData {
  id: string;
  userId?: string;
  clientName: string;
  clientRole?: string;
  clientCompany?: string;
  clientEmail?: string;
  text: string;
  avatarUrl?: string;
  videoUrl?: string;
  verificationMethod: 'manual' | 'email' | 'linkedin';
  status: 'pending' | 'verified' | 'rejected';
  sourceUrl?: string;
  cardStyle?: 'white' | 'lime' | 'dark';
  createdAt: string;
  updatedAt?: string;
  score?: number; // AI Trust Score (0-100)
  sentiment?: 'Positive' | 'Neutral' | 'Negative'; // AI Sentiment
}

export interface TrustAnalysisResult {
  score: number;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  keywords: string[];
  reasoning: string;
  isAuthentic: boolean;
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface AnalyticsData {
  day: string;
  views: number;
  conversions: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  status: 'Active' | 'Pending';
  avatarUrl: string;
}

export type WidgetTheme = 'modern' | 'dark_mode' | 'minimalist';