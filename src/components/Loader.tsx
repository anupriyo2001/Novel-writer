import React from 'react';

interface LoaderProps {
  message?: string;
  onCancel?: () => void;
}

const Loader: React.FC<LoaderProps> = ({ message = "AI is working...", onCancel }) => {
  return (
    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
      <div className="flex flex-col items-center bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-2xl max-w-sm w-full mx-4">
        <svg
          className="animate-spin h-12 w-12 text-amber-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <p className="mt-6 text-gray-200 text-lg font-medium text-center">{message}</p>
        {onCancel && (
          <button 
            onClick={onCancel}
            className="mt-8 px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/50 hover:border-red-500 rounded-lg transition-all duration-200 font-medium w-full"
          >
            Cancel Generation
          </button>
        )}
      </div>
    </div>
  );
};

export default Loader;