// [AI-ASSISTED] by Hiro, 2026-04-13
// Purpose: cn() helper for merging Tailwind class names safely
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
