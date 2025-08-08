import React from 'react';
import { Host } from 'react-native-portalize';
import ChatCore from './ChatCore';

interface ChatCoreWithReactionsProps {
  onSendMessage?: (text: string) => void;
  onError?: (error: Error) => void;
  isBotEnabled?: boolean;
  onToggleBot?: () => void;
}

const ChatCoreWithReactions: React.FC<ChatCoreWithReactionsProps> = (props) => {
  return (
    <Host>
      <ChatCore {...props} />
    </Host>
  );
};

export default ChatCoreWithReactions;
