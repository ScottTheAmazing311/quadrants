import { Player, Response } from '@/types';

export function calculateEuclideanDistance(
  responses1: Response[],
  responses2: Response[]
): number {
  const questionMap1 = new Map(responses1.map(r => [r.question_id, r.value]));
  const questionMap2 = new Map(responses2.map(r => [r.question_id, r.value]));

  let sumSquares = 0;
  let count = 0;

  for (const [questionId, value1] of questionMap1) {
    const value2 = questionMap2.get(questionId);
    if (value2 !== undefined) {
      sumSquares += Math.pow(value1 - value2, 2);
      count++;
    }
  }

  return count > 0 ? Math.sqrt(sumSquares / count) : 0;
}

export function findMostAlike(
  players: Player[],
  responsesByPlayer: Map<string, Response[]>
): { players: Player[]; distance: number } | null {
  let minDistance = Infinity;
  let minPair: Player[] = [];

  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const responses1 = responsesByPlayer.get(players[i].id) || [];
      const responses2 = responsesByPlayer.get(players[j].id) || [];
      
      if (responses1.length === 0 || responses2.length === 0) continue;

      const distance = calculateEuclideanDistance(responses1, responses2);
      
      if (distance < minDistance) {
        minDistance = distance;
        minPair = [players[i], players[j]];
      }
    }
  }

  return minPair.length > 0 ? { players: minPair, distance: minDistance } : null;
}

export function findMostOpposed(
  players: Player[],
  responsesByPlayer: Map<string, Response[]>
): { players: Player[]; distance: number } | null {
  let maxDistance = 0;
  let maxPair: Player[] = [];

  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const responses1 = responsesByPlayer.get(players[i].id) || [];
      const responses2 = responsesByPlayer.get(players[j].id) || [];
      
      if (responses1.length === 0 || responses2.length === 0) continue;

      const distance = calculateEuclideanDistance(responses1, responses2);
      
      if (distance > maxDistance) {
        maxDistance = distance;
        maxPair = [players[i], players[j]];
      }
    }
  }

  return maxPair.length > 0 ? { players: maxPair, distance: maxDistance } : null;
}

export function calculateDeviationFromCenter(responses: Response[]): number {
  if (responses.length === 0) return 0;
  
  const deviations = responses.map(r => Math.abs(r.value - 5.5));
  return deviations.reduce((sum, d) => sum + d, 0) / deviations.length;
}

export function findMostExtreme(
  players: Player[],
  responsesByPlayer: Map<string, Response[]>
): { player: Player; deviation: number } | null {
  let maxDeviation = 0;
  let extremePlayer: Player | null = null;

  for (const player of players) {
    const responses = responsesByPlayer.get(player.id) || [];
    if (responses.length === 0) continue;

    const deviation = calculateDeviationFromCenter(responses);
    
    if (deviation > maxDeviation) {
      maxDeviation = deviation;
      extremePlayer = player;
    }
  }

  return extremePlayer ? { player: extremePlayer, deviation: maxDeviation } : null;
}

export function findMostNeutral(
  players: Player[],
  responsesByPlayer: Map<string, Response[]>
): { player: Player; deviation: number } | null {
  let minDeviation = Infinity;
  let neutralPlayer: Player | null = null;

  for (const player of players) {
    const responses = responsesByPlayer.get(player.id) || [];
    if (responses.length === 0) continue;

    const deviation = calculateDeviationFromCenter(responses);
    
    if (deviation < minDeviation) {
      minDeviation = deviation;
      neutralPlayer = player;
    }
  }

  return neutralPlayer ? { player: neutralPlayer, deviation: minDeviation } : null;
}

export function calculateVariance(responses: Response[]): number {
  if (responses.length === 0) return 0;
  
  const values = responses.map(r => r.value);
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  
  return squaredDiffs.reduce((sum, d) => sum + d, 0) / values.length;
}

export function findWildcard(
  players: Player[],
  responsesByPlayer: Map<string, Response[]>
): { player: Player; variance: number } | null {
  let maxVariance = 0;
  let wildcardPlayer: Player | null = null;

  for (const player of players) {
    const responses = responsesByPlayer.get(player.id) || [];
    if (responses.length === 0) continue;

    const variance = calculateVariance(responses);
    
    if (variance > maxVariance) {
      maxVariance = variance;
      wildcardPlayer = player;
    }
  }

  return wildcardPlayer ? { player: wildcardPlayer, variance: maxVariance } : null;
}
