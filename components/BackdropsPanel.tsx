
import React from 'react';
import { Sparkles, Repeat, MousePointer2 } from 'lucide-react';
import { BackdropStyle } from '../types';
import { BACKDROP_STYLES } from '../constants';

interface BackdropsPanelProps {
  currentBackdrop: BackdropStyle;
  onSelectBackdrop: (backdrop: BackdropStyle) => void;
  disabled: boolean;
}

const IconMap: Record<string, React.ReactNode> = {
  sparkles: <Sparkles size={20} />,
  repeat: <Repeat size={20} />,
};

export const BackdropsPanel: React.FC<BackdropsPanelProps> = ({
  currentBackdrop,
  onSelectBackdrop,
  disabled
}) => {
  return (
    <div className={`
      flex flex-col gap-2 bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl h-auto transition-all duration-300
      ${disabled ? 'opacity-50 pointer-events-none' : ''}
    `}>
        {/* Tooltips would be nice here, but simplicity first */}
        
        {BACKDROP_STYLES.map((option) => {
          const isActive = currentBackdrop === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onSelectBackdrop(option.id as BackdropStyle)}
              className={`
                group relative w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5'
                }
              `}
              title={option.label}
            >
              {IconMap[option.icon]}
              
              {/* Floating Label on Hover */}
              <div className="absolute left-full ml-3 px-2 py-1 bg-zinc-900 border border-white/10 rounded-md text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                {option.label}
              </div>
            </button>
          );
        })}

        <div className="w-8 h-px bg-white/5 mx-auto my-1"></div>

        {/* Dummy tools for aesthetics */}
        <button className="w-12 h-12 flex items-center justify-center rounded-xl text-zinc-600 hover:text-zinc-400 cursor-not-allowed">
            <MousePointer2 size={20} />
        </button>

    </div>
  );
};
