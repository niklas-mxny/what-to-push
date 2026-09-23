"use client";

import { AbilityIcon, type AbilityKind } from "@/components/AbilityIcon";
import { GameIcon } from "@/components/GameIcon";
import { useT } from "@/lib/i18n";
import type { MergedBrawler, UnlockedUpgrade } from "@/types/domain";

const ICON_SHADOW = "drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]";

/**
 * Only one Star Power and one Gadget can ever be active in a match at a time —
 * the API tells us which are *unlocked*, not which is currently selected, so
 * showing every unlocked one as if all were equipped is misleading. This shows
 * just the first as a representative icon, with a "+N" badge for the rest
 * (still unlocked, just not implied to be simultaneously active).
 */
function UpgradeSlot({
  kind,
  items,
  size,
  title,
}: {
  kind: AbilityKind;
  items: UnlockedUpgrade[];
  size: number;
  title?: string;
}) {
  if (items.length === 0) return null;
  const extra = items.length - 1;
  return (
    <span className="relative flex shrink-0" title={title ?? items.map((i) => i.name).join(" / ")}>
      <AbilityIcon
        kind={kind}
        src={items[0].iconUrl}
        framed={items[0].framed}
        alt={items[0].name}
        size={size}
        className={ICON_SHADOW}
      />
      {extra > 0 && (
        <span className="absolute -bottom-1 -end-1 flex h-3 min-w-3 items-center justify-center rounded-full bg-background-elevated px-0.5 text-[8px] font-bold leading-none text-muted ring-1 ring-border-strong">
          +{extra}
        </span>
      )}
    </span>
  );
}

/** Icons for this brawler's actually-unlocked upgrades — not a claimed "best" build, just what's really available. Gadget/Star Power show one representative icon each (only one is ever active at once); Gears can all be equipped together. Every icon gets the same size×size box so they line up regardless of each artwork's proportions. */
export function BuildIcons({ brawler, size = 22 }: { brawler: MergedBrawler; size?: number }) {
  const t = useT();
  if (!brawler.owned) return null;
  const hasAny =
    brawler.gadgets.length > 0 ||
    brawler.starPowers.length > 0 ||
    brawler.gears.length > 0 ||
    brawler.hyperCharges.length > 0;
  if (!hasAny) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <UpgradeSlot kind="gadget" items={brawler.gadgets} size={size} />
      <UpgradeSlot kind="starPower" items={brawler.starPowers} size={size} />
      {brawler.gears.map((g) => (
        <span key={`gear-${g.id}`} className="flex shrink-0" title={g.name}>
          <GameIcon src={g.iconUrl} alt={g.name} size={size} className={ICON_SHADOW} />
        </span>
      ))}
      <UpgradeSlot
        kind="hypercharge"
        items={brawler.hyperCharges}
        size={size}
        title={brawler.hyperCharges[0] && `${brawler.hyperCharges[0].name} (${t("build.hypercharge")})`}
      />
    </div>
  );
}
