import { Request, Response } from "express";
import { ConversationService } from "./conversation.service";

export const createConversation = async (req: Request, res: Response) => {
  try {
    const { receiverId } = req.body;

    const conversation = await ConversationService.findOrCreateConversation(req.authUser!, receiverId);

    return res.status(201).json(conversation);
  } catch (err) {
    return res.status(500).json({ error: "Failed to create conversation" });
  }
};

export const getUserConversations = async (req: Request, res: Response) => {
  try {
    const conversations = await ConversationService.getUserConversations(req.authUser!);
    return res.json(conversations);
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch conversations" });
  }
};