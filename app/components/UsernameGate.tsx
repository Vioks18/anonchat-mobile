import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useAuthUserProfile } from '../hooks/useAuthUserProfile';
import UsernameScreen from '../screens/UsernameScreen';
import ChatListScreen from '../screens/ChatListScreen';

const UsernameGate: React.FC = () => {
  const { user } = useAuth();
  const profile = useAuthUserProfile();

  // Show loading while auth is initializing
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  // Show loading while profile is loading
  if (profile.loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  // If user doesn't have a username, show username screen
  if (!profile.username_lc) {
    return <UsernameScreen />;
  }

  // User has username, show chat list
  return <ChatListScreen navigation={null} />;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
});

export default UsernameGate;
