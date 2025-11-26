import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface WelcomeProps {
    onStart: () => void;
}

export const Welcome: React.FC<WelcomeProps> = ({ onStart }) => {
    return (
        <div className="relative flex flex-col items-center justify-center h-screen w-screen bg-black text-white overflow-hidden font-sans">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[150px] animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-900/20 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="z-10 flex flex-col items-center text-center space-y-8 p-8 max-w-2xl animate-fade-in-up">
                {/* Logo / Icon */}
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 mb-4 transform hover:scale-105 transition-transform duration-500">
                    <Sparkles className="w-10 h-10 text-white" />
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <h1 className="text-6xl md:text-7xl font-bold tracking-tighter bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                        Eran Studio
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 font-light tracking-wide">
                        The Ultimate AI Creative Suite
                    </p>
                </div>

                {/* Description */}
                <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                    Transform your photos with professional-grade AI tools.
                    Edit, retouch, and reimagine your visual content in seconds.
                </p>

                {/* Start Button */}
                <button
                    onClick={onStart}
                    className="group relative flex items-center space-x-3 bg-white text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]"
                >
                    <span>Start Creating</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />

                    {/* Button Glow */}
                    <div className="absolute inset-0 rounded-full ring-2 ring-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>

                {/* Footer */}
                <div className="absolute bottom-8 text-xs text-gray-600 tracking-widest uppercase">
                    Powered by Gemini 2.0 Flash
                </div>
            </div>

            <style>{`
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }
      `}</style>
        </div>
    );
};
