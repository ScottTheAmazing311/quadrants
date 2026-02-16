const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createSampleQuad() {
  console.log('🎨 Creating "THE ULTIMATE VIBE CHECK" quad...\n');

  // Create the quad
  const { data: quad, error: quadError } = await supabase
    .from('quads')
    .insert({
      name: 'THE ULTIMATE VIBE CHECK',
      description: 'A mix of gaming, food, entertainment, and wild hypotheticals to discover your true personality alignment',
      created_by: 'Quadrants Team',
      is_public: true
    })
    .select()
    .single();

  if (quadError) {
    console.error('❌ Error creating quad:', quadError);
    return;
  }

  console.log('✅ Quad created:', quad.name);
  console.log('   ID:', quad.id);

  // Get the questions from the bank
  const questionPrompts = [
    'Elden Ring or Breath of the Wild?',
    'Five Guys or In-N-Out?',
    'Spider-Man 2 or Spider-Man Homecoming?',
    'Wizarding World Park or Super Mario World?',
    'Fight a chicken every time you get in your car or an orangutan once a year with a broadsword?',
    'Hot Rod or Napoleon Dynamite?',
    'Which would you rather have as a pet?',
    'Beyonce or Rihanna?',
    'Elf or Home Alone?',
    'When you start an RPG how evil do you usually go?',
    'How much do you like country music?',
    'Cybertruck or F-150 Lightning?',
    'Is the Rock a good actor?',
    'When do you fill up your gas?',
    'How many McDonalds cheeseburgers could you eat in one sitting?',
    'Succession or Yellowstone?',
    '$10k worth of golf gear or one $10k vacation?',
    'How scared of AI are you?',
    'Opinion on Elon Musk?',
    'How many wasps in the room before you cant focus?'
  ];

  const { data: bankQuestions, error: bankError } = await supabase
    .from('question_bank')
    .select('*')
    .in('prompt', questionPrompts);

  if (bankError) {
    console.error('❌ Error fetching questions:', bankError);
    return;
  }

  console.log(`\n📝 Found ${bankQuestions.length} questions in bank`);

  // Create questions for the quad
  const questionsToInsert = bankQuestions.map((q, index) => ({
    quad_id: quad.id,
    prompt: q.prompt,
    label_left: q.label_left,
    label_right: q.label_right,
    order: index
  }));

  const { error: questionsError } = await supabase
    .from('questions')
    .insert(questionsToInsert);

  if (questionsError) {
    console.error('❌ Error creating questions:', questionsError);
    return;
  }

  console.log(`✅ Added ${questionsToInsert.length} questions to quad\n`);
  console.log('🎉 SUCCESS! "THE ULTIMATE VIBE CHECK" is now live!');
  console.log('   Refresh your browser at http://localhost:3002 to see it!\n');
}

createSampleQuad();
