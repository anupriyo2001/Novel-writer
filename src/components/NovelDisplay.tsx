
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Chapter, NovelBlueprint } from '../types';
import TtsPlayer from './TtsPlayer';
import Loader from './Loader';

interface NovelDisplayProps {
  chapters: Chapter[];
  isLoading: boolean;
  loadingMessage?: string;
  onCancel?: () => void;
  onWriteNext: (seamlessMode: boolean) => void;
  novelBlueprint: NovelBlueprint | null;
  displayMode: 'welcome' | 'blueprint' | 'chapters';
  onRegenerateChapter: (chapterId: number, prompt: string) => void;
  editingChapterId: number | null;
  onSetEditingChapterId: (id: number | null) => void;
  onRegenerateBlueprint: (prompt: string) => void;
  onUpgradeBlueprint: () => void;
  episodeCount: number;
}

// ── item 7 & 10: word count + dialogue ratio helpers ──
const countWords = (text: string): number => {
  const clean = text.replace(/<[^>]+>/g, ' ').replace(/[^\w\s]/g, ' ').trim();
  return clean.split(/\s+/).filter(Boolean).length;
};

const countDialogueWords = (text: string): number => {
  const clean = text.replace(/<[^>]+>/g, ' ');
  const matches = (clean.match(/"([^"]+)"/g) || []) as string[];
  return matches.reduce((sum: number, q: string) => sum + countWords(q), 0);
};

interface WordBadgeProps { content: string; }
const WordBadge: React.FC<WordBadgeProps> = ({ content }) => {
  const wordCount = useMemo(() => countWords(content), [content]);
  const dialogueWords = useMemo(() => countDialogueWords(content), [content]);
  const dialoguePct = wordCount > 0 ? Math.round((dialogueWords / wordCount) * 100) : 0;

  const inRange = wordCount >= 3500 && wordCount <= 4000;
  const dialogueOk = dialoguePct >= 85 && dialoguePct <= 90;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
        inRange ? 'bg-green-900/60 text-green-300 border border-green-700' : 'bg-red-900/60 text-red-300 border border-red-700'
      }`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {wordCount.toLocaleString()} words
      </span>
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
        dialogueOk ? 'bg-blue-900/60 text-blue-300 border border-blue-700' : 'bg-yellow-900/60 text-yellow-300 border border-yellow-700'
      }`} title="Dialogue %">
        💬 {dialoguePct}% dialogue
      </span>
    </div>
  );
};

