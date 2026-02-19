import React from 'react';
import { Button } from './Button';
import { CheckCircle2, MessageSquare } from 'lucide-react';

export const Showcase: React.FC = () => {
  return (
    <section className="py-24 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          
          {/* Left Image Mockup */}
          <div className="relative">
             <div className="absolute inset-0 bg-[#E8E8E8] rounded-[2.5rem] transform translate-x-4 translate-y-4"></div>
             <div className="relative bg-white border-2 border-gray-200 rounded-[2.5rem] overflow-hidden shadow-xl p-4">
                <div className="bg-gray-50 rounded-[2rem] p-6 h-[500px] flex flex-col">
                   <div className="flex justify-between items-center mb-8">
                      <span className="font-bold text-lg">9:41</span>
                      <div className="flex gap-2">
                         <div className="w-2 h-2 rounded-full bg-black"></div>
                         <div className="w-2 h-2 rounded-full bg-black"></div>
                      </div>
                   </div>

                   <h3 className="text-2xl font-bold mb-6">Recent Proofs</h3>
                   
                   <div className="space-y-4 flex-1 overflow-hidden">
                      {/* Card 1 */}
                      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                         <img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=100&h=100" className="w-12 h-12 rounded-xl object-cover bg-gray-200" alt="Client" />
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <span className="font-bold text-sm">Dawit A.</span>
                               <CheckCircle2 size={14} className="text-brand-lime fill-black" />
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">"Great service, delivered on time!"</p>
                         </div>
                      </div>

                       {/* Card 2 */}
                       <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
                         <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100" className="w-12 h-12 rounded-xl object-cover bg-gray-200" alt="Client" />
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <span className="font-bold text-sm">Hana M.</span>
                               <CheckCircle2 size={14} className="text-brand-lime fill-black" />
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">"Absolutely verified. I checked the blockchain record."</p>
                         </div>
                      </div>

                      <div className="mt-4 p-4 bg-black rounded-2xl text-white">
                         <p className="text-sm font-bold mb-2">New Verification Request</p>
                         <div className="flex gap-3">
                            <div className="h-10 w-10 bg-gray-800 rounded-full flex items-center justify-center">
                               <MessageSquare size={18} />
                            </div>
                            <div className="flex-1">
                               <div className="h-2 bg-gray-700 rounded w-3/4 mb-2"></div>
                               <div className="h-2 bg-gray-700 rounded w-1/2"></div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Right Text Content */}
          <div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-black mb-6 leading-tight">
               Proof Tools That Move Your Business
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              TrustGrid allows businesses to track reputation data, verify Telegram transactions, and display proof, acting as a digital ledger for your brand.
            </p>
            <p className="text-lg text-gray-600 mb-10 leading-relaxed">
              Reach new customers by skillfully displaying your verified history to power your sales routine. Pair with TrustGrid digital badges for total well-being.
            </p>
            <Button size="lg" className="bg-brand-lime">
              Explore the connection
            </Button>
          </div>

        </div>
      </div>
    </section>
  );
};