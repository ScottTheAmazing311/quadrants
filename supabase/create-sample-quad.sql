-- First, create the quad
INSERT INTO quads (name, description, created_by, is_public)
VALUES (
  'THE ULTIMATE VIBE CHECK',
  'A mix of gaming, food, entertainment, and wild hypotheticals to discover your true personality alignment',
  'Quadrants Team',
  true
)
RETURNING id;

-- Now insert 20 questions (you'll need to replace {QUAD_ID} with the ID from above)
-- For now, let's create a complete script that works in one go:

WITH new_quad AS (
  INSERT INTO quads (name, description, created_by, is_public)
  VALUES (
    'THE ULTIMATE VIBE CHECK',
    'A mix of gaming, food, entertainment, and wild hypotheticals to discover your true personality alignment',
    'Quadrants Team',
    true
  )
  RETURNING id
),
selected_questions AS (
  SELECT id, prompt, label_left, label_right, 
         ROW_NUMBER() OVER (ORDER BY random()) as rn
  FROM question_bank
  WHERE prompt IN (
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
  )
)
INSERT INTO questions (quad_id, prompt, label_left, label_right, "order")
SELECT 
  (SELECT id FROM new_quad),
  prompt,
  label_left,
  label_right,
  (ROW_NUMBER() OVER (ORDER BY rn)) - 1
FROM selected_questions;
