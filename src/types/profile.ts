// Shapes returned by our own profile/player/favorites APIs — shared between the
// route handlers that build them and the client pages that render them.

export interface RankInfo {
  rankName: string;
  elo: number | null;
  iconUrl: string;
}

export interface FameInfo {
  value: number;
  tierName: string;
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
  clubName: string | null;
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
