import { type ClassValue, clsx } from "clsx";
import { forwardRef, ForwardRefRenderFunction, PropsWithoutRef } from "react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// forward refs
export function fr<T = HTMLElement, P = React.HTMLAttributes<T>>(
  component: ForwardRefRenderFunction<T, PropsWithoutRef<P>>
) {
  const wrapped = forwardRef(component);
  wrapped.displayName = component.name;
  return wrapped;
}

// Tailwind color class or HEX color
export type TailwindColorClassOrHexColor = "tailwind" | "hex" | "unknown";
export function isTailwindColorClassOrHexColor(
  str: string
): TailwindColorClassOrHexColor {
  const tailwindColorClassPattern = /^[a-z]+-[0-9]{3}$/;
  const hexColorPattern = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;

  if (tailwindColorClassPattern.test(str)) {
    return "tailwind";
  } else if (hexColorPattern.test(str)) {
    return "hex";
  } else {
    return "unknown";
  }
}

export function generateProgressBarBackgroundColorClass(colorString: string) {
  const color = isTailwindColorClassOrHexColor(colorString);
  switch (color) {
    case "tailwind":
      return `[&>*>*]:bg-${colorString}`; // e.g. bg-red-500
    case "hex":
      return `[&>*>*]:bg-[${colorString}]`; // e.g. bg-[#ff0000]
    case "unknown":
      return "[&>*>*]:bg-primany-900"; // shrug emoji
  }
}