import Link from "next/link";

import MobileNav from "@/components/public/MobileNav";
import { navLinks, site } from "@/lib/site";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-pmr-gray bg-pmr-white/90 backdrop-blur">
      <nav
        aria-label="Navigasi utama"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label={`Beranda ${site.nama}`}
        >
          <span
            aria-hidden
            className="flex h-9 w-9 items-center justify-center rounded-full bg-pmr-red text-pmr-white font-bold"
          >
            +
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-pmr-dark">
              {site.nama}
            </span>
            <span className="text-xs text-pmr-dark/60">
              Tingkat {site.tingkat}
            </span>
          </span>
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-pmr-dark/80 transition-colors hover:bg-pmr-gray hover:text-pmr-red"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/daftar"
            className="hidden items-center rounded-full bg-pmr-red px-4 py-2 text-sm font-semibold text-pmr-white shadow-sm transition-colors hover:bg-pmr-red-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pmr-red md:inline-flex"
          >
            Daftar
          </Link>
          <MobileNav />
        </div>
      </nav>
    </header>
  );
}
