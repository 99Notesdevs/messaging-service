import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db";
import app from "./app";
import { createSocketServer } from "./socket";

const PORT = Number(process.env.PORT || 4000);

async function start() {
  await connectDB();
  const { server } = await createSocketServer(app);
  server.listen(PORT, () => {
    console.log(`Messaging service listening on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Startup error:", err);
  process.exit(1);
});
