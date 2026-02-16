'use server';

import { supabase } from '@/lib/supabase';
import { generateUniqueGroupCode } from '@/lib/utils';
import { QuestionData } from '@/components/QuestionBuilder';

export async function createQuad(data: {
  name: string;
  description: string;
  created_by: string;
  group_code: string | null;
  is_public: boolean;
  questions: QuestionData[];
}) {
  // Insert quad
  const { data: quad, error: quadError } = await supabase
    .from('quads')
    .insert({
      name: data.name,
      description: data.description,
      created_by: data.created_by,
      group_code: data.group_code,
      is_public: data.is_public
    })
    .select()
    .single();

  if (quadError || !quad) {
    throw new Error('Failed to create quad');
  }

  // Insert questions
  const questionsToInsert = data.questions.map((q, index) => ({
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
    throw new Error('Failed to create questions');
  }

  // Update question bank - try to insert, on conflict do nothing
  // (We'll rely on unique constraint on prompt column)
  for (const question of data.questions) {
    const { data: existing } = await supabase
      .from('question_bank')
      .select('id, times_used')
      .eq('prompt', question.prompt)
      .single();

    if (existing) {
      // Increment times_used
      await supabase
        .from('question_bank')
        .update({ times_used: existing.times_used + 1 })
        .eq('id', existing.id);
    } else {
      // Insert new question
      await supabase
        .from('question_bank')
        .insert({
          prompt: question.prompt,
          label_left: question.label_left,
          label_right: question.label_right,
          times_used: 1
        });
    }
  }

  return quad;
}

export async function createGroup(name: string) {
  const code = await generateUniqueGroupCode();

  const { data: group, error } = await supabase
    .from('groups')
    .insert({ name, code })
    .select()
    .single();

  if (error || !group) {
    throw new Error('Failed to create group');
  }

  return group;
}

export async function createGroupWithMembers(
  groupName: string,
  members: { name: string; avatarUrl: string | null }[]
) {
  const code = await generateUniqueGroupCode();

  // Create group
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .insert({ name: groupName, code })
    .select()
    .single();

  if (groupError || !group) {
    throw new Error('Failed to create group');
  }

  // Create all players
  const playersToInsert = members.map(member => ({
    group_id: group.id,
    name: member.name,
    avatar_url: member.avatarUrl
  }));

  const { error: playersError } = await supabase
    .from('players')
    .insert(playersToInsert);

  if (playersError) {
    throw new Error('Failed to create group members');
  }

  return { code: group.code, groupId: group.id };
}

export async function joinGroup(groupCode: string, playerName: string, avatarUrl: string | null) {
  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('id')
    .eq('code', groupCode)
    .single();

  if (groupError || !group) {
    throw new Error('Group not found');
  }

  const { data: player, error: playerError } = await supabase
    .from('players')
    .insert({
      group_id: group.id,
      name: playerName,
      avatar_url: avatarUrl
    })
    .select()
    .single();

  if (playerError || !player) {
    throw new Error('Failed to join group');
  }

  return player;
}

export async function submitResponses(
  playerId: string,
  quadId: string,
  responses: { questionId: string; value: number }[]
) {
  const responsesToInsert = responses.map(r => ({
    player_id: playerId,
    question_id: r.questionId,
    quad_id: quadId,
    value: r.value
  }));

  const { error } = await supabase
    .from('responses')
    .upsert(responsesToInsert, {
      onConflict: 'player_id,question_id'
    });

  if (error) {
    throw new Error('Failed to submit responses');
  }

  return true;
}

export async function generateQuestions(count: number = 12) {
  const { data, error } = await supabase
    .from('question_bank')
    .select('*')
    .limit(100);

  if (error || !data) {
    throw new Error('Failed to fetch questions');
  }

  // Randomly select questions
  const shuffled = data.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(q => ({
    prompt: q.prompt,
    label_left: q.label_left,
    label_right: q.label_right,
    locked: false
  }));
}

export async function suggestQuestion(data: {
  prompt: string;
  label_left: string;
  label_right: string;
  submitted_by: string | null;
}) {
  const { error } = await supabase
    .from('question_bank')
    .insert({
      prompt: data.prompt,
      label_left: data.label_left,
      label_right: data.label_right,
      times_used: 0,
      submitted_by: data.submitted_by
    });

  if (error) {
    throw new Error('Failed to suggest question');
  }

  return true;
}
