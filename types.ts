
export interface FormConfig {
  id: string;
  userId: string;
  title: string;
  subtitle: string;
  questions: QuestionConfig[];
  allowVideo: boolean;
  allowPhoto: boolean;
  allowLinkedinImport: boolean;
}

export interface QuestionConfig {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'rating';
  required: boolean;
  placeholder?: string;
}

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
  verificationMethod: 'manual' | 'email' | 'linkedin' | 'telegram';
  status: 'pending' | 'verified' | 'rejected';
  sourceUrl?: string;
  cardStyle?: 'white' | 'lime' | 'dark';
  createdAt: string;
  updatedAt?: string;
  score?: number; // Star rating (0-100)
  reviewerTelegramUsername?: string;
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

export type WidgetTheme = 'modern' | 'dark_mode' | 'minimalist' | 'brand';
export type WidgetLayout = 'grid' | 'carousel' | 'list' | 'popup';

export interface WidgetConfig {
  id?: string;
  user_id?: string;
  layout: WidgetLayout;
  theme: WidgetTheme;
  columns: number;
  gap: string;
  border_radius: string;
  shadow: string;
  font: 'inter' | 'serif' | 'mono';
  header_title: string;
  show_rating: boolean;
  show_date: boolean;
  show_avatar: boolean;
  min_rating: number;
  cards_to_show: number;
}