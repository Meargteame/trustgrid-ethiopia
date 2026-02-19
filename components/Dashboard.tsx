import React, { useState } from 'react';
import { Button } from './Button';
import { 
  Plus, Copy, Code, LayoutGrid, Settings, 
  CheckCircle2, Clock, Send, Link as LinkIcon, 
  Image as ImageIcon, X, Palette, User, Mail, Shield,
  Trash2, LogOut, Check, Loader2, RefreshCw, BarChart3, ExternalLink,
  Share2, Users, Monitor, Layout
} from 'lucide-react';
import { TestimonialData, TeamMember, WidgetTheme } from '../types';
import { VerificationBadge } from './VerificationBadge';
import { AnalyticsTab } from './AnalyticsTab';
import { AiSummaryHeader } from './AiSummaryHeader';
import { TrustMeter } from './TrustMeter';
import { SocialShareModal } from './SocialShareModal';

const INITIAL_TESTIMONIALS: TestimonialData[] = [
  {
    id: '1',
    name: 'Abebe Kebede',
    role: 'Verified Customer',
    company: 'Addis Tech',
    text: 'TrustGrid has completely transformed how we showcase our reliability. The verification process is smooth and my clients love it.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100',
    verified: true,
    status: 'verified',
    verificationMethod: 'telegram',
    date: '2 hours ago',
    style: 'white'
  },
  {
    id: '2',
    name: 'Sara Tadesse',
    role: 'CEO',
    company: 'Bole Design',
    text: 'Best investment for our agency this year. Simple, fast, and builds instant credibility.',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100',
    verified: false,
    status: 'pending',
    verificationMethod: 'manual',
    date: '1 day ago',
    style: 'white'
  },
  {
    id: '3',
    name: 'Yonas Alemu',
    role: 'Freelancer',
    company: 'Self-Employed',
    text: 'I closed 3 deals this week just by sharing my TrustGrid link. It really works!',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&h=100',
    verified: true,
    status: 'verified',
    verificationMethod: 'linkedin',
    date: '3 days ago',
    style: 'lime'
  },
  {
    id: '4',
    name: 'Almaz Ayana',
    role: 'Small Business Owner',
    company: 'Merkato Trade',
    text: 'TrustGrid በጣም ጥሩ ነው። የደንበኞቼን እምነት ለማግኘት በጣም ጠቃሚ መሳሪያ ነው። አጠቃቀሙም ቀላል ነው።',
    avatarUrl: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=100&h=100',
    verified: true,
    status: 'verified',
    verificationMethod: 'telegram',
    date: '5 hours ago',
    style: 'white'
  }
];

const INITIAL_TEAM: TeamMember[] = [
  { id: '1', name: 'You', email: 'owner@addisdesign.et', role: 'Admin', status: 'Active', avatarUrl: 'https://ui-avatars.com/api/?name=You&background=000&color=fff' },
  { id: '2', name: 'Martha B.', email: 'martha@addisdesign.et', role: 'Editor', status: 'Active', avatarUrl: 'https://ui-avatars.com/api/?name=Martha&background=random' },
];

