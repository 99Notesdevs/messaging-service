import { Request, Response } from "express";
import * as messageService from "./message.service";

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { conversationId, senderId, receiverId, content } = req.body;
    const message = await messageService.sendMessage({
      conversationId,
      senderId,
      receiverId,
      content,
    });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;
    const messages = await messageService.getConversationMessages(
      conversationId!
    );
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};
