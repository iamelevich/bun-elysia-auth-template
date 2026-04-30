import type { IconifyIconName } from "@iconify/react";

/**
 * Convert an IconifyIconName to a string
 * @param icon - The IconifyIconName to convert
 * @returns The icon string
 */
export function iconifyIconToString(icon: IconifyIconName): string {
  return [icon.provider, icon.prefix, icon.name].filter(Boolean).join(":");
}
