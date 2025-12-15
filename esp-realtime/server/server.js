const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const os = require("os");

const app = express();
const server = http.createServer(app);

app.use(express.static(__dirname + "/public"));

app.get("/health", (req, res) => res.send("OK"));

const PORT = 3000;

server.listen(PORT, () => {
  console.log(`HTTP server: http://localhost:${PORT}`);

  const ifaces = os.networkInterfaces();
  Object.keys(ifaces).forEach((name) => {
    ifaces[name].forEach((d) => {
      if (d.family === "IPv4" && !d.internal) {
        console.log(`LAN URL: http://${d.address}:${PORT}`);
      }
    });
  });
});

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("WS client connected");

  ws.on("message", (msg) => {
    const text = msg.toString();
    console.log("Received:", text);

    // broadcast cho mọi web client
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(text);
      }
    });
  });

  ws.on("close", () => console.log("WS client disconnected"));
});
