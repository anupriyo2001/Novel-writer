// ============================================================
// ENHANCED types.ts — Drop-in replacement for the original
// Changes: CliffhangerType enum, TwistMapEntry, enhanced Chapter
//          and NovelBlueprint interfaces with twist_map field.
// ============================================================

export type AIModel =
  | 'gemini-3.1-pro-preview'
  | 'gemini-3-pro-preview'
  | 'gemini-3-flash-preview'
  | 'gemini-3.1-flash-lite-preview'
  | 'gemini-2.5-pro';

// ── NEW: enumerate cliffhanger types so rotation can be tracked ──
export type CliffhangerType =
  | 'REVELATION_BOMB'
  | 'THREAT_NO_EXIT'
  | 'BETRAYAL_CUT'
  | 'IMPOSSIBLE_CHOICE'
  | 'ARRIVAL'
  | 'TICKING_CLOCK'
  | 'QUESTION_UNANSWERED'
  | 'POINT_OF_NO_RETURN';

// ── NEW: one row in the per-episode twist schedule ──
export interface TwistMapEntry {
  episode_number: number;
  twist_type:
    | 'IDENTITY_FLIP'
    | 'BETRAYAL_UNVEIL'
    | 'FALSE_DEATH'
    | 'HIDDEN_AGENDA'
    | 'POWER_REVERSAL'
    | 'TIME_BOMB_REVEAL'
    | 'MIRROR_TWIST'
    | 'FALSE_VICTORY'
    | 'RED_HERRING_PAYOFF'
    | 'MICRO_SURPRISE';
  weight: 'MAJOR' | 'MINOR';               // MAJOR = arc-changing; MINOR = scene-level
  setup_begins_at_episode: number;          // when foreshadowing starts
  foreshadowing_seed: string;              // what the writer plants earlier
  payoff_description: string;              // what actually detonates here
}

// ── ENHANCED: Chapter now stores the cliffhanger type used ──
export interface Chapter {
  id: number;
  title: string;
  content: string;
  cliffhangerType?: CliffhangerType;       // NEW — enables rotation enforcement
}

export interface CharacterProfile {
  name: string;
  description: string;
}

export interface EpisodePlan {
  arc: string;
  episodes: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

// ── ENHANCED: NovelBlueprint now carries the twist_map ──
export interface NovelBlueprint {
  title: string;
  summary: string;
  style: string;
  characters: CharacterProfile[];
  plan: EpisodePlan[];
  twist_map?: TwistMapEntry[];             // NEW — season-level twist schedule
}
