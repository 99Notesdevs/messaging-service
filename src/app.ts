import express from "express";
import cors from "cors";
// import messageRoutes from "./modules/messages/message.routes";
import conversationRoutes from "./modules/conversation/conversation.routes";

const app = express();
app.use(
    cors({
      origin: [
        "https://99notes.org",
        "http://99notes.org",
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:3004",
        "http://localhost:5173",
        "http://localhost:5174",
      ],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
      allowedHeaders: ["Content-Type", "X-Auth-Type", "x-auth-type"],
      optionsSuccessStatus: 200,
    })
  )

app.use(express.json());
// app.use("/api/messages", messageRoutes);
app.use("/api/conversations", conversationRoutes);

app.get("/healthz", (_req, res) => res.json({ ok: true }));

export default app;
