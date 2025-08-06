export interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: number;
  status: "sending" | "sent" | "delivered" | "read";
  reactions: string[];
  replyTo?: Message;
}

// Default export для Expo Router
export default Message; 