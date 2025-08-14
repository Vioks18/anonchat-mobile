import { ToastProvider } from '@/app/components/ui/Toast';
import React from 'react';
import 'react-native-gesture-handler';
import RootNavigator from './navigation';

export default function HomePage() {
  return (
    <ToastProvider>
      <RootNavigator />
    </ToastProvider>
  );
} 