-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create groups table
CREATE TABLE groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quads table
CREATE TABLE quads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_by TEXT NOT NULL,
  group_code TEXT REFERENCES groups(code),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quad_id UUID NOT NULL REFERENCES quads(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  label_left TEXT NOT NULL,
  label_right TEXT NOT NULL,
  "order" INTEGER NOT NULL
);

-- Create responses table
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  quad_id UUID NOT NULL REFERENCES quads(id) ON DELETE CASCADE,
  value INTEGER NOT NULL CHECK (value >= 1 AND value <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, question_id)
);

-- Create question_bank table
CREATE TABLE question_bank (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt TEXT UNIQUE NOT NULL,
  label_left TEXT NOT NULL,
  label_right TEXT NOT NULL,
  times_used INTEGER DEFAULT 0,
  submitted_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_players_group_id ON players(group_id);
CREATE INDEX idx_questions_quad_id ON questions(quad_id);
CREATE INDEX idx_responses_player_id ON responses(player_id);
CREATE INDEX idx_responses_quad_id ON responses(quad_id);
CREATE INDEX idx_quads_group_code ON quads(group_code);
CREATE INDEX idx_quads_is_public ON quads(is_public);

-- Enable Row Level Security (RLS)
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE quads ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;

-- Create permissive policies (no auth, allow all operations)
CREATE POLICY "Allow all on groups" ON groups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on players" ON players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on quads" ON quads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on questions" ON questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on responses" ON responses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on question_bank" ON question_bank FOR ALL USING (true) WITH CHECK (true);
