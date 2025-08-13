import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import ChatScreen from './screens/ChatScreen';

export default function ChatPage() {
  const params = useLocalSearchParams();
  const chatId = params.chatId as string;
  const title = params.title as string;

  return (
    <ChatScreen 
      navigation={{} as any} 
      route={{ 
        params: { 
          chatId: chatId || 'default', 
          title: title || 'AnonChat' 
        } 
      }} 
    />
  );
}
