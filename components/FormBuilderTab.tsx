import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Save, 
  Loader2, 
  Plus, 
  Trash2, 
  Eye, 
  ChevronUp, 
  ChevronDown, 
  Sparkles,
  Settings, 
  Video, 
  Camera, 
  Gift
} from 'lucide-react';
import { FormConfig, QuestionConfig } from '../types';
import { Toast } from './Toast';

interface FormBuilderTabProps {
  userId: string;
}

interface DbFormConfig {
  id?: string;
  user_id?: string;
  title: string;
  subtitle: string;
  incentive_message?: string;
  allow_video: boolean;
  allow_photo: boolean;
  allow_linkedin_import: boolean;
  questions: QuestionConfig[];
  updated_at?: string;
}

const DEFAULT_QUESTIONS: QuestionConfig[] = [
  { id: 'q1', label: 'What did you like most about working with us?', type: 'textarea', required: true, placeholder: 'Share details of your experience...' },
  { id: 'q2', label: 'How would you rate our service?', type: 'rating', required: true }
];

export const FormBuilderTab: React.FC<FormBuilderTabProps> = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [config, setConfig] = useState<DbFormConfig>({
    title: 'Share your experience',
    subtitle: 'Your feedback helps us grow and helps others make informed decisions.',
    incentive_message: '',
    allow_video: true,
    allow_photo: true,
    allow_linkedin_import: true,
    questions: DEFAULT_QUESTIONS
  });

  useEffect(() => {
    fetchConfig();
  }, [userId]);

  const fetchConfig = async () => {
    try {
      setLoading(true);
     
      const { data, error } = await supabase
        .from('form_configs')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setConfig({
          id: data.id,
          user_id: data.user_id,
          title: data.title || '',
          subtitle: data.subtitle || '',
          incentive_message: data.incentive_message || '',
          allow_video: data.allow_video ?? true,
          allow_photo: data.allow_photo ?? true,
          allow_linkedin_import: data.allow_linkedin_import ?? true,
          questions: (data.questions as unknown as QuestionConfig[]) || DEFAULT_QUESTIONS
        });
      }
    } catch (err: any) {
      console.error('Error fetching form config:', err);
      setToast({ message: 'Failed to load form settings.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const payload = {
        user_id: userId,
        title: config.title,
        subtitle: config.subtitle,
        incentive_message: config.incentive_message,
        allow_video: config.allow_video,
        allow_photo: config.allow_photo,
        allow_linkedin_import: config.allow_linkedin_import,
        questions: config.questions,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('form_configs')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) throw error;

      setToast({ message: 'Collection form settings saved successfully!', type: 'success' });
      
      if (!config.id) {
        fetchConfig();
      }
    } catch (err: any) {
      console.error('Error saving form config:', err);
      setToast({ message: 'Failed to save form changes.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    const newQ: QuestionConfig = {
      id: `q${Date.now()}`,
      label: 'New Question',
      type: 'textarea',
      required: false,
      placeholder: 'Enter your response here...'
    };
    setConfig(prev => ({
      ...prev,
      questions: [...prev.questions, newQ]
    }));
  };

  const removeQuestion = (qId: string) => {
    setConfig(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== qId)
    }));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= config.questions.length) return;

    const updated = [...config.questions];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);

    setConfig(prev => ({ ...prev, questions: updated }));
  };

  const updateQuestion = (qId: string, updates: Partial<QuestionConfig>) => {
    setConfig(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === qId ? { ...q, ...updates } : q
      )
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 rounded-full border-3 border-gray-200 border-t-black animate-spin"></div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Loading Form Builder...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20 font-sans">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#0A0A0A] tracking-tight">Collection Form Studio</h2>
          <p className="text-[#6B7280] text-sm">Customize how clients submit testimonials and video reviews.</p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0A0A0A] text-[#FFFFFF] rounded-xl hover:bg-[#222222] text-xs font-bold transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* General Settings Section */}
      <section className="bg-[#FFFFFF] rounded-2xl border border-gray-200 p-6 space-y-6">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
          <Settings className="w-5 h-5 text-[#0A0A0A]" />
          <h3 className="text-base font-black text-[#0A0A0A]">Form Header & Rewards</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#6B7280] uppercase">Page Title</label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0A0A0A] outline-none transition-all"
              placeholder="e.g. Share your experience"
            />
            <p className="text-[11px] text-[#6B7280]">Main heading displayed on the collection page.</p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#6B7280] uppercase">Subtitle / Instructions</label>
            <input
              type="text"
              value={config.subtitle}
              onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0A0A0A] outline-none transition-all"
              placeholder="e.g. We'd love to hear your feedback."
            />
            <p className="text-[11px] text-[#6B7280]">A short description guiding your clients.</p>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-xs font-bold text-[#6B7280] uppercase flex items-center gap-1.5">
              <Gift size={13} className="text-amber-500" /> Incentive / Reward Banner (Optional)
            </label>
            <input
              type="text"
              value={config.incentive_message || ''}
              onChange={(e) => setConfig({ ...config, incentive_message: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0A0A0A] outline-none transition-all"
              placeholder="e.g. Leave a video review and receive a 10% discount on your next service!"
            />
            <p className="text-[11px] text-[#6B7280]">Highlighted reward box to boost customer participation.</p>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:border-[#0A0A0A] transition-colors">
              <input
                type="checkbox"
                checked={config.allow_video}
                onChange={(e) => setConfig({ ...config, allow_video: e.target.checked })}
                className="w-4 h-4 text-[#0A0A0A] accent-[#0A0A0A] rounded cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-[#0A0A0A] flex items-center gap-1.5">
                  <Video size={14} className="text-rose-500" /> Allow Video Reviews
                </span>
                <p className="text-[10px] text-[#6B7280]">Enable in-browser video camera recorder</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 hover:border-[#0A0A0A] transition-colors">
              <input
                type="checkbox"
                checked={config.allow_photo}
                onChange={(e) => setConfig({ ...config, allow_photo: e.target.checked })}
                className="w-4 h-4 text-[#0A0A0A] accent-[#0A0A0A] rounded cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-[#0A0A0A] flex items-center gap-1.5">
                  <Camera size={14} className="text-blue-500" /> Allow Photo & Logo Uploads
                </span>
                <p className="text-[10px] text-[#6B7280]">Permit custom headshot attachments</p>
              </div>
            </label>
        </div>
      </section>

      {/* Questions Builder Section */}
      <section className="bg-[#FFFFFF] rounded-2xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#0A0A0A]" />
            <h3 className="text-base font-black text-[#0A0A0A]">Form Questions</h3>
          </div>
          
          <button
            onClick={addQuestion}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs bg-[#0A0A0A] text-[#FFFFFF] rounded-xl hover:bg-[#222222] transition-colors font-bold"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Question
          </button>
        </div>

        <div className="space-y-4">
          {config.questions.length === 0 ? (
            <div className="text-center py-10 text-[#6B7280] border border-dashed border-gray-200 rounded-2xl">
              No questions configured. Click "Add Question" above.
            </div>
          ) : (
            config.questions.map((q, index) => (
              <div 
                key={q.id} 
                className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-5 hover:border-gray-300 transition-all relative group"
              >
                {/* Actions Top Bar */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-black bg-gray-100 px-2 py-0.5 rounded-md">
                      Q{index + 1}
                    </span>
                    <div className="flex items-center ml-2">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveQuestion(index, 'up')}
                        className="p-1 text-gray-400 hover:text-black disabled:opacity-20 transition-colors"
                        title="Move Up"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        type="button"
                        disabled={index === config.questions.length - 1}
                        onClick={() => moveQuestion(index, 'down')}
                        className="p-1 text-gray-400 hover:text-black disabled:opacity-20 transition-colors"
                        title="Move Down"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => removeQuestion(q.id)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Question Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  <div className="md:col-span-2 space-y-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase">Question Prompt</label>
                    <input
                      type="text"
                      value={q.label}
                      onChange={(e) => updateQuestion(q.id, { label: e.target.value })}
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all text-sm font-medium"
                      placeholder="e.g. What specific results did you see?"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-gray-700 uppercase">Field Type</label>
                    <select
                      value={q.type}
                      onChange={(e) => updateQuestion(q.id, { type: e.target.value as any })}
                      className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all text-sm font-bold text-black"
                    >
                      <option value="textarea">Long Text Area</option>
                      <option value="text">Short Single Line</option>
                      <option value="rating">5-Star Rating</option>
                    </select>
                  </div>

                  <div className="flex items-end pb-2">
                     <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={q.required}
                        onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                        className="w-4 h-4 text-black accent-black rounded cursor-pointer"
                      />
                      <span className="text-xs font-bold text-gray-800">Required Question</span>
                    </label>
                  </div>
                  
                  {/* Optional Placeholder */}
                  {(q.type === 'text' || q.type === 'textarea') && (
                    <div className="md:col-span-2 space-y-1">
                      <label className="block text-xs font-bold text-gray-700 uppercase">Input Placeholder</label>
                      <input
                        type="text"
                        value={q.placeholder || ''}
                        onChange={(e) => updateQuestion(q.id, { placeholder: e.target.value })}
                        className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-black outline-none transition-all text-xs font-medium text-gray-600 placeholder-gray-400"
                        placeholder="e.g. Write your details here..."
                      />
                    </div>
                  )}

                </div>
              </div>
            ))
          )}
        </div>
      </section>

    </div>
  );
};
