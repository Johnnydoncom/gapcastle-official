"use client";

import markerSDK, { type MarkerSdk } from "@marker.io/browser";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/*
 * Marker.io feedback widget. Loaded once per page session from the root layout
 * (public site and admin). Every report carries customData.siteArea
 * ("public" or "admin"); inside the admin, signed-in staff are identified as
 * the reporter and customData.staffRole is added.
 */

const PROJECT_ID = "6aae20e4ca73d0858a9c5c51";

let widget: Promise<MarkerSdk> | null = null;
const customData: Record<string, string> = {};

function loadWidget() {
  widget ??= markerSDK.loadWidget({ project: PROJECT_ID }).catch((error: unknown) => {
    widget = null; // allow a retry on the next call
    console.warn("[marker] widget failed to load:", error instanceof Error ? error.message : error);
    throw error;
  });
  return widget;
}

/** Runs against the widget once it is ready; calls queue in order. */
function withWidget(apply: (sdk: MarkerSdk) => void) {
  loadWidget()
    .then(apply)
    .catch(() => {});
}

/** setCustomData replaces the whole object, so all keys are kept here and sent together. */
function updateCustomData(patch: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) delete customData[key];
    else customData[key] = value;
  }
  const snapshot = { ...customData };
  withWidget((sdk) => sdk.setCustomData(snapshot));
}

export function MarkerWidget() {
  const pathname = usePathname();
  const siteArea = pathname === "/admin" || pathname.startsWith("/admin/") ? "admin" : "public";

  useEffect(() => {
    updateCustomData({ siteArea });
  }, [siteArea]);

  return null;
}

/** Rendered by the signed-in admin layout: pre-fills reports with the staff member's details. */
export function MarkerStaffReporter({ email, fullName, role }: { email: string; fullName: string; role: string }) {
  useEffect(() => {
    withWidget((sdk) => sdk.setReporter({ email, fullName }));
    updateCustomData({ staffRole: role });

    // Leaving the signed-in admin (sign-out, or on to the public site) stops identifying them.
    return () => {
      withWidget((sdk) => sdk.clearReporter());
      updateCustomData({ staffRole: undefined });
    };
  }, [email, fullName, role]);

  return null;
}
