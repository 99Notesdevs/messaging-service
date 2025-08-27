import { Router } from "express";
import { sendMessage, getMessages } from "./message.controller";

const router = Router();

router.post("/", sendMessage);
router.get("/:conversationId", getMessages);

export default router;
