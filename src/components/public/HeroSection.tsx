"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { site } from "@/lib/site";

export default function HeroSection() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["tanggap", "peduli", "terlatih", "sigap", "berani"],
    [],
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTitleNumber((prev) => (prev === titles.length - 1 ? 0 : prev + 1));
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <section className="relative w-full overflow-hidden bg-pmr-white">
      {/* Aksen latar — kontur warna PMR */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-pmr-red/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 h-112 w-md rounded-full bg-pmr-red/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-6 py-12 lg:py-20">
          <div className="flex flex-col items-center gap-4">
            <h1 className="max-w-3xl text-center text-5xl font-normal tracking-tighter text-pmr-dark md:text-7xl">
              <span className="text-pmr-dark">Bersama PMR, jadi generasi yang</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => {
                  const isActive = titleNumber === index;
                  const isPast = titleNumber > index;
                  return (
                    <span
                      key={title}
                      aria-hidden={!isActive}
                      className="absolute font-semibold text-pmr-red transition-all duration-500 ease-out"
                      style={{
                        opacity: isActive ? 1 : 0,
                        transform: `translateY(${
                          isActive ? "0px" : isPast ? "-120px" : "120px"
                        })`,
                      }}
                    >
                      {title}
                    </span>
                  );
                })}
              </span>
            </h1>

            <p className="max-w-2xl text-center text-lg leading-relaxed tracking-tight text-pmr-dark/70 md:text-xl">
              {site.nama} adalah wadah siswa belajar kemanusiaan, pertolongan
              pertama, dan kepemimpinan. Lewat pelatihan rutin dan bakti sosial,
              kami menyiapkan relawan muda yang siap menolong di sekolah maupun
              masyarakat.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" variant="outline" className="gap-4" asChild>
              <Link href="/kegiatan">
                Lihat kegiatan
                <CalendarDays className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" className="gap-4" asChild>
              <Link href="/daftar">
                Daftar sekarang
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
