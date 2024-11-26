"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Plane, Utensils, Palmtree, Mountain, Landmark, Map, Sailboat, Luggage } from "lucide-react";

const loadingMessages = [
  "Planning your adventure...",
  "Finding hidden gems...",
  "Crafting your journey...",
  "Exploring destinations...",
  "Mapping your route...",
];

const landmarks = [
  { icon: Plane, label: "Plane" },
  { icon: Luggage, label: "Luggage" },
  { icon: Map, label: "Map" },
  { icon: Utensils, label: "Restaurant" },
  { icon: Landmark, label: "Monument" },
  { icon: Palmtree, label: "Beach" },
  { icon: Sailboat, label: "Sailboat" },
  { icon: Mountain, label: "Mountain" },
];

interface LoadingAnimationProps {
  retryCount?: number;
  maxRetries?: number;
}

export const LoadingAnimation = ({ retryCount = 0, maxRetries = 3 }: LoadingAnimationProps) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  // Cycle through messages
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Animate progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev + 1) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-6 h-[10vh] overflow-hidden">
      <div className="relative flex flex-col items-center justify-center h-full">
        {/* Path with landmarks */}
        <div className="relative w-full h-6 mb-2">
          {/* Dotted path */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-dotted-line" 
               style={{ 
                 backgroundImage: 'linear-gradient(to right, currentColor 33%, rgba(255,255,255,0) 0%)',
                 backgroundPosition: 'bottom',
                 backgroundSize: '12px 1px',
                 backgroundRepeat: 'repeat-x',
                 opacity: 0.3
               }} />

          {/* Landmarks */}
          {landmarks.map((Landmark, index) => {
            const isHighlighted = progress > index * (100 / landmarks.length);
            return (
              <div
                key={index}
                className={`absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out ${
                  isHighlighted ? 'text-blue-500' : 'text-muted-foreground opacity-30'
                }`}
                style={{
                  left: `${(index + 1) * (100 / (landmarks.length + 1))}%`,
                }}
              >
                <Landmark.icon className="w-4 h-4" />
              </div>
            );
          })}
        </div>

        {/* Loading message */}
        <p className="text-sm text-center text-muted-foreground">
          {loadingMessages[messageIndex]}
          {retryCount > 0 && (
            <span className="block text-xs mt-1">
              Attempt {retryCount} of {maxRetries}
            </span>
          )}
        </p>
      </div>
    </Card>
  );
};
