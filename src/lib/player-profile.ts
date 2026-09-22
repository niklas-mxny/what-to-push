import "server-only";
import { playerIconUrl, rankIconUrl } from "@/lib/brawlapi";
import { fetchOfficialBrawlers, fetchPlayer, normalizePlayerTag } from "@/lib/supercell";
import type { PublicPlayer } from "@/types/profile";

/**
 * Loads the full profile stats for any player tag. Used by both the
 * account profile (/profile/[username]) and the tag profile (/player/[tag]),
 * so every player shows exactly the same stats either way.
 */
export async function loadPublicPlayer(tag: string): Promise<PublicPlayer> {
  const [p, official] = await Promise.all([fetchPlayer(tag), fetchOfficialBrawlers()]);
  return {
    name: p.name,
    tag: normalizePlayerTag(p.tag),
    iconUrl: playerIconUrl(p.icon.id),
    trophies: p.trophies,
    totalPrestigeLevel: p.totalPrestigeLevel,
    victories3v3: p["3vs3Victories"],
    soloVictories: p.soloVictories,
    duoVictories: p.duoVictories,
    clubName: "name" in p.club ? p.club.name : null,
    brawlersOwned: p.brawlers.length,
    totalBrawlers: official.items.length,
    brawlerTrophies: p.brawlers.map((b) => b.trophies),
    fame: p.fame && p.fameTierName ? { value: p.fame, tierName: p.fameTierName } : null,
    rankedCurrent:
      p.rankedRank && p.rankedRankName
        ? { rankName: p.rankedRankName, elo: p.rankedElo ?? null, iconUrl: rankIconUrl(p.rankedRank) }
        : null,
    rankedHighest:
      p.highestAllTimeRankedRank && p.highestAllTimeRankedRankName
        ? {
            rankName: p.highestAllTimeRankedRankName,
            elo: p.highestAllTimeRankedElo ?? null,
            iconUrl: rankIconUrl(p.highestAllTimeRankedRank),
          }
        : null,
  };
}
