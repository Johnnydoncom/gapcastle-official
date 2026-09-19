"use client";

import Script from "next/script";
import { useEffect } from "react";

/*
 * Tawk.to live chat, rendered only by the public site layout — never on /admin.
 *
 * The script loads once, lazily, after the page is idle. Because client-side
 * navigation keeps the same document, the widget is hidden when this component
 * unmounts (for example on the way to /admin) and shown again when the visitor
 * comes back to a public page.
 */

const PROPERTY_ID = "6aa968b6111d593449c1d198";
const WIDGET_ID = "1k2is22qq";

type TawkPosition = { position: "br"; xOffset: number; yOffset: number };

type TawkApi = {
  customStyle?: { visibility: { desktop: TawkPosition; mobile: TawkPosition } };
  onLoad?: () => void;
  showWidget?: () => void;
  hideWidget?: () => void;
};

type TawkWindow = Window & {
  Tawk_API?: TawkApi;
  Tawk_LoadStart?: Date;
  __tawkHidden?: boolean;
};

/**
 * @param clearOfFeedbackButton raise the chat bubble so it sits above the feedback widget's
 * button, which also lives in the bottom-right corner.
 */
export function TawkChat({ clearOfFeedbackButton = false }: { clearOfFeedbackButton?: boolean }) {
  useEffect(() => {
    const w = window as TawkWindow;
    w.Tawk_API ??= {};
    w.Tawk_LoadStart ??= new Date();
    w.__tawkHidden = false;

    // Read by Tawk when its script loads (this effect runs before the lazy script is injected).
    if (clearOfFeedbackButton) {
      w.Tawk_API.customStyle = {
        visibility: {
          desktop: { position: "br", xOffset: 20, yOffset: 84 },
          mobile: { position: "br", xOffset: 12, yOffset: 80 },
        },
      };
    }

    // If the widget finishes loading after the visitor has already left the public site, keep it hidden.
    w.Tawk_API.onLoad = () => {
      if (w.__tawkHidden) w.Tawk_API?.hideWidget?.();
    };
    w.Tawk_API.showWidget?.();

    return () => {
      w.__tawkHidden = true;
      w.Tawk_API?.hideWidget?.();
    };
  }, [clearOfFeedbackButton]);

  // No crossOrigin attribute: it turns the request into a CORS fetch, and embed.tawk.to does not send
  // Access-Control-Allow-Origin for every origin (it was blocked on localhost), so the widget would not load.
  return <Script id="tawk-to" src={`https://embed.tawk.to/${PROPERTY_ID}/${WIDGET_ID}`} strategy="lazyOnload" charSet="UTF-8" />;
}
