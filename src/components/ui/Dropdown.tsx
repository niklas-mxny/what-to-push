"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

const ITEM_SELECTOR = "[data-dropdown-item]";

/**
 * Site-styled dropdown: a trigger button plus a floating neon panel. Closes on
 * outside click, Escape, or when an item calls `close`; arrow keys move
 * between items. Children get `close` so items can dismiss the menu.
 */
export function Dropdown({
  trigger,
  label,
  align = "start",
  className,
  triggerClassName,
  panelClassName,
  children,
}: {
  trigger: ReactNode;
  /** Accessible name for the trigger. */
  label: string;
  align?: "start" | "end";
  className?: string;
  triggerClassName?: string;
  panelClassName?: string;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    // Start keyboard users on the selected item (or the first one).
    const items = panelRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR);
    const active = panelRef.current?.querySelector<HTMLElement>(`${ITEM_SELECTOR}[aria-checked="true"]`);
    (active ?? items?.[0])?.focus({ preventScroll: true });
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // `align` is the preferred side; if the panel would spill off-screen there
  // (e.g. a trigger that wraps to the other side on phones), flip it.
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;
    const margin = 8;
    const rect = panel.getBoundingClientRect();
    if (rect.right > window.innerWidth - margin) {
      panel.style.left = "auto";
      panel.style.right = "0px";
    } else if (rect.left < margin) {
      panel.style.left = "0px";
      panel.style.right = "auto";
    }
  }, [open]);

  function close() {
    setOpen(false);
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
      return;
    }
    if (e.key === "Tab" && open) {
      setOpen(false);
      return;
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    if (!open) {
      setOpen(true);
      return;
    }
    const items = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(ITEM_SELECTOR) ?? []);
    if (items.length === 0) return;
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next = e.key === "ArrowDown" ? (index + 1) % items.length : (index - 1 + items.length) % items.length;
    items[next]?.focus();
  }

  return (
    <div ref={rootRef} className={cn("relative", className)} onKeyDown={onKeyDown}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((o) => !o)}
        className={cn("group/trigger", triggerClassName)}
      >
        {trigger}
      </button>
      {open && (
        <div
          ref={panelRef}
          id={panelId}
          role="menu"
          aria-label={label}
          className={cn(
            "dropdown-panel absolute top-full z-50 mt-2 min-w-52 rounded-card border border-border-strong bg-background-elevated/95 p-1.5 backdrop-blur-md",
            align === "end" ? "end-0" : "start-0",
            panelClassName
          )}
        >
          {children(close)}
        </div>
      )}
    </div>
  );
}

const itemClassName =
  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm text-muted outline-none transition-colors hover:bg-primary/15 hover:text-foreground focus-visible:bg-primary/15 focus-visible:text-foreground";

/** A selectable option — shows a check when `selected`. */
export function DropdownOption({
  selected,
  onSelect,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={selected}
      data-dropdown-item
      onClick={onSelect}
      className={cn(itemClassName, selected && "bg-primary/10 font-medium text-foreground")}
    >
      <span className="min-w-0 flex-1">{children}</span>
      {selected && <Check className="h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />}
    </button>
  );
}

/** A navigation entry inside a dropdown. */
export function DropdownLink({
  href,
  onNavigate,
  className,
  children,
}: {
  href: string;
  onNavigate: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} role="menuitem" data-dropdown-item onClick={onNavigate} className={cn(itemClassName, className)}>
      {children}
    </Link>
  );
}
