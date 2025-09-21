import React from 'react';

const Message = ({ type, title, message, onClose, showIcon = true, className = '' }) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          containerClass: 'bg-green-500/20 border-green-500/30 text-green-300',
          icon: (
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
          title: title || 'Success'
        };
      case 'error':
        return {
          containerClass: 'bg-red-500/20 border-red-500/30 text-red-300',
          icon: (
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: title || 'Error'
        };
      case 'warning':
        return {
          containerClass: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
          icon: (
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          title: title || 'Warning'
        };
      case 'info':
        return {
          containerClass: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
          icon: (
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: title || 'Information'
        };
      default:
        return {
          containerClass: 'bg-gray-500/20 border-gray-500/30 text-gray-300',
          icon: (
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: title || 'Message'
        };
    }
  };

  const config = getTypeConfig();

  return (
    <div className={`mb-5 sm:mb-6 p-3 sm:p-4 text-xs sm:text-sm rounded-lg border flex items-start gap-2 sm:gap-3 ${config.containerClass} ${className}`}>
      {showIcon && config.icon}
      <div className="flex-1">
        <p className="font-medium mb-1">{config.title}</p>
        <p>{message}</p>
      </div>
      {onClose && (
        <button 
          onClick={onClose} 
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Dismiss message"
        >
          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Message;