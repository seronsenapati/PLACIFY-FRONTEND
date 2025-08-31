// src/components/MiniLoader.jsx
import React from 'react';

const MiniLoader = ({ 
  size = 'sm', 
  color = 'blue', 
  text = '', 
  className = '' 
}) => {
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4', 
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const colorClasses = {
    blue: 'border-blue-500',
    purple: 'border-purple-500',
    green: 'border-green-500',
    red: 'border-red-500',
    white: 'border-white'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className={`${sizeClasses[size]} rounded-full border-2 border-transparent ${colorClasses[color]} border-t-current animate-spin`}
      ></div>
      {text && <span className="text-sm">{text}</span>}
    </div>
  );
};

export default MiniLoader;