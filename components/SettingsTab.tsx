import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, Mail, Palette, Save, Loader2, Globe, Upload } from 'lucide-react';
import { Button } from './Button';

interface SettingsTabProps {
  onProfileUpdate?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ onProfileUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    primaryColor: '#D4F954',
    logoUrl: '',
    email: '', // Read-only mostly, but good to show
    username: ''
  });
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      if (data) {
        setFormData({
          companyName: data.company_name || '',
          website: data.website || '',
          primaryColor: data.primary_color || '#D4F954',
          logoUrl: data.logo_url || '',
          email: data.email || user.email || '',
          username: data.username || ''
        });
      } else {
        // Fallback to user metadata if profile doesn't exist yet
        setFormData(prev => ({
            ...prev,
            email: user.email || '',
            companyName: user.user_metadata?.company_name || ''
        }));
      }
    } catch (err) {
      console.error('Error in fetchProfile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user logged in');
      }

      const updates = {
        id: user.id,
        company_name: formData.companyName,
        website: formData.website,
        primary_color: formData.primaryColor,
        logo_url: formData.logoUrl,
        username: formData.username,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;

      setMessage({ text: 'Settings saved successfully!', type: 'success' });
      
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (error: any) {
        console.error('Error updating profile:', error);
      setMessage({ text: error.message || 'Error saving settings.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in pb-20">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold text-black mb-1">Account & Branding</h1>
        <p className="text-gray-500 text-sm">Manage your company profile and brand appearance.</p>
      </header>

         {message && (
            <div className={`mb-6 p-4 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
               <span className="font-bold text-sm">{message.text}</span>
            </div>
         )}
         
      <form onSubmit={handleSave} className="space-y-8">
        {/* Company Details */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <User size={20} /> Company Information
          </h3>
          <div className="grid gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-black focus:ring-0 outline-none transition-colors"
                placeholder="e.g. Acme Corp"
              />
            </div>
            
             <div>
               <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Website</label>
               <div className="relative">
                 <Globe size={16} className="absolute left-3 top-3 text-gray-400" />
                 <input
                   type="url"
                   value={formData.website}
                   onChange={(e) => handleChange('website', e.target.value)}
                   className="w-full pl-10 px-4 py-2 rounded-xl border border-gray-300 focus:border-black focus:ring-0 outline-none transition-colors"
                   placeholder="https://acme.com"
                 />
               </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Public Handle (slug)</label>
                <div className="flex items-center">
                   <span className="text-gray-400 text-sm bg-gray-100 border border-r-0 border-gray-300 px-3 py-2 rounded-l-xl">trustgrid.et/</span>
                   <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleChange('username', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="w-full px-4 py-2 rounded-r-xl border border-gray-300 focus:border-black focus:ring-0 outline-none transition-colors"
                      placeholder="company-name"
                   />
                </div>
             </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full pl-10 px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Email cannot be changed directly.</p>
            </div>
          </div>
        </div>

        {/* Branding Section */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Palette size={20} /> Branding
          </h3>
          <div className="grid gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Brand Color</label>
              <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    {['#D4F954', '#3B82F6', '#A855F7', '#EF4444', '#10B981', '#111111'].map((color) => (
                      <button
                        type="button"
                        key={color}
                        onClick={() => handleChange('primaryColor', color)}
                        className={`w-8 h-8 rounded-full border border-gray-200 transition-all ${formData.primaryColor === color ? 'ring-2 ring-offset-2 ring-black scale-110' : 'hover:scale-105'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center border border-gray-300 rounded-lg px-2 bg-white">
                      <span className="text-gray-500 text-sm mr-1">#</span>
                      <input 
                        type="text" 
                        value={formData.primaryColor.replace('#', '')}
                        onChange={(e) => handleChange('primaryColor', '#' + e.target.value)}
                        className="w-20 py-1 outline-none text-sm font-mono uppercase"
                        maxLength={6}
                      />
                  </div>
                  <div className="w-10 h-10 rounded-lg border border-gray-200 shadow-sm" style={{ backgroundColor: formData.primaryColor }}></div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Logo URL</label>
              <div className="flex gap-2">
                 <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) => handleChange('logoUrl', e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:border-black focus:ring-0 outline-none transition-colors"
                 />
              </div>
              <p className="text-[10px] text-gray-500 mt-2">
                 Paste a direct link to your logo image. (File upload coming soon)
              </p>
            </div>
            
            {/* Logo Preview */}
            {formData.logoUrl && (
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center overflow-hidden">
                        <img src={formData.logoUrl} alt="Logo Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-black">Logo Preview</p>
                        <p className="text-[10px] text-gray-500">This will be displayed on your widgets and invoices.</p>
                    </div>
                </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4">
            <Button type="submit" size="lg" disabled={saving}>
               {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" size={18} />}
               {saving ? 'Saving...' : 'Save Changes'}
            </Button>
        </div>
      </form>
    </div>
  );
};
