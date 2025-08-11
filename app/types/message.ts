export interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: number;
  status: "sending" | "sent" | "delivered" | "read";
  reactions?: string[];
  replyTo?: Message;
  deletedForAll?: boolean;
  deletedFor?: Record<string, true>; // keys are local user IDs
}

// Default export для Expo Router
const MessageComponent = () => null;
export default MessageComponent; 