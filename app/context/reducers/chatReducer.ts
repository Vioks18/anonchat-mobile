import { ChatAction, ChatState } from '../types/chat.types';

// Начальное состояние
export const initialState: ChatState = {
  messages: [
    {
      id: "1",
      text: "Привет! Как дела?",
      sender: "other",
      timestamp: Date.now() - 60000,
      status: "read",
      reactions: [],
    },
    {
      id: "2", 
      text: "Привет! Все хорошо, спасибо! Как у тебя?",
      sender: "me",
      timestamp: Date.now() - 45000,
      status: "read",
      reactions: ["👍"],
    },
  ],
  currentTheme: "dark",
  searchQuery: "",
  isSearching: false,
  showReactions: null,
  selectedMessages: new Set(),
  replyTo: null,
  showDeleteOptions: false,
  showMenu: false,
  showThemeSelector: false,
};

// Reducer для управления состоянием
export const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  try {
    switch (action.type) {
      case 'ADD_MESSAGE':
        return {
          ...state,
          messages: [...state.messages, action.payload],
        };

      case 'UPDATE_MESSAGE_STATUS':
        return {
          ...state,
          messages: state.messages.map(msg =>
            msg.id === action.payload.id
              ? { ...msg, status: action.payload.status }
              : msg
          ),
        };

      case 'ADD_REACTION':
        return {
          ...state,
          messages: state.messages.map(msg =>
            msg.id === action.payload.messageId
              ? {
                  ...msg,
                  reactions: msg.reactions.includes(action.payload.reaction)
                    ? msg.reactions.filter(r => r !== action.payload.reaction)
                    : [...msg.reactions, action.payload.reaction]
                }
              : msg
          ),
        };

      case 'REMOVE_REACTION':
        return {
          ...state,
          messages: state.messages.map(msg =>
            msg.id === action.payload.messageId
              ? {
                  ...msg,
                  reactions: msg.reactions.filter(r => r !== action.payload.reaction)
                }
              : msg
          ),
        };

      case 'SET_SEARCH_QUERY':
        return {
          ...state,
          searchQuery: action.payload,
        };

      case 'SET_IS_SEARCHING':
        return {
          ...state,
          isSearching: action.payload,
        };

      case 'SET_SHOW_REACTIONS':
        return {
          ...state,
          showReactions: action.payload,
        };

      case 'SET_SELECTED_MESSAGES':
        return {
          ...state,
          selectedMessages: action.payload,
        };

      case 'SET_REPLY_TO':
        return {
          ...state,
          replyTo: action.payload,
        };

      case 'SET_SHOW_DELETE_OPTIONS':
        return {
          ...state,
          showDeleteOptions: action.payload,
        };

      case 'SET_SHOW_MENU':
        return {
          ...state,
          showMenu: action.payload,
        };

      case 'SET_SHOW_THEME_SELECTOR':
        return {
          ...state,
          showThemeSelector: action.payload,
        };

      case 'SET_CURRENT_THEME':
        return {
          ...state,
          currentTheme: action.payload,
        };

      case 'DELETE_MESSAGE':
        return {
          ...state,
          messages: state.messages.filter(msg => msg.id !== action.payload),
          selectedMessages: new Set(),
          showDeleteOptions: false,
        };

      case 'RESET_STATE':
        return initialState;

      default:
        return state;
    }
  } catch (error) {
    if (__DEV__) console.error('ChatLogicProvider: Reducer error', error);
    // Возвращаем предыдущее состояние при ошибке
    return state;
  }
};
