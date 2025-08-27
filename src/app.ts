import express from "express";
import cors from "cors";
import messageRoutes from "./modules/messages/message.routes";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/messages", messageRoutes);

app.get("/healthz", (_req, res) => res.json({ ok: true }));

export default app;
