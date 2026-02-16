# Quadrants

A full-stack social alignment game where friend groups answer slider questions and visualize results on a 2D quadrant grid.

## Features

- **Create Quads**: Build custom question sets or generate them from a question bank
- **Group System**: Create groups with shareable 6-character codes
- **Interactive Sliders**: Answer questions on a 1-10 scale
- **Quadrant Visualization**: See how your group aligns on any two questions
- **Superlatives**: Discover who's most alike, most opposed, most extreme, and more
- **No Authentication**: Simple localStorage-based player identification

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (for avatars)
- **Deployment**: Vercel-ready

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL migrations from `supabase/schema.sql`
3. Run the seed data from `supabase/seed.sql`
4. Create a storage bucket named `avatars` with public access

### 3. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
quadrants/
├── app/
│   ├── create/              # Create quad page
│   ├── suggest/             # Suggest question page
│   ├── group/
│   │   ├── page.tsx         # Join/Create group
│   │   └── [code]/          # Group lobby
│   ├── play/[quadId]/       # Play quiz
│   ├── results/[quadId]/    # View results grid
│   │   └── analysis/        # Superlatives
│   ├── actions.ts           # Server actions
│   ├── page.tsx             # Home page
│   └── layout.tsx           # Root layout
├── components/
│   ├── Avatar.tsx           # Avatar display
│   ├── AvatarUpload.tsx     # Avatar upload
│   ├── QuadCard.tsx         # Quad card
│   ├── QuadrantGrid.tsx     # Main grid visualization
│   ├── QuestionBuilder.tsx  # Question editor
│   └── Slider.tsx           # Custom slider
├── lib/
│   ├── analytics.ts         # Superlative calculations
│   ├── storage.ts           # LocalStorage helpers
│   ├── supabase.ts          # Supabase client
│   ├── upload.ts            # Avatar upload
│   └── utils.ts             # Utility functions
├── types/
│   └── index.ts             # TypeScript types
└── supabase/
    ├── schema.sql           # Database schema
    └── seed.sql             # Seed data (50 questions)
```

## Key Features Implementation

### Quadrant Grid with Collision Detection

The `QuadrantGrid` component handles avatar positioning and collision detection:
- Maps player responses (1-10) to grid coordinates
- Detects overlapping avatars within 8% threshold
- Arranges colliding avatars in spoke pattern
- Smooth CSS transitions when changing axes

### Analytics & Superlatives

Five superlatives calculated using Euclidean distance and variance:
1. **Most Alike**: Pair with smallest average distance
2. **Most Opposed**: Pair with largest average distance
3. **Most Extreme**: Player with highest deviation from center (5.5)
4. **Most Neutral**: Player with lowest deviation from center
5. **Wildcard**: Player with highest variance in responses

### Question Bank System

- Questions are deduplicated on insert
- `times_used` counter tracks popularity
- Generate feature pulls random questions for quick quad creation

## Database Schema

See `supabase/schema.sql` for full details:
- `groups` - Friend groups with unique codes
- `players` - Group members with avatars
- `quads` - Question sets (public or group-specific)
- `questions` - Individual questions within quads
- `responses` - Player answers (1-10 scale)
- `question_bank` - Reusable question library

## Deployment

### Deploy to Vercel

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Production Supabase Setup

1. Create production Supabase project
2. Run migrations and seed data
3. Configure avatars storage bucket
4. Update Vercel environment variables

## License

MIT
