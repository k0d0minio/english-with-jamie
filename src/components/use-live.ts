"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { LiveSnapshot } from "@/lib/live";

/** Polls /api/live and only re-renders when the teacher's version changes. */
export function useLive(initial: LiveSnapshot, intervalMs = 1500) {
  const [snap, setSnap] = useState(initial);
  const [offline, setOffline] = useState(false);
  const versionRef = useRef(initial.version);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/live", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const next = (await res.json()) as LiveSnapshot;
      setOffline(false);
      if (next.version !== versionRef.current) {
        versionRef.current = next.version;
        setSnap(next);
      }
    } catch {
      setOffline(true);
    }
  }, []);

  useEffect(() => {
    const id = setInterval(refresh, intervalMs);
    const onVis = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [refresh, intervalMs]);

  return { snap, offline, refresh };
}
