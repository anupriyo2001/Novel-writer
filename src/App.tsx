
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Chapter, NovelBlueprint, AIModel, CliffhangerType } from './types';
import { generateNovelBlueprint, generateChapter, regenerateChapter, regenerateNovelBlueprint, upgradeNovelBlueprint, upgradeBlueprintFromText, setExtendedThinking } from './services/geminiService';
import Header from './components/Header';
import NovelSetup from './components/NovelSetup';
import NovelManager from './components/NovelManager';
import NovelDisplay from './components/NovelDisplay';
import Loader from './components/Loader';
import StoryChat from './components/StoryChat';

type AppTab = 'CHAT' | 'SETUP' | 'WRITING';
type DisplayMode = 'welcome' | 'blueprint' | 'chapters';

// ── localStorage keys ──
const LS_BLUEPRINT = 'pna_blueprint';
const LS_CHAPTERS = 'pna_chapters';
const LS_FILE_CONTEXT = 'pna_file_context';
const LS_DISPLAY_MODE = 'pna_display_mode';
const LS_EPISODE_COUNT = 'pna_episode_count';
const LS_CHAT_HISTORY = 'pna_chat_history';
const LS_ACTIVE_TAB = 'pna_active_tab';

const blueprintToString = (blueprint: NovelBlueprint): string => {
  const characters = blueprint.characters
    .map(c => `- ${c.name}: ${c.description}`)
    .join('\n');

  const plan = blueprint.plan.map(p =>
    `ARC: ${p.arc}\n\n` +
    p.episodes.map((ep) => {
      return `--- EPISODE DETAILS ---\n${ep.trim()}`;
    }).join('\n\n')
  ).join('\n\n===\n\n');

  const twistMapStr = blueprint.twist_map && blueprint.twist_map.length > 0
    ? '\n\nTWIST MAP (Season-Level — Writers MUST follow this):\n' +
      blueprint.twist_map.map(entry =>
        `  Episode ${entry.episode_number} | Type: ${entry.twist_type} | Weight: ${entry.weight}\n` +
        `  Setup from: Ep ${entry.setup_begins_at_episode} | Seed: ${entry.foreshadowing_seed}\n` +
        `  Payoff: ${entry.payoff_description}`
      ).join('\n\n')
    : '';

  return `
NOVEL BLUEPRINT CONTEXT:
Title: ${blueprint.title}
Summary: ${blueprint.summary}
Style: ${blueprint.style}

Characters:
${characters}

Plan:
${plan}
${twistMapStr}
  `.trim();
};

const readSingleFile = (file: File): Promise<string> => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target?.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
};

const readFileContents = async (files: File[]): Promise<string> => {
  if (files.length === 0) return "";
  const fileReadPromises = files.map(file => 
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    })
  );
  try {
    const contents = await Promise.all(fileReadPromises);
    return contents.map((content, index) => `Content from file ${files[index].name}:\n${content}`).join('\n\n---\n\n');
  } catch (error) {
    console.error("Error reading files:", error);
    throw new Error("Failed to read one or more files.");
  }
};

// ── Error parsing helper (item 20) ──
const parseApiError = (err: any): string => {
  if (!err) return 'An unexpected error occurred.';
  const msg: string = err.message || String(err);
  if (msg === 'AbortError') return 'AbortError';
  if (msg.includes('429') || msg.toLowerCase().includes('rate limit') || msg.toLowerCase().includes('quota')) {
    return 'Rate limit reached — please wait a moment before retrying.';
  }
  if (msg.includes('403') || msg.toLowerCase().includes('api key') || msg.toLowerCase().includes('permission')) {
    return 'API key issue — check your Gemini API key in Settings.';
  }
  if (msg.includes('400') || msg.toLowerCase().includes('content policy') || msg.toLowerCase().includes('blocked')) {
    return 'Content policy block — try rephrasing the prompt or adjusting the content.';
  }
  if (msg.toLowerCase().includes('json') || msg.toLowerCase().includes('parse')) {
    return 'AI returned malformed data — please retry.';
  }
  if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('timeout')) {
    return 'Network error — check your internet connection and retry.';
  }
  return msg || 'An unexpected error occurred.';
};

