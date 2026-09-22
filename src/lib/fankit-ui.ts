// Fixed UI icons from the official Supercell Fan Kit
// (https://fankit.supercell.com/d/YvtsWV4pUQVm/game-assets), referenced by
// their Frontify CDN file. Unlike ability icons and portraits (src/lib/fankit.ts,
// indexed at runtime per brawler), these never depend on game data, so they're
// plain constants that client and server code can both use.
import type { BrawlerRole } from "@/types/domain";

const CDN = "https://media.ffycdn.net/eu/supercell";

/** CDN URL for a fan kit file, resized server-side to `width` px. */
export function fanKitImage(file: string, width = 128): string {
  return `${CDN}/${file}?width=${width}`;
}

export const UI_ICONS = {
  trophy: "phQAjrfM7tnWPHAPQ3SM.png", // icon_trophy
  totalPrestige: "d34fF3VuwgGveHxE9TzS.png", // icon_total_prestige
  prestigeTrophy: "gFDqTNAKoXRDRDzAbbcW.png", // icon_prestige_trophy
  versus: "G2xMQ9cirQXRT2QiCUJm.png", // duels_icon — 3v3 victories
  soloShowdown: "kx27gVE2sm5WhWfkJAy8.png", // icon_solo_challenge
  duoShowdown: "ve5V1ftUBLqDW7Q59fuZ.png", // icon_duo_challenge
  brawlers: "e5dg3r42Ah2UD9XWp2v3.png", // vault_key_brawlers
  clubTrophy: "RDnbx4XHp8hbpLrUzECr.png", // icon_club_trophy_point
} as const;

const RANK_LEAGUE_ICONS: Record<string, string> = {
  BRONZE: "hXp8z4ZrZnQivujA6b4r.png",
  SILVER: "yKvWPrnD4HFqDraq7Prk.png",
  GOLD: "8L3PpxVFzrd7SAA1M9Sf.png",
  DIAMOND: "ym5Nv9mNRHPpPm8ApRgy.png",
  MYTHIC: "CkYZmgYViQTJMauLQqRG.png",
  LEGENDARY: "uDubo1ztHyn3gMfMAxft.png",
  MASTERS: "TfwqpuWo9UCrpdmfa36i.png",
  PRO: "xZxpKaZEx4TiwJCTof9N.png", // icon_rank_sticker_pro
};

/** League icon for a ranked tier name like "SILVER I" (the fan kit has one icon per league, not per division). */
export function rankLeagueIcon(rankName: string): string | undefined {
  const league = rankName.trim().split(/\s+/)[0]?.toUpperCase() ?? "";
  const file = RANK_LEAGUE_ICONS[league] ?? RANK_LEAGUE_ICONS[`${league}S`];
  return file && fanKitImage(file);
}

// Fame tiers are planets (Earth → Moon → Mars → Saturn → Sun), then Meteoric.
// Only Earth has a separate icon per division (1–3 stars).
const FAME_ICONS = {
  earth: ["eMQPpppj5c1uyTL1wqFz.png", "xoVT9DGrQBzckXcAGZap.png", "G5Jgn2pptXEVXC1NJDc9.png"],
  moon: "6JAksQ6ynkkPiULUMzwh.png",
  mars: "C8gzgi2AnUNaWWWK58uw.png",
  saturn: "YkpeZLvsoZCapkbRwoCs.png",
  sun: "3exkbMxukiWWgepHHjd6.png",
  meteoric: "LnD6V648qAvniJ7KJDu1.png",
};

/** Icon for a fame tier name like "MARTIAN FAME II"; undefined for an unrecognized tier. */
export function fameIcon(tierName: string): string | undefined {
  const name = tierName.toUpperCase();
  const divisions: Record<string, number> = { I: 0, II: 1, III: 2 };
  const division = divisions[name.trim().split(/\s+/).pop() ?? ""] ?? 0;
  const file = /EARTH|TERRA/.test(name)
    ? FAME_ICONS.earth[division]
    : /MOON|LUNAR/.test(name)
      ? FAME_ICONS.moon
      : /MARS|MARTIAN/.test(name)
        ? FAME_ICONS.mars
        : /SATURN/.test(name)
          ? FAME_ICONS.saturn
          : /SUN|SOLAR/.test(name)
            ? FAME_ICONS.sun
            : /METEOR/.test(name)
              ? FAME_ICONS.meteoric
              : undefined;
  return file && fanKitImage(file);
}

export const CLASS_ICONS: Partial<Record<BrawlerRole, string>> = {
  Tank: "tku8ZjA6AtybsHsaPb5t.png",
  DamageDealer: "gLVTV9eKK199gwE7RJMY.png",
  Marksman: "84NvDD32VU2aQttYiHgC.png",
  Artillery: "7nihqerPBNTxcAo4vxZW.png",
  Assassin: "q68V3YMWEizA9pfrTGSS.png",
  Support: "9YhEFJcTqxngqMtnySHJ.png",
  Controller: "WjjpYf3ooK53AwVo4fuR.png",
};

/** Keyed by our normalized mode key (see normalizeModeKey in src/lib/mode-weights.ts). */
export const MODE_ICONS: Record<string, string> = {
  gemGrab: "fogW8JonEiWf3LYtoCMi.png",
  brawlBall: "R3R2rDQhpZDHLkCBz9AP.png",
  brawlBall5v5: "R3R2rDQhpZDHLkCBz9AP.png",
  heist: "w2kBryGfM9xwXmkBejBh.png",
  bounty: "6ADzEDtdbUK63gssWzvr.png",
  knockout: "g9QYVzuSVxq372RUXLte.png",
  hotZone: "AUwZcMfbBoEcwJNkuDtd.png",
  duels: "G2xMQ9cirQXRT2QiCUJm.png",
  wipeout: "3bGu1h6p3n66fx9rfBxF.png",
  basketBrawl: "5uijWGgQqBppQWiB2675.png",
  showdown: "gnLJuR1DyYLMjRS3WjLL.png",
  brawlArena: "oyQFsC1SSRPfw3bpbZVz.png",
  volleyBrawl: "F2sPEXt3CffypZpAFfog.png",
  payload: "MGtHWJg4RSoCQf2Qbid8.png",
  trophyThieves: "akz9tUEigk5hLmgVhYGz.png",
  loneStar: "KKjJn6pmR5zLLzTP1KAU.png",
};
