import React, { useState } from 'react';
import { X, Copy, CheckCircle2, Code2, Globe, Sparkles, Terminal } from 'lucide-react';

interface WidgetEmbedModalProps {
  username: string;
  config: {
    theme: string;
    layout: string;
    showRating: boolean;
    showDate: boolean;
    showAvatar: boolean;
    borderRadius: string;
    shadow: string;
    font: string;
    columns: number;
    gap: string;
    headerTitle?: string;
  };
  onClose: () => void;
}

export const WidgetEmbedModal: React.FC<WidgetEmbedModalProps> = ({ username, config, onClose }) => {
  const [copiedType, setCopiedType] = useState<'iframe' | 'link' | null>(null);
  const [embedTab, setEmbedTab] = useState<'iframe' | 'link'>('iframe');

  const params = new URLSearchParams({
    theme: config.theme,
    layout: config.layout,
    rating: config.showRating.toString(),
    date: config.showDate.toString(),
    avatar: config.showAvatar.toString(),
    rad: config.borderRadius,
    shad: config.shadow,
    font: config.font,
    cols: config.columns.toString(),
    gap: config.gap
  });
  if (config.headerTitle) params.append('title', config.headerTitle);

  const embedUrl = `${window.location.origin}/embed/${username || ''}?${params.toString()}`;
  const wallUrl = `${window.location.origin}/wall/${username || ''}`;

  const iframeSnippet = config.layout === 'toast' 
    ? `<!-- TrustGrid Live Social Proof Toast Widget -->
<iframe
  src="${embedUrl}"
  width="380"
  height="180"
  frameborder="0"
  scrolling="no"
  style="border:none; position:fixed; bottom:20px; left:20px; z-index:99999; pointer-events:auto; background:transparent;"
  title="TrustGrid Live Social Proof Toast"
></iframe>`
    : `<!-- TrustGrid Verified Reviews Widget -->
<iframe
  src="${embedUrl}"
  width="100%"
  height="${config.layout === 'grid' ? '700' : '450'}"
  frameborder="0"
  scrolling="auto"
  style="border:none; overflow:hidden; width:100%; border-radius:16px;"
  title="TrustGrid Customer Reviews"
></iframe>`.trim();

  const handleCopy = (text: string, type: 'iframe' | 'link') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white rounded-3xl border border-gray-100 w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center shadow-md">
              <Code2 size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-gray-900 leading-tight">Publish Your Widget</h3>
              <p className="text-xs text-gray-500 font-medium">Embed on your website or share direct link</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Format Selector */}
          <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200/60">
            <button
              onClick={() => setEmbedTab('iframe')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                embedTab === 'iframe'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Terminal size={14} /> HTML / iFrame Embed
            </button>
            <button
              onClick={() => setEmbedTab('link')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                embedTab === 'link'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Globe size={14} /> Direct Public Link
            </button>
          </div>

          {embedTab === 'iframe' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Embed Code (Webflow, WordPress, Shopify, React)
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Auto-updates in real time
                </span>
              </div>

              <div className="bg-gray-950 rounded-2xl p-5 relative group border border-gray-800 shadow-inner">
                <pre className="text-gray-200 font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all leading-relaxed max-h-44">
                  {iframeSnippet}
                </pre>
                <button
                  onClick={() => handleCopy(iframeSnippet, 'iframe')}
                  className="absolute top-4 right-4 bg-white hover:bg-gray-100 text-black px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-2 font-bold text-xs hover:scale-105 active:scale-95"
                >
                  {copiedType === 'iframe' ? (
                    <>
                      <CheckCircle2 size={15} className="text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={15} />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>

              {/* Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                  <p className="font-bold text-gray-800 mb-1">WordPress / Elementor</p>
                  <p className="text-gray-500 text-[11px]">Add an "HTML" or "Shortcode" block and paste the code.</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                  <p className="font-bold text-gray-800 mb-1">Webflow / Framer</p>
                  <p className="text-gray-500 text-[11px]">Add an "Embed" component to your section and paste.</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                  <p className="font-bold text-gray-800 mb-1">React / Next.js</p>
                  <p className="text-gray-500 text-[11px]">Paste directly inside any JSX return block or div container.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Direct Wall of Proof URL
              </span>

              <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-2xl border border-gray-200">
                <input 
                  type="text" 
                  readOnly 
                  value={wallUrl} 
                  className="bg-transparent border-0 flex-1 px-3 text-xs font-mono text-gray-700 outline-none"
                />
                <button
                  onClick={() => handleCopy(wallUrl, 'link')}
                  className="bg-black hover:bg-gray-800 text-white px-4 py-2.5 rounded-xl transition-colors font-bold text-xs flex items-center gap-2 flex-shrink-0 shadow-sm"
                >
                  {copiedType === 'link' ? (
                    <>
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={14} />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200/60 rounded-2xl flex items-start gap-3">
                <Sparkles size={18} className="text-emerald-700 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                  Share this public proof link in your Telegram Channel, Instagram Bio, or Proposal PDFs to let prospective clients browse all your verified proofs!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
