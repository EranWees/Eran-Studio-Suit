
import React, { useState, useEffect } from 'react';
import { Star, X, Send } from 'lucide-react';
import { Button } from './Button';

export const FeedbackWidget: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const hasSubmitted = localStorage.getItem('eran_studio_feedback_submitted');
    if (!hasSubmitted) {
      const timer = setTimeout(() => setIsVisible(true), 2500); // Delay appearance
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('eran_studio_feedback_submitted', 'true');
  };

  const handleRatingClick = (r: number) => {
    // Allow user to click the same star again to reset rating
    setRating(r === rating ? 0 : r);
  };

  const handleSubmit = () => {
    if (rating === 0) return;
    setIsSubmitting(true);

    const phoneNumber = "265997761194";
    const ratingText = `${rating}/5`; // Use numerical format
    const feedbackText = feedback.trim() ? feedback : "No comment provided.";
    
    // Construct the raw message with newlines
    const rawMessage = `New Feedback for Eran Studio

Rating: ${ratingText}
Feedback: ${feedbackText}`;

    // URL-encode the entire message to handle spaces and newlines safely
    const encodedMessage = encodeURIComponent(rawMessage);
    
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    window.open(url, '_blank');
    
    setIsSubmitting(false);
    handleDismiss(); // Hide permanently after submission
  };

  const hasRated = rating > 0;

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
      <div className="bg-zinc-950/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 transition-all duration-300">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-white">How was your experience?</p>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star 
                    size={20} 
                    className={`transition-colors duration-200 ${
                      star <= (hoverRating || rating) 
                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' 
                        : 'fill-zinc-800 text-zinc-700'
                    }`} 
                  />
                </button>
              ))}
            </div>
            <button onClick={handleDismiss} className="p-1.5 text-zinc-500 hover:text-white hover:bg-white/10 rounded-full transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        {hasRated && (
          <div className="mt-4 space-y-3">
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Any thoughts to share? (optional)"
              className="w-full h-20 bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm text-zinc-200 placeholder:text-zinc-600 focus:ring-1 focus:ring-blue-500 outline-none resize-none transition-all"
            />
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting} 
              size="sm" 
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center justify-center gap-2"
              icon={isSubmitting ? undefined : <Send size={14} />}
            >
              {isSubmitting ? 'Sending...' : 'Send Feedback'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
