
import React, { useState, useRef, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImageViewerProps {
  src: string;
  alt?: string;
  className?: string;
  resetKey?: string | null;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ src, alt, className = '', resetKey }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Only reset view when the resetKey changes (e.g. new file imported)
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [resetKey]);

  const handleWheel = (e: React.WheelEvent) => {
    // Prevent default scroll behavior ensures the page doesn't scroll while zooming
    // Note: React 18+ might treat this as passive, but overflow-hidden on body handles main scroll
    
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to the container's center
    // The container uses flex-center, so (0,0) translation corresponds to the center of the container
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const mx = x - rect.width / 2;
    const my = y - rect.height / 2;

    const scaleAdjustment = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.1, scale + scaleAdjustment), 8);
    
    // Zoom to point logic:
    // We want the point under the mouse (mx, my) to remain stationary relative to the screen.
    // The math calculates the new translation required to keep that point fixed.
    // Formula: newPos = mousePos - (mousePos - oldPos) * (newScale / oldScale)
    const newX = mx - (mx - position.x) * (newScale / scale);
    const newY = my - (my - position.y) * (newScale / scale);

    setScale(newScale);
    setPosition({ x: newX, y: newY });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      e.preventDefault();
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-zinc-900/50 flex items-center justify-center ${className}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <div 
        style={{ 
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
        className="flex items-center justify-center w-full h-full will-change-transform"
      >
        <img 
          src={src} 
          alt={alt} 
          className="max-w-[85%] max-h-[85%] object-contain pointer-events-none select-none shadow-2xl ring-1 ring-white/5 rounded-sm" 
          draggable={false}
        />
      </div>
      
      {/* Controls Overlay */}
      <div 
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-zinc-800/90 backdrop-blur rounded-full p-1.5 border border-zinc-700 shadow-xl z-10" 
        onClick={e => e.stopPropagation()}
        onMouseDown={e => e.stopPropagation()}
      >
        <button 
          className="p-1.5 hover:bg-zinc-700 rounded-full text-zinc-300 hover:text-white transition-colors" 
          onClick={() => setScale(s => Math.max(0.1, s - 0.2))}
          title="Zoom Out"
        >
          <ZoomOut size={16} />
        </button>
        <span className="text-xs font-mono w-12 text-center text-zinc-400 select-none">
          {Math.round(scale * 100)}%
        </span>
        <button 
          className="p-1.5 hover:bg-zinc-700 rounded-full text-zinc-300 hover:text-white transition-colors" 
          onClick={() => setScale(s => Math.min(8, s + 0.2))}
          title="Zoom In"
        >
          <ZoomIn size={16} />
        </button>
        <div className="w-px h-4 bg-zinc-700 mx-1"></div>
        <button 
          className="p-1.5 hover:bg-zinc-700 rounded-full text-zinc-300 hover:text-white transition-colors" 
          onClick={() => { setScale(1); setPosition({x:0,y:0}); }}
          title="Reset View"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
};
