import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  MousePointer, 
  TrendingUp, 
  Users, 
  ArrowUpRight, 
  BarChart2, 
  Zap, 
  Target,
  Globe,
  Share2,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { AnalyticsData } from '../types';
import { supabase } from '../lib/supabase';

interface ReferrerCount {
  source: string;
  count: number;
  percentage: number;
}

export const AnalyticsTab: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [totalTestimonials, setTotalTestimonials] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [topReferrers, setTopReferrers] = useState<ReferrerCount[]>([]);
  const [avgTrustScore, setAvgTrustScore] = useState<number>(0);

  useEffect(() => {
     loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) return;

       // 1. Get Total Views for chosen range
       const now = new Date();
       const rangeDate = new Date();
       rangeDate.setDate(now.getDate() - (timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90));

       const { data: viewsData, error: viewsError } = await supabase
          .from('views')
          .select('created_at, referrer')
          .eq('wall_id', user.id)
          .gte('created_at', rangeDate.toISOString());
       
       if (viewsError) throw viewsError;

       // 2. Get Testimonials (verified & approved)
       const { data: testData, error: testError } = await supabase
          .from('testimonials')
          .select('id, created_at, score, is_verified, reviewer_telegram_id, video_url, status')
          .eq('user_id', user.id)
          .in('status', ['verified', 'approved', 'published'])
          .gte('created_at', rangeDate.toISOString());

       if (testError) throw testError;

       const viewsCount = viewsData?.length || 0;
       const testCount = testData?.length || 0;

       setTotalViews(viewsCount);
       setTotalTestimonials(testCount);
       setConversionRate(viewsCount > 0 ? Math.min(100, (testCount / viewsCount) * 100) : 0);

       // 3. Aggregate Data by Day for Chart
       const aggregated = aggregateDataByDay(viewsData || [], testData || [], timeRange);
       setData(aggregated);

       // 4. Calculate Top Referrers
       const refMap = new Map<string, number>();
       (viewsData || []).forEach(v => {
          let ref = (v.referrer || 'Direct').trim();
          if (ref.includes('t.me') || ref.toLowerCase().includes('telegram')) ref = 'Telegram';
          else if (ref.includes('instagram.com')) ref = 'Instagram';
          else if (ref.includes('google.com')) ref = 'Google';
          else if (ref.includes('twitter.com') || ref.includes('x.com')) ref = 'Twitter / X';
          else if (ref.includes('linkedin.com')) ref = 'LinkedIn';
          else if (ref.includes('facebook.com')) ref = 'Facebook';
          else if (!ref || ref === 'direct' || ref === 'localhost') ref = 'Direct Link';
          else {
            try {
              const url = new URL(ref.startsWith('http') ? ref : `https://${ref}`);
              ref = url.hostname.replace('www.', '');
            } catch {
              ref = 'Other Websites';
            }
          }

          refMap.set(ref, (refMap.get(ref) || 0) + 1);
       });

       const sortedReferrers = Array.from(refMap.entries())
          .map(([source, count]) => ({
             source,
             count,
             percentage: viewsCount > 0 ? Math.round((count / viewsCount) * 100) : 0
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

       setTopReferrers(sortedReferrers);

       // 5. Calculate Real Average Trust Score
       if (testData && testData.length > 0) {
          const totalScoreSum = testData.reduce((acc: number, item: any) => {
             // If item has a score, use it; otherwise award points for verified telegram and video
             let itemScore = item.score || 80;
             if (item.reviewer_telegram_id) itemScore = Math.max(itemScore, 90);
             if (item.video_url) itemScore = Math.min(100, itemScore + 10);
             return acc + itemScore;
          }, 0);
          setAvgTrustScore(Math.round(totalScoreSum / testData.length));
       } else {
          setAvgTrustScore(0);
       }

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

  const maxViews = Math.max(...data.map(d => d.views), 10);

  return (
    <div className="animate-fade-in pb-20 font-sans">
      {/* Header */}
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
           <h1 className="text-3xl font-black text-[#0A0A0A] mb-1 flex items-center gap-2 tracking-tight">
              <BarChart2 size={26} /> Trust Analytics
           </h1>
           <p className="text-[#6B7280] text-sm">Real-time performance of your wall of proof and visitor conversions.</p>
        </div>
        
        <div className="bg-[#F4F4F5] rounded-xl p-1 border border-gray-200 flex text-xs font-bold">
           {['7d', '30d', '90d'].map((r) => (
              <button 
                 key={r}
                 onClick={() => setTimeRange(r as any)}
                 className={`px-3 py-1.5 rounded-lg transition-all ${timeRange === r ? 'bg-[#FFFFFF] text-[#0A0A0A] border border-gray-200' : 'text-[#6B7280] hover:text-[#0A0A0A]'}`}
              >
                 Last {r}
              </button>
           ))}
        </div>
      </header>

      {/* Hero Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#0A0A0A] text-white p-6 rounded-2xl border border-gray-800 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-3 opacity-10"><Zap size={48} /></div>
           <p className="text-xs font-bold text-gray-400 uppercase mb-2">Total Wall Views</p>
           <h3 className="text-3xl sm:text-4xl font-black mb-1">{loading ? '...' : totalViews.toLocaleString()}</h3>
           <p className="text-[11px] text-[#D7FF3D] font-bold flex items-center gap-1">
              <TrendingUp size={12} /> Live tracking
           </p>
        </div>

        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-gray-200">
           <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-[#F4F4F5] text-[#0A0A0A] rounded-lg"><MousePointer size={14} /></div>
              <p className="text-xs font-bold text-[#6B7280] uppercase">Conversion Rate</p>
           </div>
           <h3 className="text-3xl font-black text-[#0A0A0A] mb-1">{loading ? '...' : `${conversionRate.toFixed(1)}%`}</h3>
           <p className="text-xs text-[#6B7280] font-medium">Views to Verified Proofs</p>
        </div>

        <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-gray-200">
           <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-[#F4F4F5] text-[#0A0A0A] rounded-lg"><Target size={14} /></div>
              <p className="text-xs font-bold text-[#6B7280] uppercase">Verified Reviews</p>
           </div>
           <h3 className="text-3xl font-black text-[#0A0A0A] mb-1">{loading ? '...' : totalTestimonials}</h3>
           <p className="text-xs text-[#6B7280]">Total verified submissions</p>
        </div>

        <div className="bg-[#F4F4F5] p-6 rounded-2xl border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
               <div className="p-1.5 bg-[#FFFFFF] text-[#0A0A0A] rounded-lg border border-gray-200"><ArrowUpRight size={14} /></div>
               <p className="text-xs font-bold text-[#0A0A0A] uppercase">Est. Value Saved</p>
            </div>
            <h3 className="text-3xl font-black mb-1 text-[#0A0A0A]">{loading ? '...' : `ETB ${(totalViews * 2.5).toFixed(0)}`}</h3>
            <p className="text-xs text-[#6B7280] font-medium">Saved vs paid ads equivalent</p>
         </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
         {/* Main Chart Section */}
         <div className="lg:col-span-2 bg-[#FFFFFF] border border-gray-200 rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-3">
               <div>
                  <h3 className="font-black text-lg text-[#0A0A0A]">Engagement & Conversion Trends</h3>
                  <p className="text-xs text-[#6B7280]">Daily breakdown of visitors and review submissions</p>
               </div>
               <div className="flex gap-4 text-xs font-bold">
                  <div className="flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-[#0A0A0A]"></span> 
                     <span className="text-[#0A0A0A]">Views</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="w-2.5 h-2.5 rounded-full bg-[#D7FF3D] border border-black/20"></span> 
                     <span className="text-[#0A0A0A]">Verified Proofs</span>
                  </div>
               </div>
            </div>
            
            {/* Chart Bars */}
            <div className="h-64 flex items-end justify-between gap-3 border-b border-gray-200 pb-4">
               {data.map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end items-center h-full group relative">
                     {/* Bars Container */}
                     <div className="w-full max-w-10 flex items-end justify-center h-full gap-1 relative">
                        <div className="absolute -inset-x-2 inset-y-0 rounded-lg bg-[#F4F4F5] opacity-0 group-hover:opacity-100 transition-opacity -z-10"></div>
                        
                        {/* Views Bar */}
                        <div 
                           className="w-1/2 bg-[#0A0A0A] rounded-t-md transition-all duration-300 group-hover:bg-gray-800"
                           style={{ height: maxViews ? `${Math.max(4, (item.views / maxViews) * 100)}%` : '4%' }}
                        ></div>
                        {/* Conversions Bar */}
                        <div 
                           className="w-1/2 bg-[#D7FF3D] border border-black/20 border-b-0 rounded-t-md transition-all duration-300"
                           style={{ height: maxViews ? `${Math.max(4, (item.conversions / maxViews) * 100)}%` : '4%' }}
                        ></div>
                     </div>
                     <span className="text-[10px] font-bold text-[#6B7280] mt-4 group-hover:text-[#0A0A0A] transition-colors">{item.day}</span>
                     
                     {/* Tooltip */}
                     <div className="absolute top-0 opacity-0 group-hover:opacity-100 transition-all bg-[#0A0A0A] text-white text-[11px] px-3 py-1.5 rounded-xl -mt-10 pointer-events-none whitespace-nowrap z-10">
                        <span className="font-bold">{item.views}</span> Views • <span className="font-bold text-[#D7FF3D]">{item.conversions}</span> Proofs
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Sidebar Analytics */}
         <div className="space-y-6">
             {/* Live Top Referrers */}
             <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                   <h4 className="font-black text-sm text-[#0A0A0A] flex items-center gap-1.5">
                      <Globe size={16} className="text-[#6B7280]" /> Top Traffic Sources
                   </h4>
                   <span className="text-[10px] font-bold text-[#6B7280] uppercase">Live</span>
                </div>

                {topReferrers.length === 0 ? (
                   <div className="text-center py-6 text-[#6B7280] text-xs">
                      <p>Traffic source data will appear here as visitors view your wall of proof.</p>
                   </div>
                ) : (
                   <div className="space-y-3">
                      {topReferrers.map((ref, idx) => (
                         <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold">
                               <span className="text-[#0A0A0A]">{ref.source}</span>
                               <span className="text-[#6B7280]">{ref.count} views ({ref.percentage}%)</span>
                            </div>
                            <div className="w-full bg-[#F4F4F5] h-2 rounded-full overflow-hidden">
                               <div 
                                  className="bg-[#0A0A0A] h-full rounded-full transition-all duration-500"
                                  style={{ width: `${ref.percentage}%` }}
                               ></div>
                            </div>
                         </div>
                      ))}
                   </div>
                )}
             </div>

             {/* Live Average Trust Score */}
             <div className="bg-[#FFFFFF] p-6 rounded-2xl border border-gray-200">
                <h4 className="font-black text-sm mb-2 text-[#0A0A0A] flex items-center gap-1.5">
                   <ShieldCheck size={16} className="text-[#0A0A0A]" /> Avg. Trust Score
                </h4>
                <div className="flex items-center gap-4 mb-2">
                   <span className="text-4xl font-black text-[#0A0A0A]">
                      {loading ? '...' : avgTrustScore > 0 ? avgTrustScore : '100'}
                      <span className="text-sm font-bold text-[#6B7280]">/100</span>
                   </span>
                   <div className="flex text-amber-400 text-sm">★★★★★</div>
                </div>
                <p className="text-xs text-[#6B7280] leading-relaxed font-medium">
                   {totalTestimonials > 0 
                     ? `Computed across ${totalTestimonials} verified client submissions.`
                     : 'Score will calculate automatically from your verified customer ratings.'}
                </p>
             </div>
         </div>
      </div>
    </div>
  );
};