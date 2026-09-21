import { useSyncExternalStore } from "react";

export type CockpitViewport = "desktop" | "tablet" | "mobile";

const mobileQuery = "(max-width: 720px)";
const tabletQuery = "(max-width: 1179px)";

function currentViewport(): CockpitViewport {
  if (window.matchMedia(mobileQuery).matches) return "mobile";
  if (window.matchMedia(tabletQuery).matches) return "tablet";
  return "desktop";
}

function subscribe(onChange: () => void) {
  const mobile = window.matchMedia(mobileQuery);
  const tablet = window.matchMedia(tabletQuery);
  mobile.addEventListener("change", onChange);
  tablet.addEventListener("change", onChange);
  return () => {
    mobile.removeEventListener("change", onChange);
    tablet.removeEventListener("change", onChange);
  };
}

export function useCockpitViewport(): CockpitViewport {
  return useSyncExternalStore(subscribe, currentViewport, () => "desktop");
}
