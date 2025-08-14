import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useAuthUserProfile } from '../hooks/useAuthUserProfile';
import ChatListScreen from '../screens/ChatListScreen';
import UsernameScreen from '../screens/UsernameScreen';

const UsernameGate: React.FC = () => {
  const { user } = useAuth();
  const profile = useAuthUserProfile();

  // Debug info
  if (__DEV__) {
    console.log('UsernameGate Debug:', {
      hasUser: !!user,
      userUid: user?.uid,
      profileLoading: profile.loading,
      profileUsername: profile.username_lc,
      authLoading: false // We'll add this from useAuth
    });
  }

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
  return <ChatListScreen />;
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
