import mongoose, { Schema, Document } from "mongoose";

export interface IConversation extends Document {
  participants: string[];
  lastMessage?: {
    messageId: string;
    timestamp: Date;
  };    
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    participants: { type: [String], required: true }, // user ids
    lastMessage: { type: Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

ConversationSchema.index({ participants: 1 }, { unique: true });

export const Conversation = mongoose.model<IConversation>(
  "Conversation",
  ConversationSchema
);
