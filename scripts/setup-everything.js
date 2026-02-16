const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const newQuestions = [
  { prompt: 'Wizarding World Park or Super Mario World?', label_left: 'Wizarding World', label_right: 'Super Mario World' },
  { prompt: 'Legoland or Sea World?', label_left: 'Legoland', label_right: 'Sea World' },
  { prompt: 'Elden Ring or Breath of the Wild?', label_left: 'Elden Ring', label_right: 'Breath of the Wild' },
  { prompt: 'Super Mario Odyssey or Super Mario 64?', label_left: 'Odyssey', label_right: 'Mario 64' },
  { prompt: 'When you start an RPG how evil do you usually go?', label_left: 'Saint', label_right: 'Satan' },
  { prompt: 'Five Guys or In-N-Out?', label_left: 'Five Guys', label_right: 'In-N-Out' },
  { prompt: 'Beefy 5 Layer or Chalupa?', label_left: 'Beefy 5 Layer', label_right: 'Chalupa' },
  { prompt: 'Ranch or Caesar for salad?', label_left: 'Ranch', label_right: 'Caesar' },
  { prompt: 'Maple Bar or Old Fashioned donut?', label_left: 'Maple Bar', label_right: 'Old Fashioned' },
  { prompt: 'Pumpkin Pie or Apple Pie for Thanksgiving?', label_left: 'Pumpkin', label_right: 'Apple' },
  { prompt: 'How many McDonalds cheeseburgers could you eat in one sitting?', label_left: '1 or less', label_right: '10 or more' },
  { prompt: 'Spider-Man 2 or Spider-Man Homecoming?', label_left: 'Spider-Man 2', label_right: 'Homecoming' },
  { prompt: 'Happy Gilmore or Billy Madison?', label_left: 'Happy Gilmore', label_right: 'Billy Madison' },
  { prompt: 'Hot Rod or Napoleon Dynamite?', label_left: 'Hot Rod', label_right: 'Napoleon Dynamite' },
  { prompt: 'Elf or Home Alone?', label_left: 'Elf', label_right: 'Home Alone' },
  { prompt: 'Succession or Yellowstone?', label_left: 'Succession', label_right: 'Yellowstone' },
  { prompt: 'Is the Rock a good actor?', label_left: 'Definitely', label_right: 'Not at all' },
  { prompt: 'Beyonce or Rihanna?', label_left: 'Beyonce', label_right: 'Rihanna' },
  { prompt: 'How much do you like country music?', label_left: 'Hate it', label_right: 'Love it' },
  { prompt: 'Fight a chicken every time you get in your car or an orangutan once a year with a broadsword?', label_left: 'Chickens every car ride', label_right: 'Orangutan once a year' },
  { prompt: '$10k worth of golf gear or one $10k vacation?', label_left: 'Golf gear', label_right: 'Vacation' },
  { prompt: 'Which would you rather have as a pet?', label_left: 'Kangaroo', label_right: 'Giraffe' },
  { prompt: 'When do you fill up your gas?', label_left: 'Once gas light is on', label_right: 'Before gas light' },
  { prompt: 'Cybertruck or F-150 Lightning?', label_left: 'Cybertruck', label_right: 'F-150 Lightning' },
  { prompt: 'How scared of AI are you?', label_left: 'Not scared at all', label_right: 'Terrified' },
  { prompt: 'How much do you typically tip with regular service?', label_left: '10%', label_right: '20%+' },
  { prompt: 'Opinion on Elon Musk?', label_left: 'Cannot stand him', label_right: 'Big fan' },
  { prompt: 'How many wasps in the room before you cant focus?', label_left: '1 wasp', label_right: '10+ wasps' },
];

async function setup() {
  console.log('🚀 Setting up Quadrants with awesome questions...\n');

  // Step 1: Add questions to bank
  console.log('📝 Adding questions to question bank...');
  let addedCount = 0;
  
  for (const q of newQuestions) {
    const { data: existing } = await supabase
      .from('question_bank')
      .select('id')
      .eq('prompt', q.prompt)
      .single();

    if (!existing) {
      await supabase.from('question_bank').insert({
        prompt: q.prompt,
        label_left: q.label_left,
        label_right: q.label_right,
        times_used: 0,
        submitted_by: 'seed'
      });
      addedCount++;
    }
  }
  
  console.log(`✅ Added ${addedCount} new questions (skipped ${newQuestions.length - addedCount} duplicates)\n`);

  // Step 2: Delete any empty "ULTIMATE VIBE CHECK" quads
  console.log('🧹 Cleaning up empty quads...');
  const { data: existingQuads } = await supabase
    .from('quads')
    .select('id, name')
    .eq('name', 'THE ULTIMATE VIBE CHECK');

  if (existingQuads && existingQuads.length > 0) {
    for (const quad of existingQuads) {
      await supabase.from('quads').delete().eq('id', quad.id);
    }
    console.log(`✅ Removed ${existingQuads.length} old quad(s)\n`);
  }

  // Step 3: Create the new quad
  console.log('🎨 Creating "THE ULTIMATE VIBE CHECK" quad...');
  
  const { data: quad, error: quadError } = await supabase
    .from('quads')
    .insert({
      name: 'THE ULTIMATE VIBE CHECK',
      description: 'Gaming, food wars, wild hypotheticals, and personality quirks - discover your true alignment',
      created_by: 'Quadrants Team',
      is_public: true
    })
    .select()
    .single();

  if (quadError) {
    console.error('❌ Error creating quad:', quadError);
    return;
  }

  console.log('✅ Quad created!\n');

  // Step 4: Get the questions we want (first 20)
  const questionsToUse = newQuestions.slice(0, 20);

  // Step 5: Add questions to the quad
  console.log('📋 Adding questions to quad...');
  
  const questionsToInsert = questionsToUse.map((q, index) => ({
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
    console.error('❌ Error adding questions:', questionsError);
    return;
  }

  console.log(`✅ Added ${questionsToInsert.length} questions to quad\n`);
  console.log('═══════════════════════════════════════════');
  console.log('🎉 SUCCESS! THE ULTIMATE VIBE CHECK is LIVE!');
  console.log('═══════════════════════════════════════════\n');
  console.log('🌐 Refresh http://localhost:3002 to see it!');
  console.log('🎮 Click the quad to start playing!\n');
}

setup();
