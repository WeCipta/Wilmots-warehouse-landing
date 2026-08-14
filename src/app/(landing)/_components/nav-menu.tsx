"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { GridOverlay } from "@/components/grid-overlay";
import { useGridMetrics } from "@/hooks/use-grid-metrics";
import { useRandomAccent } from "@/hooks/use-random-accent";
import { siteContent } from "@/lib/site-content";

const NAV_LINKS = siteContent.nav.links;
const PRODUCT = siteContent.nav.product;
const CREDITS = siteContent.credits;

function isExternalHref(href: string, external?: boolean) {
  return external ?? href.startsWith("http");
}

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

function CreditName({ name, href }: { name: string; href?: string }) {
  const { color, randomize, clear } = useRandomAccent();
  const className =
    "group inline-flex items-center gap-1 text-base font-semibold tracking-tight text-foreground sm:text-lg";
  const hoverProps = {
    onPointerEnter: randomize,
    onPointerLeave: clear,
    style: { color, transition: "color 150ms ease" } as const,
  };

  const content = (
    <>
      {name}
      <ExternalLinkIcon className="size-[0.9em]" />
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        {...hoverProps}
      >
        {content}
      </a>
    );
  }

  return (
    <span className={className} {...hoverProps}>
      {content}
    </span>
  );
}

function NavLink({
  label,
  href,
  external,
  open,
  index,
  onNavigate,
}: {
  label: string;
  href: string;
  external?: boolean;
  open: boolean;
  index: number;
  onNavigate: () => void;
}) {
  const isExternal = isExternalHref(href, external);
  const { color, randomize, clear } = useRandomAccent();

  return (
    <a
      href={href}
      onClick={onNavigate}
      onPointerEnter={randomize}
      onPointerLeave={clear}
      {...(isExternal
        ? { target: "_blank", rel: "noopener noreferrer" }
        : undefined)}
      className="relative w-fit whitespace-nowrap font-black uppercase tracking-tight text-4xl text-foreground/70 sm:text-6xl"
      style={{
        color,
        opacity: open ? 1 : 0,
        transform: open ? "translateY(0)" : "translateY(12px)",
        transition: `opacity 250ms ${index * 50 + 100}ms ease-out, transform 250ms ${index * 50 + 100}ms ease-out, color 150ms ease`,
      }}
    >
      {label}
    </a>
  );
}

function ProductImage({
  src,
  className,
  sizes,
  priority,
}: {
  src: string;
  className?: string;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <span className={cn("relative block overflow-hidden", className)}>
      <Image
        src={src}
        alt="Wilmot's Warehouse — order on CMYK"
        fill
        sizes={sizes}
        className="object-cover"
        unoptimized
        priority={priority}
      />
    </span>
  );
}

function Credits({ open }: { open: boolean }) {
  return (
    <div
      className="flex flex-wrap gap-x-16 gap-y-8"
      style={{
        opacity: open ? 1 : 0,
        transform: open ? "translateY(0)" : "translateY(12px)",
        transition: `opacity 250ms ${NAV_LINKS.length * 50 + 150}ms ease-out, transform 250ms ${NAV_LINKS.length * 50 + 150}ms ease-out`,
      }}
    >
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Creators
        </p>
        <ul className="flex flex-col gap-1">
          {CREDITS.creators.map((creator) => (
            <li key={creator.name}>
              <CreditName name={creator.name} href={creator.href} />
            </li>
          ))}
        </ul>
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Publisher
        </p>
        <CreditName
          name={CREDITS.publisher.name}
          href={CREDITS.publisher.href}
        />
      </div>
    </div>
  );
}

export function NavMenu({
  open,
  onNavigate,
}: {
  open: boolean;
  onNavigate: () => void;
}) {
  const grid = useGridMetrics();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-40 flex flex-col transition-all duration-300 ease-in-out",
        open
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none",
      )}
    >
      <div className="absolute inset-0 bg-background">
        <GridOverlay
          aria-hidden="true"
          cols={grid.cols}
          rows={grid.rows}
          cell={grid.cellPx}
        />
      </div>

      <div className="relative z-10 h-full overflow-hidden pt-(--grid-cell) lg:overflow-y-auto lg:p-(--grid-cell)">
        <div className="flex h-full flex-col gap-10 overflow-hidden border border-white/20 bg-background px-5 pt-6 lg:grid lg:min-h-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.45fr)] lg:gap-(--grid-cell) lg:overflow-visible lg:p-8">
          <a
            href={siteContent.orderUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Order Wilmot's Warehouse on CMYK"
            onClick={onNavigate}
            className="group relative order-last block w-full shrink-0 lg:order-0 lg:h-full lg:min-h-0 lg:shrink"
          >
            <ProductImage
              src={PRODUCT.portrait}
              sizes="50vw"
              className="hidden h-full w-full lg:block"
              priority={open}
            />
            <ProductImage
              src={PRODUCT.landscape}
              sizes="100vw"
              className="aspect-3/2 w-full lg:hidden"
            />
            <ExternalLinkIcon className="pointer-events-none absolute right-3 top-3 size-7 text-white drop-shadow-md lg:top-auto lg:right-4 lg:bottom-4 lg:size-10" />
          </a>

          <div className="flex shrink-0 flex-col justify-center gap-12 lg:min-h-0 lg:shrink">
            <nav
              aria-label="Primary navigation"
              className="flex flex-col gap-1 sm:gap-2"
            >
              {NAV_LINKS.map((link, i) => (
                <NavLink
                  key={link.href}
                  {...link}
                  open={open}
                  index={i}
                  onNavigate={onNavigate}
                />
              ))}
            </nav>

            <Credits open={open} />
          </div>
        </div>
      </div>
    </div>
  );
}
