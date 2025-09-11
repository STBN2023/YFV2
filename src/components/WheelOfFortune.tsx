"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const WheelOfFortune = () => {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  
  const segments = [
    'Gagnant!', 'Essaie encore', '10 points', 
    '20 points', '50 points', '100 points',
    'Perdu!', 'Bonus'
  ];
  
  const spinWheel = () => {
    if (spinning) return;
    
    setSpinning(true);
    setWinner(null);
    
    const rotations = 5; // Nombre de tours complets
    const segmentAngle = 360 / segments.length;
    const randomSegment = Math.floor(Math.random() * segments.length);
    const degrees = rotations * 360 + (randomSegment * segmentAngle);
    
    if (wheelRef.current) {
      wheelRef.current.style.transition = 'transform 4s cubic-bezier(0.17, 0.67, 0.21, 0.99)';
      wheelRef.current.style.transform = `rotate(${degrees}deg)`;
    }
    
    setTimeout(() => {
      setSpinning(false);
      setWinner(segments[randomSegment]);
    }, 4000);
  };
  
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-64 h-64">
        {/* Flèche indicateur */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-0 h-0 border-l-8 border-r-8 border-b-16 border-l-transparent border-r-transparent border-b-red-500" />
        
        {/* Roue */}
        <div 
          ref={wheelRef}
          className="w-full h-full rounded-full border-4 border-gray-800 relative overflow-hidden transition-transform duration-1000"
        >
          {segments.map((segment, index) => {
            const angle = (360 / segments.length) * index;
            return (
              <div 
                key={index}
                className="absolute w-1/2 h-1/2 origin-bottom-right"
                style={{
                  transform: `rotate(${angle}deg)`,
                  backgroundColor: index % 2 === 0 ? '#3b82f6' : '#60a5fa',
                }}
              >
                <div 
                  className="absolute top-1/2 left-1/2 w-32 h-32 -translate-y-1/2"
                  style={{
                    transform: `rotate(${angle + (360 / segments.length / 2)}deg)`,
                    textAlign: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                >
                  {segment}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <Button 
        onClick={spinWheel} 
        disabled={spinning}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {spinning ? 'En cours...' : 'Tourner la roue'}
      </Button>
      
      {winner && (
        <div className="text-xl font-bold text-center">
          Résultat: <span className="text-blue-600">{winner}</span>
        </div>
      )}
    </div>
  );
};

export default WheelOfFortune;