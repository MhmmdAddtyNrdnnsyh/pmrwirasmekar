"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";

import { navLinks, site } from "@/lib/site";
import { cn } from "@/lib/utils";

const subscribeToHydration = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot,
  );
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Lock body scroll + focus tombol close + tangani Escape saat drawer terbuka
  useEffect(() => {
    if (!open) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const drawer = (
    <div
      // Render di <body> via portal supaya tidak ter-constraint oleh
      // containing block header (yang dibuat oleh backdrop-filter).
      className={cn(
        "fixed inset-0 z-50 md:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={() => setOpen(false)}
        className={cn(
          "absolute inset-0 bg-pmr-dark/50 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
      />

      <div
        id="mobile-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu navigasi"
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-xs flex-col bg-pmr-white shadow-xl transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-pmr-gray px-4 py-3">
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2"
            aria-label={`Beranda ${site.nama}`}
          >
            <span
              aria-hidden
              className="flex h-8 w-8 items-center justify-center rounded-full bg-pmr-red text-pmr-white font-bold"
            >
              +
            </span>
            <span className="text-sm font-semibold text-pmr-dark">
              {site.nama}
            </span>
          </Link>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Tutup menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-pmr-dark transition-colors hover:bg-pmr-gray hover:text-pmr-red"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <nav aria-label="Navigasi mobile" className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(`${link.href}/`));
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-pmr-red text-pmr-white"
                        : "text-pmr-dark/80 hover:bg-pmr-gray hover:text-pmr-red",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-pmr-gray p-4">
          <Link
            href="/daftar"
            onClick={() => setOpen(false)}
            className="inline-flex w-full items-center justify-center rounded-full bg-pmr-red px-4 py-2.5 text-sm font-semibold text-pmr-white transition-colors hover:bg-pmr-red-dark"
          >
            Daftar Anggota
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buka menu navigasi"
        aria-expanded={open}
        aria-controls="mobile-nav-drawer"
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-pmr-dark transition-colors hover:bg-pmr-gray hover:text-pmr-red md:hidden"
      >
        <Menu className="h-5 w-5" aria-hidden />
      </button>

      {mounted ? createPortal(drawer, document.body) : null}
    </>
  );
}
