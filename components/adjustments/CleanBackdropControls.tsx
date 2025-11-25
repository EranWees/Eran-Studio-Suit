
import React from 'react';
import { AdjustmentSettings } from '../../types';
import { INTENSITY_OPTIONS } from '../../constants';

interface CleanBackdropControlsProps {
  settings: AdjustmentSettings;
  onSettingsChange: (key: keyof AdjustmentSettings, value: any) => void;
}

export const CleanBackdropControls: React.FC<CleanBackdropControlsProps> = ({
  settings,
  onSettingsChange,
}) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Intensity Section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Intensity</label>
        </div>
        <div className="flex flex-col gap-2">
          {INTENSITY_OPTIONS.map((option) => {
            const isActive = settings.intensity === option.id;
            return (
              <button
                key={option.id}
                onClick={() => onSettingsChange('intensity', option.id)}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all text-left group
                  ${isActive
                    ? 'bg-blue-600/10 border-blue-600/50'
                    : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700'
                  }`}
              >
                <span className={`text-xs font-medium transition-colors ${isActive ? 'text-blue-400' : 'text-zinc-300 group-hover:text-zinc-200'}`}>
                  {option.label}
                </span>
                <div className={`w-2 h-2 rounded-full transition-colors ${isActive ? 'bg-blue-500' : 'bg-zinc-700 group-hover:bg-zinc-600'}`} />
              </button>
            )
          })}
        </div>
        <p className="mt-2 text-[10px] text-zinc-500 px-1">
          {INTENSITY_OPTIONS.find(o => o.id === settings.intensity)?.description}
        </p>
      </section>

      {/* Variation Count */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Variations</label>
          <span className="text-xs text-blue-400 font-mono">{settings.variationCount || 1}</span>
        </div>
        <div className="flex gap-2">
            {[1, 2, 3, 4].map(count => (
                <button
                    key={count}
                    onClick={() => onSettingsChange('variationCount', count)}
                    className={`flex-1 h-8 rounded-md text-xs font-medium border transition-all
                        ${settings.variationCount === count 
                            ? 'bg-blue-600 text-white border-blue-500' 
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800'
                        }`}
                >
                    {count}
                </button>
            ))}
        </div>
      </section>

      {/* Custom Instructions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            Refinement
          </label>
        </div>
        <textarea
          value={settings.customInstructions}
          onChange={(e) => onSettingsChange('customInstructions', e.target.value)}
          placeholder="Add specific instructions (e.g. 'Keep shadows', 'Make it warmer')..."
          className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all leading-relaxed"
        />
      </section>
    </div>
  );
};
