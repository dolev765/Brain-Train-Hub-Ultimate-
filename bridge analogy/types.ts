
export interface Exercise {
  rule_id: string;
  difficulty: string;
  predicate: string;
  params: { [key: string]: any };
  base_pair: [string, string];
  domain_hints: string[];
  bans: string[];
  rubric: string;
}

export interface Score {
  relation_score: number;
  distance_score: number;
  coherence_score: number;
  summary: string;
}

export interface PlayerAnalogy {
    c: string;
    d: string;
}

export enum GameState {
    IDLE = 'IDLE',
    GENERATING_EXERCISE = 'GENERATING_EXERCISE',
    PLAYING = 'PLAYING',
    JUDGING = 'JUDGING',
    FEEDBACK = 'FEEDBACK',
    ERROR = 'ERROR',
}