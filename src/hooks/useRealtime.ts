"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function useRealtime() {
    const router = useRouter();
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const needsRefreshRef = useRef(false);

    useEffect(() => {
        let isMounted = true;

        const handleVisibilityChange = () => {
            if (
                document.visibilityState === "visible" &&
                needsRefreshRef.current
            ) {
                needsRefreshRef.current = false;
                router.refresh();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        function connect() {
            if (!isMounted) return;

            const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
            if (!wsUrl) return;

            if (
                wsRef.current?.readyState === WebSocket.OPEN ||
                wsRef.current?.readyState === WebSocket.CONNECTING
            ) {
                return;
            }

            try {
                const ws = new WebSocket(wsUrl);
                wsRef.current = ws;

                ws.onopen = () => {
                    if (reconnectTimeoutRef.current) {
                        clearTimeout(reconnectTimeoutRef.current);
                        reconnectTimeoutRef.current = null;
                    }
                };

                ws.onmessage = () => {
                    if (document.visibilityState === "visible") {
                        router.refresh();
                    } else {
                        needsRefreshRef.current = true;
                    }
                };

                ws.onclose = () => {
                    wsRef.current = null;

                    if (isMounted) {
                        reconnectTimeoutRef.current = setTimeout(connect, 3000);
                    }
                };

                ws.onerror = () => {
                    ws.close();
                };
            } catch {
                if (isMounted) {
                    reconnectTimeoutRef.current = setTimeout(connect, 3000);
                }
            }
        }

        connect();

        return () => {
            isMounted = false;

            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );

            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }

            wsRef.current?.close();
            wsRef.current = null;
        };
    }, [router]);
}
