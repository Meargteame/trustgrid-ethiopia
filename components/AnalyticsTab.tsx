import React, { useState } from 'react';
import { Eye, MousePointer, TrendingUp, Users, ArrowUpRight, BarChart2, Zap, Target } from 'lucide-react';
import { AnalyticsData } from '../types';

const MOCK_DATA: AnalyticsData[] = [
  { day: 'Mon', views: 45, conversions: 12 },
  { day: 'Tue', views: 132, conversions: 28 },
  { day: 'Wed', views: 89, conversions: 18 },
  { day: 'Thu', views: 210, conversions: 45 },
  { day: 'Fri', views: 180, conversions: 38 },
  { day: 'Sat', views: 90, conversions: 15 },
  { day: 'Sun', views: 65, conversions: 10 },
];

export const AnalyticsTab: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const maxViews = Math.max(...MOCK_DATA.map(d => d.views));

  return (
    <div className="animate-fade-in pb-20">
      <header className="mb-8 flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-extrabold text-black mb-1 flex items-center gap-2">
              <BarChart2 size={32} /> Trust Analytics
           </h1>
           <p className="text-gray-500 text-sm">Real-time insights on your reputation ROI.</p>
        </div>
        
        <div className="bg-white rounded-lg p-1 border border-gray-200 flex text-xs font-bold">
           {['7d', '30d', '90d'].map((r) => (
              <button 
                 key={r}
                 onClick={() => setTimeRange(r as any)}
                 className={`px-3 py-1.5 rounded transition-all ${timeRange === r ? 'bg-black text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                 Last {r}
              </button>
           ))}
        </div>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-black text-white p-6 rounded-2xl shadow-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-3 opacity-20"><Zap size={48} /></div>
           <p className="text-xs font-bold text-gray-400 uppercase mb-2">Total Impressions</p>
           <h3 className="text-4xl font-black mb-1">12,450</h3>
           <p className="text-[10px] text-green-400 font-bold flex items-center gap-1">
              <TrendingUp size={10} /> +24% vs last week
           </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-black transition-colors">
           <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><MousePointer size={14} /></div>
              <p className="text-xs font-bold text-gray-500 uppercase">Click-Through Rate</p>
           </div>
           <h3 className="text-3xl font-extrabold mb-1">2.4%</h3>
           <p className="text-xs text-green-600">Top 10% of industry</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-black transition-colors">
           <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg"><Target size={14} /></div>
              <p className="text-xs font-bold text-gray-500 uppercase">Verified Leads</p>
           </div>
           <h3 className="text-3xl font-extrabold mb-1">84</h3>
           <p className="text-xs text-gray-400">From widgets this month</p>
        </div>

        <div className="bg-brand-lime/10 p-6 rounded-2xl border border-brand-lime shadow-sm">
           <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-brand-lime text-black rounded-lg"><ArrowUpRight size={14} /></div>
              <p className="text-xs font-bold text-gray-600 uppercase">Est. Value Saved</p>
           </div>
           <h3 className="text-3xl font-extrabold mb-1 text-black">ETB 4.2k</h3>
           <p className="text-xs text-gray-600 font-medium">In equivalent Ad Spend</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
         {/* Main Chart Section */}
         <div className="md:col-span-2 bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <div className="flex justify-between items-center mb-10">
               <h3 className="font-bold text-lg">Engagement Trends</h3>
               <div className="flex gap-4 text-xs font-bold">
                  <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-black"></span> Widget Views
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-brand-lime border border-black"></span> Clicks
                  </div>
               </div>
            </div>
            
            {/* Chart Area */}
            <div className="h-64 flex items-end justify-between gap-4 border-b border-dashed border-gray-200 pb-4">
               {MOCK_DATA.map((data, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end items-center h-full group relative">
                     {/* Bars Container */}
                     <div className="w-full max-w-[40px] flex items-end justify-center h-full gap-1 relative">
                        {/* Background for hover effect */}
                        <div className="absolute inset-x-[-10px] inset-y-0 rounded-lg bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
                        
                        {/* View Bar */}
                        <div 
                           className="w-1/2 bg-black rounded-t-md transition-all duration-500 group-hover:bg-gray-800"
                           style={{ height: `${(data.views / maxViews) * 100}%` }}
                        ></div>
                        {/* Conversion Bar */}
                        <div 
                           className="w-1/2 bg-brand-lime border border-black border-b-0 rounded-t-md transition-all duration-700"
                           style={{ height: `${(data.conversions / maxViews) * 100}%` }}
                        ></div>
                     </div>
                     <span className="text-[10px] font-bold text-gray-400 mt-4 group-hover:text-black transition-colors">{data.day}</span>
                     
                     {/* Tooltip */}
                     <div className="absolute top-0 opacity-0 group-hover:opacity-100 transition-all bg-black text-white text-[10px] p-2 rounded shadow-xl -mt-10 pointer-events-none whitespace-nowrap z-10">
                        <span className="font-bold">{data.views}</span> Views • <span className="font-bold text-brand-lime">{data.conversions}</span> Clicks
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Sidebar Stats */}
         <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-200">
               <h4 className="font-bold text-sm mb-4">Top Performing Pages</h4>
               <div className="space-y-4">
                  {[
                     { path: '/home', visits: '1.2k', share: '45%' },
                     { path: '/pricing', visits: '850', share: '32%' },
                     { path: '/portfolio', visits: '420', share: '15%' },
                  ].map((page, i) => (
                     <div key={i} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-mono text-xs">{page.path}</span>
                        <div className="flex items-center gap-3">
                           <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-black rounded-full" style={{ width: page.share }}></div>
                           </div>
                           <span className="font-bold w-8 text-right text-xs">{page.visits}</span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
               <h4 className="font-bold text-sm mb-2 text-blue-900">Sentiment Score</h4>
               <div className="flex items-center gap-4 mb-2">
                  <span className="text-4xl font-black text-blue-600">98<span className="text-lg text-blue-400">/100</span></span>
                  <div className="flex text-yellow-500 text-xs">★★★★★</div>
               </div>
               <p className="text-xs text-blue-800 leading-relaxed">
                  Your testimonials are overwhelmingly positive. Top keywords: <span className="font-bold">"Professional", "Fast", "Reliable"</span>.
               </p>
            </div>
         </div>
      </div>
    </div>
  );
};