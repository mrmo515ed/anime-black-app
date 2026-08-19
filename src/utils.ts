import badgeRookie from './assets/images/badge_rookie_1783807751211.jpg';
import badgeExplorer from './assets/images/badge_explorer_1783807761295.jpg';
import badgeElite from './assets/images/badge_elite_1783807772852.jpg';
import badgeLegend from './assets/images/badge_legend_1783807782442.jpg';
import badgeAnimeBlack from './assets/images/badge_anime_black_1783807791907.jpg';
import { getLevelBadgeInfo } from './utils/levelBadgeSystem';

export function getBadgeImgForLevel(level: number): string {
  if (level >= 100) return badgeAnimeBlack;
  if (level >= 80) return badgeLegend;
  if (level >= 50) return badgeElite;
  if (level >= 20) return badgeExplorer;
  return badgeRookie;
}

export function getTitleForLevel(level: number, isArabic = false): string {
  const info = getLevelBadgeInfo(level);
  return isArabic ? info.titleAr : info.titleEn;
}

