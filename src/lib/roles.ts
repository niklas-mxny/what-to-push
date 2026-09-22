import type { BrawlerRole } from "@/types/domain";

/**
 * Starter-Set bekannter, eindeutiger Brawler-Rollen (offizielle Klassen aus dem Spiel).
 * Nicht gelistete Brawler (v.a. sehr neue) fallen auf "Unknown" zurück und werden
 * in der Empfehlungs-Engine neutral gewichtet, statt geraten zu werden.
 *
 * Erweiterbar: einfach weitere "NAME": "Rolle" Zeilen ergänzen.
 */
export const BRAWLER_ROLES: Record<string, BrawlerRole> = {
  // Tank
  "EL PRIMO": "Tank",
  FRANK: "Tank",
  ROSA: "Tank",
  BULL: "Tank",
  DARRYL: "Tank",
  ASH: "Tank",
  BUSTER: "Tank",
  JACKY: "Tank",
  MEG: "Tank",

  // Damage Dealer
  SHELLY: "DamageDealer",
  COLT: "DamageDealer",
  RICO: "DamageDealer",
  CARL: "DamageDealer",
  COLETTE: "DamageDealer",
  "8-BIT": "DamageDealer",

  // Marksman
  PIPER: "Marksman",
  BROCK: "Marksman",
  BEA: "Marksman",
  MANDY: "Marksman",
  BELLE: "Marksman",
  BONNIE: "Marksman",

  // Artillery
  BARLEY: "Artillery",
  DYNAMIKE: "Artillery",
  TICK: "Artillery",
  SPROUT: "Artillery",
  "LARRY & LAWRIE": "Artillery",
  GROM: "Artillery",

  // Assassin
  MORTIS: "Assassin",
  CROW: "Assassin",
  LEON: "Assassin",
  EDGAR: "Assassin",
  BUZZ: "Assassin",
  FANG: "Assassin",
  KENJI: "Assassin",

  // Support
  POCO: "Support",
  PAM: "Support",
  BYRON: "Support",
  GUS: "Support",
  RUFFS: "Support",
  BERRY: "Support",

  // Controller
  JESSIE: "Controller",
  GENE: "Controller",
  SANDY: "Controller",
  CHARLIE: "Controller",
  EMZ: "Controller",
  SQUEAK: "Controller",
};

export function resolveRole(name: string): BrawlerRole {
  return BRAWLER_ROLES[name.trim().toUpperCase()] ?? "Unknown";
}
