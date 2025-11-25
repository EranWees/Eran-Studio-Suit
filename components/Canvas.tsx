
import React, { useState, useEffect } from 'react';
import { Upload, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from './Button';
import { ImageViewer } from './ImageViewer';
import { Spinner } from './Spinner';
import { EditMode } from '../types';

interface CanvasProps {
  originalImage: string | null;
  currentImage: string | null;
  editMode: EditMode;
  viewMode: 'single' | 'split';
  onUploadTrigger: () => void;
  errorMessage: string | null;
  onClearError: () => void;
  variationCandidates: string[] | null;
  onSelectVariation: (image: string) => void;
  onCancelVariation: () => void;
  variationCount: number;
}

export const Canvas: React.FC<CanvasProps> = ({
  originalImage,
  currentImage,
  editMode,
  viewMode,
  onUploadTrigger,
  errorMessage,
  onClearError,
  variationCandidates,
  onSelectVariation,
  onCancelVariation,
  variationCount
}) => {
  const [previewIndex, setPreviewIndex] = useState(0);

  // Reset preview index when candidates change
  useEffect(() => {
    if (variationCandidates) {
      setPreviewIndex(0);
    }
  }, [variationCandidates]);

  const isProcessing = editMode === EditMode.PROCESSING;
  const showGenerativePanel = isProcessing || variationCandidates !== null;

  const displayImage = variationCandidates 
    ? variationCandidates[previewIndex] 
    : (currentImage || originalImage);

  if (!originalImage) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-zinc-950 relative overflow-hidden">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:48px_48px]"></div>
        <div className="absolute inset-0 bg-radial-gradient from-zinc-900/0 via-zinc-950/80 to-zinc-950 pointer-events-none"></div>
        
        <div className="text-center max-w-lg relative z-10 px-6 animate-in fade-in zoom-in-95 duration-500">
          <div className="mb-8 flex justify-center">
             <img 
               src="https://i.ibb.co/KjMZgX45/Eran-logo-brown.png" 
               alt="Eran Studio Logo" 
               className="h-32 w-auto object-contain drop-shadow-2xl opacity-90"
             />
          </div>
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 mb-4 tracking-tight">Eran Studio</h1>
          <p className="text-zinc-500 mb-10 text-lg leading-relaxed font-light">
            Professional backdrop cleaning and retouching.
            <br />
            <span className="text-zinc-600">Drag & drop or click below.</span>
          </p>
          <Button 
            variant="white"
            size="lg" 
            onClick={onUploadTrigger} 
            className="h-14 px-8 text-base shadow-2xl shadow-blue-900/20 transition-all hover:scale-105 active:scale-95 border-0 rounded-full font-bold"
          >
            <Upload className="mr-2" size={20} />
            Import Photo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#050505] relative overflow-hidden flex flex-col">
      
      {/* Main Canvas Area - Edge to Edge */}
      <div className="absolute inset-0">
        {viewMode === 'single' ? (
          <div className="w-full h-full">
             <ImageViewer src={displayImage!} resetKey={originalImage} className="bg-transparent" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-0.5 h-full bg-zinc-900">
            <div className="relative h-full overflow-hidden bg-black/50">
              <span className="absolute top-4 left-4 z-10 text-[10px] font-bold text-white/50 bg-black/50 px-2 py-1 rounded backdrop-blur uppercase tracking-widest">Original</span>
              <ImageViewer src={originalImage} resetKey={originalImage} className="bg-transparent" />
            </div>
            <div className="relative h-full overflow-hidden bg-black/50">
              <span className="absolute top-4 right-4 z-10 text-[10px] font-bold text-blue-400 bg-blue-900/20 border border-blue-500/20 px-2 py-1 rounded backdrop-blur uppercase tracking-widest">Result</span>
              <ImageViewer src={displayImage!} resetKey={originalImage} className="bg-transparent" />
            </div>
          </div>
        )}
      </div>

      {/* Floating Generative Fill Panel */}
      {showGenerativePanel && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-zinc-950/90 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl animate-in slide-in-from-bottom-6 fade-in duration-500">
          
          {/* Previous Arrow */}
          <button 
            disabled={!variationCandidates || previewIndex === 0}
            onClick={() => setPreviewIndex(prev => Math.max(0, prev - 1))}
            className="p-2 hover:bg-white/10 rounded-xl text-zinc-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          {/* Slots Container */}
          <div className="flex gap-2 items-center px-1">
            {isProcessing ? (
              // Loading State (Spinner)
              Array.from({ length: Math.max(variationCount, 1) }).map((_, i) => (
                <div 
                  key={i} 
                  className="w-16 h-16 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center relative overflow-hidden animate-pulse"
                >
                  <Spinner className="w-5 h-5 text-white/30" />
                </div>
              ))
            ) : variationCandidates ? (
              // Loaded Thumbnails
              variationCandidates.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setPreviewIndex(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border transition-all duration-300 relative group
                    ${previewIndex === i 
                      ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-105 z-10' 
                      : 'border-white/10 hover:border-white/30 opacity-60 hover:opacity-100 hover:scale-105'
                    }`}
                >
                  <img src={src} className="w-full h-full object-cover" alt={`Variation ${i + 1}`} />
                </button>
              ))
            ) : null}

            {/* Placeholder "More" button */}
            {!isProcessing && (
                <button disabled className="w-16 h-16 rounded-xl border border-white/5 border-dashed flex flex-col items-center justify-center text-zinc-600 gap-1 opacity-50 cursor-not-allowed">
                <Plus size={16} />
                </button>
            )}
          </div>

          {/* Next Arrow */}
          <button 
             disabled={!variationCandidates || previewIndex === variationCandidates.length - 1}
             onClick={() => setPreviewIndex(prev => Math.min(variationCandidates.length - 1, prev + 1))}
             className="p-2 hover:bg-white/10 rounded-xl text-zinc-400 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          >
            <ChevronRight size={20} />
          </button>

          {/* Vertical Divider */}
          <div className="w-px h-8 bg-white/10 mx-2" />

          {/* Action Buttons */}
          <div className="flex flex-col gap-1.5 px-1">
             <button 
                onClick={() => variationCandidates && onSelectVariation(variationCandidates[previewIndex])}
                disabled={isProcessing}
                className="px-5 py-1.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-lg transition-colors shadow-lg disabled:opacity-50"
             >
                Apply
             </button>
             <button 
                onClick={onCancelVariation}
                disabled={isProcessing}
                className="px-5 py-1.5 bg-transparent hover:bg-white/10 text-zinc-400 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
             >
                Cancel
             </button>
          </div>

          {/* Floating Message */}
          {isProcessing && (
             <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[10px] font-bold tracking-wide uppercase px-4 py-2 rounded-full border border-white/10 shadow-xl backdrop-blur flex items-center gap-2 whitespace-nowrap">
                <Spinner className="w-3 h-3 text-blue-500" />
                Processing Edits...
             </div>
          )}

        </div>
      )}

      {/* Error Toast */}
      {errorMessage && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-red-500/10 text-red-200 px-6 py-3 rounded-full shadow-2xl border border-red-500/20 flex items-center gap-3 backdrop-blur-xl z-50 animate-in slide-in-from-top-4 fade-in">
          <span className="text-sm font-medium">{errorMessage}</span>
          <button onClick={onClearError} className="p-1 hover:bg-red-500/20 rounded-full">
            <span className="sr-only">Dismiss</span>
            &times;
          </button>
        </div>
      )}
    </div>
  );
};
