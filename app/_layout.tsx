import { useFonts } from "expo-font";
import { Stack } from 'expo-router';
import AppCheckProvider from './providers/AppCheckProvider';

export default function Layout() {
  const [fontsLoaded] = useFonts({
    "SpaceMono": require("../assets/fonts/SpaceMono-Regular.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppCheckProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      />
    </AppCheckProvider>
  );
}
