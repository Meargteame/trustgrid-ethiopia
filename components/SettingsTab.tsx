import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { User, Mail, Palette, Save, Loader2, Globe, Upload, Image, CheckCircle2, X } from 'lucide-react';
import { Button } from './Button';
import { Toast } from './Toast';

interface SettingsTabProps {
  onProfileUpdate?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ onProfileUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    primaryColor: '#D4F954',
    logoUrl: '',
    email: '',
    username: ''
  });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning' } | null>(null);

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
          logoUrl: data.logo_url || data.avatar_url || '',
          email: data.email || user.email || '',
          username: data.username || ''
        });
      } else {
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

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadingLogo(true);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not logged in");

        const ext = file.name.split('.').pop() || 'png';
        const fileName = `${user.id}/logo_${Date.now()}.${ext}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        setFormData(prev => ({ ...prev, logoUrl: publicUrl }));
        setToast({ message: "Logo uploaded successfully!", type: "success" });
      } catch (err: any) {
        console.error("Logo upload error:", err);
        setToast({ message: err.message || "Failed to upload logo image.", type: "error" });
      } finally {
        setUploadingLogo(false);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

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
        avatar_url: formData.logoUrl,
        username: formData.username,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(updates);

      if (error) throw error;

      setToast({ message: 'Settings saved successfully!', type: 'success' });
      
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setToast({ message: error.message || 'Error saving settings.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 rounded-full border-3 border-gray-200 border-t-black animate-spin"></div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in pb-20 font-sans">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-black mb-1">Account & Branding</h1>
        <p className="text-gray-500 text-sm">Manage your company credentials and wall presentation.</p>
      </header>
         
      <form onSubmit={handleSave} className="space-y-6">
        {/* Company Details */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-extrabold mb-4 text-black flex items-center gap-2">
            <User size={18} className="text-gray-600" /> Company Information
          </h3>
          
          <div className="grid gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Company Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all placeholder-gray-400"
                placeholder="e.g. Acme Studio"
              />
            </div>
            
             <div>
               <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Website URL</label>
               <div className="relative">
                 <Globe size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                 <input
                   type="url"
                   value={formData.website}
                   onChange={(e) => handleChange('website', e.target.value)}
                   className="w-full pl-10 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-black outline-none transition-all placeholder-gray-400"
                   placeholder="https://acme.com"
                 />
               </div>
             </div>

             <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Public Handle (slug)</label>
                <div className="flex items-center">
                   <span className="text-gray-400 text-xs font-bold bg-gray-50 border border-r-0 border-gray-200 px-3.5 py-3 rounded-l-xl">
                      trustgrid.leonslab.tech/wall/
                   </span>
                   <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleChange('username', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      className="w-full px-4 py-2.5 rounded-r-xl border border-gray-200 text-sm font-bold focus:ring-2 focus:ring-black outline-none transition-all placeholder-gray-400"
                      placeholder="username"
                   />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">This forms your permanent public Wall and Collection URLs.</p>
             </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Contact Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3.5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full pl-10 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">Email is tied to your account authentication.</p>
            </div>
          </div>
        </div>

        {/* Branding Section */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-extrabold mb-4 text-black flex items-center gap-2">
            <Palette size={18} className="text-gray-600" /> Brand Identity & Logo
          </h3>
          
          <div className="grid gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Accent Color</label>
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
                  <div className="flex items-center border border-gray-200 rounded-xl px-2.5 bg-white">
                      <span className="text-gray-400 text-xs mr-1 font-mono">#</span>
                      <input 
                        type="text" 
                        value={formData.primaryColor.replace('#', '')}
                        onChange={(e) => handleChange('primaryColor', '#' + e.target.value)}
                        className="w-20 py-1.5 outline-none text-xs font-mono uppercase text-black font-bold"
                        maxLength={6}
                      />
                  </div>
                  <div className="w-9 h-9 rounded-xl border border-gray-200 shadow-sm" style={{ backgroundColor: formData.primaryColor }}></div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Company Logo</label>
              
              <input 
                type="file" 
                ref={logoInputRef}
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden" 
              />

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                {formData.logoUrl ? (
                  <div className="w-16 h-16 rounded-2xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0 relative group">
                    <img 
                      src={formData.logoUrl} 
                      alt="Logo Preview" 
                      className="w-full h-full object-cover" 
                      onError={(e) => (e.currentTarget.style.display = 'none')} 
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-white border border-dashed border-gray-300 flex items-center justify-center flex-shrink-0 text-gray-400">
                    <Image size={24} />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-black mb-1">
                    {formData.logoUrl ? "Logo Active" : "No Logo Uploaded"}
                  </p>
                  <p className="text-[11px] text-gray-400 mb-3">
                    Displayed on your public wall, embed widgets, and review forms.
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={uploadingLogo}
                      onClick={() => logoInputRef.current?.click()}
                      className="px-3 py-1.5 bg-black text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {uploadingLogo ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={12} />
                          Upload Image
                        </>
                      )}
                    </button>

                    {formData.logoUrl && (
                      <button
                        type="button"
                        onClick={() => handleChange('logoUrl', '')}
                        className="px-2.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-xs font-bold transition-colors"
                        title="Remove Logo"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
            <button 
              type="submit" 
              disabled={saving}
              className="px-6 py-3.5 bg-black text-white font-extrabold text-xs rounded-xl hover:bg-gray-800 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
               {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
               {saving ? 'Saving...' : 'Save Settings'}
            </button>
        </div>
      </form>
    </div>
  );
};
