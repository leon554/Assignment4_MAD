import { Slot, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';


export default function RootLayout() {
    const [onboarded, setOnboarded] = useState(false)
    const router = useRouter();

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

  return <Slot />;
}