import React, { useState } from 'react';
import { X, Copy, CheckCircle2, Code2, Globe } from 'lucide-react';
import { TrustGridMark } from './TrustGridLogo';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 font-sans animate-fade-in">
      <div className="bg-[#FFFFFF] rounded-2xl border border-gray-200 w-full max-w-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-[#F4F4F5]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] text-white flex items-center justify-center">
              <Code2 size={18} />
            </div>
            <div>
              <h3 className="font-black text-base text-[#0A0A0A] leading-tight">Publish Your Widget</h3>
              <p className="text-xs text-[#6B7280]">Embed on your website or share direct link</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors text-[#6B7280] hover:text-[#0A0A0A]"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Format Selector */}
          <div className="flex bg-[#F4F4F5] p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setEmbedTab('iframe')}
              className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                embedTab === 'iframe'
                  ? 'bg-[#FFFFFF] text-[#0A0A0A] border border-gray-200'
                  : 'text-[#6B7280] hover:text-[#0A0A0A]'
              }`}
            >
              <Code2 size={14} /> HTML Embed Code
            </button>
            <button
              onClick={() => setEmbedTab('link')}
              className={`flex-1 py-2 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                embedTab === 'link'
                  ? 'bg-[#FFFFFF] text-[#0A0A0A] border border-gray-200'
                  : 'text-[#6B7280] hover:text-[#0A0A0A]'
              }`}
            >
              <Globe size={14} /> Direct Widget URL
            </button>
          </div>

          {/* IFRAME CODE TAB */}
          {embedTab === 'iframe' && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
                  Copy & Paste Snippet
                </span>
                <span className="text-[11px] text-[#6B7280]">Works with Shopify, WordPress, Webflow, React</span>
              </div>

              <div className="relative bg-[#0A0A0A] rounded-xl p-4 border border-gray-800">
                <pre className="text-gray-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap break-all pr-24 max-h-48 leading-relaxed">
                  {iframeSnippet}
                </pre>
                <button
                  onClick={() => handleCopy(iframeSnippet, 'iframe')}
                  className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  {copiedType === 'iframe' ? (
                    <>
                      <CheckCircle2 size={13} className="text-[#D7FF3D]" />
                      <span className="text-[#D7FF3D]">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy HTML</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* DIRECT LINK TAB */}
          {embedTab === 'link' && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">
                  Standalone Widget URL
                </label>
                <div className="flex items-center gap-2 bg-[#F4F4F5] border border-gray-200 rounded-xl p-2 pl-4">
                  <span className="text-xs font-mono text-[#0A0A0A] truncate flex-1">{embedUrl}</span>
                  <button
                    onClick={() => handleCopy(embedUrl, 'link')}
                    className="px-3 py-1.5 bg-[#0A0A0A] hover:bg-[#222222] text-[#FFFFFF] rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 flex-shrink-0"
                  >
                    {copiedType === 'link' ? <CheckCircle2 size={13} className="text-[#D7FF3D]" /> : <Copy size={13} />}
                    <span>{copiedType === 'link' ? 'Copied' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block">
                  Public Wall of Proof URL
                </label>
                <div className="flex items-center gap-2 bg-[#F4F4F5] border border-gray-200 rounded-xl p-2 pl-4">
                  <span className="text-xs font-mono text-[#0A0A0A] truncate flex-1">{wallUrl}</span>
                  <a
                    href={wallUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-[#FFFFFF] border border-gray-200 hover:bg-gray-100 text-[#0A0A0A] rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 flex-shrink-0"
                  >
                    <Globe size={13} />
                    <span>Open Wall</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Footer Info */}
          <div className="p-4 bg-[#F4F4F5] border border-gray-200 rounded-xl flex items-start gap-3">
            <TrustGridMark size={18} />
            <div className="text-xs text-[#6B7280]">
              <strong className="text-[#0A0A0A] font-bold">Auto-Syncing:</strong> Any new verified review approved on your dashboard instantly updates this widget in real time with zero code modifications.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
