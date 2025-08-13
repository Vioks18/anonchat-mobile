import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RegisterScreen from '../screens/auth/RegisterScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

export type AuthStackParamList = {
  Register: undefined;
  Login: undefined;
  ForgotPassword: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#1a1a2e' }
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
