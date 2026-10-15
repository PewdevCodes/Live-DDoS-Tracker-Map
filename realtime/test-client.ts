
import WebSocket from "ws";

const socket = new WebSocket("ws://localhost:8080");

socket.on("open", () => {
  console.log("Connected to DdosAttackmap.");
});

socket.on("message", (raw) => {
  const message = JSON.parse(raw.toString());

  console.log("Received:", JSON.stringify(message, null, 2));
});

socket.on("error", (error) => {
  console.error("Connection error:", error.message);
});

socket.on("close", () => {
  console.log("Connection closed.");
});
