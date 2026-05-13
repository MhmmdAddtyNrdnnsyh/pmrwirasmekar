import Link from "next/link";
import { navLinks, site } from "@/lib/site";

export default function Footer() {
  const tahun = new Date().getFullYear();

  return (
    <footer className="border-t border-pmr-gray bg-pmr-dark text-pmr-white/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-9 w-9 items-center justify-center rounded-full bg-pmr-red text-pmr-white font-bold"
            >
              +
            </span>
            <span className="font-semibold text-pmr-white">{site.nama}</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed">{site.deskripsiSingkat}</p>
          <p className="mt-4 text-xs text-pmr-white/60">
            &ldquo;{site.tagline}&rdquo;
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-pmr-white">Navigasi</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors hover:text-pmr-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-pmr-white">Markas</h2>
          <address className="mt-4 space-y-2 text-sm not-italic">
            <p>{site.markas}</p>
            <p>Berdiri sejak {site.tahunBerdiri}</p>
          </address>
        </div>
      </div>

      <div className="border-t border-pmr-white/10">
        <p className="mx-auto max-w-6xl px-4 py-5 text-center text-xs text-pmr-white/60 sm:px-6 lg:px-8">
          &copy; {tahun} {site.nama}. Semua hak dilindungi.
        </p>
      </div>
    </footer>
  );
}
