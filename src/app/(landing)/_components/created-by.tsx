import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { siteContent } from "@/lib/site-content";

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <ArrowUpRight
      aria-hidden
      strokeWidth={2.25}
      className={cn(
        "shrink-0 opacity-0 -translate-x-1 translate-y-1",
        "transition-all duration-200 ease-out",
        "group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100",
        "group-focus-visible:translate-x-0 group-focus-visible:translate-y-0 group-focus-visible:opacity-100",
        className,
      )}
    />
  );
}

export function CreatedBy() {
  return (
    <section
      id="creators"
      className="relative bg-background px-8 py-16 sm:px-12 md:px-16 lg:py-20"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {siteContent.credits.label}
        </p>
        <ul className="grid w-full grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-8 md:gap-10">
          {siteContent.credits.people.map((credit) => (
            <li key={credit.name} className="flex justify-center">
              <a
                href={credit.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex aspect-square w-full max-w-64 flex-col overflow-hidden rounded-[6px] bg-[#0A0B0E] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] ring-[3px] ring-[#F5F4EE] outline-none"
              >
                <span className="relative mx-[4%] mt-[3.5%] min-h-0 flex-1 overflow-hidden rounded-[3px] bg-[#F5F4EE]">
                  <Image
                    src={credit.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 45vw, 256px"
                    className="object-cover"
                    unoptimized={credit.image.endsWith(".svg")}
                  />
                  <ExternalLinkIcon className="pointer-events-none absolute right-2 top-2 size-5 text-[#0A0B0E] sm:right-2.5 sm:top-2.5 sm:size-6" />
                </span>
                <span className="flex min-h-[22%] shrink-0 items-center justify-center px-2 py-1.5">
                  <span className="text-center text-sm font-black uppercase leading-none tracking-tight text-[#F5F4EE] sm:text-base">
                    {credit.name}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
