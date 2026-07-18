
import React from 'react';
import { AIModel } from '../types';

interface HeaderProps {
  onReset: () => void;
  selectedModel: AIModel;
  onModelChange: (model: AIModel) => void;
  isExtendedThinking: boolean;
  onExtendedThinkingChange: (enabled: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ onReset, selectedModel, onModelChange, isExtendedThinking, onExtendedThinkingChange }) => {
  return (
    <header className="relative w-full py-4 px-6 border-b border-gray-700 bg-gray-900/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between z-20">
      <div className="flex flex-col items-center sm:items-start mb-4 sm:mb-0">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
          Pocket Novel AI
        </h1>
        <p className="text-gray-400 mt-1 text-sm font-medium">
          Write your story with Gemini AI
        </p>
      </div>
      <div className="flex items-start gap-4 w-full sm:w-auto justify-center sm:justify-end">
        <div className="flex flex-col items-center sm:items-end gap-2">
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => onModelChange(e.target.value as AIModel)}
              className="appearance-none bg-gray-800/80 border border-gray-600 text-gray-200 text-sm rounded-lg pl-4 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all shadow-sm hover:bg-gray-700/80 cursor-pointer"
            >
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview</option>
              <option value="gemini-3-pro-preview">Gemini 3 Pro Preview</option>
              <option value="gemini-3-flash-preview">Gemini 3 Flash Preview</option>
              <option value="gemini-3.1-flash-lite-preview">Gemini 3.1 Flash Lite Preview</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer group">
            <span className="text-xs text-gray-400 font-medium group-hover:text-gray-300 transition-colors">Extended Thinking</span>
            <div className="relative inline-block w-8 h-4 rounded-full bg-gray-700 transition-colors">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={isExtendedThinking}
                onChange={(e) => onExtendedThinkingChange(e.target.checked)}
              />
              <div className="absolute left-[2px] top-[2px] bg-gray-400 w-3 h-3 rounded-full transition-all peer-checked:translate-x-4 peer-checked:bg-amber-400 shadow-sm border border-gray-600 peer-checked:border-amber-300"></div>
            </div>
          </label>
        </div>
        <button
          onClick={onReset}
          title="Start a new novel"
          className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-gray-900 hover:from-amber-400 hover:to-orange-400 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
        >
          New Novel
        </button>
      </div>
    </header>
  );
};

export default Header;