import { Router } from "express";
import {
  createConversation,
  getUserConversations,
} from "./conversation.controller";
import { authenticate } from "../../middlewares/authenticateMiddleware";
import { authorizeRoles } from "../../middlewares/authorizeRoles";

const router = Router();

router.post("/", createConversation);
router.get("/", authenticate, authorizeRoles(["User"]), getUserConversations);

export default router;