const App: React.FC = () => {
  // ── Rehydrate state from localStorage (item 1) ──
  const [activeTab, setActiveTab] = useState<AppTab>(() => {
    try { return (localStorage.getItem(LS_ACTIVE_TAB) as AppTab) || 'CHAT'; } catch { return 'CHAT'; }
  });
  const [novelBlueprint, setNovelBlueprint] = useState<NovelBlueprint | null>(() => {
    try { const s = localStorage.getItem(LS_BLUEPRINT); return s ? JSON.parse(s) : null; } catch { return null; }
  });
  const [chapters, setChapters] = useState<Chapter[]>(() => {
    try { const s = localStorage.getItem(LS_CHAPTERS); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [fileContext, setFileContext] = useState<string>(() => {
    try { return localStorage.getItem(LS_FILE_CONTEXT) || ''; } catch { return ''; }
  });
  const [displayMode, setDisplayMode] = useState<DisplayMode>(() => {
    try { return (localStorage.getItem(LS_DISPLAY_MODE) as DisplayMode) || 'welcome'; } catch { return 'welcome'; }
  });
  const [episodeCount, setEpisodeCount] = useState<number>(() => {
    try { return parseInt(localStorage.getItem(LS_EPISODE_COUNT) || '20'); } catch { return 20; }
  });
  const [chatHistory, setChatHistory] = useState<string>(() => {
    try { return localStorage.getItem(LS_CHAT_HISTORY) || ''; } catch { return ''; }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingChapterId, setEditingChapterId] = useState<number | null>(null);
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini-3.1-pro-preview');
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>("AI is working...");
  const [isExtendedThinking, setIsExtendedThinking] = useState<boolean>(true);
  // item 2: confirmation dialog
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  // item 9: auto-write state
  const [isAutoWriting, setIsAutoWriting] = useState(false);
  const [autoWriteTarget, setAutoWriteTarget] = useState(0);
  const autoWriteRef = useRef(false);
  // item 12: last failed action
  const [lastFailedAction, setLastFailedAction] = useState<(() => void) | null>(null);

  useEffect(() => {
    setExtendedThinking(isExtendedThinking);
  }, [isExtendedThinking]);

  // ── Persist state to localStorage on every change (item 1) ──
  useEffect(() => {
    try { localStorage.setItem(LS_BLUEPRINT, JSON.stringify(novelBlueprint)); } catch {}
  }, [novelBlueprint]);
  useEffect(() => {
    try { localStorage.setItem(LS_CHAPTERS, JSON.stringify(chapters)); } catch {}
  }, [chapters]);
  useEffect(() => {
    try { localStorage.setItem(LS_FILE_CONTEXT, fileContext); } catch {}
  }, [fileContext]);
  useEffect(() => {
    try { localStorage.setItem(LS_DISPLAY_MODE, displayMode); } catch {}
  }, [displayMode]);
  useEffect(() => {
    try { localStorage.setItem(LS_EPISODE_COUNT, String(episodeCount)); } catch {}
  }, [episodeCount]);
  useEffect(() => {
    try { localStorage.setItem(LS_CHAT_HISTORY, chatHistory); } catch {}
  }, [chatHistory]);
  useEffect(() => {
    try { localStorage.setItem(LS_ACTIVE_TAB, activeTab); } catch {}
  }, [activeTab]);

  const handleCancel = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
      autoWriteRef.current = false;
      setIsAutoWriting(false);
      setError("Operation cancelled by user.");
    }
  }, [abortController]);

  const handleInitialGeneration = useCallback(async (
    style: string, 
    prompt: string, 
    files: File[],
    epCount: number,
  ) => {
    setIsLoading(true);
    setLoadingMessage("Generating novel blueprint...");
    setError(null);
    setLastFailedAction(null);
    setChapters([]);
    setNovelBlueprint(null);
    setFileContext('');
    setDisplayMode('welcome');
    setEditingChapterId(null);
    setEpisodeCount(epCount);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const fileCtx = await readFileContents(files);
      const fullPrompt = chatHistory ? `Chat History Context:\n${chatHistory}\n\nUser Prompt:\n${prompt}` : prompt;
      const blueprint = await generateNovelBlueprint(
        selectedModel, style, fullPrompt, fileCtx, epCount,
        controller.signal, (msg) => setLoadingMessage(msg)
      );
      setNovelBlueprint(blueprint);
      setDisplayMode('blueprint');
    } catch (err: any) {
      const parsed = parseApiError(err);
      if (parsed !== 'AbortError') {
        setError(parsed);
        setLastFailedAction(() => () => handleInitialGeneration(style, prompt, files, epCount));
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  }, [selectedModel, chatHistory]);

  const handleUpgradeFromFiles = useCallback(async (
    blueprintFile: File, chapterFiles: File[], prompt: string, targetEpCount: number
  ) => {
    setIsLoading(true);
    setLoadingMessage("Upgrading blueprint...");
    setError(null);
    setLastFailedAction(null);
    setChapters([]);
    setNovelBlueprint(null);
    setFileContext('');
    setDisplayMode('welcome');
    setEditingChapterId(null);
    setEpisodeCount(targetEpCount);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const blueprintContent = await readSingleFile(blueprintFile);
      const chaptersContent = await readFileContents(chapterFiles);
      const fullPrompt = chatHistory ? `Chat History Context:\n${chatHistory}\n\nUser Prompt:\n${prompt}` : prompt;
      const blueprint = await upgradeBlueprintFromText(
        selectedModel, blueprintContent, chaptersContent, fullPrompt, targetEpCount,
        controller.signal, (msg) => setLoadingMessage(msg)
      );
      setNovelBlueprint(blueprint);
      setDisplayMode('blueprint');
    } catch (err: any) {
      const parsed = parseApiError(err);
      if (parsed !== 'AbortError') {
        setError(parsed);
        setLastFailedAction(() => () => handleUpgradeFromFiles(blueprintFile, chapterFiles, prompt, targetEpCount));
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  }, [selectedModel, chatHistory]);

  const handleStartWriting = useCallback(async (
    blueprintFiles: File[], contextFiles: File[], referenceFiles: File[],
    prompt: string, lastEpisodeNumber: number = 0
  ) => {
    setIsLoading(true);
    setLoadingMessage("Writing first chapter...");
    setError(null);
    setLastFailedAction(null);
    setChapters([]);
    setEditingChapterId(null);
    
    const controller = new AbortController();
    setAbortController(controller);

    try {
      let fullContext = '';
      if (chatHistory) fullContext += `CHAT HISTORY CONTEXT (Planning):\n${chatHistory}\n\n---\n\n`;

      if (blueprintFiles && blueprintFiles.length > 0) {
        const blueprintText = await readFileContents(blueprintFiles);
        fullContext += `NOVEL BLUEPRINT CONTEXT (User Uploaded):\n${blueprintText}`;
      } else if (novelBlueprint) {
        fullContext += blueprintToString(novelBlueprint);
      } else {
        throw new Error("A Novel Blueprint is required to start writing. Please upload a blueprint file.");
      }
      
      const uploadedContext = await readFileContents(contextFiles);
      if (uploadedContext) fullContext += `\n\n---\n\nPREWRITTEN EPISODES / CONTEXT (User Uploaded):\n${uploadedContext}`;
      
      const uploadedReference = await readFileContents(referenceFiles);
      if (uploadedReference) fullContext += `\n\n---\n\nREFERENCE NOVEL (Writing Style Reference from User):\n${uploadedReference}`;

      setFileContext(fullContext);
      
      const nextId = lastEpisodeNumber + 1;
      const { title, content, cliffhangerType } = await generateChapter(
        selectedModel, fullContext, [], prompt, true, nextId,
        controller.signal, (msg) => setLoadingMessage(msg), []
      );
      const newChapter: Chapter = { id: nextId, title, content, cliffhangerType };
      setChapters([newChapter]);
      setDisplayMode('chapters');
    } catch (err: any) {
      const parsed = parseApiError(err);
      if (parsed !== 'AbortError') {
        setError(parsed);
        setLastFailedAction(() => () => handleStartWriting(blueprintFiles, contextFiles, referenceFiles, prompt, lastEpisodeNumber));
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  }, [novelBlueprint, selectedModel, chatHistory]);
  
  const handleWriteNextEpisode = useCallback(async (seamlessMode: boolean, currentChapters?: Chapter[], currentFileContext?: string) => {
    const chaptersToUse = currentChapters ?? chapters;
    const contextToUse = currentFileContext ?? fileContext;

    setIsLoading(true);
    setLoadingMessage("Writing next chapter...");
    setError(null);
    setLastFailedAction(null);
    setEditingChapterId(null);
    
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const lastChapter = chaptersToUse.length > 0 ? chaptersToUse[chaptersToUse.length - 1] : null;
      const nextId = lastChapter ? lastChapter.id + 1 : 1;

      const lastCliffhangerTypes = chaptersToUse
        .filter(c => c.cliffhangerType)
        .slice(-3)
        .map(c => c.cliffhangerType as string);

      const { title, content, cliffhangerType } = await generateChapter(
        selectedModel, contextToUse, chaptersToUse, '', seamlessMode, nextId,
        controller.signal, (msg) => setLoadingMessage(msg), lastCliffhangerTypes
      );
      
      const newChapter: Chapter = { id: nextId, title, content, cliffhangerType };
      setChapters(prev => [...prev, newChapter]);
      return newChapter;
    } catch (err: any) {
      const parsed = parseApiError(err);
      if (parsed !== 'AbortError') {
        setError(parsed);
        setLastFailedAction(() => () => handleWriteNextEpisode(seamlessMode));
      }
      throw err;
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  }, [fileContext, chapters, selectedModel]);

  // ── item 9: Auto-write all episodes ──
  const handleAutoWrite = useCallback(async (seamlessMode: boolean, targetCount: number) => {
    setIsAutoWriting(true);
    autoWriteRef.current = true;
    setAutoWriteTarget(targetCount);
    setError(null);

    let currentChapters = [...chapters];
    const currentFileContext = fileContext;

    while (autoWriteRef.current && currentChapters.length < targetCount) {
      try {
        setIsLoading(true);
        setLoadingMessage(`Writing episode ${currentChapters.length + 1} of ${targetCount}...`);

        const controller = new AbortController();
        setAbortController(controller);

        const lastChapter = currentChapters.length > 0 ? currentChapters[currentChapters.length - 1] : null;
        const nextId = lastChapter ? lastChapter.id + 1 : 1;
        const lastCliffhangerTypes = currentChapters.filter(c => c.cliffhangerType).slice(-3).map(c => c.cliffhangerType as string);

        const { title, content, cliffhangerType } = await generateChapter(
          selectedModel, currentFileContext, currentChapters, '', seamlessMode, nextId,
          controller.signal, (msg) => setLoadingMessage(msg), lastCliffhangerTypes
        );

        const newChapter: Chapter = { id: nextId, title, content, cliffhangerType };
        currentChapters = [...currentChapters, newChapter];
        setChapters(currentChapters);
        setIsLoading(false);
        setAbortController(null);

        // Small pause between episodes
        await new Promise(r => setTimeout(r, 500));
      } catch (err: any) {
        const parsed = parseApiError(err);
        autoWriteRef.current = false;
        setIsAutoWriting(false);
        setIsLoading(false);
        setAbortController(null);
        if (parsed !== 'AbortError') setError(parsed);
        return;
      }
    }

    autoWriteRef.current = false;
    setIsAutoWriting(false);
    setIsLoading(false);
  }, [chapters, fileContext, selectedModel]);

  const handleStopAutoWrite = useCallback(() => {
    autoWriteRef.current = false;
    setIsAutoWriting(false);
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setIsLoading(false);
  }, [abortController]);

  const handleRegenerateChapter = useCallback(async (chapterId: number, revisionPrompt: string) => {
    const chapterToRevise = chapters.find(c => c.id === chapterId);
    if (!chapterToRevise) return;

    setIsLoading(true);
    setLoadingMessage("Revising chapter...");
    setError(null);
    setLastFailedAction(null);
    
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const lastCliffhangerTypes = chapters
        .filter(c => c.cliffhangerType && c.id !== chapterId)
        .slice(-3).map(c => c.cliffhangerType as string);

      const { title, content, cliffhangerType } = await regenerateChapter(
        selectedModel, fileContext, chapters, chapterToRevise, revisionPrompt,
        controller.signal, (msg) => setLoadingMessage(msg), lastCliffhangerTypes
      );
      const updatedChapter = { ...chapterToRevise, title, content, cliffhangerType };
      setChapters(prev => prev.map(c => c.id === chapterId ? updatedChapter : c));
      setEditingChapterId(null);
    } catch (err: any) {
      const parsed = parseApiError(err);
      if (parsed !== 'AbortError') {
        setError(parsed);
        setLastFailedAction(() => () => handleRegenerateChapter(chapterId, revisionPrompt));
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  }, [fileContext, chapters, selectedModel]);

  const handleRegenerateBlueprint = useCallback(async (revisionPrompt: string) => {
    if (!novelBlueprint) return;

    setIsLoading(true);
    setLoadingMessage("Revising blueprint...");
    setError(null);
    setLastFailedAction(null);
    // item 19: clear stale fileContext when blueprint regenerated
    setFileContext('');
    
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const fullPrompt = chatHistory ? `Chat History Context:\n${chatHistory}\n\nUser Revision Prompt:\n${revisionPrompt}` : revisionPrompt;
      const newBlueprint = await regenerateNovelBlueprint(
        selectedModel, novelBlueprint, fullPrompt, episodeCount,
        controller.signal, (msg) => setLoadingMessage(msg)
      );
      setNovelBlueprint(newBlueprint);
    } catch (err: any) {
      const parsed = parseApiError(err);
      if (parsed !== 'AbortError') {
        setError(parsed);
        setLastFailedAction(() => () => handleRegenerateBlueprint(revisionPrompt));
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  }, [novelBlueprint, episodeCount, selectedModel, chatHistory]);

  const handleUpgradeBlueprint = useCallback(async () => {
    if (!novelBlueprint || chapters.length === 0) return;

    setIsLoading(true);
    setLoadingMessage("Upgrading blueprint...");
    setError(null);
    setLastFailedAction(null);
    
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const chaptersContent = chapters
        .map(c => `## Episode ${c.id}: ${c.title}\n\n${c.content}`)
        .join('\n\n---\n\n');
      const newBlueprint = await upgradeNovelBlueprint(
        selectedModel, novelBlueprint, chaptersContent,
        controller.signal, (msg) => setLoadingMessage(msg)
      );
      setNovelBlueprint(newBlueprint);
    } catch (err: any) {
      const parsed = parseApiError(err);
      if (parsed !== 'AbortError') {
        setError(parsed);
        setLastFailedAction(() => () => handleUpgradeBlueprint());
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  }, [novelBlueprint, chapters, selectedModel]);

  // item 17: useCallback for handleStartOver and resetAll
  const handleStartOver = useCallback(() => {
    setChapters([]);
    setFileContext('');
    setError(null);
    setLastFailedAction(null);
    setEditingChapterId(null);
    setDisplayMode(novelBlueprint ? 'blueprint' : 'welcome');
  }, [novelBlueprint]);
  
  // item 2: resetAll wrapped in confirmation
  const requestReset = useCallback(() => {
    setShowResetConfirm(true);
  }, []);

  const resetAll = useCallback(() => {
    setShowResetConfirm(false);
    setActiveTab('CHAT');
    setNovelBlueprint(null);
    setChapters([]);
    setFileContext('');
    setError(null);
    setLastFailedAction(null);
    setEditingChapterId(null);
    setDisplayMode('welcome');
    setChatHistory('');
    try {
      localStorage.removeItem(LS_BLUEPRINT);
      localStorage.removeItem(LS_CHAPTERS);
      localStorage.removeItem(LS_FILE_CONTEXT);
      localStorage.removeItem(LS_DISPLAY_MODE);
      localStorage.removeItem(LS_EPISODE_COUNT);
      localStorage.removeItem(LS_CHAT_HISTORY);
      localStorage.removeItem(LS_ACTIVE_TAB);
    } catch {}
  }, []);

  const getTabClass = (tabName: AppTab) => {
    const isActive = activeTab === tabName;
    return `flex-1 py-3 px-1 text-center font-medium text-sm transition-colors duration-200 ${
      isActive
        ? 'border-b-2 border-amber-400 text-amber-400'
        : 'border-b-2 border-transparent text-gray-400 hover:text-gray-200'
    }`;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Header 
        onReset={requestReset}
        selectedModel={selectedModel} 
        onModelChange={setSelectedModel} 
        isExtendedThinking={isExtendedThinking}
        onExtendedThinkingChange={setIsExtendedThinking}
      />
      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[calc(100vh-150px)] max-h-[1000px]">
          <div className="md:col-span-1 h-[500px] md:h-full flex flex-col bg-gray-800/50 rounded-lg border border-gray-700 min-h-0 relative z-10">
            <div className="border-b border-gray-600 flex-shrink-0">
              <nav className="flex">
                <button onClick={() => setActiveTab('CHAT')} className={getTabClass('CHAT')}>1. Planning</button>
                <button onClick={() => setActiveTab('SETUP')} className={getTabClass('SETUP')}>2. Blueprint</button>
                <button onClick={() => setActiveTab('WRITING')} className={getTabClass('WRITING')}>3. Writing</button>
              </nav>
            </div>
            <div className="flex-grow overflow-y-auto p-6 flex flex-col min-h-0">
              {activeTab === 'CHAT' && (
                <StoryChat
                  selectedModel={selectedModel}
                  hasBlueprint={!!novelBlueprint}
                  onProceed={(history) => {
                    setChatHistory(history);
                    setActiveTab(novelBlueprint ? 'WRITING' : 'SETUP');
                  }}
                />
              )}
              {activeTab === 'SETUP' && (
                <NovelSetup
                  onGenerate={handleInitialGeneration}
                  onUpgrade={handleUpgradeFromFiles}
                  isLoading={isLoading}
                />
              )}
              {activeTab === 'WRITING' && (
                <NovelManager
                  onStartWriting={handleStartWriting}
                  isLoading={isLoading}
                  onStartOver={handleStartOver}
                  hasStarted={chapters.length > 0}
                  hasActiveBlueprint={!!novelBlueprint}
                  chapters={chapters}
                  episodeCount={episodeCount}
                  onAutoWrite={handleAutoWrite}
                  onStopAutoWrite={handleStopAutoWrite}
                  isAutoWriting={isAutoWriting}
                  autoWriteTarget={autoWriteTarget}
                />
              )}
            </div>
          </div>
          <div className="md:col-span-2 h-[600px] md:h-full min-h-0">
            <NovelDisplay 
              chapters={chapters} 
              isLoading={isLoading} 
              loadingMessage={loadingMessage}
              onCancel={handleCancel}
              onWriteNext={handleWriteNextEpisode}
              novelBlueprint={novelBlueprint}
              displayMode={displayMode}
              onRegenerateChapter={handleRegenerateChapter}
              editingChapterId={editingChapterId}
              onSetEditingChapterId={setEditingChapterId}
              onRegenerateBlueprint={handleRegenerateBlueprint}
              onUpgradeBlueprint={handleUpgradeBlueprint}
              episodeCount={episodeCount}
            />
          </div>
        </div>

        {/* item 15: floating toast error */}
        {error && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4">
            <div className="p-4 bg-red-900/90 backdrop-blur text-red-200 border border-red-600 rounded-xl shadow-2xl flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0 mt-0.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <strong className="block text-sm font-semibold text-red-300">Error</strong>
                <span className="text-sm">{error}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {/* item 12: retry button */}
                {lastFailedAction && (
                  <button
                    onClick={() => { setError(null); lastFailedAction(); }}
                    className="px-3 py-1 text-xs font-semibold rounded-md bg-amber-500 text-gray-900 hover:bg-amber-400"
                  >
                    Retry
                  </button>
                )}
                <button onClick={() => { setError(null); setLastFailedAction(null); }} className="text-red-400 hover:text-white text-xl leading-none">&times;</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* item 2: confirmation dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-800 border border-gray-600 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">Start a New Novel?</h3>
            <p className="text-gray-400 text-sm mb-6">
              This will erase all written episodes, your blueprint, and chat history. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 text-sm font-medium rounded-md text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={resetAll}
                className="px-4 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-500"
              >
                Yes, Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
