const PLAYER_ID_KEY = 'quadrants_player_id';
const GROUP_CODE_KEY = 'quadrants_group_code';

export const storage = {
  getPlayerId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(PLAYER_ID_KEY);
  },

  setPlayerId(playerId: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(PLAYER_ID_KEY, playerId);
  },

  getGroupCode(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(GROUP_CODE_KEY);
  },

  setGroupCode(code: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(GROUP_CODE_KEY, code);
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(PLAYER_ID_KEY);
    localStorage.removeItem(GROUP_CODE_KEY);
  },

  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, value);
  },

  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(key);
  },

  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  }
};
