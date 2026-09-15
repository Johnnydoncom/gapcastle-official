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

type TawkApi = {
  onLoad?: () => void;
  showWidget?: () => void;
  hideWidget?: () => void;
};

type TawkWindow = Window & {
  Tawk_API?: TawkApi;
  Tawk_LoadStart?: Date;
  __tawkHidden?: boolean;
};

export function TawkChat() {
  useEffect(() => {
    const w = window as TawkWindow;
    w.Tawk_API ??= {};
    w.Tawk_LoadStart ??= new Date();
    w.__tawkHidden = false;

    // If the widget finishes loading after the visitor has already left the public site, keep it hidden.
    w.Tawk_API.onLoad = () => {
      if (w.__tawkHidden) w.Tawk_API?.hideWidget?.();
    };
    w.Tawk_API.showWidget?.();

    return () => {
      w.__tawkHidden = true;
      w.Tawk_API?.hideWidget?.();
    };
  }, []);

  // No crossOrigin attribute: it turns the request into a CORS fetch, and embed.tawk.to does not send
  // Access-Control-Allow-Origin for every origin (it was blocked on localhost), so the widget would not load.
  return <Script id="tawk-to" src={`https://embed.tawk.to/${PROPERTY_ID}/${WIDGET_ID}`} strategy="lazyOnload" charSet="UTF-8" />;
}
