// Типы для логики чата
export interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: number;
  status: "sending" | "sent" | "delivered" | "read";
  reactions: string[];
  replyTo?: Message;
}

export interface ChatState {
  messages: Message[];
  currentTheme: string;
  searchQuery: string;
  isSearching: boolean;
  showReactions: string | null;
  selectedMessages: Set<string>;
  replyTo: Message | null;
  showDeleteOptions: boolean;
  showMenu: boolean;
  showThemeSelector: boolean;
}

// Типы действий
export type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE_STATUS'; payload: { id: string; status: Message['status'] } }
  | { type: 'ADD_REACTION'; payload: { messageId: string; reaction: string } }
  | { type: 'REMOVE_REACTION'; payload: { messageId: string; reaction: string } }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_IS_SEARCHING'; payload: boolean }
  | { type: 'SET_SHOW_REACTIONS'; payload: string | null }
  | { type: 'SET_SELECTED_MESSAGES'; payload: Set<string> }
  | { type: 'SET_REPLY_TO'; payload: Message | null }
  | { type: 'SET_SHOW_DELETE_OPTIONS'; payload: boolean }
  | { type: 'SET_SHOW_MENU'; payload: boolean }
  | { type: 'SET_SHOW_THEME_SELECTOR'; payload: boolean }
  | { type: 'SET_CURRENT_THEME'; payload: string }
  | { type: 'DELETE_MESSAGE'; payload: string }
  | { type: 'RESET_STATE' };