interface DashboardProps {
  onLogout: () => void;
  onOpenCollection: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onLogout, onOpenCollection }) => {
  const [testimonials, setTestimonials] = useState<TestimonialData[]>(INITIAL_TESTIMONIALS);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'feed' | 'analytics' | 'widgets' | 'settings'>('feed');
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // Widget Lab State
  const [activeTheme, setActiveTheme] = useState<WidgetTheme>('modern');

  // Social Share State
  const [shareModalData, setShareModalData] = useState<TestimonialData | null>(null);

  // Settings Form State
  const [profileData, setProfileData] = useState({
    companyName: 'Addis Design Co.',
    email: 'contact@addisdesign.et',
    primaryColor: '#D4F954'
  });

  // Modal Form State
  const [verificationType, setVerificationType] = useState<'manual' | 'telegram' | 'linkedin'>('manual');
  const [isFetching, setIsFetching] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    text: '',
    username: '', // for telegram
    linkedinUrl: '' // for linkedin
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Logic ---

  const calculateTrustScore = () => {
    let score = 0;
    // Base for account setup
    score += 10; 
    // Verified Reviews
    const verifiedCount = testimonials.filter(t => t.verified).length;
    score += (verifiedCount * 5);
    // Video Reviews
    const videoCount = testimonials.filter(t => t.videoUrl).length;
    score += (videoCount * 20);
    // LinkedIn Connected (Mocked as present if any review is linkedin verified)
    const hasLinkedin = testimonials.some(t => t.verificationMethod === 'linkedin');
    if (hasLinkedin) score += 15;

    return Math.min(100, score);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText('trustgrid.et/addis-design');
    showToast('Link copied to clipboard!');
  };

  const handleCopyEmbed = () => {
    const code = `<iframe src="https://trustgrid.et/embed/addis-design?theme=${activeTheme}" width="100%" height="600" frameborder="0"></iframe>`;
    navigator.clipboard.writeText(code);
    showToast('Code copied! Ready to paste into your Telegram portfolio or Website.');
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this proof?')) {
      setTestimonials(testimonials.filter(t => t.id !== id));
      showToast('Proof deleted successfully');
    }
  };

  const handleCustomizeStyle = (id: string) => {
    setTestimonials(testimonials.map(t => {
      if (t.id === id) {
        const styles: ('white' | 'lime' | 'dark')[] = ['white', 'lime', 'dark'];
        const currentIndex = styles.indexOf(t.style || 'white');
        const nextStyle = styles[(currentIndex + 1) % styles.length];
        return { ...t, style: nextStyle };
      }
      return t;
    }));
    showToast('Card style updated');
  };

  const handleSimulateFetch = () => {
    if (!formData.linkedinUrl) {
      showToast('Please paste a LinkedIn URL first', 'error');
      return;
    }
    setIsFetching(true);
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        name: 'Dawit Mekonnen',
        text: 'Working with Addis Design Co. was a game changer for our startup. Highly professional and timely delivery.',
      }));
      setIsFetching(false);
      showToast('Data fetched from LinkedIn!');
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTestimonial: TestimonialData = {
      id: Date.now().toString(),
      name: formData.name,
      role: 'Verified Customer',
      company: 'Unknown',
      text: formData.text,
      avatarUrl: `https://ui-avatars.com/api/?name=${formData.name}&background=random`,
      verified: verificationType !== 'manual',
      status: verificationType === 'manual' ? 'pending' : 'verified',
      verificationMethod: verificationType,
      date: 'Just now',
      style: 'white'
    };
    setTestimonials([newTestimonial, ...testimonials]);
    setIsModalOpen(false);
    setFormData({ name: '', text: '', username: '', linkedinUrl: '' });
    showToast('New proof added successfully!');
  };

  const handleSaveSettings = () => {
    showToast('Profile settings saved successfully!');
  };

  const handleInviteTeam = () => {
    const email = prompt("Enter team member email:");
    if (email) {
      const newMember: TeamMember = {
        id: Date.now().toString(),
        name: email.split('@')[0],
        email,
        role: 'Editor',
        status: 'Pending',
        avatarUrl: `https://ui-avatars.com/api/?name=${email}&background=random`
      };
      setTeamMembers([...teamMembers, newMember]);
      showToast('Invitation sent!');
    }
  };

  const filteredTestimonials = testimonials.filter(t => {
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const getCardStyle = (t: TestimonialData) => {
    let base = "";
    switch(t.style) {
      case 'lime': base = 'bg-brand-lime border-black'; break;
      case 'dark': base = 'bg-black border-black text-white'; break;
      default: base = 'bg-white border-black'; break;
    }
    if (t.verificationMethod === 'linkedin') {
      base += " shadow-[0_0_15px_rgba(252,230,118,0.6)] border-brand-yellow ring-1 ring-brand-yellow";
    }
    return base;
  };

  // --- Renderers ---

  const renderFeed = () => (
    <>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
           <h1 className="text-3xl font-extrabold text-black mb-1">Dashboard</h1>
           <p className="text-gray-500 text-sm">Manage your reputation and verified proofs.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {(['all', 'verified', 'pending'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filter === f ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-black'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
             <Plus size={18} className="mr-2" /> Add Proof
          </Button>
        </div>
      </header>

      {/* Trust Meter (Gamification) */}
      <TrustMeter score={calculateTrustScore()} />

      {/* AI Summary Header */}
      <AiSummaryHeader reviewCount={testimonials.length} />

      {/* Masonry Feed */}
      {filteredTestimonials.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
          <Shield className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900">No proofs found</h3>
          <p className="text-gray-500 text-sm">Try changing your filters or add a new testimonial.</p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {filteredTestimonials.map((t) => (
             <div key={t.id} className={`break-inside-avoid border-2 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 group relative ${getCardStyle(t)}`}>
                
                {/* Actions Dropdown (Hover) */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-20">
                   {/* Share Button (Feature 2) */}
                   <button 
                     onClick={() => setShareModalData(t)}
                     className={`p-1.5 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors ${t.style === 'dark' ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-400'}`}
                     title="Share to Social"
                   >
                      <Share2 size={16} />
                   </button>
                   <button 
                     onClick={() => handleDelete(t.id)}
                     className={`p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors ${t.style === 'dark' ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-400'}`}
                     title="Delete"
                   >
                      <Trash2 size={16} />
                   </button>
                </div>

                {/* Status Badge */}
                <div className="flex justify-between items-start mb-4">
                   <VerificationBadge method={t.verificationMethod} />
                </div>

                {/* Text Content */}
                <p className={`text-sm leading-relaxed mb-6 font-medium ${t.style === 'dark' ? 'text-gray-200' : 'text-gray-800'} ${/[\u1200-\u137F]/.test(t.text) ? 'font-ethiopic' : ''}`}>
                   "{t.text}"
                </p>

                <div className={`flex items-center justify-between border-t pt-4 ${t.style === 'dark' ? 'border-gray-800' : 'border-gray-100'}`}>
                   <div className="flex items-center gap-3">
                      <img src={t.avatarUrl} alt={t.name} className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
                      <div>
                         <p className={`text-xs font-bold ${t.style === 'dark' ? 'text-white' : 'text-black'}`}>{t.name}</p>
                         <p className={`text-[10px] flex items-center gap-1 ${t.style === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
                            {t.verificationMethod} • {t.date}
                         </p>
                      </div>
                   </div>
                </div>
                
                {/* Quick Action */}
                <div className={`mt-4 pt-4 border-t border-dashed hidden group-hover:block animate-fade-in ${t.style === 'dark' ? 'border-gray-800' : 'border-gray-200'}`}>
                   <Button 
                     size="sm" 
                     variant="outline" 
                     fullWidth 
                     onClick={() => handleCustomizeStyle(t.id)}
                     className={`text-xs h-8 ${t.style === 'dark' ? 'border-gray-700 text-white hover:bg-gray-800' : 'border-gray-300'}`}
                   >
                      <Palette size={12} className="mr-2" /> Customize Style
                   </Button>
                </div>
             </div>
          ))}
        </div>
      )}
    </>
  );

  const renderWidgetLab = () => {
    // Determine preview styles based on active theme
    let previewClass = "bg-white border-2 border-black";
    let textClass = "text-black";
    if (activeTheme === 'dark_mode') {
      previewClass = "bg-black border-2 border-[#3B82F6] shadow-[0_0_15px_rgba(59,130,246,0.5)]";
      textClass = "text-white";
    } else if (activeTheme === 'minimalist') {
      previewClass = "bg-gray-50 border border-gray-200 shadow-sm";
      textClass = "text-gray-800";
    }

    return (
      <div className="animate-fade-in">
        <header className="mb-8">
           <h1 className="text-3xl font-extrabold text-black mb-1">Widget Lab</h1>
           <p className="text-gray-500 text-sm">Customize how your Wall of Love looks on your website.</p>
        </header>

        <div className="grid lg:grid-cols-3 gap-8">
           {/* Theme Selection */}
           <div className="lg:col-span-1 space-y-6">
              <h3 className="font-bold text-lg">Select Theme</h3>
              
              <div 
                onClick={() => setActiveTheme('modern')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${activeTheme === 'modern' ? 'border-brand-lime bg-brand-lime/10' : 'border-gray-200 hover:border-black'}`}
              >
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-white border border-black rounded shadow-[2px_2px_0_0_#000]"></div>
                   <div>
                      <h4 className="font-bold text-sm">The Modern</h4>
                      <p className="text-xs text-gray-500">High contrast, brutalist style.</p>
                   </div>
                </div>
              </div>

              <div 
                onClick={() => setActiveTheme('dark_mode')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${activeTheme === 'dark_mode' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-black'}`}
              >
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-black border border-blue-500 rounded shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                   <div>
                      <h4 className="font-bold text-sm">Dark Mode</h4>
                      <p className="text-xs text-gray-500">Neon accents on black.</p>
                   </div>
                </div>
              </div>

              <div 
                onClick={() => setActiveTheme('minimalist')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${activeTheme === 'minimalist' ? 'border-gray-500 bg-gray-50' : 'border-gray-200 hover:border-black'}`}
              >
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 bg-gray-100 border border-gray-300 rounded"></div>
                   <div>
                      <h4 className="font-bold text-sm">Minimalist</h4>
                      <p className="text-xs text-gray-500">Clean, no shadows.</p>
                   </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Button fullWidth onClick={handleCopyEmbed} className="bg-black text-white">
                   <Code size={16} className="mr-2" /> Copy Widget Code
                </Button>
              </div>
           </div>

           {/* Live Preview */}
           <div className="lg:col-span-2 bg-gray-100 rounded-2xl p-8 flex flex-col justify-center items-center border border-gray-200 bg-grid min-h-[500px]">
              <div className="mb-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Live Preview</div>
              
              <div className={`w-full max-w-md p-6 rounded-2xl transition-all duration-300 ${previewClass}`}>
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-100/10 border border-gray-500/20 rounded-lg text-[10px] font-bold">
                       <CheckCircle2 size={12} className={activeTheme === 'dark_mode' ? 'text-blue-400' : 'text-green-500'} />
                       VERIFIED
                    </div>
                    <div className="text-xs text-gray-400">2 days ago</div>
                 </div>
                 
                 <p className={`text-sm leading-relaxed mb-6 font-medium ${textClass}`}>
                    "TrustGrid changed how we do business. The widgets look amazing on our site and load instantly."
                 </p>

                 <div className="flex items-center gap-3 pt-4 border-t border-gray-500/10">
                    <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&h=100" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                       <p className={`text-sm font-bold ${textClass}`}>Yonas A.</p>
                       <p className="text-xs text-gray-500">Freelancer</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <header className="mb-10">
         <h1 className="text-3xl font-extrabold text-black mb-1">Account Settings</h1>
         <p className="text-gray-500 text-sm">Manage your brand profile and team access.</p>
      </header>

      <div className="space-y-8">
        {/* Team Management Section (Feature 4) */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Users size={20} /> Team Members
              </h3>
              <Button size="sm" onClick={handleInviteTeam} variant="outline" className="text-xs">
                + Invite Member
              </Button>
           </div>
           
           <div className="space-y-4">
              {teamMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                   <div className="flex items-center gap-3">
                      <img src={member.avatarUrl} className="w-10 h-10 rounded-full border border-gray-200" />
                      <div>
                         <p className="text-sm font-bold text-black">{member.name} {member.id === '1' && '(You)'}</p>
                         <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${member.role === 'Admin' ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'}`}>
                         {member.role}
                      </span>
                      {member.status === 'Pending' && <span className="text-[10px] text-orange-500 font-bold">Pending</span>}
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Profile Section */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
           <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
             <User size={20} /> Profile Details
           </h3>
           <div className="grid gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Company Name</label>
                <input 
                  type="text" 
                  value={profileData.companyName}
                  onChange={(e) => setProfileData({...profileData, companyName: e.target.value})}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-black focus:ring-0 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Contact Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input 
                    type="email" 
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full pl-10 px-4 py-2 rounded-xl border border-gray-300 focus:border-black focus:ring-0 outline-none transition-colors"
                  />
                </div>
              </div>
           </div>
        </div>

        {/* Branding Section */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm">
           <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
             <Palette size={20} /> Branding
           </h3>
           <div className="grid md:grid-cols-2 gap-6">
              <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Primary Color</label>
                 <div className="flex gap-2">
                    {['#D4F954', '#3B82F6', '#A855F7', '#111111'].map((color) => (
                      <button 
                        key={color}
                        onClick={() => setProfileData({...profileData, primaryColor: color})}
                        className={`w-8 h-8 rounded-full border border-gray-200 transition-all ${profileData.primaryColor === color ? 'ring-2 ring-offset-2 ring-black scale-110' : 'hover:scale-105'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                 </div>
              </div>
              <div>
                 <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Font</label>
                 <select className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-black outline-none bg-white">
                    <option>Plus Jakarta Sans</option>
                    <option>Inter</option>
                    <option>Roboto</option>
                 </select>
              </div>
           </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} className="shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Check size={18} className="mr-2" /> Save Changes
          </Button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'feed': return renderFeed();
      case 'analytics': return <AnalyticsTab />;
      case 'widgets': return renderWidgetLab();
      case 'settings': return renderSettings();
      default: return renderFeed();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] flex items-center gap-2 animate-fade-in ${toast.type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={18} /> : <X size={18} />}
          <span className="font-bold text-sm">{toast.message}</span>
        </div>
      )}

      {/* Social Share Modal */}
      {shareModalData && (
        <SocialShareModal testimonial={shareModalData} onClose={() => setShareModalData(null)} />
      )}

      {/* Sidebar */}
      <aside className="w-full md:w-80 bg-white border-r border-gray-200 p-6 flex flex-col fixed md:relative h-auto md:h-screen z-20">
        <div className="flex items-center gap-1 mb-10 cursor-pointer" onClick={onLogout}>
          <span className="font-extrabold text-2xl tracking-tighter text-black">
            TrustGrid.
          </span>
          <span className="font-black text-2xl tracking-tighter text-brand-lime bg-black px-1 rounded transform -rotate-2">PRO</span>
        </div>

        <div className="mb-8">
           <div className="flex items-center gap-3 mb-6">
              <img src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&h=100" className="w-12 h-12 rounded-xl border-2 border-gray-100" alt="Profile" />
              <div>
                 <h3 className="font-bold text-sm">{profileData.companyName}</h3>
                 <p className="text-xs text-gray-500">Elite Plan</p>
              </div>
           </div>
           
           <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 group hover:border-black transition-colors">
                 <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Your Public Wall</p>
                 <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 mb-2">
                    <LinkIcon size={14} className="text-gray-400" />
                    <span className="text-xs truncate flex-1 text-gray-600">trustgrid.et/addis-design</span>
                 </div>
                 <Button size="sm" fullWidth variant="secondary" onClick={handleCopyLink} className="text-xs h-8">
                    <Copy size={12} className="mr-2" /> Copy Link
                 </Button>
              </div>
              
              {/* Feature: Auto-Magic Collection Link */}
              <div className="p-4 bg-brand-lime/10 rounded-xl border border-brand-lime group hover:bg-brand-lime/20 transition-colors cursor-pointer" onClick={onOpenCollection}>
                 <p className="text-xs font-bold text-gray-600 mb-1 uppercase flex items-center gap-2">
                    <Send size={12} /> Collection Page
                 </p>
                 <p className="text-xs text-black font-bold flex items-center gap-1">
                    Preview your form <ExternalLink size={10} />
                 </p>
              </div>
           </div>
        </div>

        <nav className="space-y-1 flex-1">
           <button 
             onClick={() => setActiveTab('feed')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'feed' ? 'bg-black text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
           >
              <LayoutGrid size={18} /> Proof Feed
           </button>
           <button 
             onClick={() => setActiveTab('analytics')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'analytics' ? 'bg-black text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
           >
              <BarChart3 size={18} /> Analytics
           </button>
           <button 
             onClick={() => setActiveTab('widgets')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'widgets' ? 'bg-black text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
           >
              <Layout size={18} /> Widget Lab
           </button>
           <button 
             onClick={() => setActiveTab('settings')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-black text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100'}`}
           >
              <Settings size={18} /> Settings
           </button>
        </nav>

        <Button variant="ghost" onClick={onLogout} className="mt-auto justify-start px-4 text-red-500 hover:text-red-600 hover:bg-red-50">
           <LogOut size={18} className="mr-2" /> Log Out
        </Button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
         {renderContent()}
      </main>

      {/* Add Testimonial Modal (Reused) */}
      {isModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-[2rem] border-2 border-black w-full max-w-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[90vh]">
               <div className="flex justify-between items-center p-6 border-b border-gray-100">
                  <h2 className="text-xl font-extrabold">Add New Proof</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                     <X size={20} />
                  </button>
               </div>
               <div className="p-6 overflow-y-auto">
                  <form onSubmit={handleSubmit} className="space-y-6">
                     <div className="space-y-4">
                        <label className="block text-sm font-bold">Verification Source</label>
                        <div className="grid grid-cols-3 gap-2">
                           <button 
                              type="button"
                              onClick={() => setVerificationType('manual')}
                              className={`p-3 rounded-xl border-2 text-xs font-bold transition-all ${verificationType === 'manual' ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                           >
                              Manual
                           </button>
                           <button 
                              type="button"
                              onClick={() => setVerificationType('telegram')}
                              className={`p-3 rounded-xl border-2 text-xs font-bold transition-all ${verificationType === 'telegram' ? 'border-[#0088cc] bg-[#0088cc] text-white' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                           >
                              Telegram
                           </button>
                           <button 
                              type="button"
                              onClick={() => setVerificationType('linkedin')}
                              className={`p-3 rounded-xl border-2 text-xs font-bold transition-all ${verificationType === 'linkedin' ? 'border-[#0a66c2] bg-[#0a66c2] text-white' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                           >
                              LinkedIn
                           </button>
                        </div>
                        {verificationType === 'linkedin' && (
                           <div className="bg-[#0a66c2]/5 p-4 rounded-xl border border-[#0a66c2]/20 animate-fade-in">
                              <label className="block text-xs font-bold text-[#0a66c2] uppercase mb-2">LinkedIn Smart Import</label>
                              <div className="flex gap-2">
                                 <input 
                                    type="url" 
                                    placeholder="Paste Recommendation URL here..."
                                    value={formData.linkedinUrl}
                                    onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#0a66c2]"
                                 />
                                 <Button 
                                    type="button" 
                                    size="sm" 
                                    onClick={handleSimulateFetch}
                                    disabled={isFetching}
                                    className="bg-[#0a66c2] border-[#0a66c2] text-white hover:bg-[#004182]"
                                 >
                                    {isFetching ? <Loader2 className="animate-spin w-4 h-4" /> : <RefreshCw size={14} />}
                                    <span className="ml-2 hidden sm:inline">Fetch</span>
                                 </Button>
                              </div>
                              <p className="text-[10px] text-gray-500 mt-2">We will auto-fill the details from the public profile.</p>
                           </div>
                        )}
                        {verificationType === 'telegram' && (
                           <div className="bg-[#0088cc]/5 p-4 rounded-xl border border-[#0088cc]/20 animate-fade-in">
                              <label className="block text-xs font-bold text-[#0088cc] uppercase mb-2">Telegram Verification</label>
                              <div className="flex gap-2">
                                 <span className="flex items-center px-3 bg-white border border-gray-300 rounded-lg text-gray-500 font-bold">@</span>
                                 <input 
                                    type="text" 
                                    placeholder="username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#0088cc]"
                                 />
                              </div>
                           </div>
                        )}
                     </div>
                     <div className="space-y-4 pt-4 border-t border-gray-100">
                        <label className="block text-sm font-bold">Client Details</label>
                        <input 
                           type="text" 
                           placeholder="Client Name" 
                           required
                           value={formData.name}
                           onChange={(e) => setFormData({...formData, name: e.target.value})}
                           className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black focus:ring-0 outline-none transition-colors"
                        />
                        <textarea 
                           placeholder="Paste their review or testimonial here..." 
                           required
                           rows={3}
                           value={formData.text}
                           onChange={(e) => setFormData({...formData, text: e.target.value})}
                           className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-black focus:ring-0 outline-none transition-colors resize-none"
                        />
                        <div className="flex items-center gap-4">
                           <div className="w-16 h-16 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-black transition-colors">
                              <ImageIcon size={20} className="text-gray-400" />
                           </div>
                           <div className="text-xs text-gray-500">
                              <p className="font-bold text-black">Client Photo</p>
                              <p>Recommended: 400x400px</p>
                           </div>
                        </div>
                     </div>
                     <div className="pt-4">
                        <Button type="submit" fullWidth size="lg">Add to Wall</Button>
                     </div>
                  </form>
               </div>
            </div>
         </div>
      )}
    </div>
  );
};