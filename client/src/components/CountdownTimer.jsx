import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ endTime, active }) => {
  const [timeLeft, setTimeLeft] = useState(0);
  
  useEffect(() => {
    if (!active) {
      setTimeLeft(0);
      return;
    }
    
    // Calculate initial time left
    const initialTimeLeft = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
    setTimeLeft(initialTimeLeft);
    
    // Update timer every second
    const timer = setInterval(() => {
      const newTimeLeft = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(newTimeLeft);
      
      if (newTimeLeft <= 0) {
        clearInterval(timer);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [endTime, active]);
  
  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage
  const calculateProgress = () => {
    if (!active) return 0;
    const totalTime = 60; // 60 seconds for the poll
    const progress = (timeLeft / totalTime) * 100;
    return Math.max(0, Math.min(100, progress));
  };
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">
          {active ? "Time remaining:" : "Poll ended"}
        </span>
        <span className="text-sm font-bold font-mono">
          {formatTime(timeLeft)}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full ${timeLeft > 10 ? 'bg-blue-500' : 'bg-red-500'}`}
          style={{ width: `${calculateProgress()}%` }}
        ></div>
      </div>
    </div>
  );
};

export default CountdownTimer;