"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Site-styled popup on the native <dialog>: the browser handles the focus trap,
 * Escape to close and rendering above everything else. Clicking the backdrop
 * closes it too.
 */
export function Modal({
  open,
  onClose,
  label,
  closeLabel,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  /** Accessible name of the dialog. */
  label: string;
  closeLabel: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Page behind shouldn't scroll while the popup is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-label={label}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      // Browsers only fire `cancel` for some Escape presses (e.g. not without
      // recent user activation), so handle the key directly as well.
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          e.preventDefault();
          onClose();
        }
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        "modal-panel m-auto max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-lg overflow-hidden rounded-card border border-border-strong bg-background-elevated p-0 text-foreground backdrop:bg-black/60 backdrop:backdrop-blur-sm",
        className
      )}
    >
      {open && (
        <div className="relative max-h-[calc(100dvh-2rem)] overflow-y-auto scrollbar-thin">
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="absolute end-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-muted transition-colors hover:bg-white/10 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          {children}
        </div>
      )}
    </dialog>
  );
}
