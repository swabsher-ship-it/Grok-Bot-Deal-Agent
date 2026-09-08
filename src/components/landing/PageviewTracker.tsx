"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  captureUtmFromSearch,
  detectDevice,
  getSessionId,
  getVisitorId,
  trackClient,
} from "@/lib/client/analytics";

export default function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Assign visitorId (1yr cookie) + sessionId on first pageview
    getVisitorId();
    getSessionId();
    const utm = captureUtmFromSearch(searchParams);
    trackClient({
      type: "pageview",
      path: pathname,
      referrer: document.referrer || undefined,
      device: detectDevice(),
      utm,
    });
  }, [pathname, searchParams]);

  return null;
}
