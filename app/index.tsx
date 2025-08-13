import React from 'react';
import { ToastProvider } from '@/app/components/ui/Toast';
import RootNavigator from './navigation';

export default function HomePage() {
  return (
    <ToastProvider>
      <RootNavigator />
    </ToastProvider>
  );
} 