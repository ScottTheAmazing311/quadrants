export interface Quad {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  group_code: string | null;
  is_public: boolean;
  created_at: string;
}

export interface Question {
  id: string;
  quad_id: string;
  prompt: string;
  label_left: string;
  label_right: string;
  order: number;
}

export interface Group {
  id: string;
  name: string;
  code: string;
  created_at: string;
}

export interface Player {
  id: string;
  group_id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Response {
  id: string;
  player_id: string;
  question_id: string;
  quad_id: string;
  value: number;
  created_at: string;
}

export interface QuestionBank {
  id: string;
  prompt: string;
  label_left: string;
  label_right: string;
  times_used: number;
  submitted_by: string | null;
  created_at: string;
}

export interface QuadWithQuestions extends Quad {
  questions: Question[];
  questionCount?: number;
  playerCount?: number;
}

export interface PlayerWithResponses extends Player {
  responses: Response[];
}

export interface Superlative {
  type: 'most_alike' | 'most_opposed' | 'most_extreme' | 'most_neutral' | 'wildcard';
  players: Player[];
  score: number;
  description: string;
}
