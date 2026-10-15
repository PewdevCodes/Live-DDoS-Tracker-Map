
import { WebSocket, WebSocketServer } from "ws";
import type { ServerOptions } from "ws";
import type { SimulatedAttackEvent } from "../generator/event.js";

const RECENT_EVENT_LIMIT = 100;

export function createWsServer(port = 8080) {
  const options: ServerOptions = {
    port,
  };

  const wss = new WebSocketServer(options);
  const recentEvents: SimulatedAttackEvent[] = [];

  wss.on("listening", () => {
    console.log(`WebSocket server listening on ws://localhost:${port}`);
  });

  wss.on("connection", (socket) => {
    console.log("Client connected.");

    socket.send(
      JSON.stringify({
        type: "welcome",
        message: "DdosAttackmap simulated event stream",
        recentEvents,
      })
    );

    socket.on("error", (error) => {
      console.error("WebSocket client error:", error.message);
    });

    socket.on("close", () => {
      console.log("Client disconnected.");
    });
  });

  function broadcast(event: SimulatedAttackEvent) {
    recentEvents.push(event);

    if (recentEvents.length > RECENT_EVENT_LIMIT) {
      recentEvents.shift();
    }

    const message = JSON.stringify({
      type: "attack-event",
      data: event,
    });

    for (const client of wss.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }

  function close() {
    return new Promise<void>((resolve, reject) => {
      wss.close((error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

  return { wss, broadcast, close };
}
