import React, { useState, useRef, useEffect } from 'react';
import { AIModel, ChatMessage } from '../types';
import { sendChatMessage } from '../services/geminiService';

interface StoryChatProps {
  selectedModel: AIModel;
  onProceed: (chatHistory: string) => void;
  hasBlueprint?: boolean;
}

// ── Inline SVG icons (replaces lucide-react — not in AI Studio importmap) ──
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const LoaderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// ── Simple markdown renderer (replaces react-markdown — not in AI Studio importmap) ──
const SimpleMarkdown: React.FC<{ children: string }> = ({ children }) => {
  const lines = children.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const key = i;
    // Heading
    if (line.startsWith('### ')) {
      elements.push(<h3 key={key} className="text-base font-bold mt-2 mb-1 text-gray-200">{line.slice(4)}</h3>);
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={key} className="text-lg font-bold mt-3 mb-1 text-gray-100">{line.slice(3)}</h2>);
    } else if (line.startsWith('# ')) {
      elements.push(<h1 key={key} className="text-xl font-bold mt-3 mb-1 text-gray-100">{line.slice(2)}</h1>);
    }
    // Bullet list
    else if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <div key={key} className="flex gap-2 my-0.5">
          <span className="text-amber-400 shrink-0">•</span>
          <span>{renderInline(line.slice(2))}</span>
        </div>
      );
    }
    // Numbered list
    else if (/^\d+\.\s/.test(line)) {
      const match = line.match(/^(\d+)\.\s(.*)/);
      if (match) {
        elements.push(
          <div key={key} className="flex gap-2 my-0.5">
            <span className="text-amber-400 shrink-0 font-mono text-xs mt-0.5">{match[1]}.</span>
            <span>{renderInline(match[2])}</span>
          </div>
        );
      }
    }
    // Blank line
    else if (line.trim() === '') {
      elements.push(<div key={key} className="h-2" />);
    }
    // Normal paragraph line
    else {
      elements.push(<p key={key} className="leading-relaxed my-0.5">{renderInline(line)}</p>);
    }
  });

  return <div className="text-sm text-gray-300 space-y-0">{elements}</div>;
};

// Render inline bold/italic/code
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  // Split on **bold**, *italic*, `code`
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let idx = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={idx++}>{text.slice(last, m.index)}</span>);
    const tok = m[0];
    if (tok.startsWith('**')) {
      parts.push(<strong key={idx++} className="font-semibold text-gray-100">{tok.slice(2, -2)}</strong>);
    } else if (tok.startsWith('*')) {
      parts.push(<em key={idx++} className="italic">{tok.slice(1, -1)}</em>);
    } else if (tok.startsWith('`')) {
      parts.push(<code key={idx++} className="bg-gray-800 px-1 rounded text-xs font-mono text-amber-300">{tok.slice(1, -1)}</code>);
    }
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push(<span key={idx++}>{text.slice(last)}</span>);
  return parts.length === 1 ? parts[0] : parts;
}

const StoryChat: React.FC<StoryChatProps> = ({ selectedModel, onProceed, hasBlueprint }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hello! I am your AI story planner. What kind of novel would you like to write today? We can brainstorm ideas, characters, or plot points.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    const newMessages: ChatMessage[] = [...messages, { role: 'user', text: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;
    try {
      const response = await sendChatMessage(selectedModel, messages, userMessage, controller.signal);
      setMessages([...newMessages, { role: 'model', text: response }]);
    } catch (error: any) {
      if (error.message !== 'AbortError') {
        setMessages([...newMessages, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleProceed = () => {
    const historyString = messages
      .filter(m => m.role !== 'model' || m.text !== 'Hello! I am your AI story planner. What kind of novel would you like to write today? We can brainstorm ideas, characters, or plot points.')
      .map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.text}`)
      .join('\n\n');
    onProceed(historyString);
  };

  const handleStop = () => { if (abortControllerRef.current) abortControllerRef.current.abort(); };

  // item 18: disable proceed until at least one user message exists
  const hasUserMessage = messages.some(m => m.role === 'user');

  return (
    <div className="flex flex-col h-full min-h-[400px] min-w-[300px] bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-800/50 resize relative">
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={handleProceed}
          disabled={!hasUserMessage}
          title={!hasUserMessage ? 'Chat with the AI first before proceeding' : undefined}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800/80 hover:bg-gray-700 backdrop-blur-sm text-gray-300 hover:text-white text-xs font-medium rounded-full transition-all border border-gray-700/50 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {hasBlueprint ? 'Proceed to Writing' : 'Proceed to Blueprint'}
          <ArrowRightIcon />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-12 pb-4 space-y-6">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-5 py-3.5 ${msg.role === 'user' ? 'bg-gray-800 text-gray-100 rounded-2xl rounded-tr-sm' : 'bg-transparent text-gray-300 rounded-2xl'}`}>
              <SimpleMarkdown>{msg.text}</SimpleMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="px-5 py-3.5 flex items-center gap-3 text-gray-500">
              <LoaderIcon />
              <span className="text-sm">AI is thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-transparent">
        <div className="relative flex items-end gap-2 bg-gray-800/40 border border-gray-700/50 focus-within:border-gray-600 focus-within:bg-gray-800/80 rounded-2xl p-2 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your ideas here... (Shift+Enter for new line)"
            className="w-full bg-transparent px-3 py-2 text-gray-200 placeholder-gray-500 focus:outline-none resize-y min-h-[44px] text-sm leading-relaxed"
            rows={1}
          />
          {isLoading ? (
            <button onClick={handleStop} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-colors shrink-0" title="Stop generating">
              <div className="w-4 h-4 rounded-sm bg-current" />
            </button>
          ) : (
            <button onClick={handleSend} disabled={!input.trim()} className="p-2.5 bg-gray-200 hover:bg-white disabled:bg-transparent disabled:text-gray-600 text-gray-900 rounded-xl transition-colors shrink-0">
              <SendIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryChat;
