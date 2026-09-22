// Shapes returned by our own profile/player/club/favorites APIs — shared between
// the route handlers that build them and the client pages that render them.
import type { ClubRole } from "@/types/brawlstars";

export interface RankInfo {
  rankName: string;
  elo: number | null;
  iconUrl: string | null;
}

export interface FameInfo {
  value: number;
  tierName: string;
  iconUrl: string | null;
}

/** The player's club, with details when the club lookup succeeded. */
export interface PlayerClub {
  /** Without the leading '#'. */
  tag: string;
  name: string;
  badgeUrl: string | null;
  trophies: number | null;
  memberCount: number | null;
  role: ClubRole | null;
}

/** Everything a profile page shows about a Brawl Stars player, whether or not they have an account here. */
export interface PublicPlayer {
  name: string;
  /** Without the leading '#'. */
  tag: string;
  iconUrl: string;
  trophies: number;
  totalPrestigeLevel: number;
  victories3v3: number;
  soloVictories: number;
  duoVictories: number;
  club: PlayerClub | null;
  brawlersOwned: number;
  /** All brawlers in the game — the denominator for goal progress. */
  totalBrawlers: number;
  /** Trophies of every owned brawler, so the client can compute progress for any goal. */
  brawlerTrophies: number[];
  fame: FameInfo | null;
  rankedCurrent: RankInfo | null;
  rankedHighest: RankInfo | null;
}

export interface PlayerResponse {
  player: PublicPlayer;
  /** Site account this tag is linked to, if any. */
  linkedUsername: string | null;
}

export interface ProfileResponse {
  username: string;
  playerTag: string | null;
  memberSince: string;
  player: PublicPlayer | null;
  playerError: { error: string; code?: string } | null;
}

export interface Favorite {
  /** Without the leading '#'. */
  tag: string;
  name: string;
  iconUrl: string;
}

export interface PublicClubMember {
  /** Without the leading '#'. */
  tag: string;
  name: string;
  /** CSS color from the in-game name color, if any. */
  nameColor: string | null;
  role: ClubRole;
  trophies: number;
  iconUrl: string;
  /** Site account this member's tag is linked to, if any. */
  linkedUsername: string | null;
}

export interface PublicClub {
  /** Without the leading '#'. */
  tag: string;
  name: string;
  description: string | null;
  type: string;
  badgeUrl: string;
  requiredTrophies: number;
  trophies: number;
  /** Sorted by trophies, highest first. */
  members: PublicClubMember[];
}
