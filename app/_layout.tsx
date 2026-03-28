import useColorPalette from '@/hooks/useColorPalette';
import { Slot, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

export default function RootLayout() {
    const [onboarded, setOnboarded] = useState(false)
    const router = useRouter();
    const colors = useColorPalette()

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!onboarded) {
                router.replace('/(onboarding)/signup');
            } else {
                router.replace('/(tabs)');
            }
        }, 0);

        return () => clearTimeout(timer);
    }, [onboarded]);

  return(
    <View style={{ backgroundColor: colors.background, flex: 1}}>
        <Slot />
    </View>
  )
}