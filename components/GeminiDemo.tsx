import React, { useState } from 'react';
import { Button } from './Button';
import { analyzeTrustContent } from '../services/geminiService';
import { TrustAnalysisResult, AnalysisStatus } from '../types';
import { Sparkles, Shield, AlertCircle, Check, Loader2 } from 'lucide-react';

export const GeminiDemo: React.FC = () => {
  const [input, setInput] = useState("I ordered a website design from TrustGrid. They were very professional and finished 2 days early. Highly recommended!");
  const [result, setResult] = useState<TrustAnalysisResult | null>(null);
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);

  const handleAnalyze = async () => {
    setStatus(AnalysisStatus.ANALYZING);
    try {
      const data = await analyzeTrustContent(input);
      setResult(data);
      setStatus(AnalysisStatus.COMPLETE);
    } catch (e) {
      console.error(e);
      setStatus(AnalysisStatus.ERROR);
    }
  };

  return (
    <section id="demo" className="py-24 bg-gray-50 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-lime border border-black text-black text-xs font-bold mb-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Sparkles size={12} /> Powered by Gemini AI
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-black mb-4">AI Trust Verification</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Experience our intelligent engine. Paste a review below to verify instantly.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-stretch">
          
          {/* Input Side */}
          <div className="bg-white border-2 border-black rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
            <label className="text-sm font-bold text-black mb-2">Review Content</label>
            <textarea
              className="w-full h-40 bg-gray-50 border-2 border-gray-200 rounded-xl p-4 text-black placeholder-gray-400 focus:ring-0 focus:border-brand-lime transition-all resize-none mb-6 outline-none"
              placeholder="Paste text here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className="mt-auto">
              <Button 
                fullWidth 
                onClick={handleAnalyze} 
                disabled={status === AnalysisStatus.ANALYZING || !input.trim()}
                className="disabled:opacity-50 disabled:cursor-not-allowed bg-black text-white hover:bg-gray-800"
              >
                {status === AnalysisStatus.ANALYZING ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin w-5 h-5" /> Analyzing...
                  </span>
                ) : (
                  "Verify Authenticity"
                )}
              </Button>
            </div>
          </div>

          {/* Output Side */}
          <div className="bg-white rounded-[2rem] border-2 border-gray-100 p-2 overflow-hidden relative min-h-[400px]">
            {status === AnalysisStatus.IDLE && (
               <div className="h-full bg-gray-50 rounded-[1.5rem] flex flex-col items-center justify-center text-gray-400 p-8 text-center border border-dashed border-gray-300">
                  <Shield size={48} className="mb-4 opacity-30" />
                  <p>Results will appear here.</p>
               </div>
            )}

            {status === AnalysisStatus.ANALYZING && (
              <div className="h-full bg-gray-50 rounded-[1.5rem] flex flex-col items-center justify-center p-8">
                 <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-black border-t-transparent animate-spin"></div>
                 </div>
                 <p className="text-black font-bold animate-pulse">Scanning...</p>
              </div>
            )}

            {result && status === AnalysisStatus.COMPLETE && (
              <div className="h-full bg-brand-lime/10 rounded-[1.5rem] p-6 md:p-8 flex flex-col animate-fade-in border border-brand-lime">
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-black">Analysis Report</h3>
                    <p className="text-sm text-gray-500">Gemini 3 Flash</p>
                  </div>
                  <div className={`px-4 py-2 rounded-lg font-black text-xl border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}>
                    {result.score}/100
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Sentiment */}
                  <div className="flex items-center gap-4">
                    <div className="w-full bg-white border border-black rounded-full h-3 p-0.5">
                      <div 
                        className={`h-full rounded-full transition-all duration-1000 bg-black`} 
                        style={{ width: `${result.score}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-black w-24 text-right">{result.sentiment}</span>
                  </div>

                  {/* Keywords */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Trust Markers</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.keywords.map((kw, i) => (
                        <span key={i} className="px-3 py-1 bg-white text-black text-sm font-medium rounded-full border border-black">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div className="bg-white p-4 rounded-xl border border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                    <div className="flex gap-2 mb-2">
                      {result.isAuthentic ? <Check size={18} className="text-green-600 mt-1" /> : <AlertCircle size={18} className="text-red-600 mt-1" />}
                      <h4 className="font-bold text-black">AI Assessment</h4>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {result.reasoning}
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};