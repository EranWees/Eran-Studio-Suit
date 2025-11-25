
import React from 'react';
import { Play } from 'lucide-react';
import { Button } from './Button';
import { AdjustmentSettings, EditMode } from '../types';
import { CleanBackdropControls } from './adjustments/CleanBackdropControls';
import { ObjectSwapControls } from './adjustments/ObjectSwapControls';

interface AdjustmentsPanelProps {
  settings: AdjustmentSettings;
  onSettingsChange: (newSettings: AdjustmentSettings) => void;
  onProcess: () => void;
  editMode: EditMode;
  disabled: boolean;
}

export const AdjustmentsPanel: React.FC<AdjustmentsPanelProps> = ({
  settings,
  onSettingsChange,
  onProcess,
  editMode,
  disabled
}) => {
  
  const handleSettingChange = (key: keyof AdjustmentSettings, value: any) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleUpdateSettings = (newSettings: Partial<AdjustmentSettings>) => {
    onSettingsChange({ ...settings, ...newSettings });
  };

  const isProcessing = editMode === EditMode.PROCESSING;
  const isObjectSwap = settings.backdropStyle === 'object-swap';

  const canProcess = () => {
    if (disabled || isProcessing) return false;
    if (isObjectSwap) {
        if (settings.swapType === 'upload' && !settings.swapAsset) return false;
        if (settings.swapType === 'preset' && !settings.swapPreset) return false;
    }
    return true;
  };

  return (
    <div className={`
      w-80 h-full flex flex-col bg-zinc-950/85 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden
      ${disabled ? 'opacity-40 pointer-events-none grayscale' : ''}
    `}>
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-5 border-b border-white/5">
        <span className="text-xs font-bold tracking-wider text-zinc-400 uppercase">Properties</span>
        <div className="flex gap-1.5">
           <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
           <div className="w-2.5 h-2.5 rounded-full bg-zinc-800"></div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        {settings.backdropStyle === 'clean' && (
          <CleanBackdropControls 
            settings={settings}
            onSettingsChange={handleSettingChange}
          />
        )}

        {settings.backdropStyle === 'object-swap' && (
          <ObjectSwapControls 
            settings={settings}
            onSettingsChange={handleSettingChange}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <Button
          onClick={onProcess}
          disabled={!canProcess()}
          className={`w-full h-11 text-sm font-semibold tracking-wide shadow-lg transition-all duration-300
             ${isProcessing 
                ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20'
             }
          `}
          icon={isProcessing ? undefined : <Play size={16} fill="currentColor" />}
        >
          {isProcessing ? 'Generating...' : 'Generate'}
        </Button>
      </div>
    </div>
  );
};
