"use client";
import { useSyncExternalStore } from "react";
import { todayIST } from "../lib/events";

/**
 * Today's date (campus time) from the browser's clock. It is null while the page is prerendered, because the
 * cached HTML must never bake in "today"; components render without a status until the browser fills it in.
 */
export function useToday() {
  return useSyncExternalStore(
    () => () => {},
    () => todayIST(),
    () => null,
  );
}
