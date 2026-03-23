/** Úroveň hráče z celkového XP (přetrvá v prohlížeči). */

const STORAGE_KEY = "rychlesipy-xp";
const XP_PER_LEVEL = 100;

export type LevelInfo = {
  level: number;
  xpInLevel: number;
  xpToNext: number;
  /** 0–100 pro progress bar v rámci úrovně */
  percentInLevel: number;
  totalXp: number;
};

export function loadTotalXp(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null) return 0;
    const n = parseInt(raw, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function saveTotalXp(total: number): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(Math.max(0, Math.floor(total))));
  } catch {
    /* ignore */
  }
}

export function getLevelInfo(totalXp: number): LevelInfo {
  const safe = Math.max(0, Math.floor(totalXp));
  const level = Math.floor(safe / XP_PER_LEVEL) + 1;
  const xpInLevel = safe % XP_PER_LEVEL;
  return {
    level,
    xpInLevel,
    xpToNext: XP_PER_LEVEL,
    percentInLevel: (xpInLevel / XP_PER_LEVEL) * 100,
    totalXp: safe,
  };
}

/**
 * XP za dokončené kolo: účast + bonus za skóre (může být i záporné, minimum 15).
 */
export function computeRoundXp(questionsInRound: number, roundScore: number): number {
  const base = questionsInRound * 8;
  const scoreBonus = roundScore * 5;
  return Math.max(15, base + scoreBonus);
}

export type RoundXpResult = {
  xpGained: number;
  totalXp: number;
  levelBefore: number;
  levelAfter: number;
  leveledUp: boolean;
  infoAfter: LevelInfo;
};

/** Přičte XP po kole a vrátí informace pro UI. */
export function grantRoundXp(questionsInRound: number, roundScore: number): RoundXpResult {
  const xpGained = computeRoundXp(questionsInRound, roundScore);
  const beforeXp = loadTotalXp();
  const levelBefore = getLevelInfo(beforeXp).level;
  const afterXp = beforeXp + xpGained;
  saveTotalXp(afterXp);
  const infoAfter = getLevelInfo(afterXp);
  return {
    xpGained,
    totalXp: afterXp,
    levelBefore,
    levelAfter: infoAfter.level,
    leveledUp: infoAfter.level > levelBefore,
    infoAfter,
  };
}
