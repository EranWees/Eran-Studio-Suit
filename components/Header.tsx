
import React, { useState, useEffect } from 'react';
import { Undo2, Redo2, Download, Image as ImageIcon, Plus } from 'lucide-react';
import { Button } from './Button';

interface HeaderProps {
  hasImage: boolean;
  onUploadClick: () => void;
  onDownload: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  viewMode: 'single' | 'split';
  setViewMode: (mode: 'single' | 'split') => void;
  isOriginal: boolean;
  stepCount: number;
  totalSteps: number;
  onActivateAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  hasImage,
  onUploadClick,
  onDownload,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  viewMode,
  setViewMode,
  isOriginal,
  onActivateAdmin
}) => {
  const [logoClicks, setLogoClicks] = useState(0);

  useEffect(() => {
    if (logoClicks > 0) {
      const timer = setTimeout(() => setLogoClicks(0), 2000);
      return () => clearTimeout(timer);
    }
  }, [logoClicks]);

  const handleLogoClick = () => {
    const newClickCount = logoClicks + 1;
    setLogoClicks(newClickCount);
    if (newClickCount >= 5) {
      onActivateAdmin(); // Activate admin mode without reloading
      setLogoClicks(0); // Reset counter
    }
  };

  if (!hasImage) return null;

  return (
    <div className="w-full flex justify-center pt-4 pb-2 px-6">
       <div className="flex items-center gap-3 bg-zinc-950/80 backdrop-blur-xl border border-white/5 px-4 py-2.5 rounded-full shadow-2xl">
           
           <div 
             className="mr-2 opacity-50 hover:opacity-100 transition-opacity cursor-pointer" 
             onClick={handleLogoClick}
             title="Admin Access"
            >
               <img src="https://i.ibb.co/KjMZgX45/Eran-logo-brown.png" alt="Logo" className="h-6 w-auto" />
           </div>

           <div className="h-4 w-px bg-white/10 mx-1"></div>

           <div className="flex items-center gap-1">
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Undo"
              >
                <Undo2 size={18} />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                title="Redo"
              >
                <Redo2 size={18} />
              </button>
           </div>

           <div className="h-4 w-px bg-white/10 mx-1"></div>

           <div className="flex bg-zinc-900/50 rounded-full p-1 border border-white/5">
              <button
                onClick={() => setViewMode('single')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${viewMode === 'single' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Canvas
              </button>
              <button
                onClick={() => setViewMode('split')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${viewMode === 'split' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                disabled={isOriginal}
              >
                Split
              </button>
           </div>

           <div className="h-4 w-px bg-white/10 mx-1"></div>

           <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onUploadClick}
                className="text-zinc-400 hover:text-white hover:bg-white/5 rounded-full px-3 h-8"
              >
                <Plus size={16} className="mr-1.5" />
                New
              </Button>
              
              <Button
                variant="white"
                size="sm"
                onClick={onDownload}
                className="font-bold rounded-full h-8 px-4 text-xs shadow-lg"
                icon={<Download size={14} />}
              >
                Export
              </Button>
           </div>
       </div>
    </div>
  );
};
