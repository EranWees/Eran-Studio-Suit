
import React, { useState, useRef, useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { EditMode, ImageState, AdjustmentSettings } from './types';
import { editImage } from './services/geminiService';
import { AdjustmentsPanel } from './components/AdjustmentsPanel';
import { BackdropsPanel } from './components/BackdropsPanel';
import { Header } from './components/Header';
import { Canvas } from './components/Canvas';
import { UpdateNotice } from './components/UpdateNotice';
import { FeedbackWidget } from './components/FeedbackWidget';
import { AdminWidget } from './components/AdminWidget';
import { Login } from './components/Login';
import { OBJECT_PRESETS } from './constants';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export default function App() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [imageState, setImageState] = useState<ImageState>({
    original: null,
    history: [],
    currentIndex: -1
  });

  const [variationCandidates, setVariationCandidates] = useState<string[] | null>(null);
  const [editMode, setEditMode] = useState<EditMode>(EditMode.IDLE);
  const [viewMode, setViewMode] = useState<'single' | 'split'>('single');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check sessionStorage on initial app load
  useEffect(() => {
    if (sessionStorage.getItem('isAdmin') === 'true') {
      setIsAdmin(true);
    }
  }, []);

  const [adjustments, setAdjustments] = useState<AdjustmentSettings>({
    intensity: 'standard',
    backdropStyle: 'clean',
    customInstructions: '',
    swapAsset: null,
    swapType: 'upload',
    swapPreset: undefined,
    variationCount: 1
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentImage = imageState.currentIndex >= 0 ? imageState.history[imageState.currentIndex] : null;
  const canUndo = imageState.currentIndex > 0;
  const canRedo = imageState.currentIndex < imageState.history.length - 1;
  const isOriginal = imageState.currentIndex === 0;
  const hasImage = !!imageState.original;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImageState({
          original: result,
          history: [result],
          currentIndex: 0
        });
        setEditMode(EditMode.IDLE);
        setErrorMsg(null);
        setViewMode('single');
        setVariationCandidates(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleActivateAdmin = () => {
    sessionStorage.setItem('isAdmin', 'true');
    setIsAdmin(true);
  };

  const constructPrompt = (): string => {
    let prompt = "Edit this image. ";
    prompt += "CRITICAL: Preserve the EXACT original aspect ratio, framing, and composition. Do NOT crop, zoom, or distort the image. The subject's position, size, and perspective must remain unchanged. ";

    if (adjustments.backdropStyle === 'object-swap') {
      prompt += "INTELLIGENT ASSET INTEGRATION: ";

      if (adjustments.swapType === 'upload' && adjustments.swapAsset) {
        prompt += "The first image is the TARGET SCENE (User Image). The second image is the REFERENCE ASSET. ";
        prompt += "Analyze the REFERENCE ASSET to understand its category (e.g., dress, shirt, shoes, furniture, accessory). ";
        prompt += "LOGIC FOR APPLICATION: ";
        prompt += "1. IF CLOTHING (Dress, Gown, Suit, Shirt): Perform a structural replacement on the subject in the Target Scene. Detect the body pose (sitting, standing, arms positions) and drape the Reference Asset fabric naturally over the body. Maintain skin tones of the original subject where exposed. If it's a dress, replace the entire outfit. ";
        prompt += "2. IF FOOTWEAR: Identify the feet of the subject. Replace existing shoes with the Reference Asset. Align with the ground plane and perspective. ";
        prompt += "3. IF OBJECT: Place the object in the most logical position (e.g., in hand if it's a tool, on table if it's a cup). Match the perspective of the scene. ";
        prompt += "LIGHTING & REALISM: Strictly match the lighting direction, color temperature, and shadow intensity of the Target Scene. The result must be seamless. Do not warp the background. ";

      } else if (adjustments.swapType === 'preset' && adjustments.swapPreset) {
        const presetLabel = OBJECT_PRESETS.find(p => p.id === adjustments.swapPreset)?.label || 'object';
        const lowerLabel = presetLabel.toLowerCase();

        if (['clothes', 'shirt', 'dress', 'jacket'].includes(adjustments.swapPreset)) {
          prompt += `Perform a high-fashion virtual try-on. Replace the current outfit of the subject with a stylish, high-quality ${lowerLabel}. Adapt the clothing to the subject's exact body pose and body shape. Ensure realistic fabric folds and lighting integration. Do not alter the subject's face or body proportions. `;
        } else if (['shoes', 'footwear', 'sneakers'].includes(adjustments.swapPreset)) {
          prompt += `Replace the subject's footwear with premium ${lowerLabel}. Ensure they touch the ground realistically with correct contact shadows. Keep the original leg position. `;
        } else {
          prompt += `Intelligently place a ${lowerLabel} in the scene where it makes the most sense contextually. Ensure photorealistic lighting and perspective. `;
        }
      }
    } else {
      prompt += "Clean the existing background. Remove wrinkles, dirt, and imperfections. Keep the original color but make it smooth. ";
      prompt += "Do not alter the subject boundaries or the composition of the photo. ";

      switch (adjustments.intensity) {
        case 'gentle': prompt += "Be subtle. Keep the natural depth and original feel. "; break;
        case 'standard': prompt += "Make it look professional and clean. "; break;
        case 'aggressive': prompt += "Make it perfectly smooth and digital. Remove all distractions. "; break;
      }
    }

    if (adjustments.customInstructions.trim()) {
      prompt += ` ADDITIONAL INSTRUCTIONS: ${adjustments.customInstructions}`;
    }

    prompt += " Return ONLY the edited image.";
    return prompt;
  };

  const handleProcess = async () => {
    if (!currentImage) return;

    setEditMode(EditMode.PROCESSING);
    setErrorMsg(null);
    setVariationCandidates(null);

    try {
      const img = new Image();
      img.src = currentImage;
      await new Promise((resolve) => { img.onload = resolve; });

      const targetRatio = img.width / img.height;
      const supportedRatios: Record<string, number> = { "1:1": 1, "3:4": 0.75, "4:3": 1.3333, "9:16": 0.5625, "16:9": 1.7778 };
      let closestAspectRatio = "1:1";
      let minDiff = Number.MAX_VALUE;

      for (const [key, value] of Object.entries(supportedRatios)) {
        const diff = Math.abs(targetRatio - value);
        if (diff < minDiff) {
          minDiff = diff;
          closestAspectRatio = key;
        }
      }

      const prompt = constructPrompt();
      const referenceAsset = (adjustments.backdropStyle === 'object-swap' && adjustments.swapType === 'upload') ? adjustments.swapAsset : null;

      const results = await editImage(currentImage, prompt, referenceAsset, adjustments.variationCount, closestAspectRatio, accessToken);

      if (results.length === 1) {
        addResultToHistory(results[0]);
      } else {
        setVariationCandidates(results);
        setEditMode(EditMode.IDLE);
      }

    } catch (err) {
      console.error(err);
      setErrorMsg("Processing failed. Please try again.");
      setEditMode(EditMode.ERROR);
    }
  };

  const addResultToHistory = (newImage: string) => {
    setImageState(prev => {
      const newHistory = prev.history.slice(0, prev.currentIndex + 1);
      newHistory.push(newImage);
      return { ...prev, history: newHistory, currentIndex: newHistory.length - 1 };
    });
    setEditMode(EditMode.COMPLETED);
    setVariationCandidates(null);
  };

  const handleVariationSelect = (selectedImage: string) => addResultToHistory(selectedImage);
  const handleCancelVariation = () => setVariationCandidates(null);
  const handleUndo = () => canUndo && setImageState(prev => ({ ...prev, currentIndex: prev.currentIndex - 1 }));
  const handleRedo = () => canRedo && setImageState(prev => ({ ...prev, currentIndex: prev.currentIndex + 1 }));

  const handleDownload = () => {
    if (currentImage) {
      const link = document.createElement('a');
      link.href = currentImage;
      link.download = `eran-studio-edit-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!accessToken) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <Login
          onLoginSuccess={setAccessToken}
          onLoginFailure={() => setErrorMsg("Login failed. Please try again.")}
        />
      </GoogleOAuthProvider>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="relative w-screen h-screen bg-black text-gray-200 font-sans overflow-hidden">

        <UpdateNotice />
        <FeedbackWidget />
        {isAdmin && <AdminWidget />}

        <div className="absolute inset-0 z-0">
          <Canvas
            originalImage={imageState.original}
            currentImage={currentImage}
            editMode={editMode}
            viewMode={viewMode}
            onUploadTrigger={() => fileInputRef.current?.click()}
            errorMessage={errorMsg}
            onClearError={() => setErrorMsg(null)}
            variationCandidates={variationCandidates}
            onSelectVariation={handleVariationSelect}
            onCancelVariation={handleCancelVariation}
            variationCount={adjustments.variationCount}
          />
        </div>

        {hasImage && (
          <>
            <div className="absolute top-0 left-0 right-0 z-40 pointer-events-none">
              <div className="pointer-events-auto">
                <Header
                  hasImage={true}
                  onUploadClick={() => fileInputRef.current?.click()}
                  onDownload={handleDownload}
                  onUndo={handleUndo}
                  onRedo={handleRedo}
                  canUndo={canUndo}
                  canRedo={canRedo}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  isOriginal={isOriginal}
                  stepCount={imageState.currentIndex + 1}
                  totalSteps={imageState.history.length}
                  onActivateAdmin={handleActivateAdmin}
                />
              </div>
            </div>
            <div className="absolute left-4 top-20 bottom-8 z-30 pointer-events-none">
              <div className="pointer-events-auto h-full">
                <BackdropsPanel
                  currentBackdrop={adjustments.backdropStyle}
                  onSelectBackdrop={(style) => setAdjustments(prev => ({ ...prev, backdropStyle: style }))}
                  disabled={!currentImage}
                />
              </div>
            </div>
            <div className="absolute right-4 top-20 bottom-8 z-30 pointer-events-none">
              <div className="pointer-events-auto h-full">
                <AdjustmentsPanel
                  settings={adjustments}
                  onSettingsChange={setAdjustments}
                  onProcess={handleProcess}
                  editMode={editMode}
                  disabled={!currentImage}
                />
              </div>
            </div>
          </>
        )}

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileUpload}
        />
      </div>
    </GoogleOAuthProvider>
  );
}
