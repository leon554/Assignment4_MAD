import { UserProvider } from '@/context/UserContext';
import useColorPalette from '@/hooks/useColorPalette';
import { Slot } from 'expo-router';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
    const colors = useColorPalette()

  return(
        <GestureHandlerRootView style={{flex: 1}}>
            <UserProvider>
                <View style={{ backgroundColor: colors.background, flex: 1}}>
                    <Slot />
                </View>
            </UserProvider>
        </GestureHandlerRootView>
  )
}