import React from 'react';
import { Wifi, Battery } from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  return (
    <div className="py-6 flex justify-center bg-neutral-100/70 min-h-screen">
      {/* Smartphone Device Shell */}
      <div className="w-full max-w-[390px] bg-white rounded-[40px] shadow-2xl border-[8px] border-neutral-900 overflow-hidden flex flex-col relative min-h-[820px]">
        
        {/* Status Bar: 9:41, Cellular, Wifi, Battery - matching wireframes */}
        <div className="pt-3 px-6 pb-2 flex items-center justify-between text-black text-xs font-semibold select-none bg-white">
          <span className="font-bold tracking-tight">9:41</span>
          
          <div className="flex items-center gap-1.5">
            {/* Cellular Signal Bars */}
            <div className="flex items-end gap-[1.5px] h-3">
              <span className="w-[2.5px] h-1 bg-black rounded-xs"></span>
              <span className="w-[2.5px] h-1.5 bg-black rounded-xs"></span>
              <span className="w-[2.5px] h-2 bg-black rounded-xs"></span>
              <span className="w-[2.5px] h-2.5 bg-black rounded-xs"></span>
            </div>
            {/* Wifi Icon */}
            <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
            {/* Battery Icon */}
            <div className="w-5 h-2.5 border border-black rounded-[2px] p-[1px] flex items-center relative">
              <div className="h-full w-full bg-black rounded-[0.5px]"></div>
              <div className="w-[1.5px] h-1 bg-black absolute -right-[2.5px] top-[2px] rounded-r-[0.5px]"></div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 bg-white">
          {children}
        </div>

        {/* Home Bar Indicator */}
        <div className="py-2 flex justify-center bg-white">
          <div className="w-32 h-1 bg-neutral-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
