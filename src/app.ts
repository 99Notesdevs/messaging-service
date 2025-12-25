import express from "express";
import cors from "cors";
// import messageRoutes from "./modules/messages/message.routes";
import conversationRoutes from "./modules/conversation/conversation.routes";

const app = express();
app.use(
    cors({
      origin: [
        "http://main.main.local:3000",
        "http://tests.main.local:5173",
        "http://shop.main.local:5174",
        "http://auth.main.local:5175",
        "http://localhost:44275",
        "http://13.126.229.93:5174",
        "http://13.126.229.93",
        "http://community.main.local:8080",
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
