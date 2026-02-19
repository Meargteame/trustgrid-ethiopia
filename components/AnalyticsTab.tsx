import React from 'react';
import { Eye, MousePointer, TrendingUp, Users } from 'lucide-react';
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
  const maxViews = Math.max(...MOCK_DATA.map(d => d.views));

  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-black mb-1">Trust Analytics</h1>
        <p className="text-gray-500 text-sm">Track how your reputation is driving business.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Eye size={18} /></div>
            <span className="text-xs font-bold uppercase">Total Views</span>
          </div>
          <p className="text-3xl font-extrabold text-black">811</p>
          <p className="text-xs text-green-600 font-bold flex items-center mt-2">
            <TrendingUp size={12} className="mr-1" /> +12% this week
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <div className="p-2 bg-brand-lime/20 text-black rounded-lg"><MousePointer size={18} /></div>
            <span className="text-xs font-bold uppercase">Badge Clicks</span>
          </div>
          <p className="text-3xl font-extrabold text-black">166</p>
          <p className="text-xs text-gray-400 mt-2">People verified your identity</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2 text-gray-500">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Users size={18} /></div>
            <span className="text-xs font-bold uppercase">Est. Leads</span>
          </div>
          <p className="text-3xl font-extrabold text-black">24</p>
          <p className="text-xs text-green-600 font-bold flex items-center mt-2">
            <TrendingUp size={12} className="mr-1" /> +5% conversion rate
          </p>
        </div>
      </div>

      {/* Main Chart Section */}
      <div className="bg-white border-2 border-black rounded-[2rem] p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex justify-between items-center mb-8">
           <h3 className="font-bold text-lg">Performance (Last 7 Days)</h3>
           <div className="flex gap-4 text-xs font-bold">
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-black rounded-full"></div> Views
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-brand-lime border border-black rounded-full"></div> Conversions
              </div>
           </div>
        </div>
        
        {/* CSS/SVG Bar Chart */}
        <div className="h-64 flex items-end justify-between gap-2 md:gap-4">
           {MOCK_DATA.map((data, i) => (
              <div key={i} className="flex-1 flex flex-col items-center group cursor-pointer">
                 {/* Tooltip */}
                 <div className="mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-[10px] py-1 px-2 rounded absolute -mt-8 pointer-events-none">
                    {data.views} views
                 </div>
                 
                 <div className="w-full flex items-end justify-center h-full gap-1 relative">
                    {/* View Bar */}
                    <div 
                      className="w-full max-w-[20px] bg-black rounded-t-md transition-all duration-500 ease-out hover:opacity-80"
                      style={{ height: `${(data.views / maxViews) * 100}%` }}
                    ></div>
                    {/* Conversion Bar (Overlay or Side) */}
                    <div 
                      className="w-full max-w-[20px] bg-brand-lime border-t border-x border-black rounded-t-md absolute bottom-0 transition-all duration-700 ease-out"
                      style={{ height: `${(data.conversions / maxViews) * 100}%` }}
                    ></div>
                 </div>
                 <span className="text-xs font-bold text-gray-400 mt-3">{data.day}</span>
              </div>
           ))}
        </div>
      </div>

      <div className="mt-8 bg-brand-lime/10 border border-brand-lime rounded-xl p-4 flex items-start gap-3">
         <div className="p-2 bg-brand-lime rounded-full text-black border border-black">
            <TrendingUp size={16} />
         </div>
         <div>
            <h4 className="font-bold text-black text-sm">Pro Tip: ROI Analysis</h4>
            <p className="text-xs text-gray-600 mt-1">
               Your "Wall of Love" was viewed <span className="font-bold">811 times</span> this week. Based on typical agency rates in Addis, this traffic is worth approximately <span className="font-bold">ETB 4,500</span> in ad spend.
            </p>
         </div>
      </div>
    </div>
  );
};