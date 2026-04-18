"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(typeof window !== "undefined" ? window.location.origin : "", {
      path: "/socket.io",
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(userId: string): Socket {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
    s.once("connect", () => s.emit("join-user", userId));
  }
  return s;
}

export function disconnectSocket() {
  socket?.disconnect();
}
