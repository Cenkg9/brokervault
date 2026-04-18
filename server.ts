import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import cron from "node-cron";
import { PrismaClient } from "@prisma/client";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();
const prisma = new PrismaClient();

async function publishPendingListings() {
  const result = await prisma.listing.updateMany({
    where: { status: "PENDING", publishAt: { lte: new Date() } },
    data: { status: "ACTIVE", publishedAt: new Date() },
  });
  if (result.count > 0) console.log(`[cron] Published ${result.count} listing(s)`);
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new SocketIOServer(httpServer, {
    cors: { origin: process.env.NEXTAUTH_URL || "http://localhost:3000", methods: ["GET", "POST"] },
  });

  // Make io available to API routes
  (global as any).io = io;

  io.on("connection", (socket) => {
    socket.on("join-conversation", (id: string) => socket.join(`conv:${id}`));
    socket.on("leave-conversation", (id: string) => socket.leave(`conv:${id}`));
    socket.on("join-user", (id: string) => socket.join(`user:${id}`));
  });

  // Publish pending listings every 5 minutes
  cron.schedule("*/5 * * * *", () => publishPendingListings().catch(console.error));
  publishPendingListings().catch(console.error); // run once on startup

  httpServer.listen(port, () => {
    console.log(`> BrokerVault ready on http://${hostname}:${port}`);
  });
});
