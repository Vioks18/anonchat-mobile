import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import AuthLanding from '../screens/auth/AuthLanding';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
  AuthLanding: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ChatList: undefined;
  Chat: { chatId: string; title: string };
  Profile: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="ChatList"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#1a1a2e' },
        cardOverlayEnabled: false,
        gestureEnabled: false,
        animation: 'slide_from_right',
        cardStyleInterpolator: ({ current }) => ({
          cardStyle: {
            backgroundColor: '#1a1a2e',
            transform: [
              {
                translateX: current.progress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [300, 0],
                }),
              },
            ],
          },
        }),
      }}
    >
      <Stack.Screen name="ChatList" component={ChatListScreen} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
};

const AuthStack: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="AuthLanding"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#0b0d10' },
        cardOverlayEnabled: false,
        gestureEnabled: false
      }}
    >
      <Stack.Screen name="AuthLanding" component={AuthLanding} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

const RootNavigator: React.FC = () => {
  const { user, status } = useAuth();

  if (__DEV__) {
    console.log('🧭 Navigation state:', { 
      status, 
      hasUser: !!user, 
      userId: user?.uid,
      username: user?.username 
    });
  }

  if (status === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#86efac" />
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
    backgroundColor: '#0b0d10',
  },
});

export default RootNavigator;
