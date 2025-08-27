import http from "http";
import { Server as IOServer, Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import jwt from "jsonwebtoken";

import { saveMessage, listMessagesForConversation, markMessageRead } from "./modules/messages/message.service";

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const JWT_SECRET = process.env.JWT_SECRET || "vansh123";

export async function createSocketServer(expressApp: any) {
  const server = http.createServer(expressApp);
  const io = new IOServer(server, {
    cors: { origin: "*" },
    path: "/socket.io"
  });

  // Redis adapter (pub/sub) for scaling across instances
  const pubClient = new Redis(REDIS_URL);
  const subClient = pubClient.duplicate();
  io.adapter(createAdapter(pubClient, subClient));

  // Simple JWT auth middleware for socket.io
  io.use((socket, next) => {
    const token = (socket.handshake.auth && socket.handshake.auth.token) || socket.handshake.query?.token;
    if (!token) return next(new Error("auth error"));
    try {
      const { id } = jwt.verify(String(token), JWT_SECRET) as { id: number };
      (socket as any).userId = id;
      return next();
    } catch (err) {
      return next(new Error("auth error"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = (socket as any).userId as string;
    console.log(`socket connected: ${socket.id} user:${userId}`);

    // Join a personal room for the user so any instance can emit to them
    const personalRoom = `user:${userId}`;
    socket.join(personalRoom);

    // Client asks for message list for a conversation
    socket.on("LIST_MESSAGES", async (data, ack) => {
      try {
        const { conversationId, limit = 50, cursor } = data || {};
        const messages = await listMessagesForConversation(conversationId, limit, cursor);
        if (ack) ack({ ok: true, messages });
      } catch (err) {
        if (ack) ack({ ok: false, error: String(err) });
      }
    });

    // Send a message: save to DB, emit to recipient's personal room
    socket.on("SEND_MESSAGE", async (data, ack) => {
      try {
        const { conversationId, toUserId, content } = data;
        const senderId = userId;
        const saved = await saveMessage({ conversationId, senderId, receiverId: toUserId, content });

        // emit NEW_MESSAGE to recipient's personal room
        const payload = { type: "NEW_MESSAGE", message: saved };
        io.to(`user:${toUserId}`).emit("NEW_MESSAGE", payload);

        // ack to sender
        if (ack) ack({ ok: true, message: saved });
      } catch (err) {
        if (ack) ack({ ok: false, error: String(err) });
      }
    });

    // Mark read (message-level)
    socket.on("MARK_READ", async (data, ack) => {
      try {
        const { messageId } = data;
        await markMessageRead(messageId, userId);

        // notify sender that their message is read
        const payload = { type: "MESSAGE_READ", messageId, readerId: userId };
        // (notify the sender via their personal room)
        io.to(`user:${(data as any).senderId}`).emit("MESSAGE_READ", payload);

        if (ack) ack({ ok: true });
      } catch (err) {
        if (ack) ack({ ok: false, error: String(err) });
      }
    });

    socket.on("disconnect", (reason) => {
      console.log(`socket disconnect: ${socket.id} user:${userId} reason:${reason}`);
    });
  });

  return { server, io };
}
