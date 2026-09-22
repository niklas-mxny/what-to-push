"use client";

import Image from "next/image";
import { useState } from "react";
import { Zap } from "lucide-react";
import { useT } from "@/lib/i18n";
import type { MergedBrawler, UnlockedUpgrade } from "@/types/domain";

function UpgradeIcon({ item, size = 22 }: { item: UnlockedUpgrade; size?: number }) {
  const [failed, setFailed] = useState(false);
  if (!item.iconUrl || failed) return null;
  return (
    <Image
      src={item.iconUrl}
      alt={item.name}
      title={item.name}
      width={size}
      height={size}
      unoptimized
      onError={() => setFailed(true)}
      className="object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
    />
  );
}

/**
 * Only one Star Power and one Gadget can ever be active in a match at a time —
 * the API tells us which are *unlocked*, not which is currently selected, so
 * showing every unlocked one as if all were equipped is misleading. This shows
 * just the first as a representative icon, with a "+N" badge for the rest
 * (still unlocked, just not implied to be simultaneously active).
 */
function UpgradeSlot({ items, size = 22 }: { items: UnlockedUpgrade[]; size?: number }) {
  if (items.length === 0) return null;
  const extra = items.length - 1;
  return (
    <div className="relative" title={items.map((i) => i.name).join(" / ")}>
      <UpgradeIcon item={items[0]} size={size} />
      {extra > 0 && (
        <span className="absolute -bottom-1 -right-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-background-elevated px-0.5 text-[9px] font-bold leading-none text-muted ring-1 ring-border-strong">
          +{extra}
        </span>
      )}
    </div>
  );
}

/** Icons for this brawler's actually-unlocked upgrades — not a claimed "best" build, just what's really available. Gadget/Star Power show one representative icon each (only one is ever active at once); Gears can all be equipped together. */
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
      <UpgradeSlot items={brawler.gadgets} size={size} />
      <UpgradeSlot items={brawler.starPowers} size={size} />
      {brawler.gears.map((g) => (
        <UpgradeIcon key={`gear-${g.id}`} item={g} size={size} />
      ))}
      {brawler.hyperCharges.length > 0 &&
        (brawler.hyperCharges[0].iconUrl ? (
          <UpgradeIcon
            item={{ ...brawler.hyperCharges[0], name: `${brawler.hyperCharges[0].name} (${t("build.hypercharge")})` }}
            size={size}
          />
        ) : (
          <span
            className="flex items-center justify-center rounded-md bg-accent/20 ring-1 ring-accent/40"
            style={{ width: size, height: size }}
            title={`${brawler.hyperCharges[0].name} (${t("build.hypercharge")})`}
          >
            <Zap className="h-3.5 w-3.5 text-accent" />
          </span>
        ))}
    </div>
  );
}
