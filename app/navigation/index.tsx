import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { handleInitialEmailLink } from '../auth/emailLink';
import { useAuth } from '../hooks/useAuth';
import { useEmailLinkListener } from '../hooks/useEmailLinkListener';
import AuthEmailLinkScreen from '../screens/AuthEmailLinkScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';

export type RootStackParamList = {
  AuthEmailLink: undefined;
  ChatList: undefined;
  Chat: { chatId: string; title: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="ChatList"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#1a1a2e' }
      }}
    >
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
    </Stack.Navigator>
  );
};

const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="AuthEmailLink"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#1a1a2e' }
      }}
    >
      <Stack.Screen name="AuthEmailLink" component={AuthEmailLinkScreen} />
    </Stack.Navigator>
  );
};

const RootNavigator: React.FC = () => {
  const { user, initializing } = useAuth();

  // Listen for email link sign-in
  useEmailLinkListener(() => {
    // Email link sign-in completed, auth state will update automatically
    if (__DEV__) console.log('🔗 Email link sign-in completed');
  });

  // Handle initial email link on app start
  React.useEffect(() => {
    handleInitialEmailLink().then((result) => {
      if (result.ok && __DEV__) {
        console.log('🔗 Initial email link sign-in completed');
      }
    });
  }, []);

  if (initializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  return (
    <>
      {user ? <AppNavigator /> : <AuthStack />}
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
});

export default RootNavigator;
