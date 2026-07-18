import React, { useState, useEffect, useRef, useCallback } from 'react';
import { generateSpeech, prepareTtsScript, VoiceMap } from '../services/geminiService';
import { decode, decodeAudioData } from '../utils/audio';

interface TtsPlayerProps {
  textToRead: string;
  onClose: () => void;
}

const TTS_SAMPLE_RATE = 24000;
const TTS_CHANNELS = 1;
const CHUNK_SIZE = 1500;

const TtsPlayer: React.FC<TtsPlayerProps> = ({ textToRead, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statusText, setStatusText] = useState('Preparing audio script...');
  const [error, setError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  // item 13: progress tracking
  const [chunksPlayed, setChunksPlayed] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [isDone, setIsDone] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioQueueRef = useRef<AudioBuffer[]>([]);
  const isFetchingRef = useRef(false);
  const isPlayingRef = useRef(false);
  const scriptChunksRef = useRef<string[]>([]);
  const voiceMapRef = useRef<VoiceMap | null>(null);
  const nextChunkIndexRef = useRef(0);
  const chunksPlayedRef = useRef(0);

  const cleanupAudio = useCallback(() => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    audioContextRef.current = null;
    isPlayingRef.current = false;
    setIsPlaying(false);
  }, []);

  const playNextChunk = useCallback(() => {
    if (audioQueueRef.current.length === 0) {
      if (nextChunkIndexRef.current >= scriptChunksRef.current.length) {
        // item 13: show Done state instead of auto-closing
        cleanupAudio();
        setIsDone(true);
        setStatusText('Done');
        setIsLoading(false);
      } else {
        isPlayingRef.current = false;
        setIsPlaying(false);
        setIsLoading(true);
      }
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: TTS_SAMPLE_RATE });
    }
    if (audioContextRef.current.state === 'suspended') audioContextRef.current.resume();

    const audioBuffer = audioQueueRef.current.shift();
    if (!audioBuffer) return;

    const source = audioContextRef.current.createBufferSource();
    source.buffer = audioBuffer;
    source.playbackRate.value = playbackRate;
    source.connect(audioContextRef.current.destination);
    source.onended = () => {
      chunksPlayedRef.current += 1;
      setChunksPlayed(chunksPlayedRef.current);
      playNextChunk();
    };
    source.start();

    sourceNodeRef.current = source;
    isPlayingRef.current = true;
    setIsPlaying(true);
    setIsLoading(false);
    setStatusText('Playing');
  }, [playbackRate, cleanupAudio]);

  const fetchAndQueueAudio = useCallback(async () => {
    if (isFetchingRef.current || nextChunkIndexRef.current >= scriptChunksRef.current.length || !voiceMapRef.current) return;
    isFetchingRef.current = true;
    setStatusText(`Loading audio... (${nextChunkIndexRef.current + 1}/${scriptChunksRef.current.length})`);
    const chunkIndex = nextChunkIndexRef.current;
    const chunk = scriptChunksRef.current[chunkIndex];
    nextChunkIndexRef.current++;
    try {
      const base64Audio = await generateSpeech(chunk, voiceMapRef.current);
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: TTS_SAMPLE_RATE });
      }
      const audioBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, TTS_SAMPLE_RATE, TTS_CHANNELS);
      audioQueueRef.current.push(audioBuffer);
      setError(null);
      if (!isPlayingRef.current && audioQueueRef.current.length > 0) playNextChunk();
    } catch (err) {
      console.error("TTS Error:", err);
      setError("Failed to generate audio for a part of the text.");
      setStatusText("Error");
    } finally {
      isFetchingRef.current = false;
    }
  }, [playNextChunk]);

  useEffect(() => {
    const initializeTts = async () => {
      try {
        const { script, voiceMap } = await prepareTtsScript(textToRead);
        voiceMapRef.current = voiceMap;
        const chunks = script.match(new RegExp(`[\\s\\S]{1,${CHUNK_SIZE}}`, 'g')) || [];
        scriptChunksRef.current = chunks;
        setTotalChunks(chunks.length);
        setIsLoading(true);
        fetchAndQueueAudio();
      } catch (err) {
        setError("Could not prepare the audio script.");
        setStatusText("Error");
        setIsLoading(false);
      }
    };
    initializeTts();
    return () => { cleanupAudio(); };
  }, [textToRead, fetchAndQueueAudio, cleanupAudio]);

  const handlePlayPause = () => {
    if (isDone) {
      // Replay: reset state
      setIsDone(false);
      setChunksPlayed(0);
      chunksPlayedRef.current = 0;
      nextChunkIndexRef.current = 0;
      audioQueueRef.current = [];
      setIsLoading(true);
      setStatusText('Preparing audio script...');
      fetchAndQueueAudio();
      return;
    }
    if (!audioContextRef.current) {
      if (!isLoading) playNextChunk();
      return;
    }
    if (audioContextRef.current.state === 'running') {
      audioContextRef.current.suspend().then(() => { isPlayingRef.current = false; setIsPlaying(false); });
    } else if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume().then(() => { isPlayingRef.current = true; setIsPlaying(true); });
    }
  };

  const handleStop = () => { cleanupAudio(); onClose(); };
  
  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (sourceNodeRef.current && audioContextRef.current?.state === 'running') {
      sourceNodeRef.current.playbackRate.value = rate;
    }
  };

  const getRateButtonClass = (rate: number) =>
    `px-2 py-0.5 text-xs rounded-md transition-colors ${playbackRate === rate ? 'bg-amber-500 text-gray-900' : 'bg-gray-600/50 hover:bg-gray-500/50'}`;

  // item 13: progress percentage
  const progressPct = totalChunks > 0 ? Math.round((chunksPlayed / totalChunks) * 100) : 0;

  return (
    <div className="sticky bottom-0 bg-gray-900/90 backdrop-blur-sm border-t border-gray-700 p-3 z-20">
      {/* item 13: progress bar */}
      {totalChunks > 0 && (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-500 mb-0.5">
            <span>Chunk {chunksPlayed}/{totalChunks}</span>
            <span>{progressPct}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1">
            <div className="bg-amber-400 h-1 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button onClick={handlePlayPause} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50" disabled={isLoading && !isDone}>
            {isDone ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" /></svg>
            ) : isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" viewBox="0 0 24 24" fill="currentColor"><path d="M8 6h3v12H8V6zm5 0h3v12h-3V6z" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 6v12l10-6z" /></svg>
            )}
          </button>
          <button onClick={handleStop} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M8 8h8v8H8z" /></svg>
          </button>
        </div>

        <div className="text-sm text-gray-400">
          {isDone ? <span className="text-green-400">✓ Done — click ↺ to replay</span> : (error || statusText)}
        </div>

        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-400">Speed:</span>
          <div className="flex space-x-1.5">
            {[0.75, 1, 1.5, 2].map(r => (
              <button key={r} className={getRateButtonClass(r)} onClick={() => handleRateChange(r)}>{r}x</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TtsPlayer;
