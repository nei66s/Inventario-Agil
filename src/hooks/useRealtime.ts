import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useRealtimeStore } from "@/store/use-realtime-store";

const CLOSE_GRACE_MS = 5000;

type RealtimeRuntime = {
  ws: WebSocket | null;
  reconnectTimeout: ReturnType<typeof setTimeout> | null;
  refreshTimeout: ReturnType<typeof setTimeout> | null;
  closeTimeout: ReturnType<typeof setTimeout> | null;
  reconnectAttempts: number;
  subscribers: number;
};

const runtime: RealtimeRuntime = {
  ws: null,
  reconnectTimeout: null,
  refreshTimeout: null,
  closeTimeout: null,
  reconnectAttempts: 0,
  subscribers: 0,
};

let latestRefresh: (() => void) | null = null;

function clearTimer(timer: ReturnType<typeof setTimeout> | null) {
  if (timer) clearTimeout(timer);
}

function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const playTone = (freq: number, start: number, duration: number) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.1, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(start);
      osc.stop(start + duration);
    };
    playTone(660, audioCtx.currentTime, 0.4);
    playTone(880, audioCtx.currentTime + 0.1, 0.4);
  } catch (error) {
    console.warn("[realtime] Fail to play sound:", error);
  }
}

function scheduleReconnect(connect: () => void) {
  clearTimer(runtime.reconnectTimeout);
  const backoff = Math.min(30000, 1000 * Math.pow(1.5, runtime.reconnectAttempts || 0));
  runtime.reconnectAttempts += 1;
  useRealtimeStore.getState().setIsConnected(false);
  useRealtimeStore.getState().setIsConnecting(true);
  console.debug(`[realtime] Scheduled reconnection in ${Math.round(backoff / 1000)}s...`);
  runtime.reconnectTimeout = setTimeout(() => {
    runtime.reconnectTimeout = null;
    connect();
  }, backoff);
}

function connectShared() {
  if (runtime.subscribers <= 0) {
    return;
  }

  const wsUrl = process.env.NEXT_PUBLIC_WS_URL?.trim();

  console.log("[realtime] Attempting to connect to:", wsUrl);

  if (!wsUrl) {
    console.info("[realtime] WebSocket disabled: NEXT_PUBLIC_WS_URL is not configured.");
    useRealtimeStore.getState().setIsConnected(false);
    useRealtimeStore.getState().setIsConnecting(false);
    return;
  }

  if (
    runtime.ws?.readyState === WebSocket.OPEN ||
    runtime.ws?.readyState === WebSocket.CONNECTING
  ) {
    console.log("[realtime] Connection already open or connecting.");
    return;
  }

  clearTimer(runtime.closeTimeout);
  runtime.closeTimeout = null;
  useRealtimeStore.getState().setIsConnecting(true);

  try {
    const ws = new WebSocket(wsUrl);
    runtime.ws = ws;

    ws.onopen = () => {
      if (runtime.ws !== ws) {
        ws.close();
        return;
      }
      console.log("[realtime] Connected successfully to", wsUrl);
      runtime.reconnectAttempts = 0;
      clearTimer(runtime.reconnectTimeout);
      runtime.reconnectTimeout = null;
      useRealtimeStore.getState().setIsConnected(true);
    };

    ws.onmessage = (event) => {
      console.log("[realtime] Message received:", event.data);

      let shouldRefresh = true;

      try {
        const data = JSON.parse(event.data);
        if (data.event === "NOTIFICATION_CREATED") {
          if (!useRealtimeStore.getState().isMuted) {
            playNotificationSound();
          }
          useRealtimeStore.getState().notifyNotification();
          shouldRefresh = false;
        }
      } catch {
        // ignore malformed payloads
      }

      if (!shouldRefresh) {
        return;
      }

      if (document.visibilityState === "visible") {
        clearTimer(runtime.refreshTimeout);
        runtime.refreshTimeout = setTimeout(() => {
          console.log("[realtime] Performing debounced router.refresh()");
          latestRefresh?.();
        }, 2000);
      }
    };

    ws.onclose = (event) => {
      if (runtime.ws === ws) {
        runtime.ws = null;
      }

      if (event.code !== 1000) {
        console.debug("[realtime] WebSocket closed", event.code, event.reason);
      }

      if (runtime.subscribers > 0) {
        scheduleReconnect(connectShared);
        return;
      }

      useRealtimeStore.getState().setIsConnected(false);
      useRealtimeStore.getState().setIsConnecting(false);
    };

    ws.onerror = (error) => {
      console.debug("[realtime] WebSocket error:", error);
      ws.close();
    };
  } catch (error) {
    console.debug("[realtime] Error creating WebSocket:", error);
    if (runtime.subscribers > 0) {
      scheduleReconnect(connectShared);
    }
  }
}

function subscribeRealtime(onRefresh: () => void) {
  latestRefresh = onRefresh;
  runtime.subscribers += 1;
  clearTimer(runtime.closeTimeout);
  runtime.closeTimeout = null;
  connectShared();

  return () => {
    runtime.subscribers = Math.max(0, runtime.subscribers - 1);

    if (runtime.subscribers > 0) {
      return;
    }

    runtime.closeTimeout = setTimeout(() => {
      if (runtime.subscribers > 0) {
        return;
      }

      clearTimer(runtime.reconnectTimeout);
      clearTimer(runtime.refreshTimeout);
      runtime.reconnectTimeout = null;
      runtime.refreshTimeout = null;
      runtime.reconnectAttempts = 0;
      latestRefresh = null;

      if (runtime.ws) {
        const ws = runtime.ws;
        runtime.ws = null;
        ws.close(1000, "listener-unmounted");
      }

      useRealtimeStore.getState().setIsConnected(false);
      useRealtimeStore.getState().setIsConnecting(false);
    }, CLOSE_GRACE_MS);
  };
}

export function useRealtime() {
  const router = useRouter();
  const needsRefreshRef = useRef(false);
  const refreshRef = useRef(() => router.refresh());

  useEffect(() => {
    refreshRef.current = () => router.refresh();
  }, [router]);

  useEffect(() => {
    console.log("[realtime] Hook mounted, preparing shared connection...");

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        needsRefreshRef.current
      ) {
        console.log("[realtime] Visibility changed to visible, performing pending refresh.");
        needsRefreshRef.current = false;
        refreshRef.current();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    const unsubscribe = subscribeRealtime(() => {
      if (document.visibilityState === "visible") {
        refreshRef.current();
      } else {
        console.log("[realtime] App invisible, postponing refresh.");
        needsRefreshRef.current = true;
      }
    });

    return () => {
      console.log("[realtime] Hook unmounting, releasing shared connection.");
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      unsubscribe();
    };
  }, []);
}