// ── item 6: cliffhanger badge ──
const CliffhangerBadge: React.FC<{ type?: string }> = ({ type }) => {
  if (!type) return null;
  const colors: Record<string, string> = {
    REVELATION_BOMB: 'bg-red-900/60 text-red-300 border-red-700',
    BETRAYAL_CUT: 'bg-purple-900/60 text-purple-300 border-purple-700',
    THREAT_NO_EXIT: 'bg-orange-900/60 text-orange-300 border-orange-700',
    IMPOSSIBLE_CHOICE: 'bg-yellow-900/60 text-yellow-300 border-yellow-700',
    ARRIVAL: 'bg-emerald-900/60 text-emerald-300 border-emerald-700',
    TICKING_CLOCK: 'bg-amber-900/60 text-amber-300 border-amber-700',
    QUESTION_UNANSWERED: 'bg-sky-900/60 text-sky-300 border-sky-700',
    POINT_OF_NO_RETURN: 'bg-rose-900/60 text-rose-300 border-rose-700',
  };
  const cls = colors[type] || 'bg-gray-700 text-gray-300 border-gray-600';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono border ${cls}`}>
      ⚡ {type.replace(/_/g, ' ')}
    </span>
  );
};

const ChapterRevisionForm: React.FC<{ chapter: Chapter; onRegenerate: (id: number, prompt: string) => void; onCancel: () => void; isLoading: boolean; }> = ({ chapter, onRegenerate, onCancel, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) onRegenerate(chapter.id, prompt);
  };
  return (
    <div className="mt-4 p-4 bg-gray-900/50 border border-amber-500 rounded-lg">
      <form onSubmit={handleSubmit}>
        <label htmlFor={`revise-prompt-${chapter.id}`} className="block mb-2 text-sm font-medium text-amber-300">
          Revise Episode {chapter.id}
        </label>
        <textarea
          id={`revise-prompt-${chapter.id}`}
          rows={3}
          className="block p-2.5 w-full text-sm text-gray-200 bg-gray-700 rounded-lg border border-gray-600 focus:ring-amber-500 focus:border-amber-500"
          placeholder="e.g., 'Make the dialogue more suspenseful'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div className="flex justify-end items-center mt-3 space-x-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white">Cancel</button>
          <button type="submit" disabled={isLoading || !prompt.trim()} className="px-4 py-2 text-sm font-medium rounded-md shadow-sm text-gray-900 bg-amber-400 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed">
            {isLoading ? 'Revising...' : 'Submit Revision'}
          </button>
        </div>
      </form>
    </div>
  );
};

const BlueprintRevisionForm: React.FC<{ onRegenerate: (prompt: string) => void; onCancel: () => void; isLoading: boolean; }> = ({ onRegenerate, onCancel, isLoading }) => {
  const [prompt, setPrompt] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) onRegenerate(prompt);
  };
  return (
    <div className="mt-6 p-4 bg-gray-900 border border-amber-500 rounded-lg">
      <form onSubmit={handleSubmit}>
        <label htmlFor="revise-blueprint-prompt" className="block mb-2 text-sm font-medium text-amber-300">Revise Novel Blueprint</label>
        <textarea
          id="revise-blueprint-prompt"
          rows={4}
          className="block p-2.5 w-full text-sm text-gray-200 bg-gray-700 rounded-lg border border-gray-600 focus:ring-amber-500 focus:border-amber-500"
          placeholder="e.g., 'Add a new main character, a detective named Vikram.'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <div className="flex justify-end items-center mt-3 space-x-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white">Cancel</button>
          <button type="submit" disabled={isLoading || !prompt.trim()} className="px-4 py-2 text-sm font-medium rounded-md shadow-sm text-gray-900 bg-amber-400 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed">
            {isLoading ? 'Revising...' : 'Submit Revision'}
          </button>
        </div>
      </form>
    </div>
  );
};

const EpisodeDetail: React.FC<{ episodeString: string }> = ({ episodeString }) => {
  const lines = episodeString.split('\n').filter(line => line.trim() !== '');
  const titleLine = lines.shift() || 'Episode Details';
  const details = lines.map(line => {
    const parts = line.split(/:(.*)/s);
    if (parts.length < 2) return { label: parts[0].trim(), value: '' };
    return { label: parts[0].trim(), value: parts[1].trim() };
  }).filter(d => d.label);
  return (
    <div className="text-gray-300 p-3 bg-gray-700/30 rounded-md border-l-2 border-amber-600">
      <h5 className="font-semibold text-gray-100 mb-2">{titleLine}</h5>
      <ul className="space-y-1.5 text-sm">
        {details.map((detail, i) => (
          <li key={i} className="flex flex-col sm:flex-row">
            <span className="font-medium text-gray-400 w-full sm:w-1/3 shrink-0">{detail.label}:</span>
            <span className="sm:ml-2 text-gray-300">{detail.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const NovelDisplay: React.FC<NovelDisplayProps> = ({ 
  chapters, isLoading, loadingMessage, onCancel, onWriteNext, 
  novelBlueprint, displayMode, onRegenerateChapter, editingChapterId, 
  onSetEditingChapterId, onRegenerateBlueprint, onUpgradeBlueprint, episodeCount
}) => {
  const endOfChaptersRef = useRef<HTMLDivElement>(null);
  const chapterRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [isRevisingBlueprint, setIsRevisingBlueprint] = useState(false);
  const [copyStatus, setCopyStatus] = useState('Copy');
  const [showTtsPlayer, setShowTtsPlayer] = useState(false);
  const [textForTts, setTextForTts] = useState('');
  const [seamlessMode, setSeamlessMode] = useState(true);
  // item 11: jump to episode
  const [jumpEp, setJumpEp] = useState('');

  const getFullTextForDisplay = () => {
    if (displayMode === 'blueprint' && novelBlueprint) {
      const characters = novelBlueprint.characters.map(c => `- ${c.name}: ${c.description}`).join('\n');
      const plan = novelBlueprint.plan.map(p => `Arc: ${p.arc}\n${p.episodes.map(ep => ep).join('\n\n')}`).join('\n\n');
      return `Title: ${novelBlueprint.title}\nStyle: ${novelBlueprint.style}\n\nSummary:\n${novelBlueprint.summary}\n\nMain Characters:\n${characters}\n\nEpisode Plan:\n${plan}`;
    } else if (displayMode === 'chapters' && chapters.length > 0) {
      return chapters.map(chapter => {
        let cleanContent = chapter.content.replace(/<p>/gi, '').replace(/<\/p>/gi, '\n\n').replace(/\n{3,}/g, '\n\n').replace(/<\/?u>/g, '').trim();
        return `Episode ${chapter.id}: ${chapter.title}\n\n${cleanContent}`;
      }).join('\n\n---\n\n');
    }
    return '';
  };

  const handleCopy = async () => {
    const textToCopy = getFullTextForDisplay();
    if (textToCopy) {
      try {
        await navigator.clipboard.writeText(textToCopy);
        setCopyStatus('Copied!');
        setTimeout(() => setCopyStatus('Copy'), 2000);
      } catch {
        setCopyStatus('Error');
        setTimeout(() => setCopyStatus('Copy'), 2000);
      }
    }
  };
  
  const handleReadAloud = () => {
    const t = getFullTextForDisplay();
    if (t) { setTextForTts(t); setShowTtsPlayer(true); }
  };

  const handleDownload = () => {
    const text = getFullTextForDisplay();
    if (text) {
      const el = document.createElement("a");
      el.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
      el.download = novelBlueprint ? `${novelBlueprint.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${displayMode}.txt` : `novel_${displayMode}.txt`;
      document.body.appendChild(el);
      el.click();
      document.body.removeChild(el);
    }
  };

  useEffect(() => {
    if (displayMode === 'chapters') endOfChaptersRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chapters, displayMode]);

  useEffect(() => { setIsRevisingBlueprint(false); }, [novelBlueprint]);
  useEffect(() => { setCopyStatus('Copy'); setShowTtsPlayer(false); setTextForTts(''); }, [displayMode]);

  // item 11: jump to episode handler
  const handleJumpToEpisode = (epId: number) => {
    const el = chapterRefs.current[epId];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const renderWelcome = () => (
    <div className="h-full flex items-center justify-center">
      <div className="text-center text-gray-400">
        <h2 className="text-3xl mb-2">Welcome to Your Novel Studio</h2>
        <p>Start by creating a "Novel Blueprint" to give your story structure.</p>
      </div>
    </div>
  );

  const renderBlueprint = () => {
    if (!novelBlueprint) return renderWelcome();
    return (
      <div className="prose prose-invert max-w-none text-gray-200">
        <h2 className="text-4xl text-amber-300 border-b border-gray-600 pb-2 mb-6">{novelBlueprint.title}</h2>
        <div className="mb-8 p-4 bg-gray-900/20 rounded-lg">
          <h3 className="text-2xl font-semibold text-amber-400 mt-0">Summary</h3>
          <p className="leading-relaxed whitespace-pre-wrap">{novelBlueprint.summary}</p>
        </div>
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-amber-400">Main Characters ({novelBlueprint.characters.length})</h3>
          <div className="flex flex-wrap gap-2 p-4 bg-gray-900/20 rounded-lg my-4">
            {novelBlueprint.characters.map(c => (
              <span key={c.name} className="bg-gray-700 text-gray-200 text-sm font-medium px-2.5 py-0.5 rounded-full">{c.name}</span>
            ))}
          </div>
          <ul className="list-none p-0">
            {novelBlueprint.characters.map(char => (
              <li key={char.name} className="mb-4 p-4 bg-gray-900/40 rounded-lg border border-gray-700">
                <strong className="text-lg text-gray-100">{char.name}</strong>
                <p className="text-gray-300 m-0 mt-1">{char.description}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-amber-400">Episode Plan</h3>
          {novelBlueprint.plan.map(arc => (
            <div key={arc.arc} className="mb-6">
              <h4 className="text-xl font-bold text-gray-100 bg-gray-700/50 px-3 py-2 rounded-t-lg">{arc.arc}</h4>
              <div className="space-y-4 bg-gray-900/40 p-4 rounded-b-lg">
                {arc.episodes.map((ep, index) => <EpisodeDetail key={index} episodeString={ep} />)}
              </div>
            </div>
          ))}
        </div>

        {/* item 5: Twist Map section */}
        {novelBlueprint.twist_map && novelBlueprint.twist_map.length > 0 && (
          <div className="mb-8">
            <h3 className="text-2xl font-semibold text-amber-400">Twist Map</h3>
            <p className="text-sm text-gray-400 mb-4">Season-level twist schedule — the AI follows this when writing.</p>
            <div className="space-y-3">
              {novelBlueprint.twist_map.map((entry, i) => (
                <div key={i} className="p-3 bg-gray-900/40 rounded-lg border border-gray-700">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="font-bold text-amber-300">Episode {entry.episode_number}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-mono border ${entry.weight === 'MAJOR' ? 'bg-red-900/60 text-red-300 border-red-700' : 'bg-blue-900/60 text-blue-300 border-blue-700'}`}>
                      {entry.weight}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-gray-700 text-gray-300 border border-gray-600">
                      {entry.twist_type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-gray-500">Setup from Ep {entry.setup_begins_at_episode}</span>
                  </div>
                  <div className="text-sm text-gray-400 mb-1">
                    <span className="font-semibold text-gray-300">Foreshadowing seed:</span> {entry.foreshadowing_seed}
                  </div>
                  <div className="text-sm text-gray-400">
                    <span className="font-semibold text-gray-300">Payoff:</span> {entry.payoff_description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 border-t border-gray-700 pt-6">
          {!isRevisingBlueprint ? (
            <div className="text-center flex items-center justify-center gap-4">
              <button onClick={onUpgradeBlueprint} disabled={isLoading || chapters.length === 0}
                className="px-6 py-2 text-sm font-medium rounded-md shadow-sm text-amber-400 bg-gray-700/50 hover:bg-gray-700 disabled:opacity-50 transition-colors"
                title={chapters.length === 0 ? "Write at least one episode to enable upgrade" : "Analyze written episodes to enhance blueprint"}>
                Upgrade Blueprint
              </button>
              <button onClick={() => setIsRevisingBlueprint(true)} disabled={isLoading}
                className="px-6 py-2 text-sm font-medium rounded-md shadow-sm text-amber-400 bg-gray-700/50 hover:bg-gray-700 disabled:opacity-50 transition-colors">
                Revise Blueprint
              </button>
            </div>
          ) : (
            <BlueprintRevisionForm onRegenerate={onRegenerateBlueprint} onCancel={() => setIsRevisingBlueprint(false)} isLoading={isLoading} />
          )}
        </div>
      </div>
    );
  };

  const renderContentWithHighlights = (content: string) => {
    let cleanedContent = content.replace(/<p>/gi, '').replace(/<\/p>/gi, '\n\n').replace(/\n{3,}/g, '\n\n').trim();
    const regex = /((?:<u>.*?<\/u>))/g;
    const parts = cleanedContent.split(regex);
    return parts.map((part, index) => {
      if (part.startsWith('<u>') && part.endsWith('</u>')) {
        const text = part.replace(/<\/?u>/g, '');
        return <u key={index} className="decoration-amber-400 decoration-2 underline-offset-4 text-amber-200">{text}</u>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const renderChapters = () => (
    <>
      {/* item 11: Episode Jump navigation */}
      {chapters.length > 1 && (
        <div className="mb-4 flex items-center gap-2 bg-gray-900/40 p-2 rounded-lg border border-gray-700">
          <span className="text-xs text-gray-400 shrink-0">Jump to:</span>
          <select
            value={jumpEp}
            onChange={(e) => { setJumpEp(e.target.value); if (e.target.value) handleJumpToEpisode(Number(e.target.value)); }}
            className="flex-1 bg-gray-700 border border-gray-600 text-white text-xs rounded-md p-1.5 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">— Select episode —</option>
            {chapters.map(c => (
              <option key={c.id} value={c.id}>Episode {c.id}: {c.title}</option>
            ))}
          </select>
        </div>
      )}

      <div className="prose prose-invert max-w-none text-gray-200 leading-loose">
        {chapters.map((chapter) => (
          <div
            key={chapter.id}
            ref={el => { chapterRefs.current[chapter.id] = el; }}
            className="mb-8 p-4 border-l-4 border-amber-500 bg-gray-800/40 rounded-r-lg relative group"
          >
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
              <button
                onClick={() => {
                  const clean = chapter.content.replace(/<p>/gi,'').replace(/<\/p>/gi,'\n\n').replace(/\n{3,}/g,'\n\n').replace(/<\/?u>/g,'').trim();
                  const el = document.createElement("a");
                  el.href = URL.createObjectURL(new Blob([`Episode ${chapter.id}: ${chapter.title}\n\n${clean}`], { type: 'text/plain' }));
                  el.download = `episode_${chapter.id}.txt`;
                  document.body.appendChild(el); el.click(); document.body.removeChild(el);
                }}
                className="p-1.5 text-xs rounded-md text-gray-400 bg-gray-700/50 hover:bg-gray-600 hover:text-white"
                title="Download Chapter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
              <button
                onClick={() => {
                  const clean = chapter.content.replace(/<p>/gi,'').replace(/<\/p>/gi,'\n\n').replace(/\n{3,}/g,'\n\n').replace(/<\/?u>/g,'').trim();
                  navigator.clipboard.writeText(`Episode ${chapter.id}: ${chapter.title}\n\n${clean}`);
                }}
                className="p-1.5 text-xs rounded-md text-gray-400 bg-gray-700/50 hover:bg-gray-600 hover:text-white"
                title="Copy Chapter"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </button>
            </div>

            <div className="flex flex-wrap justify-between items-start gap-2 mb-3 pr-10">
              <div>
                <h3 className="text-2xl font-bold text-amber-300 m-0 mb-1">
                  Episode {chapter.id}: {chapter.title}
                </h3>
                {/* item 6: cliffhanger badge & item 7+10: word count / dialogue badge */}
                <div className="flex flex-wrap items-center gap-2">
                  <CliffhangerBadge type={chapter.cliffhangerType} />
                  <WordBadge content={chapter.content} />
                </div>
              </div>
              <button
                onClick={() => onSetEditingChapterId(editingChapterId === chapter.id ? null : chapter.id)}
                className="text-sm text-amber-400 hover:text-amber-300 font-medium px-3 py-1 rounded-md bg-gray-700/50 hover:bg-gray-700 transition-colors"
                disabled={isLoading && editingChapterId !== chapter.id}
              >
                {editingChapterId === chapter.id ? 'Cancel' : 'Revise'}
              </button>
            </div>

            <p className="whitespace-pre-wrap text-lg">
              {renderContentWithHighlights(chapter.content)}
            </p>
            {editingChapterId === chapter.id && (
              <ChapterRevisionForm chapter={chapter} onRegenerate={onRegenerateChapter} onCancel={() => onSetEditingChapterId(null)} isLoading={isLoading} />
            )}
          </div>
        ))}
        <div ref={endOfChaptersRef} />
      </div>

      {!isLoading && chapters.length > 0 && (
        <div className="mt-8 flex flex-col items-center justify-center space-y-4">
          <div className="flex items-center space-x-3 bg-gray-900/40 px-4 py-2 rounded-full border border-gray-700">
            <span className="text-sm font-medium text-gray-300">Seamless Continuity</span>
            <button
              onClick={() => setSeamlessMode(!seamlessMode)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${seamlessMode ? 'bg-amber-500' : 'bg-gray-600'}`}
              role="switch" aria-checked={seamlessMode}
            >
              <span aria-hidden="true" className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${seamlessMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
            <span className="text-xs text-gray-500">Connects beautifully with previous lines</span>
          </div>
          <button
            onClick={() => onWriteNext(seamlessMode)}
            className="px-8 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-gray-900 bg-amber-400 hover:bg-amber-500 focus:outline-none transition-colors w-full sm:w-auto"
          >
            Write Next Episode
          </button>
          <p className="text-xs text-gray-500">{chapters.length} / {episodeCount} episodes written</p>
        </div>
      )}
    </>
  );

  const renderContent = () => {
    switch(displayMode) {
      case 'blueprint': return renderBlueprint();
      case 'chapters': return renderChapters();
      default: return renderWelcome();
    }
  };

  const canCopy = (displayMode === 'blueprint' && novelBlueprint) || (displayMode === 'chapters' && chapters.length > 0);

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 relative h-full flex flex-col">
      {canCopy && (
        <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
          <button onClick={handleDownload} className="p-2 text-xs font-semibold rounded-full shadow-sm text-gray-900 bg-amber-400 hover:bg-amber-500 transition-all duration-200" title="Download as Text">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </button>
          <button onClick={handleReadAloud} className="p-2 text-xs font-semibold rounded-full shadow-sm text-gray-900 bg-amber-400 hover:bg-amber-500 transition-all duration-200" title="Read Aloud">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M5 15V9h4l5-5v16l-5-5H5zm11 1.5c1.4-1.1 2-2.7 2-4.5s-.6-3.4-2-4.5v9z" /></svg>
          </button>
          <button onClick={handleCopy} className="px-4 py-1.5 text-xs font-semibold rounded-md shadow-sm text-gray-900 bg-amber-400 hover:bg-amber-500 transition-all duration-200 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            {copyStatus}
          </button>
        </div>
      )}
      <div className="flex-grow overflow-y-auto p-6 md:p-8 min-h-0 relative">
        {renderContent()}
        {isLoading && <Loader message={loadingMessage} onCancel={onCancel} />}
      </div>
      {showTtsPlayer && <TtsPlayer textToRead={textForTts} onClose={() => setShowTtsPlayer(false)} />}
    </div>
  );
};

export default NovelDisplay;
