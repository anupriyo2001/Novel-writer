
import React, { useState, useRef } from 'react';
import { Chapter } from '../types';

interface NovelManagerProps {
  onStartWriting: (blueprintFiles: File[], contextFiles: File[], referenceFiles: File[], prompt: string, lastEpisodeNumber: number) => void;
  isLoading: boolean;
  onStartOver: () => void;
  hasStarted: boolean;
  hasActiveBlueprint: boolean;
  // item 9 & 16 additions
  chapters: Chapter[];
  episodeCount: number;
  onAutoWrite: (seamlessMode: boolean, targetCount: number) => void;
  onStopAutoWrite: () => void;
  isAutoWriting: boolean;
  autoWriteTarget: number;
}

const MAX_FILES = 50;
const MAX_BLUEPRINTS = 3;

const NovelManager: React.FC<NovelManagerProps> = ({
  onStartWriting, isLoading, onStartOver, hasStarted, hasActiveBlueprint,
  chapters, episodeCount, onAutoWrite, onStopAutoWrite, isAutoWriting, autoWriteTarget
}) => {
  const [blueprintFiles, setBlueprintFiles] = useState<File[]>([]);
  const [contextFiles, setContextFiles] = useState<File[]>([]);
  const [referenceFiles, setReferenceFiles] = useState<File[]>([]);
  const [prompt, setPrompt] = useState('');
  const [lastEpisodeNumber, setLastEpisodeNumber] = useState<string>('');
  const [overrideBlueprint, setOverrideBlueprint] = useState(false);
  const [seamlessMode, setSeamlessMode] = useState(true);
  
  const blueprintInputRef = useRef<HTMLInputElement>(null);
  const contextInputRef = useRef<HTMLInputElement>(null);
  const referenceInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const episodeNum = parseInt(lastEpisodeNumber) || 0;
    onStartWriting(blueprintFiles, contextFiles, referenceFiles, prompt, episodeNum);
  };

  const handleReset = () => {
    setBlueprintFiles([]); setContextFiles([]); setReferenceFiles([]);
    setPrompt(''); setLastEpisodeNumber('');
    onStartOver();
  };
  
  const isReadyToWrite = hasActiveBlueprint || blueprintFiles.length > 0;

  // ── item 16: rich writing-in-progress panel ──
  if (hasStarted) {
    const totalWords = chapters.reduce((sum, c) => {
      const clean = c.content.replace(/<[^>]+>/g, ' ');
      return sum + clean.split(/\s+/).filter(Boolean).length;
    }, 0);

    // cliffhanger variety
    const cliffhangerCounts: Record<string, number> = {};
    chapters.forEach(c => {
      if (c.cliffhangerType) cliffhangerCounts[c.cliffhangerType] = (cliffhangerCounts[c.cliffhangerType] || 0) + 1;
    });

    const progressPct = episodeCount > 0 ? Math.round((chapters.length / episodeCount) * 100) : 0;

    return (
      <div className="flex flex-col h-full space-y-5">
        <h3 className="text-xl font-semibold text-amber-300 border-b border-gray-700 pb-2">Writing in Progress</h3>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>{chapters.length} / {episodeCount} episodes</span>
            <span>{progressPct}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div className="bg-amber-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${Math.min(progressPct, 100)}%` }} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-700 text-center">
            <div className="text-2xl font-bold text-amber-300">{chapters.length}</div>
            <div className="text-xs text-gray-400 mt-0.5">Episodes Written</div>
          </div>
          <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-700 text-center">
            <div className="text-2xl font-bold text-amber-300">{totalWords.toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-0.5">Total Words</div>
          </div>
        </div>

        {/* Cliffhanger variety */}
        {Object.keys(cliffhangerCounts).length > 0 && (
          <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-700">
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Cliffhanger Variety</div>
            <div className="space-y-1">
              {Object.entries(cliffhangerCounts).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between text-xs">
                  <span className="text-gray-300 font-mono">{type.replace(/_/g, ' ')}</span>
                  <span className="text-amber-400 font-semibold">×{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Auto-write section */}
        <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-700">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Auto-Write Mode</div>
          {isAutoWriting ? (
            <div className="space-y-2">
              <p className="text-sm text-amber-300">Writing episode {chapters.length + 1} of {autoWriteTarget}…</p>
              <button onClick={onStopAutoWrite} className="w-full px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-500 transition-colors">
                ⏸ Pause Auto-Write
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-400">Auto-write remaining {episodeCount - chapters.length} episodes ({chapters.length + 1}–{episodeCount}).</p>
              <button
                onClick={() => onAutoWrite(seamlessMode, episodeCount)}
                disabled={isLoading || chapters.length >= episodeCount}
                className="w-full px-4 py-2 text-sm font-medium rounded-md text-gray-900 bg-amber-400 hover:bg-amber-500 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                ▶ Auto-Write All
              </button>
            </div>
          )}
        </div>

        <button onClick={handleReset} className="text-sm text-amber-400 hover:underline text-center mt-auto">
          Start Over With New Context
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-6">
      <h2 className="text-2xl font-semibold text-amber-300 border-b border-gray-700 pb-2">2. Write Your Novel</h2>

      {/* SECTION 1: BLUEPRINT */}
      <div className="bg-gray-900/40 p-4 rounded-lg border border-amber-900/50">
        <label className="block text-sm font-bold text-amber-400 uppercase tracking-wide mb-3">1. Novel Blueprint (Required)</label>
        {hasActiveBlueprint && !overrideBlueprint ? (
          <div className="flex items-center justify-between bg-emerald-900/20 border border-emerald-800 p-3 rounded-md">
            <div className="flex items-center text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium">Blueprint Loaded from Setup</span>
            </div>
            <button type="button" onClick={() => setOverrideBlueprint(true)} className="text-xs text-gray-400 hover:text-white underline">Upload different file</button>
          </div>
        ) : (
          <div>
            <input type="file" multiple accept=".txt" onChange={e => {
              if (e.target.files) {
                const nf = Array.from(e.target.files);
                if (blueprintFiles.length + nf.length > MAX_BLUEPRINTS) { alert(`Max ${MAX_BLUEPRINTS} blueprint files.`); return; }
                setBlueprintFiles([...blueprintFiles, ...nf]);
              }
              if (blueprintInputRef.current) blueprintInputRef.current.value = '';
            }} ref={blueprintInputRef} className="hidden" id="blueprint-upload" />
            <label htmlFor="blueprint-upload" className={`w-full cursor-pointer bg-gray-700 hover:bg-gray-600 text-sm rounded-lg p-3 flex items-center justify-center border border-dashed transition-colors ${blueprintFiles.length > 0 ? 'border-amber-500 text-amber-300' : 'border-gray-500 text-gray-300'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Upload Blueprint (.txt, max {MAX_BLUEPRINTS})
            </label>
            {blueprintFiles.length > 0 && <div className="mt-2 space-y-1">{blueprintFiles.map((file, i) => <div key={i} className="flex items-center justify-between bg-gray-700/50 p-1.5 rounded-md text-xs"><span className="text-gray-300 truncate pr-2">{file.name}</span><button type="button" onClick={() => setBlueprintFiles(blueprintFiles.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 font-bold text-lg leading-none p-1">&times;</button></div>)}</div>}
            {hasActiveBlueprint && overrideBlueprint && (
              <button type="button" onClick={() => { setOverrideBlueprint(false); setBlueprintFiles([]); }} className="mt-2 text-xs text-gray-500 hover:text-gray-300">Cancel upload, use loaded blueprint</button>
            )}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-2">The AI <strong>must</strong> have a blueprint to maintain plot continuity.</p>
      </div>

      {/* SECTION 2: PREWRITTEN EPISODES */}
      <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-700">
        <label className="block mb-1 text-sm font-bold text-gray-300 uppercase tracking-wide">2. Upload Prewritten Episodes (Optional)</label>
        <p className="text-xs text-gray-400 mb-3">Upload .txt files of episodes already written. The AI will read these to understand the story so far.</p>
        <input type="file" multiple accept=".txt" onChange={e => {
          if (e.target.files) {
            const nf = Array.from(e.target.files);
            if (contextFiles.length + nf.length > MAX_FILES) { alert(`Max ${MAX_FILES} files.`); return; }
            setContextFiles([...contextFiles, ...nf]);
          }
          if (contextInputRef.current) contextInputRef.current.value = '';
        }} ref={contextInputRef} className="hidden" id="context-upload" />
        <label htmlFor="context-upload" className="w-full cursor-pointer bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg p-3 flex items-center justify-center border border-dashed border-gray-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Upload Episode Files (max {MAX_FILES})
        </label>
        {contextFiles.length > 0 && <div className="mt-2 space-y-1">{contextFiles.map((file, i) => <div key={i} className="flex items-center justify-between bg-gray-700/50 p-1.5 rounded-md text-xs"><span className="text-gray-300 truncate pr-2">{file.name}</span><button type="button" onClick={() => setContextFiles(contextFiles.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 font-bold text-lg leading-none p-1">&times;</button></div>)}</div>}
        <div className="mt-3">
          <label htmlFor="last-ep-num" className="block text-xs font-medium text-gray-400 mb-1">Last Written Episode Number (Optional)</label>
          <input type="number" id="last-ep-num" min="0" placeholder="e.g. 5 (AI will write Episode 6)" value={lastEpisodeNumber} onChange={e => setLastEpisodeNumber(e.target.value)}
            className="bg-gray-800 border border-gray-600 text-white text-sm rounded-md w-full p-2 focus:ring-amber-500 focus:border-amber-500 placeholder-gray-600" />
          <p className="text-[10px] text-gray-500 mt-1">Leave empty if starting from Episode 1.</p>
        </div>
      </div>

      {/* SECTION 3: REFERENCE NOVEL */}
      <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-700">
        <label className="block mb-1 text-sm font-bold text-gray-300 uppercase tracking-wide">3. Upload Reference Novel (Optional)</label>
        <p className="text-xs text-gray-400 mb-3">Upload .txt files of a novel as a writing style reference. The AI will mimic this prose flow and tone.</p>
        <input type="file" multiple accept=".txt" onChange={e => {
          if (e.target.files) {
            const nf = Array.from(e.target.files);
            if (referenceFiles.length + nf.length > MAX_FILES) { alert(`Max ${MAX_FILES} files.`); return; }
            setReferenceFiles([...referenceFiles, ...nf]);
          }
          if (referenceInputRef.current) referenceInputRef.current.value = '';
        }} ref={referenceInputRef} className="hidden" id="reference-upload" />
        <label htmlFor="reference-upload" className="w-full cursor-pointer bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg p-3 flex items-center justify-center border border-dashed border-gray-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Upload Reference Files (max {MAX_FILES})
        </label>
        {referenceFiles.length > 0 && <div className="mt-2 space-y-1">{referenceFiles.map((file, i) => <div key={i} className="flex items-center justify-between bg-gray-700/50 p-1.5 rounded-md text-xs"><span className="text-gray-300 truncate pr-2">{file.name}</span><button type="button" onClick={() => setReferenceFiles(referenceFiles.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 font-bold text-lg leading-none p-1">&times;</button></div>)}</div>}
      </div>

      {/* SECTION 4: INSTRUCTIONS */}
      <div className="flex-grow flex flex-col">
        <label htmlFor="prompt" className="block mb-2 text-sm font-bold text-gray-300 uppercase tracking-wide">4. Instructions (Optional)</label>
        <textarea id="prompt" rows={6} className="block p-3 w-full text-sm text-gray-200 bg-gray-700 rounded-lg border border-gray-600 focus:ring-amber-500 focus:border-amber-500 flex-grow"
          placeholder="e.g., 'Introduce a new conflict for the main character.'" value={prompt} onChange={e => setPrompt(e.target.value)} />
      </div>
      
      <button type="submit" disabled={isLoading || !isReadyToWrite}
        className="mt-6 w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-gray-900 bg-amber-400 hover:bg-amber-500 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        title={!isReadyToWrite ? "Please upload a blueprint to start" : ""}>
        {isLoading ? 'Reading & Writing...' : 'Start Writing'}
      </button>
    </form>
  );
};

export default NovelManager;
