import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { User, Mail, Palette, Save, Loader2, Globe, Upload, Image, CheckCircle2, X, Send, AlertCircle } from 'lucide-react';
import { Toast } from './Toast';
import { TrustGridMark } from './TrustGridLogo';
import { broadcastToTelegram } from '../lib/telegramBroadcast';

interface SettingsTabProps {
  onProfileUpdate?: () => void;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ onProfileUpdate }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingBroadcast, setTestingBroadcast] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    companyName: '',
    website: '',
    primaryColor: '#D7FF3D',
    logoUrl: '',
    email: '',
    username: '',
    telegramChannel: '',
    telegramBotToken: ''
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

      // 1. Fetch from Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
      }

      // 2. Read fallback storage for Telegram broadcast configs
      const localChannel = localStorage.getItem(`tg_channel_${user.id}`) || '';
      const localToken = localStorage.getItem(`tg_bot_token_${user.id}`) || '';

      if (data) {
        setFormData({
          companyName: data.company_name || '',
          website: data.website || '',
          primaryColor: data.primary_color || '#D7FF3D',
          logoUrl: data.logo_url || data.avatar_url || '',
          email: data.email || user.email || '',
          username: data.username || '',
          telegramChannel: (data as any).telegram_channel || localChannel,
          telegramBotToken: (data as any).telegram_bot_token || localToken
        });
      } else {
        setFormData(prev => ({
          ...prev,
          email: user.email || '',
          companyName: user.user_metadata?.company_name || '',
          telegramChannel: localChannel,
          telegramBotToken: localToken
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

        const { error: uploadError } = await supabase.storage
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

      // Persist Telegram config to local storage cache as well
      localStorage.setItem(`tg_channel_${user.id}`, formData.telegramChannel);
      localStorage.setItem(`tg_bot_token_${user.id}`, formData.telegramBotToken);

      const updates: any = {
        id: user.id,
        company_name: formData.companyName,
        website: formData.website,
        primary_color: formData.primaryColor,
        logo_url: formData.logoUrl,
        avatar_url: formData.logoUrl,
        username: formData.username,
        updated_at: new Date().toISOString(),
      };

      // Try updating with telegram channel fields
      const { error } = await supabase
        .from('profiles')
        .upsert({
          ...updates,
          telegram_channel: formData.telegramChannel,
          telegram_bot_token: formData.telegramBotToken
        });

      if (error) {
        // Fallback if telegram columns do not exist yet in DB schema
        await supabase.from('profiles').upsert(updates);
      }

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

  const handleTestBroadcast = async () => {
    if (!formData.telegramChannel) {
      setToast({ message: 'Please enter a Telegram Channel username or Chat ID first.', type: 'warning' });
      return;
    }

    setTestingBroadcast(true);
    try {
      const result = await broadcastToTelegram(
        {
          telegramChannel: formData.telegramChannel,
          telegramBotToken: formData.telegramBotToken
        },
        {
          clientName: 'Yonas Alemayehu',
          clientRole: 'Founder',
          clientCompany: formData.companyName || 'Addis Tech Hub',
          text: 'TrustGrid made collecting and displaying verified customer proof completely seamless for our business in Addis Ababa. 100% recommended!',
          rating: 5,
          score: 100,
          wallUrl: `${window.location.origin}/wall/${formData.username || 'demo'}`
        }
      );

      if (result.success) {
        setToast({ 
          message: `✅ Test broadcast successfully posted to ${formData.telegramChannel}!`, 
          type: 'success' 
        });
      } else {
        setToast({ 
          message: result.error || 'Failed to post test message to Telegram.', 
          type: 'error' 
        });
      }
    } catch (err: any) {
      setToast({ message: err.message || 'Broadcast error.', type: 'error' });
    } finally {
      setTestingBroadcast(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A0A0A]" />
        <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Loading Settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-fade-in pb-20 font-sans">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#0A0A0A] tracking-tight mb-1">Workspace Settings</h1>
          <p className="text-[#6B7280] text-sm">Manage your brand identity, public wall links, and Telegram broadcast automation.</p>
        </div>

        <button 
          onClick={handleSave} 
          disabled={saving}
          className="px-5 py-2.5 bg-[#0A0A0A] text-[#FFFFFF] font-bold text-xs rounded-xl hover:bg-[#222222] transition-colors flex items-center gap-2 disabled:opacity-50 flex-shrink-0"
        >
          {saving ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </header>
         
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* SECTION 1: Company Profile & Links */}
        <section className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <User size={18} className="text-[#0A0A0A]" />
            <h2 className="text-base font-black text-[#0A0A0A]">Company Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#6B7280] uppercase">Company Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-[#0A0A0A] outline-none transition-all"
                placeholder="e.g. Leons Lab Studio"
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#6B7280] uppercase">Website URL</label>
              <div className="relative">
                <Globe size={15} className="absolute left-3.5 top-3.5 text-[#6B7280]" />
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  className="w-full pl-10 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-[#0A0A0A] outline-none transition-all"
                  placeholder="https://leonslab.tech"
                />
              </div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="block text-xs font-bold text-[#6B7280] uppercase">Public Handle (slug)</label>
              <div className="flex items-center">
                <span className="text-[#6B7280] text-xs font-mono bg-[#F4F4F5] border border-r-0 border-gray-200 px-3.5 py-2.5 rounded-l-xl flex-shrink-0">
                  {window.location.origin}/wall/
                </span>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  className="w-full px-4 py-2.5 rounded-r-xl border border-gray-200 text-sm font-bold focus:ring-2 focus:ring-[#0A0A0A] outline-none transition-all"
                  placeholder="leonslab"
                />
              </div>
              <p className="text-[11px] text-[#6B7280]">Your public wall of proof will be available at this permanent address.</p>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="block text-xs font-bold text-[#6B7280] uppercase">Contact Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-3.5 text-[#6B7280]" />
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full pl-10 px-4 py-2.5 rounded-xl border border-gray-200 bg-[#F4F4F5] text-[#6B7280] text-sm cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-[#6B7280]">Account authentication email.</p>
            </div>
          </div>
        </section>

        {/* SECTION 2: Brand Identity & Colors */}
        <section className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
            <Palette size={18} className="text-[#0A0A0A]" />
            <h2 className="text-base font-black text-[#0A0A0A]">Brand Identity & Logo</h2>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#6B7280] uppercase mb-2">Accent Color</label>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-2">
                  {['#D7FF3D', '#3B82F6', '#A855F7', '#EF4444', '#10B981', '#0A0A0A'].map((color) => (
                    <button
                      type="button"
                      key={color}
                      onClick={() => handleChange('primaryColor', color)}
                      className={`w-8 h-8 rounded-full border border-gray-200 transition-all ${formData.primaryColor === color ? 'ring-2 ring-offset-2 ring-[#0A0A0A] scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                
                <div className="flex items-center border border-gray-200 rounded-xl px-2.5 bg-[#FFFFFF]">
                  <span className="text-[#6B7280] text-xs mr-1 font-mono">#</span>
                  <input 
                    type="text" 
                    value={formData.primaryColor.replace('#', '')}
                    onChange={(e) => handleChange('primaryColor', '#' + e.target.value)}
                    className="w-20 py-2 outline-none text-xs font-mono uppercase text-[#0A0A0A] font-bold"
                    maxLength={6}
                  />
                </div>
                <div className="w-8 h-8 rounded-lg border border-gray-200" style={{ backgroundColor: formData.primaryColor }}></div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6B7280] uppercase mb-2">Company Logo</label>
              
              <input 
                type="file" 
                ref={logoInputRef}
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden" 
              />

              <div className="flex items-center gap-4 p-4 bg-[#F4F4F5] rounded-xl border border-gray-200">
                {formData.logoUrl ? (
                  <div className="w-16 h-16 rounded-xl bg-white border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img 
                      src={formData.logoUrl} 
                      alt="Logo Preview" 
                      className="w-full h-full object-cover" 
                      onError={(e) => (e.currentTarget.style.display = 'none')} 
                    />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-white border border-dashed border-gray-300 flex items-center justify-center flex-shrink-0 text-gray-400">
                    <Image size={24} />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#0A0A0A] mb-1">
                    {formData.logoUrl ? "Logo Active" : "No Logo Uploaded"}
                  </p>
                  <p className="text-[11px] text-[#6B7280] mb-3">
                    Displayed on your public wall, embed widgets, and review forms.
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={uploadingLogo}
                      onClick={() => logoInputRef.current?.click()}
                      className="px-3.5 py-1.5 bg-[#0A0A0A] text-[#FFFFFF] rounded-lg text-xs font-bold hover:bg-[#222222] transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {uploadingLogo ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={13} />
                          <span>Upload Image</span>
                        </>
                      )}
                    </button>

                    {formData.logoUrl && (
                      <button
                        type="button"
                        onClick={() => handleChange('logoUrl', '')}
                        className="px-2.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-[#0A0A0A] rounded-lg text-xs font-bold transition-colors"
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
        </section>

        {/* SECTION 3: Telegram Channel Broadcast (Dedicated Standalone Card) */}
        <section className="bg-[#FFFFFF] border border-gray-200 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F4F4F5] border border-gray-200 flex items-center justify-center">
                <TrustGridMark size={16} />
              </div>
              <div>
                <h2 className="text-base font-black text-[#0A0A0A]">Telegram Channel Broadcast</h2>
                <p className="text-xs text-[#6B7280]">Auto-push 5-star verified reviews directly to your Telegram channel or group</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#6B7280] uppercase">Telegram Channel Username / Chat ID</label>
              <input
                type="text"
                value={formData.telegramChannel}
                onChange={(e) => handleChange('telegramChannel', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0A0A0A] outline-none transition-all"
                placeholder="@your_channel"
              />
              <p className="text-[11px] text-[#6B7280]">e.g. <code>@leonslab</code> or <code>-1001234567890</code></p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#6B7280] uppercase">Custom Bot Token (Optional)</label>
              <input
                type="password"
                value={formData.telegramBotToken}
                onChange={(e) => handleChange('telegramBotToken', e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0A0A0A] outline-none transition-all"
                placeholder="123456789:ABCdefGHIjkl..."
              />
              <p className="text-[11px] text-[#6B7280]">Leave blank to use the official TrustGrid Bot.</p>
            </div>
          </div>

          {/* How It Works Guide Banner */}
          <div className="p-4 bg-[#F4F4F5] rounded-xl border border-gray-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0A0A0A]">
              <span>📢</span>
              <span>How Channel Broadcasting Works:</span>
            </div>
            <ol className="text-xs text-[#6B7280] space-y-1 list-decimal list-inside leading-relaxed pl-1">
              <li>Add your bot as an <strong>Administrator</strong> to your channel with <em>"Post Messages"</em> permission.</li>
              <li>Enter your channel username above (e.g. <code>@your_channel</code>).</li>
              <li>Whenever a client submits or you approve a 5-star verified review, TrustGrid automatically formats and broadcasts the verified social proof into your channel!</li>
            </ol>
          </div>

          {/* Interactive Test Broadcast Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
            <p className="text-xs text-[#6B7280]">
              Test your channel connection before going live:
            </p>
            <button
              type="button"
              onClick={handleTestBroadcast}
              disabled={testingBroadcast || !formData.telegramChannel}
              className="px-4 py-2 bg-[#F4F4F5] hover:bg-gray-200 border border-gray-200 text-[#0A0A0A] rounded-xl text-xs font-bold transition-colors flex items-center gap-2 disabled:opacity-40 flex-shrink-0"
            >
              {testingBroadcast ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              <span>{testingBroadcast ? 'Broadcasting...' : 'Send Test Review to Channel'}</span>
            </button>
          </div>
        </section>

        {/* Bottom Save Action */}
        <div className="flex justify-end pt-2">
          <button 
            type="submit" 
            disabled={saving}
            className="px-6 py-3 bg-[#0A0A0A] text-[#FFFFFF] font-bold text-xs rounded-xl hover:bg-[#222222] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />}
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
