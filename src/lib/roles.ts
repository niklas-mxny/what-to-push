import type { BrawlerRole } from "@/types/domain";

/**
 * Offizielle Klasse jedes Brawlers aus dem Spiel (Quelle: Kategorien "Tank Brawlers",
 * "Damage Dealer Brawlers" usw. im Brawl Stars Wiki — weder die Supercell API noch
 * BrawlAPI liefern die Klasse). Keys sind die Namen aus der offiziellen API.
 * Neue Brawler fallen bis zum Eintrag hier auf "Unknown" zurück und werden in der
 * Empfehlungs-Engine neutral gewichtet, statt geraten zu werden.
 */
export const BRAWLER_ROLES: Record<string, BrawlerRole> = {
  // Tank
  ASH: "Tank",
  BIBI: "Tank",
  BOLT: "Tank",
  BULL: "Tank",
  BUSTER: "Tank",
  DAMIAN: "Tank",
  DARRYL: "Tank",
  DRACO: "Tank",
  "EL PRIMO": "Tank",
  FRANK: "Tank",
  HANK: "Tank",
  JACKY: "Tank",
  MEG: "Tank",
  OLLIE: "Tank",
  ROSA: "Tank",
  TRUNK: "Tank",

  // Damage Dealer
  "8-BIT": "DamageDealer",
  CARL: "DamageDealer",
  CHESTER: "DamageDealer",
  CLANCY: "DamageDealer",
  COLETTE: "DamageDealer",
  COLT: "DamageDealer",
  EVE: "DamageDealer",
  LOLA: "DamageDealer",
  LUMI: "DamageDealer",
  MINA: "DamageDealer",
  MOE: "DamageDealer",
  NAJIA: "DamageDealer",
  NITA: "DamageDealer",
  PEARL: "DamageDealer",
  "R-T": "DamageDealer",
  RICO: "DamageDealer",
  SHELLY: "DamageDealer",
  SPIKE: "DamageDealer",
  SURGE: "DamageDealer",
  TARA: "DamageDealer",
  VINCE: "DamageDealer",

  // Marksman
  ANGELO: "Marksman",
  BEA: "Marksman",
  BELLE: "Marksman",
  BONNIE: "Marksman",
  BROCK: "Marksman",
  JANET: "Marksman",
  MAISIE: "Marksman",
  MANDY: "Marksman",
  NANI: "Marksman",
  PIERCE: "Marksman",
  PIPER: "Marksman",

  // Artillery
  BARLEY: "Artillery",
  DYNAMIKE: "Artillery",
  GROM: "Artillery",
  JUJU: "Artillery",
  "LARRY & LAWRIE": "Artillery",
  SPROUT: "Artillery",
  TICK: "Artillery",

  // Assassin
  ALLI: "Assassin",
  BUZZ: "Assassin",
  CORDELIUS: "Assassin",
  CROW: "Assassin",
  EDGAR: "Assassin",
  FANG: "Assassin",
  GIGI: "Assassin",
  KAZE: "Assassin",
  KENJI: "Assassin",
  LEON: "Assassin",
  LILY: "Assassin",
  MELODIE: "Assassin",
  MICO: "Assassin",
  MORTIS: "Assassin",
  NORI: "Assassin",
  SAM: "Assassin",
  SHADE: "Assassin",
  "STARR NOVA": "Assassin",
  STU: "Assassin",

  // Support
  BERRY: "Support",
  BYRON: "Support",
  DOUG: "Support",
  GLOWY: "Support",
  GRAY: "Support",
  GUS: "Support",
  "JAE-YONG": "Support",
  KIT: "Support",
  MAX: "Support",
  PAM: "Support",
  POCO: "Support",
  RUFFS: "Support",
  WENDY: "Support",

  // Controller
  AMBER: "Controller",
  BO: "Controller",
  CHARLIE: "Controller",
  CHUCK: "Controller",
  COSMO: "Controller",
  EMZ: "Controller",
  FINX: "Controller",
  GALE: "Controller",
  GENE: "Controller",
  GRIFF: "Controller",
  JESSIE: "Controller",
  LOU: "Controller",
  MEEPLE: "Controller",
  "MR. P": "Controller",
  OTIS: "Controller",
  PENNY: "Controller",
  SANDY: "Controller",
  SIRIUS: "Controller",
  SQUEAK: "Controller",
  WILLOW: "Controller",
  ZIGGY: "Controller",
};

export function resolveRole(name: string): BrawlerRole {
  return BRAWLER_ROLES[name.trim().toUpperCase()] ?? "Unknown";
}
