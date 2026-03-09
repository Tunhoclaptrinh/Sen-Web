import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const PRERENDER_EVENT_NAME = "prerender-ready";

type PrerenderInjectedPayload = {
  prerender?: boolean;
};

const getPrerenderInjected = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return (window as Window & { __PRERENDER_INJECTED?: PrerenderInjectedPayload })
    .__PRERENDER_INJECTED || null;
};

export const isPrerenderMode = () => Boolean(getPrerenderInjected()?.prerender);

export const notifyPrerenderReady = () => {
  if (typeof document === "undefined") {
    return;
  }

  document.dispatchEvent(new Event(PRERENDER_EVENT_NAME));
};

export const usePrerenderReady = (isReady: boolean, delayMs = 0) => {
  const location = useLocation();

  useEffect(() => {
    if (!isReady || !isPrerenderMode()) {
      return;
    }

    const timer = window.setTimeout(() => {
      notifyPrerenderReady();
    }, Math.max(0, delayMs));

    return () => {
      window.clearTimeout(timer);
    };
  }, [isReady, delayMs, location.pathname]);
};
