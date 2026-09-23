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

/** Empty in-game badge frames, for drawing bare ability symbols the way the game shows them. */
export const ABILITY_FRAMES = {
  gadget: "qF4wWgQRJZLVVoSuG4Gp.png", // gadget_base_empty
  starPower: "HZkLR5iHXb28bGkYQ4gG.png", // starpower_base01_empty — the gold jagged star
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

// Fame tiers are planets (Earth → Moon → Mars → Saturn → Sun), then Meteoric,
// each with divisions I–III shown as 1–3 stars under the planet. The fan kit only
// has all three star variants for Earth; the other planets exist with one star.
type FamePlanet = "earth" | "moon" | "mars" | "saturn" | "sun" | "meteoric";

const FAME_ART: Record<FamePlanet, { files: string[]; aspect: number; star?: { x: number; y: number; w: number } }> = {
  // `aspect` = width / height of the art; `star` = the (single) star's centre and
  // width in % of the art box, measured from the fan kit files.
  earth: {
    files: ["eMQPpppj5c1uyTL1wqFz.png", "xoVT9DGrQBzckXcAGZap.png", "G5Jgn2pptXEVXC1NJDc9.png"],
    aspect: 1024 / 1200,
    star: { x: 50.3, y: 80.9, w: 36 },
  },
  moon: { files: ["6JAksQ6ynkkPiULUMzwh.png"], aspect: 1024 / 1200, star: { x: 50.3, y: 80.9, w: 36 } },
  mars: { files: ["C8gzgi2AnUNaWWWK58uw.png"], aspect: 1024 / 1200, star: { x: 50.3, y: 80.9, w: 36 } },
  saturn: { files: ["YkpeZLvsoZCapkbRwoCs.png"], aspect: 1352 / 1200, star: { x: 50, y: 80, w: 28 } },
  sun: { files: ["3exkbMxukiWWgepHHjd6.png"], aspect: 1333 / 1354, star: { x: 50, y: 82.5, w: 28 } },
  meteoric: { files: ["LnD6V648qAvniJ7KJDu1.png"], aspect: 996 / 1330 },
};

export interface FameArt {
  url: string;
  aspect: number;
  /** 1–3, or null for a tier without divisions (Meteoric). */
  division: number | null;
  /**
   * Set when the art shows the wrong division (only Earth has 2- and 3-star art):
   * where the art's single star is, so it can be covered by a division badge.
   */
  coverStar?: { x: number; y: number; w: number };
}

/** Art for a fame tier name like "MARTIAN FAME II"; undefined for an unrecognized tier. */
export function fameArt(tierName: string): FameArt | undefined {
  const name = tierName.toUpperCase();
  const planet: FamePlanet | undefined = /EARTH|TERRA/.test(name)
    ? "earth"
    : /MOON|LUNAR/.test(name)
      ? "moon"
      : /MARS|MARTIAN/.test(name)
        ? "mars"
        : /SATURN/.test(name)
          ? "saturn"
          : /SUN|SOLAR/.test(name)
            ? "sun"
            : /METEOR/.test(name)
              ? "meteoric"
              : undefined;
  if (!planet) return undefined;

  const numerals: Record<string, number> = { I: 1, II: 2, III: 3 };
  const division = numerals[name.trim().split(/\s+/).pop() ?? ""] ?? null;
  const art = FAME_ART[planet];
  const file = art.files[(division ?? 1) - 1] ?? art.files[0];
  const exact = division === null || division <= art.files.length;
  return {
    url: fanKitImage(file, 256),
    aspect: art.aspect,
    division,
    coverStar: exact ? undefined : art.star,
  };
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
