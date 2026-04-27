import { ActivityAttemptProvider } from '@/context/ActivityAttemptContext';
import { UserProvider } from '@/context/UserContext';
import useColorPalette from '@/hooks/useColorPalette';
import { Slot } from 'expo-router';
import { View } from 'react-native';

export default function RootLayout() {
    const colors = useColorPalette()

  return(
    <ActivityAttemptProvider>
      <UserProvider>
          <View style={{ backgroundColor: colors.background, flex: 1}}>
              <Slot />
          </View>
      </UserProvider>
    </ActivityAttemptProvider>
  )
}