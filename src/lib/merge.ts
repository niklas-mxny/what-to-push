import type { BrawlApiBrawlerList } from "@/types/brawlapi";
import type { Player, SupercellBrawlerList } from "@/types/brawlstars";
import type { MergedBrawler, UnlockedUpgrade } from "@/types/domain";
import { brawlerKey, fanKitGearUrl, type FanKitIcons } from "@/lib/fankit";
import { resolveRole } from "@/lib/roles";

function normalizeName(name: string): string {
  return name.trim().toUpperCase();
}

function gearIconUrl(id: number): string {
  // Gears aren't brawler-specific and BrawlAPI doesn't list them in its brawler
  // payload, but they live on the same CDN as everything else at a predictable path.
  return `https://cdn.brawlify.com/gears/regular/${id}.png`;
}

/** 1-based slot of an ability within the brawler's kit, in ID order (= the in-game "Gadget 1/2" order). */
function slotOf(abilities: { id: number }[], id: number): number {
  return [...abilities].sort((a, b) => a.id - b.id).findIndex((a) => a.id === id) + 1;
}

/**
 * Baut die vollständige Brawler-Liste (alle im Spiel verfügbaren Brawler) und reichert
 * sie an mit: Icon/Seltenheit (BrawlAPI), Rolle (unsere Tabelle) und — falls vorhanden —
 * den Fortschrittsdaten des Spielers (Power, Rang, Prestige, freigeschaltete Upgrades
 * inkl. Icons für Gadget/Star Power/Gear/Hypercharge — bevorzugt die originalen
 * Assets aus dem Supercell Fan Kit, sonst BrawlAPI/Brawlify als Fallback).
 */
export function buildRoster(
  officialBrawlers: SupercellBrawlerList,
  brawlApiMeta: BrawlApiBrawlerList,
  player: Player | null,
  fanKit: FanKitIcons
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

    const starPowerIconById = new Map(meta?.starPowers.map((sp) => [sp.id, sp.imageUrl]));
    const gadgetIconById = new Map(meta?.gadgets.map((g) => [g.id, g.imageUrl]));

    const kitKey = brawlerKey(official.name);
    const fanStarPowers = fanKit.starPowers[kitKey] ?? [];
    const fanGadgets = fanKit.gadgets[kitKey] ?? [];

    const starPowers: UnlockedUpgrade[] =
      owned?.starPowers.map((sp) => ({
        id: sp.id,
        name: sp.name,
        iconUrl: fanStarPowers[slotOf(official.starPowers, sp.id) - 1] ?? starPowerIconById.get(sp.id),
      })) ?? [];
    const gadgets: UnlockedUpgrade[] =
      owned?.gadgets.map((g) => ({
        id: g.id,
        name: g.name,
        iconUrl: fanGadgets[slotOf(official.gadgets, g.id) - 1] ?? gadgetIconById.get(g.id),
      })) ?? [];
    const gears: UnlockedUpgrade[] =
      owned?.gears.map((g) => ({
        id: g.id,
        name: g.name,
        iconUrl: fanKitGearUrl(fanKit, g.name, official.name) ?? gearIconUrl(g.id),
      })) ?? [];
    const hyperCharges: UnlockedUpgrade[] =
      owned?.hyperCharges.map((h) => ({ id: h.id, name: h.name, iconUrl: fanKit.hypercharges[kitKey] })) ?? [];

    const merged: MergedBrawler = {
      key,
      id: official.id,
      name: official.name,
      role: resolveRole(official.name),
      rarity: meta?.rarity.name,
      iconUrl: fanKit.portraits[kitKey] ?? meta?.imageUrl2 ?? meta?.imageUrl,
      owned: Boolean(owned),
      power: owned?.power ?? 0,
      rank: owned?.rank ?? 0,
      trophies: owned?.trophies ?? 0,
      highestTrophies: owned?.highestTrophies ?? 0,
      prestigeLevel: owned?.prestigeLevel ?? 0,
      starPowers,
      starPowersTotal: official.starPowers.length,
      gadgets,
      gadgetsTotal: official.gadgets.length,
      gears,
      hyperCharges,
    };
    return merged;
  });
}
