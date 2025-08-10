export interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: number;
  status: "sending" | "sent" | "delivered" | "read";
  reactions?: string[];
  replyTo?: Message;
  // Deletion fields
  deletedFor?: string[];         // userIds that hid this message (local-only effect)
  deletedForAll?: boolean;       // global tombstone (as if server-broadcasted)
  deletedAt?: number;            // timestamp of deleteForAll
}

// Default export для Expo Router
const MessageComponent = () => null;
export default MessageComponent; 