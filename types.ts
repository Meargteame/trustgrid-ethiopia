export interface TestimonialData {
  id: string;
  name: string;
  role: string;
  company: string;
  text: string;
  avatarUrl: string;
  verified: boolean;
  status: 'pending' | 'verified' | 'rejected';
  verificationMethod: 'manual' | 'telegram' | 'linkedin';
  date: string;
  style?: 'white' | 'lime' | 'dark';
  videoUrl?: string; // New: Support for video testimonials
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