
import React, { useState, useRef } from 'react';

interface NovelSetupProps {
  onGenerate: (style: string, prompt: string, files: File[], episodeCount: number) => void;
  onUpgrade: (blueprintFile: File, chapterFiles: File[], prompt: string, episodeCount: number) => void;
  isLoading: boolean;
}

const novelStyles = ["Romance", "Thriller", "Mystery", "Fantasy", "Sci-Fi", "Historical", "Superpower"];
const MAX_FILES = 50;

const NovelSetup: React.FC<NovelSetupProps> = ({ onGenerate, onUpgrade, isLoading }) => {
  const [mode, setMode] = useState<'create' | 'upgrade'>('create');

  // create mode
  const [novelStyle, setNovelStyle] = useState(novelStyles[0]);
  // item 8: custom style
  const [customStyle, setCustomStyle] = useState('');
  const [episodeCount, setEpisodeCount] = useState(20);
  const [createFiles, setCreateFiles] = useState<File[]>([]);
  const [prompt, setPrompt] = useState('');
  const createFileInputRef = useRef<HTMLInputElement>(null);

  // upgrade mode
  const [blueprintFile, setBlueprintFile] = useState<File | null>(null);
  const [chapterFiles, setChapterFiles] = useState<File[]>([]);
  const [upgradePrompt, setUpgradePrompt] = useState('');
  const [upgradeEpisodeCount, setUpgradeEpisodeCount] = useState(60);
  const blueprintFileInputRef = useRef<HTMLInputElement>(null);
  const chaptersFileInputRef = useRef<HTMLInputElement>(null);

  const effectiveStyle = customStyle.trim() || novelStyle;

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(effectiveStyle, prompt, createFiles, episodeCount);
  };
  
  const handleUpgradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (blueprintFile && chapterFiles.length > 0) {
      onUpgrade(blueprintFile, chapterFiles, upgradePrompt, upgradeEpisodeCount);
    }
  };

  const handleCreateFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (createFiles.length + newFiles.length > MAX_FILES) { alert(`Max ${MAX_FILES} files.`); return; }
      setCreateFiles([...createFiles, ...newFiles]);
    }
    if (createFileInputRef.current) createFileInputRef.current.value = '';
  };

  const handleBlueprintFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setBlueprintFile(e.target.files[0]);
    if (blueprintFileInputRef.current) blueprintFileInputRef.current.value = '';
  };

  const handleChapterFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (chapterFiles.length + newFiles.length > MAX_FILES) { alert(`Max ${MAX_FILES} files.`); return; }
      setChapterFiles([...chapterFiles, ...newFiles]);
    }
    if (chaptersFileInputRef.current) chaptersFileInputRef.current.value = '';
  };

  // item 14: replace div onClick tabs with <button role="tab">
  const getTabClass = (tabName: 'create' | 'upgrade') => {
    const isActive = mode === tabName;
    return `w-1/2 py-2 px-1 text-center font-medium text-sm transition-colors duration-200 rounded-t-lg cursor-pointer ${
      isActive ? 'bg-gray-700/60 text-amber-400' : 'bg-gray-800/20 text-gray-400 hover:bg-gray-700/30 hover:text-gray-200'
    }`;
  };

  const renderCreateForm = () => (
    <form onSubmit={handleGenerateSubmit} className="flex flex-col h-full">
      <h2 className="text-2xl font-semibold mb-4 text-amber-300">Create New Blueprint</h2>
      <p className="text-sm text-gray-400 mb-6">Provide the high-level direction. The AI will generate a detailed plan with your main characters.</p>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label htmlFor="novel-style" className="block mb-2 text-sm font-medium text-gray-300">Style</label>
          <select id="novel-style" value={novelStyle} onChange={e => setNovelStyle(e.target.value)} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg w-full p-2.5">
            {novelStyles.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="episode-count" className="block mb-2 text-sm font-medium text-gray-300">Episodes</label>
          <input type="number" id="episode-count" value={episodeCount} onChange={e => setEpisodeCount(Math.max(1, parseInt(e.target.value) || 1))} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg w-full p-2.5" />
        </div>
      </div>

      {/* item 8: custom style input */}
      <div className="mb-4">
        <label htmlFor="custom-style" className="block mb-1 text-sm font-medium text-gray-300">
          Custom Style <span className="text-gray-500 font-normal">(optional — overrides dropdown above)</span>
        </label>
        <input
          type="text"
          id="custom-style"
          value={customStyle}
          onChange={e => setCustomStyle(e.target.value)}
          placeholder="e.g. Bollywood romance, Hinglish drama, dark comedy..."
          className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg w-full p-2.5 focus:ring-amber-500 focus:border-amber-500 placeholder-gray-500"
        />
        {customStyle.trim() && (
          <p className="mt-1 text-xs text-amber-400">✓ Using custom style: "{customStyle.trim()}"</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-300">Reference Files (Optional)</label>
        <input type="file" multiple accept=".txt" onChange={handleCreateFileChange} ref={createFileInputRef} className="hidden" id="file-upload-setup" />
        <label htmlFor="file-upload-setup" className="w-full cursor-pointer bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg p-2.5 flex items-center justify-center border border-dashed border-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Upload .txt files (max {MAX_FILES})
        </label>
        {createFiles.length > 0 && <div className="mt-2 space-y-1">{createFiles.map((file, i) => <div key={i} className="flex items-center justify-between bg-gray-700/50 p-1.5 rounded-md text-xs"><span className="text-gray-300 truncate pr-2">{file.name}</span><button type="button" onClick={() => setCreateFiles(createFiles.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 font-bold text-lg leading-none p-1">&times;</button></div>)}</div>}
      </div>

      <div className="flex-grow flex flex-col">
        <label htmlFor="prompt" className="block mb-2 text-sm font-medium text-gray-300">Main Idea / Prompt (Optional)</label>
        <textarea id="prompt" rows={8} className="block p-2.5 w-full text-sm text-gray-200 bg-gray-700 rounded-lg border border-gray-600 focus:ring-amber-500 focus:border-amber-500 flex-grow"
          placeholder="Describe a core idea, a main character, or a specific scene..." value={prompt} onChange={e => setPrompt(e.target.value)} />
      </div>
      
      <button type="submit" disabled={isLoading} className="mt-6 w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-gray-900 bg-amber-400 hover:bg-amber-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors">
        {isLoading ? 'Generating...' : 'Generate Blueprint'}
      </button>
    </form>
  );

  const renderUpgradeForm = () => (
    <form onSubmit={handleUpgradeSubmit} className="flex flex-col h-full">
      <h2 className="text-2xl font-semibold mb-4 text-amber-300">Upgrade & Extend Blueprint</h2>
      <p className="text-sm text-gray-400 mb-6">Upload your blueprint and written episodes to extend and improve the plan.</p>
      
      <div className="mb-4">
        <label htmlFor="upgrade-episode-count" className="block mb-2 text-sm font-medium text-gray-300">Target Total Episodes</label>
        <input type="number" id="upgrade-episode-count" value={upgradeEpisodeCount} onChange={e => setUpgradeEpisodeCount(Math.max(1, parseInt(e.target.value) || 1))} className="bg-gray-700 border border-gray-600 text-white text-sm rounded-lg w-full p-2.5" />
        <p className="mt-1 text-xs text-gray-500">New episodes will be generated if this exceeds the current count.</p>
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-300">Blueprint File</label>
        <input type="file" accept=".txt" onChange={handleBlueprintFileChange} ref={blueprintFileInputRef} className="hidden" id="file-upload-blueprint" />
        <label htmlFor="file-upload-blueprint" className="w-full cursor-pointer bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg p-2.5 flex items-center justify-center border border-dashed border-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Upload .txt blueprint
        </label>
        {blueprintFile && <div className="mt-2"><div className="flex items-center justify-between bg-gray-700/50 p-1.5 rounded-md text-xs"><span className="text-gray-300 truncate pr-2">{blueprintFile.name}</span><button type="button" onClick={() => setBlueprintFile(null)} className="text-red-400 hover:text-red-300 font-bold text-lg leading-none p-1">&times;</button></div></div>}
      </div>

      <div className="mb-4">
        <label className="block mb-2 text-sm font-medium text-gray-300">Written Episode Files</label>
        <input type="file" multiple accept=".txt" onChange={handleChapterFilesChange} ref={chaptersFileInputRef} className="hidden" id="file-upload-chapters" />
        <label htmlFor="file-upload-chapters" className="w-full cursor-pointer bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg p-2.5 flex items-center justify-center border border-dashed border-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Upload .txt episodes (max {MAX_FILES})
        </label>
        {chapterFiles.length > 0 && <div className="mt-2 space-y-1 overflow-y-auto max-h-[100px]">{chapterFiles.map((file, i) => <div key={i} className="flex items-center justify-between bg-gray-700/50 p-1.5 rounded-md text-xs"><span className="text-gray-300 truncate pr-2">{file.name}</span><button type="button" onClick={() => setChapterFiles(chapterFiles.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-300 font-bold text-lg leading-none p-1">&times;</button></div>)}</div>}
      </div>
      
      <div className="flex-grow flex flex-col">
        <label htmlFor="upgrade-prompt" className="block mb-2 text-sm font-medium text-gray-300">Instructions (Optional)</label>
        <textarea id="upgrade-prompt" rows={5} className="block p-2.5 w-full text-sm text-gray-200 bg-gray-700 rounded-lg border border-gray-600 focus:ring-amber-500 focus:border-amber-500 flex-grow"
          placeholder="e.g., 'Add a new character named Ravi.'" value={upgradePrompt} onChange={e => setUpgradePrompt(e.target.value)} />
      </div>
      
      <button type="submit" disabled={isLoading || !blueprintFile || chapterFiles.length === 0}
        className="mt-6 w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-gray-900 bg-amber-400 hover:bg-amber-500 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
        {isLoading ? 'Upgrading...' : 'Upgrade & Extend Blueprint'}
      </button>
    </form>
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-gray-600" role="tablist">
        {/* item 14: use <button role="tab"> instead of <div onClick> */}
        <button role="tab" aria-selected={mode === 'create'} onClick={() => setMode('create')} className={getTabClass('create')}>
          Create New
        </button>
        <button role="tab" aria-selected={mode === 'upgrade'} onClick={() => setMode('upgrade')} className={getTabClass('upgrade')}>
          Upgrade Existing
        </button>
      </div>
      <div className="pt-6 flex-grow h-full flex flex-col">
        {mode === 'create' ? renderCreateForm() : renderUpgradeForm()}
      </div>
    </div>
  );
};

export default NovelSetup;
