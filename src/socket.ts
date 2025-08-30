import http from "http";
import { Server as IOServer, Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import jwt from "jsonwebtoken";

import { saveMessage, listMessagesForConversation, markMessageRead } from "./modules/messages/message.service";
import { ConversationService } from "./modules/conversation/conversation.service";

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
    console.log("socket.handshake.auth", socket.handshake.auth);
    let token =
      (socket.handshake.auth && socket.handshake.auth.token) ||
      socket.handshake.query?.token;
    console.log("socket.handshake.query", socket.handshake.query);
    console.log("socket.handshake.headers", typeof socket.handshake.headers.cookie);
    console.log("token", token);
    // If not provided, try to read from cookies
    if (!token && socket.handshake.headers.cookie) {
      const cookies = socket.handshake.headers.cookie;
      token = cookies.split('=')[1];
    }
    console.log("token", token);
    if (!token) return next(new Error("auth error"));
    try {
      const { id } = jwt.verify(String(token), JWT_SECRET) as { id: string };
      (socket as any).userId = id;
      console.log("socket.handshake.auth", socket.handshake.auth);
      return next();
    } catch (err) {
      console.log("err", err);
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
        const { toUserId, content } = data;
        const senderId = userId;
        const conversation = await ConversationService.findOrCreateConversation(senderId, toUserId);
        const saved = await saveMessage({ conversationId: conversation.id, senderId, receiverId: toUserId, content });

        io.to(`user:${senderId}`).emit("CONVERSATION_UPDATED", { conversationId: conversation.id, lastMessage: saved });
        io.to(`user:${toUserId}`).emit("CONVERSATION_UPDATED", { conversationId: conversation.id, lastMessage: saved });


        // emit NEW_MESSAGE to recipient's personal room
        const payload = { type: "NEW_MESSAGE", message: saved };
        io.to(`user:${toUserId}`).emit("NEW_MESSAGE", payload);

        // ack to sender
        if (ack) ack({ ok: true, message: saved });
      } catch (err) {
        if (ack)
          ack({
            ok: false,
            error: err instanceof Error ? err.message : String(err),
          });
      }
    });

    // Mark read (message-level)
    socket.on("MARK_READ", async (data, ack) => {
      try {
        const { messageId } = data;
        const msg = await markMessageRead(messageId, userId);

        // (notify the sender via their personal room)
        io.to(`user:${msg.senderId}`).emit("MESSAGE_READ", {
          type: "MESSAGE_READ",
          messageId,
          readerId: userId,
        });

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
