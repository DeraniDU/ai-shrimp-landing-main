'use client';
import { useState, useEffect } from 'react';

export default function FeedingDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedingState, setFeedingState] = useState<'HIGH' | 'LOW' | 'NO FEEDING'>('HIGH');
  const [motorSpeed, setMotorSpeed] = useState(100);
  const [isFeeding, setIsFeeding] = useState(false);

  const toggleDemo = () => setIsOpen(!isOpen);

  // Animate motor speed smoothly
  useEffect(() => {
    const target = feedingState === 'HIGH' ? 100 : feedingState === 'LOW' ? 50 : 0;
    const interval = setInterval(() => {
      setMotorSpeed(prev => {
        if (Math.abs(prev - target) < 2) return target;
        return prev + (target > prev ? 2 : -2);
      });
    }, 30);
    return () => clearInterval(interval);
  }, [feedingState]);

  useEffect(() => setIsFeeding(motorSpeed > 0), [motorSpeed]);

  const nextState = () => {
    setFeedingState(prev => (prev === 'HIGH' ? 'LOW' : prev === 'LOW' ? 'NO FEEDING' : 'HIGH'));
  };

  const getStateColor = () =>
    feedingState === 'HIGH' ? 'bg-green-500' : feedingState === 'LOW' ? 'bg-yellow-500' : 'bg-red-500';

  const getAppetiteEmoji = () =>
    feedingState === 'HIGH' ? '🦐🦐🦐' : feedingState === 'LOW' ? '🦐' : '😴';

  return (
    <>
      <button
        onClick={toggleDemo}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all duration-300 font-semibold"
      >
        🦐 Watch Feeding Demo
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-auto p-6 relative flex flex-col gap-6 md:flex-row md:gap-8">
            {/* Close Button */}
            <button
              onClick={toggleDemo}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-3xl font-bold"
            >
              ×
            </button>

            {/* Motor Section */}
            <div className="flex-1 bg-gray-50 p-4 rounded-xl shadow-inner flex flex-col items-center gap-4">
              <div
                className={`w-28 h-28 rounded-full border-8 border-blue-500 flex items-center justify-center text-5xl transition-all ${
                  isFeeding ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: motorSpeed > 0 ? `${2000 / motorSpeed}ms` : 'infinite' }}
              >
                ⚙️
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-700">Motor Speed</p>
                <p className="text-2xl font-bold text-blue-600">{motorSpeed}%</p>
                <div className="w-full bg-gray-300 rounded-full h-3 mt-2">
                  <div className={`h-full ${getStateColor()} rounded-full transition-all`} style={{ width: `${motorSpeed}%` }}></div>
                </div>
              </div>
            </div>

            {/* Feed Section */}
            <div className="flex-1 bg-gray-50 p-4 rounded-xl shadow-inner flex flex-col items-center gap-4">
              <p className="font-semibold text-gray-700 text-center">Feed Dispenser</p>
              <div className="relative w-full h-40 bg-amber-100 rounded-lg overflow-hidden border-2 border-amber-300 flex flex-col justify-end items-center">
                {isFeeding &&
                  Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="text-2xl mb-1 animate-bounce"
                      style={{ animationDelay: `${i * 0.1}s`, animationDuration: `${1 / (motorSpeed / 100)}s` }}
                    >
                      🌾
                    </div>
                  ))}
                <div className="absolute bottom-0 text-center w-full bg-amber-200 bg-opacity-50 p-2 rounded-t-md">
                  <span className="text-3xl">{getAppetiteEmoji()}</span>
                </div>
              </div>
            </div>

            {/* Appetite Section */}
            <div className="flex-1 bg-gray-50 p-4 rounded-xl shadow-inner flex flex-col justify-center items-center gap-2">
              <p className="font-semibold text-gray-700">Shrimp Appetite</p>
              <span className={`px-4 py-2 rounded-full text-white font-bold ${getStateColor()}`}>{feedingState}</span>
              <button
                onClick={nextState}
                className="mt-4 px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 shadow transition-all transform hover:scale-105"
              >
                ▶️ Change Feeding State
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
