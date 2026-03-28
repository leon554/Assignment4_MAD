import useColorPalette from '@/hooks/useColorPalette';
import { Colors } from '@/theme/theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function login() {
    const router = useRouter();
    const colors = useColorPalette()
    const styles = getStyles(colors)

    return (
        <View style={styles.View}>
            <Text style={styles.Text}>Login Page</Text>
            <Button 
                title="Go to team formation" 
                onPress={() => router.push('/teamformation')} 
            />
        </View>
    )
}
const getStyles = (colors: Colors) => StyleSheet.create({
    View: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background
    },
    Text: {
        color: colors.textOnPrimary,
        padding: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        backgroundColor: colors.primary,
        fontSize: 20
    }
})