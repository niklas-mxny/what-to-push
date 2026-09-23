import "server-only";
import { clubBadgeUrl, playerIconUrl } from "@/lib/brawlapi";
import { dbAll } from "@/lib/db";
import { rankLeagueIcon } from "@/lib/fankit-ui";
import { fetchClub, fetchOfficialBrawlers, fetchPlayer, normalizePlayerTag } from "@/lib/supercell";
import type { Club } from "@/types/brawlstars";
import type { PlayerClub, PublicClub, PublicPlayer } from "@/types/profile";

function rankInfo(rankName: string | undefined, elo: number | undefined) {
  return rankName ? { rankName, elo: elo ?? null, iconUrl: rankLeagueIcon(rankName) ?? null } : null;
}

/** "0xfff9c908" (ARGB) → "#f9c908"; null for missing/unparseable values. */
function nameColorToCss(nameColor: string | undefined): string | null {
  const m = nameColor && /^0x[0-9a-f]{2}([0-9a-f]{6})$/i.exec(nameColor);
  return m ? `#${m[1]}` : null;
}

/** Site usernames for any of these tags that are linked to an account here. */
async function linkedUsernames(tags: string[]): Promise<Map<string, string>> {
  if (tags.length === 0) return new Map();
  const rows = await dbAll<{ username: string; player_tag: string }>(
    `SELECT username, player_tag FROM users WHERE player_tag IN (${tags.map(() => "?").join(",")})`,
    tags
  );
  return new Map(rows.map((r) => [r.player_tag, r.username]));
}

/**
 * Loads the full profile stats for any player tag. Used by both the
 * account profile (/profile/[username]) and the tag profile (/player/[tag]),
 * so every player shows exactly the same stats either way.
 */
export async function loadPublicPlayer(tag: string): Promise<PublicPlayer> {
  const [p, official] = await Promise.all([fetchPlayer(tag), fetchOfficialBrawlers()]);
  const playerTag = normalizePlayerTag(p.tag);

  let club: PlayerClub | null = null;
  if ("tag" in p.club) {
    club = {
      tag: normalizePlayerTag(p.club.tag),
      name: p.club.name,
      badgeUrl: null,
      trophies: null,
      memberCount: null,
      role: null,
    };
    // Extra details (badge, size, the player's role) are nice-to-have — the
    // profile still works with just the name if the club lookup fails.
    const details: Club | null = await fetchClub(p.club.tag).catch(() => null);
    if (details) {
      club = {
        ...club,
        badgeUrl: clubBadgeUrl(details.badgeId),
        trophies: details.trophies,
        memberCount: details.members.length,
        role: details.members.find((m) => normalizePlayerTag(m.tag) === playerTag)?.role ?? null,
      };
    }
  }

  return {
    name: p.name,
    tag: playerTag,
    iconUrl: playerIconUrl(p.icon.id),
    trophies: p.trophies,
    totalPrestigeLevel: p.totalPrestigeLevel,
    victories3v3: p["3vs3Victories"],
    soloVictories: p.soloVictories,
    duoVictories: p.duoVictories,
    club,
    brawlersOwned: p.brawlers.length,
    totalBrawlers: official.items.length,
    brawlerTrophies: p.brawlers.map((b) => b.trophies),
    fame: p.fame && p.fameTierName ? { value: p.fame, tierName: p.fameTierName } : null,
    rankedCurrent: rankInfo(p.rankedRankName, p.rankedElo),
    rankedHighest: rankInfo(p.highestAllTimeRankedRankName, p.highestAllTimeRankedElo),
  };
}

/** A club with its full member list, for /club/[tag]. */
export async function loadPublicClub(tag: string): Promise<PublicClub> {
  const c = await fetchClub(tag);
  const members = [...c.members].sort((a, b) => b.trophies - a.trophies);
  const linked = await linkedUsernames(members.map((m) => normalizePlayerTag(m.tag)));

  return {
    tag: normalizePlayerTag(c.tag),
    name: c.name,
    description: c.description?.trim() || null,
    type: c.type,
    badgeUrl: clubBadgeUrl(c.badgeId),
    requiredTrophies: c.requiredTrophies,
    trophies: c.trophies,
    members: members.map((m) => {
      const memberTag = normalizePlayerTag(m.tag);
      return {
        tag: memberTag,
        name: m.name,
        nameColor: nameColorToCss(m.nameColor),
        role: m.role,
        trophies: m.trophies,
        iconUrl: playerIconUrl(m.icon.id),
        linkedUsername: linked.get(memberTag) ?? null,
      };
    }),
  };
}
