import { Router } from "express";
import {
  createConversation,
  getUserConversations,
} from "./conversation.controller";

const router = Router();

router.post("/", createConversation);
router.get("/", getUserConversations);

export default router;
