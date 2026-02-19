import React from 'react';
import { UserCheck, Zap, TrendingUp } from 'lucide-react';

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-black mb-6">Built To Build Trust</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-12 text-center md:text-left">
          
          {/* Feature 1 */}
          <div className="flex flex-col items-center md:items-start group">
            <div className="w-16 h-16 rounded-full bg-brand-yellow flex items-center justify-center border-2 border-black mb-6 group-hover:-translate-y-2 transition-transform">
              <UserCheck size={28} className="text-black" />
            </div>
            <h3 className="text-xl font-bold mb-3">A personalized wall</h3>
            <p className="text-gray-600 leading-relaxed">
              Turn your Telegram chats and reviews into a verified public profile. Your reputation, visualized.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col items-center md:items-start group">
            <div className="w-16 h-16 rounded-full bg-brand-yellow flex items-center justify-center border-2 border-black mb-6 group-hover:-translate-y-2 transition-transform">
              <Zap size={28} className="text-black" />
            </div>
            <h3 className="text-xl font-bold mb-3">Verify smarter not harder</h3>
            <p className="text-gray-600 leading-relaxed">
              Fake screenshots? No thanks. Our AI scans for authenticity markers automatically.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col items-center md:items-start group">
            <div className="w-16 h-16 rounded-full bg-brand-yellow flex items-center justify-center border-2 border-black mb-6 group-hover:-translate-y-2 transition-transform">
              <TrendingUp size={28} className="text-black" />
            </div>
            <h3 className="text-xl font-bold mb-3">Crush your sales goals</h3>
            <p className="text-gray-600 leading-relaxed">
              Integrate your trust score into Telebirr and LinkedIn to close deals faster.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};