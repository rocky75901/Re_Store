import { io } from "socket.io-client";

const SOCKET_URL = "http://localhost:5000"; // Change to backend URL if deployed

const socket = io(SOCKET_URL, {
  reconnectionAttempts: 5, // Retry if connection fails
  transports: ["websocket"],
});

export default socket;
