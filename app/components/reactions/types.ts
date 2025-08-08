
export type EmojiType = '👍' | '❤️' | '😂' | '😮' | '😢' | '😡';

export interface Reaction {
  emoji: EmojiType;
  count: number;
  reactedByMe: boolean;
}

export interface ReactionSummary {
  emoji: EmojiType;
  count: number;
  reactedByMe: boolean;
}

export interface ReactionBarPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ReactionBarProps {
  onReactionSelect: (emoji: EmojiType) => void;
  onClose: () => void;
}

export interface MessageReactionsProps {
  messageId: string;
  reactions: ReactionSummary[];
  onReactionToggle: (emoji: EmojiType) => void;
  themedStyles: any;
  isMyMessage?: boolean;
}
