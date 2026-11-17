"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getAccessToken } from "@/lib/token";
import { useAuth } from "./AuthContext";
import type { AppNotification } from "@/types";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000";

interface SocketValue {
  socket: Socket | null;
  connected: boolean;
}
const SocketContext = createContext<SocketValue>({ socket: null, connected: false });

/** Keeps one Socket.IO connection open while someone is signed in and turns pushed notifications into toasts. */
export function SocketProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    const s = io(SOCKET_URL, {
      // A fresh token is requested on every (re)connect, so expiring JWTs never strand the connection.
      auth: (cb) => {
        getAccessToken().then((token) => cb({ token }));
      },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
    });
    setSocket(s);

    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));
    s.on("notification:new", (n: AppNotification) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast(n.title, {
        description: n.message,
        action: n.link ? { label: "View", onClick: () => router.push(n.link as string) } : undefined,
      });
    });

    return () => {
      s.removeAllListeners();
      s.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [userId, queryClient, router]);

  const value = useMemo(() => ({ socket, connected }), [socket, connected]);
  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export const useSocket = () => useContext(SocketContext);
