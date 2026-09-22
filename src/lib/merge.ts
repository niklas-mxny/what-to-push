import type { BrawlApiBrawlerList } from "@/types/brawlapi";
import type { Player, SupercellBrawlerList } from "@/types/brawlstars";
import type { MergedBrawler } from "@/types/domain";
import { resolveRole } from "@/lib/roles";

function normalizeName(name: string): string {
  return name.trim().toUpperCase();
}

/**
 * Baut die vollständige Brawler-Liste (alle im Spiel verfügbaren Brawler) und reichert
 * sie an mit: Icon/Seltenheit (BrawlAPI), Rolle (unsere Tabelle) und — falls vorhanden —
 * den Fortschrittsdaten des Spielers (Power, Rang, Trophäen, freigeschaltete Upgrades).
 */
export function buildRoster(
  officialBrawlers: SupercellBrawlerList,
  brawlApiMeta: BrawlApiBrawlerList,
  player: Player | null
): MergedBrawler[] {
  const brawlApiByName = new Map(brawlApiMeta.list.map((b) => [normalizeName(b.name), b]));
  const playerBrawlerById = new Map((player?.brawlers ?? []).map((b) => [b.id, b]));
  const playerBrawlerByName = new Map(
    (player?.brawlers ?? []).map((b) => [normalizeName(b.name), b])
  );

  return officialBrawlers.items.map((official) => {
    const key = normalizeName(official.name);
    const meta = brawlApiByName.get(key);
    const owned = playerBrawlerById.get(official.id) ?? playerBrawlerByName.get(key);

    const merged: MergedBrawler = {
      key,
      id: official.id,
      name: official.name,
      role: resolveRole(official.name),
      rarity: meta?.rarity.name,
      iconUrl: meta?.imageUrl2 ?? meta?.imageUrl,
      owned: Boolean(owned),
      power: owned?.power ?? 0,
      rank: owned?.rank ?? 0,
      trophies: owned?.trophies ?? 0,
      highestTrophies: owned?.highestTrophies ?? 0,
      starPowersUnlocked: owned?.starPowers.length ?? 0,
      starPowersTotal: official.starPowers.length,
      gadgetsUnlocked: owned?.gadgets.length ?? 0,
      gadgetsTotal: official.gadgets.length,
      gearsUnlocked: owned?.gears.length ?? 0,
    };
    return merged;
  });
}
