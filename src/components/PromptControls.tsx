import React from 'react';

interface PromptControlsProps {
  onInsert: (text: string) => void;
}

const shortcuts = [
  { label: '⚡ High Tension', text: 'Maximize tension and suspense in this episode. Every scene should escalate the conflict.' },
  { label: '💬 More Dialogue', text: 'Increase dialogue to at least 85%. Characters should reveal character through conversation.' },
  { label: '🔄 POV Shift', text: 'Shift the point of view to a secondary character for fresh perspective.' },
  { label: '🌅 Slow Burn', text: 'Write this episode with slow pacing, focus on emotion and atmosphere over action.' },
  { label: '💥 Cliffhanger+', text: 'End this episode with the most shocking possible cliffhanger from the twist map.' },
  { label: '🕵️ Foreshadow', text: 'Plant 2–3 subtle foreshadowing seeds for upcoming twists without being obvious.' },
];

const PromptControls: React.FC<PromptControlsProps> = ({ onInsert }) => {
  return (
    <div className="flex flex-wrap gap-1.5">
      {shortcuts.map(s => (
        <button
          key={s.label}
          type="button"
          onClick={() => onInsert(s.text)}
          className="px-2 py-1 text-xs rounded-md bg-gray-700/60 hover:bg-gray-600 text-gray-300 hover:text-white border border-gray-600 transition-colors"
          title={s.text}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
};

export default PromptControls;
