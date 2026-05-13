"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Newspaper,
  Calendar,
  Users,
  ClipboardList,
  LogOut,
  ExternalLink,
} from "lucide-react";

import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

const adminNav: {
  href: string;
  label: string;
  Icon: typeof LayoutDashboard;
  exact?: boolean;
}[] = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/admin/artikel", label: "Artikel", Icon: Newspaper },
  { href: "/admin/kegiatan", label: "Kegiatan", Icon: Calendar },
  { href: "/admin/pengurus", label: "Pengurus", Icon: Users },
  {
    href: "/admin/pendaftaran",
    label: "Pendaftaran",
    Icon: ClipboardList,
  },
];

type Props = {
  username: string;
  onLogout: () => void;
};

export default function Sidebar({ username, onLogout }: Props) {
  const pathname = usePathname();

  return (
    <aside className="flex w-full flex-col border-r border-pmr-gray bg-pmr-white md:h-screen md:w-64 md:sticky md:top-0">
      <div className="flex items-center gap-3 border-b border-pmr-gray px-5 py-4">
        <span
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-full bg-pmr-red text-pmr-white font-bold"
        >
          +
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-pmr-dark">
            {site.nama}
          </span>
          <span className="text-xs text-pmr-dark/60">Panel Admin</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin">
        <ul className="space-y-1">
          {adminNav.map(({ href, label, Icon, exact }) => {
            const isActive = exact
              ? pathname === href
              : pathname === href || pathname.startsWith(`${href}/`);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-pmr-red text-pmr-white"
                      : "text-pmr-dark/80 hover:bg-pmr-gray hover:text-pmr-red",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 border-t border-pmr-gray pt-4">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-pmr-dark/70 transition-colors hover:bg-pmr-gray hover:text-pmr-red"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            Lihat situs publik
          </Link>
        </div>
      </nav>

      <div className="border-t border-pmr-gray p-3">
        <div className="flex items-center gap-3 rounded-lg bg-pmr-gray/50 p-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-pmr-red/10 text-sm font-semibold text-pmr-red">
            {username.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-pmr-dark">
              {username}
            </p>
            <p className="text-xs text-pmr-dark/60">Administrator</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-pmr-dark/60 transition-colors hover:bg-pmr-red/10 hover:text-pmr-red"
            aria-label="Keluar"
            title="Keluar"
          >
            <LogOut className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>
    </aside>
  );
}
