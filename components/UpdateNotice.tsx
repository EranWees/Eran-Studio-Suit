
import React, { useState, useEffect } from 'react';
import { X, Zap, MousePointer2, Palette } from 'lucide-react';

export const UpdateNotice: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const VERSION = "v1.0.6";

  useEffect(() => {
    // Check local storage to see if the user has already seen this update version
    const hasSeenUpdate = localStorage.getItem('eran_studio_update_1_0_6');
    if (!hasSeenUpdate) {
      // Small delay to allow app to load first
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('eran_studio_update_1_0_6', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl ring-1 ring-white/5">
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-blue-500/10 rounded-lg">
                <Zap size={16} className="text-blue-400" fill="currentColor" />
            </div>
            <div className="flex flex-col">
                <h2 className="text-base font-semibold text-white leading-none">What's New</h2>
                <span className="text-[10px] text-zinc-500 font-mono mt-1">{VERSION}</span>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="text-zinc-500 hover:text-white transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex gap-3 items-start p-3 bg-white/5 rounded-xl border border-white/5">
            <MousePointer2 size={18} className="text-zinc-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-white mb-0.5">Smart Zoom</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Zooming now follows your mouse cursor for better control.
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 items-start p-3 bg-white/5 rounded-xl border border-white/5">
            <Palette size={18} className="text-zinc-400 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-white mb-0.5">Visual Polish</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Cleaner buttons and a more focused layout.
              </p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleClose}
          className="w-full h-10 bg-white text-black text-sm font-semibold rounded-xl hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5"
        >
          Got it
        </button>

      </div>
    </div>
  );
};
