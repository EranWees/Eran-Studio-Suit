
import React, { useState, useEffect } from 'react';
import { Users, Clock } from 'lucide-react';

export const AdminWidget: React.FC = () => {
  const [userCount, setUserCount] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);

  useEffect(() => {
    // Set initial random user count when widget appears
    setUserCount(Math.floor(Math.random() * (150 - 50 + 1)) + 50);

    // Interval to simulate live user count
    const userInterval = setInterval(() => {
      setUserCount(prevCount => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2 change
        return Math.max(1, prevCount + change); // Ensure it doesn't go below 1
      });
    }, 3000); // Update every 3 seconds

    // Interval for tracking session duration
    const durationInterval = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000); // Update every second

    // Cleanup on unmount
    return () => {
      clearInterval(userInterval);
      clearInterval(durationInterval);
    };
  }, []); // Run only once when the component mounts

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  return (
    <div className="fixed top-5 right-5 z-[100] flex items-center gap-4 bg-zinc-950/80 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-full shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
      {/* Live Users */}
      <div className="flex items-center gap-2">
        <div className="relative flex items-center justify-center">
            <Users size={16} className="text-green-400" />
            <div className="absolute inset-0 bg-green-400/20 rounded-full animate-ping"></div>
        </div>
        <div className="flex items-baseline gap-1">
            <span className="text-sm font-semibold text-white">{userCount}</span>
            <span className="text-[10px] text-zinc-400 font-medium">Live</span>
        </div>
      </div>

      <div className="w-px h-4 bg-white/10"></div>

      {/* Session Duration */}
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-zinc-400" />
         <div className="flex items-baseline gap-1">
            <span className="text-sm font-semibold text-white font-mono">{formatDuration(sessionDuration)}</span>
            <span className="text-[10px] text-zinc-400 font-medium">Session</span>
        </div>
      </div>
    </div>
  );
};
