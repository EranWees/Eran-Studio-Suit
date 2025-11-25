
import React, { useRef } from 'react';
import { Upload, X, Shirt, ShoppingBag, Watch, Glasses, Footprints } from 'lucide-react';
import { AdjustmentSettings } from '../../types';
import { OBJECT_PRESETS } from '../../constants';

interface ObjectSwapControlsProps {
  settings: AdjustmentSettings;
  onSettingsChange: (key: keyof AdjustmentSettings, value: any) => void;
  onUpdateSettings: (newSettings: Partial<AdjustmentSettings>) => void;
}

const PresetIconMap: Record<string, React.ReactNode> = {
  clothes: <Shirt size={20} />,
  'shopping-bag': <ShoppingBag size={20} />,
  watch: <Watch size={20} />,
  glasses: <Glasses size={20} />,
  footprints: <Footprints size={20} />,
};

export const ObjectSwapControls: React.FC<ObjectSwapControlsProps> = ({
  settings,
  onSettingsChange,
  onUpdateSettings
}) => {
  const assetInputRef = useRef<HTMLInputElement>(null);

  const handleAssetUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateSettings({
          swapAsset: reader.result as string,
          swapType: 'upload',
          swapPreset: undefined // Clear preset when uploading
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePresetSelect = (presetId: string) => {
    onUpdateSettings({
      swapType: 'preset',
      swapPreset: presetId,
      swapAsset: null // Clear asset when selecting preset
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      
      {/* Source Section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Source Object</label>
        </div>
        
        {/* Upload Area */}
        <div className="mb-4">
          {!settings.swapAsset ? (
            <div 
              onClick={() => assetInputRef.current?.click()}
              className={`w-full h-32 border border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all group
                ${settings.swapType === 'upload' 
                  ? 'border-zinc-700 bg-zinc-900' 
                  : 'border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 hover:border-zinc-700'
                }`}
            >
              <div className="p-2 bg-zinc-900 rounded-full mb-2 group-hover:bg-zinc-800 transition-colors border border-zinc-800">
                <Upload size={16} className="text-zinc-500 group-hover:text-zinc-300" />
              </div>
              <span className="text-xs text-zinc-400 group-hover:text-zinc-300">Click to upload reference</span>
            </div>
          ) : (
            <div className="relative w-full h-32 rounded-lg border border-blue-500/30 overflow-hidden group bg-zinc-900 shadow-md">
              <img 
                src={settings.swapAsset} 
                alt="Reference Asset" 
                className="w-full h-full object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateSettings({ swapAsset: null, swapType: 'preset' }); // Fallback to preset or nothing
                }}
                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-900/90 rounded-full text-white backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100"
              >
                <X size={14} />
              </button>
              <span className="absolute bottom-2 left-3 text-[10px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
                Custom Upload
              </span>
            </div>
          )}
          <input 
            type="file" 
            ref={assetInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleAssetUpload}
          />
        </div>

        {/* Presets Grid - Placed directly below without label */}
        <div className="grid grid-cols-3 gap-2">
          {OBJECT_PRESETS.map(preset => {
            const isSelected = settings.swapType === 'preset' && settings.swapPreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-200 group
                  ${isSelected 
                    ? 'bg-blue-600/10 border-blue-600/50 text-blue-400 shadow-sm shadow-blue-900/20' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-300 hover:border-zinc-700'
                  }`}
              >
                <div className={`mb-2 transition-transform group-hover:scale-110 duration-200 ${isSelected ? 'text-blue-500' : 'text-current'}`}>
                  {PresetIconMap[preset.icon]}
                </div>
                <span className="text-[10px] font-medium">{preset.label}</span>
              </button>
            );
          })}
        </div>
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

      {/* Refinement */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            Refinement
          </label>
        </div>
        <textarea
          value={settings.customInstructions}
          onChange={(e) => onSettingsChange('customInstructions', e.target.value)}
          placeholder="Describe where/how to swap (e.g., 'Place on the table, keep shadows')..."
          className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none transition-all leading-relaxed"
        />
      </section>
    </div>
  );
};
