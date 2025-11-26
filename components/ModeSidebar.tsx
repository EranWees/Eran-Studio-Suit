import React from 'react';
import { Sparkles } from 'lucide-react';
import { MODES } from '../constants';
import { ModeConfig } from '../types';

interface ModeSidebarProps {
  activeMode: string;
  onSelectMode: (modeId: string) => void;
}

export const ModeSidebar: React.FC<ModeSidebarProps> = ({ activeMode, onSelectMode }) => {
  return (
    <div className="w-24 flex-shrink-0 border-r border-zinc-800 bg-black flex flex-col items-center py-6 z-30">
      <div className="mb-8 p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-900/20">
        <Sparkles className="text-white w-6 h-6" />
      </div>
      
      <div className="flex flex-col gap-3 w-full px-2">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSelectMode(mode.id)}
            className={`group flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 w-full
              ${activeMode === mode.id 
                ? 'bg-zinc-800 text-white shadow-md shadow-black/50 ring-1 ring-zinc-700' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
              }`}
          >
            <Sparkles size={24} strokeWidth={1.5} className={`mb-2 transition-colors ${activeMode === mode.id ? 'text-blue-400' : 'text-current group-hover:text-zinc-300'}`} />
            <span className={`text-[11px] font-medium text-center leading-tight transition-colors ${activeMode === mode.id ? 'text-zinc-100' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
              {mode.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};