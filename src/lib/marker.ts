/**
 * Marker.io feedback widget: on for the live production deployment only.
 * Set MARKER_ENABLED=true to load it anywhere else (for example to test locally).
 */
export function markerEnabled() {
  return process.env.VERCEL_ENV === "production" || process.env.MARKER_ENABLED === "true";
}
