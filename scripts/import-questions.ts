import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const questions = [
  // Food & Drink
  { prompt: "How much do you like Chipotle?", label_left: "Straight TRASH", label_right: "Extra Guac Baby!" },
  { prompt: "Yellow Curry or Massaman Curry", label_left: "Yellow", label_right: "Massaman" },
  { prompt: "McDonalds or Wendys", label_left: "MCD", label_right: "WENDY" },
  { prompt: "Cheese Stick or String Cheese", label_left: "Stick", label_right: "String" },
  { prompt: "Cool Whip or Whipped Cream", label_left: "Cool Whip", label_right: "Whipped Cream" },
  { prompt: "Raspberries or Blackberries", label_left: "Raspberry", label_right: "Blackberry" },
  { prompt: "McDouble or McChicken", label_left: "BEEF", label_right: "CHICKEN" },
  { prompt: "Preferred level of spice in salsa?", label_left: "Mild as it gets", label_right: "I wanna HURT myself" },
  { prompt: "Jif or Skippy", label_left: "Jif", label_right: "Skippy" },
  { prompt: "Thai Food or Indian Food", label_left: "Thai", label_right: "Indian" },
  { prompt: "Diet Coke or Coke Zero", label_left: "Diet", label_right: "ZERO" },
  { prompt: "Taco Bell or Chick-fil-a", label_left: "Taco Bell", label_right: "CFA" },
  { prompt: "Little Caesars or Dominos", label_left: "Hot n Sweaty", label_right: "Garlic Crust" },
  { prompt: "Apple Pie or Pumpkin Pie", label_left: "Apple", label_right: "Pumpkin" },
  { prompt: "Donuts or Brownies", label_left: "Donuts", label_right: "Brownies" },
  { prompt: "Uncrustables or Hot Pockets", label_left: "Uncrustables", label_right: "Hot Pockets" },
  { prompt: "Pepperjack or American Cheese", label_left: "Pepperjack", label_right: "American" },
  { prompt: "Chicken Sandwich or Spicy Chicken Sandwich", label_left: "Regular", label_right: "Spicy" },
  { prompt: "Which french fries do you prefer", label_left: "McDonalds", label_right: "Chick-fil-a" },
  { prompt: "Jimmy Johns or Jersey Mikes", label_left: "JJ", label_right: "JM" },
  { prompt: "Hot Dog On A Stick: Love or Hate?", label_left: "Love it", label_right: "Hate it" },
  { prompt: "Broth amount when cooking Top Ramen", label_left: "None", label_right: "Full to the brim" },
  { prompt: "Rice Krispy Treat or Peanut Butter Bar", label_left: "Rice Krispy", label_right: "PB Bar" },
  { prompt: "Asiago Bagel or Blueberry Bagel", label_left: "Asiago", label_right: "Blueberry" },
  { prompt: "Green Otter Pop or Pink Otter Pop", label_left: "Green", label_right: "Pink" },
  { prompt: "Honey Nut Cheerios or Fruity Pebbles", label_left: "Honey Nut", label_right: "Fruity Pebbles" },
  { prompt: "Blow Pop or Tootsie Pop", label_left: "Blow Pop", label_right: "Tootsie Pop" },
  { prompt: "How many McDonalds Hamburgers could you eat in one sitting?", label_left: "Just one", label_right: "10 if not more" },
  { prompt: "NY Cheesecake or Peach Cobbler", label_left: "Cheesecake", label_right: "Peach Cobbler" },
  { prompt: "How much do you like sunflower seeds", label_left: "Hate seeds", label_right: "Love seeds" },
  { prompt: "High Five or Fist Bump", label_left: "High Five", label_right: "Fist Bump" },

  // Entertainment & Media
  { prompt: "How great is Avatar the Last Airbender?", label_left: "Meh", label_right: "One of the greatest shows" },
  { prompt: "The Office or Parks and Rec", label_left: "The Office", label_right: "Parks and Rec" },
  { prompt: "How do you feel about The Last Jedi", label_left: "A Star Wars Abomination", label_right: "A Star Wars Masterpiece" },
  { prompt: "Batman or Superman", label_left: "Batman", label_right: "Superman" },
  { prompt: "Interest in Lost", label_left: "Never saw it, don't care to", label_right: "Dharma Obsessed" },
  { prompt: "Age of Empires or Starcraft", label_left: "AOE", label_right: "Starcraft" },
  { prompt: "Joe Rogan or This American Life", label_left: "Joe Rogan", label_right: "This American Life" },
  { prompt: "Home Alone or Elf", label_left: "Home Alone", label_right: "Elf" },
  { prompt: "GeoGuessr or Angry Birds", label_left: "GeoGuessr", label_right: "Angry Birds" },
  { prompt: "WandaVision or Mandalorian", label_left: "WandaVision", label_right: "Mandalorian" },
  { prompt: "How much do you like the Simpsons", label_left: "Nah", label_right: "LOVE IT" },
  { prompt: "How much do you like Rick and Morty", label_left: "No thanks", label_right: "Pickle Rick!" },
  { prompt: "Among Us or Secret Hitler", label_left: "Among Us", label_right: "Secret Hitler" },
  { prompt: "Jim Carrey Grinch or Animated Grinch", label_left: "Jim Carrey", label_right: "Animated" },
  { prompt: "Minecraft or Starcraft", label_left: "Minecraft", label_right: "Starcraft" },
  { prompt: "SNES or N64", label_left: "SNES", label_right: "N64" },
  { prompt: "Digital Download or Physical Disk", label_left: "Digital", label_right: "Physical" },
  { prompt: "Which Nintendo IP do you appreciate more", label_left: "Zelda", label_right: "Mario" },
  { prompt: "What is the best Pokemon Generation?", label_left: "Gen 1 (Red/Blue)", label_right: "Gen 8 (Sword/Shield)" },
  { prompt: "Which Harry Potter Movie is the Best", label_left: "Sorcerer's Stone", label_right: "Deathly Hallows Pt 2" },
  { prompt: "Charmander or Squirtle", label_left: "Charmander", label_right: "Squirtle" },
  { prompt: "Apex or Valorant", label_left: "Apex", label_right: "Valorant" },
  { prompt: "Sandlot or Princess Bride", label_left: "Sandlot", label_right: "Princess Bride" },
  { prompt: "Modern Family or Schitt's Creek", label_left: "Modern Family", label_right: "Schitt's Creek" },
  { prompt: "Drake or Post Malone", label_left: "Drake", label_right: "Post Malone" },
  { prompt: "Toy Story 2 or Toy Story 3", label_left: "Toy Story 2", label_right: "Toy Story 3" },
  { prompt: "Land Before Time or Prince of Egypt", label_left: "Land Before Time", label_right: "Prince of Egypt" },
  { prompt: "Attack of the Clones or The Last Jedi", label_left: "Attack of the Clones", label_right: "The Last Jedi" },
  { prompt: "Mushu or Abu", label_left: "Mushu", label_right: "Abu" },
  { prompt: "Croquet or KanJam", label_left: "Croquet", label_right: "KanJam" },
  { prompt: "Have a podcast with 50k listeners or a Twitch stream with 50k viewers", label_left: "Podcast", label_right: "Twitch" },
  { prompt: "90s cell phone for life or 90s computer for life", label_left: "Phone", label_right: "Computer" },
  { prompt: "Fixer Upper or Studio McGee", label_left: "Fixer Upper", label_right: "Studio McGee" },

  // Lifestyle & Preferences
  { prompt: "How much do you want a Ford Bronco?", label_left: "I'm a Jeep person", label_right: "NEED NOW" },
  { prompt: "At least how many times a month do you wash your hair?", label_left: "Basically never", label_right: "Daily" },
  { prompt: "How good are you at Pickleball", label_left: "I suck", label_right: "I'm the best" },
  { prompt: "How good are you at slack line walking", label_left: "The worst", label_right: "Pro level" },
  { prompt: "How often do you make your bed", label_left: "Every morning", label_right: "Rarely made" },
  { prompt: "Number of unread emails in your inbox", label_left: "Zero", label_right: "Thousands" },
  { prompt: "Google Home or Alexa", label_left: "Google", label_right: "Alexa" },
  { prompt: "Laptop on the right or left side of the monitor", label_left: "LEFT", label_right: "RIGHT" },
  { prompt: "Trackpad or Mouse", label_left: "Trackpad", label_right: "Mouse" },
  { prompt: "Netflix or Spotify (can only keep one)", label_left: "Netflix", label_right: "Spotify" },
  { prompt: "Blackjack or Craps", label_left: "Blackjack", label_right: "Craps" },
  { prompt: "Utah County or Salt Lake County", label_left: "Salt Lake", label_right: "Utah County" },
  { prompt: "BYU or Utah", label_left: "BYU", label_right: "Utah" },
  { prompt: "Chris Hemsworth or Chris Pine", label_left: "Hemsworth", label_right: "Pine" },
  { prompt: "Halloween or 4th of July", label_left: "Halloween", label_right: "4th of July" },
  { prompt: "Marriott or Hilton", label_left: "Marriott", label_right: "Hilton" },
  { prompt: "New York or LA", label_left: "NYC", label_right: "LA" },
  { prompt: "Nike or Adidas", label_left: "Nike", label_right: "Adidas" },
  { prompt: "Italy or France", label_left: "France", label_right: "Italy" },
  { prompt: "Window or Aisle seat", label_left: "Window", label_right: "Aisle" },
  { prompt: "China or Japan", label_left: "China", label_right: "Japan" },
  { prompt: "Bitcoin or Ethereum", label_left: "Bitcoin", label_right: "Ethereum" },
  { prompt: "Pandas or Foxes", label_left: "Panda", label_right: "Fox" },
  { prompt: "Personal Maid or Personal Chef", label_left: "Maid", label_right: "Chef" },
  { prompt: "Rate yourself at Golf", label_left: "Terrible", label_right: "Could go pro" },
  { prompt: "Brownies: Edge piece or center piece", label_left: "Edge", label_right: "Center" },
  { prompt: "Live in Mississippi or North Dakota forever", label_left: "Mississippi", label_right: "North Dakota" },
  { prompt: "Who is hotter: Chris Hemsworth or Ryan Gosling", label_left: "Hemsworth", label_right: "Gosling" },
  { prompt: "How much do you like Daylight Savings", label_left: "I enjoy the mix up", label_right: "Hate it" },

  // Would You Rather / Hypothetical
  { prompt: "Once a year Time Machine or anytime Teleporter", label_left: "Time Machine", label_right: "Teleporter" },
  { prompt: "Never take a photo again or never handwrite again", label_left: "No more pics", label_right: "No more writing" },
  { prompt: "Know the year you will die, or don't know", label_left: "Know", label_right: "Don't Know" },
  { prompt: "Elbows fused straight or knees fused straight", label_left: "Arms straight", label_right: "Legs straight" },
  { prompt: "Never cut your hair again or only shower once a year", label_left: "Never cut hair", label_right: "Shower once a year" },
  { prompt: "Never use an Apple product again or never watch a new movie again", label_left: "No Apple", label_right: "No new movies" },
  { prompt: "Chronic hiccups for life or missing 3 fingers for life", label_left: "Hiccups", label_right: "Fingers" },
  { prompt: "Live in northern Russia forever or live in Syria forever", label_left: "Russia", label_right: "Syria" },
  { prompt: "1 vaccine but less effective, or 3 vaccines but very effective", label_left: "1 and done", label_right: "3 and protected" },
  { prompt: "Blind with no legs or Deaf with no arms", label_left: "Blind/no legs", label_right: "Deaf/no arms" },

  // Conspiracy / Hot Takes
  { prompt: "Did Epstein kill himself?", label_left: "Yes", label_right: "Absolutely not" },
  { prompt: "Was 9/11 an inside job?", label_left: "No", label_right: "Jet fuel doesn't melt steel beams" },
  { prompt: "Border Wall or Open Borders", label_left: "Wall", label_right: "No Wall" },
];

async function importQuestions() {
  console.log(`Starting import of ${questions.length} questions...`);

  let added = 0;
  let skipped = 0;
  let errors = 0;

  for (const question of questions) {
    // Check if question already exists
    const { data: existing } = await supabase
      .from('question_bank')
      .select('id')
      .eq('prompt', question.prompt)
      .single();

    if (existing) {
      console.log(`⏭️  Skipping: "${question.prompt}" (already exists)`);
      skipped++;
      continue;
    }

    // Insert new question
    const { error } = await supabase
      .from('question_bank')
      .insert({
        prompt: question.prompt,
        label_left: question.label_left,
        label_right: question.label_right,
        submitted_by: 'Bulk Import',
        times_used: 0
      });

    if (error) {
      console.error(`❌ Error adding: "${question.prompt}"`, error);
      errors++;
    } else {
      console.log(`✅ Added: "${question.prompt}"`);
      added++;
    }
  }

  console.log('\n📊 Import Complete!');
  console.log(`✅ Added: ${added}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`📝 Total: ${questions.length}`);
}

importQuestions().catch(console.error);
