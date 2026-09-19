import Script from "next/script";

/**
 * ReviseFlow feedback widget: on the live production deployment only.
 * Set FEEDBACK_WIDGET_ENABLED=true to load it anywhere else (for example to test locally).
 */
export function feedbackWidgetEnabled() {
  return process.env.VERCEL_ENV === "production" || process.env.FEEDBACK_WIDGET_ENABLED === "true";
}

/** ReviseFlow feedback widget — rendered by the root layout, so it shows on the public site and in the admin. */
export function FeedbackWidget() {
  if (!feedbackWidgetEnabled()) return null;

  return (
    <Script
      id="reviseflow-widget"
      src="https://reviseflow.io/widget/bundle.js"
      strategy="afterInteractive"
      data-api-base-url="https://reviseflow.io"
      data-widget-token="4a3822ef21347c3bdcfd06769cc242baf423f8a2efa4ef7f"
      data-show-branding-credit="1"
    />
  );
}
