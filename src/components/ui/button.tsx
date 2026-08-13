"use client"

import * as React from "react"
import type { MaybeBaseUIEvent } from "@base-ui/react/internals/types"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const BUTTON_ACCENTS = [
  { color: "var(--btn-red)", foreground: "#fff" },
  { color: "var(--btn-orange)", foreground: "#000" },
  { color: "var(--btn-yellow)", foreground: "#000" },
  { color: "var(--btn-green)", foreground: "#fff" },
  { color: "var(--btn-blue)", foreground: "#fff" },
  { color: "var(--btn-pink)", foreground: "#000" },
  { color: "var(--btn-salmon)", foreground: "#000" },
] as const

const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-transparent bg-clip-padding font-black uppercase whitespace-nowrap transition-[background-color,border-color,color] duration-150 outline-none select-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        filled:
          "bg-white text-black hover:bg-[var(--btn-accent)] hover:text-[var(--btn-accent-fg)] active:bg-[color-mix(in_oklab,white_82%,black)] hover:active:bg-[color-mix(in_oklab,var(--btn-accent)_72%,black)]",
        outline:
          "border-2 border-white bg-black text-white hover:border-[var(--btn-accent)] hover:bg-[color-mix(in_oklab,var(--btn-accent)_18%,transparent)] hover:text-[var(--btn-accent)] active:bg-[color-mix(in_oklab,black_90%,white)] hover:active:bg-[color-mix(in_oklab,var(--btn-accent)_32%,black)]",
      },
      size: {
        sm: "h-10 gap-1.5 px-5 text-sm has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        default:
          "h-12 gap-2 px-6 text-base has-data-[icon=inline-end]:pr-5 has-data-[icon=inline-start]:pl-5",
        lg: "h-14 gap-2.5 px-8 text-2xl tracking-tight has-data-[icon=inline-end]:pr-6 has-data-[icon=inline-start]:pl-6",
        icon: "size-12",
        "icon-sm": "size-10 [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-14",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "default",
    },
  }
)

type ButtonAccent = (typeof BUTTON_ACCENTS)[number]

function pickAccent(previous?: ButtonAccent): ButtonAccent {
  const count = BUTTON_ACCENTS.length as number
  if (count === 1) return BUTTON_ACCENTS[0]
  let next = BUTTON_ACCENTS[Math.floor(Math.random() * count)]
  while (next === previous) {
    next = BUTTON_ACCENTS[Math.floor(Math.random() * count)]
  }
  return next
}

function Button({
  className,
  variant = "filled",
  size = "default",
  style,
  onMouseEnter,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  const accentRef = React.useRef<ButtonAccent>(BUTTON_ACCENTS[0])
  const [accent, setAccent] = React.useState<ButtonAccent>(BUTTON_ACCENTS[0])

  const handleMouseEnter = (event: MaybeBaseUIEvent<React.MouseEvent<HTMLButtonElement>>) => {
    const next = pickAccent(accentRef.current)
    accentRef.current = next
    setAccent(next)
    onMouseEnter?.(event as never)
  }

  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
      style={{
        ...style,
        ["--btn-accent" as string]: accent.color,
        ["--btn-accent-fg" as string]: accent.foreground,
      }}
      onMouseEnter={handleMouseEnter}
    />
  )
}

export { Button, buttonVariants }
