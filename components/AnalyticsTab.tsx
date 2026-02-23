import React, { useState, useEffect } from 'react';
import { Eye, MousePointer, TrendingUp, Users, ArrowUpRight, BarChart2, Zap, Target } from 'lucide-react';
import { AnalyticsData } from '../types';
import { supabase } from '../lib/supabase';

export const AnalyticsTab: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalTestimonials, setTotalTestimonials] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);

  useEffect(() => {
     loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) return;

       // 1. Get Total Views (for current time range)
       const now = new Date();
       const rangeDate = new Date();
       rangeDate.setDate(now.getDate() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));

       const { data: viewsData, error: viewsError } = await supabase
          .from('views')
          .select('created_at')
          .eq('wall_id', user.id)
          .gte('created_at', rangeDate.toISOString());
       
       if (viewsError) throw viewsError;

       // 2. Get Total Verified Testimonials (Conversions)
       const { data: testData, error: testError } = await supabase
          .from('testimonials')
          .select('created_at')
          .eq('user_id', user.id)
          .eq('status', 'verified')
          .gte('created_at', rangeDate.toISOString());

       if (testError) throw testError;

       const viewsCount = viewsData?.length || 0;
       const testCount = testData?.length || 0;

       setTotalViews(viewsCount);
       setTotalTestimonials(testCount);
       setConversionRate(viewsCount > 0 ? ((testCount / viewsCount) * 100) : 0);

       // 3. Aggregate Data by Day
       const aggregated = aggregateDataByDay(viewsData || [], testData || [], timeRange);
       setData(aggregated);

    } catch (err) {
       console.error("Failed to load analytics:", err);
    } finally {
       setLoading(false);
    }
  };

  const aggregateDataByDay = (views: any[], testimonials: any[], range: string) => {
      const daysMap = new Map<string, { views: number, conversions: number }>();
      const daysCount = range === '7d' ? 7 : range === '30d' ? 30 : 90;
      
      // Initialize days with 0
      for (let i = daysCount - 1; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const key = d.toISOString().split('T')[0]; // YYYY-MM-DD
          daysMap.set(key, { views: 0, conversions: 0 });
      }

      // Fill Views
      views.forEach(v => {
          const key = new Date(v.created_at).toISOString().split('T')[0];
          if (daysMap.has(key)) {
             const curr = daysMap.get(key)!;
             daysMap.set(key, { ...curr, views: curr.views + 1 });
          }
      });

      // Fill Conversions
      testimonials.forEach(t => {
          const key = new Date(t.created_at).toISOString().split('T')[0];
          if (daysMap.has(key)) {
             const curr = daysMap.get(key)!;
             daysMap.set(key, { ...curr, conversions: curr.conversions + 1 });
          }
      });

      // Convert to array
      return Array.from(daysMap.entries()).map(([dateStr, counts]) => {
         const date = new Date(dateStr);
         return {
            day: date.toLocaleDateString('en-US', { weekday: 'short' }), // Mon, Tue
            views: counts.views,
            conversions: counts.conversions
         };
      });
  };

  const maxViews = Math.max(...data.map(d => d.views), 10); // Minimum scale of 10 to avoid flat lines

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
           <p className="text-xs font-bold text-gray-400 uppercase mb-2">Total Wall Views</p>
           <h3 className="text-4xl font-black mb-1">{loading ? '...' : totalViews.toLocaleString()}</h3>
           <p className="text-[10px] text-green-400 font-bold flex items-center gap-1">
              <TrendingUp size={10} /> Real-time
           </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-black transition-colors">
           <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><MousePointer size={14} /></div>
              <p className="text-xs font-bold text-gray-500 uppercase">Conversion Rate</p>
           </div>
           <h3 className="text-3xl font-extrabold mb-1">{loading ? '...' : conversionRate.toFixed(1)}%</h3>
           <p className="text-xs text-green-600">Views to Testimonials</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:border-black transition-colors">
           <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg"><Target size={14} /></div>
              <p className="text-xs font-bold text-gray-500 uppercase">Verified Leads</p>
           </div>
           <h3 className="text-3xl font-extrabold mb-1">{loading ? '...' : totalTestimonials}</h3>
           <p className="text-xs text-gray-400">Total verified reviews</p>
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
               {data.map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end items-center h-full group relative">
                     {/* Bars Container */}
                     <div className="w-full max-w-10 flex items-end justify-center h-full gap-1 relative">
                        {/* Background for hover effect */}
                        <div className="absolute -inset-x-2.5 inset-y-0 rounded-lg bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
                        
                        {/* View Bar */}
                        <div 
                           className="w-1/2 bg-black rounded-t-md transition-all duration-500 group-hover:bg-gray-800"
                           style={{ height: maxViews ? `${(item.views / maxViews) * 100}%` : '0%' }}
                        ></div>
                        {/* Conversion Bar */}
                        <div 
                           className="w-1/2 bg-brand-lime border border-black border-b-0 rounded-t-md transition-all duration-700"
                           // Note: Using views max scale for both to show proportion
                           style={{ height: maxViews ? `${(item.conversions / maxViews) * 100}%` : '0%' }}
                        ></div>
                     </div>
                     <span className="text-[10px] font-bold text-gray-400 mt-4 group-hover:text-black transition-colors">{item.day}</span>
                     
                     {/* Tooltip */}
                     <div className="absolute top-0 opacity-0 group-hover:opacity-100 transition-all bg-black text-white text-[10px] p-2 rounded shadow-xl -mt-10 pointer-events-none whitespace-nowrap z-10">
                        <span className="font-bold">{item.views}</span> Views • <span className="font-bold text-brand-lime">{item.conversions}</span> Proofs
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