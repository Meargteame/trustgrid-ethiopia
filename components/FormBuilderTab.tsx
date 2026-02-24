
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  Save, 
  Loader2, 
  Plus, 
  Trash2, 
  GripVertical, 
  Eye, 
  Settings, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';

// We can import types, but we might need to adapt them since DB returns snake_case
import { FormConfig, QuestionConfig } from '../types';

interface FormBuilderTabProps {
  userId: string;
}

// Local interface matching DB structure for easier handling
interface DbFormConfig {
  id?: string;
  user_id?: string;
  title: string;
  subtitle: string;
  allow_video: boolean;
  allow_photo: boolean;
  allow_linkedin_import: boolean;
  questions: QuestionConfig[];
  updated_at?: string;
}

const DEFAULT_QUESTIONS: QuestionConfig[] = [
  { id: 'q1', label: 'What did you like most about working with us?', type: 'textarea', required: true },
  { id: 'q2', label: 'How would you rate our service?', type: 'rating', required: true }
];

export const FormBuilderTab: React.FC<FormBuilderTabProps> = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<DbFormConfig>({
    title: 'Share your experience',
    subtitle: 'Your feedback helps us grow.',
    allow_video: true,
    allow_photo: true,
    allow_linkedin_import: true,
    questions: DEFAULT_QUESTIONS
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, [userId]);

  const fetchConfig = async () => {
    try {
      setLoading(true);
     
      // 1. Check if config exists
      const { data, error } = await supabase
        .from('form_configs')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found"
        throw error;
      }

      if (data) {
        // Map DB response to state
        setConfig({
          id: data.id,
          user_id: data.user_id,
          title: data.title || '',
          subtitle: data.subtitle || '',
          allow_video: data.allow_video ?? true,
          allow_photo: data.allow_photo ?? true,
          allow_linkedin_import: data.allow_linkedin_import ?? true,
          questions: (data.questions as unknown as QuestionConfig[]) || DEFAULT_QUESTIONS
        });
      } else {
        // No config found, we will use defaults.
        // Optionally, we could create one immediately, but waiting for "Save" is also fine.
      }

    } catch (err: any) {
      console.error('Error fetching form config:', err);
      setMessage({ type: 'error', text: 'Failed to load form settings.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const payload = {
        user_id: userId,
        title: config.title,
        subtitle: config.subtitle,
        allow_video: config.allow_video,
        allow_photo: config.allow_photo,
        allow_linkedin_import: config.allow_linkedin_import,
        questions: config.questions
      };

      // Upsert: update if exists, insert if not
      // We need to match on user_id, but the table primary key is id. 
      // The table has a unique constraint on user_id, so we can likely use that for conflict resolution 
      // strictly if we explicitly tell Supabase to use it, OR we just query by user_id first (which we did).
      
      // Since we did a fetch, we know if we have an ID or not, but 'upsert' works efficiently with unique keys.
      // However, Supabase upsert usually needs the primary key or a unique constraint to match on.
      // Let's rely on user_id being unique.

      const { error } = await supabase
        .from('form_configs')
        .upsert(
          payload, 
          { onConflict: 'user_id' }
        );

      if (error) throw error;

      setMessage({ type: 'success', text: 'Form settings saved successfully!' });
      
      // Refresh to get any server-generated fields if needed
      if (!config.id) {
        fetchConfig();
      }

    } catch (err: any) {
      console.error('Error saving form config:', err);
      setMessage({ type: 'error', text: 'Failed to save changes.' });
    } finally {
      setSaving(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const addQuestion = () => {
    const newQ: QuestionConfig = {
      id: `q${Date.now()}`,
      label: 'New Question',
      type: 'text',
      required: false
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
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Form Builder</h2>
          <p className="text-gray-500">Customize how your public collection form looks and behaves.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium disabled:opacity-70"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* General Settings Section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-gray-800">General Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Form Title</label>
            <input
              type="text"
              value={config.title}
              onChange={(e) => setConfig({ ...config, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              placeholder="e.g. Share your experience"
            />
            <p className="text-xs text-gray-500">The main heading of your collection page.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Subtitle / Message</label>
            <input
              type="text"
              value={config.subtitle}
              onChange={(e) => setConfig({ ...config, subtitle: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              placeholder="e.g. We'd love to hear your feedback."
            />
            <p className="text-xs text-gray-500">A short welcome message to your users.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
              <input
                type="checkbox"
                checked={config.allow_video}
                onChange={(e) => setConfig({ ...config, allow_video: e.target.checked })}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Allow Video Reviews</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
              <input
                type="checkbox"
                checked={config.allow_photo}
                onChange={(e) => setConfig({ ...config, allow_photo: e.target.checked })}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">Allow Photo Uploads</span>
            </label>

            <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
              <input
                type="checkbox"
                checked={config.allow_linkedin_import}
                onChange={(e) => setConfig({ ...config, allow_linkedin_import: e.target.checked })}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
              />
              <span className="text-sm font-medium text-gray-700">LinkedIn Import</span>
            </label>
        </div>
      </section>

      {/* Questions Builder Section */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-800">Questions</h3>
          </div>
          <button
            onClick={addQuestion}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>

        <div className="space-y-4">
          {config.questions.length === 0 ? (
            <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              No questions added yet.
            </div>
          ) : (
            config.questions.map((q, index) => (
              <div 
                key={q.id} 
                className="group relative bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow duration-200"
              >
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => removeQuestion(q.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Remove Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                  {/* Grip Handle (visual only for now) */}
                  <div className="hidden md:flex flex-col justify-center pt-3 text-gray-300 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Question Fields */}
                  <div className="md:col-span-11 grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="md:col-span-2 space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Question Label</label>
                      <input
                        type="text"
                        value={q.label}
                        onChange={(e) => updateQuestion(q.id, { label: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                        placeholder="e.g. What specific results did you see?"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</label>
                      <select
                        value={q.type}
                        onChange={(e) => updateQuestion(q.id, { type: e.target.value as any })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      >
                        <option value="text">Short Text</option>
                        <option value="textarea">Long Text (TextArea)</option>
                        <option value="rating">Star Rating</option>
                      </select>
                    </div>

                    <div className="flex items-end pb-2">
                       <label className="flex items-center space-x-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-sm text-gray-700">Required Field</span>
                      </label>
                    </div>
                    
                    {/* Optional Placeholder for text inputs */}
                    {(q.type === 'text' || q.type === 'textarea') && (
                      <div className="md:col-span-2 space-y-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Placeholder (Optional)</label>
                        <input
                          type="text"
                          value={q.placeholder || ''}
                          onChange={(e) => updateQuestion(q.id, { placeholder: e.target.value })}
                          className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                          placeholder="e.g. Describes the placeholder text..."
                        />
                      </div>
                    )}

                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

    </div>
  );
}
